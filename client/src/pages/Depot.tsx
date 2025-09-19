// client/src/pages/Depot.tsx - VERSION SIN ANIMACION
import { useState } from "react";
import type { Depot } from "../types/depot";
import { DepotHeader } from "../components/depots/DepotHeader";
import { DepotMetrics } from "../components/depots/DepotMetrics";
import { DepotFilters } from "../components/depots/DepotFilters";
import { DepotTable } from "../components/depots/DepotTable";
import { DepotGrid } from "../components/depots/DepotGrid";
import { DepotForm } from "../components/depots/DepotForm";
import { DepotProductsModal } from "../components/depots/DepotProductsModal";
import { useDepots, type StatusFilter } from "../hooks/useDepots";

import { Modal, ModalBody, ModalContent, useModal } from "../components/ui/animated-modal";

export default function Depots() {
  return (
    <Modal>
      <DepotsContent />
    </Modal>
  );
}

function DepotsContent() {
  const {
    search, setSearch,
    region, setRegion,
    statusFilter, setStatusFilter,
    viewMode, setViewMode,
    regions, filtered, metrics,
    viewingProducts, setViewingProducts,
    refresh,
  } = useDepots();

  const [editing, setEditing] = useState<Depot | null>(null);
  const [modalView, setModalView] = useState<'edit' | 'create' | 'products' | null>(null);
  
  // Estado separado para el modal de productos SIN animación
  const [showProductsModal, setShowProductsModal] = useState(false);

  const { setOpen } = useModal();

  const handleClearFilters = () => {
    setSearch("");
    setRegion("Todos");
    setStatusFilter("Activos");
  };

  const onCreate = () => {
    setEditing(null);
    setModalView('create');
    setOpen(true);
  };

  const onEdit = (depot: Depot) => {
    setEditing(depot);
    setModalView('edit');
    setOpen(true);
  };

  // Nueva función para productos SIN usar el sistema de modales animados
  const onViewProducts = (depot: Depot) => {
    setViewingProducts(depot);
    setShowProductsModal(true); // Usar estado independiente
  };

  const closeModal = () => {
    setModalView(null);
    setEditing(null);
    setViewingProducts(null);
    setOpen(false);
  };

  // Función separada para cerrar modal de productos
  const closeProductsModal = () => {
    setShowProductsModal(false);
    setViewingProducts(null);
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
      <DepotHeader onCreate={onCreate} />
      <DepotMetrics {...metrics} />

      <DepotFilters
        search={search}
        setSearch={setSearch}
        region={region}
        setRegion={setRegion}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        regions={regions}
        filteredCount={filtered.length}
        totalCount={metrics.total}
      />

      {viewMode === "list" ? (
        <DepotTable
          search={search}
          region={region}
          statusFilter={statusFilter}
          onClearFilters={handleClearFilters}
          onEdit={onEdit}
          onViewProducts={onViewProducts}
          refreshKey={refreshKey}
        />
      ) : (
        <DepotGrid
          search={search}
          region={region}
          statusFilter={statusFilter}
          onClearFilters={handleClearFilters}
          onEdit={onEdit}
          onViewProducts={onViewProducts}
          refreshKey={refreshKey}
        />
      )}

      {/* Modal animado para crear/editar */}
      <ModalBody>
        <ModalContent>
          {(modalView === 'edit' || modalView === 'create') && (
            <DepotForm
              onSubmit={handleUpdated}
              initialData={editing}
            />
          )}
        </ModalContent>
      </ModalBody>

      {/* Modal de productos SIN animación - renderizado directamente */}
      {showProductsModal && viewingProducts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <DepotProductsModal  
            depot={viewingProducts}
            onClose={closeProductsModal}
          />
        </div>
      )}
    </div>
  );
}
