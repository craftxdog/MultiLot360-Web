import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDrawQueryString,
  buildDrawWorkspaceHref,
  parseDrawWorkspaceQuery,
} from "./draws-query";

describe("draw workspace query", () => {
  it("parses filters and clamps unsafe pagination", () => {
    const query = parseDrawWorkspaceQuery(
      new URLSearchParams({
        view: "shifts",
        page: "-5",
        limit: "500",
        date: "invalid",
        status: "BLOQUEO",
      }),
      "active",
    );

    assert.deepEqual(query, {
      view: "shifts",
      page: 1,
      limit: 10,
      date: undefined,
      status: "BLOQUEO",
      active: undefined,
    });
  });

  it("serializes API and workspace parameters without empty values", () => {
    assert.equal(
      buildDrawQueryString({ page: 2, active: false, sortBy: "time" }),
      "?page=2&active=false&sortBy=time",
    );
    assert.equal(
      buildDrawWorkspaceHref(
        "/turnos",
        { view: "active", page: 1, limit: 10 },
        { view: "shifts", page: 3, status: "CERRADO" },
      ),
      "/turnos?view=shifts&page=3&status=CERRADO",
    );
  });
});
