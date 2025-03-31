import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/woocommerce';
import { formatCurrency, generateSlug } from '../../utils/formatters';
import { useCart } from '../../contexts/CartContext';
import QuantityCounter from '../common/QuantityCounter';

interface ProductCardProps {
  product: Product;
  className?: string; // Additional class for different section styling
  animationClass?: string; // For GSAP animations
}

const ProductCard = ({ product, className = '', animationClass = '' }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(0);
  const { items, addItem, updateItemQuantity, removeItem } = useCart();
  
  // Actualizar la cantidad cuando cambian los items del carrito
  useEffect(() => {
    const existingItem = items.find(item => item.product.id === product.id);
    setQuantity(existingItem ? existingItem.quantity : 0);
  }, [items, product.id]);

  const handleAddToCart = () => {
    addItem(product);
    setQuantity(1);
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(product.id);
      setQuantity(0);
    } else {
      updateItemQuantity(product.id, newQuantity, undefined, true);
      setQuantity(newQuantity);
    }
  };
  
  // Aplicar estilos de sombra directamente con CSS personalizado
  const cardStyle = {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.30)', // Sombra más pronunciada
    transform: 'translateZ(0)', // Forzar aceleración por hardware
    willChange: 'transform', // Optimización de rendimiento
    position: 'relative' as 'relative', // Asegurar que la sombra sea visible
    zIndex: 1 // Dar un z-index explícito
  };
  
  return (
    <div 
      className={`${animationClass} bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${className}`}
      style={cardStyle}
    >
      <Link to={`/producto/${generateSlug(product.name)}`} className="block">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0].src || undefined} 
            alt={product.name} 
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-secundario/30 flex items-center justify-center">
            <span className="text-4xl">🛍️</span>
          </div>
        )}
      </Link>
      
      <div className="p-3 flex flex-col flex-grow">
        <Link to={`/producto/${generateSlug(product.name)}`} className="hover:text-primario transition-colors">
          <h3 className="font-medium text-sm mb-1 text-oscuro line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-2 flex justify-between items-center">
          <span className="text-primario font-bold">
            {formatCurrency(product.price)}
          </span>
          
          {quantity === 0 ? (
            <button 
              onClick={handleAddToCart}
              className="bg-primario hover:bg-hover text-white p-1.5 rounded text-sm transition-colors duration-300"
              aria-label="Agregar al carrito"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          ) : (
            <QuantityCounter
              productId={product.id}
              quantity={quantity}
              productName={product.name}
              size="sm"
              onQuantityChange={handleQuantityChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Usar React.memo para evitar re-renderizados innecesarios
export default memo(ProductCard, (prevProps, nextProps) => {
  // Solo re-renderizar si cambia el producto o las clases
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.className === nextProps.className &&
    prevProps.animationClass === nextProps.animationClass
  );
});
