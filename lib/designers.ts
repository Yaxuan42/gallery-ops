// Designer slug mapping - client-safe (no prisma imports)
export const DESIGNER_SLUG_MAP: Record<string, string> = {
  eames: "Eames",
  "pierre-jeanneret": "昌迪加尔",
  "le-corbusier": "Le Corbusier",
  "charlotte-perriand": "Charlotte Perriand",
  "jean-prouve": "Jean Prouve",
  "pierre-chapo": "Pierre Chapo",
  "poul-henningsen": "Poul Henningsen",
  "bernard-albin-gras": "Bernard-Albin Gras",
};

// Reverse mapping: series value -> slug
export const DESIGNER_SERIES_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(DESIGNER_SLUG_MAP).map(([slug, series]) => [series, slug]),
);

// Designer display names for each locale
export const DESIGNER_DISPLAY_NAMES: Record<string, { zh: string; en: string }> = {
  eames: { zh: "Eames", en: "Eames" },
  "pierre-jeanneret": { zh: "Pierre Jeanneret / 昌迪加尔", en: "Pierre Jeanneret" },
  "le-corbusier": { zh: "Le Corbusier", en: "Le Corbusier" },
  "charlotte-perriand": { zh: "Charlotte Perriand", en: "Charlotte Perriand" },
  "jean-prouve": { zh: "Jean Prouve", en: "Jean Prouve" },
  "pierre-chapo": { zh: "Pierre Chapo", en: "Pierre Chapo" },
  "poul-henningsen": { zh: "Poul Henningsen", en: "Poul Henningsen" },
  "bernard-albin-gras": { zh: "Bernard-Albin Gras", en: "Bernard-Albin Gras" },
};
