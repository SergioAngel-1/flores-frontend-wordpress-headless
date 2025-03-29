import { FC } from 'react';
import alertService from '../../services/alertService';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiShoppingCart, FiCreditCard } from 'react-icons/fi';

interface HeaderIconsProps {
  cartItemCount: number;
  openProfileModal: () => void;
  openCartModal: () => void;
  openWalletModal: () => void;
  isAuthenticated?: boolean;
}

const HeaderIcons: FC<HeaderIconsProps> = ({ 
  cartItemCount, 
  openProfileModal, 
  openCartModal, 
  openWalletModal, 
  isAuthenticated: propsIsAuthenticated 
}) => {
  const { isAuthenticated: contextIsAuthenticated, isPending, setShowLoginModal } = useAuth();
  
  // Usar la prop si se proporciona, de lo contrario usar el contexto
  const isAuthenticated = propsIsAuthenticated !== undefined ? propsIsAuthenticated : contextIsAuthenticated;

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir la navegación a /carrito
    
    if (cartItemCount === 0) {
      alertService.info('Tu carrito está vacío');
    } else {
      openCartModal();
    }
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      openProfileModal();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleWalletClick = () => {
    if (isAuthenticated) {
      openWalletModal();
    } else {
      setShowLoginModal(true);
      alertService.info('Debes iniciar sesión para acceder a tu billetera');
    }
  };

  return (
    <div className="flex items-center space-x-6">
      {/* Icono de billetera (sólo visible para usuarios autenticados) */}
      {isAuthenticated && (
        <button 
          className="flex flex-col items-center text-primario transition-colors duration-300 relative py-2 px-3 rounded-md icon-push-effect"
          onClick={handleWalletClick}
          aria-label="Billetera"
        >
          <FiCreditCard className="h-6 w-6" />
          <span className="text-xs font-bold mt-1">
            Billetera
          </span>
        </button>
      )}
      
      {/* Icono de cuenta */}
      <button 
        className="flex flex-col items-center text-primario transition-colors duration-300 relative py-2 px-3 rounded-md icon-push-effect"
        onClick={handleAccountClick}
        aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
      >
        <FiUser className="h-6 w-6" />
        <span className="text-xs font-bold mt-1">
          {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
        </span>
        {isPending && (
          <span className="absolute -top-1 right-0 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            !
          </span>
        )}
      </button>
      
      {/* Icono de carrito */}
      <button 
        className="flex flex-col items-center text-primario transition-colors duration-300 relative py-2 px-3 rounded-md icon-push-effect"
        onClick={handleCartClick}
        aria-label="Carrito de compras"
      >
        <FiShoppingCart className="h-6 w-6" />
        <span className="text-xs font-bold mt-1">
          Carrito
        </span>
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primario text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default HeaderIcons;
