// client/src/pages/Depot.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ModalBody, ModalContent, useModal } from "../components/ui/animated-modal";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DepotForm } from '../components/depots/DepotForm';
import * as depotService from '../services/depotService';
import type { Depot, NewDepotPayload, UpdateDepotPayload } from '../types/depot';

// El componente principal de la página, ahora sin el wrapper al final
function DepotPageContent() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const { setOpen } = useModal(); // Hook para controlar el modal

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

  const handleCreate = async (data: NewDepotPayload) => {
    await depotService.createDepot(data);
    await fetchDepots();
  };

  const handleUpdate = async (data: UpdateDepotPayload) => {
    if (!editingDepot) return;
    await depotService.updateDepot(editingDepot.id_deposito, data);
    await fetchDepots();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este depósito?')) {
      try {
        await depotService.deleteDepot(id);
        await fetchDepots();
      } catch (err) {
        alert(`Error al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    }
  };

  const openCreateModal = () => {
    setEditingDepot(null);
    setOpen(true);
  };

  const openEditModal = (depot: Depot) => {
    setEditingDepot(depot);
    setOpen(true);
  };
  
  const renderContent = () => {
    if (loading) return <div className="p-4 text-center">Cargando depósitos...</div>;
    if (error) return <div className="p-4 text-center text-red-600">Error: {error}</div>;
    if (depots.length === 0) return <div className="p-4 text-center">No hay depósitos registrados.</div>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-left">
              <th className="px-4 py-3 font-medium">Depósito</th>
              <th className="px-4 py-3 font-medium">Dirección</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {depots.map((depot) => (
              <tr key={depot.id_deposito} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                <td className="px-4 py-3">{depot.nombre}</td>
                <td className="px-4 py-3">{depot.direccion}</td>
                <td className="px-4 py-3 text-neutral-500">
                  <button onClick={() => openEditModal(depot)} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg mr-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(depot.id_deposito)} className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Depósitos</h2>
          <p className="text-sm text-neutral-500">Gestiona tus centros de almacenamiento</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-black hover:bg-gray-800 text-white px-4 py-2.5 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Depósito</span>
        </button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="p-4 border-b">
          <p className="font-semibold">Lista de Depósitos</p>
          <p className="text-sm text-neutral-500">{depots.length} depósitos registrados</p>
        </div>
        {renderContent()}
      </div>

      {/* El modal ahora se renderiza aquí */}
      <ModalBody>
        <ModalContent>
          <DepotForm
            onSubmit={editingDepot ? handleUpdate : handleCreate}
            initialData={editingDepot}
          />
        </ModalContent>
      </ModalBody>
    </div>
  );
}

// Componente final que exportamos, ahora sí con el Provider del Modal
export default function Depositos() {
  return (
    <Modal>
      <DepotPageContent />
    </Modal>
  );
}