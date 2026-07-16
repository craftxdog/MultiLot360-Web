const SELLER_DATE_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Managua",
});

export function formatSellerDate(value: string | null) {
  if (!value) return "—";

  return SELLER_DATE_FORMATTER.format(new Date(value)).replace(
    /[\u00a0\u202f]/g,
    " ",
  );
}

export function getSellerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
