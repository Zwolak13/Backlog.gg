import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  const res = await fetch(`http://localhost:8000/api/user/profile/${params.username}/`);
  if (!res.ok) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
