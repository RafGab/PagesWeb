// Fuentes de los parámetros agronómicos. Son valores generales y orientativos:
// la extensión agraria local y las fichas de cada variedad prevalecen.
export const CROP_SOURCES = {
  knott: {
    id: "knott",
    title: "Knott's Handbook for Vegetable Growers, 5.ª ed. (D.N. Maynard y G.J. Hochmuth, Wiley, 2007)",
    note: "Temperaturas de germinación del suelo (datos de J.F. Harrington), clasificación por tolerancia al frío y rangos de temperatura de cultivo.",
    url: null as string | null,
  },
  extension: {
    id: "extension",
    title: "Guías generales de servicios de extensión agraria (rangos de días a cosecha y marcos de plantación habituales)",
    note: "Rangos típicos que varían mucho según la variedad: verificar en el sobre de semillas o con el vivero.",
    url: null as string | null,
  },
  fruit: {
    id: "fruit",
    title: "Requerimientos generales de frío y rusticidad de frutales (literatura pomológica y de extensión)",
    note: "Valores medios por especie; existen variedades con necesidades muy distintas. Consultar con viveros locales.",
    url: null as string | null,
  },
} as const;

export type CropSourceId = keyof typeof CROP_SOURCES;
