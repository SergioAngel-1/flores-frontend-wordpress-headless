import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

export interface MenuItem {
  id: number;
  name: string;
  slug: string;
  url: string;
  children?: MenuItem[];
}

interface MainMenuProps {
  items: MenuItem[];
  className?: string;
}

const MainMenu = ({ items, className = '' }: MainMenuProps) => {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Cerrar submenús al cambiar de ruta
  useEffect(() => {
    setActiveItem(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Manejar animaciones de submenús
  useEffect(() => {
    const submenu = document.querySelector(`.submenu-${activeItem}`);
    if (submenu) {
      gsap.fromTo(
        submenu,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  }, [activeItem]);

  const handleItemClick = (id: number) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`main-menu ${className}`}>
      {/* Menú para escritorio */}
      <ul className="hidden md:flex space-x-6">
        {items.map((item) => (
          <li key={item.id} className="relative group">
            {item.children && item.children.length > 0 ? (
              <>
                <button
                  className={`flex items-center text-gray-700 hover:text-primary-600 font-medium ${
                    activeItem === item.id ? 'text-primary-600' : ''
                  }`}
                  onClick={() => handleItemClick(item.id)}
                  aria-expanded={activeItem === item.id}
                >
                  {item.name}
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform ${
                      activeItem === item.id ? 'rotate-180' : ''
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
                
                {activeItem === item.id && (
                  <div className={`submenu-${item.id} absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20`}>
                    <ul className="py-2">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to={child.url}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.url}
                className={`text-gray-700 hover:text-primary-600 font-medium ${
                  location.pathname === item.url ? 'text-primary-600' : ''
                }`}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
      
      {/* Botón de menú móvil */}
      <button
        className="md:hidden text-gray-700 hover:text-primary-600 focus:outline-none"
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      
      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-20">
          <ul className="py-2">
            {items.map((item) => (
              <li key={item.id}>
                {item.children && item.children.length > 0 ? (
                  <div>
                    <button
                      className={`flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                        activeItem === item.id ? 'bg-gray-100 text-primary-600' : ''
                      }`}
                      onClick={() => handleItemClick(item.id)}
                      aria-expanded={activeItem === item.id}
                    >
                      {item.name}
                      <svg
                        className={`ml-1 w-4 h-4 transition-transform ${
                          activeItem === item.id ? 'rotate-180' : ''
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
                    
                    {activeItem === item.id && (
                      <ul className="bg-gray-50 py-2">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              to={child.url}
                              className="block pl-8 pr-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.url}
                    className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 ${
                      location.pathname === item.url ? 'bg-gray-100 text-primary-600' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default MainMenu;
