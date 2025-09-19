// client/src/components/depots/DepotHeader.tsx
import React from 'react';
import { Plus, Settings } from 'lucide-react';

interface DepotHeaderProps {
  onCreate: () => void;
}

export function DepotHeader({ onCreate }: DepotHeaderProps) {
  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depósitos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus centros de almacenamiento</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            Gestionar Categorías
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Nuevo Depósito
          </button>
        </div>
      </div>
    </div>
  );
}
