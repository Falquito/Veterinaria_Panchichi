// src/components/CategoryManager.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X, AlertTriangle } from 'lucide-react';
import { categoryService, type Category } from '../services/categoryService';

// Extendemos la interfaz para incluir el eliminado lógico
interface CategoryExtended extends Category {
  deletedAt?: string;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<CategoryExtended[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentCategory, setCurrentCategory] = useState<CategoryExtended | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryExtended | null>(null);

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Util: formateo de fechas (memo para no recalcular)
  const formatDate = useMemo(() => (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString();
  }, []);

  // Cargar categorías al iniciar
  useEffect(() => {
    loadCategories();
  }, []);

  // Filtrar categorías (se actualiza en tiempo real)
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = categories.filter((category) => {
      const matchesSearch =
        category.nombre.toLowerCase().includes(term) ||
        (category.descripcion?.toLowerCase().includes(term) || false);
      const matchesDeletedFilter = showDeleted ? !!category.deletedAt : !category.deletedAt;
      return matchesSearch && matchesDeletedFilter;
    });
    setFilteredCategories(filtered);
  }, [categories, searchTerm, showDeleted]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setModalMode('create');
    setCurrentCategory(null);
    setFormData({ nombre: '', descripcion: '' });
    setShowModal(true);
  };

  const handleEditCategory = (category: CategoryExtended) => {
    setModalMode('edit');
    setCurrentCategory(category);
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || ''
    });
    setShowModal(true);
  };

  const handleDeleteCategory = (category: CategoryExtended) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await categoryService.delete(categoryToDelete.id);
      setSuccessMessage('Categoría eliminada exitosamente');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría');
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setError(null);
      if (modalMode === 'create') {
        await categoryService.create({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || undefined
        });
        setSuccessMessage('Categoría creada exitosamente');
      } else if (currentCategory) {
        await categoryService.update(currentCategory.id, {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || undefined
        });
        setSuccessMessage('Categoría actualizada exitosamente');
      }
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar categoría');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Gestión de Categorías</h1>
        <p className="text-sm sm:text-base text-gray-600">Administra las categorías de tu sistema</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Controls (responsive) */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="search"
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 lg:ml-auto">
          <button
            onClick={() => setShowDeleted((v) => !v)}
            className={`inline-flex justify-center rounded-md border px-4 py-2 text-sm transition-colors ${
              showDeleted ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            {showDeleted ? 'Ver Activas' : 'Ver Eliminadas'}
          </button>
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Responsive list: Cards on mobile, Table on >= md */}
      {/* Mobile / small screens */}
      <div className="md:hidden space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="rounded-lg border border-gray-200 p-6 text-center text-gray-500">{
            searchTerm ? 'No se encontraron categorías con ese criterio' : 'No hay categorías disponibles'
          }</div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-gray-900">{category.nombre}</div>
                  <div className="mt-1 text-sm text-gray-600 line-clamp-2">{category.descripcion || '-'}</div>
                </div>
                <span
                  className={`shrink-0 inline-flex px-2 py-1 text-[11px] font-semibold rounded-full ${
                    category.deletedAt ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {category.deletedAt ? 'Eliminada' : 'Activa'}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Creación: {formatDate((category as any).createdAt)}</span>
                {!category.deletedAt && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="rounded px-2 py-1 text-blue-600 hover:bg-blue-50"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / larger screens: table */}
      <div className="hidden md:block bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron categorías con ese criterio' : 'No hay categorías disponibles'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{category.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 max-w-md truncate">{category.descripcion || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.deletedAt ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {category.deletedAt ? 'Eliminada' : 'Activa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate((category as any).createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!category.deletedAt && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          {/* Contenedor responsive: fullscreen en mobile, caja en >= sm */}
          <div className="w-full sm:max-w-lg sm:mx-4 bg-white rounded-t-2xl sm:rounded-xl shadow-lg overflow-hidden sm:overflow-visible">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Ingrese el nombre de la categoría"
                  />
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Descripción opcional de la categoría"
                  />
                </div>
              </div>

              {/* Botonera sticky en mobile */}
              <div className="mt-6 sm:mt-8">
                <div className="sticky bottom-0 left-0 right-0 -mx-4 sm:static sm:mx-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t sm:border-0 px-4 py-3 sm:p-0">
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full sm:w-auto rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800"
                    >
                      <Save className="h-4 w-4" />
                      {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:max-w-lg sm:mx-4 bg-white rounded-t-2xl sm:rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-6">
              <p className="text-sm sm:text-base text-gray-700">
                ¿Estás seguro de que deseas eliminar la categoría{' '}
                <span className="font-semibold">"{categoryToDelete.nombre}"</span>?
              </p>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">Esta acción no se puede deshacer.</p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full sm:w-auto rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full sm:w-auto rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
