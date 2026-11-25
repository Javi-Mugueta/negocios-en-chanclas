import type { MetadataRoute } from "next";
import { PAGINAS_PUBLICAS, SITIO_URL } from "@/lib/privacidad";
import { formulariosVisibles } from "@/lib/visibilidad";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const formularios = await formulariosVisibles();
  return PAGINAS_PUBLICAS.filter((ruta) => formularios || ruta !== "/formularios-llc").map((ruta) => ({
    url: `${SITIO_URL}${ruta === "/" ? "" : ruta}`,
    changeFrequency: ruta === "/" ? "weekly" : "monthly",
    priority: ruta === "/" ? 1 : 0.7,
  }));
}
