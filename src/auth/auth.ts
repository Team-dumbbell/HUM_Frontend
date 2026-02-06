import { apiGet, buildApiUrl } from "../api/client";

const AUTH_KEY = "onewave_auth_session";
const TOKEN_KEY = "onewave_auth_token";
const INTERNAL_ID_KEY = "onewave_internal_id";
const IS_NEW_USER_KEY = "onewave_is_new_user";

type CallbackAuthPayload = {
  token: string;
  internalId: string | null;
  isNewUser: boolean;
};

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(window.localStorage.getItem(TOKEN_KEY));
}

export function markAuthenticated() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(AUTH_KEY, "1");
}

export function clearAuthenticated() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(INTERNAL_ID_KEY);
  window.localStorage.removeItem(IS_NEW_USER_KEY);
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function completeAuthFromRedirectHash(hashValue: string): CallbackAuthPayload | null {
  const params = new URLSearchParams(hashValue.startsWith("#") ? hashValue.slice(1) : hashValue);
  const token = params.get("token")?.trim();

  if (!token) {
    return null;
  }

  const internalId = params.get("internal_id")?.trim() || null;
  const isNewUserRaw = params.get("is_new_user")?.trim().toLowerCase();
  const isNewUser = isNewUserRaw === "1" || isNewUserRaw === "true" || isNewUserRaw === "y";

  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(AUTH_KEY, "1");
    if (internalId) {
      window.localStorage.setItem(INTERNAL_ID_KEY, internalId);
    } else {
      window.localStorage.removeItem(INTERNAL_ID_KEY);
    }
    window.localStorage.setItem(IS_NEW_USER_KEY, isNewUser ? "1" : "0");
  }

  return {
    token,
    internalId,
    isNewUser,
  };
}

export function redirectToGoogleLogin() {
  if (typeof window === "undefined") {
    return;
  }
  window.location.href = buildApiUrl("/auth/google");
}

export async function checkAuthSession() {
  if (!isAuthenticated()) {
    return false;
  }

  try {
    await apiGet("/user/profile");
    markAuthenticated();
    return true;
  } catch {
    clearAuthenticated();
    return false;
  }
}
