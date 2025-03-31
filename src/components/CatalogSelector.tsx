import React, { useState, useEffect } from 'react';
import { catalogExtraService, CatalogExtra } from '../services/catalogExtraService';
import { FaSpinner, FaSearch } from 'react-icons/fa';

interface CatalogSelectorProps {
  onSelectCatalog: (catalog: CatalogExtra) => void;
}

const CatalogSelector: React.FC<CatalogSelectorProps> = ({ onSelectCatalog }) => {
  const [catalogs, setCatalogs] = useState<CatalogExtra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        const data = await catalogExtraService.getAll();
        setCatalogs(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los catálogos:', err);
        setError('No se pudieron cargar los catálogos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  const filteredCatalogs = catalogs.filter(catalog => 
    catalog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-primario mb-6">Seleccionar Catálogo</h2>
      
      <div className="mb-6 relative">
        <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primario focus-within:border-primario transition-all">
          <div className="px-4 py-2 text-texto flex items-center">
            <FaSearch className="text-primario" />
          </div>
          <input
            type="text"
            placeholder="Buscar catálogo..."
            className="w-full px-2 py-2 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="px-4 text-texto hover:text-primario"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-primario text-2xl" />
          <span className="ml-2 text-texto">Cargando catálogos...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      ) : filteredCatalogs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No se encontraron catálogos{searchTerm ? ` que coincidan con "${searchTerm}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalogs.map(catalog => (
            <div 
              key={catalog.id}
              className="border border-border rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white hover:bg-gray-50 flex flex-col"
              onClick={() => onSelectCatalog(catalog)}
            >
              <div className="flex items-center mb-3">
                {catalog.logo ? (
                  <img 
                    src={catalog.logo} 
                    alt={catalog.title} 
                    className="w-14 h-14 object-contain mr-3 rounded-md border border-gray-200 p-1"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primario rounded-md flex items-center justify-center mr-3 text-white">
                    <span className="font-bold text-xl">
                      {catalog.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-primario text-lg">{catalog.title}</h3>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {catalog.products.length} productos
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-2 border-t border-gray-100 flex justify-end">
                <button className="text-primario hover:text-oscuro text-sm font-medium inline-flex items-center">
                  Ver catálogo <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogSelector;
