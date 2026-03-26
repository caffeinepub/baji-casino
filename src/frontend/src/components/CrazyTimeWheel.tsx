import { useCallback, useEffect, useRef } from "react";

const SEGMENTS = [
  "1x",
  "1x",
  "1x",
  "1x",
  "1x",
  "1x",
  "1x",
  "1x",
  "2x",
  "2x",
  "2x",
  "2x",
  "5x",
  "5x",
  "10x",
  "CRAZY!",
];

const COLORS = [
  "#e63946",
  "#2196f3",
  "#e63946",
  "#2196f3",
  "#e63946",
  "#2196f3",
  "#e63946",
  "#2196f3",
  "#f4a261",
  "#2a9d8f",
  "#f4a261",
  "#2a9d8f",
  "#8338ec",
  "#06d6a0",
  "#ffd60a",
  "#ff006e",
];

const SEGMENT_ANGLE = (2 * Math.PI) / SEGMENTS.length;

function drawWheel(
  ctx: CanvasRenderingContext2D,
  rotation: number,
  size: number,
) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 6;

  ctx.clearRect(0, 0, size, size);

  // Draw segments
  for (let i = 0; i < SEGMENTS.length; i++) {
    const startAngle = rotation + i * SEGMENT_ANGLE - Math.PI / 2;
    const endAngle = startAngle + SEGMENT_ANGLE;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = COLORS[i];
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw segment labels
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < SEGMENTS.length; i++) {
    const midAngle =
      rotation + i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 - Math.PI / 2;
    const labelRadius = radius * 0.68;
    const lx = cx + labelRadius * Math.cos(midAngle);
    const ly = cy + labelRadius * Math.sin(midAngle);

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${SEGMENTS[i] === "CRAZY!" ? Math.floor(size * 0.045) : Math.floor(size * 0.055)}px sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(SEGMENTS[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.07, 0, 2 * Math.PI);
  ctx.fillStyle = "#1a1a2e";
  ctx.fill();
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Pointer triangle at top
  ctx.beginPath();
  ctx.moveTo(cx, 2);
  ctx.lineTo(cx - 10, 22);
  ctx.lineTo(cx + 10, 22);
  ctx.closePath();
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "rgba(255,215,0,0.8)";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
}

interface CrazyTimeWheelProps {
  spinning: boolean;
  result: string;
  onSpinComplete?: () => void;
}

export function CrazyTimeWheel({
  spinning,
  result,
  onSpinComplete,
}: CrazyTimeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const spinningRef = useRef(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawWheel(ctx, rotationRef.current, canvas.width);
  }, []);

  // Initial draw
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Spin animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;

    if (!spinning) {
      spinningRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const resultIndex = SEGMENTS.findIndex((s) => s === result);
    const targetIndex = resultIndex >= 0 ? resultIndex : 0;

    const targetSegmentCenter = targetIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const targetRotation = -targetSegmentCenter + 2 * Math.PI * 5;

    const startRotation = rotationRef.current;
    const totalRotation =
      targetRotation +
      (2 * Math.PI -
        (((startRotation % (2 * Math.PI)) + targetRotation) % (2 * Math.PI)));
    const duration = 3500;
    const startTime = performance.now();

    spinningRef.current = true;

    function easeOut(t: number) {
      return 1 - (1 - t) ** 4;
    }

    function animate(now: number) {
      if (!spinningRef.current) return;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = easeOut(t);

      rotationRef.current = startRotation + totalRotation * easedT;
      drawWheel(ctx!, rotationRef.current, size);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        spinningRef.current = false;
        onSpinComplete?.();
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [spinning, result, onSpinComplete]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="max-w-full"
        style={{
          filter: spinning
            ? "drop-shadow(0 0 12px rgba(255,215,0,0.6))"
            : "drop-shadow(0 0 6px rgba(255,215,0,0.3))",
        }}
      />
    </div>
  );
}
