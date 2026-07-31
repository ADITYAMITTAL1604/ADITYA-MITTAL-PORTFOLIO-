import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sections = [
  {
    title: "Purpose",
    body: "I chose software engineering because code is the most scalable way to solve real problems. A single optimized algorithm or well-architected system can impact millions of people. That scale drives me. I want to build robust, highly-available infrastructure and intelligent features that set the standard for what technology can achieve.",
  },
  {
    title: "Approach",
    body: "I treat system architecture and algorithmic efficiency as the core of any product. I start with the data flow, build with performance in mind, and don't stop until the edge cases are covered. I ask questions about scale before I write a line of code. And I stay involved end-to-end — from database schema design to deploying the final CI/CD pipeline.",
  },
  {
    title: "What to expect",
    body: "Clean code from day one. I write modular, testable components, communicate directly, and flag potential bottlenecks early. Opinionated but collaborative — I'll advocate for the right tech stack or design pattern, but I'll always back it up with data. You get an engineer who cares deeply about building resilient systems.",
  },
];

export default function PurposeSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      sectionRef.current!.querySelectorAll("[data-s-print-opacity]").forEach((el) => {
        const text = el.textContent || "";
        const words = text.split(/\s+/);
        el.innerHTML = words
          .map((w) => `<span class="inline" style="opacity: 0.12">${w}</span>`)
          .join(" ");

        gsap.to(el.querySelectorAll("span"), {
          opacity: 1,
          stagger: 0.03,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom 45%",
            scrub: true,
          },
        });
      });

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
    <section ref={sectionRef} className="relative z-10 px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-[7.5rem] py-[10rem] md:py-[15rem]">
      <div className="flex flex-col gap-[10rem] md:gap-[15rem] max-w-3xl mx-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-6">
            <h3 data-s-lines className="heading-3 font-instrument-serif italic">{section.title}</h3>
            <p data-s-print-opacity className="body-lg text-[var(--muted-foreground)] leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
