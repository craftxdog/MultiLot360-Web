export type ApiPaginationMeta = {
  strategy: string;
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};

export type ApiMeta = {
  request?: unknown;
  actor?: unknown;
  pagination?: ApiPaginationMeta;
};

export type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiRequestOptions = RequestInit & {
  token?: string;
};

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  code?: string;
};

type ApiClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly payload: unknown;

  constructor(
    message: string,
    options: { status: number; code?: string; payload?: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.payload = options.payload;
  }

  isStatus(...statuses: number[]) {
    return statuses.includes(this.status);
  }
}

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    payload !== null &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  );
}

function getErrorMessage(payload: unknown, status: number) {
  if (!payload || typeof payload !== "object") {
    return `La solicitud falló con estado ${status}.`;
  }

  const error = payload as ApiErrorPayload;

  if (Array.isArray(error.message)) {
    return error.message.join(", ");
  }

  return error.message ?? error.error ?? `La solicitud falló con estado ${status}.`;
}

function combineSignals(signal: AbortSignal | null | undefined, timeoutMs: number) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

export function createApiClient({
  baseUrl,
  timeoutMs = 10_000,
  fetcher = fetch,
}: ApiClientOptions) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  async function requestEnvelope<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiEnvelope<T>> {
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");

    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (options.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    const { token: _token, ...requestOptions } = options;
    let response: Response;

    try {
      response = await fetcher(new URL(path.replace(/^\//, ""), normalizedBaseUrl), {
        ...requestOptions,
        headers,
        cache: requestOptions.cache ?? "no-store",
        signal: combineSignals(requestOptions.signal, timeoutMs),
      });
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "TimeoutError";

      throw new ApiError(
        timedOut
          ? "La API tardó demasiado en responder."
          : "No fue posible conectar con la API.",
        {
          status: 0,
          code: timedOut ? "TIMEOUT" : "NETWORK_ERROR",
          payload: error,
        },
      );
    }

    const payload = response.status === 204
      ? undefined
      : await response.json().catch(() => undefined);

    if (!response.ok) {
      const errorPayload = payload as ApiErrorPayload | undefined;

      throw new ApiError(getErrorMessage(payload, response.status), {
        status: response.status,
        code: errorPayload?.code,
        payload,
      });
    }

    if (isApiEnvelope<T>(payload)) {
      if (!payload.success) {
        throw new ApiError(payload.message, {
          status: payload.statusCode,
          payload,
        });
      }

      return payload;
    }

    return {
      success: true,
      statusCode: response.status,
      message: "Request completed successfully",
      data: payload as T,
    };
  }

  async function request<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return (await requestEnvelope<T>(path, options)).data;
  }

  return {
    request,
    requestEnvelope,
  };
}
