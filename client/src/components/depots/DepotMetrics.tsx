import React from 'react';
import { Package, MapPin } from 'lucide-react';

interface DepotMetricsProps {
  total: number;
  active: number;
  inactive: number;
}

export function DepotMetrics({ total, active, inactive }: DepotMetricsProps) {
  return (
    <div className="px-6 py-4 ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
        <div className="bg-white rounded-lg border shadow-sm  border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-500">Total Depósitos</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{active}</p>
              <p className="text-sm text-gray-500">Depósitos Activos</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{inactive}</p>
              <p className="text-sm text-gray-500">Sin Actividad</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
