import { FC } from 'react';
import { Link } from 'react-router-dom';
import alertService from '../../services/alertService';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderIconsProps {
  cartItemCount: number;
  openProfileModal: () => void;
  isAuthenticated?: boolean;
}

const HeaderIcons: FC<HeaderIconsProps> = ({ cartItemCount, openProfileModal, isAuthenticated: propsIsAuthenticated }) => {
  const { isAuthenticated: contextIsAuthenticated, isPending, setShowLoginModal } = useAuth();
  
  // Usar la prop si se proporciona, de lo contrario usar el contexto
  const isAuthenticated = propsIsAuthenticated !== undefined ? propsIsAuthenticated : contextIsAuthenticated;

  const handleCartClick = () => {
    if (cartItemCount === 0) {
      alertService.info('Tu carrito está vacío');
    } else {
      // Lógica para abrir el carrito o redirigir a la página del carrito
      console.log('Abrir carrito');
    }
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      openProfileModal();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Icono de cuenta */}
      <button 
        className="text-white hover:text-gray-200 relative"
        onClick={handleAccountClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {isPending && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            !
          </span>
        )}
      </button>
      
      {/* Icono de carrito */}
      <Link to="/carrito" className="text-white hover:text-gray-200 relative" onClick={handleCartClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {cartItemCount > 9 ? '9+' : cartItemCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default HeaderIcons;
