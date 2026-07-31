import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PillButton from "@/components/PillButton";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { number: "01", title: "Architecture", description: "Designing data schemas, API contracts, and infrastructure before writing a single line of code." },
  { number: "02", title: "Development", description: "Clean, well-tested implementation using modern full-stack technologies and optimized algorithms." },
  { number: "03", title: "AI Integration", description: "Embedding intelligence through robust machine learning models and seamless API orchestrations." },
  { number: "04", title: "Deployment", description: "CI/CD pipelines, containerization, and scaling for production-ready, highly-available applications." },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Desktop: fade-in-out scrub animation
      if (window.innerWidth >= 768) {
        sectionRef.current!.querySelectorAll("[data-s-fade-in-out]").forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0.15, filter: "blur(4px)" },
            {
              opacity: 1, filter: "blur(0px)",
              scrollTrigger: {
                trigger: el,
                start: "top 65%",
                end: "top 45%",
                scrub: true,
              },
            }
          );
          gsap.to(el, {
            opacity: 0.15, filter: "blur(4px)",
            scrollTrigger: {
              trigger: el,
              start: "bottom 55%",
              end: "bottom 35%",
              scrub: true,
            },
          });
        });
      } else {
        // Mobile: simple fade-in on scroll
        sectionRef.current!.querySelectorAll("[data-s-mobile-step]").forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} data-dissolve-out className="relative mt-[6rem] md:mt-[10rem]">
      {/* Decorative center line + sparkle (desktop only) */}
      <div className="hidden md:block absolute top-0 left-1/2 w-px h-full">
        <div className="absolute top-0 left-1/2 w-px h-full md:bg-white/10" />
        <div className="w-6 h-6 sticky top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-px drop-shadow-[0_0_24px_white]"
            width="57" height="57" viewBox="0 0 57 57" fill="none"
          >
            <path
              d="M28.2842 -0.000976562C28.2867 0.0402974 29.1893 15.0456 35.3555 21.2119C41.5178 27.3743 56.5082 28.2796 56.5684 28.2832C56.5082 28.2868 41.5178 29.1922 35.3555 35.3545C29.1893 41.5208 28.2867 56.5261 28.2842 56.5674C28.2816 56.5236 27.3786 41.5202 21.2129 35.3545C15.0381 29.1798 0 28.2832 0 28.2832C0 28.2832 15.0381 27.3866 21.2129 21.2119C27.3786 15.0462 28.2816 0.0428417 28.2842 -0.000976562Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT ═══ */}
      <div className="hidden md:grid md:grid-cols-2">
        {/* Left: Sticky heading */}
        <div className="h-fit md:sticky md:top-1/2 md:-translate-y-1/2 -mb-[45vh] flex flex-col md:items-end items-start md:justify-center gap-4 xl:gap-6 p-8 md:p-12">
          <h2 className="heading-2 font-instrument-serif md:text-right max-w-[20rem] lg:max-w-[25rem] xl:max-w-[32.5rem]">
            A methodology built around scalability and precision.
          </h2>
          <p className="body-md max-w-[22.5rem] md:text-right text-[var(--muted-foreground)]">
            No technical debt, no deployment chaos. Just a clear path from system design to a robust, intelligent product.
          </p>
          <PillButton>Let's build something</PillButton>
        </div>

        {/* Right: Scrolling steps */}
        <div className="flex flex-col gap-[7.5rem] pt-[50vh] px-12 pb-[50vh]">
          {steps.map((step, i) => (
            <div key={i} data-s-fade-in-out className="flex flex-col max-w-[20rem] transition-opacity">
              <p className="body-xl text-white/40">{step.number}</p>
              <p className="heading-3 font-instrument-serif">{step.title}</p>
              <p className="body-lg text-white/80">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MOBILE LAYOUT ═══ */}
      <div className="md:hidden px-6">
        {/* Heading */}
        <div className="mb-10">
          <h2 className="heading-3 font-instrument-serif mb-3">
            A methodology built around scalability and precision.
          </h2>
          <p className="body-md text-[var(--muted-foreground)]">
            No technical debt, no deployment chaos. Just a clear path from system design to a robust, intelligent product.
          </p>
        </div>

        {/* Steps as vertical cards */}
        <div className="flex flex-col gap-8 border-l border-white/10 pl-6">
          {steps.map((step, i) => (
            <div key={i} data-s-mobile-step className="flex flex-col opacity-0">
              <p className="body-lg text-white/40 font-medium">{step.number}</p>
              <p className="heading-4 font-instrument-serif mt-1">{step.title}</p>
              <p className="body-md text-white/70 mt-1">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <PillButton>Let's build something</PillButton>
        </div>
      </div>
    </section>
  );
}
