import { useEffect, useRef } from "react";

/**
 * ParticleMorph — WebGL-quality Canvas2D particle system
 *
 * Phases based on scroll progress:
 * 1. HERO (scroll 0–15%): 4-pointed star/astroid shape, centered
 * 2. TRANSITION (15–25%): Star morphs into vertical diamond/column, slides left
 * 3. MID-SECTION (25–70%): Diamond/column stays on left side of viewport
 * 4. TRANSITION (70–82%): Column morphs into letter "A"
 * 5. FOOTER (82–100%): Letter "A" centered
 *
 * Cursor interaction: Strong repulsion — particles flee from cursor
 * and spring back elastically when cursor leaves.
 */
export default function ParticleMorph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── State ──
    let animId: number;
    let W = 0;
    let H = 0;
    let scrollProgress = 0;
    let destroyed = false;
    const mouse = { x: -9999, y: -9999, active: false };

    // Detect mobile for performance optimization
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 350 : 800;
    const MOUSE_RADIUS = isMobile ? 180 : 250;
    const MOUSE_FORCE = isMobile ? 80 : 100;

    // ── Particle type ──
    interface P {
      x: number; y: number; z: number;
      tx: number; ty: number; tz: number;
      vx: number; vy: number; vz: number;
      size: number;
      hue: number;
      sat: number;
      light: number;
    }

    let particles: P[] = [];

    // ── Resize (HiDPI aware) ──
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
    window.addEventListener("resize", resize);

    // ── Scroll tracking ──
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ── Mouse tracking ──
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    // ── Touch tracking (for mobile interaction) ──
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    const onTouchEnd = () => { mouse.active = false; };
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // ════════════════════════════════════════════
    // SHAPE GENERATORS
    // ════════════════════════════════════════════

    /** 1. Star / Astroid (4-pointed cusp shape) */
    const generateStar = (): { x: number; y: number; z: number }[] => {
      const pts: { x: number; y: number; z: number }[] = [];
      const scale = Math.min(W, H) * 0.32;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.55) * scale;
        const x = r * Math.pow(Math.cos(theta), 3);
        const y = r * Math.pow(Math.sin(theta), 3);
        const z = (Math.random() - 0.5) * 350;
        pts.push({ x, y, z });
      }
      return pts;
    };

    /** 2. Diamond / Vertical column */
    const generateDiamond = (): { x: number; y: number; z: number }[] => {
      const pts: { x: number; y: number; z: number }[] = [];
      const height = H * 0.65;
      const maxWidth = Math.min(W * 0.06, 70);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const yNorm = Math.random();
        const y = (yNorm - 0.5) * height;
        const widthAtY = maxWidth * (1 - Math.abs(yNorm - 0.5) * 1.6);
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * Math.max(widthAtY, 5);
        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle) * 0.8 + (Math.random() - 0.5) * 60;
        pts.push({ x, y, z });
      }
      return pts;
    };

    /** 3. Letter "A" sampled from offscreen canvas */
    const generateLetter = (): { x: number; y: number; z: number }[] => {
      const pts: { x: number; y: number; z: number }[] = [];
      const tmpCanvas = document.createElement("canvas");
      const S = 500;
      tmpCanvas.width = S;
      tmpCanvas.height = S;
      const tCtx = tmpCanvas.getContext("2d");
      if (!tCtx) return pts;

      tCtx.fillStyle = "white";
      tCtx.font = "italic 900 420px 'Instrument Serif', serif";
      tCtx.textAlign = "center";
      tCtx.textBaseline = "middle";
      tCtx.fillText("A", S / 2, S / 2 + 20);

      const imgData = tCtx.getImageData(0, 0, S, S).data;
      const validPixels: { x: number; y: number }[] = [];

      for (let py = 0; py < S; py += 2) {
        for (let px = 0; px < S; px += 2) {
          if (imgData[(py * S + px) * 4 + 3] > 128) {
            validPixels.push({ x: px - S / 2, y: py - S / 2 });
          }
        }
      }

      if (validPixels.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          pts.push({ x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, z: 0 });
        }
        return pts;
      }

      const letterScale = Math.min(W, H) * 0.0020;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = validPixels[Math.floor(Math.random() * validPixels.length)];
        const jitter = 4;
        pts.push({
          x: (p.x + (Math.random() - 0.5) * jitter) * letterScale,
          y: (p.y + (Math.random() - 0.5) * jitter) * letterScale,
          z: (Math.random() - 0.5) * 100,
        });
      }
      return pts;
    };

    let shapeStar: { x: number; y: number; z: number }[] = [];
    let shapeDiamond: { x: number; y: number; z: number }[] = [];
    let shapeLetter: { x: number; y: number; z: number }[] = [];

    const regenerateShapes = () => {
      if (W === 0 || H === 0) return;
      shapeStar = generateStar();
      shapeDiamond = generateDiamond();
      shapeLetter = generateLetter();
    };

    const initParticles = () => {
      resize();
      regenerateShapes();

      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const s = shapeStar[i];
        particles.push({
          // Start scattered for dramatic convergence
          x: (Math.random() - 0.5) * W * 1.5,
          y: (Math.random() - 0.5) * H * 1.5,
          z: (Math.random() - 0.5) * 600,
          tx: s ? s.x : 0,
          ty: s ? s.y : 0,
          tz: s ? s.z : 0,
          vx: 0,
          vy: 0,
          vz: 0,
          size: Math.random() * 1.2 + 0.3,
          hue: 260 + Math.random() * 40,
          sat: 60 + Math.random() * 30,
          light: 45 + Math.random() * 30,
        });
      }
    };

    // ── Smoothstep ──
    const smoothstep = (edge0: number, edge1: number, x: number) => {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };

    // ── Perspective projection ──
    const PERSPECTIVE = 1000;

    let time = 0;
    let prevTime = 0;

    // ═══════════════════════════════════════════
    // ANIMATION LOOP
    // ═══════════════════════════════════════════
    const animate = (now: number) => {
      if (destroyed) return;

      if (prevTime === 0) prevTime = now;
      const dt = Math.min((now - prevTime) / 16.667, 3);
      prevTime = now;
      time += 0.006 * dt;

      ctx.clearRect(0, 0, W, H);

      // Guard: if shapes aren't ready, skip
      if (!shapeStar.length || !particles.length) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const sp = scrollProgress;

      // ── Determine morph state ──
      let shapeA = shapeStar;
      let shapeB = shapeStar;
      let morphT = 0;

      if (sp < 0.15) {
        shapeA = shapeStar;
        shapeB = shapeStar;
        morphT = 0;
      } else if (sp < 0.25) {
        shapeA = shapeStar;
        shapeB = shapeDiamond;
        morphT = smoothstep(0.15, 0.25, sp);
      } else if (sp < 0.68) {
        shapeA = shapeDiamond;
        shapeB = shapeDiamond;
        morphT = 0;
      } else if (sp < 0.82) {
        shapeA = shapeDiamond;
        shapeB = shapeLetter;
        morphT = smoothstep(0.68, 0.82, sp);
      } else {
        shapeA = shapeLetter;
        shapeB = shapeLetter;
        morphT = 0;
      }

      // ── Center offset: diamond slides left ──
      let offsetX = 0;
      let offsetY = 0;
      if (sp > 0.18 && sp < 0.72) {
        const slideIn = smoothstep(0.18, 0.28, sp);
        const slideOut = 1 - smoothstep(0.62, 0.72, sp);
        offsetX = -Math.min(W * 0.25, 320) * slideIn * slideOut;
      }

      if (sp > 0.25 && sp < 0.65) {
        offsetY = -20;
      }

      const cx = W / 2 + offsetX;
      const cy = H / 2 + offsetY;

      // ── Opacity: fade out during certain sections ──
      let globalOpacity = 1;
      if (sp > 0.5 && sp < 0.55) {
        globalOpacity = 1 - smoothstep(0.5, 0.55, sp);
      } else if (sp >= 0.55 && sp < 0.62) {
        globalOpacity = 0;
      } else if (sp >= 0.62 && sp < 0.68) {
        globalOpacity = smoothstep(0.62, 0.68, sp);
      }

      if (globalOpacity < 0.01) {
        animId = requestAnimationFrame(animate);
        return;
      }

      // ── Update particles ──
      const spring = 0.035 * dt;
      const friction = Math.pow(0.86, dt);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        const a = shapeA[i];
        const b = shapeB[i];
        if (!a || !b) continue;

        let tx = a.x + (b.x - a.x) * morphT;
        let ty = a.y + (b.y - a.y) * morphT;
        let tz = a.z + (b.z - a.z) * morphT;

        const f = time + i * 0.004;
        tx += Math.sin(f * 1.1 + i * 0.01) * 4;
        ty += Math.cos(f * 0.8 + i * 0.02) * 4;
        tz += Math.sin(f * 0.5 + i * 0.015) * 5;

        // ── Cursor / Touch repulsion ──
        if (mouse.active) {
          const projScale = PERSPECTIVE / (PERSPECTIVE + p.z);
          const screenX = cx + p.x * projScale;
          const screenY = cy + p.y * projScale;
          const dx = screenX - mouse.x;
          const dy = screenY - mouse.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = MOUSE_RADIUS * MOUSE_RADIUS;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS);
            const forceCubed = force * force * force;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * forceCubed * MOUSE_FORCE * dt;
            p.vy += Math.sin(angle) * forceCubed * MOUSE_FORCE * dt;
            p.vz += (Math.random() - 0.5) * forceCubed * 20 * dt;
          }
        }

        p.vx += (tx - p.x) * spring;
        p.vy += (ty - p.y) * spring;
        p.vz += (tz - p.z) * spring;

        p.vx *= friction;
        p.vy *= friction;
        p.vz *= friction;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
      }

      // ── Sort by Z for depth rendering ──
      particles.sort((a, b) => a.z - b.z);

      // ── Draw ──
      ctx.globalAlpha = globalOpacity;

      for (const p of particles) {
        const projScale = PERSPECTIVE / (PERSPECTIVE + p.z);
        const drawX = cx + p.x * projScale;
        const drawY = cy + p.y * projScale;
        const drawSize = p.size * projScale;

        if (drawX < -80 || drawX > W + 80 || drawY < -80 || drawY > H + 80) continue;

        const zNorm = (p.z + 350) / 700;
        const zAlpha = 0.06 + zNorm * 0.85;

        if (!isMobile) {
          // ── Outer glow (skip on mobile for performance) ──
          const glowRadius = drawSize * 3.5;
          const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowRadius);
          grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${zAlpha * 0.25})`);
          grad.addColorStop(0.4, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${zAlpha * 0.08})`);
          grad.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(drawX, drawY, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // ── Bright core ──
        ctx.globalAlpha = globalOpacity * zAlpha * 0.8;
        ctx.fillStyle = `hsl(${p.hue}, 40%, 85%)`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, isMobile ? drawSize * 0.9 : drawSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = globalOpacity;
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    // ══════════════════════════════════════
    // DELAYED INITIALIZATION
    // Wait for the preloader to finish (2.6s) so the particles
    // dramatically converge right as the preloader opens up.
    // ══════════════════════════════════════
    const PRELOADER_DURATION = 2700; // slightly after preloader dismisses

    const startTimeout = setTimeout(() => {
      if (destroyed) return;
      // Wait for fonts too (for the letter "A" shape)
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      fontsReady.then(() => {
        if (destroyed) return;
        initParticles();
        prevTime = 0; // reset so first dt is clean
        animId = requestAnimationFrame(animate);
      });
    }, PRELOADER_DURATION);

    // ── Cleanup ──
    return () => {
      destroyed = true;
      clearTimeout(startTimeout);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[2] pointer-events-none"
      style={{ willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
