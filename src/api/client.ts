const rawBaseUrl = import.meta.env.VITE_BASE_URL?.trim() ?? "";
export const TOKEN_KEY = "onewave_auth_token";

const normalizedBaseUrl = rawBaseUrl
  ? /^https?:\/\//i.test(rawBaseUrl)
    ? rawBaseUrl
    : `https://${rawBaseUrl}`
  : "";

export function buildApiUrl(path: string) {
  if (!normalizedBaseUrl) {
    return path;
  }

  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${sanitizedPath}`;
}

function getAuthHeaders(): Record<string, string> {
  const authToken =
    typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
  return authToken ? { Authorization: authToken } : {};
}

function handleUnauthorized() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.setItem("onewave_session_expired", "1");
  window.location.href = "/login";
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeaders(),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as unknown as T;
  }
  return (await response.json()) as T;
}