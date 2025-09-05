// src/components/products/ProductGrid.tsx - Actualización
import { useEffect, useMemo } from "react";
import { useOptimistic } from "react";
import { Edit, Trash2, RotateCcw, Warehouse } from "lucide-react";
import { ProductEmptyState } from "./ProductEmptyState";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../../types/product";
import type { StockFilter, StatusFilter } from "../../hooks/useProducts";
import { deriveEstado, getCategoriaNombre, formatCurrency } from "../../utils/productsView";
import { getStockIcon, getStockColor } from "../../utils/productUtils";

interface ProductGridProps {
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

export function ProductGrid({
  search = "",
  category = "Todos",
  stockFilter = "Todos",
  statusFilter = "Activos",
  onClearFilters,
  onEdit,
  onViewWarehouses, // Nueva prop
  refreshKey = 0,
  onRegisterOptimistic,
}: ProductGridProps) {
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

  const products = useMemo(() => {
    const map = new Map<number, Product>();
    for (const p of optimisticProducts) {
      if (!p) continue;
      map.set(p.id, p);
    }
    return Array.from(map.values());
  }, [optimisticProducts]);

  if (loading) return <p className="p-4 text-gray-500">Cargando productos...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (products.length === 0) return <ProductEmptyState onClearFilters={onClearFilters} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          badge={colorMap[getCategoriaNombre(product)]}
          onEdit={onEdit ?? handleEdit}
          onViewWarehouses={onViewWarehouses} // Pasar la nueva prop
          onArchive={handleArchive}
          onRestore={handleRestore}
        />
      ))}
    </div>
  );
}

// Componente ProductCard actualizado
interface ProductCardProps {
  product: Product;
  badge: { bg: string; text: string; ring: string } | undefined;
  onEdit: (p: Product) => void;
  onViewWarehouses?: (p: Product) => void; // Nueva prop
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
}

function ProductCard({ 
  product, 
  badge, 
  onEdit, 
  onViewWarehouses,
  onArchive, 
  onRestore 
}: ProductCardProps) {
  const estado = deriveEstado(product);
  const stock = Number(product?.stock ?? 0);
  const imgSrc = (product as any).ImagenURL ?? (product as any).imagenURL ?? (product as any).imagen ?? "";
  const categoriaNombre = getCategoriaNombre(product);
  const isInactive = (product as any)?.activo === false || estado.label === "Inactivo";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Imagen del producto (compacta) */}
      <div className="relative h-40 sm:h-44 lg:h-48 bg-gray-50 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}
      </div>

      {/* Contenido (más compacto) */}
      <div className="p-3 lg:p-4">
        {/* Header con título y estado */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-base lg:text-lg truncate flex-1">
            {product.nombre}
          </h3>
          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium border ${estado.color}`}>
            {estado.label}
          </span>
        </div>

        {/* Descripción (oculta en xs para ahorrar alto) */}
        {product.descripcion && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 hidden md:block">
            {product.descripcion}
          </p>
        )}

        {/* Categoría */}
        <div className="mb-3">
          <span
            className={[
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset",
              badge?.bg ?? "bg-gray-50",
              badge?.text ?? "text-gray-700",
              badge?.ring ?? "ring-gray-200",
            ].join(" ")}
          >
            {categoriaNombre}
          </span>
        </div>

        {/* Precio y Stock */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg lg:text-xl font-bold text-gray-900">
            {formatCurrency(Number(product.precio ?? 0))}
          </div>
          <div className="flex items-center gap-1">
            {getStockIcon(stock)}
            <span className={`text-sm font-medium ${getStockColor(stock)}`}>
              {stock}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          {onViewWarehouses && (
            <button
              className="flex-1 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={() => onViewWarehouses(product)}
              title="Ver depósitos"
            >
              <Warehouse className="w-4 h-4" />
              <span className="text-sm font-medium">Depósitos</span>
            </button>
          )}

          <button
            className="flex-1 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            onClick={() => onEdit(product)}
            title="Editar"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm font-medium">Editar</span>
          </button>

          {isInactive ? (
            <button
              className="flex-1 p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={() => onRestore(product.id)}
              title="Restaurar"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">Restaurar</span>
            </button>
          ) : (
            <button
              className="flex-1 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={() => onArchive(product.id)}
              title="Archivar"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Archivar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}