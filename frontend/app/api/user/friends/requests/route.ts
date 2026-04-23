import { DJANGO_API_URL } from "@/lib/server-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getCookies() {
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

export async function GET() {
  const { cookie } = await getCookies();
  const res = await fetch(`${DJANGO_API_URL}/user/friends/requests/`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

