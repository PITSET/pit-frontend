const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const getBackendOrigin = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return "";
  }
};

export default function resolveAssetUrl(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (
    isAbsoluteUrl(raw) ||
    raw.startsWith("//") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  const origin = getBackendOrigin();
  if (!origin) return raw;

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}

