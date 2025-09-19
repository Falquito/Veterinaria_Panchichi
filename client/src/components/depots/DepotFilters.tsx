import React from 'react';
import { Search, List, Grid3X3 } from 'lucide-react';

interface DepotFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  regions: string[];
  filteredCount: number;
  totalCount: number;
}

export function DepotFilters({
  search, setSearch,
  region, setRegion,
  statusFilter, setStatusFilter,
  viewMode, setViewMode,
  regions,
  filteredCount,
  totalCount
}: DepotFiltersProps) {
  return (
    <div className=" pb-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Filtros y Búsqueda</h2>
              <p className="text-sm text-gray-500">{filteredCount} de {totalCount} depósitos encontrados</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar depósitos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Todos">Todos</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Todos</option>
              <option>Por región</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Activos">Activos</option>
              <option value="Todos">Todos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}