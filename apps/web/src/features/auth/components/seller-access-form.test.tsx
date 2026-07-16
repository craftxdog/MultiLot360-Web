import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { initialSellerAccessState } from "../services/seller-access.client";
import { SellerAccessFormView } from "./seller-access-form";

const token = "C".repeat(43);

describe("SellerAccessFormView", () => {
  it("applies invitation context automatically without submitting sensitive fields", () => {
    const html = render({ actionToken: token, manualMode: false });
    assert.doesNotMatch(html, /name="email"|name="accessCode"/);
    assert.match(html, /Verificado por enlace seguro/);
    assert.match(html, /Aplicado automáticamente/);
    assert.equal((html.match(/readOnly=""/g) ?? []).length, 2);
    assert.match(html, /name="password"/);
    assert.match(html, /name="confirmPassword"/);
    assert.doesNotMatch(html, new RegExp(token));
  });

  it("keeps URL-provided legacy email and accessCode readonly", () => {
    const html = render({
      manualMode: true,
      initialEmail: "seller@example.com",
      initialAccessCode: "123456",
    });
    assert.match(html, /name="email"/);
    assert.match(html, /name="accessCode"/);
    assert.match(html, /value="seller@example.com"/);
    assert.match(html, /value="123456"/);
    assert.equal((html.match(/readOnly=""/g) ?? []).length, 2);
  });

  it("always offers the login route", () => {
    const html = render({ manualMode: false, actionToken: token });
    assert.match(html, /href="\/login"/);
    assert.match(html, /Iniciar sesión/);
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
