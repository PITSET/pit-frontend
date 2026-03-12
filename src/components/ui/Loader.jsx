import logoImage from "../../assets/logo/logo_image.svg";

/**
 * CampfireLoader – animated brand-logo loader.
 *
 * Usage:
 *   <CampfireLoader />                          — fullscreen centered overlay
 *   <CampfireLoader fullscreen={false} />       — inline block (no min-h-screen)
 *   <CampfireLoader label="Loading project..." />
 */
export default function CampfireLoader({
  fullscreen = true,
  label = "Loading...",
}) {
  return (
    <div
      className={
        fullscreen
          ? "min-h-screen flex flex-col items-center justify-center gap-8 bg-white"
          : "flex flex-col items-center justify-center gap-8 py-16"
      }
    >
      {/* ── Animated logo stack ─────────────────────────────── */}
      <div className="relative flex items-center justify-center w-32 h-32">

        {/* Outer rotating glowing ring */}
        <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FF4500] border-r-[#c92a2a] animate-spin opacity-70" />

        {/* Mid pulsing halo */}
        <span className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-100 to-red-100 animate-pulse opacity-60" />

        {/* Logo image — scale-pulse */}
        <img
          src={logoImage}
          alt="Loading…"
          className="relative z-10 w-16 h-16 object-contain animate-pulse drop-shadow-lg"
        />

        {/* Floating ember dots */}
        {[
          { top: "8%",  left: "50%", delay: "0s",   size: "w-1.5 h-1.5" },
          { top: "20%", left: "80%", delay: "0.5s", size: "w-1 h-1" },
          { top: "20%", left: "20%", delay: "1s",   size: "w-1.5 h-1.5" },
          { top: "50%", left: "90%", delay: "0.3s", size: "w-1 h-1" },
          { top: "50%", left: "10%", delay: "0.8s", size: "w-1 h-1" },
        ].map((dot, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-[#FF4500] animate-ping opacity-75 ${dot.size}`}
            style={{
              top: dot.top,
              left: dot.left,
              animationDelay: dot.delay,
              animationDuration: "1.8s",
            }}
          />
        ))}
      </div>

      {/* Label */}
      {label && (
        <p className="text-gray-500 text-sm font-medium tracking-wider animate-pulse select-none">
          {label}
        </p>
      )}
    </div>
  );
}
