import { useEffect, useRef } from "react";

/**
 * Starfield — 3D Galaxy Cruising Effect (High Performance)
 * Stars emit from a central vanishing point and move outward.
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
    const STAR_COUNT = isMobile ? 250 : 500;
    const MAX_DEPTH = 1000;
    const BASE_SPEED = 2.5;

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
        size[i] = Math.random() * 1.5 + 0.5;
        hue[i] = 240 + Math.random() * 60;
      }
    };

    init();
    
    const onResize = () => init();
    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / W - 0.5) * 150;
      targetMouseY = (e.clientY / H - 0.5) * 150;
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
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;

        const px = x[i] * pProj + cx;
        const py = y[i] * pProj + cy;

        const sSize = size[i] * proj * 0.6;
        const alpha = Math.min(1, (MAX_DEPTH - z[i]) / (MAX_DEPTH * 0.5));

        ctx.lineWidth = Math.max(0.5, sSize);
        ctx.strokeStyle = `hsla(${hue[i]}, 80%, 95%, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
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
