import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGallery from './ProductGallery';
import AddToCartButton from './AddToCartButton';
import Alert from '../../../core/components/ui/Alert';
import { Product } from '../../../core/services/api';

interface ProductDetailsProps {
  product: Product;
  relatedProducts?: Product[];
}

const ProductDetails = ({ product, relatedProducts = [] }: ProductDetailsProps) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  );

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Obtener el precio actual (considerando variantes seleccionadas)
  const getCurrentPrice = () => {
    if (product.variants && selectedVariant) {
      const variant = product.variants.find((v) => v.id === selectedVariant);
      return variant ? variant.price : product.price;
    }
    return product.price;
  };

  // Obtener el precio regular (para mostrar descuentos)
  const getRegularPrice = () => {
    if (product.variants && selectedVariant) {
      const variant = product.variants.find((v) => v.id === selectedVariant);
      return variant && variant.regularPrice ? variant.regularPrice : product.regularPrice;
    }
    return product.regularPrice;
  };

  // Calcular porcentaje de descuento
  const getDiscountPercentage = () => {
    const regularPrice = getRegularPrice();
    const currentPrice = getCurrentPrice();
    
    if (regularPrice && currentPrice && regularPrice > currentPrice) {
      return Math.round(((regularPrice - currentPrice) / regularPrice) * 100);
    }
    
    return null;
  };

  // Verificar si el producto está en stock
  const isInStock = () => {
    if (product.variants && selectedVariant) {
      const variant = product.variants.find((v) => v.id === selectedVariant);
      return variant ? variant.stockStatus === 'instock' : product.stockStatus === 'instock';
    }
    return product.stockStatus === 'instock';
  };

  // Obtener imágenes para la galería
  const getProductImages = () => {
    const images = [];
    
    if (product.image) {
      images.push({
        id: 0,
        src: product.image,
        alt: product.name,
      });
    }
    
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach((img, index) => {
        images.push({
          id: index + 1,
          src: img,
          alt: `${product.name} - Imagen ${index + 1}`,
        });
      });
    }
    
    return images;
  };

  // Manejar cambio de variante
  const handleVariantChange = (variantId: number) => {
    setSelectedVariant(variantId);
  };

  const discountPercentage = getDiscountPercentage();
  const productImages = getProductImages();
  const currentPrice = getCurrentPrice();
  const regularPrice = getRegularPrice();

  return (
    <div className="product-details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div>
          <ProductGallery images={productImages} />
        </div>
        
        {/* Información del producto */}
        <div>
          {/* Categorías */}
          {product.categories && product.categories.length > 0 && (
            <div className="mb-2">
              {product.categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products/category/${category.slug}`}
                  className="text-sm text-gray-500 hover:text-primary-600"
                >
                  {category.name}
                  {index < product.categories.length - 1 && ', '}
                </Link>
              ))}
            </div>
          )}
          
          {/* Nombre del producto */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {/* SKU */}
          {product.sku && (
            <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
          )}
          
          {/* Precios */}
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(currentPrice)}</span>
            
            {regularPrice && regularPrice > currentPrice && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
            
            {discountPercentage && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
            )}
          </div>
          
          {/* Estado de stock */}
          <div className="mb-6">
            {isInStock() ? (
              <span className="inline-flex items-center text-green-700 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                En stock
              </span>
            ) : (
              <span className="inline-flex items-center text-red-700 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Agotado
              </span>
            )}
          </div>
          
          {/* Variantes */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Opciones disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`px-3 py-1 border rounded-md text-sm ${
                      selectedVariant === variant.id
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } ${
                      variant.stockStatus !== 'instock' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handleVariantChange(variant.id)}
                    disabled={variant.stockStatus !== 'instock'}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Botón de añadir al carrito */}
          <div className="mb-6">
            <AddToCartButton
              product={product}
              variantId={selectedVariant}
              disabled={!isInStock()}
            />
          </div>
          
          {/* Descripción corta */}
          {product.shortDescription && (
            <div className="mb-6 text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
            </div>
          )}
          
          {/* Alertas */}
          <div className="space-y-4 mb-6">
            {/* Envío gratis */}
            {product.price >= 100000 && (
              <Alert type="info">
                <span className="font-medium">Envío gratis</span> en pedidos superiores a $100.000
              </Alert>
            )}
            
            {/* Garantía */}
            <Alert type="success">
              <span className="font-medium">Garantía de satisfacción</span> - Devoluciones sin complicaciones dentro de los 30 días
            </Alert>
          </div>
        </div>
      </div>
      
      {/* Pestañas de información adicional */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-primary-600 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Descripción
            </button>
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Especificaciones
            </button>
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Reseñas
            </button>
          </nav>
        </div>
        
        {/* Contenido de la pestaña */}
        <div className="py-6">
          {product.description ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
          ) : (
            <p className="text-gray-500">No hay descripción disponible para este producto.</p>
          )}
        </div>
      </div>
      
      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <div key={relatedProduct.id} className="group relative">
                <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden bg-gray-200">
                  <img
                    src={relatedProduct.image || 'https://via.placeholder.com/300'}
                    alt={relatedProduct.name}
                    className="w-full h-full object-center object-cover group-hover:opacity-75"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <Link to={`/products/${relatedProduct.slug}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {relatedProduct.name}
                      </Link>
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(relatedProduct.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
