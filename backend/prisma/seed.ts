import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  
  // ── Seeding Configuration ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("adRGT@2026", 10);

  // ── Super Admin ─────────────────────────────────────────────────────────────
  const admin = await (prisma.user as any).upsert({
    where: { email: "appdostofficial@gmail.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "appdostofficial@gmail.com",
      password: passwordHash,
      role: Role.SUPERADMIN,
      contactNo: "0000000001",
      wallet: { create: {} }
    },
  });
  console.log(`✅ Super Admin: ${admin.name} (${admin.email})`);

  // ── System Setting ───────────────────────────────────────────────────────────
  await (prisma as any).systemSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      showGST: true,
      gstPercentage: 18.0
    }
  });
  console.log("✅ System settings initialized.");

  // ── Feature Flags ───────────────────────────────────────────────────────────
  await (prisma.featureFlag as any).createMany({
    data: [
      { key: "REFER_EARN", label: "Refer & Earn System", description: "Enable referral commissions", isEnabled: true, category: "FEATURE" },
      { key: "WITHDRAWALS", label: "Customer Withdrawals", description: "Allow users to request payouts", isEnabled: true, category: "FEATURE" },
    ]
  });
  console.log("✅ Feature flags seeded.");
  console.log("✅ Feature flags seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
