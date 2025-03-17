import { useState } from 'react';
import { Link } from 'react-router-dom';

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  onApplyCoupon: (code: string) => void;
  couponError: string | null;
  couponApplied: boolean;
}

const CartSummary = ({ 
  subtotal, 
  discount, 
  total, 
  onApplyCoupon, 
  couponError, 
  couponApplied 
}: CartSummaryProps) => {
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim());
    }
  };

  // Formatear valores monetarios
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="cart-animate bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
      
      {/* Cupón */}
      <form onSubmit={handleApplyCoupon} className="mb-6">
        <div className="flex mb-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Código de cupón"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={couponApplied}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            disabled={couponApplied || !couponCode.trim()}
          >
            Aplicar
          </button>
        </div>
        
        {couponError && (
          <p className="text-sm text-red-500">{couponError}</p>
        )}
        
        {couponApplied && (
          <p className="text-sm text-green-500">Cupón aplicado correctamente.</p>
        )}
      </form>
      
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
      
      {/* Botón de checkout */}
      <div className="mt-6">
        <Link
          to="/checkout"
          className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center font-medium rounded-md transition-colors"
        >
          Proceder al pago
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;
