const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const PRODUCT_URL = `${API_BASE}/productos`;

import type { Product, ProductDeposito } from "../types/product";

/** Util: estado visual */
function estadoFrom(activo: boolean, stock: number) {
  return !activo
    ? { label: "Inactivo", color: "border-red-300 text-red-700 bg-red-50" }
    : stock <= 0
      ? { label: "Sin stock", color: "border-red-300 text-red-700 bg-red-50" }
      : { label: "Activo", color: "border-emerald-300 text-emerald-700 bg-emerald-50" };
}

/** Mapea “producto plano” (lista clásica) a Product */
function mapToProduct(p: any): Product {
  const id = Number(p.id ?? p.idProducto);
  const nombre = p.nombre ?? p.nombreProducto ?? "";
  const descripcion = p.descripcion ?? "";
  const precio = Number(p.precio ?? 0);
  const stock = Number(p.stock ?? 0);
  const imagen = p.ImagenURL ?? p.imagenURL ?? p.imagen ?? "";
  const activo = p?.activo !== false;

  const catRaw =
    (p?.categoria && typeof p.categoria === "string" ? p.categoria : undefined) ??
    p?.categoria?.nombre ??
    p?.NombreCategoria ??
    p?.nombrecategoria ??
    p?.nombreCategoria ??
    p?.categoriaNombre ??
    p?.["nombre_categoria"] ??
    p?.["categoria_nombre"];

  const categoria = typeof catRaw === "string" && catRaw.trim() !== "" ? catRaw : "—";

  const depositoLabel =
    (p.deposito ?? p.iddeposito ?? p.IdDeposito)?.toString?.() ??
    p.nombreDeposito ??
    "—";

  const depositos: ProductDeposito[] = Array.isArray(p.depositos)
    ? p.depositos.map((d: any) => ({
        idDeposito: Number(d.idDeposito),
        nombreDeposito: d.nombreDeposito ?? `Depósito ${d.idDeposito}`,
        stock: Number(d.stock ?? 0),
      }))
    : [];

  const stockTotal = depositos.length
    ? depositos.reduce((s, d) => s + Number(d.stock ?? 0), 0)
    : stock;

  return {
    id,
    nombre,
    descripcion,
    precio,
    stock: stockTotal,
    imagen,
    categoria,
    deposito: depositos.length > 1
      ? `Múltiples (${depositos.length})`
      : (depositos[0]?.nombreDeposito ?? depositoLabel),
    estado: estadoFrom(activo, stockTotal),
    activo,
    depositos,
  };
}

/** Mapea el objeto devuelto por findOne (con depositos:[]) */
function mapProductWithWarehouses(data: any): Product & { depositos: ProductDeposito[] } {
  const depositos: ProductDeposito[] = Array.isArray(data?.depositos)
    ? data.depositos.map((d: any) => ({
        idDeposito: Number(d.idDeposito),
        nombreDeposito: d.nombreDeposito ?? `Depósito ${d.idDeposito}`,
        stock: Number(d.stock ?? 0),
      }))
    : [];

  const stockTotal = depositos.reduce((sum, dep) => sum + (Number(dep.stock) || 0), 0);
  const activo = data?.activo !== false;

  return {
    id: Number(data.id ?? data.idProducto),
    nombre: data.nombre ?? data.nombreProducto ?? "",
    descripcion: data.descripcion ?? "",
    precio: Number(data.precio ?? 0),
    stock: stockTotal,
    imagen: data.ImagenURL ?? data.imagenURL ?? data.imagen ?? "",
    categoria: data.categoria ?? data.nombreCategoria ?? "—",
    deposito: depositos.length > 1
      ? `Múltiples (${depositos.length})`
      : (depositos[0]?.nombreDeposito ?? "—"),
    estado: estadoFrom(activo, stockTotal),
    activo,
    depositos,
  };
}

/** Normaliza la respuesta de findAll cuando viene agrupada por depósito */
function normalizeFindAll(raw: any): Product[] {
  if (!Array.isArray(raw)) return [];

  // Si ya es “plano” (sin agrupación), map directo
  if (raw.length > 0 && !("productos" in raw[0])) {
    return raw.map(mapToProduct);
  }

  type Acc = Map<number, Product>;
  const acc: Acc = new Map();

  for (const dep of raw) {
    const idDeposito = Number(dep.idDeposito);
    const nombreDeposito = dep.nombreDeposito ?? `Depósito ${idDeposito}`;
    const productos: any[] = Array.isArray(dep.productos) ? dep.productos : [];

    for (const p of productos) {
      const id = Number(p.id ?? p.idProducto);
      if (!id) continue;

      const prev = acc.get(id);
      const base: Product = prev ?? mapToProduct(p);

      const depEntry: ProductDeposito = {
        idDeposito,
        nombreDeposito,
        stock: Number(p.stock ?? 0),
      };

      const nextDepos = Array.isArray(base.depositos) ? [...base.depositos] : [];
      nextDepos.push(depEntry);

      const nextStock = nextDepos.reduce((s, d) => s + (Number(d.stock) || 0), 0);

      const next: Product = {
        ...base,
        stock: nextStock,
        deposito: nextDepos.length > 1 ? `Múltiples (${nextDepos.length})` : nombreDeposito,
        depositos: nextDepos,
        estado: estadoFrom(base.activo ?? true, nextStock),
      };

      acc.set(id, next);
    }
  }

  return Array.from(acc.values());
}

export interface NewProductPayload {
  nombre: string;
  precio: number;
  descripcion: string;
  categoriaId: number;
  depositos: Array<{ IdDeposito: number; cantidad: number }>;
  fechaelaboracion: string;
  fechaVencimiento: string;
  image?: File | null;
}

export async function createProduct(payload: NewProductPayload): Promise<Product> {
  const hasFile = payload.image instanceof File;

  let res: Response;

  if (hasFile) {
    // multipart/form-data
    const fd = new FormData();
    fd.append("nombre", (payload.nombre ?? "").trim());
    fd.append("descripcion", (payload.descripcion ?? "").trim());
    fd.append("precio", String(Number(payload.precio)));
    fd.append("categoriaId", String(Number(payload.categoriaId)));
    fd.append(
      "depositos",
      JSON.stringify(
        (payload.depositos ?? []).map(d => ({
          IdDeposito: Number(d.IdDeposito),
          cantidad: Number(d.cantidad),
        }))
      )
    );
    fd.append("fechaelaboracion", payload.fechaelaboracion);
    fd.append("fechaVencimiento", payload.fechaVencimiento);
    // Debe coincidir con FileInterceptor('image', ...)
    fd.append("image", payload.image!, payload.image!.name);

    res = await fetch(`${PRODUCT_URL}`, { method: "POST", body: fd });
  } else {
    // JSON
    res = await fetch(`${PRODUCT_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: (payload.nombre ?? "").trim(),
        descripcion: (payload.descripcion ?? "").trim(),
        precio: Number(payload.precio),
        categoriaId: Number(payload.categoriaId),
        depositos: (payload.depositos ?? []).map(d => ({
          IdDeposito: Number(d.IdDeposito),
          cantidad: Number(d.cantidad),
        })),
        fechaelaboracion: payload.fechaelaboracion,
        fechaVencimiento: payload.fechaVencimiento,
      }),
    });
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status} ${res.statusText} - ${txt}`);
  }

  const created = await res.json();
  const id = Number(created?.id ?? created?.idProducto);
  if (!id) return mapToProduct(created);

  // Traemos el consolidado con depositos
  const after = await getProductById(id);
  return after;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(PRODUCT_URL);
  if (!res.ok) throw new Error("Error al cargar productos");
  const raw = await res.json();
  return normalizeFindAll(raw);
}

export async function archiveProduct(id: number): Promise<void> {
  const res = await fetch(`${PRODUCT_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error archivando producto: ${await res.text()}`);
}

/**
 * RESTAURAR producto:
 * Tu back no expone /restore. La “restauración” es un PATCH al mismo recurso con { activo: true }.
 */
export async function restoreProduct(id: number): Promise<void> {
  const res = await fetch(`${PRODUCT_URL}/${id}/restore`, { method: "PATCH" });
  if (!res.ok) throw new Error(`Error restaurando producto: ${await res.text()}`);
}

/** Devuelve el producto consolidado (findOne) */
export async function getProductById(id: number): Promise<Product & { depositos: ProductDeposito[] }> {
  const res = await fetch(`${PRODUCT_URL}/${id}`);
  if (!res.ok) throw new Error("Error al cargar producto");
  const raw = await res.json();
  return mapProductWithWarehouses(raw);
}

/** Compat: algunos sitios de tu UI esperan array — lo resolvemos con findOne */
export async function getProductRowsById(id: number): Promise<Product[]> {
  const item = await getProductById(id);
  return [item];
}

export type UpdateProductPayload = Partial<{
  nombre: string;
  precio: number;
  descripcion: string;
  status: boolean;    // activo
  categoriaId: number;
  depositos: Array<{ IdDeposito: number; cantidad: number }>;
  fechaelaboracion: string;
  fechaVencimiento: string;
  image?: File | null;
}>;

export async function updateProduct(
  id: number,
  payload: UpdateProductPayload
): Promise<Product> {
  const hasFile = payload?.image instanceof File;

  let res: Response;

  if (hasFile) {
    // multipart/form-data
    const fd = new FormData();

    if (payload.nombre !== undefined) fd.append("nombre", String(payload.nombre));
    if (payload.descripcion !== undefined) fd.append("descripcion", String(payload.descripcion));
    if (payload.precio !== undefined) fd.append("precio", String(Number(payload.precio)));
    if (payload.status !== undefined) fd.append("activo", String(Boolean(payload.status)));
    if (payload.categoriaId !== undefined) fd.append("categoriaId", String(Number(payload.categoriaId)));
    if (payload.fechaelaboracion) fd.append("fechaelaboracion", payload.fechaelaboracion);
    if (payload.fechaVencimiento) fd.append("fechaVencimiento", payload.fechaVencimiento);

    if (Array.isArray(payload.depositos)) {
      fd.append(
        "depositos",
        JSON.stringify(
          payload.depositos.map(d => ({
            IdDeposito: Number(d.IdDeposito),
            cantidad: Number(d.cantidad),
          }))
        )
      );
    }

    // Debe coincidir con FileInterceptor('image')
    fd.append("image", payload.image as File);

    res = await fetch(`${PRODUCT_URL}/${id}`, {
      method: "PATCH",
      body: fd,
    });
  } else {
    // JSON
    res = await fetch(`${PRODUCT_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: payload.nombre,
        precio: payload.precio,
        descripcion: payload.descripcion,
        activo: payload.status,             // back espera 'activo'
        categoriaId: payload.categoriaId,
        depositos: payload.depositos?.map(d => ({
          IdDeposito: Number(d.IdDeposito),
          cantidad: Number(d.cantidad),
        })),
        fechaelaboracion: payload.fechaelaboracion,
        fechaVencimiento: payload.fechaVencimiento,
      }),
    });
  }

  if (!res.ok) throw new Error(`Error actualizando producto: ${await res.text()}`);

  // Devolvemos el consolidado desde findOne
  const after = await getProductById(id);
  return after;
}
