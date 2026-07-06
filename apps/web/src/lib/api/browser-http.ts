import { ApiError } from "@multilot/api-client";

export async function browserHttp<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    cache: init?.cache ?? "no-store",
    credentials: init?.credentials ?? "same-origin",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const payload = response.status === 204
    ? undefined
    : await response.json().catch(() => undefined);

  if (!response.ok) {
    const rawMessage =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : undefined;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : typeof rawMessage === "string"
        ? rawMessage
        : "No fue posible completar la solicitud.";

    throw new ApiError(message, {
      status: response.status,
      payload,
    });
  }

  return payload as T;
}
