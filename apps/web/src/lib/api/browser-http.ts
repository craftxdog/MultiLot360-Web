import { ApiError } from "@multilot/api-client";

export async function browserHttp<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "No fue posible completar la solicitud.";

    throw new ApiError(message, {
      status: response.status,
      payload,
    });
  }

  return payload as T;
}
