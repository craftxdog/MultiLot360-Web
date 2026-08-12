import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PasswordResetFormView } from "./password-reset-form";

describe("PasswordResetFormView", () => {
  it("renders the linked email as readonly in confirmation mode", () => {
    const html = renderToStaticMarkup(createElement(PasswordResetFormView, {
      state: { phase: "confirm", email: "user@example.com" },
      pending: false,
    }));

    assert.match(html, /value="user@example.com"/);
    assert.match(html, /readOnly=""/);
    assert.match(html, /name="code"/);
    assert.match(html, /href="\/login"/);
  });

  it("locks every editable confirmation field while loading", () => {
    const html = renderToStaticMarkup(createElement(PasswordResetFormView, {
      state: { phase: "confirm", email: "user@example.com" },
      pending: true,
    }));

    assert.match(html, /Procesando\.\.\./);
    assert.equal((html.match(/disabled=""/g) ?? []).length, 4);
    assert.match(html, /aria-busy="true"/);
  });

  it("uses secure-link mode without rendering the OTP or token hash", () => {
    const html = renderToStaticMarkup(createElement(PasswordResetFormView, {
      state: { phase: "confirm-link", email: "user@example.com" },
      pending: false,
      onUseManual: () => undefined,
    }));

    assert.match(html, /Nueva contraseña/);
    assert.match(html, /Usar el código temporal del correo/);
    assert.match(html, /Solicitar un enlace y código nuevos/);
    assert.doesNotMatch(html, /name="code"/);
    assert.doesNotMatch(html, /recovery_token|tokenHash/);
  });

  it("keeps a request failure inside the form", () => {
    const html = renderToStaticMarkup(createElement(PasswordResetFormView, {
      state: {
        phase: "request",
        email: "user@example.com",
        message: "Intenta nuevamente.",
        error: true,
      },
      pending: false,
    }));

    assert.match(html, /Intenta nuevamente/);
    assert.match(html, /role="alert"/);
    assert.match(html, /Enviar código/);
  });

  it("shows success without exposing recovery credentials", () => {
    const html = renderToStaticMarkup(createElement(PasswordResetFormView, {
      state: {
        phase: "done",
        email: "user@example.com",
        message: "Contraseña actualizada.",
      },
      pending: false,
    }));

    assert.match(html, /Contraseña actualizada/);
    assert.match(html, /Continuar al inicio de sesión/);
    assert.match(html, /cerramos las sesiones anteriores/);
    assert.doesNotMatch(html, /name="code"/);
  });
});
