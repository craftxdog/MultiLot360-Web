import { browserHttp } from "@/lib/api/browser-http";
import { buildDrawQueryString } from "../utils/draws-query";
import type {
  CreateDrawConfigurationInput,
  CreateDrawShiftInput,
  DrawConfiguration,
  DrawConfigurationsQuery,
  DrawConfigurationsResult,
  DrawOverview,
  DrawShift,
  DrawShiftsQuery,
  DrawShiftsResult,
  UpdateDrawConfigurationInput,
} from "../types/draws.types";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const drawsService = {
  getConfigurations(query: DrawConfigurationsQuery = {}) {
    return browserHttp<DrawConfigurationsResult>(
      `/api/draws/configurations${buildDrawQueryString(query)}`,
    );
  },

  getConfiguration(configurationId: string) {
    return browserHttp<DrawConfiguration>(
      `/api/draws/configurations/${configurationId}`,
    );
  },

  createConfiguration(input: CreateDrawConfigurationInput) {
    return browserHttp<DrawConfiguration>("/api/draws/configurations", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });
  },

  updateConfiguration(
    configurationId: string,
    input: UpdateDrawConfigurationInput,
  ) {
    return browserHttp<DrawConfiguration>(
      `/api/draws/configurations/${configurationId}`,
      {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify(input),
      },
    );
  },

  getActiveShifts(query: Omit<DrawShiftsQuery, "status"> = {}) {
    return browserHttp<DrawShiftsResult>(
      `/api/draws/shifts/active${buildDrawQueryString(query)}`,
    );
  },

  getShifts(query: DrawShiftsQuery = {}) {
    return browserHttp<DrawShiftsResult>(
      `/api/draws/shifts${buildDrawQueryString(query)}`,
    );
  },

  createShift(input: CreateDrawShiftInput) {
    return browserHttp<DrawShift>("/api/draws/shifts", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });
  },

  blockShift(shiftId: string) {
    return browserHttp<DrawShift>(`/api/draws/shifts/${shiftId}/block`, {
      method: "PATCH",
    });
  },

  reopenShift(shiftId: string) {
    return browserHttp<DrawShift>(`/api/draws/shifts/${shiftId}/reopen`, {
      method: "PATCH",
    });
  },

  closeShift(shiftId: string) {
    return browserHttp<DrawShift>(`/api/draws/shifts/${shiftId}/close`, {
      method: "PATCH",
    });
  },

  getOverview() {
    return browserHttp<DrawOverview>("/api/draws/overview");
  },
};
