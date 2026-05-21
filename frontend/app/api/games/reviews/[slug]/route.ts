import { NextRequest, NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders } from "@/lib/server-api";

export async function GET(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/").filter(Boolean);
  const slug = segments[segments.length - 1];

  try {
    const headers = await forwardedAuthHeaders();
    const res = await fetch(backendApiUrl(`/games/reviews/${slug}/`), { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
