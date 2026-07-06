import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .email("Ingresa un correo válido")
    .toLowerCase()
    .trim()
    .min(1, "El correo es requerido"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50, "El usuario no puede superar 50 caracteres")
    .regex(
      /^[a-z0-9._-]+$/,
      "El usuario solo puede contener minúsculas, números, punto, guion y guion bajo",
    ),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar 120 caracteres")
    .trim(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar 72 caracteres"),
  confirmPassword: z
    .string()
    .min(8, "Confirma tu contraseña")
    .max(72, "La contraseña no puede superar 72 caracteres"),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden",
});

export type SignupInput = z.infer<typeof signupSchema>;
