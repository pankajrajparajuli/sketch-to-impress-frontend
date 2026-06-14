import { useEffect, useRef, useState } from "react";
import { Eye, Star } from "lucide-react";
import { useGameStore } from "@/game/store";
import { emitGame } from "@/game/socket";
import { useCountdown } from "@/hooks/useCountdown";
import { ShowcaseCanvas } from "./ShowcaseCanvas";

export function Gallery() {
  const { gallery, serverOffset, credentials } = useGameStore();
  const setError = useGameStore((state) => state.setError);
  
  const isMounted = useRef(true);

  const [hovered, setHovered] = useState(0);
  const [voted, setVoted] = useState(0);
  const [pending, setPending] = useState(false);

  const seconds = useCountdown(gallery?.galleryEndTimestamp ?? 0, serverOffset);

  // Sync mounted status lifecycle
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle canvas rendering reset when gallery changes
  useEffect(() => { 
    setHovered(0); 
    setVoted(0); 
    setPending(false); 
  }, [gallery?.drawing.drawingId]);

  if (!gallery) return <Waiting label="CURATING THE GALLERY..." />;

  const own = gallery.drawing.playerId === credentials?.playerId;

  function vote(stars: number) {
    if (own || voted || pending) return;
    setPending(true);

    emitGame("v1:vote:cast_stars", { stars }, (response) => {
      // Guard against writing state memory leaks if the component unmounted
      if (!isMounted.current) return;

      if (response.success) {
        setVoted(stars);
      } else {
        setError(response.message ?? "Vote not accepted.");
      }
      setPending(false);
    });
  }

  return (
    <main className="gallery-wall min-h-screen px-4 py-5 md:px-8">
      <header className="mx-auto mb-5 flex max-w-5xl items-center justify-between border-4 border-foreground bg-card p-4 pixel-shadow">
        <div>
          <p className="font-display text-[8px] text-primary">ANONYMOUS SHOWCASE</p>
          <h1 className="mt-2 font-display text-xs">
            ENTRY {gallery.position} OF {gallery.total}
          </h1>
        </div>
        <div
          className={`border-4 border-foreground px-4 py-3 font-display text-base ${
            seconds <= 5
              ? "animate-danger bg-destructive text-destructive-foreground"
              : "bg-secondary"
          }`}
        >
          {seconds}s
        </div>
      </header>

      <section className="mx-auto max-w-5xl">
        <div className="easel-frame mx-auto max-w-4xl">
          <ShowcaseCanvas
            strokes={gallery.drawing.strokes || []}
            width={1000}
            height={650}
            className="block aspect-[20/13] w-full bg-card"
          />
        </div>

        <div className="mx-auto mt-5 max-w-4xl border-4 border-foreground bg-card p-4 text-center pixel-shadow">
          <div className="mb-4 flex items-center justify-center gap-2 font-display text-[9px]">
            <Eye /> RATE THE ART — NOT THE ARTIST
          </div>
          
          {own ? (
            <div className="border-4 border-foreground bg-muted p-4 font-display text-[10px]">
              YOUR DRAWING — VOTING LOCKED
            </div>
          ) : (
            <div
              className="grid grid-cols-5 gap-2 md:grid-cols-10"
              onMouseLeave={() => setHovered(0)}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  disabled={Boolean(voted) || pending}
                  onMouseEnter={() => setHovered(star)}
                  onFocus={() => setHovered(star)}
                  onClick={() => vote(star)}
                  className={`grid aspect-square place-items-center border-4 border-foreground font-display text-[9px] transition-transform hover:-translate-y-1 ${
                    (voted || hovered) >= star ? "bg-secondary" : "bg-background"
                  }`}
                >
                  <Star fill={(voted || hovered) >= star ? "currentColor" : "none"} />
                  <span className="sr-only">{star} stars</span>
                </button>
              ))}
            </div>
          )}
          
          {voted > 0 && (
            <p className="mt-4 font-display text-[10px] text-primary">
              {voted}/10 LOCKED IN!
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export function Waiting({ label }: { label: string }) {
  return (
    <div className="pixel-sky grid min-h-screen place-items-center p-4">
      <div className="border-4 border-foreground bg-card p-8 text-center pixel-shadow-lg">
        <div className="mx-auto mb-5 size-12 animate-spin border-8 border-muted border-t-primary" />
        <p className="font-display text-sm">{label}</p>
      </div>
    </div>
  );
}