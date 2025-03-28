import { FC } from 'react';
import { Link } from 'react-router-dom';
import { MenuCategory } from '../../types/menu';
import { FiGift } from 'react-icons/fi';

interface MainMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  categories: MenuCategory[];
  openPointsModal: () => void;
}

// Función auxiliar para formatear texto a formato título (primera letra mayúscula, resto minúsculas)
const formatTitleCase = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const MainMenu: FC<MainMenuProps> = ({ activeTab, setActiveTab, categories, openPointsModal }) => {
  return (
    <nav className="flex items-center justify-center w-full">
      <div className="flex items-center space-x-8">
        <Link 
          to="/" 
          className={`text-sm font-bold px-3 py-2 rounded-md transition-all duration-300 text-white hover:text-primario hover:bg-secundario capitalize tab-push-effect ${
            activeTab === 'inicio' 
              ? 'border-b-2 border-white' 
              : ''
          }`} 
          onClick={() => setActiveTab('inicio')}
        >
          Inicio
        </Link>
        
        {categories.map(category => (
          <div key={category.id} className="relative group">
            <Link 
              to={`/categoria/${category.slug}`}
              className={`text-sm font-bold flex items-center px-3 py-2 rounded-md transition-all duration-300 text-white hover:text-primario hover:bg-secundario capitalize tab-push-effect ${
                activeTab === category.slug 
                  ? 'border-b-2 border-white' 
                  : ''
              }`}
              onClick={() => setActiveTab(category.slug)}
            >
              {formatTitleCase(category.name)}
              {category.subcategories && category.subcategories.length > 0 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </Link>
            
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 hidden group-hover:block">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {category.subcategories.map(subcategory => (
                    <Link 
                      key={subcategory.id} 
                      to={`/categoria/${subcategory.slug}`}
                      className="block px-4 py-2 text-sm font-bold text-texto hover:bg-secundario hover:text-primario transition-all duration-300 capitalize"
                      role="menuitem"
                    >
                      {formatTitleCase(subcategory.name)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        <Link 
          to="/contacto" 
          className={`text-sm font-bold px-3 py-2 rounded-md transition-all duration-300 text-white hover:text-primario hover:bg-secundario capitalize tab-push-effect ${
            activeTab === 'contacto' 
              ? 'border-b-2 border-white' 
              : ''
          }`} 
          onClick={() => setActiveTab('contacto')}
        >
          Contacto
        </Link>
        
        <button 
          className={`text-sm font-bold px-3 py-2 rounded-md transition-all duration-300 text-primario bg-secundario capitalize tab-push-effect flex items-center ${
            activeTab === 'referidos' 
              ? 'border-b-2 border-white' 
              : ''
          }`} 
          onClick={openPointsModal}
          data-component-name="LinkWithRef"
        >
          <FiGift className="mr-1" /> Mis puntos
        </button>
      </div>
    </nav>
  );
};

export default MainMenu;
