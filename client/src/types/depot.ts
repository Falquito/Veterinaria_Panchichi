// client/src/types/depot.ts
export interface Depot {
  id_deposito: number;
  nombre: string;
  direccion: string;
  activo?: boolean;
}

// Interface para el payload de creación, sin el ID
export interface NewDepotPayload {
  nombre: string;
  direccion: string;
  activo?: boolean;
}



export interface UpdateDepotPayload {
  nombre: string;
  direccion: string;
  activo?: boolean;
}

