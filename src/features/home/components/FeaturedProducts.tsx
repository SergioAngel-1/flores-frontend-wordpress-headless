import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Product } from '../../../core/types/woocommerce';
import ProductCard from '../../products/components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedProductsProps {
  products: Product[];
  loading: boolean;
  error: any;
}

const FeaturedProducts = ({ products, loading, error }: FeaturedProductsProps) => {
  // Animaciones con GSAP
  useEffect(() => {
    if (loading || error || products.length === 0) return;
    
    const productItems = document.querySelectorAll('.product-item');
    
    gsap.fromTo(
      productItems,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.featured-products',
          start: 'top 80%',
        }
      }
    );
    
    return () => {
      // Limpiar animaciones
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [products, loading, error]);

  if (loading) {
    return (
      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Productos destacados</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Productos destacados</h2>
        <p className="text-center text-red-500">
          Error al cargar los productos. Por favor, intenta de nuevo más tarde.
        </p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Productos destacados</h2>
        <p className="text-center">No hay productos destacados disponibles en este momento.</p>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-10">Productos destacados</h2>
      
      <div className="featured-products grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {products.map((product) => (
          <div key={product.id} className="product-item">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
