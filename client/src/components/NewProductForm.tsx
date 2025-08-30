import React, { useState } from 'react';
import { createProduct } from '../services/productService';
import { useModal } from './ui/animated-modal';

export const NewProductForm: React.FC = () => {
  const { setOpen } = useModal();
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    categoriaId: 1,          // Cambiar a number
    stock: '',               // obligatorio
    image: null as File | null, // opcional
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, type, value } = e.target;
    const newValue =
      e.target instanceof HTMLInputElement && type === 'checkbox'
        ? e.target.checked
        : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, image: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo validar stock ya que categoría está fija
    if (!formData.stock || Number(formData.stock) <= 0) {
      alert('El stock es obligatorio y debe ser mayor a 0');
      return;
    }
    
    setLoading(true);
    
    console.log('FormData antes de enviar:', formData);
    
    try {
      await createProduct({
        nombre: formData.nombre,
        precio: Number(formData.precio),
        descripcion: formData.descripcion,
        categoriaId: formData.categoriaId, // Ya es number
        stock: Number(formData.stock),
        image: formData.image || undefined,
      });

      // limpiar formulario y cerrar modal
      setFormData({
        nombre: '',
        precio: '',
        descripcion: '',
        categoriaId: 1, // Mantener como number
        stock: '',
        image: null,
      });
      setOpen(false);
    } catch (err) {
      console.error('Error completo:', err);
      alert(`Error al crear el producto: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Producto</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Alimento Pedigree"
          />
        </div>

        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
            Precio *
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {/* Campo oculto para categoría fija */}
        <input type="hidden" name="categoriaId" value={1} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
            Categoría de Testing (ID: 1)
          </div>
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
            Stock *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe el producto..."
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
          Imagen del Producto (opcional)
        </label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleFileChange}
          accept="image/*"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {formData.image && (
          <p className="text-sm text-gray-500 mt-1">
            Archivo seleccionado: {formData.image.name}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? 'Guardando…' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
};