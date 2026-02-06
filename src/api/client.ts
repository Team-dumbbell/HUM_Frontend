const rawBaseUrl = import.meta.env.VITE_BASE_URL?.trim() ?? "";

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

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
