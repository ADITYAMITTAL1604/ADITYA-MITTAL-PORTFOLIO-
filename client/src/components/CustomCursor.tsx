import { useEffect, useRef } from "react";

/**
 * CustomCursor — "+" crosshair that follows mouse INSTANTLY.
 * No lerp, no interpolation, no lag. Pure 1:1 cursor tracking.
 * Uses CSS transform with will-change for GPU-accelerated rendering.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on desktop pointer devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      // Direct 1:1 positioning — no lerp, no delay
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      cursor.style.opacity = "1";
    };

    const onMouseLeave = () => {
      cursor.style.opacity = "0";
    };

    const onMouseEnter = () => {
      cursor.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[999999] pointer-events-none mix-blend-difference"
      style={{
        opacity: 0,
        willChange: "transform",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <line x1="5" y1="11" x2="17" y2="11" stroke="white" strokeWidth="1.5" />
        <line x1="11" y1="5" x2="11" y2="17" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
