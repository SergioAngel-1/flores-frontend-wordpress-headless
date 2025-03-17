import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cartService } from '../services/api';
import { CartItem } from '../services/api';

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Cargar items del carrito
  useEffect(() => {
    const loadCart = () => {
      setLoading(true);
      const items = cartService.getItems();
      setCartItems(items);
      setLoading(false);
    };

    loadCart();

    // Escuchar el evento personalizado de actualización del carrito
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  // Animaciones con GSAP
  useEffect(() => {
    if (!loading && cartItems.length > 0) {
      const cartElements = document.querySelectorAll('.cart-animate');
      
      gsap.fromTo(
        cartElements,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'power2.out' 
        }
      );
    }
  }, [loading, cartItems]);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartService.updateItemQuantity(productId, newQuantity);
    setCartItems(updatedItems);
    
    // Disparar evento de actualización del carrito
    const event = new CustomEvent('cart-updated');
    window.dispatchEvent(event);
  };

  const handleRemoveItem = (productId: number) => {
    const updatedItems = cartService.removeItem(productId);
    setCartItems(updatedItems);
    
    // Disparar evento de actualización del carrito
    const event = new CustomEvent('cart-updated');
    window.dispatchEvent(event);
  };

  const handleClearCart = () => {
    cartService.clearCart();
    setCartItems([]);
    
    // Disparar evento de actualización del carrito
    const event = new CustomEvent('cart-updated');
    window.dispatchEvent(event);
  };

  const handleApplyCoupon = () => {
    // Simulación de aplicación de cupón
    setCouponError(null);
    
    if (!couponCode.trim()) {
      setCouponError('Por favor, ingresa un código de cupón');
      return;
    }
    
    // Códigos de cupón válidos para la simulación
    const validCoupons: {[key: string]: number} = {
      'FLORES10': 10,
      'FLORES20': 20,
      'BIENVENIDO': 15,
      'PRIMAVERA': 25
    };
    
    if (validCoupons[couponCode.toUpperCase()]) {
      setCouponApplied(true);
      setCouponDiscount(validCoupons[couponCode.toUpperCase()]);
      
      // Animación para el cupón aplicado
      gsap.fromTo(
        '.coupon-success',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
      
      // Animación para el total actualizado
      gsap.fromTo(
        '.total-amount',
        { scale: 1 },
        { 
          scale: 1.1, 
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
        }
      );
    } else {
      setCouponError('Cupón inválido o expirado');
      
      // Animación para el error
      gsap.fromTo(
        '.coupon-error',
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3 }
      );
    }
  };

  // Calcular subtotal
  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);
  
  // Calcular descuento
  const discount = couponApplied ? (subtotal * (couponDiscount / 100)) : 0;
  
  // Calcular envío (fijo para este ejemplo)
  const shipping = subtotal > 0 ? 100 : 0;
  
  // Calcular total
  const total = subtotal - discount + shipping;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-primario mb-8">Tu Carrito</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-xl font-medium text-gray-700 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">
            Parece que aún no has añadido productos a tu carrito. Explora nuestra tienda para encontrar hermosos arreglos florales.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/tienda" 
              className="bg-primario text-white py-3 px-6 rounded-md hover:bg-hover transition-colors inline-block"
            >
              Ir a la tienda
            </Link>
            <Link 
              to="/categorias" 
              className="border border-primario text-primario py-3 px-6 rounded-md hover:bg-gray-50 transition-colors inline-block"
            >
              Ver categorías
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primario mb-8">Tu Carrito</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium text-oscuro">Productos</h2>
                <button 
                  onClick={handleClearCart}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.product.id} className="p-6 flex flex-col sm:flex-row sm:items-center cart-animate">
                  {/* Imagen del producto */}
                  <div className="w-full sm:w-24 h-24 bg-gray-100 rounded overflow-hidden mb-4 sm:mb-0">
                    <img 
                      src={item.product.images && item.product.images.length > 0 
                        ? item.product.images[0].src 
                        : 'https://via.placeholder.com/150x150?text=No+Image'
                      } 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Información del producto */}
                  <div className="flex-1 sm:ml-6">
                    <h3 className="text-lg font-medium text-oscuro">{item.product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1" dangerouslySetInnerHTML={{ __html: item.product.short_description }}></p>
                    <div className="mt-2 flex flex-wrap items-center">
                      <span className="text-primario font-medium">${parseFloat(item.product.price).toFixed(2)}</span>
                      
                      {/* Control de cantidad */}
                      <div className="flex items-center ml-auto mt-2 sm:mt-0">
                        <button 
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300 bg-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                        >
                          +
                        </button>
                        
                        <button 
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Resumen del pedido */}
        <div className="cart-animate">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-medium text-oscuro mb-6">Resumen del pedido</h2>
            
            {/* Cupón */}
            <div className="mb-6">
              <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                Cupón de descuento
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="coupon"
                  placeholder="Ingresa tu código"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primario"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponApplied}
                  className={`px-4 py-2 rounded-r-md text-white ${
                    couponApplied ? 'bg-green-500' : 'bg-primario hover:bg-hover'
                  } transition-colors`}
                >
                  {couponApplied ? 'Aplicado' : 'Aplicar'}
                </button>
              </div>
              
              {couponError && (
                <p className="mt-2 text-sm text-red-600 coupon-error">{couponError}</p>
              )}
              
              {couponApplied && (
                <div className="mt-2 text-sm text-green-600 coupon-success">
                  ¡Cupón aplicado! Descuento del {couponDiscount}%
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {couponApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento ({couponDiscount}%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primario total-amount">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-primario text-white py-3 px-6 rounded-md hover:bg-hover transition-colors"
              >
                Proceder al pago
              </button>
              
              <button 
                onClick={() => navigate('/tienda')}
                className="w-full mt-3 bg-white text-primario border border-primario py-3 px-6 rounded-md hover:bg-gray-50 transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
