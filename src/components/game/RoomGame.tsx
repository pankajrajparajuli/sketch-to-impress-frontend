import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, WifiOff } from "lucide-react";
import { connectGameSocket, disconnectGameSocket } from "@/game/socket";
import { loadCredentials } from "@/game/session";
import { useGameStore } from "@/game/store";
import { Lobby } from "./Lobby";
import { Studio } from "./Studio";
import { Gallery } from "./Gallery";
import { Results } from "./Results";

export function RoomGame({ roomCode }: { roomCode: string }) {
  const status = useGameStore((state) => state.status);
  const reconnecting = useGameStore((state) => state.reconnecting);
  const connected = useGameStore((state) => state.connected);
  const error = useGameStore((state) => state.error);
  
  const credentials = loadCredentials();

  useEffect(() => {
    if (!credentials || credentials.roomCode !== roomCode) return;

    let isIgnoreLifecycle = false;
    const connectTimeout = setTimeout(() => {
      if (isIgnoreLifecycle) return;
      connectGameSocket(credentials);
    }, 15);

    return () => {
      isIgnoreLifecycle = true;
      clearTimeout(connectTimeout);
      disconnectGameSocket();
    };
  }, [roomCode, credentials?.playerId]);

  if (!credentials || credentials.roomCode !== roomCode) {
    return <InvalidRoom />;
  }

  return (
    <>
      {status === "LOBBY" && <Lobby />}
      {(status === "DRAWING" || status === "STUDIO") && <Studio />}
      {status === "GALLERY" && <Gallery />}
      {status === "ROUND_RESULTS" && <Results final={false} />}
      {status === "FINAL_RESULTS" && <Results final />}

      {reconnecting && !connected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/90 p-4">
          <div className="max-w-lg border-4 border-foreground bg-card p-8 text-center pixel-shadow-lg">
            <WifiOff className="mx-auto mb-5 size-12 text-destructive" />
            <p className="font-display text-sm">SIGNAL LOST</p>
            <p className="mt-4 font-bold text-muted-foreground">Reconnecting to your game...</p>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}

function InvalidRoom() {
  return (
    <main className="pixel-sky grid min-h-screen place-items-center p-4">
      <div className="max-w-md border-4 border-foreground bg-card p-8 text-center pixel-shadow-lg">
        <AlertTriangle className="mx-auto mb-4 size-12 text-destructive" />
        <h1 className="font-display text-sm">ROOM PASS MISSING</h1>
        <p className="my-5 font-bold text-muted-foreground text-sm">
          Your active session credentials do not match this room code or have expired.
        </p>
        <Link to="/" className="inline-flex h-12 items-center border-4 border-foreground bg-primary px-5 font-display text-[11px] uppercase tracking-tight text-primary-foreground pixel-shadow hover:bg-primary/90">
          RETURN TO MAIN GATEWAY
        </Link>
      </div>
    </main>
  );
}