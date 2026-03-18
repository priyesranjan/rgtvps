import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function addTestUser() {
  const mobile = "+917635075422";
  const existing = await prisma.user.findUnique({ where: { mobile } });
  
  if (!existing) {
    const passwordHash = await bcrypt.hash("test1234", 10);
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        mobile,
        passwordHash,
        role: "INVESTOR",
      }
    });
    console.log(`✅ User created: ${user.name} (${user.mobile})`);
  } else {
    console.log(`User already exists: ${existing.name} (${existing.mobile})`);
  }
}

addTestUser().finally(() => prisma.$disconnect());
