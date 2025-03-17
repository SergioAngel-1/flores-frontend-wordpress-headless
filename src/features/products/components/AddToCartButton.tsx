import { useState } from 'react';
import { gsap } from 'gsap';
import { Product } from '../../../core/types/woocommerce';
import { cartService } from '../../../core/services/api';

interface AddToCartButtonProps {
  product: Product;
  initialQuantity?: number;
}

const AddToCartButton = ({ product, initialQuantity = 1 }: AddToCartButtonProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isAdding, setIsAdding] = useState(false);

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Añadir al carrito
    cartService.addItem(product, quantity);
    
    // Animar el botón
    const button = document.querySelector(`.add-to-cart-btn-${product.id}`);
    if (button) {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          // Emitir evento de actualización del carrito
          window.dispatchEvent(new CustomEvent('cart-updated'));
          
          // Restablecer estado
          setIsAdding(false);
          setQuantity(initialQuantity);
        }
      });
    } else {
      // Si no se encuentra el botón, simplemente actualizar el estado
      window.dispatchEvent(new CustomEvent('cart-updated'));
      setIsAdding(false);
      setQuantity(initialQuantity);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={handleDecreaseQuantity}
            disabled={quantity <= 1 || isAdding}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Disminuir cantidad"
          >
            -
          </button>
          <span className="px-3 py-1 text-gray-800">{quantity}</span>
          <button
            type="button"
            onClick={handleIncreaseQuantity}
            disabled={isAdding}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
        
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || !product.purchasable}
          className={`add-to-cart-btn-${product.id} flex-1 ml-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isAdding ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Añadiendo...
            </span>
          ) : (
            'Añadir al carrito'
          )}
        </button>
      </div>
      
      {!product.purchasable && (
        <p className="text-sm text-red-500">Producto no disponible</p>
      )}
    </div>
  );
};

export default AddToCartButton;
