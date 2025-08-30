import { Edit, Trash2 } from "lucide-react";
import type { Product } from "../../types/product";
import { getCategoryIcon, getStockIcon, getStockColor } from "../../utils/productUtils";

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
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
            {products.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 lg:px-6 py-4">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <img 
                      src={p.imagen} 
                      alt={p.nombre} 
                      className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover border border-gray-200" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{p.nombre}</div>
                      <div className="text-sm text-gray-500 truncate">{p.deposito}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-6 py-4 max-w-xs">
                  <p className="text-sm text-gray-600 line-clamp-2">{p.descripcion}</p>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(p.categoria)}
                    <span className="text-sm text-gray-700 hidden sm:inline">{p.categoria}</span>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <div className="font-semibold text-gray-900 text-sm lg:text-base">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.precio)}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStockIcon(p.stock)}
                    <span className={`text-sm font-medium ${getStockColor(p.stock)} hidden sm:inline`}>
                      {p.stock} unidades
                    </span>
                    <span className={`text-sm font-medium ${getStockColor(p.stock)} sm:hidden`}>
                      {p.stock}
                    </span>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${p.estado.color}`}>
                    {p.estado.label}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <div className="flex gap-1 lg:gap-2">
                    <button className="p-1.5 lg:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 lg:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
