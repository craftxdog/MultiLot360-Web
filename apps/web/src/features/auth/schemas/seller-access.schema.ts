import { z } from "zod";

export const sellerAccessSchema = z
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
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede superar 72 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "Confirma tu contraseña")
      .max(72, "La contraseña no puede superar 72 caracteres"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type SellerAccessInput = z.infer<typeof sellerAccessSchema>;
