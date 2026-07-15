import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede superar 72 caracteres");

export const sellerActionTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, "El enlace de activación no es válido");

export const manualSellerAccessSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "El correo es requerido")
      .email("Ingresa un correo válido"),
    accessCode: z
      .string()
      .regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const tokenSellerAccessSchema = z
  .object({
    actionToken: sellerActionTokenSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const sellerAccessConfirmPayloadSchema = z.union([
  z.object({
    actionToken: sellerActionTokenSchema,
    password: passwordSchema,
  }).strict(),
  z.object({
    email: z.string().trim().toLowerCase().email(),
    accessCode: z.string().regex(/^\d{6}$/),
    password: passwordSchema,
  }).strict(),
]);

export type ManualSellerAccessInput = z.infer<typeof manualSellerAccessSchema>;
export type TokenSellerAccessInput = z.infer<typeof tokenSellerAccessSchema>;
