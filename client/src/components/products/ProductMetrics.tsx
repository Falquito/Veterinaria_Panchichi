import { Package, BarChart3, AlertTriangle } from "lucide-react";

interface ProductMetricsProps {
  total: number;
  stockTotal: number;
  bajo: number;
}

export function ProductMetrics({ total, stockTotal, bajo }: ProductMetricsProps) {
  const metrics = [
    { label: "Total Productos", value: String(total), icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Stock Total", value: String(stockTotal), icon: BarChart3, color: "bg-emerald-50 text-emerald-600" },
    { label: "Stock Bajo", value: String(bajo), icon: AlertTriangle, color: "bg-amber-50 text-amber-600" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((m, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{m.value}</p>
              <p className="text-sm text-gray-600">{m.label}</p>
            </div>
            <div className={`p-3 rounded-lg ${m.color}`}>
              <m.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
