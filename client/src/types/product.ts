// types/product.ts - Actualización
export type CategoriaRef =
  | string
  | { id: number; nombre: string; descripcion?: string; createdAt?: string; updatedAt?: string };

// Nuevo tipo para depósitos
export interface ProductDeposito {
  idDeposito: number;
  nombreDeposito: string;
  stock: number;
}

export interface Product {
  id: number;
  imagen: string;
  nombre: string;
  categoria: CategoriaRef;  
  precio: number;
  stock: number;
  deposito: string;
  descripcion: string;
  activo?: boolean;
  estado?: { label: string; color: string };
  depositos?: ProductDeposito[]; // Opcional para compatibilidad
}