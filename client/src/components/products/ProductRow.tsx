// components/products/ProductRow.tsx
import React, { useMemo, useState } from "react";
import { Edit, Trash2, RotateCcw, Warehouse } from "lucide-react";
import type { Product } from "../../types/product";
import { deriveEstado, getCategoriaNombre, formatCurrency } from "../../utils/productsView";
import { getStockIcon, getStockColor } from "../../utils/productUtils";

interface RowProps {
  p: Product;
  badge: { bg: string; text: string; ring: string } | undefined;
  onEdit: (p: Product) => void;
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
  onViewWarehouses?: (p: Product) => void; // Nueva prop
}

/** Si es Cloudinary, devuelve una miniatura optimizada; si no, deja la URL tal cual */
function toCloudinaryThumb(url: string, size = 96): string {
  if (!url) return url;
  const ix = url.indexOf("/upload/");
  if (url.includes("res.cloudinary.com") && ix > -1) {
    const prefix = url.slice(0, ix + 8); // '/upload/' inclusive
    const suffix = url.slice(ix + 8);
    // fill + auto crop + formatos/quality auto + tamaño fijo (96x96 por default)
    const transform = `c_fill,g_auto,f_auto,q_auto:eco,w_${size},h_${size}`;
    return `${prefix}${transform}/${suffix}`;
  }
  return url;
}

export const ProductRow = React.memo(({ 
  p, 
  badge, 
  onEdit, 
  onArchive, 
  onRestore, 
  onViewWarehouses 
}: RowProps) => {
  const estado = deriveEstado(p);
  const stock = Number(p?.stock ?? 0);

  // ---------- IMAGEN (solo cambios acá) ----------
  const rawImg = (p as any).ImagenURL ?? (p as any).imagenURL ?? (p as any).imagen ?? "";
  const imgSrc = useMemo(() => toCloudinaryThumb(rawImg, 96), [rawImg]);
  const imgSrc2x = useMemo(() => toCloudinaryThumb(rawImg, 192), [rawImg]); // para pantallas retina
  const [imgError, setImgError] = useState(false);
  // ----------------------------------------------

  const categoriaNombre = getCategoriaNombre(p);
  const deposito = (p as any).deposito ?? "—";
  const isInactive = (p as any)?.activo === false || estado.label === "Inactivo";

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {/* Producto / depósito */}
      <td className="px-4 lg:px-6 py-4">
        <div className="flex items-center gap-3 lg:gap-4">
          {imgSrc && !imgError ? (
            <img
              src={imgSrc}
              srcSet={`${imgSrc} 1x, ${imgSrc2x} 2x`}
              alt={p.nombre}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg border border-dashed border-gray-300 grid place-items-center text-xs text-gray-400">
              IMG
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{p.nombre}</div>
            <div className="text-sm text-gray-500 truncate">{deposito}</div>
          </div>
        </div>
      </td>

      {/* Descripción */}
      <td className="hidden lg:table-cell px-6 py-4 max-w-xs">
        <p className="text-sm text-gray-600 line-clamp-2">{p.descripcion ?? ""}</p>
      </td>

      {/* Categoría */}
      <td className="px-4 lg:px-6 py-4">
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
      </td>

      {/* Precio */}
      <td className="px-4 lg:px-6 py-4">
        <div className="font-semibold text-gray-900 text-sm lg:text-base">
          {formatCurrency(Number(p.precio ?? 0))}
        </div>
      </td>

      {/* Stock */}
      <td className="px-4 lg:px-6 py-4">
        <div className="flex items-center gap-2">
          {getStockIcon(stock)}
          <span className={`text-sm font-medium ${getStockColor(stock)} hidden sm:inline`}>
            {stock} unidades
          </span>
          <span className={`text-sm font-medium ${getStockColor(stock)} sm:hidden`}>{stock}</span>
        </div>
      </td>

      {/* Estado */}
      <td className="hidden lg:table-cell px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${estado.color}`}>
          {estado.label}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 lg:px-6 py-4">
        <div className="flex gap-1 lg:gap-2">
          {onViewWarehouses && (
            <button
              className="p-1.5 lg:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              onClick={() => onViewWarehouses(p)}
              title="Ver depósitos"
            >
              <Warehouse className="w-4 h-4" />
            </button>
          )}

          <button
            className="p-1.5 lg:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={() => onEdit(p)}
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>

          {isInactive ? (
            <button
              className="p-1.5 lg:p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
              onClick={() => onRestore(p.id)}
              title="Restaurar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="p-1.5 lg:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              onClick={() => onArchive(p.id)}
              title="Archivar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});
ProductRow.displayName = "ProductRow";
