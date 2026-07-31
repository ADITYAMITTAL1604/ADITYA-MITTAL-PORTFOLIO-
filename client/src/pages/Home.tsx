import { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { AnimatePresence } from "framer-motion";
import HeroSection from "@/components/sections/HeroSection";
import StatementSection from "@/components/sections/StatementSection";
import FeaturedWork from "@/components/sections/FeaturedWork";
import ServicesSection from "@/components/sections/ServicesSection";
import ServicesMobile from "@/components/sections/ServicesMobile";
import ProcessSection from "@/components/sections/ProcessSection";
import AboutSection from "@/components/sections/AboutSection";
import ToolsGrid from "@/components/sections/ToolsGrid";
import AchievementsSection from "@/components/sections/AchievementsSection";
import FooterCTA from "@/components/sections/FooterCTA";
import ContactDrawer from "@/components/ContactDrawer";
import Navbar from "@/components/Navbar";
import CornerBrackets from "@/components/CornerBrackets";
import Starfield from "@/components/Starfield";
import ParticleMorph from "@/components/ParticleMorph";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  const handleContactOpen = useCallback(() => {
    setContactOpen(true);
  }, []);

  // Aggressively force scroll to top on load and hide preloader after animation
  useLayoutEffect(() => {
    // 1. Tell browser not to restore scroll
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    
    // 2. Clear any hash fragment that might cause the browser to jump down
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    // 3. Immediately force scroll to top before paint
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 4. Also attach a beforeunload listener so the browser saves "0" as the scroll position
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // 5. One more check just in case after initial paint
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Preloader */}
      <AnimatePresence mode="wait">
        {showPreloader && <Preloader key="preloader" />}
      </AnimatePresence>

      {/* Fixed UI Chrome */}
      <CustomCursor />
      <Navbar onContactOpen={handleContactOpen} />

      {/* Fixed Background Layers */}
      <Starfield />
      <ParticleMorph />

      {/* Noise Overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Background gradient — radial from top center */}
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #1c0a35 0%, #0e0618 50%, #0a0410 100%)",
        }}
        aria-hidden="true"
      />

      {/* Page Content */}
      <main data-page-content="true" className="container relative z-10">
        <HeroSection />
        <StatementSection />
        <div id="work">
          <FeaturedWork />
        </div>
        <ServicesSection />
        <ServicesMobile />
        <ProcessSection />
        <AboutSection />
        <ToolsGrid />
        <AchievementsSection />
        <FooterCTA onContactOpen={handleContactOpen} />
      </main>

      {/* Contact Drawer */}
      <ContactDrawer open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
