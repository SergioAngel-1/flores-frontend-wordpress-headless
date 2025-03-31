import React, { useState } from 'react';
import { FiTrash2, FiX, FiCreditCard } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatters';
import ScrollToTopLink from '../components/common/ScrollToTopLink';
import { useCart } from '../contexts/CartContext';
import QuantityCounter from '../components/common/QuantityCounter';

const CartPage: React.FC = () => {
  const { 
    items, 
    total, 
    subtotal, 
    discount, 
    shipping,
    couponApplied,
    couponCode,
    removeItem,
    applyCoupon,
    removeCoupon
  } = useCart();
  
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Verificar si el carrito está vacío y redirigir a la tienda
  // useEffect(() => {
  //   if (items.length === 0) {
  //     // Opcional: redirigir después de un tiempo
  //     // const timer = setTimeout(() => navigate('/tienda'), 3000);
  //     // return () => clearTimeout(timer);
  //   }
  // }, [items]);

  // Manejar eliminación de item
  const handleRemoveItem = (productId: number) => {
    removeItem(productId);
  };

  // Manejar aplicación de cupón
  const handleApplyCoupon = () => {
    if (!couponInput) {
      setCouponError('Ingresa un código de cupón');
      return;
    }
    
    // Simulación de verificación de cupón
    // En un caso real, esto se haría con una llamada a la API
    if (couponInput.toUpperCase() === 'DESCUENTO10') {
      applyCoupon(couponInput, 10);
      setCouponInput('');
      setCouponError('');
    } else if (couponInput.toUpperCase() === 'DESCUENTO20') {
      applyCoupon(couponInput, 20);
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError('Cupón inválido o expirado');
    }
  };

  // Manejar eliminación de cupón
  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponError('');
  };

  // Mostrar pantalla de carga mientras se inicializa el carrito
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
          <p className="ml-3 text-primario font-medium">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  // Si el carrito está vacío, mostrar mensaje
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Tu Carrito</h1>
          <p className="text-gray-600 mb-6">Tu carrito está vacío</p>
          <ScrollToTopLink
            to="/tienda"
            className="inline-block bg-primario text-white py-2 px-6 rounded-md hover:bg-primario-dark transition-colors"
          >
            Continuar comprando
          </ScrollToTopLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>
      
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row">
                  {/* Imagen del producto */}
                  <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0">
                    <img
                      src={item.product.images[0]?.src || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Detalles del producto */}
                  <div className="sm:ml-4 flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-gray-500 text-sm mt-1">
                      {item.product.categories[0]?.name || 'Sin categoría'}
                    </p>
                    
                    <QuantityCounter 
                      productId={item.id}
                      quantity={item.quantity}
                      productName={item.product.name}
                      size="md"
                      showRemoveButton={false}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => items.forEach(item => removeItem(item.id))}
                className="text-red-500 hover:text-red-700 transition-colors flex items-center"
              >
                <FiTrash2 className="w-4 h-4 mr-1" />
                Vaciar carrito
              </button>
              
              <ScrollToTopLink
                to="/tienda"
                className="text-primario hover:text-primario-dark transition-colors"
              >
                Continuar comprando
              </ScrollToTopLink>
            </div>
          </div>
        </div>
        
        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Resumen del pedido</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center">
                    Descuento ({couponCode})
                    <button
                      onClick={handleRemoveCoupon}
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label="Eliminar cupón"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{shipping > 0 ? formatCurrency(shipping) : 'Gratis'}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primario">{formatCurrency(total)}</span>
              </div>
              
              {!couponApplied && (
                <div className="pt-4">
                  <p className="text-sm font-medium mb-2">¿Tienes un cupón?</p>
                  <div className="flex">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Código de cupón"
                      className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-primario text-white px-4 py-2 rounded-r-md hover:bg-primario-dark transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-sm mt-1">{couponError}</p>
                  )}
                </div>
              )}
              
              <ScrollToTopLink
                to="/checkout"
                className="block w-full bg-primario text-white text-center py-3 rounded-md hover:bg-primario-dark transition-colors flex items-center justify-center hover:!text-white"
              >
                <FiCreditCard className="mr-2" />
                Pagar ahora
              </ScrollToTopLink>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Políticas de compra</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Envío gratis en compras mayores a $100.000 COP</li>
              <li>• Garantía de 30 días en todos los productos</li>
              <li>• Pago seguro con encriptación SSL</li>
              <li>• Soporte 24/7 para todas tus consultas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
