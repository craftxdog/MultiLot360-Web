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
  tenant: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim().toLowerCase() : undefined),
    z
      .string()
      .max(80, "El identificador de empresa no puede superar 80 caracteres")
      .regex(
        /^(?:[a-z0-9]+(?:-[a-z0-9]+)*|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i,
        "Usa el slug o UUID válido de la empresa",
      )
      .optional(),
  ),
});

export type LoginInput = z.infer<typeof loginSchema>;
