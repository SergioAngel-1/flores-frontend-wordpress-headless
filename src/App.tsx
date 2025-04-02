import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import ContactPage from './pages/ContactPage'
import ReferidosPage from './pages/ReferidosPage'
import CatalogPage from './pages/CatalogPage'
import CatalogDetailPage from './pages/CatalogDetailPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import AuthModals from './components/auth/AuthModals'
import './index.css'

// Componente para preservar los parámetros de la URL en redirecciones
const PreserveQueryParamsRoute = () => {
  const location = useLocation();
  
  console.log('PreserveQueryParamsRoute - Path actual:', location.pathname);
  console.log('PreserveQueryParamsRoute - Parámetros URL:', location.search);
  
  // Verificar si ya estamos en la ruta /login para evitar bucles de redirección
  if (location.pathname === '/login') {
    console.log('PreserveQueryParamsRoute - Ya estamos en /login, renderizando LandingPage directamente');
    return <LandingPage />;
  }
  
  // Conservar los parámetros de la URL al redirigir
  console.log('PreserveQueryParamsRoute - Redirigiendo a /login con parámetros:', location.search);
  return <Navigate to={`/login${location.search}`} replace={true} />;
};

// Componente para rutas autenticadas
const AuthenticatedRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tienda" element={<ShopPage />} />
        <Route path="/api-test" element={<ApiTestPage />} />
        <Route path="/producto/:slug" element={<ProductDetailPage />} />
        <Route path="/categoria/:slug" element={<ShopPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/busqueda" element={<SearchPage />} />
        <Route path="/referidos" element={<ReferidosPage />} />
        <Route path="/privacidad" element={<PrivacyPolicyPage />} />
        <Route path="/terminos" element={<TermsConditionsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/catalogos" element={<CatalogPage />} />
        <Route path="/catalogos/:slug" element={<CatalogDetailPage />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="*" element={
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold text-primario">Página no encontrada</h1>
          </div>
        } />
      </Routes>
      <AuthModals />
    </Layout>
  );
};

// Componente para rutas no autenticadas
const UnauthenticatedRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LandingPage />} />
      <Route path="/privacidad" element={<PrivacyPolicyPage />} />
      <Route path="/terminos" element={<TermsConditionsPage />} />
      <Route path="/contacto" element={<ContactPage />} />
      <Route path="/catalogos" element={<CatalogPage />} />
      <Route path="/catalogos/:slug" element={<CatalogDetailPage />} />
      <Route path="*" element={<PreserveQueryParamsRoute />} />
    </Routes>
  );
};

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
  
  return isAuthenticated ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App
