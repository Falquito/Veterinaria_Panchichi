import React, { useState, useEffect } from 'react';
import { createProduct } from '../services/productService';
import { useModal } from './ui/animated-modal';
import AddCategoryModal from '../components/modals/AddCategoryModal';
import { categoryService, type Category as ApiCategory } from '../services/categoryService';
import { depositosService, type Deposito } from '../services/depositosService';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Warehouse,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Hash
} from 'lucide-react';

type UICategory = { id: number; name: string; description?: string };

export const NewProductForm: React.FC = () => {
  const { setOpen } = useModal();

  const [categories, setCategories] = useState<UICategory[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDepositos, setLoadingDepositos] = useState(true);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    categoriaId: 0,
    cantidad: '',
    fechaelaboracion: '',
    fechaVencimiento: '',
    IdDeposito: 0,
    image: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  

  // Cargar categorías
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
        setErrors(prev => ({ ...prev, categories: 'Error al cargar categorías' }));
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  // Cargar depósitos
  useEffect(() => {
    (async () => {
      try {
        const fetchedDepositos = await depositosService.getAll();
        setDepositos(fetchedDepositos);
        if (fetchedDepositos.length) {
          setFormData((p) => ({ ...p, IdDeposito: fetchedDepositos[0].id_deposito }));
        }
      } catch (err) {
        console.error('Error loading depositos:', err);
        setErrors(prev => ({ ...prev, depositos: 'Error al cargar depósitos' }));
      } finally {
        setLoadingDepositos(false);
      }
    })();
  }, []);

  const validateField = (name: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          newErrors.nombre = 'El nombre es obligatorio';
        } else {
          delete newErrors.nombre;
        }
        break;
      case 'precio':
        if (!value || Number(value) < 0) {
          newErrors.precio = 'El precio debe ser mayor o igual a 0';
        } else {
          delete newErrors.precio;
        }
        break;
      case 'cantidad':
        if (!value || Number(value) <= 0) {
          newErrors.cantidad = 'La cantidad debe ser mayor a 0';
        } else {
          delete newErrors.cantidad;
        }
        break;
      case 'fechaelaboracion':
        if (!value) {
          newErrors.fechaelaboracion = 'La fecha de elaboración es obligatoria';
        } else {
          delete newErrors.fechaelaboracion;
        }
        break;
      case 'fechaVencimiento':
        if (!value) {
          newErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria';
        } else if (formData.fechaelaboracion && new Date(formData.fechaelaboracion) >= new Date(value)) {
          newErrors.fechaVencimiento = 'Debe ser posterior a la fecha de elaboración';
        } else {
          delete newErrors.fechaVencimiento;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, type, value } = e.target;
    const newValue =
      e.target instanceof HTMLInputElement && type === 'checkbox'
        ? e.target.checked
        : value;
    
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    validateField(name, newValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'La imagen no puede superar los 5MB' }));
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: '' }));
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

    Object.keys(formData).forEach(key => {
      if (key !== 'image' && key !== 'descripcion') {
        validateField(key, formData[key as keyof typeof formData]);
      }
    });

    if (Object.keys(errors).some(key => errors[key])) {
      return;
    }

    setLoading(true);

    try {
      await createProduct({
        nombre: formData.nombre,
        precio: Number(formData.precio),
        descripcion: formData.descripcion,
        categoriaId: Number(formData.categoriaId),
        depositos: [
          {
            IdDeposito: Number(formData.IdDeposito),
            cantidad: Number(formData.cantidad),
          },
        ],
        fechaelaboracion: formData.fechaelaboracion,
        fechaVencimiento: formData.fechaVencimiento,
        image: formData.image,   
      });

      setFormData({
        nombre: '',
        precio: '',
        descripcion: '',
        categoriaId: categories[0]?.id ?? 0,
        cantidad: '',
        fechaelaboracion: '',
        fechaVencimiento: '',
        IdDeposito: depositos[0]?.id_deposito ?? 0,
        image: null,
      });
      setErrors({});
      setOpen(false);
    } catch (err) {
      console.error('Error completo:', err);
      setErrors(prev => ({ ...prev, submit: `Error al crear el producto: ${err}` }));
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === Number(formData.categoriaId));
  const selectedDeposito = depositos.find((d) => d.id_deposito === Number(formData.IdDeposito));

  const isFormValid = !Object.keys(errors).some(key => errors[key]) && 
    formData.nombre.trim() && 
    formData.precio && 
    formData.cantidad && 
    formData.fechaelaboracion && 
    formData.fechaVencimiento &&
    formData.categoriaId &&
    formData.IdDeposito;

  return (
    <>
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-t-xl border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nuevo Producto</h2>
              <p className="text-gray-600">Crea un nuevo producto para tu inventario</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-800" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700">
                    Nombre del Producto *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                        errors.nombre ? 'border-gray-400 bg-gray-100' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Alimento Premium para Perros"
                    />
                  </div>
                  {errors.nombre && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="precio" className="block text-sm font-semibold text-gray-700">
                    Precio Unitario *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      id="precio"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                        errors.precio ? 'border-gray-400 bg-gray-100' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.precio && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.precio}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Categoría *</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      {loadingCategories ? (
                        <div className="pl-10 pr-4 py-3 h-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-2"></div>
                          Cargando categorías...
                        </div>
                      ) : (
                        <select
                          name="categoriaId"
                          value={formData.categoriaId}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
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
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddCategoryClick}
                      className="h-12 px-4 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors flex items-center justify-center"
                      title="Agregar nueva categoría"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedCategory?.description && (
                    <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Depósito *</label>
                  <div className="relative">
                    <Warehouse className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    {loadingDepositos ? (
                      <div className="pl-10 pr-4 py-3 h-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-2"></div>
                        Cargando depósitos...
                      </div>
                    ) : (
                      <select
                        name="IdDeposito"
                        value={formData.IdDeposito}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      >
                        {depositos.length === 0 ? (
                          <option value="">No hay depósitos disponibles</option>
                        ) : (
                          depositos.map((deposito) => (
                            <option key={deposito.id_deposito} value={deposito.id_deposito}>
                              {deposito.nombre}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                  </div>
                  {selectedDeposito?.direccion && (
                    <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      📍 {selectedDeposito.direccion}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors resize-none"
                  placeholder="Describe las características, beneficios o detalles importantes del producto..."
                />
              </div>
            </div>

            {/* Stock e Inventario */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Warehouse className="w-5 h-5 mr-2 text-gray-800" />
                Stock e Inventario
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="cantidad" className="block text-sm font-semibold text-gray-700">
                    Cantidad Inicial *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      id="cantidad"
                      name="cantidad"
                      value={formData.cantidad}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                        errors.cantidad ? 'border-gray-400 bg-gray-100' : 'border-gray-300'
                      }`}
                      placeholder="Ej: 100"
                    />
                  </div>
                  {errors.cantidad && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cantidad}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="fechaelaboracion" className="block text-sm font-semibold text-gray-700">
                    Fecha de Elaboración *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      id="fechaelaboracion"
                      name="fechaelaboracion"
                      value={formData.fechaelaboracion}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                        errors.fechaelaboracion ? 'border-gray-400 bg-gray-100' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.fechaelaboracion && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fechaelaboracion}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="fechaVencimiento" className="block text-sm font-semibold text-gray-700">
                    Fecha de Vencimiento *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      id="fechaVencimiento"
                      name="fechaVencimiento"
                      value={formData.fechaVencimiento}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${
                        errors.fechaVencimiento ? 'border-gray-400 bg-gray-100' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.fechaVencimiento && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fechaVencimiento}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-gray-800" />
                Imagen del Producto
              </h3>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-800 transition-colors">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                    <div>
                      <span className="text-gray-900 font-medium">Hacer clic para subir</span>
                 
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                  </label>
                </div>

                {formData.image && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-gray-800 flex-shrink-0" />
                    <span className="text-sm text-gray-800">{formData.image.name}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                      className="text-gray-800 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {errors.image && (
                  <p className="text-sm text-gray-700 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.image}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Error al crear producto</h4>
                    <p className="text-sm text-gray-700 mt-1">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {isFormValid ? (
                <span className="flex items-center text-gray-800">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Formulario completo
                </span>
              ) : (
                "Completa todos los campos requeridos"
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading || !isFormValid}
                className="px-6 py-2.5 text-sm font-medium text-white bg-black border border-transparent rounded-lg hover:bg-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plus className="W-4 h-4 mr-2" />
                    Crear Producto
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={handleCloseAddCategoryModal}
        onCategoryAdded={handleCategoryAdded}
      />
    </>
  );
};
