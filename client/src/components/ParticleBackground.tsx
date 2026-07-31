import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  color: string;
  baseX: number;
  baseY: number;
  baseZ: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const { scrollY } = useScroll();
  const scrollYRef = useRef(0);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const mouseVelRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribe = scrollY.onChange((value) => {
      scrollYRef.current = value;
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Track mouse position and movement
  useEffect(() => {
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      mouseVelRef.current = {
        x: (e.clientX - lastX) * 0.1,
        y: (e.clientY - lastY) * 0.1,
      };
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles in a central geometric formation
    const particleCount = 200;
    const particles: Particle[] = [];
    const colors = ["#d4845c", "#c9704a", "#e8a876", "#b85c38"];

    // Create particles that form a geometric shape
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      const height = (Math.random() - 0.5) * 300;

      particles.push({
        x: Math.cos(angle) * radius,
        y: height,
        z: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        vz: 0,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseX: Math.cos(angle) * radius,
        baseY: height,
        baseZ: Math.sin(angle) * radius,
      });
    }
    particlesRef.current = particles;

    // Animation loop
    let animationId: number;

    const animate = () => {
      timeRef.current += 1;

      // Clear canvas with warm beige background
      ctx.fillStyle = "#f5ede4";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - scrollYRef.current * 0.3;
      const time = timeRef.current * 0.005;

      // Sort particles by z-depth for proper rendering
      particles.sort((a, b) => a.z - b.z);

      particles.forEach((particle) => {
        // Calculate base rotation
        const baseAngle = Math.atan2(particle.baseY, particle.baseX);
        const baseRadius = Math.sqrt(particle.baseX * particle.baseX + particle.baseY * particle.baseY);

        // Slow rotation (always happening)
        const rotationAngle = baseAngle + time * 0.3;
        let x = Math.cos(rotationAngle) * baseRadius;
        let y = Math.sin(rotationAngle) * baseRadius;
        let z = particle.baseZ;

        // Gentle vertical oscillation
        z += Math.sin(time + particle.baseX * 0.01) * 0.1;

        // Mouse interaction - particles move away from cursor
        if (mouseRef.current.active) {
          const screenCenterX = centerX;
          const screenCenterY = centerY;

          // Project particle to screen space
          const scale = 500 / (500 + z);
          const screenX = screenCenterX + x * scale;
          const screenY = screenCenterY + y * scale;

          // Calculate distance to mouse
          const dx = screenX - mouseRef.current.x;
          const dy = screenY - mouseRef.current.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          // Repulsion force
          if (distToMouse < 300) {
            const repulsionStrength = (1 - distToMouse / 300) * 2;
            const angle = Math.atan2(dy, dx);

            // Apply repulsion in 3D space
            particle.vx += Math.cos(angle) * repulsionStrength * 0.3;
            particle.vy += Math.sin(angle) * repulsionStrength * 0.3;
            particle.vz += (Math.random() - 0.5) * repulsionStrength * 0.2;
          }
        }

        // Apply velocity to position
        x += particle.vx;
        y += particle.vy;
        z += particle.vz;

        // Dampen velocity
        particle.vx *= 0.92;
        particle.vy *= 0.92;
        particle.vz *= 0.92;

        // Wrap z coordinate
        if (z > 300) z = -300;
        if (z < -300) z = 300;

        // Update particle position
        particle.x = x;
        particle.y = y;
        particle.z = z;

        // Simple perspective projection
        const scale = 500 / (500 + z);
        const screenX = centerX + x * scale;
        const screenY = centerY + y * scale;

        // Calculate opacity based on depth
        const depthOpacity = (z + 300) / 600;
        const finalOpacity = particle.opacity * (0.3 + depthOpacity * 0.7);

        // Draw particles with subtle glow
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, particle.size * 4);

        const hexOpacity = Math.floor(finalOpacity * 255)
          .toString(16)
          .padStart(2, "0");

        gradient.addColorStop(0, particle.color + hexOpacity);
        gradient.addColorStop(0.7, particle.color + Math.floor(finalOpacity * 150).toString(16).padStart(2, "0"));
        gradient.addColorStop(1, particle.color + "00");

        ctx.fillStyle = gradient;
        ctx.fillRect(
          screenX - particle.size * 4,
          screenY - particle.size * 4,
          particle.size * 8,
          particle.size * 8
        );

        // Draw core particle
        ctx.fillStyle = particle.color + hexOpacity;
        ctx.beginPath();
        ctx.arc(screenX, screenY, particle.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}
