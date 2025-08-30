import type { Product } from "../types/product";

export const products: Product[] = [
  {
    imagen: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=64&h=64&fit=crop&auto=format",
    nombre: "Alimento Balanceado Adulto - 3kg",
    categoria: "Alimentos",
    precio: 4500.00,
    stock: 12,
    deposito: "Depósito Central",
    descripcion: "Alimento balanceado completo para perros adultos. Fórmula rica en proteínas y vitaminas para mantener la salud y el brillo del pelaje.",
    estado: { label: "Activo", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  },
  {
    imagen: "https://images.unsplash.com/photo-1583336661299-2b6b5f0b4b52?w=64&h=64&fit=crop&auto=format",
    nombre: "Vacuna Antirrábica (1 dosis)",
    categoria: "Medicamentos",
    precio: 1200.00,
    stock: 25,
    deposito: "Depósito Veterinaria Norte",
    descripcion: "Dosis única de vacuna antirrábica para perros y gatos. Conservación en frío. Aplicación por personal veterinario.",
    estado: { label: "Activo", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  },
  {
    imagen: "https://images.unsplash.com/photo-1601758123927-59c6b4f7f4f8?w=64&h=64&fit=crop&auto=format",
    nombre: "Antiparasitario Oral - Pastilla",
    categoria: "Medicamentos",
    precio: 650.00,
    stock: 4,
    deposito: "Depósito Central",
    descripcion: "Comprimido antiparasitario de amplio espectro. Indicado para control de nematodos y cestodos en mascotas pequeñas.",
    estado: { label: "Stock Bajo", color: "bg-amber-50 text-amber-700 border-amber-200" }
  },
  {
    imagen: "https://images.unsplash.com/photo-1598133894009-0d6f9b1b2c01?w=64&h=64&fit=crop&auto=format",
    nombre: "Jeringa 5 ml (pack 100)",
    categoria: "Equipamiento",
    precio: 2200.00,
    stock: 40,
    deposito: "Depósito Central",
    descripcion: "Pack de 100 jeringas descartables de 5 ml con aguja. Uso general en clínica veterinaria.",
    estado: { label: "Activo", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  }
];
