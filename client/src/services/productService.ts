// URL base del backend (usa la de tu .env si existe)
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const PRODUCT_URL = `${API_BASE}/productos`;

export interface NewProductPayload {
  nombre: string;
  precio: number;
  descripcion: string;
  categoriaId: number;      // Cambiar a number para coincidir con el DTO
  stock: number;            // stock inicial (OBLIGATORIO)
  image?: File | null;      // imagen (opcional)
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  imagenURL: string;
  stock?: number;
  categoria: 1;
}

/** Crear producto */
export async function createProduct(payload: NewProductPayload): Promise<Product> {
  const res = await fetch(`${API_BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // 👈 importante
    body: JSON.stringify({
      nombre: payload.nombre.trim(),
      descripcion: payload.descripcion.trim(),
      precio: Number(payload.precio),
      categoriaId: Number(payload.categoriaId),
      stock: Number(payload.stock),
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status} ${res.statusText} - ${txt}`);
  }
  return res.json();
}

/** Listar productos */
export async function listProducts(): Promise<Product[]> {
  const res = await fetch(PRODUCT_URL);
  if (!res.ok) throw new Error(`Error listando productos: ${res.statusText}`);
  return res.json();
}

/** Obtener producto por ID */
export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`${PRODUCT_URL}/${id}`);
  if (!res.ok) throw new Error(`Producto ${id} no encontrado`);
  return res.json();
}

/** Actualizar producto */
export type UpdateProductPayload = Partial<
  NewProductPayload & { status: boolean }
>;

export async function updateProduct(
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  const res = await fetch(`${PRODUCT_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: payload.nombre,
      precio: payload.precio,
      descripcion: payload.descripcion,
      activo: payload.status,
      categoriaId: payload.categoriaId,
      stock: payload.stock,
    }),
  });
  if (!res.ok) throw new Error(`Error actualizando producto: ${res.statusText}`);
  return res.json();
}

/** Eliminar producto */
export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${PRODUCT_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Error eliminando producto: ${res.statusText}`);
}