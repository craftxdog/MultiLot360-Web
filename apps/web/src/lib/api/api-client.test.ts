import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError, createApiClient } from "@multilot/api-client";

describe("shared API client", () => {
  it("unwraps the API response envelope", async () => {
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher: async () =>
        Response.json({
          success: true,
          statusCode: 200,
          message: "ok",
          data: { id: "one" },
        }),
    });

    assert.deepEqual(await client.request("/auth/me"), { id: "one" });
  });

  it("preserves status and message for query retry decisions", async () => {
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher: async () =>
        Response.json(
          { message: "Token expired", statusCode: 401 },
          { status: 401 },
        ),
    });

    await assert.rejects(
      client.request("/auth/me"),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 401 &&
        error.message === "Token expired",
    );
  });
});
