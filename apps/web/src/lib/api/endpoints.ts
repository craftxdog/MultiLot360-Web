export const apiEndpoints = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    requestPasswordReset: "/auth/password/reset/request",
    confirmPasswordReset: "/auth/password/reset/confirm",
    confirmPasswordResetLink: "/auth/password/reset/confirm-link",
    adminResetPassword: "/auth/password/reset/admin",
    confirmSellerAccess: "/identity-access/sellers/access-code/confirm",
  },
} as const;
