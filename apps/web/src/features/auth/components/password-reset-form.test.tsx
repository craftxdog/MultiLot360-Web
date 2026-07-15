import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PasswordResetFormView } from "./password-reset-form";

describe("PasswordResetFormView", () => {
  it("renders loading without an RSC error boundary", () => {
    const html = render({ phase: "request", email: "user@example.com" }, true);
    assert.match(html, /Procesando/);
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /disabled/);
  });

  it("renders a controlled error", () => {
    const html = render({ phase: "request", email: "user@example.com", message: "Intenta nuevamente." }, false);
    assert.match(html, /Intenta nuevamente/);
    assert.match(html, /Enviar código/);
  });

  it("renders the success state", () => {
    const html = render({ phase: "done", email: "user@example.com", message: "Solicitud procesada." }, false);
    assert.match(html, /Solicitud procesada/);
    assert.match(html, /Iniciar sesión/);
  });
});

function render(state: Parameters<typeof PasswordResetFormView>[0]["state"], pending: boolean) {
  return renderToStaticMarkup(createElement(PasswordResetFormView, { state, pending }));
}
