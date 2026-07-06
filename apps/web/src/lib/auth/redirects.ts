export function getSafeRedirectPath(
  value: FormDataEntryValue | null,
  fallback = "/dashboard",
) {
  if (typeof value !== "string") {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
