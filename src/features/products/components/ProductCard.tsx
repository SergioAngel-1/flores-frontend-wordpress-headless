import { Link } from 'react-router-dom';
import { Product } from '../../../core/types/woocommerce';
import AddToCartButton from './AddToCartButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Extraer la imagen principal o usar una imagen por defecto
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : 'https://via.placeholder.com/300x300';

  // Formatear el precio
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(parseFloat(product.price));

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
      <Link to={`/producto/${product.id}`} className="block overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {product.on_sale && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Oferta
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/producto/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-primary-600 line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formattedPrice}
          </span>
          
          {product.on_sale && product.regular_price && (
            <span className="text-sm text-gray-500 line-through">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              }).format(parseFloat(product.regular_price))}
            </span>
          )}
        </div>
        
        <AddToCartButton product={product} />
      </div>
    </div>
  );
};

export default ProductCard;
