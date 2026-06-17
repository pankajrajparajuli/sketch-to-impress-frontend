import { useEffect, useState } from "react";
import { Copy, Crown, LockKeyhole, Radio, Wifi, WifiOff } from "lucide-react";
import { useGameStore } from "@/game/store";
import { emitGame } from "@/game/socket";
import type { Theme } from "@/game/types";
import { PixelButton } from "./PixelButton";

const OPTIONS = {
  timerDuration: [60, 90, 120] as number[],
  totalRounds: [1, 3, 5] as number[],
  theme: ["ANIME", "CARTOON", "GAMING", "RANDOM"] as Theme[],
};

export function Lobby() {
  const credentials = useGameStore((state) => state.credentials);
  const players = useGameStore((state) => state.players);
  const storeSettings = useGameStore((state) => state.settings);
  const connected = useGameStore((state) => state.connected);

  // Local state mirrors the server-authoritative settings.
  // Initialized from the store so it starts correct on mount / reconnect.
  const [timerDuration, setTimerDuration] = useState<number>(
    storeSettings.timerDuration ?? 60,
  );
  const [totalRounds, setTotalRounds] = useState<number>(
    storeSettings.totalRounds ?? 3,
  );
  const [theme, setTheme] = useState<Theme>(storeSettings.theme ?? "RANDOM");

  // Drive local state from the Zustand store.
  // The global socket handler in socket.ts already writes to the store
  // when 'v1:room:settings_updated' arrives, so watching store fields
  // here covers both initial load and every live broadcast.
  useEffect(() => {
    if (storeSettings.timerDuration) setTimerDuration(storeSettings.timerDuration);
    if (storeSettings.totalRounds) setTotalRounds(storeSettings.totalRounds);
    if (storeSettings.theme) setTheme(storeSettings.theme);
  }, [storeSettings.timerDuration, storeSettings.totalRounds, storeSettings.theme]);

  if (!credentials) return null;
  const isHost = credentials.playerId === credentials.hostId;

  // Instant pick handlers: update local state AND emit immediately so all
  // clients see the change without waiting for the host to press Apply.
  function handleTimerPick(value: number) {
    setTimerDuration(value);
    emitGame("v1:room:update_settings", { timerDuration: value, totalRounds, theme });
  }

  function handleRoundsPick(value: number) {
    setTotalRounds(value);
    emitGame("v1:room:update_settings", { timerDuration, totalRounds: value, theme });
  }

  function handleThemePick(value: Theme) {
    setTheme(value);
    emitGame("v1:room:update_settings", { timerDuration, totalRounds, theme: value });
  }

  // Manual re-sync: bundles the current local states and forces a re-emission
  // as a protective fallback in case any earlier emission was dropped.
  function applySettings() {
    emitGame("v1:room:update_settings", { timerDuration, totalRounds, theme });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-5 md:px-8 md:py-8">
      {/* Header Panel */}
      <header className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-4 border-foreground bg-accent px-5 py-4 pixel-shadow">
        <div>
          <p className="font-display text-[9px] text-accent-foreground/70">ROOM CODE</p>
          <button
            onClick={() => navigator.clipboard.writeText(credentials.roomCode)}
            className="flex items-center gap-3 font-display text-xl text-accent-foreground"
            aria-label="Copy room code"
          >
            {credentials.roomCode}
            <Copy className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-4 border-foreground bg-card px-3 py-2 text-sm font-bold">
          {connected ? (
            <Wifi className="text-primary" />
          ) : (
            <WifiOff className="text-destructive" />
          )}
          {connected ? "LIVE & SYNCED" : "CONNECTING..."}
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">

        {/* Roster Section */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h1 className="font-display text-sm">PLAYER ROSTER</h1>
            <span className="font-display text-[10px]">{players.length}/8</span>
          </div>

          <div className="space-y-3">
            {players.length ? (
              players.map((player, index) => (
                <div
                  key={player.playerId}
                  className="flex items-center gap-4 border-4 border-foreground bg-card p-3 pixel-shadow-sm"
                >
                  <span className="grid size-11 place-items-center border-4 border-foreground bg-muted font-display text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[10px]">
                      {player.username}
                      {player.playerId === credentials.playerId && " (YOU)"}
                    </p>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      {player.connected ? "READY TO DRAW" : "RECONNECTING"}
                    </p>
                  </div>

                  {player.isHost && <Crown className="text-secondary" fill="currentColor" />}
                  {player.connected ? (
                    <Radio className="text-primary" />
                  ) : (
                    <WifiOff className="text-muted-foreground" />
                  )}
                </div>
              ))
            ) : (
              <div className="border-4 border-dashed border-foreground p-8 text-center font-bold">
                Waiting for the roster...
              </div>
            )}
          </div>
        </section>

        {/* Configuration Panel */}
        <section className="border-4 border-foreground bg-card p-5 pixel-shadow-lg md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-display text-[9px] text-primary">MATCH CONFIG</p>
              <h2 className="mt-2 font-display text-sm">
                {isHost ? "SET THE RULES" : "HOST IS CHOOSING"}
              </h2>
            </div>
            {!isHost && <LockKeyhole className="size-8" />}
          </div>

          <Setting
            label="DRAW TIMER"
            values={OPTIONS.timerDuration}
            active={timerDuration}
            suffix="s"
            locked={!isHost}
            onPick={(v) => handleTimerPick(v as number)}
          />

          <Setting
            label="ROUNDS"
            values={OPTIONS.totalRounds}
            active={totalRounds}
            locked={!isHost}
            onPick={(v) => handleRoundsPick(v as number)}
          />

          <Setting
            label="PROMPT DECK"
            values={OPTIONS.theme}
            active={theme}
            locked={!isHost}
            onPick={(v) => handleThemePick(v as Theme)}
          />

          {isHost && (
            <>
              <PixelButton
                tone="yellow"
                className="mt-5 w-full"
                disabled={!connected}
                onClick={applySettings}
              >
                APPLY SETTINGS
              </PixelButton>

              <PixelButton
                className="mt-3 w-full"
                disabled={!connected || players.length < 2}
                onClick={() => emitGame("v1:host:start_game")}
              >
                START GAME
              </PixelButton>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

// ─── Setting sub-component ────────────────────────────────────────────────────

interface SettingProps {
  label: string;
  values: readonly (string | number)[];
  active: string | number;
  suffix?: string;
  locked: boolean;
  onPick: (value: string | number) => void;
}

function Setting({ label, values, active, suffix = "", locked, onPick }: SettingProps) {
  return (
    <div className="mb-6">
      <p className="mb-3 font-display text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className={`grid gap-2 ${values.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {values.map((option) => {
          const isActive = String(option) === String(active);
          return (
            <button
              key={option}
              type="button"
              disabled={locked}
              onClick={() => onPick(option)}
              className={`min-h-12 border-4 border-foreground px-2 font-display text-[9px] transition-transform ${
                isActive
                  ? "translate-x-1 translate-y-1 bg-secondary shadow-none"
                  : "bg-background pixel-shadow-sm hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              }`}
            >
              {option}
              {suffix}
            </button>
          );
        })}
      </div>
    </div>
  );
}