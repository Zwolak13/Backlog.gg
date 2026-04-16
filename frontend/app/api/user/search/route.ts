import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const store = await cookies();
  const session = store.get("sessionid");
  const csrf = store.get("csrftoken");
  const cookieHeader = [session ? `sessionid=${session.value}` : "", csrf ? `csrftoken=${csrf.value}` : ""]
    .filter(Boolean)
    .join("; ");
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const res = await fetch(`http://localhost:8000/api/user/search/?q=${encodeURIComponent(q)}`, {
    headers: { Cookie: cookieHeader },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
