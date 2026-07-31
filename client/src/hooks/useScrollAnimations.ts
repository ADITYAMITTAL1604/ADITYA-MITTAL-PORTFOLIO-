import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollAnimations — Applies the reference site's scroll animation patterns
 * to elements within a container using data attributes.
 *
 * Supported data attributes:
 * - data-s-print-opacity: Words fade in one by one as you scroll (print effect)
 * - data-s-lines: Lines slide up into view one by one
 * - data-s-fade-in: Element fades in when entering viewport
 * - data-s-fade-in-out: Element fades in then out as you scroll past
 */
export function useScrollAnimations(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // ── Print-opacity: words appear one by one ──
      const printEls = containerRef.current!.querySelectorAll("[data-s-print-opacity]");
      printEls.forEach((el) => {
        const text = el.textContent || "";
        const words = text.split(/\s+/);
        el.innerHTML = words
          .map((w) => `<span class="inline-block" style="opacity: 0.15">${w}</span>`)
          .join(" ");

        const spans = el.querySelectorAll("span");
        gsap.to(spans, {
          opacity: 1,
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom 40%",
            scrub: true,
          },
        });
      });

      // ── Lines: each line slides up ──
      const lineEls = containerRef.current!.querySelectorAll("[data-s-lines]");
      lineEls.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ── Fade-in: element fades in ──
      const fadeInEls = containerRef.current!.querySelectorAll("[data-s-fade-in]");
      fadeInEls.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // ── Fade-in-out: scrub-based fade in then out ──
      const fadeInOutEls = containerRef.current!.querySelectorAll("[data-s-fade-in-out]");
      fadeInOutEls.forEach((el) => {
        // Fade in
        gsap.fromTo(
          el,
          { autoAlpha: 0.1, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "top 40%",
              scrub: true,
            },
          }
        );
        // Fade out
        gsap.to(el, {
          autoAlpha: 0.1,
          y: -15,
          scrollTrigger: {
            trigger: el,
            start: "bottom 50%",
            end: "bottom 20%",
            scrub: true,
          },
        });
      });

      // ── Dissolve-in: section dissolves in as it enters ──
      const dissolveInEls = containerRef.current!.querySelectorAll("[data-dissolve-in]");
      dissolveInEls.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "top 50%",
              scrub: true,
            },
          }
        );
      });

      // ── Dissolve-out: section dissolves out as it leaves ──
      const dissolveOutEls = containerRef.current!.querySelectorAll("[data-dissolve-out]");
      dissolveOutEls.forEach((el) => {
        gsap.to(el, {
          opacity: 0,
          scrollTrigger: {
            trigger: el,
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef]);
}

/**
 * useRevealOnLoad — Fades in elements after preloader with staggered delays
 */
export function useRevealOnLoad(
  refs: React.RefObject<HTMLElement | null>[],
  delay: number = 2.8
) {
  useEffect(() => {
    const tl = gsap.timeline({ delay });
    refs.forEach((ref, i) => {
      if (!ref.current) return;
      gsap.set(ref.current, { opacity: 0, y: 20, filter: "blur(8px)" });
      tl.to(
        ref.current,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
        },
        i * 0.15
      );
    });

    return () => {
      tl.kill();
    };
  }, [refs, delay]);
}

/**
 * ScrollRevealText — Component that wraps text with print-opacity effect
 */
export function usePrintOpacity(ref: React.RefObject<HTMLElement | null>) {
  const wrapperRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    wrapperRef.current = el;

    const text = el.textContent || "";
    const words = text.split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="inline" style="opacity: 0.12">${w}</span>`)
      .join(" ");

    const spans = el.querySelectorAll("span");
    const ctx = gsap.context(() => {
      gsap.to(spans, {
        opacity: 1,
        stagger: 0.06,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "bottom 45%",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [ref]);
}
