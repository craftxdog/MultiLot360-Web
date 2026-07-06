export type SortDirection = "asc" | "desc";

export type DrawShiftStatus = "ABIERTO" | "BLOQUEO" | "CERRADO";
export type DrawShiftAction = "block" | "reopen" | "close";
export type DrawsTab = "active" | "shifts" | "configurations";

export type DrawConfigurationSortBy =
  | "code"
  | "time"
  | "active"
  | "createdAt"
  | "updatedAt";

export type DrawShiftSortBy =
  | "date"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "configurationTime"
  | "configurationCode";

export type DrawConfiguration = {
  id: string;
  code: string;
  time: string;
  tuesdayOnly: boolean;
  lockSecondsBefore: number;
  reopenSecondsAfter: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DrawShift = {
  id: string;
  date: string;
  status: DrawShiftStatus;
  createdAt: string;
  updatedAt: string;
  configuration: DrawConfiguration;
};

export type DrawConfigurationsQuery = {
  page?: number;
  limit?: number;
  sortBy?: DrawConfigurationSortBy;
  sortDirection?: SortDirection;
  active?: boolean;
};

export type DrawShiftsQuery = {
  page?: number;
  limit?: number;
  sortBy?: DrawShiftSortBy;
  sortDirection?: SortDirection;
  date?: string;
  status?: DrawShiftStatus;
};

export type DrawPagination = {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type DrawConfigurationsResult = {
  configurations: DrawConfiguration[];
  pagination: DrawPagination;
};

export type DrawShiftsResult = {
  shifts: DrawShift[];
  pagination: DrawPagination;
};

export type DrawOverview = {
  open: number;
  blocked: number;
  closed: number;
  activeConfigurations: number;
};

export type DrawWorkspaceQuery = {
  view: DrawsTab;
  page: number;
  limit: number;
  date?: string;
  status?: DrawShiftStatus;
  active?: boolean;
};

export type CreateDrawConfigurationInput = {
  code: string;
  time: string;
  tuesdayOnly: boolean;
  lockSecondsBefore: number;
  reopenSecondsAfter: number;
  active: boolean;
};

export type UpdateDrawConfigurationInput =
  Partial<CreateDrawConfigurationInput>;

export type CreateDrawShiftInput = {
  configurationId: string;
  date: string;
};
