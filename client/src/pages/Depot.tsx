import { Modal, ModalTrigger, ModalBody, ModalContent } from "../components/ui/animated-modal";
import { Plus } from "lucide-react";

export default function Depositos() {
  const datos = [
    { nombre: "Depósito Central", ubicacion: "Buenos Aires, Argentina", capacidadPct: 85, usado: 8500, total: 10000, responsable: "Juan Pérez", estado: { label: "Activo", color: "bg-green-100 text-green-700" } },
    { nombre: "Depósito Norte", ubicacion: "Córdoba, Argentina", capacidadPct: 62, usado: 4650, total: 7500, responsable: "María González", estado: { label: "Activo", color: "bg-green-100 text-green-700" } },
    { nombre: "Depósito Sur", ubicacion: "Mendoza, Argentina", capacidadPct: 94, usado: 4700, total: 5000, responsable: "Carlos Rodríguez", estado: { label: "Mantenimiento", color: "bg-orange-100 text-orange-700" } },
  ];

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Depósitos</h2>
          <p className="text-sm text-neutral-500">Gestiona tus centros de almacenamiento</p>
        </div>
<div className="flex items-center gap-3 w-full lg:w-auto">
            <Modal>
              <ModalTrigger className="inline-flex items-center gap-2 rounded-lg bg-black hover:bg-gray-800 text-white px-4 py-3 lg:py-2.5 text-sm font-medium transition-colors duration-200 w-full lg:w-auto justify-center">
                <Plus className="w-4 h-4" />
                <span className="lg:hidden">Agregar Producto</span>
                <span className="hidden lg:inline">Nuevo Depósito</span>
              </ModalTrigger>
              <ModalBody>
                <ModalContent>
                 <h1>Formulario para cargar Depositos.... </h1>{ /*DepotForm*/}
                </ModalContent>
              </ModalBody>
            </Modal>
          </div>     
           </div>

      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="p-4 border-b border-neutral-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-base font-semibold">Lista de Depósitos</div>
            <p className="text-sm text-neutral-500">{datos.length} depósitos registrados</p>
          </div>
          <div className="w-full md:w-72">
            <input placeholder="Buscar depósitos..." className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="px-4 py-3 font-medium">Depósito</th>
                <th className="px-4 py-3 font-medium">Ubicación</th>
                <th className="px-4 py-3 font-medium">Capacidad</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, i) => (
                <tr key={i} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                  <td className="px-4 py-3">{d.nombre}</td>
                  <td className="px-4 py-3">{d.ubicacion}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-[260px]">
                      <span className="w-10 tabular-nums">{d.capacidadPct}%</span>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${d.capacidadPct < 70 ? 'bg-green-600' : d.capacidadPct < 90 ? 'bg-yellow-500' : 'bg-red-600'}`}
                            style={{ width: `${d.capacidadPct}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-1 tabular-nums">{d.usado.toLocaleString()}/{d.total.toLocaleString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{d.responsable}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md text-xs ${d.estado.color}`}>{d.estado.label}</span></td>
                  <td className="px-4 py-3 text-neutral-500">
                    <button className="px-2 py-1 text-xs rounded-md border border-neutral-300 mr-2">Editar</button>
                    <button className="px-2 py-1 text-xs rounded-md border border-neutral-300">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


