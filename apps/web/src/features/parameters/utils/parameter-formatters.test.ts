import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getParameterNamespace,
  getParameterValueKind,
} from "./parameter-formatters";

describe("system parameter formatting", () => {
  it("infers namespaces and value types without changing the raw value", () => {
    assert.equal(getParameterNamespace("sales.void_window_minutes"), "sales");
    assert.equal(getParameterValueKind("true"), "boolean");
    assert.equal(getParameterValueKind("10.5"), "number");
    assert.equal(getParameterValueKind('{"enabled":true}'), "json");
    assert.equal(getParameterValueKind("manual"), "text");
  });
});
