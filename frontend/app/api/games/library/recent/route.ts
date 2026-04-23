import { DJANGO_API_URL } from "@/lib/server-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const store = await cookies();
  const session = store.get("sessionid");
  const csrf = store.get("csrftoken");
  const cookieHeader = [session ? `sessionid=${session.value}` : "", csrf ? `csrftoken=${csrf.value}` : ""]
    .filter(Boolean)
    .join("; ");
  const res = await fetch(`${DJANGO_API_URL}/games/library/recent/`, {
    headers: { Cookie: cookieHeader },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

