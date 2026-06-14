import type { Credentials } from "./types";

const SESSION_KEY = "sti:credentials";

export function saveCredentials(credentials: Credentials) {
  if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, JSON.stringify(credentials));
}

export function loadCredentials(): Credentials | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const data = value as Record<string, unknown>;
    if (["roomCode", "playerId", "hostId", "username", "reconnectToken"].some((key) => typeof data[key] !== "string")) return null;
    return value as Credentials;
  } catch {
    return null;
  }
}

export function clearCredentials() {
  if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
}