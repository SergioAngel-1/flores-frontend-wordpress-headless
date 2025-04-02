import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSearchProducts } from '../hooks/useWooCommerce';
import { Product } from '../types/woocommerce';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import alertService from '../services/alertService';

// Componente ProductCard inline para evitar problemas de importación
const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    // Utilizar el contexto del carrito para añadir el producto
    addItem(product);
    
    // Mostrar alerta de producto añadido
    alertService.success(`${product.name} añadido al carrito`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <Link to={`/producto/${product.slug}`} className="block">
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={product.images && product.images.length > 0 ? product.images[0].src : '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <div className="mb-2">
          {product.categories && product.categories.length > 0 && (
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {product.categories[0].name}
            </span>
          )}
        </div>
        
        <Link to={`/producto/${product.slug}`} className="block">
          <h3 className="font-medium text-gray-900 mb-2 hover:text-primario transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-bold text-primario">
            ${product.price}
          </span>
          
          <button 
            onClick={handleAddToCart}
            className="bg-primario text-white px-3 py-1 rounded-md text-sm hover:bg-primario-dark transition-colors"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Loader inline para evitar problemas de importación
const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <svg className="animate-spin h-8 w-8 text-primario" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="ml-3 text-gray-600">Cargando...</span>
    </div>
  );
};

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const { data: products, loading, error } = useSearchProducts(query);
  
  // Título de la página
  useEffect(() => {
    document.title = `Búsqueda: ${query} - Flores Inc`;
  }, [query]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Resultados de búsqueda para: <span className="text-primario">{query}</span>
      </h1>
      
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader />
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          Error al cargar los resultados. Por favor, intenta de nuevo más tarde.
        </div>
      )}
      
      {!loading && products && products.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <h2 className="text-xl font-medium mb-2">No se encontraron productos</h2>
          <p className="text-gray-600">
            No encontramos productos que coincidan con "{query}". Intenta con otra búsqueda.
          </p>
        </div>
      )}
      
      {!loading && products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
