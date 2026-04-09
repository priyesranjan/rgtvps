import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export class WalletService {
  /**
   * Get or create a wallet for a user
   */
  static async getOrCreateWallet(userId: string, tx?: any) {
    const client = tx || prisma;
    let wallet = await client.wallet.findUnique({ where: { userId } });
    
    if (!wallet) {
      wallet = await client.wallet.create({
        data: { userId }
      });
    }
    
    return wallet;
  }

  /**
   * Update wallet balances and recalculate totalWithdrawable
   */
  static async updateBalance(userId: string, data: {
    goldAdvanceAmount?: number | Prisma.Decimal;
    profitAmount?: number | Prisma.Decimal;
    referralAmount?: number | Prisma.Decimal;
    promotionalAmount?: number | Prisma.Decimal;
    referralBalance?: number | Prisma.Decimal;
    staffCommissionBalance?: number | Prisma.Decimal;
  }, tx?: any) {
    const client = tx || prisma;
    
    // Ensure wallet exists
    await this.getOrCreateWallet(userId, client);

    // Perform update with increment. 
    // Prisma increment works with Decimal.
    const updated = await client.wallet.update({
      where: { userId },
      data: {
        goldAdvanceAmount: data.goldAdvanceAmount ? { increment: data.goldAdvanceAmount } : undefined,
        profitAmount: data.profitAmount ? { increment: data.profitAmount } : undefined,
        referralAmount: data.referralAmount ? { increment: data.referralAmount } : undefined,
        promotionalAmount: data.promotionalAmount ? { increment: data.promotionalAmount } : undefined,
        referralBalance: data.referralBalance ? { increment: data.referralBalance } : undefined,
        staffCommissionBalance: data.staffCommissionBalance ? { increment: data.staffCommissionBalance } : undefined,
      }
    });

    // Promotional amount is intentionally non-withdrawable.
    const total = new Prisma.Decimal(updated.goldAdvanceAmount)
                    .plus(updated.profitAmount)
                    .plus(updated.referralAmount)
                    .plus(updated.referralBalance)
                    .plus(updated.staffCommissionBalance);
    
    return await client.wallet.update({
      where: { userId },
      data: { totalWithdrawable: total }
    });
  }
}
