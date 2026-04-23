import { DJANGO_API_URL } from "@/lib/server-api";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  try {
    const res = await fetch(`${DJANGO_API_URL}/games/library/public/${username}/stats/`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ total: 0, backlog: 0, playing: 0, completed: 0, wishlist: 0 }, { status: 200 });
  }
}

