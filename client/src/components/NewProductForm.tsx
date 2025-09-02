import React, { useState, useEffect } from 'react';
import { createProduct } from '../services/productService';
import { useModal } from './ui/animated-modal';
// ⚠️ Si este archivo está en src/components/ui, la ruta correcta es:
import AddCategoryModal from '../components/modals/AddCategoryModal';
// Importo el tipo de la API para mapear:
import { categoryService, type Category as ApiCategory } from '../services/categoryService';

// Tipo que usa la UI (coincide con el modal)
type UICategory = { id: number; name: string; description?: string };

export const NewProductForm: React.FC = () => {
  const { setOpen } = useModal();

  // 🔧 USAR UICategory en el estado del form
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    categoriaId: 0,
    stock: '',
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    (async () => {
      try {
        const fetched: ApiCategory[] = await categoryService.getAll();
        const uiCats: UICategory[] = fetched.map((c) => ({
          id: c.id,
          name: c.nombre,
          description: c.descripcion ?? '',
        }));
        setCategories(uiCats);
        if (uiCats.length) {
          setFormData((p) => ({ ...p, categoriaId: uiCats[0].id }));
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        alert('Error al cargar las categorías');
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, type, value } = e.target;
    const newValue =
      e.target instanceof HTMLInputElement && type === 'checkbox'
        ? e.target.checked
        : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    }
  };

  const handleAddCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddCategoryModalOpen(true);
  };

  const handleCloseAddCategoryModal = () => setIsAddCategoryModalOpen(false);

  
  const handleCategoryAdded = (newCategory: UICategory) => {
    setCategories((prev) => [newCategory, ...prev]);
    setFormData((prev) => ({ ...prev, categoriaId: newCategory.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stock || Number(formData.stock) <= 0) {
      alert('El stock es obligatorio y debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      await createProduct({
        nombre: formData.nombre,
        precio: Number(formData.precio),
        descripcion: formData.descripcion,
        categoriaId: Number(formData.categoriaId),
        stock: Number(formData.stock),
        image: formData.image || undefined,
      });

      setFormData({
        nombre: '',
        precio: '',
        descripcion: '',
        categoriaId: categories[0]?.id ?? 0,
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

  const selectedCategory = categories.find((c) => c.id === Number(formData.categoriaId));

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Producto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* nombre */}
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

          {/* precio */}
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

          {/* categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
            <div className="flex items-center gap-2">
              {loadingCategories ? (
                <div className="flex-1 px-3 py-2 h-10 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Cargando categorías...
                </div>
              ) : (
                <select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.length === 0 ? (
                    <option value="">No hay categorías disponibles</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              )}

              <button
                type="button"
                onClick={handleAddCategoryClick}
                aria-label="Agregar categoría"
                className="h-10 px-3 rounded-md bg-black text-white hover:bg-gray-800 active:scale-[.98] transition-all duration-150 flex items-center justify-center"
                title="Agregar nueva categoría"
              >
                +
              </button>
            </div>

            {selectedCategory?.description && (
              <p className="text-xs text-gray-500 mt-1">{selectedCategory.description}</p>
            )}
          </div>

          {/* stock */}
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

        {/* descripción */}
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

        {/* imagen */}
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
            <p className="text-sm text-gray-500 mt-1">Archivo seleccionado: {formData.image.name}</p>
          )}
        </div>

        {/* acciones */}
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
            className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando…' : 'Crear Producto'}
          </button>
        </div>
      </form>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={handleCloseAddCategoryModal}
        onCategoryAdded={handleCategoryAdded} 
      />
    </>
  );
};
