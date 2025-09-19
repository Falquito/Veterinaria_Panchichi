// src/pages/Products.tsx - Actualización
import { useState } from "react";
import type { Product } from "../types/product";
import { ProductHeader } from "../components/products/ProductHeader";
import { ProductMetrics } from "../components/products/ProductMetrics";
import { ProductFilters } from "../components/products/ProductFilters";
import { ProductTable } from "../components/products/ProductTable";
import { ProductGrid } from "../components/products/ProductGrid";
import EditProductDialog from "../components/modals/EditProductModal";
import ProductWarehousesModal from "../components/modals/ProductWarehousesModal"; // Nuevo import
import { useProducts, type StatusFilter } from "../hooks/useProducts";

import { Modal, ModalBody, ModalContent, useModal } from "../components/ui/animated-modal";

export default function Products() {
  return (
    <Modal>
      <ProductsContent />
    </Modal>
  );
}

// 👇 El hook useModal se usa DENTRO del Provider
function ProductsContent() {
  const {
    search, setSearch,
    category, setCategory,
    stockFilter, setStockFilter,
    viewMode, setViewMode,
    categories, filtered, metrics,
    refresh,                                
  } = useProducts();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Activos");
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewingWarehouses, setViewingWarehouses] = useState<Product | null>(null); // Nuevo estado

  const { setOpen } = useModal();
const [modalView, setModalView] = useState<'edit' | 'warehouses' | null>(null);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("Todos");
    setStockFilter("Todos");
  };

  const onEdit = (p: Product) => {
  setEditing(p);
  setModalView('edit');
  setOpen(true);
};

const onViewWarehouses = (p: Product) => {
  setViewingWarehouses(p);
  setModalView('warehouses');
  setOpen(true);
};

const closeModal = () => {
  setModalView(null);
  setEditing(null);
  setViewingWarehouses(null);
  setOpen(false);
};
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey(k => k + 1);

  const handleUpdated = () => {
    refresh();                              
    bump();                               
    setOpen(false);                     
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
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
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {viewMode === "list" ? (
        <ProductTable
          search={search}
          category={category}
          stockFilter={stockFilter}
          statusFilter={statusFilter}
          onClearFilters={handleClearFilters}
          onEdit={onEdit}                     
          onViewWarehouses={onViewWarehouses} 
          refreshKey={refreshKey}              
        />
      ) : (
        <ProductGrid
          search={search}
          category={category}
          stockFilter={stockFilter}
          statusFilter={statusFilter}
          onClearFilters={handleClearFilters}
          onEdit={onEdit}                      
          onViewWarehouses={onViewWarehouses} 
          refreshKey={refreshKey}              
        />
      )}

    <ModalBody>
  <ModalContent>
    {modalView === 'edit' && editing && (
      <EditProductDialog product={editing} onUpdated={handleUpdated} />
    )}
    {modalView === 'warehouses' && viewingWarehouses && (
      <ProductWarehousesModal  
        product={viewingWarehouses}
        onClose={closeModal}
      />
    )}
  </ModalContent>
</ModalBody>
    </div>
  );
}