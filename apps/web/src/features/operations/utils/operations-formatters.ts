const OPERATION_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-NI", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Managua",
});

export function formatOperationDateTime(value: string) {
  return OPERATION_DATE_TIME_FORMATTER.format(new Date(value));
}
