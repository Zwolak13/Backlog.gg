import { NextResponse } from "next/server";

const DJANGO_URL = "http://localhost:8000";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const res = await fetch(`${DJANGO_URL}/api/games/${slug}/`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
