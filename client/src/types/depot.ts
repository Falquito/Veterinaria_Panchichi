// client/src/types/depot.ts
export interface Depot {
  id_deposito: number;
  nombre: string;
  direccion: string;
}

// Interface para el payload de creación, sin el ID
export interface NewDepotPayload {
  nombre: string;
  direccion: string;
}

// Interface para el payload de actualización (todos los campos son opcionales)
export type UpdateDepotPayload = Partial<NewDepotPayload>;