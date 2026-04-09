import { NextResponse } from "next/server";

const DJANGO_URL = "http://localhost:8000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";

  const params = new URLSearchParams({ page });
  if (q) params.set("q", q);

  try {
    const res = await fetch(`${DJANGO_URL}/api/games?${params}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
