import { Layout } from "./components/Layout"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Products from "./pages/Product"
import Depositos from "./pages/Depot"



function App() {

  return (
    <>
      <BrowserRouter >
        <Routes >
          <Route path="/" element={<Layout  />}>
            <Route index element={<Navigate to="/productos" replace />} />
            <Route path="productos" element={<Products />} />
            <Route path="depositos" element={<Depositos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
