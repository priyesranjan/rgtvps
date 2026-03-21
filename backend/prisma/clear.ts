import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing existing data...");
  try {
    // Orders of deletion to respect foreign keys if any (Prisma handles some, but just in case)
    await prisma.transaction.deleteMany({});
    await prisma.withdrawalRequest.deleteMany({});
    await prisma.goldAdvance.deleteMany({});
    await prisma.staffCommission.deleteMany({});
    await prisma.dailyProfitLog.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.referral.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.systemSetting.deleteMany({});
    
    console.log("✅ Database cleared successfully.");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
