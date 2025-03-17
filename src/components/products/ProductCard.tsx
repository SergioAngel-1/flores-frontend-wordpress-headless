import { Link } from 'react-router-dom';
import { Product } from '../../types/woocommerce';
import { cartService } from '../../services/api';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const handleAddToCart = () => {
    cartService.addItem(product);
    
    // Disparar evento personalizado para actualizar el contador del carrito
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <Link to={`/producto/${product.slug}`} className="block">
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={product.images && product.images.length > 0 ? product.images[0].src : 'https://via.placeholder.com/300x300'} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <div className="mb-2">
          {product.categories && product.categories.length > 0 && (
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {product.categories[0].name}
            </span>
          )}
        </div>
        
        <Link to={`/producto/${product.slug}`} className="block">
          <h3 className="font-medium text-gray-900 mb-2 hover:text-primario transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-bold text-primario">
            ${product.price}
          </span>
          
          <button 
            onClick={handleAddToCart}
            className="bg-primario text-white px-3 py-1 rounded-md text-sm hover:bg-primario-dark transition-colors"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
