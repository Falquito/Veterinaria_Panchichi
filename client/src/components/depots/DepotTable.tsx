// client/src/components/depots/DepotTable.tsx
import React from 'react';
import { Package, MapPin, Eye, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { useDepots } from '../../hooks/useDepots';
import * as depotService from '../../services/depotService';
import type { Depot } from '../../types/depot';

interface DepotTableProps {
  search: string;
  region: string;
  statusFilter: string;
  onClearFilters: () => void;
  onEdit: (depot: Depot) => void;
  onViewProducts: (depot: Depot) => void;
  refreshKey: number;
}

export function DepotTable({
  search,
  region, 
  statusFilter,
  onClearFilters,
  onEdit,
  onViewProducts,
  refreshKey
}: DepotTableProps) {
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DEPÓSITO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DIRECCIÓN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ESTADO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((depot) => (
              <tr key={depot.id_deposito} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{depot.nombre}</div>
                      <div className="text-sm text-gray-500">Depósito {depot.id_deposito}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                    {depot.direccion}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    depot.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {depot.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onViewProducts(depot)}
                      className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                      title="Ver productos"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
            
                    <button 
                      onClick={() => onEdit(depot)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                      title="Editar depósito"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(depot.id_deposito)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                      title="Eliminar depósito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}