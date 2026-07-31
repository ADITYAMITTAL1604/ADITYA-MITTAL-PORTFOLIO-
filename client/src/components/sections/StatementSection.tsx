import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PillButton from "@/components/PillButton";

gsap.registerPlugin(ScrollTrigger);

export default function StatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Print-opacity on heading: words reveal one by one
      if (headingRef.current) {
        const text = headingRef.current.innerHTML;
        // We need to handle the span structure carefully
        // Split visible text into words while preserving structure
        const rawText = headingRef.current.textContent || "";
        const words = rawText.split(/\s+/).filter(Boolean);

        // Rebuild with spans for each word
        headingRef.current.innerHTML = "";
        words.forEach((w) => {
          const wordSpan = document.createElement("span");
          wordSpan.className = "inline-block mr-[0.3em]";
          wordSpan.style.opacity = "0.12";
          wordSpan.textContent = w;
          headingRef.current!.appendChild(wordSpan);
        });

        const wordSpans = headingRef.current.querySelectorAll("span");
        gsap.to(wordSpans, {
          opacity: 1,
          stagger: 0.06,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "bottom 45%",
            scrub: true,
          },
        });
      }

      // Slide-up for body text
      if (bodyRef.current) {
        gsap.fromTo(
          bodyRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bodyRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-dissolve-out
      className="relative z-10 mt-[8rem] md:mt-[12rem] px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-[7.5rem] flex flex-col items-center text-center"
    >
      <div className="w-full flex flex-col items-center gap-8 md:gap-12 max-w-4xl">
        <h2
          ref={headingRef}
          className="heading-2 font-instrument-serif text-center"
        >
          {/* Content injected by GSAP */}
          Architecting Scalable Solutions Through Code, Data, and Engineering.
        </h2>

        <div className="flex flex-col items-center gap-6 md:gap-10 w-full max-w-2xl">
          <p
            ref={bodyRef}
            className="body-md text-center text-[var(--muted-foreground)]"
          >
            CS Undergrad at IP University with a focus on AI pipelines, full-stack architecture, and machine learning. Proven track record of building production-ready platforms that solve real-world problems.
          </p>
          <PillButton href="#about">Learn more</PillButton>
        </div>
      </div>
    </section>
  );
}
