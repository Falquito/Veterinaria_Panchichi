// client/src/services/depotService.ts
import type { Depot, NewDepotPayload, UpdateDepotPayload } from '../types/depot';

const BASE = import.meta.env.VITE_API_URL ?? ''; // ej: 'http://localhost:3000'

async function asJson(res: Response) {
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTPS ${res.status}: ${t.slice(0,200)}`);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    const t = await res.text();
    throw new Error(`Respuesta no-JSON (${ct}). Inicio: ${t.slice(0,200)}`);
  }
  return res.json();
}

export async function listDepots(): Promise<Depot[]> {
  const res  = await fetch(`${BASE}/depositos`, { headers: { Accept: 'application/json' } });
  const json = await asJson(res);

  // Tu findAll devuelve: { items, total, page, limit, pages }
  // Normalizamos a array:
  const arr = Array.isArray(json) ? json :
              Array.isArray(json?.items) ? json.items :
              [];
  return arr as Depot[];
}

export async function createDepot(data: NewDepotPayload) {
  const res = await fetch(`${BASE}/depositos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  return asJson(res);
}

export async function updateDepot(id: number, data: UpdateDepotPayload) {
  const res = await fetch(`${BASE}/depositos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  return asJson(res);
}

export async function deleteDepot(id: number) {
  const res = await fetch(`${BASE}/depositos/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' } });
  return asJson(res);
}
