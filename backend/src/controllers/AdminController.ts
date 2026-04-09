import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { getPaginationOptions, formatPaginationResponse } from "../lib/pagination";

import { AuditService } from "../services/AuditService";
import { AuditAction, Role } from "@prisma/client";

export class AdminController {
  static async listAllStaff(req: AuthRequest, res: Response) {
    try {
      const staff = await prisma.user.findMany({
        where: { role: "STAFF" },
        select: { id: true, name: true, email: true }
      });
      res.json(staff);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createUser(req: AuthRequest, res: Response) {
    const { 
      name, email, password, role, contactNo, aadharNo, pan, 
      address, photo, gender, dob, initialGoldAdvanceAmount,
      referredBy, staffId 
    } = req.body;

    try {
      // Validation: Mobile (10 digits)
      if (contactNo && !/^\d{10}$/.test(contactNo)) {
        return res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
      }
      // Validation: Aadhar (12 digits)
      if (aadharNo && !/^\d{12}$/.test(aadharNo)) {
        return res.status(400).json({ error: "Aadhar number must be exactly 12 digits" });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { contactNo }] }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: existingUser.email === email ? "Email already in use" : "Contact number already in use" 
        });
      }

      const hashedPassword = await (require("bcryptjs")).hash(password || "password123", 10);

      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: role as any,
            contactNo,
            mobile: contactNo,
            aadharNo,
            pan: pan ? pan.toUpperCase() : null,
            address,
            photo,
            gender,
            dob: dob ? new Date(dob) : null,
            initialGoldAdvanceAmount: initialGoldAdvanceAmount ? Number(initialGoldAdvanceAmount) : 0,
            referredBy: referredBy === "" ? null : referredBy,
            staffId: staffId === "" ? null : staffId,
            wallet: {
              create: {
                goldAdvanceAmount: 0,
                profitAmount: 0,
                referralAmount: 0,
                totalWithdrawable: 0
              }
            }
          }
        });

        // If there's an initial amount, credit it immediately
        const initialAmt = initialGoldAdvanceAmount ? Number(initialGoldAdvanceAmount) : 0;
        if (initialAmt > 0) {
          // 1. Create GoldAdvance Record
          const goldAdvance = await tx.goldAdvance.create({
            data: {
              userId: newUser.id,
              advanceAmount: initialAmt,
              status: "ACTIVE",
              description: "Initial Deposit (Auto-recorded)",
              createdAt: newUser.createdAt,
              startDate: newUser.createdAt
            }
          });

          // 2. Update Wallet
          await tx.wallet.update({
            where: { userId: newUser.id },
            data: { goldAdvanceAmount: { increment: initialAmt } }
          });

          // 3. Create Transaction Record
          const paddedNo = `RGT-${String(goldAdvance.invoiceNo).padStart(6, '0')}`;
          await tx.transaction.create({
            data: {
              userId: newUser.id,
              entityId: goldAdvance.id,
              performedById: req.user?.id,
              type: "DEPOSIT",
              amount: initialAmt,
              description: `Initial Deposit recorded. Ref: #${paddedNo}`,
              balanceAfter: 0, // Deposit to Advance doesn't affect withdrawable balance
              createdAt: newUser.createdAt
            }
          });

          // 4. Log Audit for Deposit
          await tx.auditLog.create({
            data: {
              actionType: "GOLD_ADVANCE_DEPOSITED",
              entityType: "GoldAdvance",
              entityId: goldAdvance.id,
              performedByUserId: req.user?.id,
              performedByRole: req.user?.role,
              newData: goldAdvance as any,
              description: `Initial gold advance of ${initialAmt} auto-recorded for user ${newUser.id}`,
              createdAt: newUser.createdAt
            }
          });
        }

        return newUser;
      });

      // Log Audit for User Creation
      await AuditService.logAction({
        actionType: AuditAction.CUSTOMER_CREATED,
        entityType: "User",
        entityId: user.id,
        performedByUserId: req.user?.id,
        performedByRole: req.user?.role,
        newData: { id: user.id, email: user.email, role: user.role },
        description: `User ${user.id} created by ${req.user?.role} ${req.user?.id}`,
        ipAddress: req.ip
      });

      res.status(201).json({ message: "User created successfully", user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const { skip, take, page, limit } = getPaginationOptions(req);
      const role = (req.query.role as string) || "ALL";
      const search = (req.query.search as string) || "";
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) || "desc";

      const where: any = {};
      if (role !== "ALL") {
        where.role = role as any;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { mobile: { contains: search } },
          { contactNo: { contains: search } },
          { aadharNo: { contains: search } },
          { pan: { contains: search } },
          { id: { contains: search } }
        ];
      }

      const orderBy: any = {};
      if (sortBy === "goldAdvancesSum") {
        orderBy.wallet = { goldAdvanceAmount: sortOrder };
      } else {
        orderBy[sortBy] = sortOrder;
      }
      
      const [users, total] = await Promise.all([
        (prisma.user as any).findMany({
          skip,
          take,
          where,
          select: {
            id: true, name: true, email: true, contactNo: true, mobile: true,
            aadharNo: true, pan: true, address: true, photo: true, gender: true, dob: true,
            referredBy: true, staffId: true, createdAt: true,
            role: true,
            wallet: true,
            goldAdvances: {
              where: { status: "ACTIVE" },
              select: { advanceAmount: true }
            },
            referrer: { select: { id: true, name: true, email: true } },
            assignedStaff: { select: { id: true, name: true, email: true } },
            customers: { select: { id: true } }
          },
          orderBy,
        }),
        prisma.user.count({ where })
      ]);

      const mappedUsers = await Promise.all((users as any[]).map(async (user: any) => {
        const [goldAdvanceAgg, withdrawalAgg, profitAgg, referralAgg] = await Promise.all([
          prisma.goldAdvance.aggregate({
            where: { userId: user.id },
            _sum: { advanceAmount: true }
          }),
          prisma.withdrawalRequest.aggregate({
            where: { userId: user.id, status: "APPROVED" },
            _sum: { amount: true }
          }),
          prisma.transaction.aggregate({
            where: { userId: user.id, type: "PROFIT" },
            _sum: { amount: true }
          }),
          prisma.transaction.aggregate({
            where: { userId: user.id, type: "REFERRAL" },
            _sum: { amount: true }
          })
        ]);

        return {
          ...user,
          wallet: user.wallet ? {
            goldAdvanceAmount: Number(user.wallet.goldAdvanceAmount || 0),
            profitAmount: Number(user.wallet.profitAmount || 0),
            referralAmount: Number(user.wallet.referralAmount || 0),
            totalWithdrawable: Number(user.wallet.totalWithdrawable || 0),
          } : null,
          totalGoldAdvanceAmount: Number(goldAdvanceAgg._sum.advanceAmount || 0),
          totalLifetimeWithdrawal: Number(withdrawalAgg._sum.amount || 0),
          totalLifetimeProfit: Number(profitAgg._sum.amount || 0),
          totalLifetimeReferralProfit: Number(referralAgg._sum.amount || 0)
        };
      }));

      res.json(formatPaginationResponse(mappedUsers, total, page, limit));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async reassignStaff(req: AuthRequest, res: Response) {
    const { userId, staffId } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      const user = await prisma.user.update({
        where: { id: userId },
        data: { staffId },
        include: { assignedStaff: true }
      });

      // Log Audit
      await AuditService.logAction({
        actionType: AuditAction.STAFF_REASSIGNED,
        entityType: "User",
        entityId: userId,
        previousData: { staffId: existingUser?.staffId },
        newData: { staffId },
        performedByUserId: req.user?.id,
        performedByRole: req.user?.role,
        description: `Customer ${userId} reassigned to Staff ${staffId}`,
        ipAddress: req.ip
      });

      res.json({ message: "Staff reassigned successfully", user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllTransactions(req: AuthRequest, res: Response) {
    try {
      const { skip, take, page, limit } = getPaginationOptions(req);
      const search = (req.query.search as string) || "";
      const type = (req.query.type as string) || "";
      const coinIncentiveOnly = (req.query.coinIncentiveOnly as string) === "true";
      const createdFrom = (req.query.createdFrom as string) || "";
      const createdTo = (req.query.createdTo as string) || "";
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) || "desc";

      const where: any = {};
      if (type) {
        where.type = type;
      }
      if (coinIncentiveOnly) {
        where.type = "STAFF_COMMISSION";
        where.description = { contains: "incentive for customer order" };
      }
      if (createdFrom || createdTo) {
        where.createdAt = {};
        if (createdFrom) {
          const start = new Date(createdFrom);
          start.setHours(0, 0, 0, 0);
          where.createdAt.gte = start;
        }
        if (createdTo) {
          const end = new Date(createdTo);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }
      if (search) {
        where.OR = [
          { description: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
          { id: { contains: search } }
        ];
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          skip,
          take,
          where,
          include: { 
            user: { 
              select: { 
                name: true, 
                email: true,
                assignedStaff: { select: { name: true } }
              } 
            },
            performedBy: { select: { name: true } }
          },
          orderBy,
        }),
        prisma.transaction.count({ where })
      ]);

      const mappedTransactions = transactions.map((tx: any) => {
        let processedBy = tx.performedBy?.name;
        if (!processedBy) {
          if (tx.type === "DEPOSIT" || tx.type === "WITHDRAWAL" || tx.type === "GOLD_ADVANCE") {
            processedBy = tx.user?.assignedStaff?.name || "ADMIN";
          } else {
            processedBy = "SYSTEM";
          }
        }
        return { ...tx, processedBy };
      });

      res.json(formatPaginationResponse(mappedTransactions, total, page, limit));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserTransactions(req: AuthRequest, res: Response) {
    const { userId } = req.params;
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        include: { 
          performedBy: { select: { name: true } },
          user: { select: { assignedStaff: { select: { name: true } } } }
        },
        orderBy: { createdAt: "desc" },
      });

      const mappedTransactions = transactions.map((tx: any) => {
        let processedBy = tx.performedBy?.name;
        if (!processedBy) {
          if (tx.type === "DEPOSIT" || tx.type === "WITHDRAWAL" || tx.type === "GOLD_ADVANCE") {
            processedBy = tx.user?.assignedStaff?.name || "ADMIN";
          } else {
            processedBy = "SYSTEM";
          }
        }
        return { ...tx, processedBy };
      });

      res.json(mappedTransactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const customersCount = await prisma.user.count({ where: { role: "CUSTOMER" } });
      const staffCount = await prisma.user.count({ where: { role: "STAFF" } });
      const pendingWithdrawalsCount = await prisma.withdrawalRequest.count({ where: { status: "PENDING" } });
      const totalPendingWithdrawalAmount = await (prisma.withdrawalRequest as any).aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true }
      });

      const walletSums: any = await (prisma.wallet as any).aggregate({
        _sum: {
          goldAdvanceAmount: true,
          profitAmount: true,
          referralAmount: true,
          totalWithdrawable: true
        }
      });

      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));
      
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const [
        todayGoldAdvanceAgg,
        todayWithdrawalsAgg,
        monthlyGoldAdvanceAgg,
        monthlyWithdrawalsAgg,
        totalApprovedWithdrawals,
        totalCoinIncentiveAgg,
        todayCoinIncentiveAgg,
        potentialReferrers,
        staffMembers,
        potentialTopCustomers
      ] = await Promise.all([
        prisma.goldAdvance.aggregate({
          where: { createdAt: { gte: startOfToday, lte: endOfToday } },
          _sum: { advanceAmount: true }
        }),
        prisma.withdrawalRequest.aggregate({
          where: { 
            status: "APPROVED",
            updatedAt: { gte: startOfToday, lte: endOfToday }
          },
          _sum: { amount: true }
        }),
        prisma.goldAdvance.aggregate({
          where: { createdAt: { gte: startOfMonth } },
          _sum: { advanceAmount: true }
        }),
        prisma.withdrawalRequest.aggregate({
          where: { 
            status: "APPROVED",
            updatedAt: { gte: startOfMonth }
          },
          _sum: { amount: true }
        }),
        prisma.withdrawalRequest.aggregate({
          where: { status: "APPROVED" },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            type: "STAFF_COMMISSION",
            description: { contains: "incentive for customer order" },
          },
          _sum: { amount: true },
          _count: { _all: true },
        }),
        prisma.transaction.aggregate({
          where: {
            type: "STAFF_COMMISSION",
            description: { contains: "incentive for customer order" },
            createdAt: { gte: startOfToday, lte: endOfToday },
          },
          _sum: { amount: true },
          _count: { _all: true },
        }),
        prisma.user.findMany({
          where: { role: "CUSTOMER", referrals: { some: {} } },
          select: {
            id: true, name: true, email: true,
            referrals: {
              select: { wallet: { select: { goldAdvanceAmount: true } } }
            }
          }
        }),
        prisma.user.findMany({
          where: { role: "STAFF" },
          select: {
            id: true, name: true, email: true,
            customers: {
              select: { wallet: { select: { goldAdvanceAmount: true } } }
            }
          }
        }),
        prisma.user.findMany({
          where: { role: "CUSTOMER" },
          select: {
            id: true, name: true, email: true,
            wallet: { select: { goldAdvanceAmount: true } }
          },
          orderBy: { wallet: { goldAdvanceAmount: "desc" } },
          take: 5
        })
      ]);

      const topCustomers = potentialTopCustomers.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        goldAdvance: Number(c.wallet?.goldAdvanceAmount || 0)
      }));

      const topReferrers = potentialReferrers.map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        refereeCount: r.referrals.length,
        totalNetworkAUM: r.referrals.reduce((sum: number, c: any) => sum + Number(c.wallet?.goldAdvanceAmount || 0), 0)
      })).sort((a, b) => b.totalNetworkAUM - a.totalNetworkAUM).slice(0, 5);

      const staffPerformance = staffMembers.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        managedCustomers: s.customers.length,
        managedAUM: s.customers.reduce((sum: number, c: any) => sum + Number(c.wallet?.goldAdvanceAmount || 0), 0)
      })).sort((a, b) => b.managedAUM - a.managedAUM);

      // ── Physical Gold Leaderboards ──
      // Top Buyers by total order amount (PAID/READY/DELIVERED orders)
      const orderCustomers = await prisma.order.groupBy({
        by: ["userId"],
        where: { status: { in: ["PAID", "READY", "DELIVERED"] } },
        _sum: { total: true },
        _count: { _all: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      });
      const buyerUserIds = orderCustomers.map((o: any) => o.userId);
      const buyerUsers = buyerUserIds.length > 0
        ? await prisma.user.findMany({ where: { id: { in: buyerUserIds } }, select: { id: true, name: true, email: true } })
        : [];
      const buyerMap = Object.fromEntries(buyerUsers.map((u: any) => [u.id, u]));
      const topBuyers = orderCustomers.map((o: any) => ({
        id: o.userId,
        name: buyerMap[o.userId]?.name || "Unknown",
        email: buyerMap[o.userId]?.email || "",
        totalSpent: Number(o._sum.total || 0),
        orderCount: o._count._all,
      }));

      // Top Referrers by referred customers' orders
      const physicalReferrers = await prisma.user.findMany({
        where: { role: "CUSTOMER", referrals: { some: { orders: { some: { status: { in: ["PAID", "READY", "DELIVERED"] } } } } } },
        select: {
          id: true, name: true, email: true,
          referrals: {
            select: {
              orders: {
                where: { status: { in: ["PAID", "READY", "DELIVERED"] } },
                select: { total: true }
              }
            }
          }
        }
      });
      const topPhysicalReferrers = physicalReferrers.map((r: any) => {
        const allOrders = r.referrals.flatMap((c: any) => c.orders);
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          refereeCount: r.referrals.length,
          totalOrderValue: allOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),
        };
      }).sort((a, b) => b.totalOrderValue - a.totalOrderValue).slice(0, 5);

      // Staff by orders processed (through their managed customers)
      const staffWithOrders = await prisma.user.findMany({
        where: { role: "STAFF" },
        select: {
          id: true, name: true, email: true,
          customers: {
            select: {
              orders: {
                where: { status: { in: ["PAID", "READY", "DELIVERED"] } },
                select: { total: true }
              }
            }
          }
        }
      });
      const staffOrderPerformance = staffWithOrders.map((s: any) => {
        const allOrders = s.customers.flatMap((c: any) => c.orders);
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          ordersProcessed: allOrders.length,
          totalOrderValue: allOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),
          managedCustomers: s.customers.length,
        };
      }).sort((a, b) => b.totalOrderValue - a.totalOrderValue);

      // AUM Trend Calculation (Last 6 Months)
      const aumTrend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        const aumAtPoint = await prisma.goldAdvance.aggregate({
          where: { createdAt: { lte: endOfMonth }, status: "ACTIVE" },
          _sum: { advanceAmount: true }
        });

        aumTrend.push({
          name: monthName,
          aum: Number(aumAtPoint._sum.advanceAmount || 0)
        });
      }

      const totalGoldAdvance = Number(walletSums._sum.goldAdvanceAmount || 0);
      const monthlyDeposits = Number(monthlyGoldAdvanceAgg._sum.advanceAmount || 0);
      const monthlyGrowth = totalGoldAdvance > 0 ? (monthlyDeposits / totalGoldAdvance) * 100 : 0;

      res.json({
        totalGoldAdvance,
        totalProfitDistributed: Number(walletSums._sum.profitAmount || 0),
        totalWithdrawals: Number(totalApprovedWithdrawals._sum.amount || 0),
        todayGoldAdvance: Number(todayGoldAdvanceAgg._sum.advanceAmount || 0),
        todayWithdrawals: Number(todayWithdrawalsAgg._sum.amount || 0),
        monthlyNetFlow: monthlyDeposits - Number(monthlyWithdrawalsAgg._sum.amount || 0),
        monthlyGrowth: Number(monthlyGrowth.toFixed(2)),
        coinOrderIncentiveTotal: Number(totalCoinIncentiveAgg._sum.amount || 0),
        coinOrderIncentiveCount: Number(totalCoinIncentiveAgg._count._all || 0),
        coinOrderIncentiveToday: Number(todayCoinIncentiveAgg._sum.amount || 0),
        coinOrderIncentiveTodayCount: Number(todayCoinIncentiveAgg._count._all || 0),
        customersCount,
        staffCount,
        pendingWithdrawalsCount,
        totalPendingAmount: Number(totalPendingWithdrawalAmount._sum.amount || 0),
        topReferrers,
        topCustomers,
        staffPerformance,
        aumTrend,
        // Physical Gold leaderboards
        topBuyers,
        topPhysicalReferrers,
        staffOrderPerformance,
        walletStats: {
          totalReferrals: Number(walletSums._sum.referralAmount || 0),
          totalWithdrawable: Number(walletSums._sum.totalWithdrawable || 0)
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    const { userId } = req.params;
    const { name, email, password, contactNo, aadharNo, pan, role, staffId, referredBy, address, photo, gender, dob } = req.body;

    try {
      // Validation: Mobile (10 digits)
      if (contactNo && !/^\d{10}$/.test(contactNo)) {
        return res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
      }
      // Validation: Aadhar (12 digits)
      if (aadharNo && !/^\d{12}$/.test(aadharNo)) {
        return res.status(400).json({ error: "Aadhar number must be exactly 12 digits" });
      }

      const existingUser = await prisma.user.findUnique({ where: { id: userId } });

      const updateData: any = {
        where: { id: userId },
        data: {
          name, 
          email, 
          contactNo: contactNo || null,
          mobile: contactNo || null, // Legacy
          aadharNo: aadharNo || null,
          aadhar: aadharNo || null, // Legacy
          pan: pan ? pan.toUpperCase() : null,
          role: role as any,
          staffId: staffId === "" ? null : staffId,
          referredBy: referredBy === "" ? null : referredBy,
          address: address || null,
          photo: photo || null,
          gender: gender || null,
          dob: dob ? new Date(dob) : null
        }
      };

      if (password) {
        const hashedPassword = await (require("bcryptjs")).hash(password, 10);
        updateData.data.password = hashedPassword;
      }

      const user: any = await (prisma.user as any).update(updateData);

      // Log Audit
      await AuditService.logAction({
        actionType: AuditAction.CUSTOMER_UPDATED,
        entityType: "User",
        entityId: userId,
        performedByUserId: req.user?.id,
        performedByRole: req.user?.role,
        previousData: existingUser,
        newData: user,
        description: `User ${userId} updated by Admin ${req.user?.id}`,
        ipAddress: req.ip
      });

      res.json({ message: "User updated successfully", user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    const { userId } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          goldAdvances: { where: { status: "ACTIVE" } },
          withdrawals: { where: { status: "PENDING" } }
        }
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
         // Safety check for deleting admins
         if (req.user?.role !== Role.SUPERADMIN) {
           return res.status(403).json({ error: "Only Super Admin can delete administrative users" });
         }
      }

      if (user.goldAdvances.length > 0) {
        return res.status(400).json({ error: "Cannot delete user with active gold advances" });
      }

      if (user.withdrawals.length > 0) {
        return res.status(400).json({ error: "Cannot delete user with pending withdrawals" });
      }

      // Perform deletion (Prisma will handle relations if set to cascade, 
      // but we should be careful. CustomerService might need to be used if complex logic exists)
      
      // For now, we'll hard delete the user and their wallet
      await prisma.$transaction([
        prisma.wallet.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } })
      ]);

      // Log Audit
      await AuditService.logAction({
        actionType: AuditAction.WALLET_ADJUSTED, // No DIRECT delete action in enum, using closest
        entityType: "User",
        entityId: userId,
        previousData: user,
        performedByUserId: req.user?.id,
        performedByRole: req.user?.role,
        description: `User ${userId} deleted by Super Admin ${req.user?.id}`,
        ipAddress: req.ip
      });

      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
