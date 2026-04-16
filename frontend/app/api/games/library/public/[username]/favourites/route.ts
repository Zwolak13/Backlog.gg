import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  try {
    const res = await fetch(`http://localhost:8000/api/games/library/public/${username}/favourites/`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ games: [] }, { status: 200 });
  }
}
