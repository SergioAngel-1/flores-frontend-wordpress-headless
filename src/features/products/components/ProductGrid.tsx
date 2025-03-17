import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import Spinner from '../../../core/components/ui/Spinner';
import Alert from '../../../core/components/ui/Alert';
import { Product } from '../../../core/services/api';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  columns?: 2 | 3 | 4;
  showPagination?: boolean;
  itemsPerPage?: number;
}

const ProductGrid = ({
  products,
  loading,
  error,
  columns = 3,
  showPagination = false,
  itemsPerPage = 12,
}: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Configurar el número de columnas
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  // Actualizar productos paginados cuando cambian los productos o la página
  useEffect(() => {
    if (showPagination) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedProducts(products.slice(startIndex, endIndex));
    } else {
      setPaginatedProducts(products);
    }
  }, [products, currentPage, itemsPerPage, showPagination]);

  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Renderizar paginación
  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <nav className="flex items-center space-x-1">
          {/* Botón anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Página anterior"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Números de página */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Botón siguiente */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Página siguiente"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </nav>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" title="Error al cargar productos">
        {error}
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No hay productos disponibles</h3>
        <p className="mt-1 text-gray-500">Intenta ajustar los filtros o busca de nuevo más tarde.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {renderPagination()}
    </div>
  );
};

export default ProductGrid;
