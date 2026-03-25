import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton({ scrollContainerRef }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // We expect scrollContainerRef to be a React Ref holding the <main> element
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      // Show button only after scrolling down 400px
      if (container.scrollTop > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount to handle initial load state
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  const handleScrollToTop = () => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    // To prevent snap-mandatory from trapping the scroll mid-way,
    // we temporarily clear the scroll snapping behavior.
    container.style.scrollSnapType = "none";

    container.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // Restore snapping seamlessly after the scroll animation ends (~1000ms is usually safe)
    setTimeout(() => {
      container.style.scrollSnapType = "";
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleScrollToTop}
          // Utilizing glassmorphism classes as requested
          className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-2xl flex items-center justify-center hover:bg-brand-primary transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 stroke-2 drop-shadow-md" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
