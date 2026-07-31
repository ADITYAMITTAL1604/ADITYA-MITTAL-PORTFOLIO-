import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const toolCategories = [
  { title: "Languages", tools: ["Java", "Python", "TypeScript", "JavaScript", "SQL"] },
  { title: "Backend", tools: ["FastAPI", "Flask", "Node.js", "Firebase", "PostgreSQL"] },
  { title: "Frontend & Mobile", tools: ["React Native", "Expo", "React", "HTML/CSS", "Tailwind CSS"] },
  { title: "Machine Learning", tools: ["Scikit-learn", "NumPy", "Pandas", "Gradient Boosting"] },
  { title: "AI Integration", tools: ["Claude API", "Gemini API", "OpenRouter", "LLM Prompting"] },
  { title: "Data & Mapping", tools: ["Leaflet.js", "Recharts", "Haversine Math", "jsPDF"] },
  { title: "Tools & DevOps", tools: ["Git", "GitHub", "Render", "Linux", "Vite"] },
  { title: "Core Skills", tools: ["Data Structures", "Algorithms", "System Design", "Agile"] },
];

const companies = [
  "Google", "Amazon", "Apple", "Meta", "Netflix", "Microsoft", "Atlassian", "Uber", "Stripe"
];

export default function ToolsGrid() {
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

      sectionRef.current!.querySelectorAll("[data-s-fade-in]").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 25 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: i * 0.04,
            scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="tools-section relative z-10 py-24 md:py-32 overflow-hidden">
      <div className="px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-[7.5rem]">
        <div className="grid md:grid-cols-[2fr_1fr] gap-16 md:gap-24">

          {/* Left: Tools grid */}
          <div className="flex flex-col gap-12">
            <h2 data-s-lines className="heading-2 font-instrument-serif" style={{ color: "#1a1a1a" }}>
              Tools and Technologies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {toolCategories.map((cat, idx) => (
                <div
                  key={idx}
                  data-s-fade-in
                  className="p-5 rounded-sm border border-black/8 bg-white/60 backdrop-blur-sm"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#1a1a1a" }}>
                    {cat.title}
                  </h3>
                  <ul className="space-y-1">
                    {cat.tools.map((tool, i) => (
                      <li key={i} className="text-sm" style={{ color: "#555" }}>{tool}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Expertise */}
          <div data-s-lines className="flex flex-col gap-8">
            <h3 className="heading-3 font-instrument-serif" style={{ color: "#1a1a1a" }}>Expertise</h3>
            <p className="body-md" style={{ color: "#555" }}>
              I am a driven Software Engineer focused on building robust backends, intelligent ML models, and seamless full-stack applications. I possess a strong foundation in Data Structures and Algorithms (Java) and hands-on experience deploying production-ready platforms using modern tech stacks.
            </p>
          </div>
        </div>


      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
