const DATE = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const DATE_TIME = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Managua" });

export function formatSaleDate(value: string) {
  return DATE.format(new Date(`${value}T00:00:00.000Z`));
}

export function formatSaleDateTime(value: string) {
  return DATE_TIME.format(new Date(value));
}

export function formatMiles(value: number) {
  return new Intl.NumberFormat("es-NI").format(value);
}

export function getSalesToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function getVoidDeadline(createdAt: string, windowMinutes: number) {
  return new Date(new Date(createdAt).getTime() + windowMinutes * 60_000);
}

export function canVoidBefore(createdAt: string, windowMinutes: number, now = new Date()) {
  return now <= getVoidDeadline(createdAt, windowMinutes);
}
