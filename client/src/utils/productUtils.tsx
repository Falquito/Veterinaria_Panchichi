import { 
  Package, 
  ShoppingCart, 
  Pill, 
  Stethoscope,
  AlertTriangle, 
  CheckCircle, 
  XCircle 
} from "lucide-react";

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Alimentos": return <ShoppingCart className="w-4 h-4" />;
    case "Medicamentos": return <Pill className="w-4 h-4" />;
    case "Equipamiento": return <Stethoscope className="w-4 h-4" />;
    default: return <Package className="w-4 h-4" />;
  }
};

export const getStockColor = (stock: number) => {
  if (stock === 0) return "text-red-600";
  if (stock <= 5) return "text-amber-600";
  return "text-emerald-600";
};

export const getStockIcon = (stock: number) => {
  if (stock === 0) return <XCircle className="w-4 h-4" />;
  if (stock <= 5) return <AlertTriangle className="w-4 h-4" />;
  return <CheckCircle className="w-4 h-4" />;
};
