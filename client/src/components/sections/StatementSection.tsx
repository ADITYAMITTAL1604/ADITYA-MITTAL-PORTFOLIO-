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
        const lines = [
          { text: "Architecting Scalable Solutions", align: "flex md:ml-auto" },
          { text: "Through Code, Data,", align: "" },
          { text: "and Engineering.", align: "" },
        ];

        const span = document.createElement("span");
        span.className = "flex flex-col md:w-fit";

        lines.forEach((line, lineIdx) => {
          const lineSpan = document.createElement("span");
          lineSpan.className = lineIdx === 0 ? "flex md:w-fit md:ml-auto" : "flex flex-col";

          if (lineIdx === 0) {
            line.text.split(/\s+/).forEach((w) => {
              const wordSpan = document.createElement("span");
              wordSpan.className = "inline-block mr-[0.3em]";
              wordSpan.style.opacity = "0.12";
              wordSpan.textContent = w;
              lineSpan.appendChild(wordSpan);
            });
          } else {
            const inner = document.createElement("span");
            line.text.split(/\s+/).forEach((w) => {
              const wordSpan = document.createElement("span");
              wordSpan.className = "inline-block mr-[0.3em]";
              wordSpan.style.opacity = "0.12";
              wordSpan.textContent = w;
              inner.appendChild(wordSpan);
            });
            lineSpan.appendChild(inner);
          }

          span.appendChild(lineSpan);
        });

        headingRef.current.appendChild(span);

        const wordSpans = headingRef.current.querySelectorAll("span[style]");
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
      className="relative z-10 mt-[30rem] px-8 md:px-0"
    >
      <div className="lg:max-w-[50vw] lg:w-1/2 md:flex justify-end lg:justify-end pt-[20rem]">
        <div className="w-fit md:w-auto relative z-[1] flex flex-col gap-6 lg:gap-12 xl:gap-[3rem] lg:items-end md:px-12 lg:px-0">
          <h2
            ref={headingRef}
            className="heading-2 font-instrument-serif md:ml-auto lg:ml-0 w-fit md:w-full"
          >
            {/* Content injected by GSAP */}
            Architecting Scalable Solutions Through Code, Data, and Engineering.
          </h2>

          <div className="flex flex-col items-start gap-4 lg:gap-5 xl:gap-8 w-fit">
            <p
              ref={bodyRef}
              className="body-md md:max-w-[26.25rem]"
            >
              CS Undergrad at IP University with a focus on AI pipelines, full-stack architecture, and machine learning. Proven track record of building production-ready platforms that solve real-world problems.
            </p>
            <PillButton href="#about">Learn more</PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
