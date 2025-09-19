// client/src/components/depots/DepotProductsModal.tsx - VERSION CON OVERLAY PROPIO
import React, { useState, useEffect } from 'react';
import { X, Package, AlertCircle, Search, TrendingUp, Eye } from 'lucide-react';
import { getDepotProducts } from '../../services/depotProductsService';
import type { ProductInDepot } from '../../types/depotProducts';
import type { Depot } from '../../types/depot';

interface DepotProductsModalProps {
  depot: Depot;
  onClose: () => void;
}

export function DepotProductsModal({ depot, onClose }: DepotProductsModalProps) {
  const [products, setProducts] = useState<ProductInDepot[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductInDepot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, [depot.id_deposito]);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nombreCategoria?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'low' && product.stock <= 10) ||
        (stockFilter === 'medium' && product.stock > 10 && product.stock <= 50) ||
        (stockFilter === 'high' && product.stock > 50);

      return matchesSearch && matchesStock;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.nombre.localeCompare(b.nombre);
        case 'price': return (b.precio || 0) - (a.precio || 0);
        case 'stock': return (b.stock || 0) - (a.stock || 0);
        case 'category': return (a.nombreCategoria || '').localeCompare(b.nombreCategoria || '');
        default: return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, stockFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getDepotProducts(depot.id_deposito);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter(p => p.activo);
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + ((p.precio || 0) * (p.stock || 0)), 0);
  const lowStockCount = products.filter(p => p.stock <= 10 && p.activo).length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        <div className="text-center p-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Cargando productos
          </h3>
          <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden mb-3">
            <div className="w-full h-full bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500">
            Obteniendo inventario de {depot.nombre}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg md:rounded-2xl shadow-2xl w-full max-w-sm md:max-w-6xl mx-4 max-h-[95vh] flex flex-col overflow-hidden">
      {/* Clean Header */}
      <div className="flex items-center justify-between p-4 md:p-8 border-b border-gray-100">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{depot.nombre}</h2>
          <p className="text-xs md:text-sm text-gray-500">{depot.direccion}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
        </button>
      </div>

      {/* Stats Bar - Responsive Grid */}
      <div className="px-4 md:px-8 py-4 md:py-6 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 md:flex md:items-center md:space-x-8 gap-4 md:gap-0">
          <div className="text-center md:text-left">
            <div className="text-lg md:text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-xs md:text-sm text-gray-500">Productos</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg md:text-2xl font-bold text-gray-900">{totalStock.toLocaleString()}</div>
            <div className="text-xs md:text-sm text-gray-500">Stock</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg md:text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
            <div className="text-xs md:text-sm text-gray-500">Valor</div>
          </div>
          {lowStockCount > 0 && (
            <div className="text-center md:text-left">
              <div className="text-lg md:text-2xl font-bold text-red-600">{lowStockCount}</div>
              <div className="text-xs md:text-sm text-gray-500">Stock Bajo</div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Controls - Responsive Stack */}
      <div className="bg-gray-50/50 px-4 md:px-8 py-4 md:py-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="w-full lg:flex-1 lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 md:pl-11 pr-4 py-2 md:py-3 bg-white border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm font-medium shadow-sm"
              />
            </div>
          </div>
          
          {/* Controls - Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-200 rounded-lg md:rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-400 focus:border-transparent shadow-sm"
            >
              <option value="all">Todo el stock</option>
              <option value="low">Stock bajo (≤10)</option>
              <option value="medium">Stock medio (11-50)</option>
              <option value="high">Stock alto (50)</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-200 rounded-lg md:rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-400 focus:border-transparent shadow-sm"
            >
              <option value="name">Ordenar: Nombre</option>
              <option value="price">Ordenar: Precio</option>
              <option value="stock">Ordenar: Stock</option>
              <option value="category">Ordenar: Categoría</option>
            </select>
            
            <div className="px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg text-center sm:text-left">
              {filteredProducts.length} productos
            </div>
          </div>
        </div>
      </div>

      {/* Content - Responsive Table */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Error de conexión</h3>
            <p className="text-gray-500 text-center mb-6 md:mb-8 max-w-md text-sm md:text-base">{error}</p>
            <button
              onClick={loadProducts}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-900 hover:bg-black text-white rounded-lg md:rounded-xl font-medium text-sm md:text-base"
            >
              Reintentar
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <Package className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
              {searchTerm ? 'Sin coincidencias' : 'Inventario vacío'}
            </h3>
            <p className="text-gray-500 text-center max-w-md text-sm md:text-base">
              {searchTerm 
                ? 'No se encontraron productos que coincidan con tu búsqueda.' 
                : 'Este depósito no tiene productos asignados.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 md:mt-6 text-gray-600 hover:text-gray-900 font-medium underline text-sm md:text-base"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-y-auto">
            {/* Mobile Card View */}
            <div className="md:hidden">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border-b border-gray-100 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      {product.ImagenURL ? (
                        <img
                          src={product.ImagenURL}
                          alt={product.nombre}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      {product.stock <= 10 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{product.nombre}</h4>
                          <p className="text-sm text-gray-500 truncate">{product.descripcion}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                              {product.nombreCategoria || 'Sin categoría'}
                            </span>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-1 ${
                                product.activo ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                              <span className="text-xs text-gray-600">
                                {product.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="font-semibold text-gray-900">
                            ${(product.precio || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </div>
                          <div className={`text-sm font-medium ${
                            product.stock <= 10 
                              ? 'text-red-600'
                              : product.stock <= 50
                              ? 'text-yellow-600' 
                              : 'text-gray-900'
                          }`}>
                            {(product.stock || 0).toLocaleString()} unidades
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="w-full hidden md:table">
              <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 lg:px-8 py-3 lg:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredProducts.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className={`border-b border-gray-50 hover:bg-gray-50/70 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    <td className="px-4 lg:px-8 py-4 lg:py-6">
                      <div className="flex items-center">
                        <div className="relative">
                          {product.ImagenURL ? (
                            <img
                              src={product.ImagenURL}
                              alt={product.nombre}
                              className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 lg:h-6 lg:w-6 text-gray-500" />
                            </div>
                          )}
                          {product.stock <= 10 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-3 lg:ml-4">
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">{product.nombre}</h4>
                          <p className="text-xs lg:text-sm text-gray-500 max-w-xs truncate">{product.descripcion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6">
                      <span className="inline-flex px-2 lg:px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border">
                        {product.nombreCategoria || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6 text-right">
                      <span className="text-sm lg:text-lg font-semibold text-gray-900">
                        ${(product.precio || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6 text-right">
                      <div className="flex items-center justify-end">
                        <span className={`text-sm lg:text-lg font-bold ${
                          product.stock <= 10 
                            ? 'text-red-600'
                            : product.stock <= 50
                            ? 'text-yellow-600' 
                            : 'text-gray-900'
                        }`}>
                          {(product.stock || 0).toLocaleString()}
                        </span>
                        {product.stock <= 10 && (
                          <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          product.activo ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className={`text-xs lg:text-sm font-medium ${
                          product.activo ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {product.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6 text-center">
                      <button className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer - Responsive */}
      <div className="bg-gray-50 px-4 md:px-8 py-4 md:py-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
            Mostrando <span className="font-semibold">{filteredProducts.length}</span> de{' '}
            <span className="font-semibold">{products.length}</span> productos
          </div>
          <button
            onClick={onClose}
            className="px-6 md:px-8 py-2 md:py-3 bg-gray-900 hover:bg-black text-white rounded-lg md:rounded-xl font-medium text-sm md:text-base"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  
 
  
  );
}