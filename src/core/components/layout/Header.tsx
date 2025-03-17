import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainMenu, { MenuItem } from './MainMenu';
import LoginModal from '../../../features/auth/components/LoginModal';
import Button from '../ui/Button';

interface HeaderProps {
  menuItems: MenuItem[];
}

const Header = ({ menuItems }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Efecto para obtener cantidad de items en el carrito
  useEffect(() => {
    // Aquí iría la lógica para obtener la cantidad de items del carrito
    // Por ahora usamos un valor de ejemplo
    setCartItemCount(3);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            FloresInc
          </Link>
          
          {/* Menú principal */}
          <div className="hidden md:block">
            <MainMenu items={menuItems} />
          </div>
          
          {/* Acciones de usuario */}
          <div className="flex items-center space-x-4">
            {/* Botón de búsqueda */}
            <button
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
              aria-label="Buscar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            
            {/* Carrito */}
            <Link
              to="/cart"
              className="text-gray-700 hover:text-primary-600 relative"
              aria-label="Carrito de compras"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Cuenta de usuario */}
            {isAuthenticated ? (
              <div className="relative group">
                <button
                  className="flex items-center text-gray-700 hover:text-primary-600 focus:outline-none"
                  aria-label="Cuenta de usuario"
                >
                  <span className="hidden md:block mr-2 font-medium">
                    {user?.username || 'Usuario'}
                  </span>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <ul className="py-2">
                    <li>
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                      >
                        Mi cuenta
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                      >
                        Mis pedidos
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                      >
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Iniciar sesión
              </Button>
            )}
            
            {/* Menú móvil */}
            <div className="md:hidden">
              <MainMenu items={menuItems} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Header;
