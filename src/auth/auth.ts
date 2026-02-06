import { apiGet, buildApiUrl } from "../api/client";

const AUTH_KEY = "onewave_auth_session";

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(AUTH_KEY) === "1";
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
}

export function redirectToGoogleLogin() {
  if (typeof window === "undefined") {
    return;
  }
  markAuthenticated();
  window.location.href = buildApiUrl("/auth/google");
}

export async function checkAuthSession() {
  try {
    await apiGet("/user/profile");
    markAuthenticated();
    return true;
  } catch {
    clearAuthenticated();
    return false;
  }
}
