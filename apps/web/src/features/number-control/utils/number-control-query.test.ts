import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildNumberControlWorkspaceHref, normalizeLotteryNumber, parseNumberControlWorkspaceQuery } from "./number-control-query";

describe("number control query", () => {
  it("normalizes one digit without accepting extra characters", () => {
    assert.equal(normalizeLotteryNumber("7"), "07");
    assert.equal(normalizeLotteryNumber("a-42"), "42");
  });

  it("falls back safely for invalid pagination and filters", () => {
    const parsed = parseNumberControlWorkspaceQuery(new URLSearchParams("view=blocked&page=-1&number=7"), "limits");
    assert.equal(parsed.view, "blocked");
    assert.equal(parsed.page, 1);
    assert.equal(parsed.number, undefined);
  });

  it("keeps only active workspace filters in the URL", () => {
    const href = buildNumberControlWorkspaceHref("/control-numerico", { view: "limits", page: 1, limit: 10, active: true }, { page: 2, number: "02" });
    assert.equal(href, "/control-numerico?view=limits&page=2&number=02&active=true");
  });
});
