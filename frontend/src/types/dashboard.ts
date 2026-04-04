export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN" | "SUPERADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  balance: number;
  totalGoldAdvanceAmount: number;
  activeGoldAdvanceAmount: number;
  profitBalance: number;
  referralBalance: number;
  createdAt: string;
  contactNo?: string;
  aadhar?: string;
  aadharNo?: string;
  pan?: string;
  staffId?: string;
  referredBy?: string;
  address?: string;
  photo?: string;
  gender?: string;
  dob?: string;
  performedBy?: {
    name: string;
  };
  wallet?: {
    profitAmount: number;
    referralAmount: number;
    goldAdvanceAmount?: number;
    totalInvested?: number;
  };
  assignedStaff?: {
    name: string;
    email: string;
  };
  referrer?: {
    name: string;
    email: string;
  };
  totalLifetimeWithdrawal?: number;
  totalLifetimeProfit?: number;
  totalLifetimeReferralProfit?: number;
  customers?: any[];
}

export interface Transaction {
  id: string;
  type: string;
  amount: number | string; // Numeric for data, string for mapped display
  description: string;
  createdAt: string;
  date?: string; 
  processedBy?: any; 
  performedBy?: {
    name: string;
  };
  rawAmount?: number;
  balanceAfter?: number | string;
  entityId?: string;
  icon?: any; 
  iconBg?: string;
  iconColor?: string;
  amountColor?: string;
  status?: string;
  statusColor?: string;
  rawType?: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  source: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  description: string;
  createdAt: string;
  entityId?: string;
}

export interface GoldAdvance {
  id: string;
  userId: string;
  amount: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}
