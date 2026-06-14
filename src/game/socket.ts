import { io, type Socket } from "socket.io-client";
import type {
  Credentials,
  RoomSettings,
  RoomStatus,
  Stroke,
} from "./types";
import { useGameStore } from "./store";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3000";
let socket: Socket | null = null;
let currentToken: string | null = null;

export function connectGameSocket(credentials: Credentials) {
  // Idempotency: if already connected with same token, just reconnect
  if (socket && currentToken === credentials.reconnectToken) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  // Tear down any previous socket cleanly
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const store = useGameStore.getState();
  store.setCredentials(credentials);
  store.setConnection(false, true);

  currentToken = credentials.reconnectToken;
  const cleanBaseUrl = WS_URL.replace(/\/$/, "");

  // Connect DIRECTLY to the /game namespace with auth so all emits go to the right place
  const gameSocket = io(`${cleanBaseUrl}/game`, {
    auth: { token: credentials.reconnectToken, reconnectToken: credentials.reconnectToken },
    query: { token: credentials.reconnectToken },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 800,
    forceNew: true,
  });

  gameSocket.on("connect", () => {
    console.log("[Socket] Connected to /game namespace successfully. Socket ID:", gameSocket.id);
    useGameStore.getState().setConnection(true, false);
  });

  gameSocket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected from /game namespace. Reason:", reason);
    useGameStore.getState().setConnection(false, true);
  });

  gameSocket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error.message);
    useGameStore.getState().setError(error.message || "Could not connect to the room.");
  });

  const handleSettingsUpdate = (data: any) => {
    console.log("[Socket] Settings update received:", data);
    const settings = data?.settings ?? data;
    if (settings && typeof settings === "object") {
      useGameStore.getState().setSettings(normalizeSettings(settings));
    }
  };

  gameSocket.on("v1:room:settings_changed", handleSettingsUpdate);
  gameSocket.on("v1:room:settings_updated", handleSettingsUpdate);

  const handleRosterUpdate = (data: any) => {
    if (data?.players) {
      useGameStore.getState().setPlayers(data.players);
    } else if (Array.isArray(data)) {
      useGameStore.getState().setPlayers(data);
    }
  };

  gameSocket.on("v1:room:roster_updated", handleRosterUpdate);
  gameSocket.on("v1:room:player_joined", handleRosterUpdate);

  gameSocket.on("v1:room:host_changed", (data: any) => {
    const targetHostId = data?.hostId ?? data?.newHostId;
    if (targetHostId) useGameStore.getState().setHost(targetHostId);
  });

  // Intercept phase updates and safely transition everyone back into the Lobby component layout
  gameSocket.on("v1:game:phase_changed", (data: { roomCode: string; status: RoomStatus }) => {
    console.log("[Socket] Phase changed event intercepted:", data?.status);
    if (!data?.status) return;
    
    if (data.status === "LOBBY") {
      console.log("[Socket] Reverting match store flags cleanly back to LOBBY stage...");
      useGameStore.getState().resetMatch();
      useGameStore.getState().setStatus("LOBBY");
    } else {
      // Short circuit protection against lagging historical frames breaking active lobby view
      if (useGameStore.getState().status === "LOBBY") {
        console.warn(`[Socket] Ignored lagging ${data.status} event traffic because lobby was already reset.`);
        return;
      }
      useGameStore.getState().setStatus(data.status);
    }
  });

  gameSocket.on("v1:game:lobby_reset", () => {
    console.log("[Socket] Global lobby reset broadcast received. Cleaning store state variables...");
    useGameStore.getState().resetMatch();
    useGameStore.getState().setStatus("LOBBY");
  });

  gameSocket.on("v1:game:round_started", (data: { round: number; prompt: string; roundEndTimestamp: number; serverTime: number }) => {
    console.log("[Socket] Round started:", data);
    useGameStore.getState().startRound(data);
  });

  const handleGallery = (data: any) => {
    if (useGameStore.getState().status === "LOBBY") return;
    console.log("[Socket] Gallery data received:", data);
    const galleryPayload = data?.gallery ?? data;
    if (galleryPayload) {
      useGameStore.getState().setGallery(galleryPayload);
    }
  };

  gameSocket.on("v1:game:gallery_started", handleGallery);
  gameSocket.on("v1:gallery:next_canvas", (data: any) => {
    console.log("[Socket] Next canvas:", data);
    handleGallery(data);
  });

  const processStandings = (data: any) => {
    if (!data || useGameStore.getState().status === "LOBBY") return;
    const items = data.standings ?? data.podium ?? (Array.isArray(data) ? data : null);
    if (items) useGameStore.getState().setStandings(items);
  };

  gameSocket.on("v1:game:round_complete", processStandings);
  gameSocket.on("v1:game:round_results_started", (data: any) => {
    if (useGameStore.getState().status === "LOBBY") return;
    useGameStore.getState().setStatus("ROUND_RESULTS");
    processStandings(data);
  });
  gameSocket.on("v1:game:match_over", processStandings);
  gameSocket.on("v1:game:final_results_started", (data: any) => {
    if (useGameStore.getState().status === "LOBBY") return;
    useGameStore.getState().setStatus("FINAL_RESULTS");
    processStandings(data);
  });

  gameSocket.on("v1:player:reconnected", (snapshot: any) => {
    console.log("[Socket] Reconnected snapshot:", snapshot);
    const state = useGameStore.getState();
    const roster = snapshot.roster || snapshot.players || [];
    state.setPlayers(roster);

    const gameState = snapshot.gameState || {};
    const status = (gameState.status || snapshot.status || snapshot.phase || "LOBBY") as RoomStatus;
    const currentRound = Number(gameState.currentRound || snapshot.currentRound || snapshot.round || 1);
    const activePrompt = gameState.activePrompt || snapshot.activePrompt || snapshot.prompt || "";
    const roundEndTimestamp = Number(gameState.roundEndTimestamp || snapshot.roundEndTimestamp || 0);
    const serverTime = Number(gameState.serverTime || snapshot.serverTime || Date.now());

    state.setConnection(true, false);

    if (status === "DRAWING" || status === "STUDIO") {
      if (activePrompt && roundEndTimestamp) {
        state.startRound({ round: currentRound, prompt: activePrompt, roundEndTimestamp, serverTime });
      } else {
        state.setStatus(status);
      }
    } else if (status === "GALLERY") {
      const galleryData = snapshot.gallery || gameState.gallery || null;
      if (galleryData) state.setGallery(galleryData);
      else state.setStatus(status);
    } else {
      state.setStatus(status);
    }
  });

  const interceptException = (error: { message?: string; code?: string }) => {
    console.error("[Socket] Exception reported from server:", error);
    useGameStore.getState().setError(error.message ?? "The game server reported an error.");
  };
  gameSocket.on("error", interceptException);
  gameSocket.on("error:exception", interceptException);

  socket = gameSocket;
  return socket;
}

function normalizeSettings(settings: Partial<RoomSettings>) {
  return {
    ...settings,
    timerDuration: settings.timerDuration ? Number(settings.timerDuration) : undefined,
    totalRounds: settings.totalRounds ? Number(settings.totalRounds) : undefined,
  };
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectGameSocket() {
  if (socket) {
    socket.off("v1:room:settings_updated");
    socket.off("v1:room:settings_changed");
    socket.off("v1:game:lobby_reset");
    socket.off("v1:game:phase_changed");
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
  currentToken = null;
}

export function emitGame(
  event: string,
  payload: object = {},
  acknowledgement?: (response: { success: boolean; message?: string }) => void,
) {
  if (!socket) {
    console.warn(`[Socket] Emission blocked. Socket context null or unassigned for event: ${event}`);
    return;
  }
  console.log(`[Socket] Emitting payload to channel: ${event}`, payload);
  socket.emit(event, payload, acknowledgement);
}

export function updateRoomSettings(settings: { timerDuration: number; totalRounds: number; theme: string }) {
  emitGame("v1:room:update_settings", settings);
}

export function updateSettings(settings: Partial<RoomSettings>) {
  emitGame("v1:room:update_settings", settings);
}

export function startGame() {
  emitGame("v1:host:start_game");
}

export function submitDrawing(
  drawing: { strokes: Stroke[] }, 
  callback?: (response: { success: boolean; playerId?: string; strokeCount?: number }) => void
) {
  emitGame("v1:canvas:submit_drawing", drawing, callback);
}

export function castStars(stars: number) {
  emitGame("v1:vote:cast_stars", { stars });
}

export function triggerPlayAgain() {
  console.log("[Socket] triggerPlayAgain method executed from view component layer.");
  
  if (!socket) {
    console.error("[Socket] Play Again blocked: global socket property is null!");
    return;
  }
  
  if (!socket.connected) {
    console.warn("[Socket] Socket exists but status reports .connected is false. Attempting explicit force emit...");
  }
  
  // Force sending directly down the reference pipeline matching Postman structure shape
  socket.emit("v1:host:trigger_play_again", { confirm: true });
}
