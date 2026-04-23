import { NextRequest, NextResponse } from "next/server";
import { DJANGO_API_URL } from "@/lib/server-api";

export async function GET(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/").filter(Boolean);
  const slug = segments[segments.length - 1];

  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  try {
    const res = await fetch(`${DJANGO_API_URL}/games/${slug}/`);
    if (!res.ok) {
      return NextResponse.json({ error: "Game not found" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
