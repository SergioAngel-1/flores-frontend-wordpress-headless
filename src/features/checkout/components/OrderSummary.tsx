import { CartItem } from '../../../core/services/api';

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

const OrderSummary = ({ cartItems, subtotal, discount, total }: OrderSummaryProps) => {
  // Formatear valores monetarios
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen del pedido</h3>
      
      {/* Lista de productos */}
      <div className="space-y-3 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 flex-shrink-0 mr-3">
                <img 
                  src={item.image || 'https://via.placeholder.com/40x40'} 
                  alt={item.name} 
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Detalles del resumen */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        
        <div className="flex justify-between border-t border-gray-200 pt-3">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
