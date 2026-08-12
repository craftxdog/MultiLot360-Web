import { z } from "zod";

export const bankTransferSchema = z.object({
  invoiceId: z.uuid(),
  bankAccountId: z.uuid(),
  reference: z.string().trim().max(120).optional(),
  amountMinor: z.number().int().positive(),
  currency: z.enum(["NIO", "USD"]),
  transferredAt: z.iso.datetime(),
  payerName: z.string().trim().min(2).max(160),
  sourceAccountLast4: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Escribe los últimos 4 dígitos")
    .optional()
    .or(z.literal("")),
});

export const reviewTransferSchema = z
  .object({
    decision: z.enum(["APROBADA", "RECHAZADA"]),
    confirmedBankReference: z.string().trim().max(160).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (value) =>
      value.decision !== "APROBADA" ||
      Boolean(value.confirmedBankReference && value.confirmedBankReference.length >= 3),
    {
      path: ["confirmedBankReference"],
      message: "La aprobación exige la referencia confirmada del banco",
    },
  );
