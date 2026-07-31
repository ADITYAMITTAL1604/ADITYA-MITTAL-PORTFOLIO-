import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  onContactOpen: () => void;
}

export default function Navbar({ onContactOpen }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const handleContactClick = useCallback(() => {
    setMenuOpen(false);
    onContactOpen();
  }, [onContactOpen]);

  return (
    <header
      ref={navRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-[1000000] flex h-16 items-center justify-between px-8 mix-blend-difference"
    >
      {/* Wordmark — top left */}
      <a
        href="/"
        className="pointer-events-auto flex text-lg font-medium text-[var(--brand-05)] hover:opacity-80 transition-opacity"
      >
        <span className="font-red-hat-display">Aditya Mittal</span>
      </a>

      {/* Right side — language toggle + hamburger */}
      <div className="pointer-events-auto flex items-center justify-end gap-4 text-sm text-[var(--brand-05)]">
        {/* Hamburger menu */}
        <div className="relative">
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="group relative z-[100] flex h-8 w-8 flex-col items-center justify-center gap-1 mix-blend-difference"
          >
            <span className="flex flex-col items-end justify-center gap-1">
              <motion.span
                className="w-6 h-0.5 origin-left bg-[var(--brand-05)]"
                animate={{
                  scaleX: menuOpen ? 0.7 : 1,
                  rotate: menuOpen ? 45 : 0,
                  y: menuOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-6 h-0.5 origin-right bg-[var(--brand-05)]"
                animate={{
                  scaleX: menuOpen ? 0.7 : 0.85,
                  rotate: menuOpen ? -45 : 0,
                  y: menuOpen ? -1 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
            </span>
          </button>

          {/* Nav dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                className="flex gap-3 flex-col items-end justify-center absolute -top-3 -right-5 w-44 bg-white/5 backdrop-blur-[30px] p-5 pt-14 rounded-sm"
              >
                <NavLink href="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
                <NavLink href="#about" onClick={() => setMenuOpen(false)}>About</NavLink>
                <NavLink href="#work" onClick={() => setMenuOpen(false)}>Work</NavLink>
                <button
                  onClick={handleContactClick}
                  className="text-[var(--brand-05)] hover:opacity-70 transition-opacity text-sm"
                >
                  Contact
                </button>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-[var(--brand-05)] hover:opacity-70 transition-opacity text-sm"
    >
      {children}
    </a>
  );
}
