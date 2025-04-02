import React, { useEffect } from 'react';
import { FiX, FiTrash2, FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import ScrollToTopLink from '../common/ScrollToTopLink';
import { useCart } from '../../contexts/CartContext';
import QuantityCounter from '../common/QuantityCounter';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { items: cartItems, total, removeItem } = useCart();

  // Cerrar el modal al presionar Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);
  
  // Manejar eliminación de item
  const handleRemoveItem = (productId: number) => {
    removeItem(productId);
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay con efecto de desenfoque */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Panel lateral del carrito */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Cabecera del carrito */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Tu Carrito</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        {/* Contenido del carrito */}
        <div className="flex-grow overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-primario text-white rounded-md hover:bg-primario-dark transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="py-4 flex">
                  {/* Imagen del producto */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product.images[0]?.src || '/wp-content/themes/FloresInc/assets/img/no-image.svg'}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  
                  {/* Información del producto */}
                  <div className="flex-1 ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatCurrency(item.product.price)} x {item.quantity}
                    </p>
                    
                    {/* Controles de cantidad */}
                    <div className="flex justify-between items-center mt-2">
                      <QuantityCounter 
                        productId={item.id}
                        quantity={item.quantity}
                        productName={item.product.name}
                        size="sm"
                      />
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="font-medium text-red-600 hover:text-red-500 flex items-center"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer con total y botones */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 mt-auto">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Total</p>
              <p>{formatCurrency(total)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ScrollToTopLink 
                to="/carrito" 
                className="flex items-center justify-center rounded-md border border-primario px-6 py-3 text-base font-medium text-primario hover:bg-gray-100"
                onClick={onClose}
              >
                <FiShoppingCart className="mr-2" />
                Ver carrito
              </ScrollToTopLink>
              <ScrollToTopLink 
                to="/checkout" 
                className="flex items-center justify-center rounded-md border border-transparent bg-primario px-6 py-3 text-base font-medium text-white hover:bg-primario-dark hover:!text-white"
                onClick={onClose}
              >
                <FiCreditCard className="mr-2" />
                Pagar ahora
              </ScrollToTopLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
