import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function seedProducts() {
  const products = [
    {
      name: "1g Gold Coin",
      description: "Our signature 1g bullion coin. Perfect for consistent savings and easy liquidity. Certified across India.",
      weight: new Prisma.Decimal(1.0),
      purity: "24K",
      imageUrl: "/images/coins/normal.png",
      stock: 100,
    },
    {
      name: "Lakshmi Ganesh 1g Coin",
      description: "Lord Ganesha & Goddess Lakshmi embossed 1g coin. Invoke prosperity and divine blessings into your home.",
      weight: new Prisma.Decimal(1.0),
      purity: "24K",
      imageUrl: "/images/coins/lakshmi_ganesh.png",
      stock: 50,
    },
    {
      name: "Kuber Yantra 1g Coin",
      description: "Kuber Yantra 1g premium gold coin. Dedicated to the Treasurer of Gods, designed for wealth attraction.",
      weight: new Prisma.Decimal(1.0),
      purity: "24K",
      imageUrl: "/images/coins/kuber.png",
      stock: 50,
    },
    {
      name: "0.5g Gold Coin",
      description: "Start your golden journey today. The most accessible way to own pure Physical Gold.",
      weight: new Prisma.Decimal(0.5),
      purity: "24K",
      imageUrl: "/images/coins/0_5g.png",
      stock: 200,
    },
    {
      name: "2g Gold Coin",
      description: "Optimal value for serious savers. Higher weight, lower premiums, maximum security.",
      weight: new Prisma.Decimal(2.0),
      purity: "24K",
      imageUrl: "/images/coins/2g.png",
      stock: 75,
    },
  ];

  // Also seed a gold price entry if none exists
  const priceCount = await prisma.goldPrice.count();
  if (priceCount === 0) {
    await prisma.goldPrice.create({
      data: {
        buyPrice: new Prisma.Decimal(7200),
        sellPrice: new Prisma.Decimal(7350),
      },
    });
    console.log("Seeded gold price: Buy ₹7200/g, Sell ₹7350/g");
  }

  for (const p of products) {
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });
    if (!existing) {
      await prisma.product.create({ data: p });
      console.log(`Created: ${p.name}`);
    } else {
      console.log(`Exists: ${p.name}`);
    }
  }

  console.log("Product seeding complete!");
}

seedProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
