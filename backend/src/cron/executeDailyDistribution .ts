import { prisma } from "../lib/prisma";
import { ProfitDistributionService } from "../services/ProfitDistributionService";
import { DateTime } from "luxon";

export const executeDailyDistribution = async () => {
    // 🌍 Determine Business Date and Cutoff in IST (Asia/Kolkata)
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const businessDate = nowIST.toFormat("yyyy-MM-dd");
    const cutoffDate = nowIST.startOf("day").toJSDate(); // 00:00:00 IST of today

    console.log(`⚙️ [Job] Starting execution for Business Date: ${businessDate}`);
    console.log(`📅 [Job] Cutoff set to: ${cutoffDate.toISOString()} (Everything till yesterday 11:59:59 PM IST)`);

    const MAX_RETRY = 3;

    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
        try {
            const shouldProceed = await prisma.$transaction(async (tx) => {
                const existing = await tx.dailyProfitLog.findUnique({
                    where: { date: businessDate }
                });

                if (existing?.status === "SUCCESS") {
                    console.log(`✅ [Job] Distribution for ${businessDate} already completed successfully.`);
                    return false;
                }

                if (existing?.status === "PROCESSING") {
                    // Check for stale lock (e.g., older than 30 minutes)
                    const updatedAt = DateTime.fromJSDate(existing.updatedAt);
                    const minutesSinceUpdate = DateTime.now().diff(updatedAt, 'minutes').minutes;

                    if (minutesSinceUpdate < 30) {
                        console.log(`⚠️ [Job] already running (updated ${Math.round(minutesSinceUpdate)}m ago). Skipping.`);
                        return false;
                    }
                    console.log(`🔄 [Job] Found stale PROCESSING lock (${Math.round(minutesSinceUpdate)}m old). Re-taking lock...`);
                }

                // Create / Update lock with current timestamp
                await tx.dailyProfitLog.upsert({
                    where: { date: businessDate },
                    create: {
                        date: businessDate,
                        status: "PROCESSING"
                    },
                    update: {
                        status: "PROCESSING",
                        updatedAt: new Date()
                    }
                });

                return true;
            });

            if (!shouldProceed) return;

            // 🚀 RUN ACTUAL LOGIC
            const distributionResult = await ProfitDistributionService.distributeDailyReturns(cutoffDate, businessDate);

            // ✅ MARK SUCCESS
            await prisma.dailyProfitLog.update({
                where: { date: businessDate },
                data: {
                    status: "SUCCESS",
                    processed: distributionResult?.processedUsers || 0,
                    totalDistributed: distributionResult?.totalDistributed || 0
                }
            });

            console.log(`✅ [Job] ${businessDate} completed successfully on attempt ${attempt}`);
            return;

        } catch (error) {
            console.error(`❌ [Job] Attempt ${attempt} failed for ${businessDate}:`, error);

            if (attempt === MAX_RETRY) {
                await prisma.dailyProfitLog.update({
                    where: { date: businessDate },
                    data: {
                        status: "FAILED",
                        errorMessage: String(error)
                    }
                });

                console.error("🔥 [Job] All retries failed. System requires manual inspection.");
            } else {
                // Wait before next retry (exponential backoff or simple delay)
                await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
            }
        }
    }
};