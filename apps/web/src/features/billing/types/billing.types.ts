export type BillingChannel = "BANK_TRANSFER" | "PAYPAL" | "DEVELOPMENT";
export type BillingCurrency = "USD" | "NIO";
export type BillingInterval = "MENSUAL" | "ANUAL";
export type TransferStatus =
  | "PENDIENTE_EVIDENCIA"
  | "EN_REVISION"
  | "APROBADA"
  | "RECHAZADA"
  | "CANCELADA";

export type BillingPlan = {
  id: string;
  code: "STARTER" | "BUSINESS" | "ENTERPRISE" | string;
  name: string;
  description: string | null;
  limits: Record<string, number>;
  features: Record<string, boolean>;
  channel: BillingChannel;
  currency: BillingCurrency;
  amountMinor: number;
  interval: BillingInterval;
};

export type BillingTenant = {
  id: string;
  slug: string;
  name: string;
  status: string;
  currency: BillingCurrency;
  createdAt: string;
};

export type BillingSubscription = {
  id: string;
  status: string;
  provider: string;
  periodStartsAt: string | null;
  periodEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  amountMinor: number;
  currency: BillingCurrency;
  interval: BillingInterval;
  plan: {
    code: string;
    name: string;
    limits: Record<string, number>;
    features: Record<string, boolean>;
  };
};

export type BillingInvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitAmountMinor: number;
  subtotalMinor: number;
};

export type BillingInvoice = {
  id: string;
  number: string;
  bankReference: string;
  status: string;
  currency: BillingCurrency;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  issuedAt: string;
  dueAt: string;
  graceEndsAt: string | null;
  reviewPauseUntil: string | null;
  paidAt: string | null;
  periodStartsAt: string;
  periodEndsAt: string;
  items: BillingInvoiceItem[];
};

export type BillingBankAccount = {
  id: string;
  code: string;
  bank: string;
  holder: string;
  currency: BillingCurrency;
  accountType: string;
  accountNumber: string;
  instructions: string | null;
};

export type BillingEvidence = {
  id: string;
  originalName: string;
  mimeType: "application/pdf" | "image/jpeg" | "image/png";
  sizeBytes: number;
  createdAt: string;
  signedUrl?: string | null;
};

export type TransferSubmission = {
  id: string;
  invoiceId: string;
  bankAccountId: string;
  status: TransferStatus;
  currency: BillingCurrency;
  amountMinor: number;
  declaredReference: string | null;
  transferredAt: string;
  payerName: string;
  riskFlags: string[] | Record<string, unknown> | null;
  createdAt: string;
  evidence: BillingEvidence[];
};

export type BillingPortal = {
  tenant: BillingTenant;
  account: Record<string, unknown> | null;
  subscription: BillingSubscription | null;
  onboarding: {
    id: string;
    status: string;
    paymentMethod: BillingChannel;
    email: string;
    ownerName: string;
    providerPriceId: string | null;
    expiresAt: string;
  } | null;
  invoices: BillingInvoice[];
  bankAccounts: BillingBankAccount[];
  transferSubmissions: TransferSubmission[];
  policy: {
    documentDisclaimer: string;
    partialPaymentsAccepted: false;
    currencyConversionAccepted: false;
    reviewTargetHours: number;
  };
};

export type BankTransferInput = {
  invoiceId: string;
  bankAccountId: string;
  reference?: string;
  amountMinor: number;
  currency: BillingCurrency;
  transferredAt: string;
  payerName: string;
  sourceAccountLast4?: string;
};

export type TransferQueueItem = {
  id: string;
  status: TransferStatus;
  tenant: Pick<BillingTenant, "id" | "slug" | "name" | "status">;
  invoice: {
    id: string;
    number: string;
    bankReference: string;
    currency: BillingCurrency;
    totalMinor: number;
    dueAt: string;
  };
  bankAccount: {
    id: string;
    bank: string;
    holder: string;
    currency: BillingCurrency;
    accountNumber: string;
  };
  amountMinor: number;
  currency: BillingCurrency;
  declaredReference: string | null;
  transferredAt: string;
  payerName: string;
  sourceLast4: string | null;
  riskFlags: string[] | Record<string, unknown> | null;
  createdAt: string;
  evidence: BillingEvidence[];
};

export type ReviewTransferInput = {
  decision: "APROBADA" | "RECHAZADA";
  confirmedBankReference?: string;
  notes?: string;
};

export type ReviewTransferResult = {
  reviewId: string;
  decision: ReviewTransferInput["decision"];
  paymentId: string | null;
  tenantId?: string;
};

export type TransferQueues = Record<TransferStatus, TransferQueueItem[]>;
