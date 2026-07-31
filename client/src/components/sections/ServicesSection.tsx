import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const serviceGroups = [
  {
    title: "AI & Machine Learning",
    cards: [
      {
        title: "Predictive Modeling",
        subtitle: "Gradient Boosting & Scikit-learn",
        description: "Training and deploying robust machine learning models. Experience achieving high R² scores and low RMSE for complex predictive tasks.",
      },
      {
        title: "LLM Integration",
        subtitle: "Claude API & Gemini",
        description: "Building intelligent AI co-pilots and automated pipelines. Context-aware prompt engineering to generate structured, actionable insights for end-users.",
      },
      {
        title: "Fraud Detection Pipelines",
        subtitle: "Hybrid ML & Rule-based engines",
        description: "Architecting multi-stage AI pipelines combining ML anomaly detection with rule-based systems for robust, production-grade security.",
      },
    ],
  },
  {
    title: "Full-Stack Architecture",
    cards: [
      {
        title: "Scalable Backends",
        subtitle: "FastAPI, Node.js & PostgreSQL",
        description: "Designing RESTful APIs and microservices that can handle complex data flows, user authentication, and high-throughput real-time processing.",
      },
      {
        title: "Responsive Frontends",
        subtitle: "React, Tailwind & Recharts",
        description: "Building data-rich, performant web applications with intuitive UI/UX. From dark mode support to complex data visualization and PWA capabilities.",
      },
      {
        title: "Mobile Development",
        subtitle: "React Native & Expo",
        description: "Developing cross-platform mobile applications with deep device integration, including background geolocation, Firebase sync, and real-time push notifications.",
      },
    ],
  },
  {
    title: "Systems Engineering",
    cards: [
      {
        title: "Data Engineering",
        subtitle: "Python & Pandas",
        description: "Processing and engineering complex datasets. Extracting features from raw data to feed into predictive models and real-time BI dashboards.",
      },
      {
        title: "Cloud Deployment",
        subtitle: "Render & Firebase",
        description: "Deploying full-stack applications with CI/CD, configuring serverless databases, managing auth flows, and integrating third-party APIs.",
      },
      {
        title: "Algorithmic Efficiency",
        subtitle: "Java & DSA",
        description: "Strong foundation in Data Structures and Algorithms. Focused on writing optimized, highly-performant code for resource-intensive applications.",
      },
    ],
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      if (!sectionRef.current || !containerRef.current) return;

      const groups = groupRefs.current.filter(Boolean) as HTMLDivElement[];
      if (groups.length < 2) return;

      // Position second and third groups absolutely on top of first, offset downwards
      groups.slice(1).forEach((g) => {
        gsap.set(g, { autoAlpha: 0, y: 80, position: "absolute", inset: 0 });
      });

      const wrapper = groups[0].parentElement;
      if (wrapper) {
        wrapper.style.position = "relative";
      }

      // Pin the container and execute sequential swipe transitions
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5, 
          pin: containerRef.current,
          pinSpacing: false,
        },
      });

      tl.to(groups[0], { autoAlpha: 0, y: 40, duration: 1, ease: "power1.inOut" })
        .to(groups[1], { autoAlpha: 1, y: 0, duration: 1, ease: "power1.inOut" }, "<")
        .to({}, { duration: 0.5 })
        .to(groups[1], { autoAlpha: 0, y: 40, duration: 1, ease: "power1.inOut" })
        .to(groups[2], { autoAlpha: 1, y: 0, duration: 1, ease: "power1.inOut" }, "<")
        .to({}, { duration: 0.5 });

      return () => { tl.kill(); };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 h-[300vh] hidden md:block">
      <div
        ref={containerRef}
        className="sticky top-0 h-screen pt-20 md:pt-[7.5rem] lg:pt-20 xl:pt-[10rem] flex flex-col justify-center gap-12 lg:gap-20"
      >
        {/* Top: Heading + Description */}
        <div className="w-full px-8 lg:px-12 xl:px-16 2xl:px-[7.5rem]">
          <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto text-center items-center">
            <h2 className="heading-2 font-instrument-serif w-full">
              From Data to Deployment, I've Got You Covered.
            </h2>
            <p className="body-md w-full max-w-2xl text-[var(--muted-foreground)]">
              I build intelligent software systems that solve real problems — AI pipelines, scalable backends, and full-stack platforms that drive impact.
            </p>
          </div>
        </div>

        {/* Bottom: Service card groups */}
        <div className="relative">
          {serviceGroups.map((group, idx) => (
            <div
              key={idx}
              ref={(el) => { groupRefs.current[idx] = el; }}
            >
              {/* Category title */}
              <p className="heading-3 md:heading-4 font-instrument-serif pb-3 xl:pb-6 px-8">
                {group.title}
              </p>

              {/* 3-column card grid */}
              <div className="grid md:grid-cols-3 overflow-hidden">
                {group.cards.map((card, cardIdx) => (
                  <div
                    key={cardIdx}
                    className="h-full relative p-5 xl:p-8 md:aspect-[400/500] lg:aspect-[480/260] flex flex-col gap-2 xl:gap-4 border-t border-white/[0.04] bg-[var(--brand-100)]/10 backdrop-blur-xl"
                  >
                    <p className="heading-6 uppercase font-black">{card.title}</p>
                    <p className="body-sm font-semibold">{card.subtitle}</p>
                    <p className="body-sm text-[var(--muted-foreground)]">{card.description}</p>
                    {/* Vertical separator */}
                    {cardIdx < group.cards.length - 1 && (
                      <div className="absolute top-0 right-0 w-px h-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
