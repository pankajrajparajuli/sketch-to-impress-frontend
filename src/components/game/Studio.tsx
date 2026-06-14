import { useEffect, useRef, useState } from "react";
import { Brush, Eraser, RotateCcw, RotateCw, Send, Trash2 } from "lucide-react";
import { useGameStore } from "@/game/store";
import { emitGame } from "@/game/socket";
import { useCountdown } from "@/hooks/useCountdown";
import { useCanvasEngine } from "@/hooks/useCanvasEngine";
import { PixelButton } from "./PixelButton";

const colors = ["#171717", "#e94b35", "#f7d51d", "#38a852", "#2774d8", "#8e44ad", "#ff8ac6", "#ffffff"];

export function Studio() {
  const { prompt, currentRound, settings, roundEndTimestamp, serverOffset } = useGameStore();
  const [submitted, setSubmitted] = useState(false); 
  const submitting = useRef(false);
  const setError = useGameStore((state) => state.setError);
  
  const canvas = useCanvasEngine(submitted); 
  const seconds = useCountdown(roundEndTimestamp, serverOffset);

  function submit() { 
    if (submitting.current || submitted) return; 
    submitting.current = true; 

    // Filter out invalid structures safely
    const validStrokes = canvas.strokes.filter(
      (stroke) => stroke !== null && typeof stroke === 'object'
    );

    // Map according to StrokeDto specification
    const formattedStrokes = validStrokes.map(stroke => ({
  color: stroke.color,
  brushSize: stroke.brushSize,
  points: (stroke.points || []).map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }))
}));


    console.log("[Studio] Emitting SubmitDrawingDto:", { strokes: formattedStrokes });

    // Instantly show local overlay state so the UI feels responsive
    setSubmitted(true);

    // MATCH BACKEND CHANNELS EXACTLY: Event string and payload payload structure
    emitGame("v1:canvas:submit_drawing", { strokes: formattedStrokes }, (res: any) => {
      if (res && res.success) {
        console.log("[Studio] Server confirmed artwork accepted! Stroke count:", res.strokeCount);
      } else {
        console.warn("[Studio] Submission acknowledgment failure or skipped. Awaiting phase change event.");
      }
    });
  }

  // Auto-submit fallback when round timer hits 0
  useEffect(() => {
    if (seconds <= 0 && !submitted && !submitting.current) {
      submit();
    }
  }, [seconds, submitted]);

  return (
    <main className="studio-sky min-h-screen px-4 py-6 md:p-8">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar Controls */}
        <section className="flex flex-col border-4 border-foreground bg-card p-4 pixel-shadow">
          <div className="mb-4 text-center md:text-left">
            <p className="font-display text-[9px] text-muted-foreground uppercase">ROUND {currentRound} OF {settings.totalRounds}</p>
            <h1 className="mt-1 font-display text-xl text-primary break-words uppercase">{prompt || "DRAWING PHASE"}</h1>
          </div>

          <div className="my-4 border-t-4 border-dashed border-muted" />

          {/* Color Matrix */}
          <p className="mb-3 font-display text-[8px] uppercase text-muted-foreground">SELECT COLOR</p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => canvas.setColor(c)}
                disabled={submitted}
                style={{ backgroundColor: c }}
                className={`aspect-square border-4 transition-transform active:scale-95 ${
                  canvas.color === c ? "border-secondary scale-105" : "border-foreground"
                }`}
                title={c}
              />
            ))}
          </div>

          {/* Brush Sizes */}
          <p className="mb-3 font-display text-[8px] uppercase text-muted-foreground">BRUSH SIZE</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[4, 8, 16].map((size) => (
              <button
                key={size}
                onClick={() => canvas.setBrushSize(size)}
                disabled={submitted}
                className={`min-h-10 border-4 border-foreground font-display text-[9px] ${
                  canvas.brushSize === size ? "bg-secondary" : "bg-background"
                }`}
              >
                {size === 4 ? "SM" : size === 8 ? "MD" : "LG"}
              </button>
            ))}
          </div>

          {/* Tool Options */}
          <p className="mb-3 font-display text-[8px] uppercase text-muted-foreground">TOOLS</p>
          <div className="flex flex-col gap-2">
            <Tool active={canvas.tool === "brush"} onClick={() => canvas.setTool("brush")} icon={<Brush size={14}/>} label="BRUSH" />
            <Tool active={canvas.tool === "eraser"} onClick={() => canvas.setTool("eraser")} icon={<Eraser size={14}/>} label="ERASER" />
          </div>
        </section>

        {/* Drawing Workspace Canvas Container */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between border-4 border-b-0 border-foreground bg-card px-4 py-2 font-display text-[9px]">
            <span className="flex items-center gap-2 font-bold"><Brush size={12}/> STUDIO CANVAS</span>
            <span className={`font-bold ${seconds <= 10 ? "animate-pulse text-destructive" : ""}`}>
              TIME REMAINING: {seconds}S
            </span>
          </div>

          <div className="relative aspect-square w-full border-4 border-foreground bg-white overflow-hidden pixel-shadow-lg">
            <canvas
              ref={(canvasRef) => {
                if (canvasRef) {
                  (canvas.canvasRef as any).current = canvasRef;
                }
              }}
              onPointerDown={canvas.down}
              onPointerMove={canvas.move}
              onPointerUp={canvas.up}
              width={600}
              height={600}
              className="absolute inset-0 size-full cursor-crosshair touch-none"
            />

            {submitted && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-foreground/80 p-4 animate-fade-in">
                <div className="border-4 border-foreground bg-primary p-6 text-center text-primary-foreground pixel-shadow max-w-xs">
                  <p className="font-display text-sm animate-bounce">ART LOCKED IN!</p>
                  <p className="mt-3 font-bold text-sm">Waiting for other players to finish...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Footer Button Rails */}
          <div className="mt-4 grid grid-cols-4 gap-2 md:flex">
            <PixelButton tone="plain" onClick={canvas.undo} disabled={!canvas.canUndo || submitted} aria-label="Undo">
              <RotateCcw/><span className="hidden md:inline">UNDO</span>
            </PixelButton>
            <PixelButton tone="plain" onClick={canvas.redo} disabled={!canvas.canRedo || submitted} aria-label="Redo">
              <RotateCw/><span className="hidden md:inline">REDO</span>
            </PixelButton>
            <PixelButton tone="red" onClick={canvas.clear} disabled={submitted} aria-label="Clear">
              <Trash2/><span className="hidden md:inline">CLEAR</span>
            </PixelButton>
            <PixelButton className="md:ml-auto" onClick={submit} disabled={submitted || !canvas.strokes || canvas.strokes.length === 0}>
              <Send/><span className="hidden md:inline">SUBMIT ART</span>
            </PixelButton>
          </div>
        </section>
      </div>
    </main>
  );
}

function Tool({ active = false, onClick, icon, label }: { active?: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { 
  return (
    <button onClick={onClick} className={`flex min-h-12 items-center justify-center gap-2 border-4 border-foreground px-2 font-display text-[8px] ${active ? "bg-secondary" : "bg-background pixel-shadow-sm"}`}>
      {icon} <span className="font-bold">{label}</span>
    </button>
  );
}