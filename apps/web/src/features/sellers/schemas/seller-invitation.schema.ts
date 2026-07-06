import { isValidPhoneNumber } from "libphonenumber-js/min";
import { z } from "zod";
import { sellerInvitationStatuses } from "../types/seller.types";

export const sellerIdSchema = z.uuid("Vendedor inválido.");

function normalizePhone(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return undefined;
  }

  const localDigits = digits.startsWith("505") ? digits.slice(3) : digits;

  if (!localDigits) {
    return undefined;
  }

  return `+505${localDigits.slice(0, 8)}`;
}

export const createSellerInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo válido"),

  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(80, "El usuario no puede superar 80 caracteres")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Solo letras, números, punto, guion y guion bajo",
    ),

  sellerName: z
    .string()
    .trim()
    .min(2, "El nombre del vendedor es requerido")
    .max(120, "El nombre no puede superar 120 caracteres"),

  documentId: z
    .string()
    .trim()
    .min(1, "La cédula es requerida")
    .regex(
      /^\d{3}-\d{6}-\d{4}[a-zA-Z]$/,
      "Formato esperado: 001-010190-0001A",
    ),

  phone: z.preprocess(
    normalizePhone,
    z
      .string()
      .optional()
      .refine(
        (value) => !value || isValidPhoneNumber(value),
        "Ingresa un teléfono válido de Nicaragua",
      ),
  ),

  address: z
    .string()
    .trim()
    .max(240, "La dirección no puede superar 240 caracteres")
    .optional()
    .transform((value) => (value ? value : undefined)),

  roleName: z
    .enum(["VENDEDOR", "ADMIN"], {
      message: "Selecciona un rol válido",
    })
    .default("VENDEDOR"),
});

export const resendSellerCodeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo válido"),
});

export const revokeSellerInvitationSchema = z.object({
  invitationId: z.uuid("Invitación inválida"),
});

export type CreateSellerInvitationInput = z.infer<
  typeof createSellerInvitationSchema
>;
export type CreateSellerInvitationFormInput = z.input<
  typeof createSellerInvitationSchema
>;

export const sellerInvitationsQuerySchema = z.object({
  email: z.email().trim().toLowerCase().optional(),
  username: z.string().trim().max(80).optional(),
  sellerName: z.string().trim().max(120).optional(),
  status: z.enum(sellerInvitationStatuses).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().trim().optional(),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type SellerInvitationsQueryInput = z.infer<
  typeof sellerInvitationsQuerySchema
>;
