import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { productService, categoryService, cartService } from '../services/api';
import { Product, Category } from '../types/woocommerce';
import AddToCartButton from '../components/ui/AddToCartButton';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import RelatedProducts from '../components/products/RelatedProducts';
import PromotionalGrid from '../components/products/PromotionalGrid';
import { formatCurrency } from '../utils/formatters';

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        
        // Intentar buscar por slug primero
        const response = await productService.getBySlug(slug);
        
        // La API devuelve un array cuando se busca por slug
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Tomamos el primer producto que coincida con el slug
          setProduct(response.data[0]);
          
          // Obtener información detallada de las categorías
          if (response.data[0].categories && response.data[0].categories.length > 0) {
            const categoryPromises = response.data[0].categories.map((cat: any) => 
              categoryService.getById(cat.id)
            );
            
            const categoryResponses = await Promise.all(categoryPromises);
            setCategories(categoryResponses.map(res => res.data));
          }
        } else if (!isNaN(parseInt(slug))) {
          // Si el slug es numérico, intentar buscar por ID como fallback
          const idResponse = await productService.getById(parseInt(slug));
          setProduct(idResponse.data);
          
          if (idResponse.data.categories && idResponse.data.categories.length > 0) {
            const categoryPromises = idResponse.data.categories.map((cat: any) => 
              categoryService.getById(cat.id)
            );
            
            const categoryResponses = await Promise.all(categoryPromises);
            setCategories(categoryResponses.map((res: any) => res.data));
          }
        } else {
          throw new Error('Producto no encontrado');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError('No se pudo cargar el producto. Por favor, inténtalo de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchProduct();
    
    // Scroll al inicio de la página cuando cambia el slug del producto
    window.scrollTo(0, 0);
  }, [slug]);

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

  const handleAddToCart = () => {
    // Añadir al carrito con la cantidad seleccionada
    if (product) {
      // Verificar si el producto ya está en el carrito
      const cartItems = cartService.getItems();
      const existingItem = cartItems.find((item: any) => item.id === product.id);
      
      if (existingItem) {
        // Si ya existe, actualizar la cantidad directamente en lugar de sumarla
        cartService.updateItemQuantity(product.id, quantity);
      } else {
        // Si no existe, añadir como nuevo
        cartService.addItem(product, quantity);
      }
      
      // Disparar evento de actualización del carrito
      const event = new CustomEvent('cart-updated');
      window.dispatchEvent(event);
    }
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
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Migas de pan */}
      <Breadcrumbs 
        categories={categories} 
        currentProduct={product.name}
        currentCategory={categories.length > 0 ? categories[0].name : undefined}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Galería de imágenes - Versión mejorada */}
        <div className="product-animate">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Miniaturas verticales */}
            {product.images && product.images.length > 1 && (
              <div className="order-2 md:order-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px] py-2 md:py-0">
                {product.images.map((image, index) => (
                  <button 
                    key={image.id} 
                    className={`flex-shrink-0 border-2 rounded overflow-hidden 
                      ${index === activeImage ? 'border-primario' : 'border-gray-200'}
                      w-16 h-16 md:w-20 md:h-20 transition-all hover:opacity-90`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img 
                      src={image.src} 
                      alt={`${product.name} - imagen ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Imagen principal */}
            <div className="order-1 md:order-2 flex-grow bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src={product.images && product.images.length > 0 
                  ? product.images[activeImage].src 
                  : 'https://via.placeholder.com/600x600?text=No+Image'
                } 
                alt={product.name} 
                className="w-full h-auto object-contain max-h-[500px]"
              />
            </div>
          </div>
        </div>
        
        {/* Detalles del producto */}
        <div>
          <h1 className="text-3xl font-bold text-oscuro mb-3 product-animate">{product.name}</h1>
          
          <div className="mb-4 product-animate">
            <span className="text-2xl font-semibold text-primario">
              {formatCurrency(product.price)}
            </span>
            {product.regular_price !== product.price && (
              <span className="ml-2 text-gray-500 line-through">
                {formatCurrency(product.regular_price)}
              </span>
            )}
          </div>
          
          <div 
            className="mb-6 text-texto product-animate prose prose-sm max-w-none max-h-[200px] overflow-y-auto pr-2 custom-scrollbar"
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
              onAddToCart={handleAddToCart}
            />
          </div>
          
          {/* Grilla publicitaria de productos (reemplaza la información adicional) */}
          <PromotionalGrid />
        </div>
      </div>
      
      {/* Productos relacionados */}
      {product.categories && product.categories.length > 0 && (
        <RelatedProducts 
          productId={product.id} 
          categoryIds={product.categories.map(cat => cat.id)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
