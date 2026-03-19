import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  
  // ── Clear Database ──────────────────────────────────────────────────────────
  console.log("🧹 Clearing existing data...");
  await (prisma as any).auditLog.deleteMany({});
  await (prisma as any).transaction.deleteMany({});
  await (prisma as any).withdrawalRequest.deleteMany({});
  await (prisma as any).goldAdvance.deleteMany({});
  await (prisma as any).wallet.deleteMany({});
  await (prisma as any).dailyProfitLog.deleteMany({});
  await (prisma as any).staffCommission.deleteMany({});
  await (prisma as any).user.deleteMany({});
  await (prisma as any).systemSetting.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // ── Staff ─────────────────────────────────────────────────────────────────────
  const staff = await (prisma.user as any).upsert({
    where: { email: "staff@rgt.com" },
    update: {},
    create: {
      name: "Staff Member",
      email: "staff@rgt.com",
      password: passwordHash,
      role: Role.STAFF,
      contactNo: "0000000002",
      wallet: { create: {} }
    },
  });

  // ── Customer ──────────────────────────────────────────────────────────────────
  const customer = await (prisma.user as any).upsert({
    where: { email: "customer@rgt.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@rgt.com",
      password: passwordHash,
      role: Role.CUSTOMER,
      contactNo: "9876543210",
      mobile: "9876543210",
      staffId: staff.id,
      initialGoldAdvanceAmount: 100000,
      wallet: { 
        create: { goldAdvanceAmount: 100000, totalWithdrawable: 100000 } 
      }
    },
  });

  // ── New Requested Users ───────────────────────────────────────────────────────
  
  const techTeam = await (prisma.user as any).upsert({
    where: { email: 'tech@rgt.in' },
    update: {},
    create: {
      name: 'Tech Team',
      email: 'tech@rgt.in',
      password: await bcrypt.hash('techteam@123', 10),
      role: Role.TECH_TEAM,
      wallet: { create: {} }
    },
  });
  console.log(`✅ Tech Team: ${techTeam.email}`);

  const adminUser = await (prisma.user as any).upsert({
    where: { email: 'admin@rgt.in' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@rgt.in',
      password: await bcrypt.hash('admin@123', 10),
      role: Role.ADMIN,
      wallet: { create: {} }
    },
  });
  console.log(`✅ Admin: ${adminUser.email}`);

  const manager = await (prisma.user as any).upsert({
    where: { email: 'manager@rgt.in' },
    update: {},
    create: {
      name: 'Manager',
      email: 'manager@rgt.in',
      password: await bcrypt.hash('manager@123', 10),
      role: Role.MANAGER,
      wallet: { create: {} }
    },
  });
  console.log(`✅ Manager: ${manager.email}`);

  const sanjay = await (prisma.user as any).upsert({
    where: { email: 'sanjay@rgt.in' },
    update: {},
    create: {
      name: 'Sanjay',
      email: 'sanjay@rgt.in',
      password: await bcrypt.hash('employee@123', 10),
      role: Role.EMPLOYEE,
      wallet: { create: {} }
    },
  });
  console.log(`✅ Employee: ${sanjay.email}`);

  const raunak = await (prisma.user as any).upsert({
    where: { email: 'raunak@rgt.in' },
    update: {},
    create: {
      name: 'Raunak',
      email: 'raunak@rgt.in',
      password: await bcrypt.hash('employee@123', 10),
      role: Role.EMPLOYEE,
      wallet: { create: {} }
    },
  });
  console.log(`✅ Employee: ${raunak.email}`);

  const investor = await (prisma.user as any).upsert({
    where: { email: '+919876543210' },
    update: {},
    create: {
      name: 'Investor',
      email: '+919876543210',
      contactNo: '+919876543210',
      password: await bcrypt.hash('investor@123', 10),
      role: Role.INVESTOR,
      wallet: { create: {} }
    },
  });
  console.log(`✅ Investor: ${investor.email}`);

  // ── Sample Gold Advance ───────────────────────────────────────────────────────
  const existingAdvance = await prisma.goldAdvance.findFirst({
    where: { userId: customer.id }
  });

  if (!existingAdvance) {
    await (prisma.goldAdvance as any).create({
      data: {
        userId: customer.id,
        advanceAmount: 100000,
        status: "ACTIVE"
      }
    });

    await (prisma.transaction as any).create({
      data: {
        userId: customer.id,
        type: "DEPOSIT",
        amount: 100000,
        balanceAfter: 100000,
        description: "Initial Gold Advance Deposit"
      }
    });
  }

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
