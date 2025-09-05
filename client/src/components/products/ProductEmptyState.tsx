// src/components/products/ProductEmptyState.tsx
import { Package } from "lucide-react";

type Props = {
  onClearFilters?: () => void;
  title?: string;
  subtitle?: string;
};

export function ProductEmptyState({
  onClearFilters,
  title = "No se encontraron productos",
  subtitle = "Intenta ajustar los filtros de búsqueda",
}: Props) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{subtitle}</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Quitar filtros
        </button>
      )}
    </div>
  );
}