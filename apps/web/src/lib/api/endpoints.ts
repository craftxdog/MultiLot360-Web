export const apiEndpoints = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    requestPasswordReset: "/auth/password/reset/request",
    confirmPasswordReset: "/auth/password/reset/confirm",
    confirmPasswordResetLink: "/auth/password/reset/confirm-link",
    adminResetPassword: "/auth/password/reset/admin",
    confirmSellerAccess: "/identity-access/sellers/access-code/confirm",
  },
  billing: {
    plans: "/billing/plans",
    signup: "/billing/signup",
    portal: "/billing/portal",
    initialInvoice: "/billing/portal/invoices/initial",
    paypalCheckout: "/billing/portal/paypal/checkout",
    transfers: "/billing/portal/transfers",
    adminTransfers: "/billing/admin/transfers",
  },
} as const;
