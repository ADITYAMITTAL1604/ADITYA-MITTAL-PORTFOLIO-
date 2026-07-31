import React from "react";

interface PillButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  type?: "button" | "submit";
  className?: string;
  download?: boolean | string;
}

/**
 * PillButton — Outline pill button with SVG stroke border,
 * matching the reference site's button treatment exactly.
 */
export default function PillButton({ children, onClick, href, type = "button", className = "", download }: PillButtonProps) {
  const inner = (
    <>
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect
          className="stroke-[var(--foreground)]"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          fill="none"
          rx="9999"
          ry="9999"
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
        />
      </svg>
      <span className="relative block text-sm">{children}</span>
    </>
  );

  const baseClasses = `relative inline-flex items-center justify-center h-10 md:h-12 px-5 md:px-6 rounded-full backdrop-blur-sm cursor-pointer transition-colors duration-300 hover:bg-white/[0.04] text-[var(--foreground)] ${className}`;

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick} download={download}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type} className={baseClasses} onClick={onClick}>
      {inner}
    </button>
  );
}
