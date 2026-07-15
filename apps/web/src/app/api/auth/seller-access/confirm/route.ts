import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { sellerAccessConfirmPayloadSchema } from "@/features/auth/schemas/seller-access.schema";
import { authService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api/http";
import { isTrustedMutationOrigin } from "@/lib/security/mutation-origin";

const GENERIC_INVITATION_ERROR =
  "No pudimos validar la invitación. Usa el código manual o solicita un nuevo enlace a tu administrador.";

function response<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    if (!isTrustedMutationOrigin(request.url, request.headers.get("origin"))) {
      return response({ message: "Origen de solicitud no permitido." }, 403);
    }

    const input = sellerAccessConfirmPayloadSchema.parse(await request.json());
    const result = await authService.confirmSellerAccess(input);
    return response(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return response({ message: "Revisa los datos enviados." }, 400);
    }

    if (error instanceof ApiError) {
      const status = [400, 401, 404, 409, 410, 422, 429].includes(error.status)
        ? error.status
        : 502;
      return response({ message: GENERIC_INVITATION_ERROR }, status);
    }

    return response({ message: GENERIC_INVITATION_ERROR }, 500);
  }
}
