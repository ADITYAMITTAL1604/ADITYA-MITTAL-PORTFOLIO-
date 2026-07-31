import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PillButton from "@/components/PillButton";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { 
    name: "Decodex", 
    url: "https://decodex-five.vercel.app/",
    github: "https://github.com/ADITYAMITTAL1604/DECODEX",
    bg: "from-[#0a3d2e] to-[#092e26]",
    style: "font-instrument-serif" 
  },
  { 
    name: "NoBroke", 
    url: "https://no-broke.vercel.app/",
    github: "https://github.com/ADITYAMITTAL1604/NO-BROKE",
    bg: "from-[#31104e] to-[#4a1a6b]",
    style: "font-instrument-serif font-black italic" 
  },
  { 
    name: "FlowPulse", 
    url: "#",
    github: "https://github.com/ADITYAMITTAL1604/FLOW_PULSE",
    bg: "from-[#0f172a] to-[#1e293b]",
    style: "font-sans font-black" 
  },
];

export default function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const titlesRef = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Print-opacity on the heading
      const printEl = sectionRef.current!.querySelector("[data-s-print-opacity]");
      if (printEl) {
        const text = printEl.textContent || "";
        const words = text.split(/\s+/);
        printEl.innerHTML = words
          .map((w) => `<span class="inline" style="opacity: 0.12">${w}</span>`)
          .join(" ");

        gsap.to(printEl.querySelectorAll("span"), {
          opacity: 1,
          stagger: 0.06,
          scrollTrigger: {
            trigger: printEl,
            start: "top 85%",
            end: "bottom 45%",
            scrub: true,
          },
        });
      }

      // Line reveals
      sectionRef.current!.querySelectorAll("[data-s-lines]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Project card reveals
      sectionRef.current!.querySelectorAll("[data-s-fade-in]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ScrollSpy for sidebar synchronization
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top 60%", // Trigger when card hits center-ish of screen
          end: "bottom 40%",
          onEnter: () => activateProject(i),
          onEnterBack: () => activateProject(i),
        });
      });

      function activateProject(index: number) {
        // Update left titles
        titlesRef.current.forEach((title, i) => {
          if (!title) return;
          gsap.to(title, {
            opacity: i === index ? 1 : 0.25,
            duration: 0.4,
            ease: "power2.out"
          });
        });
      }

      // Initialize state for the first project
      activateProject(0);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-dissolve-in
      className="relative z-10 px-6 md:px-0 mt-[8rem] md:mt-[12rem] grid grid-cols-1 md:grid-cols-[1fr_60vw_1fr] lg:grid-cols-[1fr_600px_1fr] xl:grid-cols-[1fr_800px_1fr] gap-8"
    >
      {/* Left: Sticky project titles (desktop) */}
      <div className="hidden md:block sticky top-1/2 h-fit -translate-y-1/2">
        <div className="grid overflow-hidden gap-1">
          {projects.map((proj, i) => (
            <p
              key={i}
              ref={(el) => { titlesRef.current[i] = el; }}
              className="heading-5 leading-[1.4em] font-instrument-serif opacity-25 transition-opacity cursor-pointer"
              onClick={() => {
                if (cardsRef.current[i]) {
                  cardsRef.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              {proj.name}
            </p>
          ))}
        </div>
      </div>

      {/* Center: Main content */}
      <div className="flex flex-col gap-12 lg:gap-20 xl:gap-[7.5rem]">
        {/* Section header */}
        <div className="flex flex-col gap-4 items-start text-left">
          <h2 data-s-lines className="body-md uppercase">Featured work</h2>
          <p data-s-print-opacity className="heading-2 leading-[1.1em] font-instrument-serif">
            Building intelligent applications that scale, rooted in a foundation of robust engineering and AI.
          </p>
        </div>

        {/* Project cards */}
        <div className="flex flex-col gap-12 md:gap-32">
          {projects.map((proj, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              data-s-fade-in
              className="flex flex-col gap-2 md:block"
            >
              <div className="block aspect-[800/500] w-full relative overflow-hidden rounded-sm group">
                <div className={`absolute inset-0 bg-gradient-to-br flex items-center justify-center ${proj.bg}`}>
                  <span className={`text-4xl md:text-6xl lg:text-7xl ${proj.style} text-white/90 group-hover:scale-105 transition-transform duration-700`}>
                    {proj.name}
                  </span>
                  <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex flex-row gap-3">
                    {proj.url !== "#" && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-sm text-white font-medium hover:bg-white/20 transition-colors shadow-lg cursor-pointer">
                        See live
                      </a>
                    )}
                    <a href={proj.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-sm text-white font-medium hover:bg-white/20 transition-colors shadow-lg cursor-pointer">
                      Explore
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex md:hidden items-center justify-between mt-2">
                <p data-s-lines className="heading-5 leading-[1.4em] font-instrument-serif">{proj.name}</p>
              </div>
            </div>
          ))}
        </div>


      </div>

      {/* Right side placeholder (keeps grid structure balanced) */}
      <div className="hidden md:block sticky top-1/2 h-fit -translate-y-1/2 ml-auto">
      </div>
    </section>
  );
}
