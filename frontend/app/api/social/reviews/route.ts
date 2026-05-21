import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders } from "@/lib/server-api";

export async function GET() {
  try {
    const headers = await forwardedAuthHeaders();
    const res = await fetch(backendApiUrl("/games/social/reviews/"), { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
