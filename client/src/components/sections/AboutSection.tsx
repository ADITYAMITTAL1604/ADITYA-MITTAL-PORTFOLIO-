import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Print-opacity on the heading
      const printEls = sectionRef.current!.querySelectorAll("[data-s-print-opacity]");
      printEls.forEach((el) => {
        const text = el.textContent || "";
        const words = text.split(/\s+/);
        el.innerHTML = words
          .map((w) => `<span class="inline" style="opacity: 0.12">${w}</span>`)
          .join(" ");

        gsap.to(el.querySelectorAll("span"), {
          opacity: 1,
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom 45%",
            scrub: true,
          },
        });
      });

      // Line reveals
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
    <section id="about" ref={sectionRef} className="relative z-10 px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-[7.5rem] py-[10rem] md:py-[15rem]">
      <div className="grid md:grid-cols-[1fr_2fr] gap-16 md:gap-24">
        {/* Left: decorative vertical line with glow dots */}
        <div className="hidden md:flex flex-col items-center">
          <div className="w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent relative">
            {[0.15, 0.35, 0.55, 0.75].map((pos, i) => (
              <div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-pulse"
                style={{
                  top: `${pos * 100}%`,
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${3 + i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: Text content */}
        <div className="flex flex-col gap-16">
          <h2 data-s-lines className="heading-2 font-instrument-serif">About</h2>

          <div className="flex flex-col gap-8 max-w-2xl">
            <p data-s-print-opacity className="body-lg text-[var(--muted-foreground)]">
              I'm Aditya — a B.Tech Computer Science undergraduate (CGPA 9.45) at GGSIPU, NEW DELHI who got into tech through a love for problem-solving. I care about algorithmic efficiency, scalable system architecture, and building platforms that perform under pressure.
            </p>

            <p data-s-print-opacity className="body-lg text-[var(--muted-foreground)]">
              I specialize in full-stack engineering and AI integration — building machine learning pipelines, robust backends with Python and FastAPI, and performant React frontends. I think in systems and obsess over optimization. The kind of code that runs flawlessly because it deserves to.
            </p>

            <p data-s-print-opacity className="body-lg text-[var(--muted-foreground)]">
              Beyond coding, I've served as Head Boy at Shanti Gyan Niketan School, leading a team of 30+ students and managing significant event budgets. That context shapes how I work: I understand what a project needs to achieve, not just how it should be engineered.
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-2xl">
            <h3 data-s-lines className="heading-5 font-instrument-serif">Currently</h3>
            <p data-s-print-opacity className="body-md text-[var(--muted-foreground)]">
              Outside of coursework, I explore predictive modeling, data structures in Java, and the boundaries between AI and human interaction. Currently mastering Data Structures and Algorithms and building tools that automate complex business workflows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
