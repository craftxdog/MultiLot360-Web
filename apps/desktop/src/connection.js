export const desktopUrlStorageKey = "multilot360.desktop.url";

export function normalizeDesktopUrl(value) {
  const url = new URL(String(value).trim());

  if (!["https:", "http:"].includes(url.protocol) || !url.hostname) {
    throw new Error("invalid-url");
  }

  if (url.username || url.password) {
    throw new Error("credentials-not-allowed");
  }

  return url.toString();
}

export function readSavedDesktopUrl(storage) {
  try {
    const savedUrl = storage.getItem(desktopUrlStorageKey);
    return savedUrl ? normalizeDesktopUrl(savedUrl) : null;
  } catch {
    return null;
  }
}

export function saveDesktopUrl(storage, url) {
  try {
    storage.setItem(desktopUrlStorageKey, url);
  } catch {
    // Navigation must still work when WebView storage is unavailable.
  }
}

export function setupConnectionScreen({
  document,
  storage,
  navigate,
}) {
  const input = document.querySelector("#server-url");
  const form = document.querySelector("#connect-form");
  const message = document.querySelector("#message");

  if (!input || !form || !message) {
    throw new Error("Desktop connection screen is incomplete");
  }

  const savedUrl = readSavedDesktopUrl(storage);
  if (savedUrl) input.value = savedUrl;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";

    try {
      const url = normalizeDesktopUrl(input.value);
      saveDesktopUrl(storage, url);
      navigate(url);
    } catch {
      message.textContent =
        "Escribe una URL válida: HTTPS o HTTP únicamente para desarrollo local.";
    }
  });
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  setupConnectionScreen({
    document,
    storage: window.localStorage,
    navigate: (url) => window.location.assign(url),
  });
}
