import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import axios from 'axios';

interface PromotionalProduct {
  id: number;
  title: string;
  image: string;
  url: string;
  price: string;
  regular_price?: string;
  has_sale: boolean;
}

const PromotionalGrid: React.FC = () => {
  const [products, setProducts] = useState<PromotionalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotionalProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/wp-json/floresinc/v1/promotional-grid');
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
          <Link 
            key={product.id} 
            to={product.url} 
            className="promo-grid-item group inline-flex items-center py-1.5 px-3 rounded-md 
                       bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm 
                       hover:bg-white/80 hover:shadow-md transition-all"
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
                  <span className="text-xs text-gray-400 line-through mr-1">{product.regular_price}</span>
                )}
                <span className="text-xs font-medium text-primario">{product.price}</span>
              </div>
              
              <svg 
                className="w-3 h-3 text-gray-400 group-hover:text-primario transition-colors ml-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PromotionalGrid;
