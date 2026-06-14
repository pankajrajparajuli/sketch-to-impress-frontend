import { motion } from "motion/react";
import { Crown, RotateCcw, Star, Trophy } from "lucide-react";
import { useGameStore } from "@/game/store";
import { triggerPlayAgain } from "@/game/socket";
import { PixelButton } from "./PixelButton";

const score = (standing: { score?: number; cumulativeScore?: number }) => standing.cumulativeScore ?? standing.score ?? 0;

export function Results({ final }: { final: boolean }) {
  const { standings, credentials, currentRound, settings } = useGameStore();
  
  // Sort by server rankings cleanly
  const sorted = [...standings].sort((a, b) => {
    const rankA = a.podiumPosition ?? a.rank ?? 99;
    const rankB = b.podiumPosition ?? b.rank ?? 99;
    return rankA - rankB;
  });

  const isHost = credentials?.playerId === credentials?.hostId;

  if (!sorted.length) {
    return (
      <div className="pixel-sky grid min-h-screen place-items-center">
        <p className="border-4 border-foreground bg-card p-8 font-display text-sm pixel-shadow">
          COUNTING THE STARS...
        </p>
      </div>
    );
  }

  return (
    <main className="results-sky min-h-screen overflow-hidden px-4 py-8">
      <header className="mx-auto max-w-5xl text-center">
        <Trophy className="mx-auto mb-4 size-12 text-secondary" fill="currentColor" />
        <p className="font-display text-[10px] text-primary-foreground/80">
          {final ? "THE CROWD HAS SPOKEN" : `ROUND ${currentRound} OF ${settings.totalRounds}`}
        </p>
        <h1 className="mt-3 font-display text-2xl text-primary-foreground text-shadow-pixel md:text-4xl">
          {final ? "FINAL RESULTS" : "ROUND RANKINGS"}
        </h1>
      </header>

      {/* --- RESPONSIVE RESULTS GRID WRAPPER --- */}
      <section className="mx-auto mt-8 max-w-5xl border-4 border-foreground bg-card p-5 pixel-shadow-lg md:p-8">
        {final ? (
          /* --- FINAL MATCH END GAME PODIUM LAYOUT --- */
          <div className="grid min-h-[330px] grid-cols-3 items-end gap-2 md:gap-5">
            {[sorted[1], sorted[0], sorted[2]].map(
              (standing, index) =>
                standing && (
                  <Podium
                    key={standing.playerId}
                    standing={standing}
                    place={([2, 1, 3][index] ?? index + 1)}
                    delay={index * 0.18}
                  />
                )
            )}
          </div>
        ) : (
          /* --- MID-GAME ROUND RANKINGS LIST (UNTOUCHED ORIGINAL UI) --- */
          <div className="space-y-3">
            {sorted.map((standing, index) => (
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                key={standing.playerId}
                className="flex items-center gap-4 border-4 border-foreground bg-background p-4 pixel-shadow-sm"
              >
                <span className="font-display text-sm">#{standing.rank ?? index + 1}</span>
                <strong className="flex-1 font-display text-[10px]">{standing.username || "Unknown"}</strong>
                <span className="flex items-center gap-2 font-display text-[10px]">
                  <Star fill="currentColor" className="text-secondary" />
                  {score(standing)}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* --- EXTRA PLAYER RUNNER-UP ROSTER (FINAL RESULTS ONLY) --- */}
        {final && sorted.length > 3 && (
          <div className="mt-6 space-y-2 border-t-4 border-foreground pt-5">
            {sorted.slice(3).map((standing, index) => (
              <div key={standing.playerId || index} className="flex items-center border-2 border-foreground px-4 py-3 font-bold">
                <span className="mr-4 font-display text-[9px]">#{index + 4}</span>
                <span className="flex-1">{standing.username || "Unknown"}</span>
                <span>★ {score(standing)}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- INTERACTIVE ACTION BUTTON CONTROLS --- */}
        {final && isHost && (
          <PixelButton className="mx-auto mt-7 flex" onClick={triggerPlayAgain}>
            <RotateCcw className="mr-2 size-4" /> PLAY AGAIN
          </PixelButton>
        )}
        
        {final && !isHost && (
          <p className="mt-7 text-center font-display text-[9px] tracking-wider animate-pulse text-foreground">
            WAITING FOR HOST TO RESET...
          </p>
        )}
      </section>
    </main>
  );
}

function Podium({ standing, place, delay }: { standing: any; place: number; delay: number }) { 
  const heights = { 1: "h-56", 2: "h-40", 3: "h-32" }; 
  return (
    <div className="text-center">
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", delay }}>
        <div className="mb-3 min-h-20">
          <Crown className={`mx-auto mb-2 ${place === 1 ? "text-secondary" : "text-muted-foreground"}`} fill="currentColor" />
          <p className="break-words font-display text-[8px] leading-relaxed md:text-[10px]">{standing.username || "Unknown"}</p>
          <p className="mt-2 font-display text-[9px]">★ {score(standing)}</p>
        </div>
        <div className={`${heights[place as keyof typeof heights]} flex items-start justify-center border-4 border-foreground bg-primary pt-6 text-primary-foreground pixel-shadow`}>
          <span className="font-display text-2xl">{place}</span>
        </div>
      </motion.div>
    </div>
  ); 
}