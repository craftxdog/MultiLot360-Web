import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { initialSellerAccessState } from "../services/seller-access.client";
import { SellerAccessFormView } from "./seller-access-form";

const token = "C".repeat(43);

describe("SellerAccessFormView", () => {
  it("asks only for password fields in token mode", () => {
    const html = render({ actionToken: token, manualMode: false });
    assert.doesNotMatch(html, /name="email"|name="accessCode"/);
    assert.match(html, /name="password"/);
    assert.match(html, /name="confirmPassword"/);
    assert.doesNotMatch(html, new RegExp(token));
  });

  it("keeps the manual email and accessCode mode", () => {
    const html = render({ manualMode: true });
    assert.match(html, /name="email"/);
    assert.match(html, /name="accessCode"/);
  });

  it("renders invalid, loading and generic API error states", () => {
    assert.match(render({ manualMode: true, invalidToken: true }), /El enlace no es válido/);
    assert.match(render({ manualMode: false, actionToken: token, pending: true }), /Activando acceso/);
    assert.match(render({
      manualMode: false,
      actionToken: token,
      state: { status: "error", message: "No pudimos validar la invitación.", errors: {} },
    }), /No pudimos validar la invitación/);
  });
});

function render(overrides: Partial<Parameters<typeof SellerAccessFormView>[0]>) {
  return renderToStaticMarkup(createElement(SellerAccessFormView, {
    state: initialSellerAccessState,
    pending: false,
    manualMode: true,
    ...overrides,
  }));
}
