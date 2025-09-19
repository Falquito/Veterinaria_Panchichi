// client/src/components/depots/DepotHeader.tsx
import React from 'react';
import { Plus, Settings } from 'lucide-react';

interface DepotHeaderProps {
  onCreate: () => void;
}

export function DepotHeader({ onCreate }: DepotHeaderProps) {
  return (
    <div className="mb-8">
    <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Depósitos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus centros de almacenamiento</p>
        </div>
        <div className="flex items-center gap-3">

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
    </div>
  );
}
