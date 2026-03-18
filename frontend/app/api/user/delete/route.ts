import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE() {
  const cookieStore = await cookies();

  const session = cookieStore.get("sessionid");
  const csrf = cookieStore.get("csrftoken");

  const cookieHeader = [
    session ? `sessionid=${session.value}` : "",
    csrf ? `csrftoken=${csrf.value}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  const res = await fetch("http://localhost:8000/api/user/delete/", {
    method: "DELETE",
    headers: {
      Cookie: cookieHeader,
      "X-CSRFToken": csrf?.value ?? "",
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
