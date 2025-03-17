import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import floresLogo from '../../assets/images/flores-logo.png';
import { useCategories, useSearchProducts } from '../../hooks/useWooCommerce';
import { gsap } from 'gsap';
import { cartService } from '../../services/api';

// Interfaces
interface Category {
  id: number;
  name: string;
  slug: string;
}

const Header = () => {
  const { data: categories, loading } = useCategories();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: searchResults, loading: searchLoading } = useSearchProducts(searchTerm);

  // Efecto para manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efecto para cargar el número de items en el carrito
  useEffect(() => {
    const updateCartCount = () => {
      setCartItemCount(cartService.getItemCount());
    };

    // Actualizar al cargar el componente
    updateCartCount();

    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      updateCartCount();
    };

    // Escuchar el evento personalizado de actualización del carrito
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleCartUpdate);
    
    // También podemos establecer un intervalo para verificar periódicamente
    const interval = setInterval(updateCartCount, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleCartUpdate);
      clearInterval(interval);
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

  // Función para manejar la búsqueda en tiempo real
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setShowResults(false);
      return;
    }

    setShowResults(true);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  const toggleCategoriesMenu = () => {
    setShowCategoriesMenu(!showCategoriesMenu);
  };

  return (
    <>
      {/* Top Bar con información de contacto y ofertas */}
      <div className="text-white font-poppins bg-white">
        <div className="container mx-auto px-2">
          <div className="flex justify-between items-start whitespace-nowrap">
            <div className="flex items-start space-x-2">
              <Link to="/hiperofertas" className="text-white text-sm font-bold hover:text-white flex items-center relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hiperofertas
              </Link>
              <span className="text-primario text-sm font-bold hidden md:inline-block relative group px-2 pt-0 pb-1 shadow-sm rounded-b-lg overflow-hidden border-b-2 border-l-2 border-r-2 border-primario">
                <span className="absolute inset-0 bg-white group-hover:bg-white transition-colors duration-300 -z-10 rounded-b-lg" style={{ borderBottom: '2px solid #B91E59', borderLeft: '2px solid #B91E59', borderRight: '2px solid #B91E59' }}></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-bold">Ventas: (01) 745 8001</span>
              </span>
              <span className="text-primario text-sm font-bold hidden md:inline-block relative group px-2 pt-0 pb-1 shadow-sm rounded-b-lg overflow-hidden border-b-2 border-l-2 border-r-2 border-primario">
                <span className="absolute inset-0 bg-white group-hover:bg-white transition-colors duration-300 -z-10 rounded-b-lg" style={{ borderBottom: '2px solid #B91E59', borderLeft: '2px solid #B91E59', borderRight: '2px solid #B91E59' }}></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-bold">Servicio: (01) 407 3033</span>
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <Link to="/seguimiento" className="text-white text-sm font-bold hover:text-white relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario">
                Seguir mi pedido
              </Link>
              <Link to="/tiendas" className="text-white text-sm font-bold hover:text-white hidden md:inline-block relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario">
                Nuestras tiendas
              </Link>
              <Link to="/catalogo" className="text-white text-sm font-bold hover:text-white hidden md:inline-block relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario">
                Catálogo
              </Link>
              <Link to="/ayuda" className="text-white text-sm font-bold hover:text-white hidden lg:inline-block relative group px-2 pt-0 pb-1 shadow-sm border-b-2 border-l-2 border-r-2 border-primario rounded-b-lg bg-primario">
                Ayuda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <header 
        className={`w-full z-50 transition-all duration-300 font-poppins ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-3'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="logo text-primario font-bold text-2xl md:text-3xl">
              <img src={floresLogo} alt="Flores INC" className="h-12 md:h-16" />
            </Link>

            {/* Barra de búsqueda */}
            <div className="hidden md:block flex-grow max-w-xl mx-4 relative" ref={searchRef}>
              <input 
                type="text" 
                placeholder="¿Qué buscas hoy?" 
                value={searchTerm}
                onChange={handleSearch}
                className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent"
              />
              <button className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-primario">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {showResults && (
                <div className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-md overflow-hidden z-50">
                  <div className="py-2">
                    {searchTerm && (
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-500">Resultados para: <span className="font-medium">{searchTerm}</span></span>
                        <button 
                          onClick={clearSearch}
                          className="text-gray-400 hover:text-primario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Categorías */}
                    {searchResults && searchResults.length > 0 && (
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="font-medium text-gray-700 text-sm mb-2">CATEGORÍAS:</h3>
                        {Array.from(new Set(searchResults.map(product => 
                          product.categories && product.categories.length > 0 ? 
                          product.categories[0].name : 'Sin categoría'
                        ))).map(category => (
                          <Link 
                            key={category} 
                            to={`/categoria/${category}`}
                            className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            onClick={() => setShowResults(false)}
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {/* Productos */}
                    {searchResults && searchResults.length > 0 && (
                      <div className="px-4 py-2">
                        <h3 className="font-medium text-gray-700 text-sm mb-2">PRODUCTOS:</h3>
                        {searchResults.map(product => (
                          <Link 
                            key={product.id} 
                            to={`/producto/${product.slug}`}
                            className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            onClick={() => setShowResults(false)}
                          >
                            <div className="w-10 h-10 flex-shrink-0 mr-2 bg-gray-200 rounded overflow-hidden">
                              <img 
                                src={product.images && product.images.length > 0 ? product.images[0].src : 'https://via.placeholder.com/50'} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {product.categories && product.categories.length > 0 ? product.categories[0].name : 'Sin categoría'}
                              </p>
                            </div>
                            <div className="text-green-600 font-medium">${product.price}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {searchResults && searchResults.length === 0 && searchTerm && (
                      <div className="px-4 py-4 text-sm text-gray-500 text-center">
                        No se encontraron resultados para "<span className="font-medium">{searchTerm}</span>"
                      </div>
                    )}
                    
                    {searchLoading && (
                      <div className="px-4 py-4 text-sm text-gray-500 text-center">
                        <div className="flex justify-center items-center">
                          <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Buscando...
                        </div>
                      </div>
                    )}
                    
                    {searchResults && searchResults.length > 0 && (
                      <div className="px-4 py-3 bg-gray-50 text-center">
                        <Link 
                          to={`/busqueda?q=${encodeURIComponent(searchTerm)}`}
                          className="text-sm text-primario hover:text-primario-dark font-medium"
                          onClick={() => setShowResults(false)}
                        >
                          Ver todos los resultados
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Iconos de cuenta y carrito */}
            <div className="flex items-center space-x-4">
              <Link to="/cuenta" className="text-white text-texto hover:text-white transition-colors">
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs mt-1">Mi cuenta</span>
                </div>
              </Link>
              <Link to="/carrito" className="text-white text-texto hover:text-white relative">
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xs mt-1">Mi carrito</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-acento text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>
              
              {/* Botón de menú móvil */}
              <button 
                className="md:hidden text-white hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú de navegación con pestañas */}
      <nav className="bg-secundario text-white font-poppins hidden md:block relative">
        <div className="container mx-auto px-4">
          <ul className="flex">
            <li className="group relative">
              <button 
                onClick={toggleCategoriesMenu}
                className={`flex items-center py-3 px-4 hover:bg-acento hover:text-white transition-colors ${showCategoriesMenu ? 'bg-acento text-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Categorías
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCategoriesMenu && (
                <div className="absolute left-0 mt-0 w-60 bg-white rounded-b-md shadow-lg z-50">
                  <div className="py-2">
                    {!loading && categories && categories.length > 0 ? (
                      categories.map(category => (
                        <Link
                          key={category.id}
                          to={`/categoria/${category.slug}`}
                          className="block px-4 py-2 text-sm text-texto hover:bg-secundario hover:text-oscuro"
                          onClick={() => setShowCategoriesMenu(false)}
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">Cargando categorías...</div>
                    )}
                  </div>
                </div>
              )}
            </li>
            {/* Menú de categorías */}
            <div className="relative group">
              <button className="flex items-center text-sm text-white bg-primario hover:bg-hover px-3 py-2 rounded-md transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Categorías
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50 transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-left">
                <div className="py-2">
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Cargando categorías...</div>
                  ) : (
                    categories?.map((category: Category) => (
                      <Link
                        key={category.id}
                        to={`/categoria/${category.slug}`}
                        className="block px-4 py-2 text-sm text-texto hover:bg-secundario transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
            {/* Pestañas con fondo colgando */}
            <li className="relative">
              <Link 
                to="/" 
                className={`block py-3 px-4 transition-colors relative ${activeTab === 'inicio' ? 'text-white' : 'text-white hover:text-white'} hover:bg-acento`}
                onClick={() => setActiveTab('inicio')}
              >
                <span className={`absolute inset-0 bg-acento rounded-t-lg -bottom-1 -z-10 ${activeTab === 'inicio' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'} transition-opacity duration-300`}></span>
                <span className="text-sm font-medium">Inicio</span>
              </Link>
            </li>
            <li className="relative group">
              <Link 
                to="/tienda" 
                className={`block py-3 px-4 transition-colors relative ${activeTab === 'tienda' ? 'text-white' : 'text-white hover:text-white'} hover:bg-acento`}
                onClick={() => setActiveTab('tienda')}
              >
                <span className={`absolute inset-0 bg-acento rounded-t-lg -bottom-1 -z-10 ${activeTab === 'tienda' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'} transition-opacity duration-300`}></span>
                <span className="text-sm font-medium">Tienda</span>
              </Link>
            </li>
            <li className="relative group">
              <Link 
                to="/ofertas" 
                className={`block py-3 px-4 transition-colors relative ${activeTab === 'ofertas' ? 'text-white' : 'text-white hover:text-white'} hover:bg-acento`}
                onClick={() => setActiveTab('ofertas')}
              >
                <span className={`absolute inset-0 bg-acento rounded-t-lg -bottom-1 -z-10 ${activeTab === 'ofertas' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'} transition-opacity duration-300`}></span>
                <span className="text-sm font-medium">Ofertas</span>
              </Link>
            </li>
            <li className="relative group">
              <Link 
                to="/ramos" 
                className={`block py-3 px-4 transition-colors relative ${activeTab === 'ramos' ? 'text-white' : 'text-white hover:text-white'} hover:bg-acento`}
                onClick={() => setActiveTab('ramos')}
              >
                <span className={`absolute inset-0 bg-acento rounded-t-lg -bottom-1 -z-10 ${activeTab === 'ramos' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'} transition-opacity duration-300`}></span>
                <span className="text-sm font-medium">Ramos</span>
              </Link>
            </li>
            <li className="relative group">
              <Link 
                to="/arreglos" 
                className={`block py-3 px-4 transition-colors relative ${activeTab === 'arreglos' ? 'text-white' : 'text-white hover:text-white'} hover:bg-acento`}
                onClick={() => setActiveTab('arreglos')}
              >
                <span className={`absolute inset-0 bg-acento rounded-t-lg -bottom-1 -z-10 ${activeTab === 'arreglos' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'} transition-opacity duration-300`}></span>
                <span className="text-sm font-medium">Arreglos</span>
              </Link>
            </li>
            <li className="relative group">
              <Link 
                to="/ocasiones" 
                className={`block py-3 px-4 transition-colors relative ${activeTab === 'ocasiones' ? 'text-white' : 'text-white hover:text-white'} hover:bg-acento`}
                onClick={() => setActiveTab('ocasiones')}
              >
                <span className={`absolute inset-0 bg-acento rounded-t-lg -bottom-1 -z-10 ${activeTab === 'ocasiones' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'} transition-opacity duration-300`}></span>
                <span className="text-sm font-medium">Ocasiones especiales</span>
              </Link>
            </li>
            <li className="relative group">
              <Link 
                to="/contacto" 
                className={`block py-3 px-4 transition-colors relative ${activeTab === 'contacto' ? 'text-white' : 'text-white hover:text-white'} hover:bg-acento`}
                onClick={() => setActiveTab('contacto')}
              >
                <span className={`absolute inset-0 bg-acento rounded-t-lg -bottom-1 -z-10 ${activeTab === 'contacto' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'} transition-opacity duration-300`}></span>
                <span className="text-sm font-medium">Contacto</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-white h-full w-4/5 max-w-xs overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-primario">Menú</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-500 hover:text-primario"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <input 
                type="text" 
                placeholder="¿Qué buscas hoy?" 
                className="w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
              />
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/" 
                    className="block py-2 text-white text-texto hover:text-white"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab('inicio');
                    }}
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tienda" 
                    className="block py-2 text-white text-texto hover:text-white"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab('tienda');
                    }}
                  >
                    Tienda
                  </Link>
                </li>
                <li>
                  <details className="cursor-pointer">
                    <summary className="py-2 text-white text-texto hover:text-white">Categorías</summary>
                    <ul className="pl-4 mt-2 space-y-1">
                      {!loading && categories && categories.length > 0 ? (
                        categories.map((category: Category) => (
                          <li key={category.id}>
                            <Link
                              to={`/categoria/${category.slug}`}
                              className="block py-1 text-sm text-white text-texto hover:text-white"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">Cargando categorías...</li>
                      )}
                    </ul>
                  </details>
                </li>
                <li>
                  <Link 
                    to="/ofertas" 
                    className="block py-2 text-white text-texto hover:text-white"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab('ofertas');
                    }}
                  >
                    Ofertas
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contacto" 
                    className="block py-2 text-white text-texto hover:text-white"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab('contacto');
                    }}
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/cuenta" 
                    className="block py-2 text-white text-texto hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi cuenta
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/seguimiento" 
                    className="block py-2 text-white text-texto hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Seguir mi pedido
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tiendas" 
                    className="block py-2 text-white text-texto hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Nuestras tiendas
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/ayuda" 
                    className="block py-2 text-white text-texto hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ayuda
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
