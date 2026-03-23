import cron from "node-cron";
import { executeDailyDistribution } from "./executeDailyDistribution ";

export const startDailyReturnCron = () => {

  cron.schedule("0 1 * * *", async () => {
    console.log("⏰ [Cron] Scheduled job started...");
    await executeDailyDistribution();
  }, {
    timezone: "Asia/Kolkata"
  });

  // Startup recovery
  (async () => {
    console.log("🚀 [Cron] Startup check...");
    await executeDailyDistribution();
  })();

  console.log("✅ Cron initialized (01:00 AM IST)");
};