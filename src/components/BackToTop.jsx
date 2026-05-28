import { useEffect, useState } from "react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
      setIsVisible(scrollTop > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const progressDeg = Math.round(scrollProgress * 360);

  return (
    <button
      type="button"
      className={`back-to-top ${isVisible ? "is-visible" : ""}`}
      onClick={handleClick}
      aria-label="Back to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      style={{
        "--progress-deg": `${progressDeg}deg`,
      }}
    >
      <span className="btt-arrow" aria-hidden="true">↑</span>
      <span className="btt-label">Top</span>
    </button>
  );
}