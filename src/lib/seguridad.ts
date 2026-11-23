const SCRIPT =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

export function valorCsp(): string {
  return [
    "default-src 'self'",
    SCRIPT,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

const CABECERAS = [
  { key: "Content-Security-Policy", value: valorCsp() },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
] as const;

export function cabecerasSeguridad() {
  return ["/panel", "/panel/:path*", "/api/:path*"].map((source) => ({
    source,
    headers: CABECERAS.map((header) => ({ ...header })),
  }));
}
