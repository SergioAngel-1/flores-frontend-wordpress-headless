import React, { useState, useEffect, memo } from 'react';
import { gsap } from 'gsap';
import { productService } from '../../services/api';
import { Product } from '../../types/woocommerce';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  productId: number;
  categoryIds: number[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ productId, categoryIds }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryIds.length) return;
      
      try {
        setLoading(true);
        // Obtener productos de la misma categoría, excluyendo el producto actual
        const mainCategoryId = categoryIds[0]; // Usamos la primera categoría como principal
        const response = await productService.getByCategory(mainCategoryId, { per_page: 5 });
        
        // Filtrar para excluir el producto actual y limitar a 4 productos
        const filteredProducts = response.data
          .filter((product: Product) => product.id !== productId)
          .slice(0, 4);
        
        setProducts(filteredProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, categoryIds]);

  // Animaciones con GSAP
  useEffect(() => {
    if (!loading && products.length > 0) {
      const productCards = document.querySelectorAll('.related-product-card');
      
      gsap.fromTo(
        productCards,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'power2.out' 
        }
      );
    }
  }, [loading, products]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primario"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // No mostrar nada si no hay productos relacionados
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-oscuro mb-6">Productos relacionados</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            animationClass="related-product-card"
          />
        ))}
      </div>
    </div>
  );
};

// Usar React.memo para evitar re-renderizados innecesarios
export default memo(RelatedProducts, (prevProps, nextProps) => {
  // Solo re-renderizar si cambia el ID del producto o las categorías
  return (
    prevProps.productId === nextProps.productId &&
    prevProps.categoryIds.length === nextProps.categoryIds.length &&
    prevProps.categoryIds.every((id, index) => id === nextProps.categoryIds[index])
  );
});
