import { NextResponse } from "next/server";

const DJANGO_URL = "http://localhost:8000";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const res = await fetch(`${DJANGO_URL}/api/games/${slug}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
