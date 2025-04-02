import { useState, useEffect, useRef } from 'react';
import floresLogo from '../../assets/images/flores-logo.png';
import { gsap } from 'gsap';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import ProfileModal from '../profile/ProfileModal';
import HiperofertasModal from '../products/HiperofertasModal';
import HelpModal from '../help/HelpModal';
import CartModal from '../cart/CartModal';
import FloresCoinsModal from '../modals/PointsModal';
import WalletModal from '../modals/WalletModal';
import MobileMenu from './MobileMenu';
import MainMenu from './MainMenu';
import SearchBar from './SearchBar';
import HeaderIcons from './HeaderIcons';
import { IoMdFlash } from 'react-icons/io';
import AddressBar from './AddressBar';
import useWordPressMenu from '../../hooks/useWordPressMenu';
import ScrollToTopLink from '../common/ScrollToTopLink';

const Header = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHiperofertasModalOpen, setIsHiperofertasModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isFloresCoinsModalOpen, setIsFloresCoinsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [helpModalInitialTab, setHelpModalInitialTab] = useState<'help' | 'howToOrder'>('help');
  const [activeTab, setActiveTab] = useState('inicio');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeProfileSection, setActiveProfileSection] = useState<'profile' | 'addresses' | 'orders' | 'referrals'>('profile');
  const searchRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { items } = useCart();

  // Obtener categorías del menú desde WordPress
  const { menuCategories, loading: menuLoading } = useWordPressMenu();

  // Funciones
  const toggleMobileMenu = () => setIsMenuOpen(!isMenuOpen);

  // Abrir modal de perfil
  const openProfileModal = (section: 'profile' | 'addresses' | 'orders' | 'referrals' = 'profile') => {
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

  // Abrir/cerrar modal de hiperofertas
  const openHiperofertasModal = () => {
    setIsHiperofertasModalOpen(true);
  };

  const closeHiperofertasModal = () => {
    setIsHiperofertasModalOpen(false);
  };

  // Abrir/cerrar modal de ayuda
  const openHelpModal = (tab: 'help' | 'howToOrder' = 'help') => {
    setHelpModalInitialTab(tab);
    setIsHelpModalOpen(true);
  };

  const closeHelpModal = () => {
    setIsHelpModalOpen(false);
  };

  // Abrir/cerrar modal de carrito
  const openCartModal = () => {
    setIsCartModalOpen(true);
  };

  const closeCartModal = () => {
    setIsCartModalOpen(false);
  };

  // Abrir/cerrar modal de Flores Coins
  const openFloresCoinsModal = () => {
    setIsFloresCoinsModalOpen(true);
  };

  const closeFloresCoinsModal = () => {
    setIsFloresCoinsModalOpen(false);
  };

  // Abrir modal de billetera
  const openWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  // Cerrar modal de billetera
  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  // Calcular el número de elementos en el carrito
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

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
        <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ScrollToTopLink 
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  openHiperofertasModal();
                }}
                className="tab-push flex items-center hover:text-white"
              >
                <IoMdFlash className="h-4 w-4 mr-1 text-yellow-500" />
                Hiperofertas
              </ScrollToTopLink>
              
              {/* Dirección actual */}
              <AddressBar 
                openProfileModal={openProfileModal}
                openAddressSection={openAddressSection}
              />
            </div>
            
            {/* Enlaces de la derecha */}
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <ScrollToTopLink
                  to="/mis-pedidos"
                  className="tab-push hover:text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    openProfileModal('orders');
                  }}
                >
                  Mis pedidos
                </ScrollToTopLink>
              )}
              <ScrollToTopLink 
                to="/referidos" 
                className="tab-push hidden md:inline-block hover:text-white"
              >
                Referidos
              </ScrollToTopLink>
              <ScrollToTopLink 
                to="#" 
                className="tab-push hidden md:inline-block hover:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  openHelpModal('howToOrder');
                }}
              >
                ¿Cómo pedir?
              </ScrollToTopLink>
              <ScrollToTopLink 
                to="#" 
                className="tab-push hidden lg:inline-block hover:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  openHelpModal('help');
                }}
              >
                Ayuda
              </ScrollToTopLink>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor para el espacio del header cuando está fijo */}
      <div className={`w-full ${isScrolled ? 'h-16 md:h-20' : 'h-0'}`}></div>

      {/* Header principal - fixed cuando se hace scroll */}
      <header className={`w-full transition-all duration-300 font-poppins py-3 bg-white z-40 ${
        isScrolled ? 'fixed top-0 left-0 right-0 shadow-lg z-50' : 'relative'
      }`}>
        <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <ScrollToTopLink to="/" className="flex items-center logo">
                <img src={floresLogo} alt="Flores Inc." className="h-10 md:h-12" />
              </ScrollToTopLink>
            </div>

            {/* Barra de búsqueda */}
            <div className="hidden md:block flex-grow max-w-xl lg:max-w-2xl xl:max-w-3xl mx-4 relative" ref={searchRef}>
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
              openCartModal={openCartModal}
              openWalletModal={openWalletModal}
            />
          </div>
        </div>
      </header>

      {/* Menú de navegación principal */}
      <div className={`bg-primario border-b border-gray-200 py-2 hidden md:block transition-all duration-300 z-30 ${
        isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
      }`}>
        <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4">
          {menuLoading ? (
            <div className="flex justify-center py-2">
              <div className="animate-pulse flex space-x-4">
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
                <div className="h-4 w-28 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          ) : (
            <MainMenu 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              categories={menuCategories}
              openFloresCoinsModal={openFloresCoinsModal}
            />
          )}
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

      {/* Modales */}
      {isProfileModalOpen && (
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={closeProfileModal} 
          activeSection={activeProfileSection}
        />
      )}
      
      {isHiperofertasModalOpen && (
        <HiperofertasModal 
          isOpen={isHiperofertasModalOpen} 
          onClose={closeHiperofertasModal} 
        />
      )}

      {isHelpModalOpen && (
        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={closeHelpModal}
          initialTab={helpModalInitialTab}
        />
      )}

      {isCartModalOpen && (
        <CartModal 
          isOpen={isCartModalOpen} 
          onClose={closeCartModal} 
        />
      )}

      {isFloresCoinsModalOpen && (
        <FloresCoinsModal
          isOpen={isFloresCoinsModalOpen}
          onClose={closeFloresCoinsModal}
        />
      )}

      {isWalletModalOpen && (
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={closeWalletModal}
        />
      )}
    </>
  );
};

export default Header;
