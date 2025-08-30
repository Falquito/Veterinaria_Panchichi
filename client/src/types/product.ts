export interface Product {
  imagen: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  deposito: string;
  descripcion: string;
  estado: {
    label: string;
    color: string;
  };
}
