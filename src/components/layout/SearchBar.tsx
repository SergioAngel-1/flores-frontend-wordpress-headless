import { FC, useState, useRef, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSearchProducts } from '../../hooks/useWooCommerce';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showResults?: boolean;
  setShowResults?: (show: boolean) => void;
}

const SearchBar: FC<SearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm,
  showResults: externalShowResults,
  setShowResults: externalSetShowResults
}) => {
  const [internalShowResults, setInternalShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: searchResults, loading: searchLoading } = useSearchProducts(searchTerm);
  
  // Usar el estado externo si está disponible, de lo contrario usar el interno
  const showResults = externalShowResults !== undefined ? externalShowResults : internalShowResults;
  const setShowResults = externalSetShowResults || setInternalShowResults;

  // Cerrar resultados de búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowResults]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="hidden md:block flex-grow max-w-xl mx-4 relative" ref={searchRef}>
      <input 
        type="text" 
        placeholder="Buscar productos..." 
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setShowResults(true)}
      />
      
      {/* Icono de búsqueda */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Resultados de búsqueda */}
      {(showResults) && searchTerm && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-96 overflow-y-auto">
          {searchLoading && (
            <div className="px-4 py-4 text-sm text-gray-500 text-center">
              <div className="flex justify-center items-center">
                <svg className="animate-spin h-5 w-5 text-primario" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Buscando...</span>
              </div>
            </div>
          )}
          
          {!searchLoading && searchResults && searchResults.length === 0 && (
            <div className="px-4 py-4 text-sm text-gray-500 text-center">
              No se encontraron resultados para "<span className="font-medium">{searchTerm}</span>"
            </div>
          )}
          
          {/* Categorías */}
          {!searchLoading && searchResults && searchResults.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-700 text-sm mb-2">CATEGORÍAS:</h3>
              {Array.from(new Set(searchResults.map(product => 
                product.categories && product.categories.length > 0 ? 
                product.categories[0].name : 'Sin categoría'
              ))).map(category => (
                <Link 
                  key={category} 
                  to={`/categoria/${category}`}
                  className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setShowResults(false)}
                >
                  {category}
                </Link>
              ))}
            </div>
          )}
          
          {/* Productos */}
          {!searchLoading && searchResults && searchResults.length > 0 && (
            <div className="px-4 py-2">
              <h3 className="font-medium text-gray-700 text-sm mb-2">PRODUCTOS:</h3>
              {searchResults.map(product => (
                <Link 
                  key={product.id} 
                  to={`/producto/${product.slug}`}
                  className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setShowResults(false)}
                >
                  <div className="w-10 h-10 flex-shrink-0 mr-2 bg-gray-200 rounded overflow-hidden">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0].src : 'https://via.placeholder.com/50'} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {product.categories && product.categories.length > 0 ? product.categories[0].name : 'Sin categoría'}
                    </p>
                  </div>
                  <div className="text-green-600 font-medium">${product.price}</div>
                </Link>
              ))}
            </div>
          )}
          
          {!searchLoading && searchResults && searchResults.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 text-center">
              <Link 
                to={`/busqueda?q=${encodeURIComponent(searchTerm)}`}
                className="text-sm text-primario font-medium hover:underline"
                onClick={() => setShowResults(false)}
              >
                Ver todos los resultados
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
