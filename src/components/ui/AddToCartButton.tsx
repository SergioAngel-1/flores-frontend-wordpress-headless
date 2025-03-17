import { useState } from 'react';
import { gsap } from 'gsap';
import { cartService } from '../../services/api';
import { Product } from '../../types/woocommerce';

interface AddToCartButtonProps {
  product: Product;
  showQuantity?: boolean;
  buttonText?: string;
  className?: string;
  onAddToCart?: () => void;
}

const AddToCartButton = ({
  product,
  showQuantity = true,
  buttonText = 'Agregar al carrito',
  className = '',
  onAddToCart
}: AddToCartButtonProps) => {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    setAdding(true);
    
    // Simulamos un pequeño retraso para la experiencia de usuario
    setTimeout(() => {
      // Agregar al carrito
      cartService.addItem(product, quantity);
      
      // Disparar evento personalizado para actualizar el contador del carrito
      const event = new CustomEvent('cart-updated');
      window.dispatchEvent(event);
      
      // Mostrar animación de éxito
      setAdding(false);
      setAdded(true);
      
      // Animar el botón con GSAP
      const button = document.querySelector(`.add-to-cart-btn-${product.id}`);
      if (button) {
        gsap.fromTo(
          button,
          { backgroundColor: '#8FD8B9' },
          { 
            backgroundColor: '#B91E59', 
            duration: 1,
            ease: 'power2.out'
          }
        );
      }
      
      // Llamar al callback si existe
      if (onAddToCart) {
        onAddToCart();
      }
      
      // Resetear el estado después de un tiempo
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    }, 500);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {showQuantity && (
        <div className="flex items-center mb-3">
          <span className="text-sm text-gray-600 mr-3">Cantidad:</span>
          <div className="flex border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center border-r border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-10 h-8 flex items-center justify-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center border-l border-gray-300 bg-gray-50 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      )}
      
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={adding || added}
        className={`add-to-cart-btn-${product.id} flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario transition-colors ${
          adding ? 'opacity-75 cursor-wait' : ''
        } ${added ? 'bg-acento' : ''}`}
      >
        {adding ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Agregando...
          </>
        ) : added ? (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ¡Agregado!
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {buttonText}
          </>
        )}
      </button>
      
      {added && (
        <div className="mt-2 flex justify-center">
          <a 
            href="/carrito" 
            className="text-sm text-primario hover:text-hover transition-colors"
          >
            Ver carrito
          </a>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
