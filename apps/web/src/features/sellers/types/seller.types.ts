export const sellerInvitationStatuses = [
  "PENDIENTE",
  "USADO",
  "EXPIRADO",
  "REVOCADO",
] as const;

export type SellerInvitationStatus =
  (typeof sellerInvitationStatuses)[number];

export type SellerInvitationCreatedBy = {
  userId: string;
  username: string;
  name: string | null;
};

export type SellerInvitation = {
  id: string;
  userId: string;
  sellerId: string;
  email: string;
  username: string;
  sellerName: string;
  documentId: string;
  status: SellerInvitationStatus;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  createdBy: SellerInvitationCreatedBy | null;
};

export type SellerInvitationsQuery = {
  email?: string;
  username?: string;
  sellerName?: string;
  status?: SellerInvitationStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};

export type SellerOverview = {
  total: number;
  pending: number;
  activated: number;
  expired: number;
  revoked: number;
  isPartial: boolean;
};

export type SellerPagination = {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type SellerInvitationsResult = {
  invitations: SellerInvitation[];
  pagination: SellerPagination;
};

export type SellerDirectoryItem = {
  id: string;
  userId: string;
  username: string;
  userName: string | null;
  roleId: string;
  roleName: string;
  name: string;
  documentId: string;
  phone: string | null;
  address: string | null;
  active: boolean;
  userActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SellerDirectoryQuery = { search?: string; active?: boolean; page?: number; limit?: number; sortBy?: string; sortDirection?: "asc" | "desc" };
export type SellerDirectoryResult = { sellers: SellerDirectoryItem[]; pagination: SellerPagination };

export type CreateSellerInvitationPayload = {
  email: string;
  username: string;
  sellerName: string;
  documentId: string;
  phone?: string;
  address?: string;
  roleName?: string;
};

export type SellerInvitationResponse = {
  userId: string;
  sellerId: string;
  email: string;
  sellerName: string;
  expiresAt: string;
};

export type ResendSellerAccessCodeResponse = {
  userId: string;
  sellerId: string;
  email: string;
  sellerName: string;
  expiresAt: string;
};

export type RevokeSellerInvitationResponse = {
  id?: string;
  userId?: string;
  sellerId?: string;
  email?: string;
  status?: SellerInvitationStatus;
};

export type SellerMutationResponse = {
  id?: string;
  userId?: string;
  active?: boolean;
  userActive?: boolean;
  deleted?: boolean;
};
