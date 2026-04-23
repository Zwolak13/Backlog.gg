import { cookies } from "next/headers";

const backendOrigin =
  process.env.DJANGO_BASE_URL ??
  process.env.NEXT_PUBLIC_DJANGO_BASE_URL ??
  "http://localhost:8000";

export const DJANGO_API_URL = `${backendOrigin.replace(/\/$/, "")}/api`;

export function backendApiUrl(path: string) {
  return `${DJANGO_API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function forwardedAuthHeaders(includeCsrf = false) {
  const store = await cookies();
  const session = store.get("sessionid");
  const csrf = store.get("csrftoken");
  const cookie = [
    session ? `sessionid=${session.value}` : "",
    csrf ? `csrftoken=${csrf.value}` : "",
  ].filter(Boolean).join("; ");

  return {
    Accept: "application/json",
    Cookie: cookie,
    ...(includeCsrf ? { "X-CSRFToken": csrf?.value ?? "" } : {}),
  };
}

export async function readBackendJson<T>(
  response: Response,
  fallback: T,
): Promise<{ data: T; error: string | null }> {
  const text = await response.text();
  if (!text) {
    return { data: fallback, error: response.ok ? null : "Backend returned an empty response" };
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      data: fallback,
      error: `Backend returned ${response.status} ${response.statusText || "non-JSON response"}. Restart Django and confirm the API is running on ${DJANGO_API_URL}.`,
    };
  }

  try {
    return { data: JSON.parse(text) as T, error: null };
  } catch {
    return {
      data: fallback,
      error: "Backend returned malformed JSON.",
    };
  }
}
