import { NextRequest, NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders } from "@/lib/server-api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const params = new URLSearchParams();
  if (q) params.set("q", q);

  try {
    const headers = await forwardedAuthHeaders();
    const res = await fetch(backendApiUrl(`/games/social/users/?${params}`), { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
