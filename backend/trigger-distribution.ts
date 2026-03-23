import { ProfitDistributionService } from "./src/services/ProfitDistributionService";
import { prisma } from "./src/lib/prisma";

async function triggerDistribution() {
  console.log("🚀 Manually triggering daily return distribution...");
  try {
    // Delete today's log if it exists to allow re-run (Local Date)
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    await prisma.dailyProfitLog.deleteMany({ where: { date: dateStr } });
    
    await ProfitDistributionService.distributeDailyReturns();
    console.log("✅ Distribution complete!");
  } catch (err) {
    console.error("❌ Distribution failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

triggerDistribution();
