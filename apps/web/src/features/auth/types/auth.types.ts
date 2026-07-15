export type AuthRole = {
  id: string;
  name: string;
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
  username?: string;
  roleId?: string;
  roleName?: string;
  active?: boolean;
  modules?: string[];
  permissions?: string[];
};

export type AuthMeApiResponse = {
  user: AuthMeApiUser;
  seller?: SellerContext;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  email: string;
  username: string;
  name: string;
  password: string;
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
};

export type RequestPasswordResetPayload = { email: string };
export type RequestPasswordResetResponse = { accepted: true; message: string };
export type ConfirmPasswordResetPayload = {
  email: string;
  code: string;
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
