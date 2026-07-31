import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const serviceGroups = [
  {
    title: "AI & Machine Learning",
    cards: [
      { title: "Predictive Modeling", subtitle: "Gradient Boosting & Scikit-learn", description: "Training and deploying robust machine learning models. Experience achieving high R² scores and low RMSE for complex predictive tasks." },
      { title: "LLM Integration", subtitle: "Claude API & Gemini", description: "Building intelligent AI co-pilots and automated pipelines. Context-aware prompt engineering to generate structured, actionable insights for end-users." },
      { title: "Fraud Detection Pipelines", subtitle: "Hybrid ML & Rule-based engines", description: "Architecting multi-stage AI pipelines combining ML anomaly detection with rule-based systems for robust, production-grade security." },
    ],
  },
  {
    title: "Full-Stack Architecture",
    cards: [
      { title: "Scalable Backends", subtitle: "FastAPI, Node.js & PostgreSQL", description: "Designing RESTful APIs and microservices that can handle complex data flows, user authentication, and high-throughput real-time processing." },
      { title: "Responsive Frontends", subtitle: "React, Tailwind & Recharts", description: "Building data-rich, performant web applications with intuitive UI/UX. From dark mode support to complex data visualization and PWA capabilities." },
      { title: "Mobile Development", subtitle: "React Native & Expo", description: "Developing cross-platform mobile applications with deep device integration, including background geolocation, Firebase sync, and real-time push notifications." },
    ],
  },
  {
    title: "Systems Engineering",
    cards: [
      { title: "Data Engineering", subtitle: "Python & Pandas", description: "Processing and engineering complex datasets. Extracting features from raw data to feed into predictive models and real-time BI dashboards." },
      { title: "Cloud Deployment", subtitle: "Render & Firebase", description: "Deploying full-stack applications with CI/CD, configuring serverless databases, managing auth flows, and integrating third-party APIs." },
      { title: "Algorithmic Efficiency", subtitle: "Java & DSA", description: "Strong foundation in Data Structures and Algorithms. Focused on writing optimized, highly-performant code for resource-intensive applications." },
    ],
  },
];

export default function ServicesMobile() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      sectionRef.current!.querySelectorAll("[data-s-lines]").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });

      sectionRef.current!.querySelectorAll("[data-s-fade-in]").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 25 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 block md:hidden">
      <div className="pt-[10rem] pb-[20rem] flex flex-col justify-between gap-[7.5rem]">
        {/* Heading */}
        <div className="px-8">
          <div className="flex flex-col gap-6 w-fit mx-auto">
            <h2 data-s-lines className="heading-2 font-instrument-serif w-full max-w-[27.5rem] indent-20">
              From Data to Deployment, I've Got You Covered.
            </h2>
            <p data-s-lines className="body-sm md:max-w-[26.25rem] ml-20">
              I build intelligent software systems that solve real problems — AI pipelines, scalable backends, and full-stack platforms that drive impact.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="relative flex flex-col gap-8 max-w-[30rem] ml-auto">
          {serviceGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <p data-s-lines className="heading-3 font-instrument-serif px-8 pb-2">{group.title}</p>
              <div className="overflow-hidden px-4">
                {group.cards.map((card, cIdx) => (
                  <div
                    key={cIdx}
                    data-s-fade-in
                    className="h-full relative p-5 flex flex-col gap-2 border-t border-l border-r last:border-b border-white/10 bg-[var(--brand-100)]/10 backdrop-blur-xl"
                  >
                    <p className="heading-6 uppercase font-black">{card.title}</p>
                    <p className="body-sm font-semibold">{card.subtitle}</p>
                    <p className="body-sm text-[var(--muted-foreground)]">{card.description}</p>
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
