import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { api } from '../../services/apiConfig';
import { cartService } from '../../services/api';
import { FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import alertService from '../../services/alertService';
import { formatCurrency } from '../../utils/formatters';

interface PromotionalProduct {
  id: number;
  title: string;
  image: string;
  url: string;
  slug: string;
  price: string;
  regular_price?: string;
  has_sale: boolean;
}

interface ProductQuantities {
  [key: number]: number; // product_id -> cantidad
}

const PromotionalGrid: React.FC = () => {
  const [products, setProducts] = useState<PromotionalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<ProductQuantities>({});

  // Cargar productos promocionales
  useEffect(() => {
    const fetchPromotionalProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/floresinc/v1/promotional-grid');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching promotional grid products:', err);
        setError('No se pudieron cargar los productos destacados');
        setLoading(false);
      }
    };

    fetchPromotionalProducts();
  }, []);

  // Inicializar las cantidades desde el carrito cuando se cargan los productos
  useEffect(() => {
    if (products.length > 0) {
      const cartItems = cartService.getItems();
      const newQuantities: ProductQuantities = {};
      
      products.forEach(product => {
        const cartItem = cartItems.find((item: any) => item.product_id === product.id);
        newQuantities[product.id] = cartItem ? cartItem.quantity : 0;
      });
      
      setQuantities(newQuantities);
    }
  }, [products]);

  // Escuchar eventos de actualización del carrito
  useEffect(() => {
    const handleCartUpdated = () => {
      const cartItems = cartService.getItems();
      const newQuantities: ProductQuantities = {};
      
      products.forEach(product => {
        const cartItem = cartItems.find((item: any) => item.product_id === product.id);
        newQuantities[product.id] = cartItem ? cartItem.quantity : 0;
      });
      
      setQuantities(newQuantities);
    };

    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, [products]);

  // Animaciones con GSAP
  useEffect(() => {
    if (!loading && products.length > 0) {
      const gridItems = document.querySelectorAll('.promo-grid-item');
      
      gsap.fromTo(
        gridItems,
        { opacity: 0, x: 5 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          stagger: 0.08,
          ease: 'power1.out' 
        }
      );
    }
  }, [loading, products]);

  const handleAddToCart = (product: PromotionalProduct) => {
    // Transformar el producto promocional al formato esperado por cartService
    
    // Procesar el precio para eliminar símbolos de moneda y formateo
    let cleanPrice = product.price;
    if (typeof cleanPrice === 'string') {
      // Eliminar primero el prefijo de moneda y espacios
      cleanPrice = cleanPrice.replace(/COP\s*/, '').trim();
      
      // Si tiene puntos como separadores de miles y coma decimal (formato Colombia)
      if (cleanPrice.includes('.') && cleanPrice.indexOf('.') < cleanPrice.lastIndexOf('.')) {
        // Formato tipo 19.000 -> Quitar los puntos
        cleanPrice = cleanPrice.replace(/\./g, '');
      }
      
      // Si usa comas como separadores de miles y hay al menos una
      if (cleanPrice.includes(',') && cleanPrice.indexOf(',') < cleanPrice.length - 3) {
        // Formato tipo 19,000 -> Quitar las comas
        cleanPrice = cleanPrice.replace(/,/g, '');
      }
    }
    
    // Procesar el precio regular si existe
    let cleanRegularPrice = '';
    if (product.regular_price && typeof product.regular_price === 'string') {
      cleanRegularPrice = product.regular_price.replace(/COP\s*/, '').trim();
      
      // Si tiene puntos como separadores de miles
      if (cleanRegularPrice.includes('.') && cleanRegularPrice.indexOf('.') < cleanRegularPrice.lastIndexOf('.')) {
        cleanRegularPrice = cleanRegularPrice.replace(/\./g, '');
      }
      
      // Si usa comas como separadores de miles
      if (cleanRegularPrice.includes(',') && cleanRegularPrice.indexOf(',') < cleanRegularPrice.length - 3) {
        cleanRegularPrice = cleanRegularPrice.replace(/,/g, '');
      }
    }
    
    const cartProduct = {
      id: product.id,
      name: product.title,
      price: cleanPrice,
      regular_price: cleanRegularPrice || '',
      sale_price: product.has_sale ? cleanPrice : '',
      images: product.image ? [{ src: product.image }] : []
    };
    
    console.log('Agregando producto al carrito:', {
      original: product.price,
      limpio: cleanPrice
    });
    
    cartService.addItem(cartProduct, 1);
    setQuantities(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    
    // Mostrar alerta y disparar evento para actualizar el contador del carrito
    alertService.success(`${product.title} añadido al carrito`);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };
  
  const handleUpdateQuantity = (product: PromotionalProduct, newQuantity: number) => {
    if (newQuantity <= 0) {
      cartService.removeItem(product.id);
      setQuantities(prev => ({ ...prev, [product.id]: 0 }));
      alertService.info(`${product.title} eliminado del carrito`);
    } else {
      cartService.updateItemQuantity(product.id, newQuantity);
      setQuantities(prev => ({ ...prev, [product.id]: newQuantity }));
      
      // Si estamos incrementando la cantidad, mostrar alerta
      if (newQuantity > (quantities[product.id] || 0)) {
        alertService.success(`${product.title} añadido al carrito`);
      }
    }
    
    // Disparar evento personalizado para actualizar el contador del carrito
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  if (loading) {
    return (
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs uppercase tracking-wider font-medium text-gray-400 mb-3">No te puede faltar</p>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primario"></div>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null; // No mostrar nada si hay un error o no hay productos
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-100 product-animate">
      <p className="text-xs uppercase tracking-wider font-medium text-gray-400 mb-3">No te puede faltar</p>
      
      <div className="flex flex-col items-start space-y-2">
        {products.map((product) => (
          <div key={product.id} className="flex w-full items-center">
            <Link 
              to={`/producto/${product.slug}`}
              className="promo-grid-item group inline-flex items-center py-1.5 px-3 mr-2 flex-grow rounded-md 
                       bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm 
                       hover:bg-white/80 hover:shadow-md transition-all"
              data-component-name="LinkWithRef"
            >
              {/* Imagen pequeña */}
              <div className="w-8 h-8 flex-shrink-0 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'} 
                  alt={product.title}
                  className="w-6 h-6 object-contain"
                />
              </div>
              
              {/* Título y precio */}
              <div className="flex items-center ml-3">
                <span className="text-xs text-gray-600 mr-3">{product.title}</span>
                
                {/* Precio */}
                <div className="flex-shrink-0 flex items-center">
                  {product.has_sale && product.regular_price && (
                    <span className="text-xs text-gray-400 line-through mr-1">
                      {formatCurrency(product.regular_price)}
                    </span>
                  )}
                  <span className="text-xs font-medium text-primario">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                
                <svg 
                  className="w-3 h-3 text-gray-400 group-hover:text-primario transition-colors ml-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  data-component-name="PromotionalGrid"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            
            {/* Botón de agregar al carrito o controles de cantidad */}
            {quantities[product.id] === 0 || !quantities[product.id] ? (
              <button
                onClick={() => handleAddToCart(product)}
                className="flex items-center justify-center p-1.5 rounded-full bg-white shadow-sm hover:bg-primario hover:text-white transition-colors border border-gray-100"
                title="Agregar al carrito"
              >
                <FiShoppingCart size={14} />
              </button>
            ) : (
              <div className="flex items-center border border-primario rounded overflow-hidden">
                <button 
                  onClick={() => handleUpdateQuantity(product, (quantities[product.id] || 0) - 1)}
                  className="bg-primario/10 hover:bg-primario/20 text-primario p-1 transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <FiMinus size={14} />
                </button>
                <span className="px-2 text-xs font-medium min-w-[20px] text-center">{quantities[product.id]}</span>
                <button 
                  onClick={() => handleUpdateQuantity(product, (quantities[product.id] || 0) + 1)}
                  className="bg-primario/10 hover:bg-primario/20 text-primario p-1 transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalGrid;
