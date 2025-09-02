
import { ProductHeader } from "../components/products/ProductHeader";
import { ProductMetrics } from "../components/products/ProductMetrics";
import { ProductFilters } from "../components/products/ProductFilters";
import { ProductTable } from "../components/products/ProductTable";
import { ProductGrid } from "../components/products/ProductGrid";
import { ProductEmptyState } from "../components/products/ProductEmptyState";
import { useProducts } from "../hooks/useProducts";

export default function Products() {
  const {
    search,
    setSearch,
    category,
    setCategory,
    stockFilter,
    setStockFilter,
    viewMode,
    setViewMode,
    categories,
    filtered,
    metrics
  } = useProducts();

  return (
    <div className="min-h-screen bg-gray-100 p-6 ">
      <ProductHeader />
      <ProductMetrics {...metrics} />
      
      <ProductFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        categories={categories}
        filteredCount={filtered.length}
        totalCount={metrics.total}
      />

      {/* Vista de productos */}
      {filtered.length > 0 ? (
        viewMode === "list" ? (
          <ProductTable products={filtered} />
        ) : (
          <ProductGrid products={filtered} />
        )
      ) : (
        <ProductEmptyState />
      )}
    </div>
  );
}


