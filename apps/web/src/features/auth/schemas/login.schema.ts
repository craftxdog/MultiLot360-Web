import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Ingresa un correo válido")
    .toLowerCase()
    .trim()
    .min(1, "El correo es requerido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar 72 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
