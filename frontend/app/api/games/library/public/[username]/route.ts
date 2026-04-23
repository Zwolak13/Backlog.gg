import { DJANGO_API_URL } from "@/lib/server-api";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const url = status
    ? `${DJANGO_API_URL}/games/library/public/${username}/?status=${status}`
    : `${DJANGO_API_URL}/games/library/public/${username}/`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ games: [] }, { status: 200 });
  }
}

