import { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cartService } from '../services/api';
import { CartItem } from '../types/woocommerce';
import { formatCurrency } from '../utils/formatters';
import { FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import alertify from 'alertifyjs';
import ScrollToTopLink from '../components/common/ScrollToTopLink';

// Componente memoizado para el resumen del pedido
interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string;
  couponApplied: boolean;
  couponDiscount: number;
  couponError: string | null;
  setCouponCode: (code: string) => void;
  handleApplyCoupon: () => void;
  navigateToCheckout: () => void;
}

const OrderSummary = memo(({
  subtotal,
  discount,
  shipping,
  total,
  couponCode,
  couponApplied,
  couponDiscount,
  couponError,
  setCouponCode,
  handleApplyCoupon,
  navigateToCheckout
}: OrderSummaryProps) => {
  return (
    <div className="cart-animate">
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
        <h2 className="text-lg font-medium text-oscuro mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Resumen del pedido
        </h2>
        
        {/* Cupón */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
            Cupón de descuento
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="coupon"
              placeholder="Ingresa tu código"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponApplied}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponApplied}
              className={`px-4 py-2 rounded-md text-white ${
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
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {couponApplied && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento ({couponDiscount}%)</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>Envío</span>
            <span>{formatCurrency(shipping)}</span>
          </div>
          
          <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
            <span>Total</span>
            <span className="text-primario total-amount">{formatCurrency(total)}</span>
          </div>
        </div>
        
        {/* Métodos de pago aceptados */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Métodos de pago aceptados:</p>
          <div className="flex flex-wrap gap-2">
            {/* Tarjetas de crédito */}
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
            <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
            <div className="w-12 h-8 bg-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
            
            {/* Tarjetas débito */}
            <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">PSE</div>
            
            {/* Billeteras digitales colombianas */}
            <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">Nequi</div>
            <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">Davi</div>
            
            {/* Efectivo */}
            <div className="w-12 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">Cash</div>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={navigateToCheckout}
            className="w-full bg-primario text-white py-3 px-6 rounded-md hover:bg-hover transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Proceder al pago
          </button>
          
          <ScrollToTopLink 
            to="/tienda"
            className="w-full mt-3 bg-white text-primario border border-primario py-3 px-6 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" />
            Seguir comprando
          </ScrollToTopLink>
        </div>
      </div>
    </div>
  );
});

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Calcular subtotal, descuento, envío y total
  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price || '0') * item.quantity);
  }, 0);
  
  const discount = couponApplied ? (subtotal * (couponDiscount / 100)) : 0;
  const shipping = subtotal > 0 ? 10000 : 0; // Envío gratuito por compras superiores a 100.000 COP
  const total = subtotal - discount + shipping;
  
  // Cargar los items del carrito
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const items = await cartService.getItems();
        console.log('Loaded cart items:', items);
        
        if (items && Array.isArray(items)) {
          setCartItems(items.filter(item => item && item.product));
        } else {
          console.error('Invalid cart items format:', items);
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadCartItems();
  }, []);
  
  // Animación con GSAP
  useEffect(() => {
    if (!loading) {
      const cartAnimate = document.querySelectorAll('.cart-animate');
      gsap.fromTo(
        cartAnimate,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [loading]);
  
  // Manejar cambio de cantidad
  const handleQuantityChange = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    const updatedItems = cartItems.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedItems);
    
    // Actualizar en localStorage
    cartService.updateItemQuantity(productId, newQuantity);
  }, [cartItems]);
  
  // Manejar eliminación de item
  const handleRemoveItem = useCallback((productId: number) => {
    try {
      // Buscar el producto antes de eliminarlo para mostrar su nombre en la alerta
      const productToRemove = cartItems.find(item => item.product.id === productId);
      
      if (!productToRemove) {
        console.warn('No se encontró el producto a eliminar:', productId);
        return;
      }
      
      const productName = productToRemove.product.name;
      console.log('Eliminando producto:', productName);
      
      // Primero actualizar el estado local
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
      
      // Luego eliminar de localStorage
      cartService.removeItem(productId);
      
      // Mostrar alerta directamente con alertify
      alertify.success(`${productName} eliminado del carrito`);
      
      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alertify.error('Error al eliminar el producto');
    }
  }, [cartItems]);
  
  // Manejar aplicación de cupón
  const handleApplyCoupon = useCallback(() => {
    // Validación simple del cupón
    if (couponCode.toLowerCase() === 'descuento10') {
      setCouponApplied(true);
      setCouponDiscount(10);
      setCouponError(null);
    } else if (couponCode.toLowerCase() === 'descuento20') {
      setCouponApplied(true);
      setCouponDiscount(20);
      setCouponError(null);
    } else {
      setCouponError('Cupón inválido o expirado');
    }
  }, [couponCode]);
  
  // Navegar al checkout
  const navigateToCheckout = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);
  
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
        <h1 className="text-3xl font-bold text-primario mb-8 flex items-center">
          <FiShoppingBag className="mr-3" size={28} /> Tu Carrito
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <FiShoppingBag size={36} />
          </div>
          <h2 className="text-xl font-medium text-gray-700 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Parece que aún no has añadido productos a tu carrito. Explora nuestra tienda para encontrar productos que te encantarán.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <ScrollToTopLink 
              to="/tienda" 
              className="bg-primario text-white py-3 px-6 rounded-md hover:bg-hover transition-colors inline-flex items-center justify-center"
            >
              <FiShoppingBag className="mr-2" /> Ir a la tienda
            </ScrollToTopLink>
            <ScrollToTopLink 
              to="/" 
              className="border border-primario text-primario py-3 px-6 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" /> Volver al inicio
            </ScrollToTopLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primario mb-8 flex items-center">
        <FiShoppingBag className="mr-3" size={28} /> Tu Carrito
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium text-oscuro">Productos ({cartItems.length})</h2>
                <button 
                  onClick={() => handleRemoveItem(cartItems[0].product.id)}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center"
                >
                  <FiTrash2 className="mr-1" size={14} /> Vaciar carrito
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cartItems.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No hay productos en el carrito.</p>
                </div>
              ) : (
                cartItems.map((item) => {
                  // Verificar que item.product existe y tiene las propiedades necesarias
                  if (!item || !item.product) {
                    console.warn('CartPage: Item inválido encontrado:', item);
                    return null;
                  }
                  
                  return (
                  <div key={item.product.id} className="p-6 flex flex-col sm:flex-row sm:items-center cart-animate">
                    {/* Imagen del producto */}
                    <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-0">
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
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-oscuro">{item.product.name}</h3>
                        <button 
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-red-500 hover:text-red-700 transition-colors hidden sm:block"
                          aria-label="Eliminar producto"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.product.short_description || '' }}></p>
                      
                      <div className="mt-3 flex flex-wrap items-center justify-between">
                        <span className="text-primario font-medium text-lg">
                          {typeof item.product.price !== 'undefined' ? formatCurrency(item.product.price) : 'Precio no disponible'}
                        </span>
                        
                        {/* Control de cantidad */}
                        <div className="flex items-center mt-2 sm:mt-0">
                          <button 
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-primario rounded-l-md bg-primario hover:bg-hover text-white font-bold transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            −
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center border-t border-b border-primario bg-white text-primario">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-primario rounded-r-md bg-primario hover:bg-hover text-white font-bold transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                          
                          <button 
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="ml-4 text-red-500 hover:text-red-700 transition-colors sm:hidden"
                            aria-label="Eliminar producto"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Subtotal por producto */}
                      <div className="mt-2 text-sm text-gray-600">
                        Subtotal: <span className="font-medium">
                          {typeof item.product.price !== 'undefined' 
                            ? formatCurrency(parseFloat(item.product.price) * item.quantity)
                            : 'Precio no disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {/* Resumen del pedido */}
        <OrderSummary 
          subtotal={subtotal}
          discount={discount}
          shipping={shipping}
          total={total}
          couponCode={couponCode}
          couponApplied={couponApplied}
          couponDiscount={couponDiscount}
          couponError={couponError}
          setCouponCode={setCouponCode}
          handleApplyCoupon={handleApplyCoupon}
          navigateToCheckout={navigateToCheckout}
        />
      </div>
    </div>
  );
};

export default CartPage;
