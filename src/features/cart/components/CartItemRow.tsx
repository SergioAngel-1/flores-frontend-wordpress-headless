import { CartItem } from '../../../core/services/api';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

const CartItemRow = ({ item, onUpdateQuantity, onRemoveItem }: CartItemRowProps) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleRemove = () => {
    onRemoveItem(item.id);
  };

  // Formatear el precio
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(item.price);

  // Calcular subtotal
  const subtotal = item.price * item.quantity;
  const formattedSubtotal = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(subtotal);

  return (
    <div className="cart-animate flex flex-col sm:flex-row items-center py-4 border-b border-gray-200">
      {/* Imagen del producto */}
      <div className="w-full sm:w-24 h-24 mb-4 sm:mb-0 sm:mr-4">
        <img 
          src={item.image || 'https://via.placeholder.com/100x100'} 
          alt={item.name} 
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      
      {/* Información del producto */}
      <div className="flex-1 mb-4 sm:mb-0">
        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
        <p className="text-gray-500">Precio unitario: {formattedPrice}</p>
      </div>
      
      {/* Control de cantidad */}
      <div className="flex items-center border border-gray-300 rounded-md mr-4">
        <button
          type="button"
          onClick={handleDecreaseQuantity}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          aria-label="Disminuir cantidad"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-12 px-2 py-1 text-center border-x border-gray-300"
          aria-label="Cantidad"
        />
        <button
          type="button"
          onClick={handleIncreaseQuantity}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      
      {/* Subtotal */}
      <div className="text-right min-w-[100px] mb-4 sm:mb-0">
        <p className="text-lg font-semibold text-gray-900">{formattedSubtotal}</p>
      </div>
      
      {/* Botón eliminar */}
      <button
        type="button"
        onClick={handleRemove}
        className="ml-4 text-red-500 hover:text-red-700"
        aria-label="Eliminar producto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default CartItemRow;
