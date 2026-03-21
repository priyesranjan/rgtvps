import { InvoiceService } from './src/services/InvoiceService';
import { prisma } from './src/lib/prisma';

async function test() {
  try {
    const advance = await prisma.goldAdvance.findFirst();
    if (advance) {
      console.log("Found advance:", advance.id);
      const html = await InvoiceService.generateGoldAdvanceInvoiceHtml(advance.id);
      console.log("Successfully generated HTML for advance");
    } else {
      console.log("No gold advance found");
    }

    const withdrawal = await prisma.withdrawalRequest.findFirst();
    if (withdrawal) {
      console.log("Found withdrawal:", withdrawal.id);
      const html = await InvoiceService.generateWithdrawalInvoiceHtml(withdrawal.id);
      console.log("Successfully generated HTML for withdrawal");
    } else {
      console.log("No withdrawal found");
    }
  } catch (err) {
    console.error("FAILED TRANSACTION GENERATION:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
