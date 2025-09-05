// src/components/products/ProductFilters.tsx
import { Search, Filter, Grid3X3, List } from "lucide-react";
import type { StockFilter, StatusFilter } from "../../hooks/useProducts";

interface ProductFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
    stockFilter: StockFilter;                         
  setStockFilter: (value: StockFilter) => void;     
  viewMode: string;
  setViewMode: (value: string) => void;
  categories: string[];
  filteredCount: number;
  totalCount: number;

  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
}
export function ProductFilters({
  search, setSearch,
  category, setCategory,
  stockFilter, setStockFilter,
  viewMode, setViewMode,
  categories, filteredCount, totalCount,
  statusFilter, setStatusFilter, // 👈 nuevo
}: ProductFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Filtros y Búsqueda</h2>
          <p className="text-sm text-gray-600">{filteredCount} de {totalCount} productos encontrados</p>
        </div>

        {/* Toggle de vista */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{/* ← de 3 a 4 columnas */}
        {/* Búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
            aria-label="Buscar productos"
          />
        </div>

        {/* Categoría */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
            aria-label="Filtrar por categoría"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Stock */}
        <div className="relative">
          <select
            value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
            aria-label="Filtrar por stock"
          >
            {["Todos", "Con stock", "Bajo stock", "Sin stock"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
            aria-label="Filtrar por estado"
          >
            {(["Activos", "Archivados", "Todos"] as const).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}