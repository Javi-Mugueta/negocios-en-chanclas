const CLAVES = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const KEY = "nec_utm";

export function recordarUtm() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const actuales: Record<string, string> = {};
  for (const clave of CLAVES) {
    const valor = params.get(clave)?.trim();
    if (valor) actuales[clave] = valor.slice(0, 200);
  }
  if (Object.keys(actuales).length) sessionStorage.setItem(KEY, JSON.stringify(actuales));
}

export function leerAtribucion(): { pagina: string; utm: Record<string, string> | null } {
  recordarUtm();
  let utm: Record<string, string> | null = null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const limpio: Record<string, string> = {};
      for (const clave of CLAVES) {
        const valor = parsed[clave];
        if (typeof valor === "string" && valor.trim()) limpio[clave] = valor.trim().slice(0, 200);
      }
      if (Object.keys(limpio).length) utm = limpio;
    }
  } catch {
    utm = null;
  }
  return {
    pagina: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    utm,
  };
}
