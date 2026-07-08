import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatParameterValuePreview,
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

  it("formats values for operators without exposing raw advanced payloads", () => {
    assert.equal(formatParameterValuePreview("true"), "Activado");
    assert.equal(formatParameterValuePreview("false"), "Desactivado");
    assert.equal(formatParameterValuePreview("1000"), "1,000");
    assert.equal(formatParameterValuePreview('{"enabled":true,"limit":10}'), "Configuración avanzada · 2 campos");
    assert.equal(formatParameterValuePreview("[1,2,3]"), "Lista avanzada · 3 elementos");
  });
});
