import type { DepotWithProducts, ProductInDepot } from '../types/depotProducts';

const BASE = import.meta.env.VITE_API_URL ?? '';

async function asJson(res: Response) {
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.slice(0,200)}`);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    const t = await res.text();
    throw new Error(`Respuesta no-JSON (${ct}). Inicio: ${t.slice(0,200)}`);
  }
  return res.json();
}

export async function getDepotsWithProducts(): Promise<DepotWithProducts[]> {
  const res = await fetch(`${BASE}/productos`, { 
    headers: { Accept: 'application/json' } 
  });
  const data = await asJson(res);
  return data as DepotWithProducts[];
}

export async function getDepotProducts(depotId: number): Promise<ProductInDepot[]> {
  const depotsWithProducts = await getDepotsWithProducts();
  const depot = depotsWithProducts.find(d => d.idDeposito === depotId);
  return depot?.productos || [];
}