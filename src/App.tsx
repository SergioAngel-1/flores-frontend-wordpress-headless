import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ApiTestPage from './pages/ApiTestPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ShopPage from './pages/ShopPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import SearchPage from './pages/SearchPage'
import LandingPage from './pages/LandingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsConditionsPage from './pages/TermsConditionsPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthModals from './components/auth/AuthModals'
import './index.css'

// Componente principal de la aplicación
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  
  // Mientras se verifica la autenticación, mostrar pantalla de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
        <p className="ml-3 text-primario font-medium">Cargando...</p>
      </div>
    );
  }
  
  return (
    <Router>
      {isAuthenticated ? (
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tienda" element={<ShopPage />} />
            <Route path="/api-test" element={<ApiTestPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/busqueda" element={<SearchPage />} />
            <Route path="/privacidad" element={<PrivacyPolicyPage />} />
            <Route path="/terminos" element={<TermsConditionsPage />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="*" element={
              <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-primario">Página no encontrada</h1>
              </div>
            } />
          </Routes>
          <AuthModals />
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<LandingPage />} />
          <Route path="/privacidad" element={<PrivacyPolicyPage />} />
          <Route path="/terminos" element={<TermsConditionsPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
