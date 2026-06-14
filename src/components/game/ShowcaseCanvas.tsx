import { useEffect, useRef } from "react";
import type { Stroke, Point } from "@/game/types";

interface ShowcaseCanvasProps {
  strokes: Stroke[];
  className?: string;
  width?: number;
  height?: number;
}

export function ShowcaseCanvas({ strokes, className, width = 1000, height = 650 }: ShowcaseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset/clear target canvas with solid white background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const originalSize = 600;
    const targetWidth = canvas.width;
    const targetHeight = canvas.height;

    // Calculate scale factor and offsets to fit a 600x600 square inside target canvas size keeping aspect ratio
    const scale = Math.min(targetWidth / originalSize, targetHeight / originalSize);
    const xOffset = (targetWidth - originalSize * scale) / 2;
    const yOffset = (targetHeight - originalSize * scale) / 2;

    for (const stroke of strokes || []) {
      if (!stroke) continue;

      // Parse points robustly (handles both Point[] and flat number[])
      let points: Point[] = [];
      const rawPoints = stroke.points;
      if (Array.isArray(rawPoints) && rawPoints.length > 0) {
        if (typeof rawPoints[0] === "object" && rawPoints[0] !== null && "x" in rawPoints[0]) {
          points = rawPoints as Point[];
        } else {
          // Flat array of numbers: [x1, y1, x2, y2, ...]
          for (let i = 0; i < rawPoints.length; i += 2) {
            const x = rawPoints[i];
            const y = rawPoints[i + 1];
            if (typeof x === "number" && typeof y === "number") {
              points.push({ x, y });
            }
          }
        }
      }

      if (stroke.tool === "fill") {
        ctx.fillStyle = stroke.color;
        // Fill the square region representing the drawing plane
        ctx.fillRect(xOffset, yOffset, originalSize * scale, originalSize * scale);
        continue;
      }

      if (points.length === 0) continue;

      ctx.beginPath();
      ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color;
      ctx.lineWidth = stroke.brushSize * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (points.length === 1) {
        const p = points[0];
        const px = xOffset + p.x * scale;
        const py = yOffset + p.y * scale;
        ctx.moveTo(px, py);
        ctx.lineTo(px + 0.1, py);
      } else {
        points.forEach((p, i) => {
          const px = xOffset + p.x * scale;
          const py = yOffset + p.y * scale;
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });
      }
      ctx.stroke();
    }
  }, [strokes, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}
