import { Layout } from "./components/Layout"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Products from "./pages/Product"
import Depositos from "./pages/Depot"
import MovimientosFrontend from "./pages/Movimientos.jsx"
import OrdenDeCompraGenerator from "./pages/OrdenDeCompra.js"
import Movimientos from "./pages/movimientos.jsx"

function App() {

  return (
    <>
      <BrowserRouter >
        <Routes >
          <Route path="/" element={<Layout  />}>
            <Route index element={<Navigate to="/productos" replace />} />
            <Route path="productos" element={<Products />} />
            <Route path="depositos" element={<Depositos />} />
            <Route path="movimientos" element={<Movimientos/>} />
            <Route path="orden-de-compra" element={<OrdenDeCompraGenerator/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
