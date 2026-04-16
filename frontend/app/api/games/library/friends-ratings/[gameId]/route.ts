import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await context.params;
  const store = await cookies();
  const session = store.get("sessionid");
  const csrf = store.get("csrftoken");
  const cookieHeader = [session ? `sessionid=${session.value}` : "", csrf ? `csrftoken=${csrf.value}` : ""]
    .filter(Boolean)
    .join("; ");
  const res = await fetch(`http://localhost:8000/api/games/library/friends-ratings/${gameId}/`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
