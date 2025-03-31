import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import queryService from '../services/queryServices';
import { Product } from '../types/woocommerce';

// Opciones para la cuadrícula de productos
interface ProductGridOptions {
  categoryId?: number;
  searchTerm?: string;
  perPage?: number;
  sortBy?: 'date' | 'price' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
  showPagination?: boolean;
  infiniteScroll?: boolean;
  gridClassName?: string;
  onDataLoaded?: (products: Product[], totalItems: number) => void;
}

const OptimizedProductGrid: React.FC<ProductGridOptions> = ({
  categoryId,
  searchTerm,
  perPage = 12,
  sortBy = 'date',
  sortOrder = 'desc',
  featured = false,
  showPagination = true,
  infiniteScroll = false,
  gridClassName = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  onDataLoaded
}) => {
  // Estado para los productos y metadatos
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Referencia para el observador de intersection (para infinite scroll)
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && infiniteScroll) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, infiniteScroll]);

  // Función para cargar productos
  const loadProducts = useCallback(async (currentPage: number, shouldAppend = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar parámetros para la consulta
      const params: Record<string, any> = {
        orderby: sortBy,
        order: sortOrder,
        featured: featured
      };
      
      // Agregar parámetros condicionales
      if (categoryId) {
        params.category = categoryId;
      }
      
      let result;
      
      // Usar el término de búsqueda o cargar productos normalmente
      if (searchTerm && searchTerm.trim() !== '') {
        result = await queryService.getPaginatedProducts(
          currentPage,
          perPage,
          { ...params, search: searchTerm },
          {
            // No cachear resultados de búsqueda si son muy específicos
            ttl: searchTerm.length > 3 ? 60 * 1000 : 5 * 60 * 1000, // 1 minuto o 5 minutos
            loadingCallback: (isLoading) => setLoading(isLoading),
            errorCallback: (err) => setError(err.message || 'Error al cargar productos')
          }
        );
      } else {
        // Carga normal de productos con caché
        result = await queryService.getPaginatedProducts(
          currentPage,
          perPage,
          params,
          {
            loadingCallback: (isLoading) => setLoading(isLoading),
            errorCallback: (err) => setError(err.message || 'Error al cargar productos')
          }
        );
      }
      
      // Actualizar estado con los datos recibidos
      setTotalPages(result.totalPages);
      setHasMore(currentPage < result.totalPages);
      
      // En scroll infinito, añadir productos a los existentes
      if (shouldAppend && infiniteScroll) {
        setProducts(prev => [...prev, ...result.data]);
      } else {
        setProducts(result.data);
      }
      
      // Notificar datos cargados a través del callback
      if (onDataLoaded) {
        onDataLoaded(result.data, result.totalItems);
      }
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [categoryId, searchTerm, perPage, sortBy, sortOrder, featured, infiniteScroll, onDataLoaded]);

  // Cargar productos cuando cambian los parámetros o la página
  useEffect(() => {
    // Reset a la página 1 cuando cambian los filtros
    if (page !== 1) {
      setPage(1);
      setProducts([]);
    } else {
      loadProducts(1, false);
    }
  }, [categoryId, searchTerm, perPage, sortBy, sortOrder, featured, loadProducts]);

  // Efecto para cargar más productos en scroll infinito
  useEffect(() => {
    if (page > 1) {
      loadProducts(page, true);
    }
  }, [page, loadProducts]);

  // Renderizado de los productos
  const renderProducts = () => {
    if (error) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-red-500">
            {error}
            <button 
              onClick={() => loadProducts(page, false)} 
              className="ml-4 text-blue-500 underline"
            >
              Reintentar
            </button>
          </p>
        </div>
      );
    }

    if (products.length === 0 && !loading) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No se encontraron productos.</p>
        </div>
      );
    }

    return products.map((product, index) => {
      // Determinar si este es el último elemento para referencia de intersection
      const isLastElement = index === products.length - 1;
      
      return (
        <div 
          key={product.id} 
          ref={isLastElement ? lastProductRef : undefined}
          className="product-card transition-transform hover:scale-105"
        >
          <Link to={`/producto/${product.slug}`} className="block">
            {/* Imagen del producto con lazy loading */}
            <div className="relative pb-[100%] bg-gray-100 overflow-hidden rounded">
              {product.images && product.images[0] && (
                <img 
                  src={product.images[0].src} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover object-center transition-opacity"
                  loading="lazy" // Lazy loading nativo
                />
              )}
              
              {/* Indicadores (oferta, agotado, etc) */}
              {product.on_sale && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Oferta
                </span>
              )}
              
              {product.stock_status === 'outofstock' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold">Agotado</span>
                </div>
              )}
            </div>
            
            {/* Información del producto */}
            <div className="mt-2">
              <h3 className="font-medium text-sm text-gray-800 truncate">{product.name}</h3>
              
              <div className="flex items-baseline mt-1">
                {product.on_sale && product.regular_price ? (
                  <>
                    <span className="text-sm font-bold text-gray-900">
                      ${product.sale_price}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 line-through">
                      ${product.regular_price}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-gray-900">
                    ${product.price}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      );
    });
  };

  // Renderizado de la paginación
  const renderPagination = () => {
    if (!showPagination || infiniteScroll || totalPages <= 1) {
      return null;
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className={`px-3 py-1 rounded ${
            page === 1 || loading 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          Anterior
        </button>
        
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </span>
        
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          className={`px-3 py-1 rounded ${
            page === totalPages || loading 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          Siguiente
        </button>
      </div>
    );
  };

  return (
    <div className="product-grid-container">
      {/* Estado de carga inicial */}
      {loading && products.length === 0 && (
        <div className="w-full flex justify-center py-12">
          <div className="loader"></div> {/* Requiere CSS de loader */}
        </div>
      )}
      
      {/* Cuadrícula de productos */}
      <div className={gridClassName}>
        {renderProducts()}
      </div>
      
      {/* Indicador de carga para scroll infinito */}
      {loading && products.length > 0 && infiniteScroll && (
        <div className="w-full flex justify-center py-4">
          <div className="loader-small"></div> {/* Loader más pequeño */}
        </div>
      )}
      
      {/* Paginación */}
      {renderPagination()}
      
      {isLoadingMore && infiniteScroll && (
        <div className="w-full flex justify-center py-4">
          <div className="loader-small"></div> {/* Loader más pequeño */}
        </div>
      )}
    </div>
  );
};

export default OptimizedProductGrid;
