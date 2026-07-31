import { useEffect, useRef } from "react";

/**
 * ParticleMorph — WebGL-quality Canvas2D particle system
 *
 * Behavior matching ricardochance.com reference exactly:
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
    const mouse = { x: -9999, y: -9999, active: false };
    const PARTICLE_COUNT = 800; // Reduced to prevent overlapping/obscuring text
    const MOUSE_RADIUS = 250; // px — how far the cursor repels
    const MOUSE_FORCE = 100; // strength of repulsion

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
    let isInitialized = false;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      W = window.innerWidth || document.documentElement.clientWidth || 1000;
      H = window.innerHeight || document.documentElement.clientHeight || 800;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      // Regenerate shapes on resize to ensure correct scaling
      if (isInitialized) {
        regenerateShapes();
      }
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

    // ════════════════════════════════════════════
    // SHAPE GENERATORS
    // ════════════════════════════════════════════

    /** 1. Star / Astroid (4-pointed cusp shape) */
    const generateStar = (): { x: number; y: number; z: number }[] => {
      const pts: { x: number; y: number; z: number }[] = [];
      const scale = Math.min(W, H) * 0.32;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        // Astroid parametric with random radial fill
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
        const yNorm = Math.random(); // 0..1
        const y = (yNorm - 0.5) * height;
        // Diamond width tapers at top and bottom
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
        // Fallback: scatter
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          pts.push({ x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, z: 0 });
        }
        return pts;
      }

      // Scale the letter to fit nicely on screen
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
      resize(); // ensure sizes are correct
      regenerateShapes();
      
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const s = shapeStar[i];
        particles.push({
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
      isInitialized = true;
    };

    // Initialize immediately
    initParticles();
    
    // Also re-init if fonts load later (to fix the letter A shape)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (isInitialized) regenerateShapes();
      });
    }

    // ── Smoothstep ──
    const smoothstep = (edge0: number, edge1: number, x: number) => {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };

    // ── Perspective projection ──
    const PERSPECTIVE = 1000;

    let time = 0;
    let prevTime = performance.now();

    // ═══════════════════════════════════════════
    // ANIMATION LOOP
    // ═══════════════════════════════════════════
    const animate = (now: number) => {
      const dt = Math.min((now - prevTime) / 16.667, 3); // Normalize to ~60fps
      prevTime = now;
      time += 0.006 * dt;

      ctx.clearRect(0, 0, W, H);

      const sp = scrollProgress;

      // ── Determine morph state ──
      let shapeA = shapeStar;
      let shapeB = shapeStar;
      let morphT = 0;

      if (sp < 0.15 || !shapeStar.length || !shapeDiamond.length || !shapeLetter.length) {
        // Pure star
        shapeA = shapeStar;
        shapeB = shapeStar;
        morphT = 0;
      } else if (sp < 0.25) {
        // Star → Diamond
        shapeA = shapeStar;
        shapeB = shapeDiamond;
        morphT = smoothstep(0.15, 0.25, sp);
      } else if (sp < 0.68) {
        // Pure diamond
        shapeA = shapeDiamond;
        shapeB = shapeDiamond;
        morphT = 0;
      } else if (sp < 0.82) {
        // Diamond → Letter
        shapeA = shapeDiamond;
        shapeB = shapeLetter;
        morphT = smoothstep(0.68, 0.82, sp);
      } else {
        // Pure letter
        shapeA = shapeLetter;
        shapeB = shapeLetter;
        morphT = 0;
      }

      // ── Center offset: diamond slides left, letter comes back to center ──
      let offsetX = 0;
      let offsetY = 0;
      if (sp > 0.18 && sp < 0.72) {
        const slideIn = smoothstep(0.18, 0.28, sp);
        const slideOut = 1 - smoothstep(0.62, 0.72, sp);
        offsetX = -Math.min(W * 0.25, 320) * slideIn * slideOut;
      }

      // Slight vertical offset during diamond phase
      if (sp > 0.25 && sp < 0.65) {
        offsetY = -20;
      }

      const cx = W / 2 + offsetX;
      const cy = H / 2 + offsetY;

      // ── Opacity: fade out during certain sections (e.g., tools light section) ──
      let globalOpacity = 1;
      // Fade during tools section (roughly 0.55–0.65 of scroll)
      if (sp > 0.5 && sp < 0.55) {
        globalOpacity = 1 - smoothstep(0.5, 0.55, sp);
      } else if (sp >= 0.55 && sp < 0.62) {
        globalOpacity = 0;
      } else if (sp >= 0.62 && sp < 0.68) {
        globalOpacity = smoothstep(0.62, 0.68, sp);
      }

      if (globalOpacity < 0.01) {
        animId = requestAnimationFrame(animate);
        return; // Skip drawing entirely when invisible
      }

      // ── Update particles ──
      const spring = 0.035 * dt;
      const friction = Math.pow(0.86, dt);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        const a = shapeA[i];
        const b = shapeB[i];

        // Interpolate target
        let tx = a.x + (b.x - a.x) * morphT;
        let ty = a.y + (b.y - a.y) * morphT;
        let tz = a.z + (b.z - a.z) * morphT;

        // Add organic idle float
        const f = time + i * 0.004;
        tx += Math.sin(f * 1.1 + i * 0.01) * 4;
        ty += Math.cos(f * 0.8 + i * 0.02) * 4;
        tz += Math.sin(f * 0.5 + i * 0.015) * 5;

        // ── Cursor repulsion ──
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
            const forceCubed = force * force * force; // Cubic falloff for snappy feel
            const angle = Math.atan2(dy, dx);
            // Push particles AWAY from cursor
            p.vx += Math.cos(angle) * forceCubed * MOUSE_FORCE * dt;
            p.vy += Math.sin(angle) * forceCubed * MOUSE_FORCE * dt;
            p.vz += (Math.random() - 0.5) * forceCubed * 20 * dt;
          }
        }

        // Spring toward target
        p.vx += (tx - p.x) * spring;
        p.vy += (ty - p.y) * spring;
        p.vz += (tz - p.z) * spring;

        // Damping
        p.vx *= friction;
        p.vy *= friction;
        p.vz *= friction;

        // Integrate
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

        // Cull off-screen particles
        if (drawX < -80 || drawX > W + 80 || drawY < -80 || drawY > H + 80) continue;

        // Depth-based alpha
        const zNorm = (p.z + 350) / 700; // 0 = far, 1 = near
        const zAlpha = 0.06 + zNorm * 0.85;

        // ── Outer glow ──
        const glowRadius = drawSize * 3.5;
        const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowRadius);
        grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${zAlpha * 0.25})`);
        grad.addColorStop(0.4, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${zAlpha * 0.08})`);
        grad.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(drawX, drawY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // ── Bright core ──
        ctx.globalAlpha = globalOpacity * zAlpha * 0.8;
        ctx.fillStyle = `hsl(${p.hue}, 40%, 85%)`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, drawSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = globalOpacity;
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[2] pointer-events-none"
      aria-hidden="true"
    />
  );
}
