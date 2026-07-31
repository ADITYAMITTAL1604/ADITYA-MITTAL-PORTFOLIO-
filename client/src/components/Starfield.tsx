import { useEffect, useRef } from "react";

/**
 * Starfield — 3D Galaxy Cruising Effect (High Intensity & High Performance)
 * Stars emit from a central vanishing point and move outward at higher speed & brightness.
 */
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const isMobile = window.innerWidth < 768;
    const STAR_COUNT = isMobile ? 400 : 800;
    const MAX_DEPTH = 1000;
    const BASE_SPEED = 4.2; // Increased speed for faster space travel

    // Use typed arrays for maximum CPU cache efficiency
    const x = new Float32Array(STAR_COUNT);
    const y = new Float32Array(STAR_COUNT);
    const z = new Float32Array(STAR_COUNT);
    const pz = new Float32Array(STAR_COUNT);
    const size = new Float32Array(STAR_COUNT);
    const hue = new Float32Array(STAR_COUNT);

    const resize = () => {
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      if (W === 0 || H === 0) return;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      resize();
      for (let i = 0; i < STAR_COUNT; i++) {
        x[i] = (Math.random() - 0.5) * W * 4;
        y[i] = (Math.random() - 0.5) * H * 4;
        z[i] = Math.random() * MAX_DEPTH;
        pz[i] = z[i];
        size[i] = Math.random() * 1.8 + 0.6; // Slightly larger stars
        hue[i] = 230 + Math.random() * 70; // Vibrant violet to cyan spectrum
      }
    };

    init();
    
    const onResize = () => init();
    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / W - 0.5) * 180;
      targetMouseY = (e.clientY / H - 0.5) * 180;
    };
    
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const cx = W / 2 - mouseX;
      const cy = H / 2 - mouseY;

      ctx.lineCap = "round";

      for (let i = 0; i < STAR_COUNT; i++) {
        pz[i] = z[i];
        z[i] -= BASE_SPEED;

        if (z[i] <= 0) {
          x[i] = (Math.random() - 0.5) * W * 4;
          y[i] = (Math.random() - 0.5) * H * 4;
          z[i] = MAX_DEPTH;
          pz[i] = MAX_DEPTH;
        }

        const proj = MAX_DEPTH / z[i];
        const pProj = MAX_DEPTH / pz[i];

        const sx = x[i] * proj + cx;
        const sy = y[i] * proj + cy;

        // Skip rendering if off screen
        if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;

        const px = x[i] * pProj + cx;
        const py = y[i] * pProj + cy;

        const sSize = size[i] * proj * 0.85;
        const alpha = Math.min(1, (MAX_DEPTH - z[i]) / (MAX_DEPTH * 0.45));

        // Draw motion trail line with high opacity
        ctx.lineWidth = Math.max(0.7, sSize);
        ctx.strokeStyle = `hsla(${hue[i]}, 85%, 96%, ${alpha * 0.95})`;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // Draw bright core for close stars
        if (z[i] < MAX_DEPTH * 0.35) {
          ctx.fillStyle = `hsla(${hue[i]}, 90%, 100%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, sSize * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
