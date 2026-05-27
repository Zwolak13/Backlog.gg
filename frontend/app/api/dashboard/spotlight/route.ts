import { NextResponse } from "next/server";
import { backendApiUrl, forwardedAuthHeaders, readBackendJson } from "@/lib/server-api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const exclude = searchParams.get("exclude") ?? "";

  try {
    const params = new URLSearchParams();
    if (exclude) params.set("exclude", exclude);

    const res = await fetch(backendApiUrl(`/games/spotlight/?${params}`), {
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
