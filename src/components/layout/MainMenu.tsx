import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../data/menuCategories';

interface MainMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  categories: Category[];
}

const MainMenu: FC<MainMenuProps> = ({ activeTab, setActiveTab, categories }) => {
  return (
    <nav className="flex items-center justify-center w-full">
      <div className="flex items-center space-x-8">
        <Link 
          to="/" 
          className={`text-sm font-medium ${activeTab === 'inicio' ? 'text' : 'hover:text-primario'}`} 
          onClick={() => setActiveTab('inicio')}
        >
          Inicio
        </Link>
        
        {categories.map(category => (
          <div key={category.id} className="relative group">
            <Link 
              to={`/categoria/${category.slug}`}
              className={`text-sm font-medium flex items-center ${activeTab === category.slug ? 'text-primario' : 'hover:text-primario'}`}
              onClick={() => setActiveTab(category.slug)}
            >
              {category.name}
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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        <Link 
          to="/contacto" 
          className={`text-sm font-medium ${activeTab === 'contacto' ? 'text-primario' : 'hover:text-primario'}`} 
          onClick={() => setActiveTab('contacto')}
        >
          Contacto
        </Link>
      </div>
    </nav>
  );
};

export default MainMenu;
