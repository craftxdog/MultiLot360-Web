import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError, createApiClient } from "./http";

describe("API client timeout", () => {
  it("supports a shorter request-specific timeout without changing the client default", async () => {
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      timeoutMs: 1_000,
      fetcher: ((_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), {
            once: true,
          });
        })) as typeof fetch,
    });

    await assert.rejects(
      client.request("/slow", { timeoutMs: 5 }),
      (error: unknown) =>
        error instanceof ApiError && error.code === "TIMEOUT" && error.status === 0,
    );
  });
});
