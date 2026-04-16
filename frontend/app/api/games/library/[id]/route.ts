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

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const { cookie, csrf } = await getCookies();
  const res = await fetch(`http://localhost:8000/api/games/library/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie, "X-CSRFToken": csrf },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { cookie, csrf } = await getCookies();
  const res = await fetch(`http://localhost:8000/api/games/library/${id}/`, {
    method: "DELETE",
    headers: { Cookie: cookie, "X-CSRFToken": csrf },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
