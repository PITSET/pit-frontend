import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const getDefaultOffset = () => {
  const header = document.querySelector("header");
  const headerHeight = header?.getBoundingClientRect?.().height || 0;
  return headerHeight ? Math.ceil(headerHeight) + 8 : 0;
};

const scrollToId = (
  id,
  { behavior = "smooth", block = "start", offset = getDefaultOffset() } = {},
) => {
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block });
  if (offset) {
    requestAnimationFrame(() => {
      window.scrollBy({ top: -offset, left: 0 });
    });
  }
  return true;
};

const tryScrollWithRetry = (id, options) => {
  let cancelled = false;
  let attempts = 0;
  const maxAttempts = 10;

  const tick = () => {
    if (cancelled) return;
    if (scrollToId(id, options)) return;
    attempts += 1;
    if (attempts < maxAttempts) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
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

  // Scroll on route/hash change.
  useEffect(() => {
    const id = location.hash ? location.hash.slice(1) : "";
    if (!id) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    return tryScrollWithRetry(id, { behavior: "smooth", block: "start" });
  }, [location.pathname, location.hash]);

  // Also handle "same link clicked again" (react-router may not re-navigate).
  useEffect(() => {
    const handleClick = (event) => {
      const anchor = event.target?.closest?.("a[href]");
      if (!anchor) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return; // only left click
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
      const samePath = targetUrl.pathname === current.pathname;
      const sameHash = targetUrl.hash === current.hash;

      if (!samePath || !sameHash) return;

      const id = targetUrl.hash ? targetUrl.hash.slice(1) : "";
      if (!id) return;

      // Re-scroll on repeated clicks.
      tryScrollWithRetry(id, { behavior: "smooth", block: "start" });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

