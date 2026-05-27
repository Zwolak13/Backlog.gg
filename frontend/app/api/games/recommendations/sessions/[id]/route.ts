import { NextRequest, NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").at(-1);
  try {
    const res = await fetch(backendApiUrl(`/games/recommendations/sessions/${id}/`), {
      headers: await forwardedAuthHeaders(),
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<object>(res, {});
    if (!res.ok || error) return NextResponse.json({ error }, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").at(-1);
  const body = await req.json();
  try {
    const headers = await forwardedAuthHeaders(true);
    const res = await fetch(backendApiUrl(`/games/recommendations/sessions/${id}/`), {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const { data, error } = await readBackendJson<object>(res, {});
    if (!res.ok || error) return NextResponse.json({ error }, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").at(-1);
  try {
    const headers = await forwardedAuthHeaders(true);
    const res = await fetch(backendApiUrl(`/games/recommendations/sessions/${id}/`), {
      method: "DELETE",
      headers,
      cache: "no-store",
    });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json({ error: "Delete failed" }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
