import { NextResponse } from "next/server";
import { getCurrentUserWithRefresh } from "@/features/auth/server/get-current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUserWithRefresh();

  if (!user) {
    return NextResponse.json(
      { message: "La sesión expiró." },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return NextResponse.json(user, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
