import { create } from "zustand";
import type { Credentials, GalleryEntry, Player, RoomSettings, RoomStatus, Standing } from "./types";

interface GameStore {
  credentials: Credentials | null;
  status: RoomStatus;
  settings: RoomSettings;
  players: Player[];
  currentRound: number;
  prompt: string;
  roundEndTimestamp: number;
  serverOffset: number;
  gallery: GalleryEntry | null;
  standings: Standing[];
  connected: boolean;
  reconnecting: boolean;
  error: string;
  setCredentials: (credentials: Credentials) => void;
  setStatus: (status: RoomStatus) => void;
  setSettings: (settings: Partial<RoomSettings>) => void;
  setPlayers: (players: Player[]) => void;
  setHost: (hostId: string) => void;
  startRound: (data: { round: number; prompt: string; roundEndTimestamp: number; serverTime: number }) => void;
  setGallery: (gallery: GalleryEntry) => void;
  setStandings: (standings: Standing[]) => void;
  setConnection: (connected: boolean, reconnecting?: boolean) => void;
  setError: (error: string) => void;
  resetMatch: () => void;
}

const initialSettings: RoomSettings = { timerDuration: 90, totalRounds: 3, theme: "CARTOON" };

export const useGameStore = create<GameStore>((set) => ({
  credentials: null, status: "LOBBY", settings: initialSettings, players: [], currentRound: 1, prompt: "",
  roundEndTimestamp: 0, serverOffset: 0, gallery: null, standings: [], connected: false, reconnecting: false, error: "",
  setCredentials: (credentials) => set({ credentials }),
  setStatus: (status) => set((state) => {
    if (status === "LOBBY") {
      return { status, gallery: null, standings: [], prompt: "", currentRound: 1, roundEndTimestamp: 0 };
    }
    if (status !== "DRAWING" && status !== "STUDIO") {
      return { status, roundEndTimestamp: 0 };
    }
    return { status };
  }),
  setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  setPlayers: (players) => set({ players }),
  setHost: (hostId) => set((state) => ({ credentials: state.credentials ? { ...state.credentials, hostId } : null, players: state.players.map((p) => ({ ...p, isHost: p.playerId === hostId })) })),
  startRound: ({ round, prompt, roundEndTimestamp, serverTime }) => set({ status: "DRAWING", currentRound: round, prompt, roundEndTimestamp, serverOffset: serverTime - Date.now(), gallery: null }),
  setGallery: (gallery) => set({ status: "GALLERY", gallery, serverOffset: gallery.serverTime - Date.now() }),
  setStandings: (standings) => set({ standings }),
  setConnection: (connected, reconnecting = !connected) => set({ connected, reconnecting }),
  setError: (error) => set({ error }),
  resetMatch: () => set({ status: "LOBBY", currentRound: 1, prompt: "", gallery: null, standings: [], error: "", roundEndTimestamp: 0 }),
}));