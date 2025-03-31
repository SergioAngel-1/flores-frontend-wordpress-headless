import React, { useEffect, useState } from 'react';
import { FiX, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { cartService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { CartItem } from '../../types/woocommerce';
import ScrollToTopLink from '../common/ScrollToTopLink';
import alertService from '../../services/alertService'; // Importación correcta

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
    
    // Cargar items del carrito al montar el componente
    loadCartItems();
    
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, []);

  const loadCartItems = () => {
    try {
      const items = cartService.getItems();
      console.log('CartModal: Items cargados (detallado):', JSON.stringify(items, null, 2));
      
      // Añadir logging detallado para cada item
      if (items && Array.isArray(items)) {
        items.forEach((item, index) => {
          console.log(`Item [${index}]:`, {
            id: item.product_id,
            nombre: item.product_name,
            precio_original: item.price,
            precio_tipo: typeof item.price,
            cantidad: item.quantity
          });
        });
      
        // Filtrar items inválidos (sin datos completos)
        const validItems = items.filter(item => 
          item && 
          item.product_id && 
          item.product_name
        );
        
        // Actualizar estado
        setCartItems(validItems);
        
        try {
          const cartTotal = cartService.getTotal();
          console.log('CartModal: Total calculado:', cartTotal, 'Tipo:', typeof cartTotal);
          setTotal(cartTotal);
        } catch (err) {
          console.error('Error al calcular el total:', err);
          setTotal(0);
        }
      } else {
        console.warn('No se encontraron items en el carrito o formato inesperado');
        setCartItems([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error al cargar los items del carrito:', error);
      setCartItems([]);
      setTotal(0);
    }
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    
    cartService.updateItemQuantity(productId, newQuantity);
    
    // Cargar inmediatamente para actualizar la UI
    loadCartItems();
    
    // Disparar evento para actualizar el contador del carrito en el header
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const handleRemoveItem = (productId: number) => {
    // Buscar el producto para poder mostrar su nombre en la alerta
    const itemToRemove = cartItems.find(item => item.product_id === productId);
    const productName = itemToRemove ? itemToRemove.product_name : 'Producto';
    
    // Eliminar el producto del carrito
    cartService.removeItem(productId);
    
    // Mostrar alerta de producto eliminado
    alertService.info(`${productName} eliminado del carrito`);
    
    // Cargar inmediatamente para actualizar la UI
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
          <div className="flex flex-col items-center justify-center flex-grow h-[calc(100vh-180px)] p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-center mb-4">Tu carrito está vacío</p>
            <ScrollToTopLink 
              to="/tienda" 
              className="bg-primario text-white py-2 px-4 rounded hover:bg-primario/10 transition-colors"
              onClick={onClose}
            >
              Ver productos
            </ScrollToTopLink>
          </div>
        ) : (
          <div className="overflow-auto h-[calc(100vh-180px)]">
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.product_id} className="p-4 flex items-center" data-component-name="CartModal">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-2xl">🛍️</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium text-sm line-clamp-2">{item.product_name}</h3>
                    <p className="text-primario font-bold mt-1" data-component-name="CartModal">
                      {item.price}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button 
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-primario transition-all"
                          aria-label="Disminuir cantidad"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="px-2 py-1 min-w-[30px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-primario transition-all"
                          aria-label="Aumentar cantidad"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.product_id)}
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
          </div>
        )}
        
        {/* Footer con total siempre visible */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total:</span>
            <span className="text-xl font-bold text-primario">
              {total ? formatCurrency(total) : 'COP 0'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <ScrollToTopLink 
              to="/carrito" 
              className="bg-white border border-primario text-primario py-2 px-4 rounded text-center hover:bg-primario/10 transition-colors"
              onClick={onClose}
            >
              Ver carrito
            </ScrollToTopLink>
            <ScrollToTopLink 
              to="/checkout" 
              className="bg-primario text-white py-2 px-4 rounded text-center hover:bg-primario/10 transition-colors"
              onClick={onClose}
            >
              Finalizar compra
            </ScrollToTopLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
