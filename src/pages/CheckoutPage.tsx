import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { cartService } from '../services/api';
import { CartItem } from '../services/api';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvc: '',
  });

  // Cargar items del carrito
  useEffect(() => {
    const loadCart = () => {
      setLoading(true);
      const items = cartService.getItems();
      
      if (items.length === 0) {
        // Redirigir al carrito si está vacío
        navigate('/carrito');
        return;
      }
      
      setCartItems(items);
      setTotal(cartService.getCartTotal());
      setLoading(false);
    };

    loadCart();
  }, [navigate]);

  // Animaciones con GSAP
  useEffect(() => {
    if (!loading) {
      const checkoutElements = document.querySelectorAll('.checkout-animate');
      
      gsap.fromTo(
        checkoutElements,
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
  }, [loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Crear líneas de pedido - Comentado para evitar advertencia de linting
      // const line_items = cartItems.map(item => ({
      //   product_id: item.product.id,
      //   quantity: item.quantity
      // }));
      
      // En un entorno real, enviaríamos el pedido a WooCommerce
      // const response = await orderService.createOrder(orderData);
      // const newOrderId = response.data.id;
      
      // Simulamos un tiempo de procesamiento y una respuesta
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockOrderId = Math.floor(Math.random() * 10000) + 1000;
      setOrderId(mockOrderId);
      
      // Vaciar el carrito
      cartService.clearCart();
      
      // Disparar evento de actualización del carrito
      const event = new CustomEvent('cart-updated');
      window.dispatchEvent(event);
      
      // Mostrar éxito
      setSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (err) {
      console.error('Error al procesar el pedido:', err);
      setError('Ocurrió un error al procesar tu pedido. Por favor, intenta de nuevo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-green-50 border-l-4 border-green-500 p-8 rounded-lg text-center max-w-2xl mx-auto">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-green-500 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-3xl font-bold text-green-800 mb-4">¡Pedido Completado!</h1>
          {orderId && (
            <p className="text-lg text-green-700 mb-2">
              Número de pedido: <span className="font-bold">#{orderId}</span>
            </p>
          )}
          <p className="text-lg text-green-700 mb-6">
            Tu pedido ha sido procesado correctamente. Recibirás un correo electrónico con los detalles de tu compra.
          </p>
          <p className="text-gray-600 mb-8">
            Serás redirigido a la página de inicio en unos segundos...
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primario text-white py-3 px-6 rounded-md hover:bg-hover transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primario mb-8">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de checkout */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium text-oscuro mb-6 checkout-animate">Información de contacto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 checkout-animate">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                />
              </div>
            </div>
            
            <h2 className="text-xl font-medium text-oscuro mb-6 checkout-animate">Dirección de envío</h2>
            
            <div className="grid grid-cols-1 gap-6 mb-8 checkout-animate">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                  required
                />
              </div>
            </div>
            
            <h2 className="text-xl font-medium text-oscuro mb-6 checkout-animate">Método de pago</h2>
            
            <div className="mb-8 checkout-animate">
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primario"
                  />
                  <span className="ml-2">Tarjeta de crédito</span>
                </label>
              </div>
              
              {formData.paymentMethod === 'card' && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Número de tarjeta
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre en la tarjeta
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de expiración
                      </label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cardCvc"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={formData.paymentMethod === 'bank'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primario"
                  />
                  <span className="ml-2">Transferencia bancaria</span>
                </label>
              </div>
              
              {formData.paymentMethod === 'bank' && (
                <div className="bg-gray-50 p-4 rounded-md mt-4">
                  <p className="text-sm text-gray-600">
                    Realiza tu pago directamente en nuestra cuenta bancaria. Por favor, usa el número de pedido como referencia de pago. Tu pedido no se procesará hasta que se haya recibido el importe en nuestra cuenta.
                  </p>
                </div>
              )}
            </div>
            
            <div className="checkout-animate">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-primario text-white py-3 px-6 rounded-md hover:bg-hover transition-colors disabled:bg-gray-400"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Completar pedido'
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Resumen del pedido */}
        <div className="checkout-animate">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-medium text-oscuro mb-4">Resumen del pedido</h2>
            
            <div className="max-h-80 overflow-y-auto mb-4">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex items-center py-3 border-b border-gray-200 last:border-0">
                  <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={item.product.images && item.product.images.length > 0 
                        ? item.product.images[0].src 
                        : 'https://via.placeholder.com/150x150?text=No+Image'
                      } 
                      alt={item.product.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-oscuro">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ${parseFloat(item.product.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>$100.00</span>
              </div>
              
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primario">${(total + 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
