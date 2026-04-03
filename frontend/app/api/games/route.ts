import { NextResponse } from "next/server";

const DJANGO_URL = "http://localhost:8000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const url =
    q.length > 0
      ? `${DJANGO_URL}/api/games?q=${encodeURIComponent(q)}`
      : `${DJANGO_URL}/api/games`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
