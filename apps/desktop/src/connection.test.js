import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  desktopUrlStorageKey,
  normalizeDesktopUrl,
  readSavedDesktopUrl,
  saveDesktopUrl,
  setupConnectionScreen,
} from "./connection.js";

function connectionScreen() {
  const handlers = new Map();
  const elements = {
    "#server-url": { value: "" },
    "#connect-form": {
      addEventListener(name, handler) {
        handlers.set(name, handler);
      },
    },
    "#message": { textContent: "" },
  };

  return {
    document: { querySelector: (selector) => elements[selector] ?? null },
    elements,
    submit() {
      handlers.get("submit")?.({ preventDefault() {} });
    },
  };
}

describe("desktop connection screen", () => {
  it("normalizes supported web URLs and rejects unsafe destinations", () => {
    assert.equal(normalizeDesktopUrl(" https://multilot.example "), "https://multilot.example/");
    assert.equal(normalizeDesktopUrl("http://localhost:8080"), "http://localhost:8080/");
    assert.throws(() => normalizeDesktopUrl("javascript:alert(1)"));
    assert.throws(() => normalizeDesktopUrl("file:///tmp/multilot"));
    assert.throws(() => normalizeDesktopUrl("https://user:secret@example.com"));
  });

  it("keeps working when WebView storage is blocked", () => {
    const blockedStorage = {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); },
    };

    assert.equal(readSavedDesktopUrl(blockedStorage), null);
    assert.doesNotThrow(() => saveDesktopUrl(blockedStorage, "https://multilot.example/"));
  });

  it("restores a safe URL and navigates after validation", () => {
    const screen = connectionScreen();
    const writes = [];
    const navigations = [];
    const storage = {
      getItem: (key) => key === desktopUrlStorageKey ? "https://multilot.example" : null,
      setItem: (key, value) => writes.push([key, value]),
    };

    setupConnectionScreen({
      document: screen.document,
      storage,
      navigate: (url) => navigations.push(url),
    });
    assert.equal(screen.elements["#server-url"].value, "https://multilot.example/");

    screen.elements["#server-url"].value = "http://localhost:8080";
    screen.submit();

    assert.deepEqual(writes, [[desktopUrlStorageKey, "http://localhost:8080/"]]);
    assert.deepEqual(navigations, ["http://localhost:8080/"]);
    assert.equal(screen.elements["#message"].textContent, "");
  });

  it("shows a controlled error and never navigates for an invalid URL", () => {
    const screen = connectionScreen();
    const navigations = [];
    setupConnectionScreen({
      document: screen.document,
      storage: { getItem: () => null, setItem() {} },
      navigate: (url) => navigations.push(url),
    });

    screen.elements["#server-url"].value = "file:///etc/passwd";
    screen.submit();

    assert.deepEqual(navigations, []);
    assert.match(screen.elements["#message"].textContent, /URL válida/);
  });
});
