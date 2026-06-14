export type RoomStatus = "LOBBY" | "DRAWING" | "STUDIO" | "GALLERY" | "ROUND_RESULTS" | "FINAL_RESULTS";

export type Theme = "ANIME" | "CARTOON" | "GAMING" | "RANDOM";

export interface Credentials {
  roomCode: string;
  playerId: string;
  hostId: string;
  username: string;
  reconnectToken: string;
}

export interface Player {
  playerId: string;
  username: string;
  isHost: boolean;
  connected: boolean;
  hostId?: string;
}

export interface RoomSettings {
  timerDuration: number;
  totalRounds: number;
  theme: Theme;
}

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  brushSize: number;
  tool?: "brush" | "eraser" | "fill";
}

export interface GalleryEntry {
  roomCode: string;
  round: number;
  position: number;
  total: number;
  drawing: { drawingId: string; strokes: Stroke[]; playerId?: string };
  votingSeconds: number;
  galleryEndTimestamp: number;
  serverTime: number;
}

export interface Standing {
  playerId: string;
  username: string;
  score?: number;
  rank?: number;
  cumulativeScore?: number;
  podiumPosition?: number;
}

export interface GameState {
  status: RoomStatus;
  currentRound: number;
  totalRounds: number;
  activePrompt?: string;
  roundEndTimestamp?: number;
  serverTime?: number;
}

export interface ReconnectedSnapshot {
  success: boolean;
  roomCode: string;
  playerId: string;
  username: string;
  gameState: GameState;
  roster: Player[];
}

export interface ApiSuccess extends Credentials {
  success: true;
  message: string;
}