import { Edit, Trash2, Tag, Building2 } from "lucide-react";
import type { Product } from "../../types/product";
import { getCategoryIcon, getStockIcon, getStockColor } from "../../utils/productUtils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden">
      {/* Imagen del producto */}
      <div className="relative h-40 lg:h-48 bg-gray-100 overflow-hidden">
        <img 
          src={product.imagen} 
          alt={product.nombre} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${product.estado.color}`}>
            {product.estado.label}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <div className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200">
            {getCategoryIcon(product.categoria)}
          </div>
        </div>
      </div>
      
      {/* Contenido del producto */}
      <div className="p-4 lg:p-5">
        <h3 className="font-semibold text-gray-900 text-sm lg:text-base leading-tight mb-3 line-clamp-2">
          {product.nombre}
        </h3>
        
        <p className="text-gray-600 text-xs lg:text-sm mb-4 line-clamp-2 hidden sm:block">
          {product.descripcion}
        </p>
        
        <div className="space-y-2 lg:space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
            <Tag className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
            <span className="truncate">{product.categoria}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
            <Building2 className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
            <span className="truncate">{product.deposito}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            {getStockIcon(product.stock)}
            <span className={`font-medium ${getStockColor(product.stock)}`}>
              {product.stock} unidades
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-lg lg:text-xl font-bold text-gray-900">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.precio)}
          </div>
          
          <div className="flex gap-1 lg:gap-2">
            <button className="p-1.5 lg:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
            <button className="p-1.5 lg:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
              <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
