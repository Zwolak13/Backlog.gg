import { NextRequest, NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders } from "@/lib/server-api";

export async function GET(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/").filter(Boolean);
  const appid = segments[segments.length - 1];
  const currency = req.nextUrl.searchParams.get("currency") ?? "USD";

  try {
    const headers = await forwardedAuthHeaders();
    const res = await fetch(
      backendApiUrl(`/games/price/${appid}/?currency=${currency}`),
      { headers }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ deal: null }, { status: 503 });
  }
}
