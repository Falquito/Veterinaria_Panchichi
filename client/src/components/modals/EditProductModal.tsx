// src/components/modals/EditProductModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit3,
  DollarSign,
  Image as ImageIcon, 
} from "lucide-react";
import type { Product, ProductDeposito } from "../../types/product";
import { categoryService } from "../../services/categoryService";
import { updateProduct, getProductById } from "../../services/productService";
import { depositosService, type Deposito } from "../../services/depositosService";
import { useModal } from "../ui/animated-modal";

type UICategory = { id: number; name: string; description?: string };

interface Props {
  product: Product | null;
  onUpdated?: (p: Product) => void;
}

interface DepositoAjuste {
  IdDeposito: number;
  nombreDeposito: string;
  stockActual: number;
  valor: string;
  isNew?: boolean;
}

export default function EditProductDialog({ product, onUpdated }: Props) {
  const { setOpen } = useModal();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDepositos, setLoadingDepositos] = useState(false);

  const [cats, setCats] = useState<UICategory[]>([]);
  const [depositosDisponibles, setDepositosDisponibles] = useState<Deposito[]>([]);
  const [productData, setProductData] =
    useState<(Product & { depositos: ProductDeposito[] }) | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "inventory">("basic");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoriaId: "" as string | number,
    fechaelaboracion: "",
    fechaVencimiento: "",
  });

  const [ajustesDepositos, setAjustesDepositos] = useState<DepositoAjuste[]>([]);
  const [selectedDepositoToAdd, setSelectedDepositoToAdd] = useState<number | "">("");

  // -------- Imagen (nuevo) ---------------------------------------------------
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB
    setNewImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processImage(f);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processImage(f);
  };
  const removeNewImage = () => {
    setNewImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  // ---------------------------------------------------------------------------

  // Cargar categorías
  useEffect(() => {
    (async () => {
      try {
        const fetched = await categoryService.getAll();
        setCats(fetched.map((c: any) => ({ id: c.id, name: c.nombre, description: c.descripcion })));
      } catch (e) { console.error("Error cargando categorías", e); }
    })();
  }, []);

  // Cargar depósitos
  useEffect(() => {
    (async () => {
      try {
        setLoadingDepositos(true);
        const depositos = await depositosService.getAll();
        setDepositosDisponibles(depositos);
      } catch (e) { console.error("Error cargando depósitos:", e); }
      finally { setLoadingDepositos(false); }
    })();
  }, []);

  // Cargar producto + depósitos
  useEffect(() => {
    if (!product) return;
    (async () => {
      try {
        setLoading(true);
        const fullProduct = await getProductById(product.id);
        setProductData(fullProduct);
        const ajustesIniciales: DepositoAjuste[] = fullProduct.depositos.map((dep) => ({
          IdDeposito: dep.idDeposito,
          nombreDeposito: dep.nombreDeposito,
          stockActual: dep.stock,
          valor: "",
        }));
        setAjustesDepositos(ajustesIniciales);
      } catch (e) { console.error("Error cargando producto:", e); }
      finally { setLoading(false); }
    })();
  }, [product]);

  // Categoria inicial -> id
  const initialCatId = useMemo(() => {
    if (!productData) return "";
    const nombreCat = typeof productData.categoria === "string"
      ? productData.categoria
      : productData.categoria?.nombre ?? "";
    return cats.find((c) => c.name === nombreCat)?.id ?? "";
  }, [productData, cats]);

  // Poblar form
  useEffect(() => {
    if (!productData) return;
    const nombreCat = typeof productData.categoria === "string"
      ? productData.categoria
      : productData.categoria?.nombre ?? "";
    const categoriaIdDetect = cats.find((c) => c.name === nombreCat)?.id ?? "";
    setForm({
      nombre: productData.nombre ?? "",
      descripcion: productData.descripcion ?? "",
      precio: String(productData.precio ?? ""),
      categoriaId: categoriaIdDetect === "" ? "" : String(categoriaIdDetect),
      fechaelaboracion: "",
      fechaVencimiento: "",
    });
  }, [productData, cats]);

  // Stats
  const stockStats = useMemo(() => {
    const current = ajustesDepositos.reduce((sum, a) => sum + a.stockActual, 0);
    const adjustments = ajustesDepositos.reduce((sum, a) => sum + (Number(a.valor) || 0), 0);
    return { current, adjustments, final: current + adjustments };
  }, [ajustesDepositos]);

  const hasChanges = useMemo(() => {
    if (!productData) return false;
    const nameChanged = form.nombre !== productData.nombre;
    const descChanged = form.descripcion !== productData.descripcion;
    const priceChanged = form.precio !== String(productData.precio);
    const catChanged = form.categoriaId !== "" && Number(form.categoriaId) !== Number(initialCatId);
    const stockChanged = ajustesDepositos.some((a) => Number(a.valor) !== 0);
    const imageChanged = !!newImage; // 👈 también cuenta como cambio
    return nameChanged || descChanged || priceChanged || catChanged || stockChanged || imageChanged;
  }, [form, productData, ajustesDepositos, initialCatId, newImage]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Validación de ajustes (no stock negativo)
  const updateAjusteSafe = (idDeposito: number, raw: string, stockActual: number) => {
    if (raw === "") {
      setAjustesDepositos((prev) => prev.map((a) => (a.IdDeposito === idDeposito ? { ...a, valor: "" } : a)));
      return;
    }
    let num = Number(raw);
    if (!Number.isFinite(num)) return;
    const minPermitido = stockActual === 0 ? 0 : -stockActual;
    if (num < minPermitido) num = minPermitido;
    setAjustesDepositos((prev) => prev.map((a) => (a.IdDeposito === idDeposito ? { ...a, valor: String(num) } : a)));
  };

  const eliminarAjuste = (idDeposito: number) =>
    setAjustesDepositos((prev) => prev.filter((a) => !(a.IdDeposito === idDeposito && a.isNew)));

  const depositosParaAgregar = useMemo(() => {
    const usados = new Set(ajustesDepositos.map((a) => a.IdDeposito));
    return depositosDisponibles.filter((d) => !usados.has(d.id_deposito));
  }, [depositosDisponibles, ajustesDepositos]);

  const agregarDeposito = () => {
    const targetId = typeof selectedDepositoToAdd === "number"
      ? selectedDepositoToAdd
      : depositosParaAgregar[0]?.id_deposito;
    if (!targetId) return;
    const dep = depositosDisponibles.find((d) => d.id_deposito === targetId);
    if (!dep || ajustesDepositos.some((a) => a.IdDeposito === targetId)) return;
    setAjustesDepositos((prev) => [...prev, {
      IdDeposito: targetId, nombreDeposito: dep.nombre, stockActual: 0, valor: "0", isNew: true,
    }]);
    setSelectedDepositoToAdd("");
    setActiveTab("inventory");
  };

  // Guardar (incluye imagen si hay)
  const handleSave = async () => {
    if (!productData) return;
    try {
      setSaving(true);

      const depositosPayload = ajustesDepositos
        .filter((a) => Number.isFinite(Number(a.valor)) && Number(a.valor) !== 0)
        .map((a) => ({ IdDeposito: a.IdDeposito, cantidad: Number(a.valor) || 0 }));

      const payload: any = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
      };
      if (form.fechaelaboracion) payload.fechaelaboracion = form.fechaelaboracion;
      if (form.fechaVencimiento) payload.fechaVencimiento = form.fechaVencimiento;

      const selectedCatId = form.categoriaId !== "" ? Number(form.categoriaId) : null;
      if (selectedCatId !== null && selectedCatId !== Number(initialCatId)) payload.categoriaId = selectedCatId;
      if (depositosPayload.length > 0) payload.depositos = depositosPayload;

      if (newImage) payload.image = newImage; 
      const updated = await updateProduct(productData.id, payload);
      onUpdated?.(updated);
      setOpen(false);
    } catch (e) {
      console.error("Error actualizando:", e);
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Selecciona un producto para editar</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          <Package className="absolute top-3 left-3 w-6 h-6 text-blue-600" />
        </div>
        <p className="mt-4 text-gray-600 animate-pulse">Cargando datos del producto...</p>
      </div>
    );
  }

  // Para la imagen del header y preview
  const headerImg =
    previewUrl ??
    (productData?.imagen || (productData as any)?.ImagenURL || (productData as any)?.imagenURL || "");

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-t-xl border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
              {headerImg ? (
                <img src={headerImg} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <Package className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.nombre}</h1>
              <p className="text-gray-600 mt-1">ID: #{product.id}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm">
                <span className="flex items-center text-green-600">
                  <DollarSign className="w-4 h-4 mr-1" />${productData?.precio || 0}
                </span>
                <span className="flex items-center text-blue-600">
                  <Package className="w-4 h-4 mr-1" />
                  {stockStats.current} unidades
                </span>
              </div>
            </div>
          </div>

          {hasChanges && (
            <div className="flex items-center px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              Cambios pendientes
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab("basic")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "basic"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Edit3 className="w-4 h-4 inline mr-2" />
            Información Básica
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "inventory"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Gestión de Inventario
            {stockStats.adjustments !== 0 && (
              <span className="ml-2 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">!</span>
            )}
          </button>
        </nav>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-blue-600" />
                  Información del Producto
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Imagen (nuevo) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Imagen</label>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 grid place-items-center">
                        {headerImg ? (
                          <img src={headerImg} className="w-20 h-20 object-cover" alt="preview" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div
                        className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                          isDragging ? "border-gray-400" : "border-gray-300 hover:border-blue-600"
                        }`}
                        onDragOver={onDragOver}
                        onDragEnter={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                      >
                        <input
                          id="edit-image-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onFileChange}
                        />
                        <label htmlFor="edit-image-input" className="flex flex-col items-center space-y-1 select-none">
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-900">Cambiar imagen</span>
                          <span className="text-xs text-gray-500">Clic o arrastrar y soltar (máx 5MB)</span>
                        </label>
                      </div>
                    </div>

                    {newImage && (
                      <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{newImage.name}</span>
                        <button
                          type="button"
                          onClick={removeNewImage}
                          className="ml-2 px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Nombre del Producto</label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={onChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ingresa el nombre del producto"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Precio Unitario</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        name="precio"
                        value={form.precio}
                        onChange={onChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Categoría</label>
                    <select
                      name="categoriaId"
                      value={form.categoriaId}
                      onChange={onChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Mantener categoría actual</option>
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={onChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Describe las características, beneficios o detalles importantes del producto..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Selector de depósito para agregar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agregar depósito al producto
                    </label>
                    <select
                      value={selectedDepositoToAdd}
                      onChange={(e) => setSelectedDepositoToAdd(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Seleccionar depósito disponible</option>
                      {depositosParaAgregar.map((d) => (
                        <option key={d.id_deposito} value={d.id_deposito}>{d.nombre}</option>
                      ))}
                    </select>
                    {!depositosParaAgregar.length && (
                      <p className="text-xs text-gray-500 mt-2">No hay depósitos disponibles para agregar.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={agregarDeposito}
                    disabled={loadingDepositos || (!selectedDepositoToAdd && !depositosParaAgregar[0])}
                    className="inline-flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Depósito
                  </button>
                </div>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Stock Actual</p>
                      <p className="text-2xl font-bold text-blue-900">{stockStats.current}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className={`rounded-xl p-4 border ${
                  stockStats.adjustments > 0 ? "bg-green-50 border-green-100"
                : stockStats.adjustments < 0 ? "bg-red-50 border-red-100"
                : "bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${
                        stockStats.adjustments > 0 ? "text-green-700"
                      : stockStats.adjustments < 0 ? "text-red-700" : "text-gray-700"}`}>
                        Ajuste
                      </p>
                      <p className={`text-2xl font-bold ${
                        stockStats.adjustments > 0 ? "text-green-900"
                      : stockStats.adjustments < 0 ? "text-red-900" : "text-gray-900"}`}>
                        {stockStats.adjustments > 0 ? "+" : ""}{stockStats.adjustments}
                      </p>
                    </div>
                    <TrendingUp className={`w-8 h-8 ${
                      stockStats.adjustments > 0 ? "text-green-600"
                    : stockStats.adjustments < 0 ? "text-red-600" : "text-gray-600"}`} />
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-700">Stock Final</p>
                      <p className="text-2xl font-bold text-indigo-900">{stockStats.final}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Tarjetas de depósitos */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 space-y-4">
                  {ajustesDepositos.map((ajuste) => {
                    const valorNum = Number(ajuste.valor) || 0;
                    const minPermitido = ajuste.stockActual === 0 ? 0 : -ajuste.stockActual;
                    const stockFinal = ajuste.stockActual + valorNum;
                    const stockEsCero = ajuste.stockActual === 0;

                    return (
                      <div
                        key={ajuste.IdDeposito}
                        className={`relative rounded-xl border-2 p-6 transition-all duration-200 ${
                          ajuste.isNew || valorNum !== 0
                            ? "border-blue-200 bg-blue-50/30 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {ajuste.isNew && (
                          <div className="absolute -top-2 -right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Nuevo
                            </span>
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{ajuste.nombreDeposito}</h3>
                              <p className="text-sm text-gray-500">
                                Stock actual: <span className="font-medium">{ajuste.stockActual} unidades</span>
                              </p>
                            </div>
                          </div>

                          {ajuste.isNew ? (
                            <button
                              type="button"
                              onClick={() => eliminarAjuste(ajuste.IdDeposito)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Quitar depósito nuevo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div className="space-y-2">
                            <input
                              type="number"
                              value={ajuste.valor}
                              min={minPermitido}
                              onKeyDown={(e) => { if (stockEsCero && (e.key === "-" || e.key === "Subtract")) e.preventDefault(); }}
                              onChange={(e) => updateAjusteSafe(ajuste.IdDeposito, e.target.value, ajuste.stockActual)}
                              onPaste={(e) => {
                                const text = e.clipboardData.getData("text").trim();
                                const num = Number(text);
                                const min = ajuste.stockActual === 0 ? 0 : -ajuste.stockActual;
                                if (!Number.isFinite(num) || num < min) e.preventDefault();
                              }}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0"
                            />
                            {stockEsCero
                              ? <p className="text-xs text-amber-600">Con stock 0 no se permiten ajustes negativos.</p>
                              : <p className="text-xs text-gray-500">No podés bajar el stock final por debajo de 0.</p>}
                          </div>

                          <div className="text-center">
                            <div className="inline-flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                              <span className="font-medium">{ajuste.stockActual}</span>
                              <span>+</span>
                              <span className="font-medium">{valorNum}</span>
                              <span>=</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Stock Final</p>
                              <div className={`text-2xl font-bold ${
                                valorNum > 0 ? "text-green-600" : valorNum < 0 ? "text-red-600" : "text-gray-900"
                              }`}>{stockFinal}</div>
                              {(valorNum !== 0 || ajuste.isNew) && (
                                <div className="text-xs px-2 py-1 rounded-full inline-block bg-blue-100 text-blue-700">
                                  {ajuste.isNew ? "Vincular depósito" : (valorNum > 0 ? `+${valorNum}` : `${valorNum}`)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {ajustesDepositos.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin depósitos configurados</h3>
                      <p className="text-gray-500 mb-6">Agrega depósitos para gestionar el inventario</p>
                    </div>
                  )}

                  {depositosDisponibles.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Depósitos disponibles: {depositosParaAgregar.length} de {depositosDisponibles.length}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {depositosParaAgregar.slice(0, 3).map((d) => (
                          <span key={d.id_deposito} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            {d.nombre}
                          </span>
                        ))}
                        {depositosParaAgregar.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            +{depositosParaAgregar.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{hasChanges ? "Hay cambios sin guardar" : "Sin cambios pendientes"}</div>
          <div className="flex space-x-3">
            <button
              onClick={() => setOpen(false)}
              disabled={saving}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.nombre.trim() || !hasChanges}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Guardando...
                </div>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
