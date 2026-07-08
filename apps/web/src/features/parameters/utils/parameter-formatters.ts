import type {
  ParameterValueKind,
  SystemParameter,
} from "../types/parameter.types";

export function getParameterNamespace(key: string) {
  return key.split(/[._:-]/)[0]?.toLowerCase() || "general";
}

export function formatParameterNamespace(key: string) {
  const namespace = getParameterNamespace(key);

  return namespace.slice(0, 1).toUpperCase() + namespace.slice(1);
}

export function formatParameterLabel(key: string) {
  const segment = key.split(/[.:]/).at(-1) ?? key;
  const words = segment.replace(/[_-]+/g, " ").trim();

  return words.slice(0, 1).toUpperCase() + words.slice(1);
}

export function getParameterValueKind(value: string): ParameterValueKind {
  const normalized = value.trim();

  if (normalized === "true" || normalized === "false") return "boolean";
  if (/^-?\d+(\.\d+)?$/.test(normalized)) return "number";

  try {
    const parsed = JSON.parse(normalized);
    if (parsed !== null && typeof parsed === "object") return "json";
  } catch {
    // Los valores de texto son válidos aunque no sean JSON.
  }

  return "text";
}

export function formatParameterValuePreview(value: string) {
  const normalized = value.trim();
  const kind = getParameterValueKind(normalized);

  if (!normalized) return "Sin valor";
  if (kind === "boolean") return normalized === "true" ? "Activado" : "Desactivado";
  if (kind === "number") return new Intl.NumberFormat("es-NI").format(Number(normalized));

  if (kind === "json") {
    const parsed = JSON.parse(normalized) as unknown;

    if (Array.isArray(parsed)) return `Lista avanzada · ${parsed.length} elementos`;
    if (parsed && typeof parsed === "object") return `Configuración avanzada · ${Object.keys(parsed).length} campos`;
  }

  return normalized.length > 80 ? `${normalized.slice(0, 77)}…` : normalized;
}

export function formatParameterDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Managua",
  }).format(new Date(value));
}

export function countRecentParameters(
  parameters: SystemParameter[],
  now = Date.now(),
) {
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return parameters.filter((parameter) => {
    const updatedAt = new Date(parameter.updatedAt).getTime();
    return Number.isFinite(updatedAt) && now - updatedAt <= sevenDays;
  }).length;
}
