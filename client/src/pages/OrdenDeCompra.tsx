import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Send, Building2, Package, Search, X } from 'lucide-react';

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

const API_BASE = 'http://localhost:3000'; // Cambia por tu URL del backend

const OrdenCompraGenerator: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [productosOrden, setProductosOrden] = useState<ProductoOrden[]>([{
    producto: null,
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    subtotal: 0
  }]);
  const [numeroOrden, setNumeroOrden] = useState('');
  
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [indiceProductoActual, setIndiceProductoActual] = useState(0);
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');

  useEffect(() => {
    cargarProveedores();
    cargarProductos();
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
      console.log('📦 Estructura: depósitos -> productos. Cantidad total cruda:', rawList.length);
    }
    else if (Array.isArray(data?.productos)) {
      rawList = data.productos;
      console.log('📦 Estructura: objeto con productos[]. Cantidad:', rawList.length);
    }
    else if (Array.isArray(data)) {
      rawList = data;
      console.log('📦 Estructura: array de productos directo. Cantidad:', rawList.length);
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
        stock: (Number(previo?.stock ?? 0) + Number(r?.stock ?? 0)) || 0, // suma stock si aparece en varios depósitos
        categoria: String(r?.nombreCategoria ?? r?.categoria?.nombre ?? previo?.categoria ?? ''),
      };

      byId.set(id, normalizado);
    }

    const lista = Array.from(byId.values());

   
    setProductos(lista);
    console.log(' Productos normalizados:', lista.slice(0, 3));
  } catch (err: any) {
    console.error('Error cargando productos:', err);
    setError(`Error al cargar productos: ${err?.message ?? err}`);
    setProductos([]);
  }
};



  const seleccionarProveedor = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalProveedorAbierto(false);
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
    setModalProductoAbierto(false);
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
        setSuccess(`Orden de compra creada exitosamente. ID: ${resultado.id_oc}`);
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
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear la orden');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
      console.error('Error:', error);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Compra</h1>
            <div className="text-sm text-gray-500">
              N° {numeroOrden}
            </div>
          </div>
          
          {/* Información del proveedor */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Proveedor
              </h3>
              <button
                onClick={() => setModalProveedorAbierto(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Seleccionar Proveedor
              </button>
            </div>
            
            {proveedorSeleccionado ? (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="font-semibold text-blue-900">{proveedorSeleccionado.nombre}</div>
                <div className="text-sm text-blue-700">
                  CUIT: {proveedorSeleccionado.cuit || 'N/A'} | 
                  Email: {proveedorSeleccionado.email || 'N/A'} | 
                  Tel: {proveedorSeleccionado.telefono || 'N/A'}
                </div>
                {proveedorSeleccionado.direccion && (
                  <div className="text-sm text-blue-700">
                    Dirección: {proveedorSeleccionado.direccion}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 italic">No se ha seleccionado ningún proveedor</div>
            )}
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Productos
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosOrden.map((item, indice) => (
                  <tr key={indice}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setIndiceProductoActual(indice);
                          setBusquedaProducto(''); // Limpiar búsqueda para mostrar todos
                          setModalProductoAbierto(true);
                        }}
                        className="text-left w-full hover:bg-gray-50 p-2 rounded-md border border-gray-200 transition-colors"
                      >
                        {item.producto ? (
                          <div>
                            <div className="font-medium">{item.producto.nombre}</div>
                            <div className="text-sm text-gray-500">{item.descripcion}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic flex items-center">
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
                        className="w-20 p-2 border border-gray-200 rounded-md text-center"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precioUnitario}
                        onChange={(e) => actualizarPrecio(indice, parseFloat(e.target.value) || 0)}
                        className="w-24 p-2 border border-gray-200 rounded-md text-right"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold">
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
          
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={agregarProducto}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar producto
              </button>
              <div className="text-xl font-bold">
                Total: ${calcularTotal().toFixed(2)}
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={crearOrden}
                disabled={loading || !proveedorSeleccionado}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? 'Enviando...' : 'Enviar Orden'}
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

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

        {modalProveedorAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Seleccionar Proveedor</h3>
                  <button
                    onClick={() => setModalProveedorAbierto(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Buscar proveedor..."
                    value={busquedaProveedor}
                    onChange={(e) => setBusquedaProveedor(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-64">
                {proveedoresFiltrados.map((proveedor) => (
                  <div
                    key={proveedor.id_proveedor}
                    onClick={() => seleccionarProveedor(proveedor)}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="font-semibold">{proveedor.nombre}</div>
                    <div className="text-sm text-gray-500">
                      CUIT: {proveedor.cuit || 'N/A'} | Email: {proveedor.email || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Selección de Producto */}
        {modalProductoAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Seleccionar Producto</h3>
                  <button
                    onClick={() => setModalProductoAbierto(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre del producto..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {busquedaProducto && (
                    <button
                      onClick={() => setBusquedaProducto('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Mostrando {productosFiltrados.length} de {productos.length} productos
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
                {productosFiltrados.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {productosFiltrados.map((producto) => (
                      <div
                        key={producto.id}
                        onClick={() => seleccionarProducto(producto)}
                        className="p-4 hover:bg-blue-50 cursor-pointer transition-colors border-l-4 border-l-transparent hover:border-l-blue-500"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{producto.nombre}</div>
                            {producto.descripcion && (
                              <div className="text-sm text-gray-600 mt-1">{producto.descripcion}</div>
                            )}
                            {producto.categoria && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                                {producto.categoria}
                              </span>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-green-600">${producto.precio.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">Stock: {producto.stock}</div>
                            {producto.stock > 0 ? (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                                Disponible
                              </span>
                            ) : (
                              <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                                Sin stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <div className="text-lg font-medium">No se encontraron productos</div>
                    <div className="text-sm">
                      {busquedaProducto 
                        ? 'Intenta con otros términos de búsqueda' 
                        : 'No hay productos disponibles'
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenCompraGenerator;