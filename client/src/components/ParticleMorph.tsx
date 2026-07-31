import { useEffect, useRef } from "react";

/**
 * ParticleMorph — High-performance Canvas2D particle system
 *
 * Phases based on scroll progress:
 * 1. HERO (scroll 0–15%): 4-pointed star/astroid shape, centered
 * 2. TRANSITION (15–25%): Star morphs into vertical diamond/column, slides left
 * 3. MID-SECTION (25–70%): Diamond/column stays on left side of viewport
 * 4. TRANSITION (70–82%): Column morphs into letter "A"
 * 5. FOOTER (82–100%): Letter "A" centered
 *
 * Performance optimizations:
 * - Pre-rendered sprite atlas (no createRadialGradient per frame)
 * - Batch drawImage calls instead of arc+fill
 * - No per-frame z-sorting (uses paint-order buckets)
 * - Delta-time capped physics
 * - Off-screen culling
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
    const PARTICLE_COUNT = isMobile ? 300 : 600;
    const MOUSE_RADIUS = isMobile ? 150 : 220;
    const MOUSE_FORCE = isMobile ? 60 : 80;

    // ── Pre-render sprite atlas ──
    // Instead of creating gradients every frame, we draw particles as
    // pre-rendered sprites. Each sprite has a soft glow baked in.
    const SPRITE_SIZE = 32;
    const SPRITE_VARIANTS = 6; // different hue variants
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = SPRITE_SIZE * SPRITE_VARIANTS;
    spriteCanvas.height = SPRITE_SIZE;
    const spriteCtx = spriteCanvas.getContext("2d")!;

    const spriteHues = [250, 260, 270, 280, 290, 300];
    for (let v = 0; v < SPRITE_VARIANTS; v++) {
      const cx = v * SPRITE_SIZE + SPRITE_SIZE / 2;
      const cy = SPRITE_SIZE / 2;
      const hue = spriteHues[v];
      const r = SPRITE_SIZE / 2;

      // Outer glow
      const grad = spriteCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `hsla(${hue}, 70%, 85%, 1)`);
      grad.addColorStop(0.15, `hsla(${hue}, 65%, 75%, 0.8)`);
      grad.addColorStop(0.4, `hsla(${hue}, 60%, 60%, 0.25)`);
      grad.addColorStop(0.7, `hsla(${hue}, 55%, 50%, 0.06)`);
      grad.addColorStop(1, `hsla(${hue}, 50%, 45%, 0)`);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(v * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE);
    }

    // ── Particle type (flat arrays for cache-friendliness) ──
    const px = new Float32Array(PARTICLE_COUNT);
    const py = new Float32Array(PARTICLE_COUNT);
    const pz = new Float32Array(PARTICLE_COUNT);
    const vx = new Float32Array(PARTICLE_COUNT);
    const vy = new Float32Array(PARTICLE_COUNT);
    const vz = new Float32Array(PARTICLE_COUNT);
    const psize = new Float32Array(PARTICLE_COUNT);
    const spriteVariant = new Uint8Array(PARTICLE_COUNT);

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
    const generateStar = (out: Float32Array[]) => {
      const [ox, oy, oz] = out;
      const scale = Math.min(W, H) * 0.32;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.55) * scale;
        ox[i] = r * Math.pow(Math.cos(theta), 3);
        oy[i] = r * Math.pow(Math.sin(theta), 3);
        oz[i] = (Math.random() - 0.5) * 350;
      }
    };

    /** 2. Diamond / Vertical column */
    const generateDiamond = (out: Float32Array[]) => {
      const [ox, oy, oz] = out;
      const height = H * 0.65;
      const maxWidth = Math.min(W * 0.06, 70);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const yNorm = Math.random();
        oy[i] = (yNorm - 0.5) * height;
        const widthAtY = maxWidth * (1 - Math.abs(yNorm - 0.5) * 1.6);
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * Math.max(widthAtY, 5);
        ox[i] = r * Math.cos(angle);
        oz[i] = r * Math.sin(angle) * 0.8 + (Math.random() - 0.5) * 60;
      }
    };

    /** 3. Letter "A" sampled from offscreen canvas */
    const generateLetter = (out: Float32Array[]) => {
      const [ox, oy, oz] = out;
      const tmpCanvas = document.createElement("canvas");
      const S = 500;
      tmpCanvas.width = S;
      tmpCanvas.height = S;
      const tCtx = tmpCanvas.getContext("2d");
      if (!tCtx) return;

      tCtx.fillStyle = "white";
      tCtx.font = "italic 900 420px 'Instrument Serif', serif";
      tCtx.textAlign = "center";
      tCtx.textBaseline = "middle";
      tCtx.fillText("A", S / 2, S / 2 + 20);

      const imgData = tCtx.getImageData(0, 0, S, S).data;
      const validPixels: { x: number; y: number }[] = [];

      for (let py2 = 0; py2 < S; py2 += 2) {
        for (let px2 = 0; px2 < S; px2 += 2) {
          if (imgData[(py2 * S + px2) * 4 + 3] > 128) {
            validPixels.push({ x: px2 - S / 2, y: py2 - S / 2 });
          }
        }
      }

      if (validPixels.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          ox[i] = (Math.random() - 0.5) * 200;
          oy[i] = (Math.random() - 0.5) * 200;
          oz[i] = 0;
        }
        return;
      }

      const letterScale = Math.min(W, H) * 0.0020;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = validPixels[Math.floor(Math.random() * validPixels.length)];
        const jitter = 4;
        ox[i] = (p.x + (Math.random() - 0.5) * jitter) * letterScale;
        oy[i] = (p.y + (Math.random() - 0.5) * jitter) * letterScale;
        oz[i] = (Math.random() - 0.5) * 100;
      }
    };

    // Shape target buffers (flat typed arrays)
    const starShape = [new Float32Array(PARTICLE_COUNT), new Float32Array(PARTICLE_COUNT), new Float32Array(PARTICLE_COUNT)];
    const diamondShape = [new Float32Array(PARTICLE_COUNT), new Float32Array(PARTICLE_COUNT), new Float32Array(PARTICLE_COUNT)];
    const letterShape = [new Float32Array(PARTICLE_COUNT), new Float32Array(PARTICLE_COUNT), new Float32Array(PARTICLE_COUNT)];

    const regenerateShapes = () => {
      if (W === 0 || H === 0) return;
      generateStar(starShape);
      generateDiamond(diamondShape);
      generateLetter(letterShape);
    };

    const initParticles = () => {
      resize();
      regenerateShapes();

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Start scattered for dramatic convergence
        px[i] = (Math.random() - 0.5) * W * 1.5;
        py[i] = (Math.random() - 0.5) * H * 1.5;
        pz[i] = (Math.random() - 0.5) * 600;
        vx[i] = 0;
        vy[i] = 0;
        vz[i] = 0;
        psize[i] = Math.random() * 1.2 + 0.3;
        spriteVariant[i] = Math.floor(Math.random() * SPRITE_VARIANTS);
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
      if (!starShape[0].length) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const sp = scrollProgress;

      // ── Determine morph state ──
      let shapeAx: Float32Array, shapeAy: Float32Array, shapeAz: Float32Array;
      let shapeBx: Float32Array, shapeBy: Float32Array, shapeBz: Float32Array;
      let morphT = 0;

      if (sp < 0.15) {
        [shapeAx, shapeAy, shapeAz] = starShape;
        [shapeBx, shapeBy, shapeBz] = starShape;
        morphT = 0;
      } else if (sp < 0.25) {
        [shapeAx, shapeAy, shapeAz] = starShape;
        [shapeBx, shapeBy, shapeBz] = diamondShape;
        morphT = smoothstep(0.15, 0.25, sp);
      } else if (sp < 0.68) {
        [shapeAx, shapeAy, shapeAz] = diamondShape;
        [shapeBx, shapeBy, shapeBz] = diamondShape;
        morphT = 0;
      } else if (sp < 0.82) {
        [shapeAx, shapeAy, shapeAz] = diamondShape;
        [shapeBx, shapeBy, shapeBz] = letterShape;
        morphT = smoothstep(0.68, 0.82, sp);
      } else {
        [shapeAx, shapeAy, shapeAz] = letterShape;
        [shapeBx, shapeBy, shapeBz] = letterShape;
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

      // ── Update particles (physics) ──
      const spring = 0.035 * dt;
      const friction = Math.pow(0.86, dt);
      const mouseActive = mouse.active;
      const mx = mouse.x;
      const my = mouse.y;
      const radiusSq = MOUSE_RADIUS * MOUSE_RADIUS;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let tx = shapeAx[i] + (shapeBx[i] - shapeAx[i]) * morphT;
        let ty = shapeAy[i] + (shapeBy[i] - shapeAy[i]) * morphT;
        let tz = shapeAz[i] + (shapeBz[i] - shapeAz[i]) * morphT;

        // Organic float
        const f = time + i * 0.004;
        tx += Math.sin(f * 1.1 + i * 0.01) * 4;
        ty += Math.cos(f * 0.8 + i * 0.02) * 4;
        tz += Math.sin(f * 0.5 + i * 0.015) * 5;

        // ── Cursor / Touch repulsion ──
        if (mouseActive) {
          const projScale = PERSPECTIVE / (PERSPECTIVE + pz[i]);
          const screenX = cx + px[i] * projScale;
          const screenY = cy + py[i] * projScale;
          const dxm = screenX - mx;
          const dym = screenY - my;
          const distSq = dxm * dxm + dym * dym;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            const forceCubed = force * force * force;
            const angle = Math.atan2(dym, dxm);
            vx[i] += Math.cos(angle) * forceCubed * MOUSE_FORCE * dt;
            vy[i] += Math.sin(angle) * forceCubed * MOUSE_FORCE * dt;
            vz[i] += (Math.random() - 0.5) * forceCubed * 20 * dt;
          }
        }

        vx[i] += (tx - px[i]) * spring;
        vy[i] += (ty - py[i]) * spring;
        vz[i] += (tz - pz[i]) * spring;

        vx[i] *= friction;
        vy[i] *= friction;
        vz[i] *= friction;

        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
        pz[i] += vz[i] * dt;
      }

      // ── Draw (no sorting — use globalAlpha for depth) ──
      ctx.globalAlpha = globalOpacity;

      const halfSprite = SPRITE_SIZE / 2;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const projScale = PERSPECTIVE / (PERSPECTIVE + pz[i]);
        const drawX = cx + px[i] * projScale;
        const drawY = cy + py[i] * projScale;

        // Off-screen culling
        if (drawX < -40 || drawX > W + 40 || drawY < -40 || drawY > H + 40) continue;

        // Depth-based alpha
        const zNorm = (pz[i] + 350) / 700;
        const zAlpha = 0.08 + zNorm * 0.85;

        // Sprite size in screen space
        const drawSize = psize[i] * projScale * 3.5;

        // Draw pre-rendered sprite (single drawImage vs gradient+arc+fill)
        ctx.globalAlpha = globalOpacity * zAlpha;
        const sv = spriteVariant[i];
        ctx.drawImage(
          spriteCanvas,
          sv * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, // source
          drawX - drawSize, drawY - drawSize, drawSize * 2, drawSize * 2 // dest
        );
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
