import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Palette, Sparkles, Users } from "lucide-react";
import { createRoom, joinRoom, toCredentials } from "@/game/api";
import { saveCredentials } from "@/game/session";
import { Input } from "@/components/ui/input";
import { PixelButton } from "./PixelButton";

const cleanName = (value: string) => value.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 20);
const cleanCode = (value: string) => value.toUpperCase().replace(/[0O1I]/g, "").replace(/[^A-Z2-9]/g, "").slice(0, 6);

export function Gateway() {
  const navigate = useNavigate({ from: "/" });
  const isMounted = useRef(true);

  const [hostName, setHostName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [pending, setPending] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState("");

  // Track component mounted status to prevent async memory leaks
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function run(mode: "create" | "join", event: FormEvent) {
    event.preventDefault(); 
    setError("");

    const name = mode === "create" ? hostName.trim() : guestName.trim();
    
    if (name.length < 3) {
      return setError("Player names need at least 3 characters.");
    }
    if (mode === "join" && roomCode.length !== 6) {
      return setError("Enter all 6 room-code characters.");
    }

    setPending(mode);

    try {
      const result = mode === "create" 
        ? await createRoom(name) 
        : await joinRoom(roomCode, name);

      const credentials = toCredentials(result); 
      saveCredentials(credentials);

      // Route to room route safely
      await navigate({ to: "/room/$roomCode", params: { roomCode: credentials.roomCode } });
      return; // Stop execution here to let routing complete teardown safely
    } catch (cause) {
      if (!isMounted.current) return;
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
      setPending(null); // Clear only on catch fallback so button unlocks if API call failed
    }
  }

  return (
    <main className="pixel-sky relative min-h-screen overflow-hidden px-4 py-8 md:px-8">
      <div className="pixel-cloud left-[7%] top-20" />
      <div className="pixel-cloud right-[9%] top-40 hidden md:block" />
      
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center">
        <header className="relative z-10 mb-7 text-center">
          <div className="mb-4 inline-flex items-center gap-2 border-4 border-foreground bg-secondary px-4 py-2 font-display text-[10px] pixel-shadow">
            <Sparkles /> PARTY DRAWING SHOWDOWN
          </div>
          <h1 className="text-balance font-display text-3xl leading-[1.35] text-primary-foreground text-shadow-pixel sm:text-5xl md:text-6xl">
            SKETCH TO<br /><span className="text-secondary">IMPRESS</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg font-bold text-primary-foreground drop-shadow-md">
            Draw weird. Rate anonymously. Rule the podium.
          </p>
        </header>

        <section className="relative z-10 grid border-4 border-foreground bg-card pixel-shadow-lg md:grid-cols-2">
          {/* Host Form */}
          <form 
            onSubmit={(event) => run("create", event)} 
            className="border-b-4 border-foreground p-6 md:border-b-0 md:border-r-4 md:p-8"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-12 place-items-center border-4 border-foreground bg-primary text-primary-foreground">
                <Palette />
              </span>
              <div>
                <p className="font-display text-[10px] text-primary">HOST TRACK</p>
                <h2 className="font-display text-sm">BUILD A LOBBY</h2>
              </div>
            </div>
            
            <label className="mb-2 block font-display text-[9px]" htmlFor="host-name">
              YOUR PLAYER NAME
            </label>
            <Input 
              id="host-name" 
              value={hostName} 
              onChange={(e) => setHostName(cleanName(e.target.value))} 
              placeholder="DoodleHero" 
              autoComplete="nickname" 
              className="h-12 rounded-none border-4 border-foreground bg-background font-bold focus-visible:ring-4 focus-visible:ring-ring" 
            />
            
            <PixelButton className="mt-5 w-full" disabled={pending !== null}>
              {pending === "create" ? "OPENING PORTAL..." : "CREATE A LOBBY"}
            </PixelButton>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">
              You choose the theme, rounds, and drawing timer.
            </p>
          </form>

          {/* Join Form */}
          <form onSubmit={(event) => run("join", event)} className="p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-12 place-items-center border-4 border-foreground bg-secondary">
                <Users />
              </span>
              <div>
                <p className="font-display text-[10px] text-destructive">GUEST TRACK</p>
                <h2 className="font-display text-sm">JOIN THE CREW</h2>
              </div>
            </div>
            
            <label className="mb-2 block font-display text-[9px]" htmlFor="guest-name">
              YOUR PLAYER NAME
            </label>
            <Input 
              id="guest-name" 
              value={guestName} 
              onChange={(e) => setGuestName(cleanName(e.target.value))} 
              placeholder="PixelPal" 
              autoComplete="nickname" 
              className="h-12 rounded-none border-4 border-foreground bg-background font-bold" 
            />
            
            <label className="mb-2 mt-4 block font-display text-[9px]" htmlFor="room-code">
              6-CHARACTER ROOM CODE
            </label>
            <Input 
              id="room-code" 
              value={roomCode} 
              onChange={(e) => setRoomCode(cleanCode(e.target.value))} 
              placeholder="B7X9Q2" 
              autoCapitalize="characters" 
              className="h-14 rounded-none border-4 border-foreground bg-background text-center font-display text-xl tracking-[0.4em]" 
            />
            
            <PixelButton tone="yellow" className="mt-5 w-full" disabled={pending !== null}>
              {pending === "join" ? "WARPING IN..." : "JOIN LOBBY"}
            </PixelButton>
          </form>
        </section>

        {error && (
          <div role="alert" className="relative z-10 mx-auto mt-5 max-w-2xl border-4 border-foreground bg-destructive px-5 py-3 text-center font-bold text-destructive-foreground pixel-shadow">
            ! {error}
          </div>
        )}
      </div>
    </main>
  );
}