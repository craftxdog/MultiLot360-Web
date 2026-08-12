export type AuthRole = {
  id: string;
  name: string;
};

export type TenantContext = {
  id: string;
  slug: string;
  name: string;
  membershipId: string;
  isOwner: boolean;
};

export type AuthUser = {
  id: string;
  authUserId: string | null;
  username: string;
  name: string | null;
  active: boolean;
  role: AuthRole;
  modules: string[];
  permissions: string[];
  tenant?: TenantContext;
  seller?: SellerContext;
};

export type SellerContext = {
  id: string;
  userId?: string;
  name?: string;
  documentId?: string | null;
  phone?: string | null;
  active?: boolean;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "bearer";
  user: AuthUser;
};

export type AuthMeResponse = {
  user: AuthUser;
  seller?: SellerContext;
};

export type AuthMeApiUser = {
  id: string;
  authUserId?: string | null;
  email?: string | null;
  username?: string;
  name?: string | null;
  roleId?: string;
  roleName?: string;
  active?: boolean;
  modules?: string[];
  permissions?: string[];
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  membershipId?: string;
  isOwner?: boolean;
};

export type AuthMeApiResponse = {
  user: AuthMeApiUser;
  seller?: SellerContext;
};

export type LoginPayload = {
  email: string;
  password: string;
  tenant?: string;
};

export type SignupPayload = {
  email: string;
  username: string;
  name: string;
  password: string;
  companyName: string;
  companySlug: string;
  priceId: string;
  paymentMethod: "BANK_TRANSFER" | "PAYPAL" | "DEVELOPMENT";
  timezone: string;
};

export type SignupResponse = {
  onboardingId: string;
  profileId: string;
  state: "PENDING_EMAIL_VERIFICATION";
  tenantState: "PENDIENTE_PAGO";
  paymentMethod: SignupPayload["paymentMethod"];
  emailVerificationRequired: boolean;
  next: string;
};

export type LogoutResponse = {
  signedOut: true;
};

export type ConfirmSellerAccessPayload =
  | { actionToken: string; password: string }
  | { email: string; accessCode: string; password: string };

export type ConfirmSellerAccessResponse = {
  userId: string;
  sellerId: string;
  email: string;
};

export type RefreshSessionPayload = {
  refreshToken: string;
  tenant?: string;
};

export type RequestPasswordResetPayload = { email: string };
export type RequestPasswordResetResponse = { accepted: true; message: string };
export type ConfirmPasswordResetPayload = {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
};
export type ConfirmPasswordResetLinkPayload = {
  tokenHash: string;
  newPassword: string;
  confirmPassword: string;
};
export type ConfirmPasswordResetResponse = {
  passwordUpdated: true;
  sessionsRevoked: true;
};
export type AdminResetPasswordPayload = {
  targetUserId: string;
  newPassword: string;
  confirmPassword: string;
};
export type AdminResetPasswordResponse = ConfirmPasswordResetResponse & {
  targetUser: { id: string; username: string };
};
