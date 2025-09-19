// client/src/types/depotProducts.ts
export interface ProductInDepot {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  activo: boolean;
  ImagenURL?: string;
  nombreCategoria?: string;
}

export interface DepotWithProducts {
  idDeposito: number;
  nombreDeposito: string;
  productos: ProductInDepot[];
}