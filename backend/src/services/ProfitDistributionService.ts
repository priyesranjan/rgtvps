import { prisma } from "../lib/prisma";
import { TransactionType, GoldAdvanceStatus, AuditAction } from "@prisma/client";
import { WalletService } from "./WalletService";
import { AuditService } from "./AuditService";

export class ProfitDistributionService {
  /**
   * Distribute daily returns for all active gold advances
   */
  static async distributeDailyReturns() {
    const activeAdvances = await prisma.goldAdvance.findMany({
      where: { status: GoldAdvanceStatus.ACTIVE },
      include: {
        user: {
          select: {
            id: true,
            referredBy: true,
            staffId: true,
            name: true
          }
        }
      }
    });

    // Fetch Global Settings for Rates
    const settings = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const profitMonthlyRate = Number(settings?.monthlyProfitPercentage || 5.0) / 100;
    const referralMonthlyRate = Number(settings?.monthlyReferralPercentage || 5.0) / 100;
    const staffMonthlyRate = Number(settings?.monthlyStaffPercentage || 5.0) / 100;

    const results = {
      processed: 0,
      totalDistributed: 0,
      totalReferral: 0,
      totalStaff: 0
    };

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    for (const advance of activeAdvances) {
      try {
        // Check if this specific advance already got profit today
        const existingTx = await prisma.transaction.findFirst({
          where: {
            userId: advance.userId,
            type: TransactionType.PROFIT,
            description: { contains: `Gold Advance #${advance.id}` },
            createdAt: {
              gte: startOfToday,
              lte: endOfToday
            }
          }
        });

        if (existingTx) continue;

        await prisma.$transaction(async (tx) => {
          const advanceAmount = Number(advance.advanceAmount);
          
          // Monthly rate logic: (advanceAmount * Rate) / 30 days
          const dailyProfit = Number(((advanceAmount * profitMonthlyRate) / 30).toFixed(2));
          const referralReward = Number(((advanceAmount * referralMonthlyRate) / 30).toFixed(2));
          const staffCommission = Number(((advanceAmount * staffMonthlyRate) / 30).toFixed(2));
          
          if (dailyProfit <= 0) return;

          // 1. Credit Customer Profit
          await WalletService.updateBalance(advance.userId, { profitAmount: dailyProfit }, tx);
          
          await tx.transaction.create({
            data: {
              userId: advance.userId,
              type: TransactionType.PROFIT,
              amount: dailyProfit,
              description: `Daily profit on Gold Advance #${advance.id}`,
            }
          });

          // 2. Credit Referrer (if exists)
          if (advance.user.referredBy && referralReward > 0) {
            await WalletService.updateBalance(advance.user.referredBy, { referralAmount: referralReward }, tx);
            
            await tx.transaction.create({
              data: {
                userId: advance.user.referredBy,
                type: TransactionType.REFERRAL,
                amount: referralReward,
                description: `Referral reward from customer ${advance.user.name} (Advance #${advance.id})`,
              }
            });
            results.totalReferral += referralReward;
          }

          // 3. Credit Staff (if exists)
          if (advance.user.staffId && staffCommission > 0) {
            await tx.staffCommission.create({
              data: {
                staffId: advance.user.staffId,
                customerId: advance.userId,
                amount: staffCommission
              }
            });

            // Credit to staffCommissionBalance specifically
            await WalletService.updateBalance(advance.user.staffId, { staffCommissionBalance: staffCommission }, tx);
            
            await tx.transaction.create({
              data: {
                userId: advance.user.staffId,
                type: TransactionType.STAFF_COMMISSION,
                amount: staffCommission,
                description: `Commission from customer ${advance.user.name} (Advance #${advance.id})`,
              }
            });
            results.totalStaff += staffCommission;
          }

          results.processed++;
          results.totalDistributed += dailyProfit;
        });
      } catch (err) {
        console.error(`Failed to process profit for advance ${advance.id}:`, err);
      }
    }

    const dateStr = today.toISOString().split("T")[0];
    
    // Log in DailyProfitLog for visibility
    await prisma.dailyProfitLog.upsert({
      where: { date: dateStr },
      create: {
        date: dateStr,
        status: "SUCCESS",
        processed: results.processed
      },
      update: {
        status: "SUCCESS",
        processed: { increment: results.processed }
      }
    });

    // Final Audit Log for the record
    if (results.processed > 0) {
      await AuditService.logAction({
        actionType: AuditAction.PROFIT_DISTRIBUTED,
        entityType: "System",
        entityId: dateStr,
        description: `Daily profit distribution run completed for ${results.processed} advances.`,
        newData: results,
        performedByRole: "ADMIN",
        performedByUserId: "SYSTEM"
      });
    }

    return results;
  }
}
