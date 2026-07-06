import { z } from "zod";

const password = z.string().min(8, "Usa al menos 8 caracteres.").max(72);

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Escribe un correo válido.")),
});

export const confirmPasswordResetSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    code: z.string().regex(/^\d{6}$/, "El código debe contener 6 dígitos."),
    newPassword: password,
    confirmPassword: password,
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export const adminResetPasswordSchema = z
  .object({
    targetUserId: z.uuid(),
    newPassword: password,
    confirmPassword: password,
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });
