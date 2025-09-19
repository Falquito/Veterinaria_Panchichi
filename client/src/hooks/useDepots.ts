// client/src/hooks/useDepots.ts
import { useState, useEffect, useCallback } from 'react';
import * as depotService from '../services/depotService';
import type { Depot } from '../types/depot';

export type StatusFilter = "Todos" | "Activos" | "Inactivos";

export function useDepots() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Activos");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Modal states
  const [viewingProducts, setViewingProducts] = useState<Depot | null>(null);

  const fetchDepots = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await depotService.listDepots();
      
      const arr =
        Array.isArray(resp) ? resp :
        Array.isArray((resp as any)?.data) ? (resp as any).data :
        Array.isArray((resp as any)?.rows) ? (resp as any).rows :
        Array.isArray((resp as any)?.result) ? (resp as any).result :
        [];

      setDepots(arr as Depot[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los depósitos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepots();
  }, [fetchDepots]);

  // Derived data
  const filtered = depots.filter(depot => {
    const matchesSearch = depot.nombre.toLowerCase().includes(search.toLowerCase()) ||
                         depot.direccion.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "Todos" || 
                         (statusFilter === "Activos" && depot.activo) ||
                         (statusFilter === "Inactivos" && !depot.activo);
    
    return matchesSearch && matchesStatus;
  });

  const regions = Array.from(new Set(depots.map(d => d.direccion?.split(',')[0] || 'Sin región')));

  const metrics = {
    total: depots.length,
    active: depots.filter(d => d.activo).length,
    inactive: depots.filter(d => !d.activo).length
  };

  return {
    depots,
    filtered,
    loading,
    error,
    search, setSearch,
    region, setRegion,
    statusFilter, setStatusFilter,
    viewMode, setViewMode,
    regions,
    metrics,
    viewingProducts, setViewingProducts,
    refresh: fetchDepots
  };
}