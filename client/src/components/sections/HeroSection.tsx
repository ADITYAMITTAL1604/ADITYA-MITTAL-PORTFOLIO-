import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PillButton from "@/components/PillButton";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.6 });

    // Set initial states
    [labelRef, titleRef, descRef, ctaRef].forEach((ref) => {
      if (ref.current) {
        gsap.set(ref.current, { opacity: 0, y: 25, filter: "blur(10px)" });
      }
    });

    // Staggered reveal
    if (labelRef.current) {
      tl.to(labelRef.current, {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: 1.2, ease: "power3.out",
      }, 0);
    }
    if (titleRef.current) {
      tl.to(titleRef.current, {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: 1.2, ease: "power3.out",
      }, 0.15);
    }
    if (descRef.current) {
      tl.to(descRef.current, {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: 1.2, ease: "power3.out",
      }, 0.3);
    }
    if (ctaRef.current) {
      tl.to(ctaRef.current, {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: 1.2, ease: "power3.out",
      }, 0.45);
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <section
      data-home-hero="true"
      className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center mt-[64px] pt-12 md:pt-20 px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-[7.5rem] pb-20 md:pb-32 text-center"
    >
      {/* Top: Eyebrow + Headline */}
      <div className="flex flex-col gap-4 items-center">
        <p ref={labelRef} className="text-sm tracking-wide opacity-0">
          Software Engineer &amp; CS Undergrad
        </p>
        <h1
          ref={titleRef}
          className="heading-1 font-instrument-serif italic max-w-[25rem] md:max-w-[40rem] lg:max-w-[50rem] opacity-0"
        >
          I build intelligent systems <span className="opacity-60">at scale</span>.
        </h1>
      </div>

      {/* Bottom: CTA + Description */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 mt-16 md:mt-24">
        <p
          ref={descRef}
          className="body-md text-center opacity-0"
        >
          I work at the intersection of full-stack engineering and AI. From developing scalable backend pipelines and ML models to crafting robust, data-driven platforms. Driven by high performance and impact.
        </p>

        <div ref={ctaRef} className="flex gap-4 opacity-0">
          <PillButton href="/resume.pdf" download="Aditya_Mittal_Resume.pdf">Download resume</PillButton>
          <PillButton href="#work">View work</PillButton>
        </div>
      </div>
    </section>
  );
}
