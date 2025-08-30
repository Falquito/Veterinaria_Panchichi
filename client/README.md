# 📦 Sistema-de-Gestion-Integral-para-Veterinaria - Frontend



### 1. División en Componentes Pequeños
- **ProductHeader** – Encabezado con título y botón de nuevo producto  
- **ProductMetrics** – Dashboard con métricas (total, stock, stock bajo)  
- **ProductFilters** – Filtros de búsqueda, categoría y vista  
- **ProductTable** – Vista de tabla de productos  
- **ProductGrid** – Vista de cuadrícula de productos  
- **ProductCard** – Tarjeta individual de producto  
- **ProductEmptyState** – Estado cuando no hay productos  

### 2. Separación de Responsabilidades
- **Tipos**: `types/product.ts` – Interface Product  
- **Utilidades**: `utils/productUtils.tsx` – Funciones helper (iconos, colores)  
- **Datos**: `data/products.ts` – Datos simulados de productos  
- **Lógica**: `hooks/useProducts.ts` – Hook personalizado para estado y filtrado  

### 3. Hook Personalizado
- **useProducts** – Encapsula la lógica de gestión de productos y filtrado  

---

## 📂 Estructura de Carpetas
```bash
src/
├── components/products/
│   ├── ProductHeader.tsx
│   ├── ProductMetrics.tsx
│   ├── ProductFilters.tsx
│   ├── ProductTable.tsx
│   ├── ProductGrid.tsx
│   ├── ProductCard.tsx
│   ├── ProductEmptyState.tsx
│   └── index.ts
├── types/product.ts
├── utils/productUtils.tsx
├── data/products.ts
├── hooks/useProducts.ts
└── pages/Product.tsx

