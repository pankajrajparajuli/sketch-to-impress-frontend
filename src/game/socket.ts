import { io, type Socket } from "socket.io-client";
import type {
  Credentials,
  GalleryEntry,
  Player,
  ReconnectedSnapshot,
  RoomSettings,
  RoomStatus,
  Standing,
  Stroke,
} from "./types";
import { useGameStore } from "./store";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3000";
let socket: Socket | null = null;
let currentToken: string | null = null;

export function connectGameSocket(credentials: Credentials) {
  // 1. FIXED IDEMPOTENCY CHECK:
  // If we already have a running socket connected with this user session token, 
  // do NOT wipe listeners or disconnect. Simply return the active instance safely.
  if (socket && currentToken === credentials.reconnectToken) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  // 2. Only wipe state if we are completely changing user credentials/sessions
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  const store = useGameStore.getState();
  store.setCredentials(credentials);
  store.setConnection(false, true);

  currentToken = credentials.reconnectToken;
  const cleanBaseUrl = WS_URL.replace(/\/$/, ""); 

  // 3. Initialize connection to base manager instance
  const baseManagerSocket = io(cleanBaseUrl, {
    path: "/socket.io", 
    auth: {
      token: credentials.reconnectToken, 
    },
    query: {
      token: credentials.reconnectToken,
    },
    transports: ["websocket"], 
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 800,
    forceNew: true, 
  });

  // Switch connection context focus to the '/game' namespace multiplexer
  const gameNamespace = baseManagerSocket.io.socket("/game");

  // 4. Register Event Handlers strictly onto the safe sub-namespace container
  gameNamespace.on("connect", () => {
    useGameStore.getState().setConnection(true, false);
  });

  gameNamespace.on("disconnect", () => {
    useGameStore.getState().setConnection(false, true);
  });

  gameNamespace.on("connect_error", (error) => {
    useGameStore.getState().setError(error.message || "Could not connect to the room.");
  });

  gameNamespace.on("v1:room:settings_changed", ({ settings }: { settings: Partial<RoomSettings> }) =>
    useGameStore.getState().setSettings(normalizeSettings(settings)),
  );

  gameNamespace.on("v1:room:settings_updated", ({ settings }: { settings: Partial<RoomSettings> }) =>
    useGameStore.getState().setSettings(normalizeSettings(settings)),
  );

  gameNamespace.on("v1:room:roster_updated", (data: any) => {
    if (data && data.players) {
      useGameStore.getState().setPlayers(data.players);
    } else if (Array.isArray(data)) {
      useGameStore.getState().setPlayers(data);
    }
  });

  gameNamespace.on("v1:room:player_joined", (data: any) => {
    if (data && data.players) {
      useGameStore.getState().setPlayers(data.players);
    } else if (Array.isArray(data)) {
      useGameStore.getState().setPlayers(data);
    }
  });

  gameNamespace.on("v1:room:host_changed", (data: any) => {
    // Sync with server specification payload parameters format: hostId vs newHostId
    const targetHostId = data?.hostId ?? data?.newHostId;
    if (targetHostId) useGameStore.getState().setHost(targetHostId);
  });

  gameNamespace.on("v1:game:phase_changed", (data: { roomCode: string; status: RoomStatus }) => {
    console.log("[Socket] Switch phase status requested by server:", data?.status);
    if (data?.status) useGameStore.getState().setStatus(data.status);
  });

  gameNamespace.on(
    "v1:game:round_started",
    (data: { round: number; prompt: string; roundEndTimestamp: number; serverTime: number }) => {
      console.log("[Socket] Starting a fresh drawing sequence:", data);
      useGameStore.getState().startRound(data);
    }
  );

  gameNamespace.on("v1:game:gallery_started", (data: any) => {
    console.log("[Socket] Gallery event broadcast triggered:", data);
    if (data?.gallery) {
      useGameStore.getState().setGallery(data.gallery);
    } else if (data) {
      useGameStore.getState().setGallery(data);
    }
  });

  gameNamespace.on("v1:gallery:next_canvas", (data: any) => {
    console.log("[Socket] Distributed next carousel item canvas view:", data);
    // Explicit switch to GALLERY status when server streams new evaluation items
    useGameStore.getState().setStatus("GALLERY");
    useGameStore.getState().setGallery(data);
  });

  // Globalized mapping pipeline for multi-channel round summary data bundles
  const processStandingsDataStream = (data: any) => {
    if (!data) return;
    const items = data.standings ?? data.podium ?? (Array.isArray(data) ? data : null);
    if (items) {
      useGameStore.getState().setStandings(items);
    }
  };

  gameNamespace.on("v1:game:round_complete", (data) => {
    processStandingsDataStream(data);
  });

  gameNamespace.on("v1:game:round_results_started", (data) => {
    useGameStore.getState().setStatus("ROUND_RESULTS");
    processStandingsDataStream(data);
  });

  gameNamespace.on("v1:game:match_over", (data) => {
    processStandingsDataStream(data);
  });

  gameNamespace.on("v1:game:final_results_started", (data) => {
    useGameStore.getState().setStatus("FINAL_RESULTS");
    processStandingsDataStream(data);
  });

  gameNamespace.on("v1:player:reconnected", (snapshot: any) => {
    console.log("[Socket] Reconnected snapshot received:", snapshot);
    const state = useGameStore.getState();

    // Support nested roster or flat players list
    const roster = snapshot.roster || snapshot.players || [];
    state.setPlayers(roster);

    // Support nested gameState or flat snapshot fields
    const gameState = snapshot.gameState || {};
    const status = (gameState.status || snapshot.status || "LOBBY") as RoomStatus;
    const currentRound = Number(gameState.currentRound || snapshot.round || 1);
    const activePrompt = gameState.activePrompt || snapshot.prompt || "";
    const roundEndTimestamp = Number(gameState.roundEndTimestamp || snapshot.roundEndTimestamp || 0);
    const serverTime = Number(gameState.serverTime || snapshot.serverTime || Date.now());

    state.setStatus(status);
    state.setConnection(true, false);

    if (status === "DRAWING" || status === "STUDIO") {
      if (activePrompt && roundEndTimestamp) {
        state.startRound({
          round: currentRound,
          prompt: activePrompt,
          roundEndTimestamp,
          serverTime,
        });
      }
    } else if (status === "GALLERY") {
      const galleryData = snapshot.gallery || gameState.gallery || null;
      if (galleryData) {
        state.setGallery(galleryData);
      }
    }
  });

  // Track both default socket exceptions and custom documentation error payload gates
  const interceptException = (error: { message?: string; code?: string }) => {
    console.error("[Socket Exception Guard] Intercepted operational break:", error);
    useGameStore.getState().setError(error.message ?? "The game server reported an error.");
  };
  gameNamespace.on("error", interceptException);
  gameNamespace.on("error:exception", interceptException);

  // Update master pointer target to match namespace proxy layout
  socket = gameNamespace as unknown as Socket;
  return socket;
}

function normalizeSettings(settings: Partial<RoomSettings>) {
  return {
    ...settings,
    timerDuration: settings.timerDuration ? Number(settings.timerDuration) : undefined,
    totalRounds: settings.totalRounds ? Number(settings.totalRounds) : undefined,
  };
}

export function disconnectGameSocket() {
  if (socket) {
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
    console.warn(`[Socket] Emission blocked. Socket not connected for event: ${event}`);
    return;
  }
  socket.emit(event, payload, acknowledgement);
}

export function updateSettings(settings: Partial<RoomSettings>) {
  // MATCH API DOCS: Send naked values flat inside payload without sub-object grouping labels
  emitGame("v1:host:update_settings", settings);
}

export function startGame() {
  emitGame("v1:host:start_game");
}

export function submitDrawing(
  drawing: { strokes: Stroke[] }, 
  callback?: (response: { success: boolean; playerId?: string; strokeCount?: number }) => void
) {
  // Transmits matching specific SubmitDrawingDto object structure shape: { strokes: [...] }
  emitGame("v1:canvas:submit_drawing", drawing, callback);
}

export function castStars(stars: number) {
  // Transmits matching explicit CastVoteDto structure schema: { stars: number }
  emitGame("v1:vote:cast_stars", { stars });
}

export function triggerPlayAgain() {
  // Transmits matching explicit PlayAgainDto structure schema: { confirm: true }
  emitGame("v1:host:trigger_play_again", { confirm: true });
}