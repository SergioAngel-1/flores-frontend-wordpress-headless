import React from 'react';
import { Link } from 'react-router-dom';

// Interfaces
export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  link: string;
}

interface FeaturedCategoriesProps {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  categories,
  loading,
  error
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-oscuro">Categorías Destacadas</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 mb-4">
          Error al cargar las categorías destacadas. Por favor, intenta nuevamente.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 grid-flow-row-dense">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-animate group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl flex flex-col h-full"
            >
              <Link
                to={category.link}
                className="block relative flex-grow"
                style={{ minHeight: '0', height: '0', paddingBottom: '100%' }}
              >
                {/* Imagen con fallback */}
                {category.image ? (
                  <img
                    src={category.image || undefined}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500 text-xs text-center">Sin imagen</span>
                  </div>
                )}
                
                {/* Degradado sobre la imagen */}
                <div className="absolute inset-0 bg-gradient-to-t from-oscuro/20 to-transparent"></div>
              </Link>
              
              {/* Footer con nombre de categoría */}
              <Link to={category.link} className="block">
                <div className="bg-primario py-2 px-1 text-center">
                  <span className="text-white text-center text-[10px] sm:text-[9px] md:text-[8px] lg:text-xs font-medium line-clamp-2 w-full">
                    {category.name}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCategories;
