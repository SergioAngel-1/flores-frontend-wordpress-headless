import { FC, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { cartService } from '../../services/api';
import { CartItem } from '../../types/cart';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cargar items del carrito
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const items = cartService.getItems();
      setCartItems(items);
      setLoading(false);
    }
  }, [isOpen]);

  // Evento personalizado para actualizar el carrito
  useEffect(() => {
    const handleCartUpdate = () => {
      const items = cartService.getItems();
      setCartItems(items);
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  // Animaciones con GSAP
  useEffect(() => {
    if (isOpen && sidebarRef.current && overlayRef.current) {
      // Animar apertura del sidebar
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      gsap.fromTo(
        sidebarRef.current,
        { x: '100%' },
        { 
          x: '0%', 
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            // Animar elementos del carrito
            if (cartItems.length > 0) {
              gsap.fromTo(
                '.cart-item',
                { opacity: 0, x: 20 },
                { 
                  opacity: 1, 
                  x: 0, 
                  duration: 0.3, 
                  stagger: 0.1,
                  ease: 'power2.out' 
                }
              );
            }
          }
        }
      );
    }
  }, [isOpen, cartItems.length]);

  // Manejar cierre del sidebar
  const handleClose = () => {
    if (sidebarRef.current && overlayRef.current) {
      // Animar cierre del sidebar
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      gsap.to(sidebarRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power2.out',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartService.updateItemQuantity(productId, newQuantity);
    setCartItems(updatedItems);
    
    // Disparar evento de actualización del carrito
    const event = new CustomEvent('cart-updated');
    window.dispatchEvent(event);
  };

  // Manejar eliminación de item
  const handleRemoveItem = (productId: number) => {
    const updatedItems = cartService.removeItem(productId);
    setCartItems(updatedItems);
    
    // Disparar evento de actualización del carrito
    const event = new CustomEvent('cart-updated');
    window.dispatchEvent(event);
  };

  // Calcular subtotal
  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        style={{ opacity: 0 }}
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg z-50 overflow-auto"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-primario text-white">
          <h2 className="text-xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Carrito de compras
          </h2>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primario"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mx-auto text-gray-400 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500 mb-6">
                Añade productos para comenzar tu compra
              </p>
              <button 
                onClick={handleClose}
                className="bg-primario text-white py-2 px-4 rounded-md hover:bg-hover transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.product.id} className="py-4 cart-item" style={{ opacity: 0 }}>
                    <div className="flex items-center space-x-4">
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                        <img 
                          src={item.product.images?.[0]?.src || '/placeholder.jpg'} 
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      {/* Detalles del producto */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/producto/${item.product.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primario transition-colors"
                          onClick={handleClose}
                        >
                          {item.product.name}
                        </Link>
                        
                        {item.variation && (
                          <p className="text-xs text-gray-500">
                            {item.variation.attributes.map(attr => attr.option).join(', ')}
                          </p>
                        )}
                        
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-700 font-medium">
                            ${Number(item.product.price).toLocaleString('es')}
                          </span>
                          <span className="text-xs text-gray-500 mx-2">×</span>
                          
                          {/* Control de cantidad */}
                          <div className="flex items-center border border-gray-300 rounded">
                            <button 
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:text-primario transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="px-2 py-1 text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:text-primario transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Precio y eliminar */}
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-primario">
                          ${(Number(item.product.price) * item.quantity).toLocaleString('es')}
                        </span>
                        <button 
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors mt-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Resumen y botones */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-t border-b border-gray-200">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="text-lg font-bold text-primario">
                    ${subtotal.toLocaleString('es')}
                  </span>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Link 
                    to="/carrito"
                    className="w-full bg-primario text-white text-center py-3 rounded-md hover:bg-hover transition-colors"
                    onClick={handleClose}
                  >
                    Ver carrito
                  </Link>
                  <Link 
                    to="/checkout"
                    className="w-full border border-primario text-primario text-center py-3 rounded-md hover:bg-primario hover:text-white transition-colors"
                    onClick={handleClose}
                  >
                    Finalizar compra
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
