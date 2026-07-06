import { z } from "zod";

const numberSchema = z.string().regex(/^\d{2}$/, "El número debe estar entre 00 y 99.");
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const saleIdSchema = z.uuid("Venta inválida.");
export const saleItemSchema = z.object({
  number: numberSchema,
  prizeMiles: z.number().int().min(1, "El monto mínimo es 1.").max(999_999, "El monto máximo es 999,999."),
});

export const createSaleSchema = z.object({
  sellerId: z.uuid("Selecciona un vendedor válido.").optional(),
  shiftId: z.uuid("Selecciona un turno activo."),
  items: z.array(saleItemSchema).min(1, "Agrega al menos una jugada.").max(100, "Un ticket admite hasta 100 números."),
});

export const voidSaleSchema = z.object({
  reason: z.string().trim().min(5, "Explica brevemente el motivo.").max(250, "El motivo no puede superar 250 caracteres."),
});

export const salesVoidPolicySchema = z.object({
  windowMinutes: z.coerce.number().int().min(1, "El mínimo es un minuto.").max(1440, "El máximo es 24 horas."),
});

export const salesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sellerId: z.uuid().optional(),
  shiftId: z.uuid().optional(),
  date: dateSchema.optional(),
  drawCode: z.string().trim().toLowerCase().max(80).optional(),
  number: numberSchema.optional(),
  status: z.enum(["ACTIVA", "ANULADA"]).optional(),
  sortBy: z.enum(["createdAt", "totalMiles", "status", "date", "drawCode", "sellerName"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateSaleValues = z.infer<typeof createSaleSchema>;
