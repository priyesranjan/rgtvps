import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Branch ───────────────────────────────────────────────────────────────────
  const branch = await prisma.branch.upsert({
    where: { code: "RGT-PNA-001" },
    update: {},
    create: { name: "Kankarbagh Branch", city: "Patna", code: "RGT-PNA-001" },
  });
  console.log(`✅ Branch: ${branch.name}`);

  // ── Admin ─────────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin@123", 10);
  const admin = await prisma.employee.upsert({
    where: { email: "admin@rgt.in" },
    update: {},
    create: {
      name: "Super Admin",
      employeeCode: "EMP-000",
      email: "admin@rgt.in",
      passwordHash: adminHash,
      role: "ADMIN",
      branchId: branch.id,
    },
  });
  console.log(`✅ Admin: ${admin.name} (${admin.employeeCode})`);

  // ── Manager ───────────────────────────────────────────────────────────────────
  const mgrHash = await bcrypt.hash("manager@123", 10);
  const manager = await prisma.employee.upsert({
    where: { email: "manager@rgt.in" },
    update: {},
    create: {
      name: "Priya Kumari",
      employeeCode: "EMP-001",
      email: "manager@rgt.in",
      passwordHash: mgrHash,
      role: "MANAGER",
      branchId: branch.id,
    },
  });
  console.log(`✅ Manager: ${manager.name} (${manager.employeeCode})`);

  // ── Employees ─────────────────────────────────────────────────────────────────
  const empHash = await bcrypt.hash("employee@123", 10);
  const emp1 = await prisma.employee.upsert({
    where: { email: "sanjay@rgt.in" },
    update: {},
    create: {
      name: "Sanjay Jha",
      employeeCode: "EMP-002",
      email: "sanjay@rgt.in",
      passwordHash: empHash,
      role: "EMPLOYEE",
      branchId: branch.id,
      totalLeadsCount: 42,
      monthlyLeadCount: 12,
    },
  });

  const emp2 = await prisma.employee.upsert({
    where: { email: "raunak@rgt.in" },
    update: {},
    create: {
      name: "Raunak Singh",
      employeeCode: "EMP-003",
      email: "raunak@rgt.in",
      passwordHash: empHash,
      role: "EMPLOYEE",
      branchId: branch.id,
      totalLeadsCount: 38,
      monthlyLeadCount: 10,
    },
  });

  const emp3 = await prisma.employee.upsert({
    where: { email: "ravi@rgt.in" },
    update: {},
    create: {
      name: "Ravi Kumar",
      employeeCode: "EMP-004",
      email: "ravi@rgt.in",
      passwordHash: empHash,
      role: "EMPLOYEE",
      branchId: branch.id,
      totalLeadsCount: 31,
      monthlyLeadCount: 8,
    },
  });
  console.log(`✅ Employees: ${emp1.name}, ${emp2.name}, ${emp3.name}`);

  // ── Investors ─────────────────────────────────────────────────────────────────
  const invHash = await bcrypt.hash("investor@123", 10);
  const investor1 = await prisma.user.upsert({
    where: { mobile: "+919876543210" },
    update: {},
    create: {
      name: "Abhishek Kumar",
      mobile: "+919876543210",
      email: "abhishek@test.in",
      passwordHash: invHash,
      createdByEmployeeId: emp1.id,  // Sanjay registered him
    },
  });

  const investor2 = await prisma.user.upsert({
    where: { mobile: "+918765432109" },
    update: {},
    create: {
      name: "Priya Sharma",
      mobile: "+918765432109",
      passwordHash: invHash,
      createdByEmployeeId: emp2.id,  // Raunak registered her
    },
  });
  console.log(`✅ Investors: ${investor1.name}, ${investor2.name}`);

  // ── Investments (tranches) ────────────────────────────────────────────────────
  // Investor1 — Tranche 1: ₹12,45,000 @ 2.75% by Sanjay (Walk-in)
  const inv1 = await prisma.investment.upsert({
    where: { id: "seed-inv-001" },
    update: {},
    create: {
      id: "seed-inv-001",
      investorId: investor1.id,
      processedByEmployeeId: emp1.id,
      processedAt: new Date("2026-01-15"),
      principalAmount: 1245000,
      interestRate: 2.75,
      currentRate: 2.75,
      leadSource: "Walk-in",
      startDate: new Date("2026-01-15"),
    },
  });

  // Investor1 — Tranche 2: ₹3,00,000 @ 3.10% by Raunak (Referral) — different rate
  const inv2 = await prisma.investment.upsert({
    where: { id: "seed-inv-002" },
    update: {},
    create: {
      id: "seed-inv-002",
      investorId: investor1.id,
      processedByEmployeeId: emp2.id,
      processedAt: new Date("2026-03-01"),
      principalAmount: 300000,
      interestRate: 3.10,
      currentRate: 3.10,
      leadSource: "Referral",
      startDate: new Date("2026-03-01"),
    },
  });

  // Investor2 — ₹5,00,000 @ 2.80% by Raunak (Lead-1)
  const inv3 = await prisma.investment.upsert({
    where: { id: "seed-inv-003" },
    update: {},
    create: {
      id: "seed-inv-003",
      investorId: investor2.id,
      processedByEmployeeId: emp2.id,
      processedAt: new Date("2026-02-02"),
      principalAmount: 500000,
      interestRate: 2.80,
      currentRate: 3.00,   // manager changed it
      leadSource: "Lead-1",
      startDate: new Date("2026-02-02"),
    },
  });
  console.log(`✅ Investments: 3 tranches seeded`);

  // ── Rate Change Log (example: manager changed inv3 from 2.80 → 3.00) ─────────
  await prisma.rateChangeLog.upsert({
    where: { id: "seed-rcl-001" },
    update: {},
    create: {
      id: "seed-rcl-001",
      investmentId: inv3.id,
      oldRate: 2.80,
      newRate: 3.00,
      reason: "Client negotiated upgrade to Premium plan",
      changedByEmployeeId: manager.id,
      changedByRole: "MANAGER",
      changedAt: new Date("2026-02-15"),
    },
  });
  console.log(`✅ Rate change log seeded`);

  // ── Tech Team account ─────────────────────────────────────────────────────────
  const techHash = await bcrypt.hash("techteam@123", 10);
  await prisma.employee.upsert({
    where: { email: "tech@rgt.in" },
    update: {},
    create: {
      name: "Tech Lead",
      employeeCode: "TECH-001",
      email: "tech@rgt.in",
      passwordHash: techHash,
      role: "TECH_TEAM",
      branchId: branch.id,
    },
  });
  console.log(`✅ Tech Team account seeded`);

  // ── Referral codes for investors ──────────────────────────────────────────────
  await prisma.user.update({
    where: { id: investor1.id },
    data: { referralCode: "RGT-REF-ABHISHEK" },
  });
  await prisma.user.update({
    where: { id: investor2.id },
    data: { referralCode: "RGT-REF-PRIYA" },
  });
  console.log(`✅ Referral codes assigned to investors`);

  // ── Feature Flags (default platform settings) ─────────────────────────────────
  const defaultFlags = [
    { key: "MANAGER_ROLE",       label: "Manager Role (Level 3)",         description: "When OFF, Manager role is hidden — only 3 levels: Investor, Employee, Admin", category: "ROLE",         isEnabled: true  },
    { key: "REFER_EARN",         label: "Refer & Earn System",            description: "Allow investors to earn referral commissions when they refer new investors", category: "FEATURE",      isEnabled: true  },
    { key: "WITHDRAWALS",        label: "Investor Withdrawals",           description: "Allow investors to submit withdrawal requests from their dashboard",          category: "FEATURE",      isEnabled: true  },
    { key: "PDF_DOWNLOADS",      label: "PDF Invoice Downloads",          description: "Allow investors and employees to download PDF invoices/statements",          category: "FEATURE",      isEnabled: true  },
    { key: "LEADERBOARD",        label: "Employee Leaderboard",           description: "Show the employee leads leaderboard visible to Manager and Admin",           category: "FEATURE",      isEnabled: true  },
    { key: "WHATSAPP_NOTIFS",    label: "WhatsApp Notifications",         description: "Send automated WhatsApp messages for deposits, yields, and withdrawals",     category: "NOTIFICATION", isEnabled: false },
    { key: "SMS_ALERTS",         label: "SMS Notifications",              description: "Send real-time SMS alerts for deposits and commissions via 2Factor",       category: "NOTIFICATION", isEnabled: true  },
    { key: "OTP_LOGIN",          label: "OTP Authentication",              description: "Enable secure 6-digit OTP login for investors",                            category: "SECURITY",     isEnabled: true  },
    { key: "SELF_REGISTRATION",  label: "Investor Self-Registration",     description: "Allow new investors to self-register — currently only employee-created",    category: "FEATURE",      isEnabled: false },
  ];

  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }
  console.log(`✅ Feature flags seeded (7 defaults)`);

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────────");
  console.log("Login credentials:");
  console.log("  Tech Team → tech@rgt.in          / techteam@123");
  console.log("  Admin     → admin@rgt.in          / admin@123");
  console.log("  Manager   → manager@rgt.in        / manager@123");
  console.log("  Employee  → sanjay@rgt.in         / employee@123");
  console.log("  Employee  → raunak@rgt.in         / employee@123");
  console.log("  Investor  → +919876543210          / investor@123");
  console.log("─────────────────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
