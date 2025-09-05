// src/components/products/ProductDepositosDetail.tsx
import React from "react";
import { MapPin, Package, AlertTriangle } from "lucide-react";
import type { ProductDeposito } from "../../services/productService";

interface ProductDepositosDetailProps {
  depositos: ProductDeposito[];
  className?: string;
}

export const ProductDepositosDetail: React.FC<ProductDepositosDetailProps> = ({ 
  depositos, 
  className = "" 
}) => {
  const stockTotal = depositos.reduce((sum, dep) => sum + dep.stock, 0);

  if (!depositos || depositos.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">Sin depósitos asignados</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header con resumen */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
        <Package className="w-4 h-4" />
        <span>
          {depositos.length} {depositos.length === 1 ? "depósito" : "depósitos"} 
          • {stockTotal} unidades total
        </span>
      </div>

      {/* Lista de depósitos */}
      <div className="space-y-2">
        {depositos.map((deposito) => (
          <div
            key={deposito.idDeposito}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {deposito.nombreDeposito}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {deposito.idDeposito}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {deposito.stock}
                </div>
                <div className="text-xs text-gray-500">
                  unidades
                </div>
              </div>
              <div 
                className={`w-3 h-3 rounded-full ${
                  deposito.stock > 0 
                    ? 'bg-green-400' 
                    : 'bg-red-400'
                }`}
                title={deposito.stock > 0 ? "Con stock" : "Sin stock"}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas adicionales */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{depositos.length}</div>
            <div className="text-xs text-gray-500">Depósitos</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{stockTotal}</div>
            <div className="text-xs text-gray-500">Stock Total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {depositos.filter(d => d.stock > 0).length}
            </div>
            <div className="text-xs text-gray-500">Con Stock</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente compacto para usar en listas
export const ProductDepositosCompact: React.FC<{ depositos: ProductDeposito[] }> = ({ depositos }) => {
  if (!depositos || depositos.length === 0) {
    return <span className="text-xs text-gray-400">Sin depósitos</span>;
  }

  if (depositos.length === 1) {
    const dep = depositos[0];
    return (
      <div className="flex items-center gap-1 text-xs">
        <MapPin className="w-3 h-3 text-gray-400" />
        <span className="text-gray-600 truncate max-w-[100px]">
          {dep.nombreDeposito}
        </span>
        <span className="text-gray-400">({dep.stock})</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {depositos.slice(0, 2).map((dep) => (
        <div key={dep.idDeposito} className="flex items-center gap-1 text-xs">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600 truncate max-w-[80px]">
            {dep.nombreDeposito}
          </span>
          <span className="text-gray-400">({dep.stock})</span>
        </div>
      ))}
      {depositos.length > 2 && (
        <div className="text-xs text-gray-400 ml-4">
          +{depositos.length - 2} más
        </div>
      )}
    </div>
  );
};