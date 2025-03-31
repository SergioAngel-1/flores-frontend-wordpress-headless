import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types/woocommerce';
import { generateSlug } from '../../utils/formatters';

interface BreadcrumbsProps {
  categories?: Category[];
  currentProduct?: string;
  currentCategory?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ categories, currentProduct, currentCategory }) => {
  // Filtrar categorías duplicadas y ordenarlas de más general a más específica
  // Las categorías ancestras deben aparecer primero, seguidas por las más específicas
  const filteredCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    // Filtrar categorías duplicadas
    const uniqueCategories = categories.filter((category, index, self) => 
      index === self.findIndex((c) => c.id === category.id)
    );
    
    // Si hay una categoría actual, no mostrarla en la lista de categorías
    const withoutCurrent = currentCategory 
      ? uniqueCategories.filter(category => category.name.toLowerCase() !== currentCategory.toLowerCase())
      : uniqueCategories;
    
    // Ordenar categorías por nivel de jerarquía (asumiendo que vienen en orden inverso)
    // Esto asume que la primera categoría es la más específica y la última es la más general
    return [...withoutCurrent].reverse();
  }, [categories, currentCategory]);

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primario">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            Inicio
          </Link>
        </li>
        
        <li>
          <div className="flex items-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            <Link 
              to="/tienda" 
              className="ml-1 text-sm text-gray-500 hover:text-primario md:ml-2"
            >
              Tienda
            </Link>
          </div>
        </li>
        
        {filteredCategories && filteredCategories.length > 0 && filteredCategories.map((category) => (
          <li key={category.id}>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <Link 
                to={`/categoria/${category.slug || generateSlug(category.name)}`} 
                className="ml-1 text-sm text-gray-500 hover:text-primario md:ml-2"
              >
                {category.name}
              </Link>
            </div>
          </li>
        ))}
        
        {currentCategory && (
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <Link 
                to={`/categoria/${generateSlug(currentCategory)}`} 
                className="ml-1 text-sm text-gray-500 hover:text-primario md:ml-2"
              >
                {currentCategory}
              </Link>
            </div>
          </li>
        )}
        
        {currentProduct && (
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm font-medium text-primario md:ml-2">{currentProduct}</span>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
