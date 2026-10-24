import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Monitor window scroll position to toggle the floating button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      className="fixed bottom-6 right-6 z-40 p-2.5 rounded-xl bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-gray-700 shadow-lg hover:shadow-xl hover:bg-sky-50 dark:hover:bg-gray-750 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};

export default ScrollToTop;
