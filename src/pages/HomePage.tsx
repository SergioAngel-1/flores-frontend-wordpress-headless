import { useEffect, useState } from 'react';
import { api } from '../services/apiConfig';
import { categoryService } from '../services/api';
import {
  HeroSection,
  MiddleBanner,
  Benefits,
  SocialNetworks,
  ProductSections
} from '../components/home';

// Estilos CSS para la animación de rotación
const spinAnimation = `
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.spin-slow {
  animation: spin 10s linear infinite;
}
`;

const HomePage = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [middleBanners, setMiddleBanners] = useState<any[]>([]);
  const [bottomBanners, setBottomBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannersError, setBannersError] = useState<string | null>(null);
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([]);
  const [featuredCategoriesLoading, setFeaturedCategoriesLoading] = useState(true);
  const [featuredCategoriesError, setFeaturedCategoriesError] = useState<string | null>(null);

  // Cargar banners principales desde la API de WordPress
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setBannersLoading(true);
        console.log('Obteniendo banners...');

        // Usar la instancia de API centralizada en lugar de axios directo
        const response = await api.get('/floresinc/v1/banners', {
          timeout: 10000 // 10 segundos de timeout
        });

        console.log('Banners obtenidos:', response.data);
        
        // Filtrar banners por tipo (no por sección)
        if (response.data && Array.isArray(response.data)) {
          // Banners principales (hero section)
          const mainBanners = response.data.filter(banner => 
            banner.type === 'hero' || banner.type === 'main'
          );
          setBanners(mainBanners);
          
          // Banners del medio
          const midBanners = response.data.filter(banner => 
            banner.type === 'middle'
          );
          setMiddleBanners(midBanners);
          
          // Banners inferiores
          const botBanners = response.data.filter(banner => 
            banner.type === 'bottom'
          );
          setBottomBanners(botBanners);
        }
        
        setBannersError(null);
      } catch (error) {
        console.error('Error al cargar banners:', error);
        setBannersError('No se pudieron cargar los banners. Intente más tarde.');
      } finally {
        setBannersLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Cargar categorías destacadas
  useEffect(() => {
    const fetchFeaturedCategories = async () => {
      try {
        setFeaturedCategoriesLoading(true);
        console.log('Obteniendo categorías destacadas...');
        
        // Usar el servicio centralizado para categorías
        const response = await categoryService.getFeatured();
        
        console.log('Categorías destacadas obtenidas:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setFeaturedCategories(response.data);
        }
        
        setFeaturedCategoriesError(null);
      } catch (error) {
        console.error('Error al cargar categorías destacadas:', error);
        setFeaturedCategoriesError('No se pudieron cargar las categorías destacadas. Intente más tarde.');
      } finally {
        setFeaturedCategoriesLoading(false);
      }
    };

    fetchFeaturedCategories();
  }, []);

  // Inyectar estilos CSS para la animación de rotación
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = spinAnimation;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="font-['Poppins'] bg-[var(--claro)]">
      {/* Sección Hero: Carrusel de banners principales y categorías destacadas */}
      <HeroSection 
        banners={banners}
        bannersLoading={bannersLoading}
        bannersError={bannersError}
        featuredCategories={featuredCategories}
        featuredCategoriesLoading={featuredCategoriesLoading}
        featuredCategoriesError={featuredCategoriesError}
      />

      {/* Secciones superiores de productos configurables desde el admin */}
      <ProductSections.Top />

      {/* Banner intermedio */}
      <MiddleBanner banners={middleBanners} />

      {/* Secciones intermedias de productos configurables desde el admin */}
      <ProductSections.Middle />

      {/* Secciones finales de productos configurables desde el admin */}
      <ProductSections.Bottom />

      {/* Sección de beneficios */}
      <Benefits />

      <SocialNetworks banners={bottomBanners} />
    </div>
  );
};

export default HomePage;
