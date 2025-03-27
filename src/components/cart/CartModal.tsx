import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../../services/api';
import { FiX, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  // Cargar items del carrito
  useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen]);

  // Escuchar eventos de actualización del carrito
  useEffect(() => {
    const handleCartUpdated = () => {
      loadCartItems();
    };

    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, []);

  const loadCartItems = () => {
    const items = cartService.getItems();
    setCartItems(items);
    setTotal(cartService.getTotal());
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    
    cartService.updateItemQuantity(productId, newQuantity);
    loadCartItems();
    
    // Disparar evento para actualizar el contador del carrito en el header
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const handleRemoveItem = (productId: number) => {
    cartService.removeItem(productId);
    loadCartItems();
    
    // Disparar evento para actualizar el contador del carrito en el header
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  // Prevenir que el clic dentro del modal se propague al overlay
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-md shadow-xl transition-all duration-500 transform ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } overflow-auto`}
        onClick={handleModalClick}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-primario">Tu Carrito</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-primario transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="Cerrar carrito"
          >
            <FiX size={24} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-center mb-4">Tu carrito está vacío</p>
            <Link 
              to="/productos" 
              className="bg-primario text-white py-2 px-4 rounded hover:bg-hover transition-colors"
              onClick={onClose}
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-2xl">🛍️</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                    <p className="text-primario font-bold mt-1">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(item.price) || 0)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-primario transition-all"
                          aria-label="Disminuir cantidad"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="px-2 py-1 min-w-[30px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-primario transition-all"
                          aria-label="Aumentar cantidad"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-all"
                        aria-label="Eliminar producto"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold text-primario">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/carrito" 
                  className="bg-white border border-primario text-primario py-2 px-4 rounded text-center hover:bg-primario/10 transition-colors"
                  onClick={onClose}
                >
                  Ver carrito
                </Link>
                <Link 
                  to="/checkout" 
                  className="bg-primario text-white py-2 px-4 rounded text-center hover:bg-hover transition-colors hover:!text-white"
                  onClick={onClose}
                >
                  Finalizar compra
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;
