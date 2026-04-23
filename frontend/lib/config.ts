const API_BASE_URL =
  process.env.NEXT_PUBLIC_DJANGO_API_URL ??
  "http://localhost:8000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const BACKEND_URL = `${API_BASE_URL.replace(/\/$/, "")}/auth`;
export const WS_BACKEND_URL = (
  process.env.NEXT_PUBLIC_DJANGO_WS_URL ??
  BACKEND_ORIGIN.replace(/^http/, "ws")
).replace(/\/$/, "");

export const ENDPOINTS = {
  CSRF: `${BACKEND_URL}/csrf/`,
  LOGIN: `${BACKEND_URL}/login/`,
  REGISTER: `${BACKEND_URL}/register/`,
  LOGOUT: `${BACKEND_URL}/logout/`,
  ME: `${BACKEND_URL}/me/`,
};
