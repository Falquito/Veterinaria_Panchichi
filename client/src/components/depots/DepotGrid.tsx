import React from 'react';
import { Package, MapPin, Eye, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { useDepots } from '../../hooks/useDepots';
import * as depotService from '../../services/depotService';
import type { Depot } from '../../types/depot';

interface DepotGridProps {
  search: string;
  region: string;
  statusFilter: string;
  onClearFilters: () => void;
  onEdit: (depot: Depot) => void;
  onViewProducts: (depot: Depot) => void;
  refreshKey: number;
}

export function DepotGrid({
  search,
  region,
  statusFilter,
  onClearFilters,
  onEdit,
  onViewProducts,
  refreshKey
}: DepotGridProps) {
  const { filtered, refresh } = useDepots();

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este depósito?')) {
      try {
        await depotService.deleteDepot(id);
        refresh();
      } catch (err) {
        alert(`Error al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay depósitos</h3>
          <p className="text-gray-500 mb-4">
            {search ? 'No se encontraron depósitos que coincidan con tu búsqueda.' : 'Comienza creando tu primer depósito.'}
          </p>
          {search && (
            <button
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {filtered.map((depot) => {
          // Verificación segura para activo
          const isActive = depot.activo !== undefined ? depot.activo : true;
          
          return (
            <div key={depot.id_deposito} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-500" />
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-1 truncate">{depot.nombre}</h3>
              <p className="text-sm text-gray-500 mb-3 flex items-center">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{depot.direccion}</span>
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">ID: {depot.id_deposito}</span>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => onViewProducts(depot)}
                    className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                    title="Ver productos"
                  >
                    <ShoppingCart className="w-3 h-3" />
                  </button>
                  <button 
                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => onEdit(depot)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    title="Editar depósito"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDelete(depot.id_deposito)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Eliminar depósito"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}