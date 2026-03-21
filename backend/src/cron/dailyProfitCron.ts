import cron from "node-cron";
import { ProfitDistributionService } from "../services/ProfitDistributionService";

/**
 * Task: Daily Return Distribution
 * Runs every day at 01:00 AM (IST)
 */
export const startDailyReturnCron = () => {
  cron.schedule("0 1 * * *", async () => {
    // cron.schedule("*/5 * * * *", async () => {
    // console.log("⏰ [Cron] Starting every 5 minutes gold advance profit distribution...");
    console.log("⏰ [Cron] Starting daily gold advance profit distribution...");
    try {
      const results = await ProfitDistributionService.distributeDailyReturns();
      console.log(`✅ [Cron] Distribution completed:`, results);
    } catch (error) {
      console.error(`❌ [Cron] Distribution failed:`, error);
    }
  });

  console.log("🚀 [Cron] Profit distribution job scheduled to run daily at 1:00 AM IST");
};
