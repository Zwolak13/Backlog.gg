import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DJANGO_API_URL } from "@/lib/server-api";

async function cookieHeader() {
  const store = await cookies();
  const session = store.get("sessionid");
  const csrf = store.get("csrftoken");
  return {
    cookie: [session ? `sessionid=${session.value}` : "", csrf ? `csrftoken=${csrf.value}` : ""]
      .filter(Boolean)
      .join("; "),
    csrf: csrf?.value ?? "",
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const url = status
    ? `${DJANGO_API_URL}/games/library/?status=${status}`
    : `${DJANGO_API_URL}/games/library/`;
  const { cookie } = await cookieHeader();
  const res = await fetch(url, { headers: { Cookie: cookie } });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { cookie, csrf } = await cookieHeader();
  const res = await fetch(`${DJANGO_API_URL}/games/library/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie, "X-CSRFToken": csrf },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
