import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ApiTestPage from './pages/ApiTestPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ShopPage from './pages/ShopPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import SearchPage from './pages/SearchPage'
import './index.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tienda" element={<ShopPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/busqueda" element={<SearchPage />} />
          {/* Rutas adicionales se agregarán aquí */}
          <Route path="*" element={<div className="container mx-auto px-4 py-20 text-center"><h1 className="text-3xl font-bold text-primario">Página no encontrada</h1></div>} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
