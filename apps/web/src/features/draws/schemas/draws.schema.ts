import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const codeRegex = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

const validDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const drawConfigurationSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "El código debe tener al menos 3 caracteres.")
    .max(80, "El código es demasiado largo.")
    .toLowerCase()
    .regex(codeRegex, "Usa letras, números, punto, guion o guion bajo."),

  time: z
    .string()
    .trim()
    .regex(timeRegex, "La hora debe tener formato HH:mm o HH:mm:ss."),

  tuesdayOnly: z.boolean(),

  lockSecondsBefore: z
    .number("Debe ser un número válido.")
    .int("Debe ser un número entero.")
    .min(0, "No puede ser negativo.")
    .max(3600, "No puede superar una hora."),

  reopenSecondsAfter: z
    .number("Debe ser un número válido.")
    .int("Debe ser un número entero.")
    .min(0, "No puede ser negativo.")
    .max(86400, "No puede superar 24 horas."),

  active: z.boolean(),
});

export const createDrawShiftSchema = z.object({
  configurationId: z.uuid("Selecciona una configuración válida."),

  date: z
    .string()
    .regex(dateRegex, "La fecha debe tener formato YYYY-MM-DD.")
    .refine(validDate, "Ingresa una fecha válida."),
});

export const updateDrawConfigurationSchema = drawConfigurationSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Envía al menos un cambio.");

export const drawConfigurationIdSchema = z.uuid("Configuración inválida.");
export const drawShiftIdSchema = z.uuid("Turno inválido.");

export const drawConfigurationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["code", "time", "active", "createdAt", "updatedAt"]).default("time"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  active: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true")
    .optional(),
});

export const drawShiftsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["date", "status", "createdAt", "updatedAt", "configurationTime", "configurationCode"])
    .default("date"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  date: z.string().regex(dateRegex).refine(validDate).optional(),
  status: z.enum(["ABIERTO", "BLOQUEO", "CERRADO"]).optional(),
});

export type DrawConfigurationFormValues = z.infer<
  typeof drawConfigurationSchema
>;

export type CreateDrawShiftFormValues = z.infer<typeof createDrawShiftSchema>;
