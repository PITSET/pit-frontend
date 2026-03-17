import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollToId = (id, { behavior = "smooth", block = "start" } = {}) => {
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block });
  return true;
};

const tryScrollWithRetry = (id, options) => {
  let cancelled = false;
  let attempts = 0;
  const maxAttempts = 40; // ~4s at 100ms intervals for async-loaded pages

  const tick = () => {
    if (cancelled) return;
    if (scrollToId(id, options)) return;
    attempts += 1;
    if (attempts < maxAttempts) setTimeout(tick, 100);
  };

  tick();
  return () => {
    cancelled = true;
  };
};

/**
 * ScrollToHash
 * - Smooth scrolling to `#hash` targets after route changes
 * - Works around react-router not auto-scrolling to hashes
 * - Supports clicking the same hash-link repeatedly (no location change)
 */
export default function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash ? location.hash.slice(1) : "";
    if (!id) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    return tryScrollWithRetry(id, { behavior: "smooth", block: "start" });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleClick = (event) => {
      const anchor = event.target?.closest?.("a[href]");
      if (!anchor) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href") || "";
      if (!href.includes("#")) return;

      let targetUrl;
      try {
        targetUrl = new URL(href, window.location.href);
      } catch {
        return;
      }

      const current = window.location;
      if (targetUrl.pathname !== current.pathname) return;
      if (targetUrl.hash !== current.hash) return;

      const id = targetUrl.hash ? targetUrl.hash.slice(1) : "";
      if (!id) return;

      tryScrollWithRetry(id, { behavior: "smooth", block: "start" });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

