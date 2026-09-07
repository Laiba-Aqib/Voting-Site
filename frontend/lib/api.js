// lib/api.js
//
// Every single network call in this app goes through the helper below.
// Centralizing it means: one place that knows the backend's base URL,
// one place that attaches the JWT, and one place that turns a failed
// HTTP response into a JS error you can catch with try/catch.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// TOKEN_KEY is the localStorage key we use to persist the JWT your
// backend hands back from /user/signup and /user/login.
const TOKEN_KEY = "voting_app_token";

export function getToken() {
  if (typeof window === "undefined") return null; // guards against server-side rendering
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

/**
 * apiFetch(path, options)
 *
 * path    - e.g. "/user/login", "/candidate/64f...", "/user/vote/64f..."
 * options - standard fetch() options: { method, body, ... }
 *           body can be a plain JS object; we JSON.stringify it for you.
 *
 * What it does automatically:
 *  1. Prefixes the backend URL so you only ever write the route path.
 *  2. Sets Content-Type: application/json.
 *  3. Attaches "Authorization: Bearer <token>" if a token is stored -
 *     this is exactly what your jwtAuthMiddleware expects
 *     (it does req.headers.authorization.split(" ")[1]).
 *  4. Parses the JSON response body for you.
 *  5. Throws an Error with the backend's message if res.ok is false,
 *     so every call site can just do try { ... } catch (err) { ... }.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Try to parse JSON even on error responses, because your backend
  // sends helpful messages like { message: "Incorrect username or password" }.
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}
