import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FooterCTAProps {
  onContactOpen: () => void;
}

export default function FooterCTA({ onContactOpen }: FooterCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      sectionRef.current!.querySelectorAll("[data-s-lines]").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={sectionRef} className="relative z-10">
      {/* Footer content */}
      <section className="px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-[7.5rem] py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 mb-16">
          {/* Left: CTA */}
          <div data-s-lines className="flex flex-col gap-6">
            <h2 className="heading-2 font-instrument-serif max-w-md">
              Interested in working together?
            </h2>
            <a
              href="https://www.linkedin.com/in/aditya-mittal-40b09435b/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl md:text-3xl font-red-hat-display font-black italic uppercase underline decoration-white/40 hover:decoration-white underline-offset-8 transition-all w-fit"
            >
              Let's Connect
            </a>
          </div>

          {/* Right: Links */}
          <div data-s-lines className="grid grid-cols-2 gap-12">
            <div className="flex flex-col gap-3">
              <p className="eyebrow mb-2">Pages</p>
              {["Home", "About", "Work", "Contact"].map((link) => (
                <a
                  key={link}
                  href={link === "Home" ? "/" : link === "Contact" ? "#" : `#${link.toLowerCase()}`}
                  onClick={link === "Contact" ? (e: React.MouseEvent) => { e.preventDefault(); onContactOpen(); } : undefined}
                  className="body-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="eyebrow mb-2">Social Media</p>
              {[
                { label: "Email", href: "mailto:adityamittal568@gmail.com" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/aditya-mittal-40b09435b/" },
                { label: "GitHub", href: "https://github.com/ADITYAMITTAL1604" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="body-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-white/10">
          <p className="body-sm text-[var(--muted-foreground)]">
            By Aditya Mittal © {new Date().getFullYear()}
          </p>
          <p className="body-sm text-[var(--muted-foreground)]">
            New Delhi, India
          </p>
        </div>
      </section>
    </footer>
  );
}
