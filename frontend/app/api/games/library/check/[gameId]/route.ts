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
  };
}

export async function GET(req: Request, context: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await context.params;
  try {
    const { cookie } = await getCookies();
    const res = await fetch(`http://localhost:8000/api/games/library/check/${gameId}/`, {
      headers: { Cookie: cookie },
      cache: "no-store",
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : { in_library: false, entry: null };
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ in_library: false, entry: null });
  }
}
