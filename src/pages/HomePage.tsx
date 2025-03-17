import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useWooCommerce';
import { gsap } from 'gsap';

const HomePage = () => {
  const { data: featuredProducts, loading, error } = useProducts();
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    {
      title: "Flores que expresan emociones",
      subtitle: "Descubre nuestra colección de arreglos florales únicos para cada ocasión especial.",
      image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      cta: "Ver catálogo",
      link: "/tienda"
    },
    {
      title: "Ofertas especiales",
      subtitle: "Aprovecha nuestros descuentos en ramos y arreglos seleccionados.",
      image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      cta: "Ver ofertas",
      link: "/ofertas"
    },
    {
      title: "Flores para toda ocasión",
      subtitle: "Celebra los momentos especiales con nuestros arreglos florales.",
      image: "https://images.unsplash.com/photo-1531685250784-7569952593d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      cta: "Explorar",
      link: "/ocasiones"
    }
  ];

  // Categorías con imágenes para mostrar en la sección principal
  const categoryGrid = [
    {
      name: "Celulares",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/celulares"
    },
    {
      name: "Electrodomésticos",
      image: "https://images.unsplash.com/photo-1556911220-bda9f7b07446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/electrodomesticos"
    },
    {
      name: "Computadores",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/computadores"
    },
    {
      name: "Televisores",
      image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/televisores"
    },
    {
      name: "Videojuegos",
      image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/videojuegos"
    },
    {
      name: "Zona Gamer",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/zona-gamer"
    },
    {
      name: "Audio",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/audio"
    },
    {
      name: "Electrohogar",
      image: "https://images.unsplash.com/photo-1556911220-bda9f7b07446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/electrohogar"
    },
    {
      name: "Smartwatch",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/smartwatch"
    },
    {
      name: "Audífonos",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/audifonos"
    },
    {
      name: "Accesorios",
      image: "https://images.unsplash.com/photo-1625466991577-01b449242e23?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/accesorios"
    },
    {
      name: "Cámaras",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      link: "/categoria/camaras"
    }
  ];

  // Efecto para cambiar automáticamente los banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Animaciones con GSAP
  useEffect(() => {
    const heroElements = document.querySelectorAll('.hero-animate');
    const productElements = document.querySelectorAll('.product-animate');
    const categoryElements = document.querySelectorAll('.category-animate');
    
    // Animación del hero
    gsap.fromTo(
      heroElements,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.2, 
        ease: 'power2.out',
        delay: 0.5
      }
    );
    
    // Animación de los productos
    gsap.fromTo(
      productElements,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: 'power2.out',
        delay: 0.8
      }
    );

    // Animación de las categorías
    gsap.fromTo(
      categoryElements,
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5, 
        stagger: 0.05, 
        ease: 'back.out(1.7)',
        delay: 0.3
      }
    );
  }, [featuredProducts]);

  return (
    <div className="font-['Poppins']">
      {/* Banner Carousel */}
      <section className="relative bg-gradient-to-r from-oscuro to-primario text-white">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          {banners.map((banner, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentBanner === index ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl hero-animate">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                    {banner.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 text-claro">
                    {banner.subtitle}
                  </p>
                  <Link 
                    to={banner.link} 
                    className="bg-acento hover:bg-acento/90 text-oscuro font-medium py-3 px-6 rounded-md transition-colors duration-300 text-center inline-block"
                  >
                    {banner.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {/* Indicadores del carrusel */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full ${
                  currentBanner === index ? 'bg-acento' : 'bg-white bg-opacity-50'
                }`}
                aria-label={`Ir al banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Decoración floral */}
        <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-20 overflow-hidden">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EBC7E1" d="M42.7,-65.1C56.9,-58.7,71.2,-50.6,79.6,-37.7C88,-24.8,90.5,-7.1,87.2,9.2C83.8,25.5,74.6,40.4,63.3,53.5C52,66.7,38.5,78.1,23.4,82.6C8.2,87.1,-8.6,84.6,-24.8,79.5C-41,74.4,-56.6,66.6,-67.4,54.3C-78.2,42,-84.2,25.1,-85.1,8.3C-86,-8.6,-81.8,-25.4,-72.8,-38.7C-63.8,-52,-50,-61.8,-35.8,-68.2C-21.6,-74.6,-7.1,-77.7,7.2,-79.1C21.5,-80.5,28.5,-71.4,42.7,-65.1Z" transform="translate(100 100)" />
          </svg>
        </div>
      </section>
      
      {/* Banner de ofertas */}
      <section className="bg-acento text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-center font-medium">
              ¡Ofertas especiales por tiempo limitado! Hasta 30% de descuento en productos seleccionados.
            </p>
          </div>
        </div>
      </section>
      
      {/* Hot Sale Banner */}
      <section className="py-6 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h2 className="text-4xl font-bold text-white mb-2">HOT SALE</h2>
              <p className="text-white text-xl">¡Los 5 mejores días para comprar!</p>
            </div>
            <Link 
              to="/ofertas" 
              className="bg-white text-red-600 font-bold py-3 px-8 rounded-md hover:bg-gray-100 transition-colors"
            >
              Ver ofertas
            </Link>
          </div>
        </div>
      </section>
      
      {/* Grid de categorías con imágenes sobrepuestas */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-primario">Explora por categoría</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categoryGrid.map((category, index) => (
              <div key={index} className="category-animate relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                <Link to={category.link} className="block relative h-0 pb-[100%]">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                    <span className="text-white text-sm font-medium">{category.name}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Productos destacados */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primario">Productos destacados</h2>
            <Link 
              to="/tienda" 
              className="text-primario hover:text-hover font-medium transition-colors flex items-center"
            >
              Ver todos
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Error al cargar los productos. Por favor, intenta nuevamente.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featuredProducts && featuredProducts.slice(0, 10).map((product) => (
                <div 
                  key={product.id} 
                  className="product-animate bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <Link to={`/producto/${product.id}`}>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].src} 
                        alt={product.name} 
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-secundario/30 flex items-center justify-center">
                        <span className="text-4xl">🌸</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-3 flex flex-col flex-grow">
                    <Link to={`/producto/${product.id}`} className="hover:text-primario transition-colors">
                      <h3 className="font-medium text-sm mb-1 text-oscuro line-clamp-2">{product.name}</h3>
                    </Link>
                    <div className="mt-auto pt-2 flex justify-between items-center">
                      <span className="text-primario font-bold">${product.price}</span>
                      <button 
                        className="bg-primario hover:bg-hover text-white p-1.5 rounded text-sm transition-colors duration-300"
                        aria-label="Agregar al carrito"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Sección de beneficios */}
      <section className="py-10 bg-claro">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-primario">¿Por qué elegirnos?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm product-animate flex flex-col items-center text-center">
              <div className="bg-secundario/20 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-oscuro">Calidad garantizada</h3>
              <p className="text-texto">Seleccionamos los mejores productos para garantizar su calidad y durabilidad.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm product-animate flex flex-col items-center text-center">
              <div className="bg-secundario/20 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-oscuro">Entrega rápida</h3>
              <p className="text-texto">Entregas en el mismo día para pedidos realizados antes de las 2 PM en la zona metropolitana.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm product-animate flex flex-col items-center text-center">
              <div className="bg-secundario/20 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-oscuro">Pago seguro</h3>
              <p className="text-texto">Múltiples métodos de pago seguros y protegidos para tu tranquilidad.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Banner de suscripción */}
      <section className="py-10 bg-primario text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Suscríbete a nuestro boletín</h2>
            <p className="mb-6">Recibe ofertas exclusivas, consejos y novedades directamente en tu correo.</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="flex-grow py-2 px-4 rounded-md text-oscuro focus:outline-none"
              />
              <button 
                type="submit" 
                className="bg-acento hover:bg-acento/90 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
