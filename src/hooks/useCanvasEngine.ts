import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Stroke, Point } from "@/game/types";

export function drawStrokes(canvas: HTMLCanvasElement, strokes: Stroke[]) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (const stroke of strokes || []) {
    if (!stroke) continue;
    if (stroke.tool === "fill") { 
      ctx.fillStyle = stroke.color; 
      ctx.fillRect(0, 0, canvas.width, canvas.height); 
      continue; 
    }
    
    ctx.beginPath(); 
    ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color; 
    ctx.lineWidth = stroke.brushSize; 
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    
    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.1, p.y);
    } else {
      stroke.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
    }
    ctx.stroke();
  }
}

export function useCanvasEngine(disabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  const current = useRef<Stroke | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]); 
  const [redo, setRedo] = useState<Stroke[]>([]);
  const [color, setColor] = useState("#171717"); 
  const [brushSize, setBrushSize] = useState(6); 
  const [tool, setTool] = useState<"brush" | "eraser">("brush");

  // Keep a direct ref mirror of state so high-frequency render frames stay perfectly synchronized
  const strokesRef = useRef<Stroke[]>([]);
  
  useEffect(() => {
    strokesRef.current = strokes;
    const canvas = canvasRef.current;
    if (canvas) {
      drawStrokes(canvas, strokes);
    }
  }, [strokes]);

  const redraw = useCallback((next: Stroke[]) => { 
    const canvas = canvasRef.current; 
    if (canvas) drawStrokes(canvas, next); 
  }, []);
  
  const getPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => { 
    const box = event.currentTarget.getBoundingClientRect(); 
    return {
      x: (event.clientX - box.left) * (event.currentTarget.width / box.width),
      y: (event.clientY - box.top) * (event.currentTarget.height / box.height)
    };
  };

  const down = (event: ReactPointerEvent<HTMLCanvasElement>) => { 
    if (disabled) return; 
    event.currentTarget.setPointerCapture(event.pointerId); 
    current.current = { points: [getPoint(event)], color, brushSize, tool }; 
  };

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => { 
    if (!current.current || disabled) return; 
    current.current.points.push(getPoint(event)); 
    redraw([...strokesRef.current, current.current]); 
  };
  
  const up = (event: ReactPointerEvent<HTMLCanvasElement>) => { 
    if (!current.current) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // safe fallback
    }

    const finishedStroke = current.current;
    current.current = null; 
    
    setStrokes((prev) => [...prev, finishedStroke]); 
    setRedo([]); 
  };

  return { 
    canvasRef, strokes, color, setColor, brushSize, setBrushSize, tool, setTool, down, move, up,
    undo: () => setStrokes((prev) => { const last = prev.at(-1); if (last) setRedo((r) => [...r, last]); return prev.slice(0, -1); }),
    redo: () => setRedo((prev) => { const last = prev.at(-1); if (last) setStrokes((s) => [...s, last]); return prev.slice(0, -1); }),
    clear: () => { setStrokes([]); setRedo([]); },
    fill: () => { setStrokes((prev) => [...prev, { points: [], color, brushSize: 0, tool: "fill" }]); setRedo([]); },
    canUndo: strokes.length > 0, 
    canRedo: redo.length > 0
  };
}