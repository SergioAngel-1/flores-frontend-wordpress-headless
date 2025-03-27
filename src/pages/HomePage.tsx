import { useEffect, useState } from 'react';
import { useProducts } from '../hooks/useWooCommerce';
import axios from 'axios';
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
  const { data: featuredProducts } = useProducts();
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
        // Usar la ruta correcta para el endpoint personalizado
        const apiUrl = `${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/banners`;
        console.log('Intentando conectar a:', apiUrl);

        // Configuración de axios con timeout y manejo de CORS
        const response = await axios.get(apiUrl, {
          timeout: 10000, // 10 segundos de timeout
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          withCredentials: false // Importante para CORS en desarrollo
        });

        console.log('Respuesta de la API de banners:', response.data);
        
        // Validar y procesar los datos de los banners
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Filtrar banners por tipo y validar campos requeridos
          const mainBanners = response.data
            .filter((banner: any) => !banner.type || banner.type === 'main')
            .map((banner: any) => {
              // Validar y depurar las URLs de las imágenes
              console.log(`Banner ID ${banner.id} - Imagen:`, banner.image);
              console.log(`Banner ID ${banner.id} - Imagen Mobile:`, banner.imageMobile);
              
              // Verificación adicional para asegurar que cada banner tiene un ID único
              if (!banner.id || typeof banner.id !== 'number') {
                console.warn('Banner sin ID o ID no válido:', banner);
                // Asignar un ID temporal si no tiene
                banner.id = Math.floor(Math.random() * 10000);
              }
              
              // Asegurarse de que las URLs de las imágenes sean válidas
              if (!banner.image || typeof banner.image !== 'string') {
                console.warn(`Banner ID ${banner.id} tiene una URL de imagen inválida:`, banner.image);
              }
              
              return banner;
            });
          
          console.log('Cantidad de banners principales procesados:', mainBanners.length);
          console.log('Banners principales procesados:', mainBanners);
          setBanners(mainBanners);
          setBannersError(null);
        } else {
          console.warn('La API devolvió una respuesta vacía o con formato incorrecto:', response.data);
          setBannersError('No se encontraron banners disponibles');
          setBanners([]);
        }
      } catch (error) {
        console.error('Error al cargar los banners:', error);

        // Mostrar información más detallada para depuración
        if (axios.isAxiosError(error)) {
          console.error('Detalles del error:', {
            mensaje: error.message,
            url: error.config?.url,
            método: error.config?.method,
            respuesta: error.response?.data,
            estado: error.response?.status
          });
        }

        setBannersError('No se pudieron cargar los banners');
        // No usar banners de respaldo, solo establecer un array vacío
        setBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Cargar banners intermedios desde la API de WordPress
  useEffect(() => {
    const fetchMiddleBanners = async () => {
      try {
        // Usar la ruta correcta para el endpoint personalizado con filtro de tipo
        const apiUrl = `${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/banners/middle`;
        console.log('Intentando conectar a banners intermedios:', apiUrl);

        // Configuración de axios con timeout y manejo de CORS
        const response = await axios.get(apiUrl, {
          timeout: 10000, // 10 segundos de timeout
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          withCredentials: false // Importante para CORS en desarrollo
        });

        console.log('Respuesta de banners intermedios:', response.data);
        setMiddleBanners(response.data);
      } catch (error) {
        console.error('Error al cargar los banners intermedios:', error);
        // Usar un banner de respaldo en caso de error
        setMiddleBanners([
          {
            id: 101,
            title: "Ofertas especiales",
            subtitle: "Descubre nuestras ofertas exclusivas en productos seleccionados.",
            image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
            imageMobile: "https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            cta: "Ver ofertas",
            link: "/ofertas",
            type: "middle"
          }
        ]);
      }
    };

    fetchMiddleBanners();
  }, []);

  // Cargar banners inferiores desde la API de WordPress
  useEffect(() => {
    const fetchBottomBanners = async () => {
      try {
        // Usar la ruta correcta para el endpoint personalizado con filtro de tipo
        const apiUrl = `${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/banners/bottom`;
        console.log('Intentando conectar a banners inferiores:', apiUrl);

        // Configuración de axios con timeout y manejo de CORS
        const response = await axios.get(apiUrl, {
          timeout: 10000, // 10 segundos de timeout
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          withCredentials: false // Importante para CORS en desarrollo
        });

        console.log('Respuesta de banners inferiores:', JSON.stringify(response.data, null, 2));
        
        // Verificar si hay datos y si tienen el formato esperado
        if (Array.isArray(response.data)) {
          // No usar datos de respaldo, solo los datos del plugin
          setBottomBanners(response.data);
        } else {
          console.warn('No se encontraron banners inferiores o el formato es incorrecto');
          setBottomBanners([]);
        }
      } catch (error) {
        console.error('Error al cargar los banners inferiores:', error);
        
        // Mostrar información más detallada para depuración
        if (axios.isAxiosError(error)) {
          console.error('Detalles del error:', {
            mensaje: error.message,
            url: error.config?.url,
            método: error.config?.method,
            respuesta: error.response?.data,
            estado: error.response?.status
          });
        }
        
        // No usar datos de respaldo, solo un array vacío
        setBottomBanners([]);
      }
    };

    fetchBottomBanners();
  }, []);

  // Cargar categorías destacadas desde la API de WordPress
  useEffect(() => {
    const fetchFeaturedCategories = async () => {
      try {
        setFeaturedCategoriesLoading(true);
        // Usar la ruta correcta para el endpoint personalizado
        const apiUrl = `${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/featured-categories`;
        console.log('Intentando cargar categorías destacadas desde:', apiUrl);

        // Configuración de axios con timeout y manejo de CORS
        const response = await axios.get(apiUrl, {
          timeout: 10000, // 10 segundos de timeout
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          withCredentials: false // Importante para CORS en desarrollo
        });

        console.log('Categorías destacadas:', response.data);
        setFeaturedCategories(response.data);
        setFeaturedCategoriesError(null);
      } catch (error) {
        console.error('Error al cargar las categorías destacadas:', error);

        // Mostrar información más detallada para depuración
        if (axios.isAxiosError(error)) {
          console.error('Detalles del error:', {
            mensaje: error.message,
            url: error.config?.url,
            método: error.config?.method,
            respuesta: error.response?.data,
            estado: error.response?.status
          });
        }

        setFeaturedCategoriesError('No se pudieron cargar las categorías destacadas');

        // Si hay un error, usar las categorías normales como respaldo
        if (featuredProducts && featuredProducts.length > 0) {
          const fallbackCategories = featuredProducts.slice(0, 8).map(product => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            count: 0, // Los productos no tienen count, asignamos 0 por defecto
            image: product.images && product.images.length > 0 ? product.images[0].src : '',
            description: product.description || '',
            link: `/producto/${product.slug}`
          }));
          setFeaturedCategories(fallbackCategories);
        }
      } finally {
        setFeaturedCategoriesLoading(false);
      }
    };

    fetchFeaturedCategories();
  }, [featuredProducts]);

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
