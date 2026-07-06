import { NextResponse } from "next/server";
import { getCurrentUserWithRefresh } from "@/features/auth/server/get-current-user";
import { getAccessToken } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUserWithRefresh();
  const accessToken = user ? await getAccessToken() : null;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Tu sesión expiró." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    { accessToken },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
