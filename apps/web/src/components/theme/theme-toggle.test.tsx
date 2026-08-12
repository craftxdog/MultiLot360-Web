import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeToggleView } from "./theme-toggle";

describe("ThemeToggleView", () => {
  it("renders a native mobile selector with all supported themes", () => {
    const html = renderToStaticMarkup(
      createElement(ThemeToggleView, {
        theme: "dark",
        onThemeChange: () => undefined,
      }),
    );

    assert.match(html, /aria-label="Seleccionar tema"/);
    assert.match(html, /value="light"/);
    assert.match(html, /value="dark" selected=""/);
    assert.match(html, /value="system"/);
    assert.match(html, /sm:hidden/);
  });
});
