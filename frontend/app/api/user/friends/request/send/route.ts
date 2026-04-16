import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const store = await cookies();
  const session = store.get("sessionid");
  const csrf = store.get("csrftoken");
  const cookieHeader = [session ? `sessionid=${session.value}` : "", csrf ? `csrftoken=${csrf.value}` : ""]
    .filter(Boolean)
    .join("; ");
  const body = await req.json();
  const res = await fetch("http://localhost:8000/api/user/friends/request/send/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader, "X-CSRFToken": csrf?.value ?? "" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
