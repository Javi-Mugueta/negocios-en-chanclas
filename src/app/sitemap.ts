import type { MetadataRoute } from "next";
import { PAGINAS_PUBLICAS, SITIO_URL } from "@/lib/privacidad";

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGINAS_PUBLICAS.map((ruta) => ({
    url: `${SITIO_URL}${ruta === "/" ? "" : ruta}`,
    changeFrequency: ruta === "/" ? "weekly" : "monthly",
    priority: ruta === "/" ? 1 : 0.7,
  }));
}
