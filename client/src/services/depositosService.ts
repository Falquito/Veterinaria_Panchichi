// src/services/depositosService.ts
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Deposito {
  id_deposito: number;
  nombre: string;
  direccion?: string;
  activo?: boolean;
}

export interface DepositosResponse {
  items: Deposito[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const depositosService = {
  async getAll(opts?: {
    q?: string;
    page?: number;
    limit?: number;
    includeInactive?: boolean; // 👈 nuevo
  }): Promise<Deposito[]> {
    const params = new URLSearchParams();
    if (opts?.q) params.append("q", opts.q);
    if (opts?.page) params.append("page", String(opts.page));
    if (opts?.limit) params.append("limit", String(opts.limit));
    if (opts?.includeInactive) params.append("includeInactive", "true");

    const url = `${API_BASE}/depositos${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status} obteniendo depósitos`);

    const data = await res.json();

    // Backend puede devolver paginado ({items,...}) o array directo
    if (data?.items && Array.isArray(data.items)) {
      return opts?.includeInactive ? data.items : data.items.filter((d: Deposito) => d.activo !== false);
    }
    if (Array.isArray(data)) {
      return opts?.includeInactive ? data : data.filter((d: Deposito) => d.activo !== false);
    }
    throw new Error("Formato inesperado de respuesta de /depositos");
  },

  // Si alguna vista necesita la respuesta paginada completa:
  async getPaged(opts?: {
    q?: string;
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<DepositosResponse> {
    const params = new URLSearchParams();
    if (opts?.q) params.append("q", opts.q);
    if (opts?.page) params.append("page", String(opts.page));
    if (opts?.limit) params.append("limit", String(opts.limit));
    if (opts?.includeInactive) params.append("includeInactive", "true");

    const url = `${API_BASE}/depositos${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status} obteniendo depósitos`);

    const data = await res.json();
    if (data?.items && typeof data.total === "number") {
      return data as DepositosResponse;
    }
    // Normalizamos si el backend devolviera un array simple
if (Array.isArray(data)) {
  // Evitamos TS5076 y calculamos un límite razonable
  const computedLimit =
    typeof opts?.limit === "number" && !Number.isNaN(opts.limit)
      ? opts.limit
      : (data.length || 10);

  return {
    items: data as Deposito[],
    total: data.length,
    page: Number(opts?.page ?? 1),
    limit: Number(computedLimit),
    pages: Math.max(1, Math.ceil(data.length / Number(computedLimit))),
  };
}
    throw new Error("Formato inesperado de respuesta de /depositos");
  },

  async getById(id: string | number): Promise<Deposito> {
    const res = await fetch(`${API_BASE}/depositos/${id}`);
    if (!res.ok) throw new Error(`Error ${res.status} obteniendo depósito`);
    return (await res.json()) as Deposito;
  },

  async create(deposito: Omit<Deposito, "id_deposito">): Promise<Deposito> {
    const res = await fetch(`${API_BASE}/depositos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deposito),
    });
    if (!res.ok) throw new Error(`Error ${res.status} creando depósito`);
    return (await res.json()) as Deposito;
  },

  async update(id: string | number, updates: Partial<Deposito>): Promise<Deposito> {
    const res = await fetch(`${API_BASE}/depositos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Error ${res.status} actualizando depósito`);
    return (await res.json()) as Deposito;
  },

  async remove(id: string | number): Promise<void> {
    const res = await fetch(`${API_BASE}/depositos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Error ${res.status} eliminando depósito`);
  },

  async restore(id: string | number): Promise<Deposito> {
    const res = await fetch(`${API_BASE}/depositos/${id}/restore`, { method: "PATCH" });
    if (!res.ok) throw new Error(`Error ${res.status} restaurando depósito`);
    return (await res.json()) as Deposito;
  },
};
