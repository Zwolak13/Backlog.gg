import { ENDPOINTS } from "./config";

async function fetchCSRF() {
  const res = await fetch(ENDPOINTS.CSRF, { credentials: "include" });
  const data = await res.json();
  return data.csrfToken;
}

async function apiPost(url, body) {
  const csrfToken = await fetchCSRF();
  const res = await fetch(url, {    
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export const register = (userData) => apiPost(ENDPOINTS.REGISTER, userData);
export const login = (userData) => apiPost(ENDPOINTS.LOGIN, userData);
export const logout = () => apiPost(ENDPOINTS.LOGOUT, {});
export const getMe = async () => {
  const res = await fetch(ENDPOINTS.ME, { credentials: "include" });
  return res.json();
};