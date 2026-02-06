const TOKEN_KEY = "onewave_auth_token";

type JwtPayload = Record<string, unknown>;

export type TokenProfile = {
  name: string;
  email: string;
  avatarText: string;
};

export function readProfileFromStoredToken(): TokenProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_KEY)?.trim();
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const name =
    readString(payload.name) ??
    readString(payload.nickname) ??
    readString(payload.username) ??
    readString(payload.preferred_username) ??
    readString(payload.given_name) ??
    readString(payload.user_name) ??
    "";

  const email = readString(payload.email) ?? readString(payload.upn) ?? "";
  const avatarText = (name.charAt(0) || email.charAt(0) || "H").toUpperCase();

  if (!name && !email) {
    return null;
  }

  return { name, email, avatarText };
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = base64UrlToBase64(parts[1]);
    const decoded = atob(base64);
    const json = decodeUtf8(decoded);
    const parsed = JSON.parse(json);
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function base64UrlToBase64(input: string) {
  const replaced = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = replaced.length % 4;
  if (padding === 2) return `${replaced}==`;
  if (padding === 3) return `${replaced}=`;
  if (padding === 1) return `${replaced}===`;
  return replaced;
}

function decodeUtf8(input: string) {
  try {
    const bytes = Uint8Array.from(input, (ch) => ch.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return input;
  }
}

function isObject(value: unknown): value is JwtPayload {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return null;
}
