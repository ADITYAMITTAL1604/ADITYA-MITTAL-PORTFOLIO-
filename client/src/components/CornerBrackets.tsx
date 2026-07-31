/**
 * CornerBrackets — Fixed decorative viewport frame
 * Matches the reference site's camera-frame corner marks + subtle border
 */
export default function CornerBrackets() {
  return (
    <div className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-[50] w-[calc(100%-32px)] h-[calc(100vh-32px)] mx-auto">
      {/* Top-left corner */}
      <div className="absolute top-0 left-0 w-4 h-[2px] bg-white/30" />
      <div className="absolute top-0 left-0 w-[2px] h-4 bg-white/30" />

      {/* Top-right corner */}
      <div className="absolute top-0 right-0 w-4 h-[2px] bg-white/30" />
      <div className="absolute top-0 right-0 w-[2px] h-4 bg-white/30" />

      {/* Bottom-left corner */}
      <div className="absolute bottom-0 left-0 w-4 h-[2px] bg-white/30" />
      <div className="absolute bottom-0 left-0 w-[2px] h-4 bg-white/30" />

      {/* Bottom-right corner */}
      <div className="absolute bottom-0 right-0 w-4 h-[2px] bg-white/30" />
      <div className="absolute bottom-0 right-0 w-[2px] h-4 bg-white/30" />
    </div>
  );
}
