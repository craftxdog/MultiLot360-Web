import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DrawsSmoothTabs } from "./draws-smooth-tabs";

describe("DrawsSmoothTabs", () => {
  it("keeps the three operational views within the available mobile width", () => {
    const html = renderToStaticMarkup(
      createElement(DrawsSmoothTabs, {
        value: "configurations",
        options: [
          { label: "Activos", value: "active" },
          { label: "Historial", value: "shifts" },
          { label: "Configuraciones", mobileLabel: "Ajustes", value: "configurations" },
        ],
        onChange: () => undefined,
      }),
    );

    assert.match(html, /flex w-full/);
    assert.equal((html.match(/flex-1/g) ?? []).length, 3);
    assert.equal((html.match(/min-w-0/g) ?? []).length, 3);
    assert.match(html, /px-2 text-xs[\s\S]*sm:px-4 sm:text-sm/);
    assert.match(html, /aria-label="Configuraciones"/);
    assert.match(html, />Ajustes<\/span>/);
  });
});
