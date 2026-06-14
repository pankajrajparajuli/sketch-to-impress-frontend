import { z } from "zod";
import type { ApiSuccess, Credentials } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const responseSchema = z.object({
  success: z.literal(true), roomCode: z.string().length(6), playerId: z.string().min(1),
  hostId: z.string().min(1), username: z.string().min(1), reconnectToken: z.string().min(1), message: z.string(),
});

async function post(path: string, body: Record<string, string>): Promise<ApiSuccess> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new Error("Cannot reach the game server. Make sure it is running and allows this origin.");
  }
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload ? String(payload.message) : "The game server rejected that request.";
    throw new Error(response.status === 429 ? "Too many tries. Wait a minute, then try again." : message);
  }
  const parsed = responseSchema.safeParse(payload);
  if (!parsed.success) throw new Error("The game server returned an unexpected response.");
  return parsed.data as ApiSuccess;
}

export const createRoom = (username: string) => post("/api/v1/rooms/create", { username });
export const joinRoom = (roomCode: string, username: string) => post("/api/v1/rooms/join", { roomCode, username });
export const toCredentials = (data: ApiSuccess): Credentials => ({ roomCode: data.roomCode, playerId: data.playerId, hostId: data.hostId, username: data.username, reconnectToken: data.reconnectToken });