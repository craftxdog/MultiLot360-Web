import { z } from "zod";

export const SYSTEM_PARAMETER_KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.:-]{1,119}$/;

export const parametersQuerySchema = z.object({
  key: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["key", "updatedAt"]).default("key"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
});

export const parameterKeySchema = z.object({
  key: z.string().trim().regex(
    SYSTEM_PARAMETER_KEY_PATTERN,
    "Usa una clave técnica válida, por ejemplo sales.void_window_minutes.",
  ),
});

export const upsertSystemParameterSchema = parameterKeySchema.extend({
  value: z.string().trim().max(2000, "El valor admite hasta 2,000 caracteres."),
});

export type ParameterEditorInput = z.input<typeof upsertSystemParameterSchema>;
export type UpsertSystemParameterPayload = z.output<typeof upsertSystemParameterSchema>;
