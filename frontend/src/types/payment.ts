import { IPlan } from "./organization";

export interface IPaymentRecord {
  _id: string;
  organization?: {
    _id: string;
    name: string;
    email?: string;
  } | string;
  organizationName?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  userName?: string;
  userEmail?: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  paymentMethod: string;
  transactionId: string;
  invoiceNumber: string;
  status: string;
  maxMembers?: number;
  prorationCredit?: number;
  previousPlanName?: string;
  paidAt: string;
}

export interface IPaymentReceipt {
  transactionId: string;
  invoiceNumber: string;
  amount: number;
  basePrice?: number;
  prorationCredit?: number;
  currency: string;
  paidAt: string | Date;
  status: string;
  plan: string;
  maxMembers: number;
  explanation?: string;
}

export interface DummyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: IPlan | null;
  currentSubscription?: any;
  billingCycle?: "monthly" | "yearly";
  onSuccess: () => void;
  subscribeToPlan: (payload: {
    planId: string;
    billingCycle?: string;
    paymentDetails?: any;
  }) => Promise<any>;
}

export type PaymentMethodOption = "card" | "upi" | "netbanking";
