import { Plus, Settings } from "lucide-react";
import { Modal, ModalTrigger, ModalBody, ModalContent } from "../ui/animated-modal";
import { NewProductForm } from "../NewProductForm";
import CategoryManager from "../CategoryManager";

export function ProductHeader() {


  return (
    <div className="mb-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Productos</h1>
            <p className="text-gray-600">Gestiona tu inventario de productos veterinarios</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Gestionar categorías */}
            <Modal>
              <ModalTrigger
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-[.98] w-full lg:w-auto justify-center"
                aria-label="Gestionar categorías"
              >
                <Settings className="w-4 h-4 text-black" />
                <span className="text-black">Gestionar Categorías</span>
              </ModalTrigger>
              <ModalBody>
                <ModalContent>
                 <CategoryManager/>
                </ModalContent>
              </ModalBody>
            </Modal>

            {/* Nuevo producto */}
            <Modal>
              <ModalTrigger className="inline-flex items-center gap-2 rounded-lg bg-black hover:bg-gray-800 text-white px-4 py-3 lg:py-2.5 text-sm font-medium transition-colors duration-200 w-full lg:w-auto justify-center">
                <Plus className="w-4 h-4" />
                <span className="lg:hidden">Agregar Producto</span>
                <span className="hidden lg:inline">Nuevo Producto</span>
              </ModalTrigger>
              <ModalBody>
                <ModalContent>
                  <NewProductForm />
                </ModalContent>
              </ModalBody>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}