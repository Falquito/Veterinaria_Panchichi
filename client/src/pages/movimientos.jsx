
import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, TrendingUp, ArrowDown, RotateCcw, List, Grid } from 'lucide-react';

// Service para manejar las llamadas a la API
const movimientosService = {
  async getAll() {
    try {
      const response = await fetch('http://localhost:3000/api/movimientos');
      
      if (!response.ok) {
        throw new Error('Error al obtener los movimientos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

const Movimientos = () => {

  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter((mov) => {
    const matchesSearch = 
      mov.movimiento_id.toString().includes(searchTerm) ||
      mov.producto_id.toString().includes(searchTerm) ||
      (mov.motivo && mov.motivo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTipo = filtroTipo === '' || mov.tipo === filtroTipo;
    
    return matchesSearch && matchesTipo;
  });

  // Cargar movimientos al inicio
  useEffect(() => {
    loadMovimientos();
  }, []);

  const loadMovimientos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await movimientosService.getAll();
      setMovimientos(data.data || []);
    } catch (err) {
      setError('Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha_texto, fecha_normalizada) => {
    if (fecha_normalizada) {
      return new Date(fecha_normalizada).toLocaleDateString('es-AR');
    }
    return fecha_texto || 'Sin fecha';
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'INS': return 'Ingreso';
      case 'OUT': return 'Salida';
      case 'UPD': return 'Actualizacion';
      default: return tipo;
    }
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'INS': 
        return 'bg-green-100 text-green-800';
      case 'OUT': 
        return 'bg-red-100 text-red-800';
      case 'UPD': 
        return 'bg-yellow-100 text-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'INS': 
        return <TrendingUp className="w-4 h-4" />;
      case 'OUT': 
        return <ArrowDown className="w-4 h-4" />;
      case 'UPD': 
         return <Package className="w-4 h-4" />;
      
    }
  };

  return (
    <div className="p-6  min-h-screen">
      <div className="max-w mx-auto">
        
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">{/* no */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Movimientos</h1>
              <p className="text-gray-600 mt-1">Gestiona el historial de movimientos de inventario</p>
            </div>
          </div>{/* no*/}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-semibold text-gray-900">{movimientos.length}</div>
                <div className="text-sm text-gray-600">Total Movimientos</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-semibold text-gray-900">
                  {movimientos.filter(m => m.tipo === 'INS').length}
                </div>
                <div className="text-sm text-gray-600">Ingresos</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowDown className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-semibold text-gray-900">
                  {movimientos.filter(m => m.tipo === 'OUT').length}
                </div>
                <div className="text-sm text-gray-600">Salidas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
           <div>
              <h3 className="font-medium text-gray-900">Filtros y Búsqueda</h3>
              <p className="text-sm text-gray-600">{movimientosFiltrados.length} de {movimientos.length} movimientos encontrados</p>
            </div>

          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar movimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 "
              />
            </div>
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="INS">Ingresos</option>
              <option value="OUT">Salidas</option>
              <option value="UPD">Actualizacion</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando movimientos...</p>
            </div>
          ) : (
            <div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MOVIMIENTO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TIPO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      FECHA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRODUCTO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DEPÓSITO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CANTIDAD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MOTIVO
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimientosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        {movimientos.length === 0 ? "No hay movimientos" : "No se encontraron movimientos con los filtros aplicados"}
                      </td>
                    </tr>
                  ) : (
                    movimientosFiltrados.map((mov) => (
                      <tr key={`${mov.movimiento_id}-${mov.linea_id}`} className="hover:bg-gray-50">
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">#{mov.movimiento_id}</div>
                              <div className="text-sm text-gray-500">Línea {mov.linea_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getTipoBadge(mov.tipo)}`}>
                              {getTipoIcon(mov.tipo)}
                              {getTipoLabel(mov.tipo)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFecha(mov.fecha_texto, mov.fecha_normalizada)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ID: {mov.producto_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Depósito {mov.deposito_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {mov.cantidad} unidades
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate">
                            {mov.motivo || 'Sin motivo especificado'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Movimientos;