import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const mobile = "+917635075422";
  
  const user = await prisma.user.upsert({
    where: { mobile },
    update: { isActive: true },
    create: {
      name: "Test User",
      mobile,
      passwordHash: "no-password-for-otp-test",
      role: "INVESTOR",
    }
  });

  console.log(`User ${user.name} (${user.mobile}) is ready for testing.`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
