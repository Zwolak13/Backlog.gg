import { NextRequest, NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders } from "@/lib/server-api";

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") ?? "30";
  try {
    const headers = await forwardedAuthHeaders();
    const res = await fetch(backendApiUrl(`/games/activity/me/?limit=${limit}`), { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ activity: [] }, { status: 503 });
  }
}
