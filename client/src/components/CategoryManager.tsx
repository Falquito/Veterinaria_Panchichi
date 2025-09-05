// src/components/CategoryManager.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Edit2, Search, Save, FolderPlus, Tags } from "lucide-react";
import { Tabs, message } from "antd";
import { categoryService, type Category } from "../services/categoryService";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
  useModal,
} from "./ui/animated-modal";

/** Utils */
const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

type Mode = "create" | "edit";

// Componente FormContent movido fuera y memoizado para evitar re-renders
const FormContent = React.memo(({
  mode,
  form,
  setForm,
  categories,
  selected,
  setSelected,
}: {
  mode: Mode;
  form: { nombre: string; descripcion: string };
  setForm: React.Dispatch<React.SetStateAction<{ nombre: string; descripcion: string }>>;
  categories: Category[];
  selected: Category | null;
  setSelected: React.Dispatch<React.SetStateAction<Category | null>>;
}) => {
  const handleNombreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, nombre: e.target.value }));
  }, [setForm]);

  const handleDescripcionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, descripcion: e.target.value }));
  }, [setForm]);

  const handleCategorySelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const cat = categories.find((c) => c.id === id) ?? null;
    setSelected(cat);
    setForm({
      nombre: cat?.nombre ?? "",
      descripcion: cat?.descripcion ?? "",
    });
  }, [categories, setSelected, setForm]);

  return (
    <div className="space-y-6">
      {mode === "edit" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Tags className="w-4 h-4" />
            Seleccionar categoría
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            value={selected?.id ?? ""}
            onChange={handleCategorySelect}
          >
            <option value="" disabled>
              Elegí una categoría para editar...
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FolderPlus className="w-4 h-4" />
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.nombre}
          onChange={handleNombreChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          placeholder="Ingresa el nombre de la categoría..."
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Edit2 className="w-4 h-4" />
          Descripción
        </label>
        <textarea
          rows={4}
          value={form.descripcion}
          onChange={handleDescripcionChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
          placeholder="Describe brevemente esta categoría (opcional)..."
        />
      </div>
    </div>
  );
});

FormContent.displayName = 'FormContent';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Estado del modal / formularios
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
      setFiltered(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Búsqueda reactiva memoizada
  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    
    return categories.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.descripcion ?? "").toLowerCase().includes(q)
    );
  }, [categories, search]);

  useEffect(() => {
    setFiltered(filteredCategories);
  }, [filteredCategories]);

  const openCreate = useCallback(() => {
    setMode("create");
    setSelected(null);
    setForm({ nombre: "", descripcion: "" });
  }, []);

  const openEdit = useCallback((cat: Category) => {
    setMode("edit");
    setSelected(cat);
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion ?? "" });
  }, []);

  const handleSave = useCallback(async (close: () => void) => {
    if (!form.nombre.trim()) {
      message.error("El nombre es obligatorio");
      return;
    }
    try {
      setSaving(true);
      if (mode === "create") {
        await categoryService.create({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
        });
        message.success("✅ Categoría creada exitosamente");
      } else if (selected) {
        await categoryService.update(selected.id, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
        });
        message.success("✅ Categoría actualizada exitosamente");
      }
      close();
      await refresh();
    } catch (e: any) {
      message.error(e?.message ?? "❌ Error al guardar la categoría");
    } finally {
      setSaving(false);
    }
  }, [form, mode, selected, refresh]);

  return (
    <div className="min-h-screen bg-gray-50 rounded-4xl ">
      <Modal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header mejorado */}
          <PageHeader
            onCreate={openCreate}
            search={search}
            setSearch={setSearch}
            totalCategories={categories.length}
            filteredCount={filtered.length}
          />

          {/* Lista responsive mejorada */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <SkeletonCards />
            ) : error ? (
              <ErrorBox text={error} />
            ) : filtered.length === 0 ? (
              <EmptyBox text={search ? "No se encontraron categorías con ese criterio" : "Aún no hay categorías creadas"} />
            ) : (
              filtered.map((c) => (
                <CardItem
                  key={c.id}
                  c={c}
                  onEdit={() => openEdit(c)}
                />
              ))
            )}
          </div>

          {/* Tabla mejorada */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Nombre</Th>
                      <Th>Descripción</Th>
                      <Th>Fecha creación</Th>
                      <Th>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4}>
                          <TableSkeleton />
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={4}>
                          <ErrorBox text={error} />
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <EmptyBox text={search ? "No se encontraron categorías con ese criterio" : "Aún no hay categorías creadas"} />
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c) => (
                        <RowItem
                          key={c.id}
                          c={c}
                          onEdit={() => openEdit(c)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal principal mejorado */}
          <EditCreateModal
            mode={mode}
            setMode={setMode}
            saving={saving}
            onSave={handleSave}
            form={form}
            setForm={setForm}
            categories={categories}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
      </Modal>
    </div>
  );
}

function PageHeader({
  onCreate,
  search,
  setSearch,
  totalCategories,
  filteredCount,
}: {
  onCreate: () => void;
  search: string;
  setSearch: (v: string) => void;
  totalCategories: number;
  filteredCount: number;
}) {
  const handleCreateClick = useCallback(() => {
    onCreate();
  }, [onCreate]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, [setSearch]);

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600">
            Administra y organiza las categorías del sistema
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Total: {totalCategories}
            </span>
            {search && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Encontradas: {filteredCount}
              </span>
            )}
          </div>
        </div>
        
        <ModalTrigger
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r bg-black text-white px-6 py-3 text-sm font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Nueva categoría
        </ModalTrigger>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre o descripción..."
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>
    </div>
  );
}

function CardItem({
  c,
  onEdit,
}: {
  c: Category;
  onEdit: () => void;
}) {
  const { setOpen } = useModal();
  
  const handleEditClick = useCallback(() => {
    onEdit(); 
    setOpen(true); 
  }, [onEdit, setOpen]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {c.nombre}
            </h3>
          </div>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {c.descripcion || "Sin descripción"}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            Creada el {formatDate((c as any).createdAt)}
          </div>
        </div>
        
        <button
          onClick={handleEditClick}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar categoría"
        >
          <Edit2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function RowItem({
  c,
  onEdit,
}: {
  c: Category;
  onEdit: () => void;
}) {
  const { setOpen } = useModal();
  
  const handleEditClick = useCallback(() => {
    onEdit(); 
    setOpen(true);
  }, [onEdit, setOpen]);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-gray-900">{c.nombre}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600 max-w-xs">
        <div className="truncate" title={c.descripcion || "Sin descripción"}>
          {c.descripcion || "Sin descripción"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate((c as any).createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <button
          onClick={handleEditClick}
          className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
          title="Editar categoría"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function EditCreateModal({
  mode,
  setMode,
  saving,
  onSave,
  form,
  setForm,
  categories,
  selected,
  setSelected,
}: {
  mode: "create" | "edit";
  setMode: (m: "create" | "edit") => void;
  saving: boolean;
  onSave: (close: () => void) => void;
  form: { nombre: string; descripcion: string };
  setForm: React.Dispatch<React.SetStateAction<{ nombre: string; descripcion: string }>>;
  categories: Category[];
  selected: Category | null;
  setSelected: React.Dispatch<React.SetStateAction<Category | null>>;
}) {
  const { setOpen } = useModal();

  const handleSave = useCallback(() => {
    onSave(() => setOpen(false));
  }, [onSave, setOpen]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleTabChange = useCallback((k: string) => {
    setMode(k as Mode);
  }, [setMode]);

  return (
    <ModalBody>
      <ModalContent className="p-0 max-w-2xl">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {mode === "create" ? (
                <Plus className="w-5 h-5 text-blue-600" />
              ) : (
                <Edit2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === "create" ? "Crear nueva categoría" : "Editar categoría"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === "create" 
                  ? "Completa los datos para crear una nueva categoría" 
                  : "Modifica los datos de la categoría seleccionada"
                }
              </p>
            </div>
          </div>
        </div>

        <div className="px-6">
          <Tabs
            activeKey={mode}
            onChange={handleTabChange}
            className="custom-tabs"
            items={[
              {
                key: "create",
                label: (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Crear
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <FormContent
                      mode="create"
                      form={form}
                      setForm={setForm}
                      categories={categories}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </div>
                ),
              },
              {
                key: "edit",
                label: (
                  <span className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <FormContent
                      mode="edit"
                      form={form}
                      setForm={setForm}
                      categories={categories}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>

        <ModalFooter className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50 transition-colors"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </ModalFooter>
      </ModalContent>
    </ModalBody>
  );
}

/* UI helpers mejorados */
const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
    {children}
  </th>
);

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (  
    <div className="p-6 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 text-sm font-medium">❌ {text}</div>
      <p className="text-red-500 text-xs mt-1">Por favor, intenta nuevamente</p>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <div className="text-gray-400 mb-2">
        <FolderPlus className="w-12 h-12 mx-auto" />
      </div>
      <div className="text-gray-600 font-medium">{text}</div>
      <p className="text-gray-500 text-sm mt-1">Comienza creando tu primera categoría</p>
    </div>
  );
}