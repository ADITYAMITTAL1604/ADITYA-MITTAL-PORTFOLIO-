import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CTAInterstitialProps {
  onContactOpen: () => void;
}

export default function CTAInterstitial({ onContactOpen }: CTAInterstitialProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const printEl = sectionRef.current!.querySelector("[data-s-print-opacity]");
      if (!printEl) return;

      // Get all text nodes and wrap words
      const walker = document.createTreeWalker(printEl, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
      }

      const allSpans: HTMLSpanElement[] = [];
      textNodes.forEach((textNode) => {
        const words = textNode.textContent?.split(/\s+/).filter(Boolean) || [];
        if (words.length === 0) return;

        const frag = document.createDocumentFragment();
        words.forEach((w, i) => {
          const span = document.createElement("span");
          span.className = "inline-block";
          span.style.opacity = "0.12";
          span.textContent = w;
          frag.appendChild(span);
          if (i < words.length - 1) {
            frag.appendChild(document.createTextNode(" "));
          }
        });
        textNode.parentNode?.replaceChild(frag, textNode);
      });

      // Now get all the word spans we created
      printEl.querySelectorAll("span.inline-block").forEach((s) => {
        allSpans.push(s as HTMLSpanElement);
      });

      gsap.to(allSpans, {
        opacity: 1,
        stagger: 0.04,
        scrollTrigger: {
          trigger: printEl,
          start: "top 80%",
          end: "bottom 30%",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 min-h-[60vh] md:min-h-[80vh] flex items-center justify-center px-8 md:px-12 lg:px-16 xl:px-24 py-24"
    >
      <h2
        data-s-print-opacity
        className="text-center text-[clamp(2rem,5.5vw,6rem)] font-red-hat-display font-black italic uppercase leading-[1.05] max-w-[72rem]"
      >
        Interested in working together?{" "}
        <a
          href="mailto:adityamittal568@gmail.com"
          className="underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all"
        >
          Drop a line
        </a>{" "}
        or simply{" "}
        <button
          onClick={onContactOpen}
          className="underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all cursor-pointer"
        >
          get in touch
        </button>
      </h2>
    </section>
  );
}
