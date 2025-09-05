// client/src/components/depots/DepotForm.tsx
import React, { useState, useEffect } from 'react';
import { useModal } from '../ui/animated-modal';
import type { Depot, NewDepotPayload } from '../../types/depot';

interface DepotFormProps {
  onSubmit: (data: NewDepotPayload) => Promise<void>;
  initialData?: Depot | null;
}

export const DepotForm: React.FC<DepotFormProps> = ({ onSubmit, initialData }) => {
  const { setOpen } = useModal();
  const [formData, setFormData] = useState<NewDepotPayload>({
    nombre: '',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        direccion: initialData.direccion,
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setOpen(false); // Cierra el modal si todo fue bien
    } catch (error) {
      console.error(error);
      alert(`Error: ${error instanceof Error ? error.message : 'Ocurrió un error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Depósito' : 'Nuevo Depósito'}
      </h2>

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Depósito *
        </label>
        <input
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Ej: Depósito Central"
        />
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
          Dirección *
        </label>
        <input
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Ej: Av. Siempre Viva 123, Salta"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};