import { Package } from "lucide-react";

export function ProductEmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
      <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
    </div>
  );
}
