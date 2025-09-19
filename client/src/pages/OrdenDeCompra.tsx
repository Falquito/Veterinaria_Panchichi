import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Package, Search, X, Building2, Eye, Calendar, DollarSign } from 'lucide-react';
import { Modal, ModalBody, ModalContent, useModal } from "../components/ui/animated-modal";

// Types
interface Proveedor {
  id_proveedor: number;
  nombre: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  categoria?: string;
}

interface ProductoOrden {
  id?: number;
  producto: Producto | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface CreateOrdenDto {
  proveedorId: number;
  productos: {
    productoId: number;
    cantidad: number;
  }[];
}

interface OrdenDeCompra {
  id_oc: number;
  fecha: string;
  total: string;
  productos: {
    id: number;
    cantidad: number;
    producto: {
      id: number;
      nombre: string;
      descripcion: string;
      precio: number;
      categoria: {
        nombre: string;
      };
    };
  }[];
  proveedor: {
    id_proveedor: number;
    nombre: string;
    cuit?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  };
}

const API_BASE = 'http://localhost:3000';

export default function OrdenCompraSystem() {
  return (
    <Modal>
      <OrdenCompraContent />
    </Modal>
  );
}

function OrdenCompraContent() {
  // Estados principales
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Estados para vistas
  const [vistaActual, setVistaActual] = useState<'lista' | 'nueva'>('lista');

  // Estados del formulario
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [productosOrden, setProductosOrden] = useState<ProductoOrden[]>([{
    producto: null,
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    subtotal: 0
  }]);
  const [numeroOrden, setNumeroOrden] = useState('');
  
  // Estados para modales animados
  const [modalView, setModalView] = useState<'proveedor' | 'producto' | null>(null);
  const [indiceProductoActual, setIndiceProductoActual] = useState(0);
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');

  // Estados para modal de detalles (mantener el modal básico)
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenDeCompra | null>(null);

  const { setOpen } = useModal();

  const verDetallesOrden = (orden: OrdenDeCompra) => {
    setOrdenSeleccionada(orden);
    setModalDetallesAbierto(true);
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarProveedores();
    cargarProductos();
    cargarOrdenes();
    generarNumeroOrden();
  }, []);

  const generarNumeroOrden = () => {
    const fecha = new Date();
    const timestamp = Date.now().toString().slice(-6);
    setNumeroOrden(`OC-${fecha.getFullYear()}-${timestamp}`);
  };

  const cargarProveedores = async () => {
    try {
      const response = await fetch(`${API_BASE}/proveedores?limit=100`);
      const data = await response.json();
      setProveedores(data.items || data || []);
    } catch (error) {
      setError('Error al cargar proveedores');
      console.error('Error:', error);
    }
  };

  const cargarProductos = async () => {
  try {
    const res = await fetch(`${API_BASE}/productos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();

    let rawList: any[] = [];

    if (Array.isArray(data) && data.length && Array.isArray(data[0]?.productos)) {
      rawList = data.flatMap((dep: any) => Array.isArray(dep?.productos) ? dep.productos : []);
    }
    else if (Array.isArray(data?.productos)) {
      rawList = data.productos;
    }
    else if (Array.isArray(data)) {
      rawList = data;
    }
    else {
      console.error('❌ Estructura no reconocida:', data);
      setProductos([]);
      setError('No se encontraron productos en la respuesta del servidor');
      return;
    }

    const byId = new Map<number, Producto>();
    for (const r of rawList) {
      const id = Number(r?.id ?? 0);
      if (!id) continue;

      const previo = byId.get(id);

      const normalizado: Producto = {
        id,
        nombre: String(r?.nombre ?? previo?.nombre ?? '').trim() || `Producto #${id}`,
        descripcion: String(r?.descripcion ?? previo?.descripcion ?? ''),
        precio: Number(r?.precio ?? previo?.precio ?? 0),
        stock: (Number(previo?.stock ?? 0) + Number(r?.stock ?? 0)) || 0,
        categoria: String(r?.nombreCategoria ?? r?.categoria?.nombre ?? previo?.categoria ?? ''),
      };

      byId.set(id, normalizado);
    }

    const lista = Array.from(byId.values());
    setProductos(lista);
  } catch (err: any) {
    console.error('Error cargando productos:', err);
    setError(`Error al cargar productos: ${err?.message ?? err}`);
    setProductos([]);
  }
};

  const cargarOrdenes = async () => {
    try {
      const response = await fetch(`${API_BASE}/orden-de-compra`);
      const data = await response.json();
      setOrdenes(data || []);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    }
  };

  const seleccionarProveedor = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setOpen(false);
    setModalView(null);
  };

  const seleccionarProducto = (producto: Producto) => {
    const nuevosProductos = [...productosOrden];
    nuevosProductos[indiceProductoActual] = {
      ...nuevosProductos[indiceProductoActual],
      producto,
      descripcion: producto.descripcion || producto.nombre,
      precioUnitario: producto.precio,
      subtotal: nuevosProductos[indiceProductoActual].cantidad * producto.precio
    };
    setProductosOrden(nuevosProductos);
    setOpen(false);
    setModalView(null);
  };

  const abrirModalProveedor = () => {
    setModalView('proveedor');
    setBusquedaProveedor('');
    setOpen(true);
  };

  const abrirModalProducto = (indice: number) => {
    setIndiceProductoActual(indice);
    setBusquedaProducto('');
    setModalView('producto');
    setOpen(true);
  };

  const actualizarCantidad = (indice: number, cantidad: number) => {
    const nuevosProductos = [...productosOrden];
    nuevosProductos[indice].cantidad = cantidad;
    nuevosProductos[indice].subtotal = cantidad * nuevosProductos[indice].precioUnitario;
    setProductosOrden(nuevosProductos);
  };

  const actualizarPrecio = (indice: number, precio: number) => {
    const nuevosProductos = [...productosOrden];
    nuevosProductos[indice].precioUnitario = precio;
    nuevosProductos[indice].subtotal = nuevosProductos[indice].cantidad * precio;
    setProductosOrden(nuevosProductos);
  };

  const agregarProducto = () => {
    setProductosOrden([...productosOrden, {
      producto: null,
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    }]);
  };

  const eliminarProducto = (indice: number) => {
    if (productosOrden.length > 1) {
      setProductosOrden(productosOrden.filter((_, i) => i !== indice));
    }
  };

  const calcularTotal = () => {
    return productosOrden.reduce((total, item) => total + item.subtotal, 0);
  };

  const crearOrden = async () => {
    if (!proveedorSeleccionado) {
      setError('Debe seleccionar un proveedor');
      return;
    }

    const productosValidos = productosOrden.filter(p => p.producto && p.cantidad > 0);
    if (productosValidos.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }

    setLoading(true);
    setError('');

    const ordenDto: CreateOrdenDto = {
      proveedorId: proveedorSeleccionado.id_proveedor,
      productos: productosValidos.map(p => ({
        productoId: p.producto!.id,
        cantidad: p.cantidad
      }))
    };

    try {
      const response = await fetch(`${API_BASE}/orden-de-compra`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenDto)
      });

      if (response.ok) {
        const resultado = await response.json();
        setSuccess(`Orden de compra registrada exitosamente. ID: ${resultado.id_oc}`);
        // Resetear formulario
        setProveedorSeleccionado(null);
        setProductosOrden([{
          producto: null,
          descripcion: '',
          cantidad: 1,
          precioUnitario: 0,
          subtotal: 0
        }]);
        generarNumeroOrden();
        // Recargar órdenes
        cargarOrdenes();
        // Volver a la vista de lista
        setTimeout(() => setVistaActual('lista'), 2000);
      } else {
        const errorText = await response.text();
        setError(`Error del servidor: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setError(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => 
    p.activo && p.nombre?.toLowerCase().includes(busquedaProveedor.toLowerCase())
  );

  const productosFiltrados = productos.filter(p => 
    p.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w mx-auto">
        {/* Header con navegación mejorado */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Órdenes de Compra</h1>
              <p className="text-gray-600">Gestiona y registra las órdenes de compra de tu inventario</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setVistaActual('lista')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  vistaActual === 'lista' 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Eye className="mr-2 h-5 w-5 inline" />
                Ver Órdenes
              </button>
              <button
                onClick={() => setVistaActual('nueva')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  vistaActual === 'nueva' 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Plus className="mr-2 h-5 w-5 inline" />
                Nueva Orden
              </button>
            </div>
          </div>
        </div>

        {/* Vista de Lista de Órdenes (versión original mejorada) */}
        {vistaActual === 'lista' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium">Historial de Órdenes</h3>
              <p className="text-sm text-gray-500 mt-1">{ordenes.length} órdenes registradas</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordenes.map((orden) => (
                    <tr key={orden.id_oc} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="font-medium text-gray-900">#{orden.id_oc}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {orden.fecha}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{orden.proveedor.nombre}</div>
                          <div className="text-sm text-gray-500">{orden.proveedor.cuit}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {orden.productos.map((item, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{item.producto.nombre}</span>
                              <span className="text-gray-500 ml-2">x{item.cantidad}</span>
                              {item.producto.categoria && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                                  {item.producto.categoria.nombre}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <span className="font-semibold text-gray-900">${parseFloat(orden.total).toFixed(2)}</span>
                        </div>
                      </td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {ordenes.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <div className="text-lg font-medium">No hay órdenes registradas</div>
                  <div className="text-sm">Crea tu primera orden de compra haciendo clic en "Nueva Orden"</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista de Nueva Orden */}
        {vistaActual === 'nueva' && (
          <>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-gray-900">Nueva Orden de Compra</h2>
                <div className="text-sm text-gray-500">
                  N° {numeroOrden}
                </div>
              </div>
              
              {/* Información del proveedor */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    Proveedor
                  </h3>
                  <button
                    onClick={abrirModalProveedor}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg font-medium"
                  >
                    <Building2 className="mr-2 h-5 w-5 inline" />
                    Seleccionar Proveedor
                  </button>
                </div>
                
                {proveedorSeleccionado ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="font-medium text-gray-900 mb-2">{proveedorSeleccionado.nombre}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• CUIT: {proveedorSeleccionado.cuit || 'No disponible'}</div>
                      <div>• Email: {proveedorSeleccionado.email || 'No disponible'}</div>
                      <div>• Teléfono: {proveedorSeleccionado.telefono || 'No disponible'}</div>
                      {proveedorSeleccionado.direccion && (
                        <div>• Dirección: {proveedorSeleccionado.direccion}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <div className="text-gray-500 font-medium">No se ha seleccionado ningún proveedor</div>
                    <div className="text-sm text-gray-400 mt-1">Haz clic en "Seleccionar Proveedor" para comenzar</div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de productos */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Productos
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productosOrden.map((item, indice) => (
                      <tr key={indice} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => abrirModalProducto(indice)}
                            className="text-left w-full p-3 border border-gray-300 rounded-md hover:border-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
                          >
                            {item.producto ? (
                              <div>
                                <div className="font-medium text-gray-900">{item.producto.nombre}</div>
                                <div className="text-sm text-gray-500">{item.descripcion}</div>
                                {item.producto.categoria && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                    {item.producto.categoria}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-500 flex items-center">
                                <Package className="mr-2 h-4 w-4" />
                                Seleccionar producto...
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => actualizarCantidad(indice, parseInt(e.target.value) || 0)}
                            className="w-20 p-2 border border-gray-300 rounded-md text-center focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.precioUnitario}
                            onChange={(e) => actualizarPrecio(indice, parseFloat(e.target.value) || 0)}
                            className="w-24 p-2 border border-gray-300 rounded-md text-right focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            disabled={!!item.producto}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          ${item.subtotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => eliminarProducto(indice)}
                            disabled={productosOrden.length === 1}
                            className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={agregarProducto}
                    className="flex items-center text-black hover:text-gray-800 font-medium border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar producto
                  </button>
                  <div className="bg-black text-white px-6 py-3 rounded-lg">
                    <div className="text-sm opacity-80">Total de la Orden</div>
                    <div className="text-2xl font-bold">
                      ${calcularTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={crearOrden}
                    disabled={loading || !proveedorSeleccionado}
                    className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-lg transition-colors"
                  >
                    {loading ? 'Registrando...' : 'Registrar Orden'}
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 font-medium border border-gray-300 transition-colors">
                    <Download className="mr-2 h-4 w-4 inline" />
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Alertas */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Modal de Detalles de Orden */}
        {modalDetallesAbierto && ordenSeleccionada && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-black px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    <div>
                      <h3 className="text-lg font-medium">Detalles de Orden #{ordenSeleccionada.id_oc}</h3>
                      <p className="text-gray-300 text-sm">Información completa de la orden de compra</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalDetallesAbierto(false)}
                    className="text-white hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Información de la orden */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Información de la Orden
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID de Orden:</span>
                        <span className="font-medium">#{ordenSeleccionada.id_oc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-medium">{ordenSeleccionada.fecha}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-green-600 text-lg">
                          ${parseFloat(ordenSeleccionada.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información del proveedor */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Proveedor
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 block">Nombre:</span>
                        <span className="font-medium">{ordenSeleccionada.proveedor.nombre}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">CUIT:</span>
                        <span className="font-medium">{ordenSeleccionada.proveedor.cuit || 'No disponible'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">Email:</span>
                        <span className="font-medium">{ordenSeleccionada.proveedor.email || 'No disponible'}</span>
                      </div>
                      {ordenSeleccionada.proveedor.telefono && (
                        <div>
                          <span className="text-gray-600 block">Teléfono:</span>
                          <span className="font-medium">{ordenSeleccionada.proveedor.telefono}</span>
                        </div>
                      )}
                      {ordenSeleccionada.proveedor.direccion && (
                        <div>
                          <span className="text-gray-600 block">Dirección:</span>
                          <span className="font-medium">{ordenSeleccionada.proveedor.direccion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Productos Ordenados
                  </h4>
                  <div className="space-y-4">
                    {ordenSeleccionada.productos.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.producto.nombre}</h5>
                            {item.producto.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{item.producto.descripcion}</p>
                            )}
                            {item.producto.categoria && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                                {item.producto.categoria.nombre}
                              </span>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm text-gray-600">Cantidad</div>
                            <div className="font-bold text-lg">{item.cantidad}</div>
                            <div className="text-sm text-gray-600">Precio: ${item.producto.precio.toFixed(2)}</div>
                            <div className="font-medium text-green-600">
                              Subtotal: ${(item.cantidad * item.producto.precio).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen */}
                <div className="mt-6 bg-black text-white rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-semibold">Total de la Orden</h4>
                      <p className="text-gray-300 text-sm">
                        {ordenSeleccionada.productos.length} producto(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${parseFloat(ordenSeleccionada.total).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-6 flex justify-end space-x-4">
                  <button 
                    onClick={() => setModalDetallesAbierto(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <Download className="mr-2 h-4 w-4 inline" />
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Animado para Proveedores y Productos */}
      <ModalBody>
        <ModalContent>
          {modalView === 'proveedor' && (
            <div className="w-full max-w-2xl">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Building2 className="h-6 w-6 mr-3 text-gray-700" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Seleccionar Proveedor</h3>
                    <p className="text-gray-600">Elige el proveedor para tu orden de compra</p>
                  </div>
                </div>
                
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, CUIT, email..."
                    value={busquedaProveedor}
                    onChange={(e) => setBusquedaProveedor(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  {proveedoresFiltrados.length} de {proveedores.length} proveedores
                </div>
              </div>

              {/* Lista de proveedores */}
              <div className="max-h-96 overflow-y-auto">
                {proveedoresFiltrados.length > 0 ? (
                  <div className="space-y-3">
                    {proveedoresFiltrados.map((proveedor) => (
                      <div
                        key={proveedor.id_proveedor}
                        onClick={() => seleccionarProveedor(proveedor)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                      >
                        <div className="flex items-start">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <Building2 className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{proveedor.nombre}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              CUIT: {proveedor.cuit || 'N/A'} • {proveedor.email || 'Sin email'}
                            </div>
                            {proveedor.direccion && (
                              <div className="text-sm text-gray-500">{proveedor.direccion}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <div className="text-lg font-medium">No se encontraron proveedores</div>
                    <div className="text-sm">Intenta con otros términos de búsqueda</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {modalView === 'producto' && (
            <div className="w-full max-w-5xl">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Package className="h-6 w-6 mr-3 text-gray-700" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Catálogo de Productos</h3>
                    <p className="text-gray-600">Selecciona los productos para tu orden</p>
                  </div>
                </div>
                
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre, categoría, descripción..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>{productosFiltrados.length} de {productos.length} productos</span>
                  <span>Disponibles: {productosFiltrados.filter(p => p.stock > 0).length} • Sin stock: {productosFiltrados.filter(p => p.stock === 0).length}</span>
                </div>
              </div>

              {/* Grid de productos */}
              <div className="max-h-96 overflow-y-auto">
                {productosFiltrados.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productosFiltrados.map((producto) => (
                      <div
                        key={producto.id}
                        onClick={() => seleccionarProducto(producto)}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{producto.nombre}</h4>
                            {producto.descripcion && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{producto.descripcion}</p>
                            )}
                            {producto.categoria && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {producto.categoria}
                              </span>
                            )}
                          </div>
                          <div className="ml-2">
                            {producto.stock > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Disponible
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Sin stock
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <div className="text-lg font-semibold text-gray-700">
                            ${producto.precio.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Stock: {producto.stock}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                    <p className="text-gray-500">
                      {busquedaProducto 
                        ? 'Intenta con otros términos de búsqueda' 
                        : 'No hay productos disponibles'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalContent>
      </ModalBody>
    </div>
  );
}