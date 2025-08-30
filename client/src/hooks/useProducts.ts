import { useMemo, useState } from "react";
import { products } from "../data/products";

export function useProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [stockFilter, setStockFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState("list");

  const categories = useMemo(() => ["Todas", ...Array.from(new Set(products.map(p => p.categoria)))], []);

  // Productos filtrados
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search.trim() || [p.nombre, p.categoria].some(v => v.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = category === "Todas" || p.categoria === category;
      const matchStock = stockFilter === "Todos"
        ? true
        : stockFilter === "Con stock" ? p.stock > 0
        : stockFilter === "Bajo stock" ? p.stock > 0 && p.stock <= 5
        : stockFilter === "Sin stock" ? p.stock === 0
        : true;
      return matchSearch && matchCategory && matchStock;
    });
  }, [search, category, stockFilter]);

  const metrics = useMemo(() => {
    const total = products.length;
    const stockTotal = products.reduce((acc, p) => acc + p.stock, 0);
    const bajo = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    return { total, stockTotal, bajo };
  }, []);

  return {
    search,
    setSearch,
    category,
    setCategory,
    stockFilter,
    setStockFilter,
    viewMode,
    setViewMode,
    categories,
    filtered,
    metrics
  };
}
