import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import HeroSection from "@/components/sections/HeroSection";
import StatementSection from "@/components/sections/StatementSection";
import FeaturedWork from "@/components/sections/FeaturedWork";
import ServicesSection from "@/components/sections/ServicesSection";
import ServicesMobile from "@/components/sections/ServicesMobile";
import ProcessSection from "@/components/sections/ProcessSection";
import AboutSection from "@/components/sections/AboutSection";
import ToolsGrid from "@/components/sections/ToolsGrid";
import PurposeSection from "@/components/sections/PurposeSection";
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

  // Force scroll to top on load, hide preloader after animation
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    
    // Slight delay to ensure DOM is ready before forcing scroll
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

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
      <CornerBrackets />

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
        <PurposeSection />
        <FooterCTA onContactOpen={handleContactOpen} />
      </main>

      {/* Contact Drawer */}
      <ContactDrawer open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
