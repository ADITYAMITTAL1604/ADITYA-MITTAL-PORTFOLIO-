import { motion } from "framer-motion";

/**
 * Preloader — "Where design meets code." text reveals letter-by-letter,
 * then the screen splits open like a gate (two panels slide apart).
 */
export default function Preloader() {
  const text = "Where logic meets scale.";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.01 }}
      className="fixed inset-0 z-[9999999] pointer-events-none"
    >
      {/* Top panel — slides UP */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: "-100%" }}
        transition={{ delay: 2.0, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-x-0 top-0 h-1/2 bg-[#0e0618] z-[2]"
      />

      {/* Bottom panel — slides DOWN */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: "100%" }}
        transition={{ delay: 2.0, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0e0618] z-[2]"
      />

      {/* Center text — fades in then fades out before gate opens */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.6, duration: 0.4, ease: "easeIn" }}
        className="absolute inset-0 z-[3] flex items-center justify-center bg-[#0e0618]"
      >
        <div className="overflow-hidden">
          <motion.p
            className="font-instrument-serif text-3xl md:text-5xl italic text-[var(--foreground)]"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04,
                },
              },
            }}
          >
            {text.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, filter: "blur(12px)", y: 8 },
                  visible: {
                    opacity: 1,
                    filter: "blur(0px)",
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut" },
                  },
                }}
                style={{
                  display: "inline-block",
                  whiteSpace: char === " " ? "pre" : "normal",
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
