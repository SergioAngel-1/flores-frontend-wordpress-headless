import React from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';

interface QuantityCounterProps {
  productId: number;
  quantity: number;
  productName?: string; // Mantenemos esta propiedad para compatibilidad con componentes existentes
  size?: 'sm' | 'md' | 'lg';
  showRemoveButton?: boolean;
  className?: string;
  onQuantityChange?: (newQuantity: number) => void;
}

const QuantityCounter: React.FC<QuantityCounterProps> = ({
  productId,
  quantity,
  productName = '', // eslint-disable-line @typescript-eslint/no-unused-vars
  size = 'md',
  showRemoveButton = false,
  className = '',
  onQuantityChange
}) => {
  const { updateItemQuantity, removeItem } = useCart();

  // Tamaños predefinidos para los botones y el texto
  const sizeClasses = {
    sm: {
      container: 'text-xs',
      button: 'p-1',
      icon: 'w-3 h-3',
      text: 'px-1.5 min-w-[16px]'
    },
    md: {
      container: 'text-sm',
      button: 'p-1.5',
      icon: 'w-4 h-4',
      text: 'px-2 min-w-[20px]'
    },
    lg: {
      container: 'text-base',
      button: 'p-2',
      icon: 'w-5 h-5',
      text: 'px-3 min-w-[24px]'
    }
  };

  const handleDecrease = () => {
    const newQuantity = quantity - 1;
    
    if (newQuantity <= 0) {
      handleRemove();
      return;
    }
    
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    } else {
      // Usar el parámetro showAlert para que el CartContext maneje las alertas
      updateItemQuantity(productId, newQuantity, undefined, true);
    }
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    } else {
      // Usar el parámetro showAlert para que el CartContext maneje las alertas
      updateItemQuantity(productId, newQuantity, undefined, true);
    }
  };

  const handleRemove = () => {
    if (onQuantityChange) {
      onQuantityChange(0);
    } else {
      // Eliminar el producto y dejar que el CartContext maneje la alerta
      removeItem(productId);
    }
  };

  return (
    <div className={`flex items-center ${className} ${sizeClasses[size].container}`}>
      <div className="flex items-center border rounded-md overflow-hidden">
        <button 
          onClick={handleDecrease}
          className={`bg-primario/10 hover:bg-primario/20 text-primario transition-colors ${sizeClasses[size].button}`}
          aria-label="Disminuir cantidad"
        >
          <FiMinus className={sizeClasses[size].icon} />
        </button>
        <span className={`text-center font-medium ${sizeClasses[size].text}`}>
          {quantity}
        </span>
        <button 
          onClick={handleIncrease}
          className={`bg-primario/10 hover:bg-primario/20 text-primario transition-colors ${sizeClasses[size].button}`}
          aria-label="Aumentar cantidad"
        >
          <FiPlus className={sizeClasses[size].icon} />
        </button>
      </div>
      
      {showRemoveButton && (
        <button 
          onClick={handleRemove}
          className="ml-2 text-red-600 hover:text-red-500 transition-colors flex items-center"
          aria-label="Eliminar producto"
        >
          <span className="text-xs">Eliminar</span>
        </button>
      )}
    </div>
  );
};

export default QuantityCounter;
