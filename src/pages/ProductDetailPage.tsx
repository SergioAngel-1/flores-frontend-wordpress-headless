import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { productService } from '../services/api';
import { Product } from '../types/woocommerce';
import AddToCartButton from '../components/ui/AddToCartButton';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productService.getById(parseInt(id));
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('No se pudo cargar el producto. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Animaciones con GSAP
  useEffect(() => {
    if (!loading && product) {
      const productElements = document.querySelectorAll('.product-animate');
      
      gsap.fromTo(
        productElements,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.1,
          ease: 'power2.out' 
        }
      );
    }
  }, [loading, product]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error || 'Producto no encontrado'}</p>
        </div>
        <Link to="/tienda" className="text-primario hover:text-hover">
          ← Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-6">
        <Link to="/tienda" className="text-primario hover:text-hover flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a la tienda
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Galería de imágenes */}
        <div className="product-animate">
          <div className="bg-white rounded-lg overflow-hidden shadow-md mb-4">
            <img 
              src={product.images && product.images.length > 0 
                ? product.images[activeImage].src 
                : 'https://via.placeholder.com/600x600?text=No+Image'
              } 
              alt={product.name} 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button 
                  key={image.id} 
                  className={`border-2 rounded overflow-hidden ${index === activeImage ? 'border-primario' : 'border-gray-200'}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={image.src} 
                    alt={`${product.name} - imagen ${index + 1}`} 
                    className="w-full h-auto object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Detalles del producto */}
        <div>
          <h1 className="text-3xl font-bold text-oscuro mb-2 product-animate">{product.name}</h1>
          
          <div className="mb-4 product-animate">
            <span className="text-2xl font-semibold text-primario">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {product.regular_price !== product.price && (
              <span className="ml-2 text-gray-500 line-through">
                ${parseFloat(product.regular_price).toFixed(2)}
              </span>
            )}
          </div>
          
          <div 
            className="mb-6 text-texto product-animate"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          
          {/* Selector de cantidad */}
          <div className="mb-6 product-animate">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <div className="flex items-center">
              <button 
                onClick={decreaseQuantity}
                className="bg-gray-200 px-3 py-2 rounded-l-md hover:bg-gray-300 transition-colors"
                type="button"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 text-center border-t border-b border-gray-300 py-2"
              />
              <button 
                onClick={increaseQuantity}
                className="bg-gray-200 px-3 py-2 rounded-r-md hover:bg-gray-300 transition-colors"
                type="button"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Botón de agregar al carrito */}
          <div className="product-animate">
            <AddToCartButton 
              product={product} 
              showQuantity={false} 
              buttonText="Agregar al carrito"
              className="w-full"
            />
          </div>
          
          {/* Información adicional */}
          <div className="mt-8 border-t border-gray-200 pt-6 product-animate">
            <h3 className="text-lg font-medium mb-3">Información adicional</h3>
            <ul className="space-y-2">
              <li className="flex">
                <span className="font-medium w-32">SKU:</span>
                <span>{product.sku || 'N/A'}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-32">Categorías:</span>
                <span>
                  {product.categories && product.categories.length > 0
                    ? product.categories.map(cat => cat.name).join(', ')
                    : 'Sin categoría'}
                </span>
              </li>
              <li className="flex">
                <span className="font-medium w-32">Disponibilidad:</span>
                <span className={product.stock_status === 'instock' ? 'text-green-600' : 'text-red-600'}>
                  {product.stock_status === 'instock' ? 'En stock' : 'Agotado'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
