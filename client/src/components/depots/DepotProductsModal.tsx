// client/src/components/depots/DepotProductsModal.tsx - VERSION ADAPTADA PARA MODAL ANIMADO
import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Search, TrendingUp, Eye } from 'lucide-react';
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
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Cargando productos
        </h3>
        <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto mb-3">
          <div className="w-full h-full bg-gray-700 rounded-full animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-500">
          Obteniendo inventario de {depot.nombre}...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{depot.nombre}</h2>
        <p className="text-sm text-gray-500">{depot.direccion}</p>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-sm text-gray-500">Productos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalStock.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Valor</div>
          </div>
          {lowStockCount > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
              <div className="text-sm text-gray-500">Stock Bajo</div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="w-full lg:flex-1 lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm font-medium"
              />
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="all">Todo el stock</option>
              <option value="low">Stock bajo (≤10)</option>
              <option value="medium">Stock medio (11-50)</option>
              <option value="high">Stock alto (50)</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="name">Ordenar: Nombre</option>
              <option value="price">Ordenar: Precio</option>
              <option value="stock">Ordenar: Stock</option>
              <option value="category">Ordenar: Categoría</option>
            </select>
            
            <div className="px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg text-center">
              {filteredProducts.length} productos
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error de conexión</h3>
            <p className="text-gray-500 text-center mb-8 max-w-md">{error}</p>
            <button
              onClick={loadProducts}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-medium"
            >
              Reintentar
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchTerm ? 'Sin coincidencias' : 'Inventario vacío'}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchTerm 
                ? 'No se encontraron productos que coincidan con tu búsqueda.' 
                : 'Este depósito no tiene productos asignados.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-6 text-gray-600 hover:text-gray-900 font-medium underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="relative mr-4">
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
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{product.nombre}</h4>
                          <p className="text-sm text-gray-500 max-w-xs truncate">{product.descripcion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {product.nombreCategoria || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        ${(product.precio || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <span className={`text-lg font-bold ${
                          product.stock <= 10 
                            ? 'text-red-600'
                            : product.stock <= 50
                            ? 'text-yellow-600' 
                            : 'text-gray-900'
                        }`}>
                          {(product.stock || 0).toLocaleString()}
                        </span>
                        {product.stock <= 10 && (
                          <TrendingUp className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          product.activo ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          product.activo ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {product.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-semibold">{filteredProducts.length}</span> de{' '}
          <span className="font-semibold">{products.length}</span> productos
        </div>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}