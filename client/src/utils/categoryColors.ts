// Paleta de colores suaves (Tailwind)
type Badge = { bg: string; text: string; ring: string };
const PALETTE: Badge[] = [
  { bg: "bg-blue-50",     text: "text-blue-700",     ring: "ring-blue-200" },
  { bg: "bg-emerald-50",  text: "text-emerald-700",  ring: "ring-emerald-200" },
  { bg: "bg-purple-50",   text: "text-purple-700",   ring: "ring-purple-200" },
  { bg: "bg-amber-50",    text: "text-amber-800",    ring: "ring-amber-200" },
  { bg: "bg-pink-50",     text: "text-pink-700",     ring: "ring-pink-200" },
  { bg: "bg-sky-50",      text: "text-sky-700",      ring: "ring-sky-200" },
  { bg: "bg-teal-50",     text: "text-teal-700",     ring: "ring-teal-200" },
  { bg: "bg-rose-50",     text: "text-rose-700",     ring: "ring-rose-200" },
  { bg: "bg-indigo-50",   text: "text-indigo-700",   ring: "ring-indigo-200" },
  { bg: "bg-lime-50",     text: "text-lime-700",     ring: "ring-lime-200" },
];

const STORAGE_KEY = "categoryColorMap_v1";

export type CategoryColorMap = Record<string, Badge>;

/** Crea/actualiza un mapa categoría→color sin repetir mientras alcance la paleta. */
export function buildCategoryColorMap(categories: string[]): CategoryColorMap {
  const saved: CategoryColorMap = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const map: CategoryColorMap = { ...saved };

  // orden determinista: alfabético para consistencia
  const unique = Array.from(new Set(categories.filter(Boolean))).sort();

  // asigna colores a las nuevas categorías
  let i = Object.keys(map).length % PALETTE.length;
  for (const c of unique) {
    if (!map[c]) {
      map[c] = PALETTE[i];
      i = (i + 1) % PALETTE.length;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  return map;
}
