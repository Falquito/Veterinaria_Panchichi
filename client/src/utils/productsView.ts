import type { Product } from "../types/product";

export const getCategoriaNombre = (p: Product): string => {
  const raw: any = p as any;
  return typeof raw.categoria === "string"
    ? raw.categoria
    : raw.categoria?.nombre ??
      raw.NombreCategoria ??
      raw.nombrecategoria ??
      raw.nombreCategoria ??
      "—";
};

export const deriveEstado = (p: Product) => {
  if ((p as any)?.activo === false) {
    return { label: "Inactivo", color: "border-red-300 text-red-700 bg-red-50" };
  }
  const stock = Number(p?.stock ?? 0);
  if (stock <= 0) {
    return { label: "Sin stock", color: "border-red-300 text-red-700 bg-red-50" };
  }
  return { label: "Activo", color: "border-emerald-300 text-emerald-700 bg-emerald-50" };
};

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
