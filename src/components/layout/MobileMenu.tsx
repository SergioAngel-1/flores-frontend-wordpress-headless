import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../data/menuCategories';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  categories: Category[];
}

const MobileMenu: FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  categories 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
      <div className="bg-white h-full w-4/5 max-w-sm overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/" 
                className={`block py-2 px-4 rounded-md ${activeTab === 'inicio' ? 'bg-primario text-white' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  setActiveTab('inicio');
                  onClose();
                }}
              >
                Inicio
              </Link>
            </li>
            
            {categories.map(category => (
              <li key={category.id} className="py-1">
                <div className="flex flex-col">
                  <Link 
                    to={`/categoria/${category.slug}`}
                    className={`block py-2 px-4 rounded-md ${activeTab === category.slug ? 'bg-primario text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => {
                      setActiveTab(category.slug);
                      onClose();
                    }}
                  >
                    {category.name}
                  </Link>
                  
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.subcategories.map(subcategory => (
                        <Link
                          key={subcategory.id}
                          to={`/categoria/${subcategory.slug}`}
                          className="block py-1 px-4 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                          onClick={onClose}
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
            
            <li>
              <Link 
                to="/contacto" 
                className={`block py-2 px-4 rounded-md ${activeTab === 'contacto' ? 'bg-primario text-white' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  setActiveTab('contacto');
                  onClose();
                }}
              >
                Contacto
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
