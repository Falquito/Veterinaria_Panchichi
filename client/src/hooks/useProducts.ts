import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "../types/product";
import { getProducts, archiveProduct, restoreProduct } from "../services/productService";
import { buildCategoryColorMap } from "../utils/categoryColors";

export type StockFilter = "Todos" | "Con stock" | "Sin stock" | "Bajo stock";
export type StatusFilter = "Activos" | "Archivados" | "Todos";

type Params = {
  search?: string;
  category?: string;
  stockFilter?: StockFilter;
  statusFilter?: StatusFilter;
  refreshKey?: number;

};

export type CategoryColorMap = Record<string, { bg: string; text: string; ring: string }>;

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

export function useProducts(params?: Params) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [stockFilter, setStockFilter] = useState<StockFilter>("Todos");
  const [viewMode, setViewMode] = useState("list");
  const [statusInternal, setStatusInternal] = useState<StatusFilter>("Activos");

  // ----- Datos del backend
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshKey = params?.refreshKey ?? 0;
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setItems(data);
      setError(null);
    } catch (e) {
      console.error("Error al cargar productos", e);
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }, []);

    useEffect(() => { 
    void refresh(); 
  }, [refresh, refreshKey]);  


  const effective = {
    search: params?.search ?? search,
    category: params?.category ?? category,
    stockFilter: params?.stockFilter ?? stockFilter,
    statusFilter: params?.statusFilter ?? statusInternal,
  };

  // ----- Filtrado por estado (activos/archivados)
  const base = useMemo(() => {
    const isInactive = (p: Product) => (p as any).activo === false;
    if (effective.statusFilter === "Todos") return items;
    return items.filter((p) =>
      effective.statusFilter === "Archivados" ? isInactive(p) : !isInactive(p)
    );
  }, [items, effective.statusFilter]);

  // ----- Productos filtrados
  const products = useMemo(() => {
    const q = effective.search.trim().toLowerCase();
    const isBajoStock = (n: number) => n > 0 && n <= 5;

    return base.filter((p) => {
      const nombre = (p.nombre ?? "").toLowerCase();
      const descripcion = (p.descripcion ?? "").toLowerCase();
      const cat = getCategoriaNombre(p);
      const stock = Number(p.stock ?? 0);

      const okSearch =
        !q || nombre.includes(q) || descripcion.includes(q) || cat.toLowerCase().includes(q);
      const okCategory = effective.category === "Todos" || cat === effective.category;

      let okStock = true;
      if (effective.stockFilter === "Con stock") okStock = stock > 0;
      else if (effective.stockFilter === "Sin stock") okStock = stock === 0;
      else if (effective.stockFilter === "Bajo stock") okStock = isBajoStock(stock);

      return okSearch && okCategory && okStock;
    });
  }, [base, effective.search, effective.category, effective.stockFilter]);

  // ----- Categorías y color map (para badges y filtros)
  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(items.map(getCategoriaNombre)))],
    [items]
  );
  const colorMap: CategoryColorMap = useMemo(
    () => buildCategoryColorMap(categories),
    [categories]
  );

  // ----- Métricas 
  const metrics = useMemo(() => {
    const total = items.length;
    const stockTotal = items.reduce((acc, p) => acc + Number(p.stock ?? 0), 0);
    const bajo = items.filter((p) => {
      const s = Number(p.stock ?? 0);
      return s > 0 && s <= 5;
    }).length;
    return { total, stockTotal, bajo };
  }, [items]);

  // ----- Helpers/acciones
  const handleEdit = useCallback((p: Product) => {
    console.log("Editar producto:", p.id);
  }, []);

  const handleArchive = useCallback(async (id: number) => {
    await archiveProduct(id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, activo: false } : p)));
  }, []);

  const handleRestore = useCallback(async (id: number) => {
    await restoreProduct(id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, activo: true } : p)));
  }, []);

  // -----  "filtered" con los filtros INTERNOS (para el contador del panel)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const isBajoStock = (n: number) => n > 0 && n <= 5;

    return items.filter((p) => {
      const nombre = (p.nombre ?? "").toLowerCase();
      const descripcion = (p.descripcion ?? "").toLowerCase();
      const cat = getCategoriaNombre(p);
      const stock = Number(p.stock ?? 0);

      const okSearch =
        !q || nombre.includes(q) || descripcion.includes(q) || cat.toLowerCase().includes(q);
      const okCategory = category === "Todos" || cat === category;

      let okStock = true;
      if (stockFilter === "Con stock") okStock = stock > 0;
      else if (stockFilter === "Sin stock") okStock = stock === 0;
      else if (stockFilter === "Bajo stock") okStock = isBajoStock(stock);

      return okSearch && okCategory && okStock;
    });
  }, [items, search, category, stockFilter]);

  return {
    // Para ProductTable/ProductGrid 
    products,
    loading,
    error,
    colorMap,
    getCategoriaNombre,
    handleEdit,
    handleArchive,
    handleRestore,
    refresh,

    // Para Products.tsx 
    search, setSearch,
    category, setCategory,
    stockFilter, setStockFilter,
    viewMode, setViewMode,
    statusInternal, setStatusInternal, 
    categories,
    filtered,
    metrics,
  };
}