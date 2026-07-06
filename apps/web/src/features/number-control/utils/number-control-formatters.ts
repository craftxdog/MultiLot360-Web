const DATE_FORMATTER = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Managua" });

export function formatControlDate(value: string) {
  return DATE_FORMATTER.format(new Date(`${value}T00:00:00.000Z`));
}

export function formatControlDateTime(value: string) {
  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function formatLimitMiles(value: number) {
  return new Intl.NumberFormat("es-NI").format(value);
}

export function getTodayInManagua() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function isNumberLimitActive(validFrom: string, validUntil: string | null, today = getTodayInManagua()) {
  return validFrom <= today && (!validUntil || validUntil >= today);
}
