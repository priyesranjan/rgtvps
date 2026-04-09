import { prisma } from "../lib/prisma";
import { Role, AuditAction, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuditService } from "./AuditService";

const PROMOTIONAL_SIGNUP_BONUS = 1000;
const PROMOTIONAL_REFERRAL_BONUS = 1000;

export interface CreateCustomerData {
  name: string;
  email: string;
  password?: string;
  contactNo: string;
  aadharNo?: string;
  pan?: string;
  address?: string;
  photo?: string;
  gender?: string;
  dob?: Date;
  initialGoldAdvanceAmount: number;
  referredBy?: string;
  staffId: string;
  performedByUserId: string;
  performedByRole: Role;
  ipAddress?: string;
}

export class CustomerService {
  private static async generateInviteCode(tx: any, seed: string) {
    const base = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "RGTUSR";
    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `${base}${suffix}`;
      const existing = await tx.user.findUnique({ where: { inviteCode: code } });
      if (!existing) return code;
    }
    return `RGT${Date.now().toString().slice(-8)}`;
  }

  /**
   * Onboards a new customer with a wallet and initial gold advance.
   */
  static async onboardCustomer(data: CreateCustomerData) {
    const { 
      name, email, password, contactNo, aadharNo, pan, address, photo, 
      gender, dob, initialGoldAdvanceAmount, referredBy, staffId,
      performedByUserId, performedByRole, ipAddress
    } = data;

    // Default password if not provided
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "password123", salt);

    return await prisma.$transaction(async (tx) => {
      const inviteCode = await this.generateInviteCode(tx, `${name}${contactNo}`);

      // 1. Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.CUSTOMER,
          contactNo,
          mobile: contactNo, // Legacy
          aadharNo,
          aadhar: aadharNo, // Legacy
          pan,
          address,
          photo,
          gender,
          dob,
          initialGoldAdvanceAmount,
          referredBy: referredBy || undefined,
          staffId: staffId || undefined,
          inviteCode,
        }
      });

      // 2. Create Wallet
      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          goldAdvanceAmount: initialGoldAdvanceAmount,
          promotionalAmount: PROMOTIONAL_SIGNUP_BONUS,
          totalWithdrawable: initialGoldAdvanceAmount,
        }
      });

      // 3. Signup promotional bonus (non-withdrawable bucket)
      await tx.transaction.create({
        data: {
          userId: user.id,
          performedById: performedByUserId,
          type: TransactionType.PROMOTIONAL_CREDIT,
          amount: PROMOTIONAL_SIGNUP_BONUS,
          balanceAfter: initialGoldAdvanceAmount,
          description: "Signup promotional credit ₹1000 (non-withdrawable)",
        },
      });

      // 4. Create initial GoldAdvance deposit record (if provided)
      let goldAdvance: any = null;
      if (initialGoldAdvanceAmount > 0) {
        goldAdvance = await tx.goldAdvance.create({
          data: {
            userId: user.id,
            advanceAmount: initialGoldAdvanceAmount,
            status: "ACTIVE"
          }
        });

        const paddedNo = `RGT-${String(goldAdvance.invoiceNo).padStart(6, '0')}`;
        await tx.transaction.create({
          data: {
            userId: user.id,
            entityId: goldAdvance.id,
            performedById: performedByUserId,
            type: TransactionType.DEPOSIT,
            amount: initialGoldAdvanceAmount,
            balanceAfter: initialGoldAdvanceAmount,
            description: `Initial Gold Advance Deposit. Ref: #${paddedNo}`
          }
        });
      }

      // 5. Referrer promo bonus on successful referred signup
      if (referredBy) {
        await tx.wallet.upsert({
          where: { userId: referredBy },
          create: {
            userId: referredBy,
            promotionalAmount: PROMOTIONAL_REFERRAL_BONUS,
          },
          update: {
            promotionalAmount: { increment: PROMOTIONAL_REFERRAL_BONUS },
          },
        });

        await tx.transaction.create({
          data: {
            userId: referredBy,
            performedById: performedByUserId,
            type: TransactionType.PROMOTIONAL_CREDIT,
            amount: PROMOTIONAL_REFERRAL_BONUS,
            description: `Referral promotional credit ₹1000 from ${user.name}`,
          },
        });
      }

      // 6. Log Audit record
      await AuditService.logAction({
        actionType: AuditAction.CUSTOMER_CREATED,
        entityType: "User",
        entityId: user.id,
        performedByUserId,
        performedByRole,
        newData: { 
          id: user.id, 
          email: user.email, 
          initialGoldAdvanceAmount,
          promotionalAmount: PROMOTIONAL_SIGNUP_BONUS,
          inviteCode,
        },
        description: `Customer ${name} onboarding by ${performedByRole} ${performedByUserId}`,
        ipAddress
      });

      return { user, wallet, goldAdvance };
    });
  }
}
