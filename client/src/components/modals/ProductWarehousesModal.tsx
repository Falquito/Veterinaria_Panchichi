// components/modals/ProductWarehousesPanel.tsx  (renombrado)
import { useEffect, useState } from "react";
import { X, Warehouse, Package, MapPin } from "lucide-react";
import type { Product, ProductDeposito } from "../../types/product";
import { getProductById } from "../../services/productService";

interface Props {
  product: Product | null;
  onClose: () => void;
}
interface ProductWithWarehouses extends Product {
  depositos: ProductDeposito[];
}

export default function ProductWarehousesPanel({ product, onClose }: Props) {
  const [productData, setProductData] = useState<ProductWithWarehouses | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (product) void load(); }, [product]);

  const load = async () => {
    if (!product) return;
    setLoading(true); setError(null);
    try {
      const data = await getProductById(product.id);
      setProductData(data as ProductWithWarehouses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar depósitos");
    } finally { setLoading(false); }
  };

  if (!product) return null;
  const stockTotal = productData?.depositos?.reduce((s, d) => s + d.stock, 0) ?? 0;

  return (
    <div className="w-full max-w-4xl max-h-[80vh] overflow-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg grid place-items-center">
              <Warehouse className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Depósitos del Producto</h2>
              <p className="text-sm text-gray-600 mt-1">{product.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {productData && !loading && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <p className="text-gray-900 font-medium">{productData.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Total</label>
                    <p className={`font-bold text-lg ${getStockColor(stockTotal)}`}>{stockTotal} unidades</p>
                  </div>
                  {productData.descripcion && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <p className="text-gray-600 text-sm">{productData.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Depósitos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  Ubicaciones y Stock
                </h3>

                {productData.depositos?.length ? (
                  <div className="space-y-3">
                    {productData.depositos.map((d) => (
                      <div key={d.idDeposito} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg grid place-items-center">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{d.nombreDeposito}</h4>
                              <p className="text-sm text-gray-500">ID: {d.idDeposito}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getStockColor(d.stock)}`}>{d.stock}</p>
                            <p className="text-sm text-gray-500">unidades</p>
                          </div>
                        </div>

                        {/* Barra */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getStockBarColor(d.stock)}`}
                              style={{ width: stockTotal > 0 ? `${(d.stock / stockTotal) * 100}%` : "0%" }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {stockTotal > 0 ? `${((d.stock / stockTotal) * 100).toFixed(1)}% del total` : "Sin stock"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Warehouse className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Este producto no está asignado a ningún depósito</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function getStockColor(n: number) { return n <= 0 ? "text-red-600" : n < 10 ? "text-yellow-600" : "text-green-600"; }
function getStockBarColor(n: number) { return n <= 0 ? "bg-red-500" : n < 10 ? "bg-yellow-500" : "bg-green-500"; }
