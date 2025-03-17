import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import floresLogo from '../../assets/images/flores-logo.png';
import { gsap } from 'gsap';
import { cartService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProfileModal from '../profile/ProfileModal';
import menuCategories from '../../data/menuCategories';
import MobileMenu from './MobileMenu';
import MainMenu from './MainMenu';
import SearchBar from './SearchBar';
import HeaderIcons from './HeaderIcons';
import AddressBar from './AddressBar';

const Header = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeProfileSection, setActiveProfileSection] = useState<'profile' | 'addresses' | 'orders' | 'favorites'>('profile');
  const searchRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Funciones
  const toggleMobileMenu = () => setIsMenuOpen(!isMenuOpen);

  // Abrir modal de perfil
  const openProfileModal = (section: 'profile' | 'addresses' | 'orders' | 'favorites' = 'profile') => {
    setActiveProfileSection(section);
    setIsProfileModalOpen(true);
  };

  // Cerrar modal de perfil
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Abrir sección de direcciones en el modal de perfil
  const openAddressSection = () => {
    openProfileModal('addresses');
  };

  // Actualizar contador de carrito
  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const count = cartService.getItemCount();
        setCartItemCount(count);
      } catch (error) {
        console.error('Error al obtener el contador del carrito:', error);
      }
    };

    updateCartCount();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(updateCartCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Efecto para manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efecto para cerrar resultados al hacer clic fuera
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
  }, []);

  // Animaciones con GSAP
  useEffect(() => {
    const logoElement = document.querySelector('.logo');
    const navItems = document.querySelectorAll('.nav-item');

    if (logoElement && navItems.length) {
      gsap.fromTo(
        logoElement,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );

      gsap.fromTo(
        navItems,
        { opacity: 0, y: -10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1, 
          ease: 'power2.out',
          delay: 0.3
        }
      );
    }
  }, []);

  return (
    <>
      {/* Top Bar con información de contacto y ofertas */}
      <div className="bg-white text-primario pb-2">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Link 
                to="/hiperofertas" 
                className="text-white text-sm font-bold hover:text-white flex items-center relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hiperofertas
              </Link>
              
              {/* Dirección actual */}
              <AddressBar 
                openProfileModal={openProfileModal}
                openAddressSection={openAddressSection}
              />
            </div>
            
            {/* Enlaces de la derecha */}
            <div className="flex items-center space-x-2">
              <Link 
                to="/seguimiento" 
                className="text-white text-sm font-bold hover:text-white relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario"
              >
                Seguir mi pedido
              </Link>
              <Link 
                to="/tiendas" 
                className="text-white text-sm font-bold hover:text-white hidden md:inline-block relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario"
              >
                Nuestras tiendas
              </Link>
              <Link 
                to="/catalogo" 
                className="text-white text-sm font-bold hover:text-white hidden md:inline-block relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario"
              >
                Catálogo
              </Link>
              <Link 
                to="/ayuda" 
                className="text-white text-sm font-bold hover:text-white hidden lg:inline-block relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario"
              >
                Ayuda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <header className={`w-full z-50 transition-all duration-300 font-poppins bg-white py-3 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src={floresLogo} alt="Flores Inc." className="h-10 md:h-12" />
              </Link>
            </div>

            {/* Barra de búsqueda */}
            <div className="hidden md:block flex-grow max-w-xl mx-4 relative" ref={searchRef}>
              <SearchBar 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showResults={showResults}
                setShowResults={setShowResults}
              />
            </div>

            {/* Iconos de cuenta y carrito */}
            <div className="md:hidden">
              {/* Botón de menú móvil */}
              <button 
                className="md:hidden text-primario hover:text-primario-dark"
                onClick={toggleMobileMenu}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <HeaderIcons 
              cartItemCount={cartItemCount}
              isAuthenticated={isAuthenticated}
              openProfileModal={openProfileModal}
            />
          </div>
        </div>
      </header>

      {/* Menú de navegación principal */}
      <div className="bg-primario border-b border-gray-200 py-2 hidden md:block px-2">
        <div className="container mx-auto px-2 sm:px-4">
          <MainMenu 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            categories={menuCategories}
          />
        </div>
      </div>

      {/* Menú móvil */}
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={toggleMobileMenu}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categories={menuCategories}
      />

      {/* Modal de perfil */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={closeProfileModal}
          activeSection={activeProfileSection}
        />
      )}
    </>
  );
};

export default Header;
