import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FilterOption {
  id: string | number;
  name: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  name: string;
  options: FilterOption[];
  isExpanded?: boolean;
}

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFiltersProps {
  filterGroups: FilterGroup[];
  priceRange: PriceRange;
  onFilterChange: (filters: Record<string, string[]>) => void;
  onPriceChange: (min: number, max: number) => void;
  className?: string;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const ProductFilters = ({
  filterGroups,
  priceRange,
  onFilterChange,
  onPriceChange,
  className = '',
  isMobile = false,
  onCloseMobile,
}: ProductFiltersProps) => {
  const [searchParams] = useSearchParams();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [priceValues, setPriceValues] = useState<{ min: number; max: number }>({
    min: priceRange.min,
    max: priceRange.max,
  });

  // Inicializar grupos expandidos
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    filterGroups.forEach((group) => {
      initialExpandedState[group.id] = group.isExpanded !== false; // Por defecto expandido
    });
    setExpandedGroups(initialExpandedState);
  }, [filterGroups]);

  // Inicializar filtros desde URL
  useEffect(() => {
    const filtersFromUrl: Record<string, string[]> = {};
    
    filterGroups.forEach((group) => {
      const paramValue = searchParams.get(group.id);
      if (paramValue) {
        filtersFromUrl[group.id] = paramValue.split(',');
      } else {
        filtersFromUrl[group.id] = [];
      }
    });
    
    // Precio desde URL
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    if (minPrice || maxPrice) {
      setPriceValues({
        min: minPrice ? parseInt(minPrice) : priceRange.min,
        max: maxPrice ? parseInt(maxPrice) : priceRange.max,
      });
    }
    
    setSelectedFilters(filtersFromUrl);
  }, [searchParams, filterGroups, priceRange]);

  // Manejar cambio de filtro
  const handleFilterChange = (groupId: string, optionId: string | number) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      
      if (!newFilters[groupId]) {
        newFilters[groupId] = [];
      }
      
      const optionIdStr = optionId.toString();
      
      if (newFilters[groupId].includes(optionIdStr)) {
        newFilters[groupId] = newFilters[groupId].filter((id) => id !== optionIdStr);
      } else {
        newFilters[groupId] = [...newFilters[groupId], optionIdStr];
      }
      
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  // Manejar cambio de precio
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? (type === 'min' ? priceRange.min : priceRange.max) : parseInt(value);
    
    setPriceValues((prev) => {
      const newValues = {
        ...prev,
        [type]: numValue,
      };
      
      // Asegurarse de que min no sea mayor que max
      if (type === 'min' && numValue > prev.max) {
        newValues.min = prev.max;
      }
      
      // Asegurarse de que max no sea menor que min
      if (type === 'max' && numValue < prev.min) {
        newValues.max = prev.min;
      }
      
      return newValues;
    });
  };

  // Aplicar filtro de precio
  const applyPriceFilter = () => {
    onPriceChange(priceValues.min, priceValues.max);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedFilters(
      Object.keys(selectedFilters).reduce((acc, key) => {
        acc[key] = [];
        return acc;
      }, {} as Record<string, string[]>)
    );
    
    setPriceValues({
      min: priceRange.min,
      max: priceRange.max,
    });
    
    onFilterChange({});
    onPriceChange(priceRange.min, priceRange.max);
  };

  // Contar filtros activos
  const countActiveFilters = () => {
    let count = 0;
    
    Object.values(selectedFilters).forEach((values) => {
      count += values.length;
    });
    
    if (priceValues.min !== priceRange.min || priceValues.max !== priceRange.max) {
      count += 1;
    }
    
    return count;
  };

  // Alternar expansión de grupo
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const activeFiltersCount = countActiveFilters();

  return (
    <div className={`product-filters ${className}`}>
      {/* Encabezado de filtros */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
        
        {isMobile && onCloseMobile && (
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onCloseMobile}
            aria-label="Cerrar filtros"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Botón para limpiar filtros */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          className="text-primary-600 hover:text-primary-800 text-sm font-medium mb-4"
          onClick={clearAllFilters}
        >
          Limpiar filtros ({activeFiltersCount})
        </button>
      )}
      
      {/* Filtro de precio */}
      <div className="mb-6">
        <button
          type="button"
          className="flex w-full items-center justify-between text-gray-900 font-medium"
          onClick={() => toggleGroupExpansion('price')}
        >
          <span>Precio</span>
          <svg
            className={`w-5 h-5 transition-transform ${
              expandedGroups['price'] ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        {expandedGroups['price'] && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="min-price" className="block text-sm text-gray-700 mb-1">
                  Mínimo
                </label>
                <input
                  type="number"
                  id="min-price"
                  value={priceValues.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  min={priceRange.min}
                  max={priceRange.max}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="max-price" className="block text-sm text-gray-700 mb-1">
                  Máximo
                </label>
                <input
                  type="number"
                  id="max-price"
                  value={priceValues.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  min={priceRange.min}
                  max={priceRange.max}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={applyPriceFilter}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md text-sm"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>
      
      {/* Grupos de filtros */}
      <div className="space-y-6">
        {filterGroups.map((group) => (
          <div key={group.id} className="border-t border-gray-200 pt-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-gray-900 font-medium"
              onClick={() => toggleGroupExpansion(group.id)}
            >
              <span>{group.name}</span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  expandedGroups[group.id] ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {expandedGroups[group.id] && (
              <div className="mt-4 space-y-2">
                {group.options.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <input
                      id={`${group.id}-${option.id}`}
                      type="checkbox"
                      checked={selectedFilters[group.id]?.includes(option.id.toString()) || false}
                      onChange={() => handleFilterChange(group.id, option.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`${group.id}-${option.id}`}
                      className="ml-3 text-sm text-gray-700"
                    >
                      {option.name}
                      {option.count !== undefined && (
                        <span className="text-gray-500 ml-1">({option.count})</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
