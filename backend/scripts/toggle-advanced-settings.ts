import { prisma } from "../src/lib/prisma";

async function main() {
  const settings = await prisma.systemSetting.upsert({
    where: { id: "default" },
    update: {
      showAdvancedSettings: true,
      monthlyProfitPercentage: 5.0,
      monthlyReferralPercentage: 5.0,
      monthlyStaffPercentage: 5.0
    },
    create: {
      id: "default",
      showAdvancedSettings: true,
      monthlyProfitPercentage: 5.0,
      monthlyReferralPercentage: 5.0,
      monthlyStaffPercentage: 5.0
    }
  });

  console.log("✅ Advanced Settings enabled in Database:", settings);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
