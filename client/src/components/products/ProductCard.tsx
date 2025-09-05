// src/components/products/ProductCard.tsx
import { Edit, Trash2, Tag, Building2, RotateCcw } from "lucide-react";
import type { Product } from "../../types/product";
import { getStockIcon, getStockColor } from "../../utils/productUtils";
import type { CategoryColorMap } from "../../utils/categoryColors";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: () => void;      // soft delete (archivar)
  onRestore?: () => void;     // restaurar
  colorMap?: CategoryColorMap; // colores compartidos con la tabla
}

/* ---------- helpers ---------- */
function getCategoriaNombre(p: any): string {
  return typeof p?.categoria === "string" ? p.categoria : p?.categoria?.nombre ?? "—";
}
function deriveEstado(p: any) {
  if (p?.activo === false) {
    return { label: "Inactivo", color: "border-gray-300 text-gray-600 bg-gray-50" };
  }
  const stock = Number(p?.stock ?? 0);
  if (stock <= 0) {
    return { label: "Sin stock", color: "border-red-300 text-red-700 bg-red-50" };
  }
  return { label: "Activo", color: "border-emerald-300 text-emerald-700 bg-emerald-50" };
}

export function ProductCard({ product, onEdit, onDelete, onRestore, colorMap }: ProductCardProps) {
  const estado = (product as any).estado ?? deriveEstado(product);
  const categoriaNombre = getCategoriaNombre(product);
  const badge = colorMap?.[categoriaNombre];

  const imgSrc =
    (product as any).ImagenURL ?? (product as any).imagenURL ?? product.imagen ?? "";

  const isInactive = product.activo === false || estado.label === "Inactivo";

  return (
    <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden">
      {/* Imagen */}
      <div className="relative h-40 lg:h-48 bg-gray-100 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400 text-sm">Sin imagen</div>
        )}

        {/* Estado */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${estado.color}`}>
            {estado.label}
          </span>
        </div>

        {/* Badge de categoría: usa colorMap */}
        <div className="absolute top-3 left-3">
          <span
            className={[
              "px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset",
              badge?.bg ?? "bg-gray-50",
              badge?.text ?? "text-gray-700",
              badge?.ring ?? "ring-gray-200",
              "backdrop-blur-sm bg-opacity-90",
            ].join(" ")}
          >
            {categoriaNombre}
          </span>
        </div>
      </div>

      {/* Contenido */}
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
            <span className="truncate">{categoriaNombre}</span>
          </div>

          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
            <Building2 className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
            <span className="truncate">{(product as any).deposito ?? "—"}</span>
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
            {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(product.precio)}
          </div>

          <div className="flex gap-1 lg:gap-2">
            {/* Si está ACTIVO: mostrar Editar + Archivar */}
            {!isInactive && (
              <>
                <button
                  className="p-1.5 lg:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={() => onEdit?.(product)}
                >
                  <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
                <button
                  className="p-1.5 lg:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  onClick={onDelete}
                  title="Archivar producto"
                >
                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
              </>
            )}

            {/* Si está INACTIVO: mostrar Restaurar */}
            {isInactive && (
              <button
                className="p-1.5 lg:p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                onClick={onRestore}
                title="Restaurar producto"
              >
                <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
