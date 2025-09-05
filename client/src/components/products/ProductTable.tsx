// src/components/products/ProductTable.tsx - Actualización
import { useEffect, useMemo } from "react";
import { useOptimistic } from "react";
import { ProductEmptyState } from "./ProductEmptyState";
import { ProductRow } from "./ProductRow";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../../types/product";
import type { StockFilter, StatusFilter } from "../../hooks/useProducts";

interface ProductTableProps {
  search?: string;
  category?: string;
  stockFilter?: StockFilter;
  statusFilter?: StatusFilter;
  onClearFilters?: () => void;
  onEdit?: (p: Product) => void;
  onViewWarehouses?: (p: Product) => void; // Nueva prop
  refreshKey?: number;
  onRegisterOptimistic?: (
    apply: (partial: Partial<Product> & { id: number }) => void
  ) => void;
}

export function ProductTable({
  search = "",
  category = "Todos",
  stockFilter = "Todos",
  statusFilter = "Activos",
  onClearFilters,
  onEdit,
  onViewWarehouses, // Nueva prop
  refreshKey = 0,
  onRegisterOptimistic,
}: ProductTableProps) {
  const {
    products: baseProducts,
    loading,
    error,
    colorMap,
    getCategoriaNombre,
    handleEdit,
    handleArchive,
    handleRestore,
  } = useProducts({ search, category, stockFilter, statusFilter, refreshKey });

  const [optimisticProducts, applyOptimistic] = useOptimistic<
    Product[],
    Partial<Product> & { id: number }
  >(baseProducts, (state, partial) =>
    state.map((p) => (p.id === partial.id ? { ...p, ...partial } : p))
  );

  useEffect(() => {
    onRegisterOptimistic?.(applyOptimistic);
  }, [onRegisterOptimistic, applyOptimistic]);

  const rows = useMemo(() => {
    const map = new Map<number, Product>();
    for (const p of optimisticProducts) {
      if (!p) continue;
      map.set(p.id, p); 
    }
    return Array.from(map.values());
  }, [optimisticProducts]);

  if (loading) return <p className="p-4 text-gray-500">Cargando productos...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (rows.length === 0) return <ProductEmptyState onClearFilters={onClearFilters} />;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {rows.map((p) => (
              <ProductRow
                key={p.id}                                 
                p={p}
                badge={colorMap[getCategoriaNombre(p)]}
                onEdit={onEdit ?? handleEdit}
                onViewWarehouses={onViewWarehouses} // Pasar la nueva prop
                onArchive={handleArchive}
                onRestore={handleRestore}
                
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}