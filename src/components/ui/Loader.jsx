import logoImage from "../../assets/logo/logo_image.svg";

/**
 * Loader – animated brand-logo loader.
 *
 * Usage:
 *   <Loader />                          — fullscreen centered overlay
 *   <Loader fullscreen={false} />       — inline block (no min-h-screen)
 *   <Loader label="Loading project..." />
 */
export default function Loader({
  fullscreen = true,
  label = "Loading...",
}) {
  return (
    <div
      className={
        fullscreen
          ? "min-h-screen flex flex-col items-center justify-center gap-8"
          : "flex flex-col items-center justify-center gap-8 py-16"
      }
    >
      {/* ── Animated logo stack ─────────────────────────────── */}
      <div className="relative flex items-center justify-center w-32 h-32">

        {/* Outer rotating ring */}
        <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FF4500] border-r-[#c92a2a] animate-spin opacity-70" />

        {/* Logo image */}
        <img
          src={logoImage}
          alt="Loading…"
          className="relative z-10 w-16 h-16 object-contain animate-pulse drop-shadow-lg"
        />
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
