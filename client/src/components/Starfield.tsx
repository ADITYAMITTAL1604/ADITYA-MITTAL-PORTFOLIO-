import { useEffect, useRef } from "react";

/**
 * Starfield — 3D Galaxy Cruising Effect
 * Stars emit from a central vanishing point and move outward,
 * creating the illusion of flying forward through space.
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

    // Mouse position for subtle camera shifting
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const STAR_COUNT = 1500; // Increased density
    const MAX_DEPTH = 1000; // How deep the Z axis goes
    const BASE_SPEED = 2.8; // Increased cruising speed

    interface Star {
      x: number;
      y: number;
      z: number;
      pz: number; // Previous Z (for drawing trails)
      size: number;
      hue: number;
    }
    
    let stars: Star[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      resize();
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: (Math.random() - 0.5) * W * 4, // Spread wide in 3D space
          y: (Math.random() - 0.5) * H * 4,
          z: Math.random() * MAX_DEPTH,
          pz: Math.random() * MAX_DEPTH,
          size: Math.random() * 1.5 + 0.5,
          hue: 240 + Math.random() * 60, // Violet/Purple spectrum
        });
      }
    };

    init();
    
    const onResize = () => init();
    const onMouseMove = (e: MouseEvent) => {
      // Mouse drives vanishing point shift (normalized -1 to 1)
      targetMouseX = (e.clientX / W - 0.5) * 200;
      targetMouseY = (e.clientY / H - 0.5) * 200;
    };
    
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      // Smoothly interpolate vanishing point towards mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Center of screen + mouse shift
      const cx = W / 2 - mouseX;
      const cy = H / 2 - mouseY;

      for (const star of stars) {
        star.pz = star.z;
        star.z -= BASE_SPEED; // Move star closer to camera

        // Reset if it passes the camera (z <= 0)
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * W * 4;
          star.y = (Math.random() - 0.5) * H * 4;
          star.z = MAX_DEPTH;
          star.pz = MAX_DEPTH;
        }

        // 3D Projection math
        // proj = MAX_DEPTH / z
        const proj = MAX_DEPTH / star.z;
        const pProj = MAX_DEPTH / star.pz;

        // Current screen coordinates
        const sx = star.x * proj + cx;
        const sy = star.y * proj + cy;

        // Previous screen coordinates (for motion blur/trails)
        const px = star.x * pProj + cx;
        const py = star.y * pProj + cy;

        // Size scaling based on depth
        const sSize = star.size * proj * 0.7; // Increased size multiplier
        
        // Alpha fades in from deep space
        const alpha = Math.min(1, (MAX_DEPTH - star.z) / (MAX_DEPTH * 0.5));

        // Draw star + motion trail
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        
        // The closer it is (faster moving on screen), the longer the trail
        // We use lineWidth for size
        ctx.lineWidth = sSize;
        ctx.lineCap = "round";
        ctx.strokeStyle = `hsla(${star.hue}, 80%, 95%, ${alpha})`; // Increased brightness
        ctx.stroke();

        // Optional: draw core for very close stars
        if (star.z < MAX_DEPTH * 0.3) {
          ctx.beginPath();
          ctx.arc(sx, sy, sSize * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${star.hue}, 80%, 100%, ${alpha})`;
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
      aria-hidden="true"
    />
  );
}
