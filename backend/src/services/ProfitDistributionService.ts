import { prisma } from "../lib/prisma";
import { TransactionType, GoldAdvanceStatus, AuditAction, Prisma } from "@prisma/client";
import { WalletService } from "./WalletService";
import { AuditService } from "./AuditService";
import { DateTime } from "luxon";

export class ProfitDistributionService {
  /**
   * Distribute daily returns for all active gold advances, aggregated by user.
   * Optimized for scale with batch queries and concurrency.
   * @param cutoffDate The date/time up to which profit should be calculated (exclusive).
   * @param businessDate The date string for which the profit is being distributed (e.g., "2026-03-22").
   */
  static async distributeDailyReturns(cutoffDate: Date, businessDate: string) {
    const startTime = Date.now();
    
    // We process up to the cutoff (end of yesterday IST)
    const startOfToday = DateTime.fromJSDate(cutoffDate).setZone("Asia/Kolkata").startOf("day");
    const endOfToday = startOfToday.endOf("day");

    console.log(`⏰ [Cron] Starting distribution for Business Date: ${businessDate} (Cutoff: ${cutoffDate.toISOString()})...`);

    // 1. "Till Yesterday" Filter: Fetch only active advances created BEFORE today
    const activeAdvances = await prisma.goldAdvance.findMany({
      where: {
        status: GoldAdvanceStatus.ACTIVE,
        createdAt: { lt: cutoffDate }
      },
      include: {
        user: {
          select: {
            id: true,
            referredBy: true,
            staffId: true,
            name: true,
          }
        }
      }
    });

    if (activeAdvances.length === 0) {
      console.log("ℹ️ [Cron] No eligible gold advances found (created before today).");
      return { processedUsers: 0, processedAdvances: 0 };
    }

    // 2. Batch Idempotency Check: Fetch all users who already got profit TODAY
    const processedUserIds = await prisma.transaction.findMany({
      where: {
        type: TransactionType.PROFIT,
        createdAt: { 
          gte: startOfToday.toJSDate(), 
          lte: endOfToday.toJSDate() 
        }
      },
      select: { userId: true }
    }).then(txs => new Set((txs as any[]).map(t => t.userId)));

    // 3. Group by userId and filter out already processed users
    const userAdvancesMap = new Map<string, typeof activeAdvances>();
    for (const advance of activeAdvances) {
      if (processedUserIds.has(advance.userId)) continue;

      if (!userAdvancesMap.has(advance.userId)) {
        userAdvancesMap.set(advance.userId, []);
      }
      userAdvancesMap.get(advance.userId)!.push(advance);
    }

    if (userAdvancesMap.size === 0) {
      console.log("ℹ️ [Cron] All eligible users have already been processed for today.");
      return { processedUsers: 0, processedAdvances: 0 };
    }

    // 4. Fetch Global Settings for Rates
    const settings = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const profitMonthlyRate = (settings?.monthlyProfitPercentage || 5.0).toString();
    const referralMonthlyRate = (settings?.monthlyReferralPercentage || 5.0).toString();
    const staffMonthlyRate = (settings?.monthlyStaffPercentage || 5.0).toString();

    const results = {
      processedUsers: 0,
      processedAdvances: 0,
      totalDistributed: new Prisma.Decimal(0),
      totalReferral: new Prisma.Decimal(0),
      totalStaff: new Prisma.Decimal(0)
    };

    console.log(`⏰ [Cron] Processing ${userAdvancesMap.size} new users...`);

    // 5. Concurrent Processing: Process users in batches
    const userIds = Array.from(userAdvancesMap.keys());
    const CONCURRENCY_LIMIT = 10;

    for (let i = 0; i < userIds.length; i += CONCURRENCY_LIMIT) {
      const batch = userIds.slice(i, i + CONCURRENCY_LIMIT);

      await Promise.all(batch.map(async (userId) => {
        const advances = userAdvancesMap.get(userId)!;
        try {
          await prisma.$transaction(async (tx) => {
            const user = advances[0].user;
            const totalAdvanceAmount = advances.reduce((sum, adv) => sum.plus(adv.advanceAmount.toString()), new Prisma.Decimal(0));
            const wallet = await tx.wallet.findUnique({
              where: { userId },
              select: { promotionalAmount: true }
            });
            const promotionalPrincipal = new Prisma.Decimal(wallet?.promotionalAmount || 0);
            const earningBase = totalAdvanceAmount.plus(promotionalPrincipal);

            // Precise Arithmetic with Decimal
            // dailyProfit = (Total * MonthlyRate / 100) / 30
            const dailyProfit = earningBase
              .mul(profitMonthlyRate)
              .div(100)
              .div(30)
              .toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);

            const referralReward = earningBase
              .mul(referralMonthlyRate)
              .div(100)
              .div(30)
              .toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);

            const staffCommission = earningBase
              .mul(staffMonthlyRate)
              .div(100)
              .div(30)
              .toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);

            if (dailyProfit.lte(0)) return;

            // 1. Credit Customer Profit
            await WalletService.updateBalance(userId, { profitAmount: dailyProfit }, tx);

            await tx.transaction.create({
              data: {
                userId: userId,
                type: TransactionType.PROFIT,
                amount: dailyProfit,
                description: `Daily profit on Total Gold Advances (${advances.length} active invoices)`,
              }
            });

            // 2. Credit Referrer (if exists)
            if (user.referredBy && referralReward.gt(0)) {
              await WalletService.updateBalance(user.referredBy, { referralAmount: referralReward }, tx);
              await tx.transaction.create({
                data: {
                  userId: user.referredBy,
                  type: TransactionType.REFERRAL,
                  amount: referralReward,
                  description: `Referral reward from customer ${user.name} (Aggregated Profile)`,
                }
              });
              results.totalReferral = results.totalReferral.plus(referralReward);
            }

            // 3. Credit Staff (if exists)
            if (user.staffId && staffCommission.gt(0)) {
              await tx.staffCommission.create({
                data: {
                  staffId: user.staffId,
                  customerId: userId,
                  amount: staffCommission
                }
              });

              await WalletService.updateBalance(user.staffId, { staffCommissionBalance: staffCommission }, tx);

              await tx.transaction.create({
                data: {
                  userId: user.staffId,
                  type: TransactionType.STAFF_COMMISSION,
                  amount: staffCommission,
                  description: `Commission from customer ${user.name} (Aggregated Profile)`,
                }
              });
              results.totalStaff = results.totalStaff.plus(staffCommission);
            }

            results.processedUsers++;
            results.processedAdvances += advances.length;
            results.totalDistributed = results.totalDistributed.plus(dailyProfit);
          });
        } catch (err: any) {
          console.error(`❌ [Cron] Failed for user ${userId}:`, err.message);
        }
      }));
    }



    // 7. Final Audit Log
    if (results.processedUsers > 0) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      await AuditService.logAction({
        actionType: AuditAction.PROFIT_DISTRIBUTED,
        entityType: "System",
        entityId: businessDate,
        description: `Daily profit distribution completed in ${duration}s for ${results.processedUsers} users.`,
        newData: { 
          processedUsers: results.processedUsers,
          processedAdvances: results.processedAdvances,
          totalDistributed: results.totalDistributed.toString(),
          totalReferral: results.totalReferral.toString(),
          totalStaff: results.totalStaff.toString(),
          durationSeconds: duration 
        },
        performedByRole: "ADMIN",
        performedByUserId: "SYSTEM"
      });
      console.log(`✅ [Cron] Distribution completed in ${duration}s:`, {
        ...results,
        totalDistributed: results.totalDistributed.toString()
      });
    }

    return {
      processedUsers: results.processedUsers,
      processedAdvances: results.processedAdvances,
      totalDistributed: results.totalDistributed,
      totalReferral: results.totalReferral,
      totalStaff: results.totalStaff
    };
  }
}
