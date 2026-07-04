const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

let currentAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

export function getAccessToken() {
  return currentAccessToken;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (currentAccessToken) headers.set("Authorization", `Bearer ${currentAccessToken}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // send/receive the httpOnly refresh-token cookie
  });
}

export async function apiJson<T = unknown>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const res = await apiFetch(path, options);

  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    try {
      const refreshRes = await apiFetch("/auth/refresh", { method: "POST" });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.accessToken);
        return apiJson<T>(path, options, false);
      }
    } catch {
      // ignore refresh failure and fall through to original 401 handling
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.error ?? message;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
