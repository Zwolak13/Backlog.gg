import { DJANGO_API_URL } from "@/lib/server-api";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const res = await fetch(`${DJANGO_API_URL}/user/profile/${username}/`);
  if (!res.ok) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const data = await res.json();
  return NextResponse.json(data);
}

