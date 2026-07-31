import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Trophy, Medal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const achievements = [
  {
    title: "Hack 4 Delhi",
    subtitle: "Organized by Municipal Corporation of Delhi & IEEE NSUT",
    highlight: "Top 50",
    description: "Secured a position under the top 50 teams out of 1000+ participating teams.",
    icon: Trophy,
  },
  {
    title: "Hack VSIT 7.0",
    subtitle: "Organized by VIPS TC",
    highlight: "Top 10",
    description: "Ranked under the top 10 teams out of 500+ competing teams.",
    icon: Medal,
  },
];

export default function AchievementsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Heading lines animation
      sectionRef.current!.querySelectorAll("[data-s-lines]").forEach((el) => {
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

      // Cards fade in with scrub effect
      sectionRef.current!.querySelectorAll(".achievement-card").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.2, filter: "blur(4px)", y: 30 },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 60%",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-[7.5rem] py-[8rem] md:py-[12rem]">
      <div className="w-full mx-auto flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-6 w-full text-left items-start">
          <h2 data-s-lines className="heading-2 font-instrument-serif w-full">
            Achievements
          </h2>
          <p data-s-lines className="body-sm md:body-md text-[var(--muted-foreground)] max-w-2xl">
            Recognitions from competitive hackathons and engineering challenges.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {achievements.map((achievement, idx) => {
            const Icon = achievement.icon;
            return (
              <div
                key={idx}
                className="achievement-card relative p-6 md:p-8 flex flex-col gap-4 border border-white/10 bg-[var(--brand-100)]/5 backdrop-blur-md rounded-2xl hover:bg-[var(--brand-100)]/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-[var(--brand-100)]/10 rounded-xl">
                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <span className="px-4 py-1 bg-white/10 rounded-full text-sm font-bold tracking-wider uppercase">
                    {achievement.highlight}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <h3 className="heading-4 font-instrument-serif">{achievement.title}</h3>
                  <p className="body-sm font-medium text-white/80">{achievement.subtitle}</p>
                  <p className="body-sm text-[var(--muted-foreground)] leading-relaxed mt-2">
                    {achievement.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
