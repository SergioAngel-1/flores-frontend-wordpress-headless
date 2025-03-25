import { FC, useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
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
  const { data: searchResults, loading: searchLoading, error } = useSearchProducts(searchTerm);
  
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Si pulsa Escape, cerrar los resultados
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div className="hidden md:block flex-grow max-w-xl mx-4 relative" ref={searchRef}>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Buscar productos..." 
          className="w-full px-4 py-2 border border-primario rounded-md focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
        />
        
        {/* Icono de búsqueda */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-oscuro" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Botón para limpiar la búsqueda */}
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setShowResults(false);
            }}
            className="absolute inset-y-0 right-8 flex items-center pr-3 text-gray-500 hover:text-oscuro"
            aria-label="Limpiar búsqueda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Resultados de búsqueda */}
      {(showResults) && searchTerm && searchTerm.trim().length >= 2 && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-30 max-h-96 overflow-y-auto">
          {searchLoading ? (
            <div className="p-4 text-center text-gray-600">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primario"></div>
              </div>
              <p className="mt-2">Buscando productos...</p>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div>
              <div className="p-2 border-b border-gray-200">
                <h3 className="font-semibold text-sm text-gray-600">Resultados para "{searchTerm}"</h3>
              </div>
              <ul>
                {searchResults.map(product => (
                  <li key={product.id} className="border-b border-gray-100 last:border-b-0">
                    <Link 
                      to={`/producto/${product.slug}`} 
                      className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setShowResults(false)}
                    >
                      {product.images && product.images[0] && (
                        <img 
                          src={product.images[0].src} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover mr-3 rounded-md"
                        />
                      )}
                      <div>
                        <p className="font-medium text-oscuro">{product.name}</p>
                        <p className="text-sm text-primario">${product.price}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : searchResults && searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              <p>No se encontraron productos para "{searchTerm}"</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Error al realizar la búsqueda</p>
              <p className="text-sm mt-1">Por favor, verifica la conexión con el servidor</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
