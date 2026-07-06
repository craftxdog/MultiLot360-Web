import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const numberRegex = /^\d{2}$/;

const validDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const lotteryNumberSchema = z.string().regex(numberRegex, "Usa un número entre 00 y 99.");
export const numberControlIdSchema = z.uuid("Identificador inválido.");

export const createNumberLimitsSchema = z.object({
  sellerId: z.uuid("Selecciona un vendedor válido.").optional(),
  drawConfigurationId: z.uuid("Selecciona un sorteo válido.").optional(),
  numbers: z.array(lotteryNumberSchema).min(1, "Selecciona al menos un número.").max(100),
  limitMiles: z.number().int().min(1, "El límite mínimo es 1.").max(999_999, "El límite máximo es 999,999."),
  validFrom: z.string().regex(dateRegex).refine(validDate, "Ingresa una fecha válida."),
  validUntil: z.string().regex(dateRegex).refine(validDate, "Ingresa una fecha válida.").optional(),
}).refine((value) => !value.validUntil || value.validUntil >= value.validFrom, {
  path: ["validUntil"],
  message: "La fecha final no puede ser anterior a la inicial.",
});

export const updateNumberLimitSchema = z.object({
  sellerId: z.uuid().nullable().optional(),
  drawConfigurationId: z.uuid().nullable().optional(),
  number: lotteryNumberSchema.optional(),
  limitMiles: z.number().int().min(1).max(999_999).optional(),
  validFrom: z.string().regex(dateRegex).refine(validDate).optional(),
  validUntil: z.string().regex(dateRegex).refine(validDate).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, "Envía al menos un cambio.");

export const expireNumberLimitSchema = z.object({
  expiresOn: z.string().regex(dateRegex).refine(validDate, "Ingresa una fecha válida."),
});

export const createBlockedNumbersSchema = z.object({
  numbers: z.array(lotteryNumberSchema).min(1, "Selecciona al menos un número.").max(100),
  shiftId: z.uuid("Selecciona un turno válido.").optional(),
  date: z.string().regex(dateRegex).refine(validDate, "Ingresa una fecha válida.").optional(),
  reason: z.string().trim().max(250, "El motivo no puede superar 250 caracteres.").optional(),
}).superRefine((value, context) => {
  if (Number(Boolean(value.shiftId)) + Number(Boolean(value.date)) !== 1) {
    context.addIssue({
      code: "custom",
      path: [value.shiftId ? "date" : "shiftId"],
      message: "Selecciona una fecha o un turno, pero no ambos.",
    });
  }
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const numberLimitsQuerySchema = paginationSchema.extend({
  sellerId: z.uuid().optional(),
  drawConfigurationId: z.uuid().optional(),
  drawCode: z.string().trim().toLowerCase().max(80).optional(),
  number: lotteryNumberSchema.optional(),
  sellerScope: z.enum(["GLOBAL", "SELLER"]).optional(),
  drawScope: z.enum(["DEFAULT", "DRAW"]).optional(),
  active: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true").optional(),
  validOn: z.string().regex(dateRegex).refine(validDate).optional(),
  sortBy: z.enum(["number", "limitMiles", "validFrom", "validUntil", "drawCode", "createdAt"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export const blockedNumbersQuerySchema = paginationSchema.extend({
  number: lotteryNumberSchema.optional(),
  scope: z.enum(["DATE", "SHIFT"]).optional(),
  shiftId: z.uuid().optional(),
  date: z.string().regex(dateRegex).refine(validDate).optional(),
  drawCode: z.string().trim().toLowerCase().max(80).optional(),
  createdByUserId: z.uuid().optional(),
  sortBy: z.enum(["createdAt", "number", "date", "drawCode"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateNumberLimitsValues = z.infer<typeof createNumberLimitsSchema>;
export type CreateBlockedNumbersValues = z.infer<typeof createBlockedNumbersSchema>;
