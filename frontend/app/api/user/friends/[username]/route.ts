import { DJANGO_API_URL } from "@/lib/server-api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const store = await cookies();
  const session = store.get("sessionid");
  const csrf = store.get("csrftoken");
  const cookieHeader = [session ? `sessionid=${session.value}` : "", csrf ? `csrftoken=${csrf.value}` : ""]
    .filter(Boolean)
    .join("; ");
  const res = await fetch(`${DJANGO_API_URL}/user/friends/remove/${username}/`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader, "X-CSRFToken": csrf?.value ?? "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

