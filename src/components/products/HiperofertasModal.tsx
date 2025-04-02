import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/apiConfig';
import { isAxiosError, AxiosError } from 'axios';
import AnimatedModal from '../ui/AnimatedModal';
import { IoMdFlash } from 'react-icons/io';
import { generateSlug } from '../../utils/formatters';

// Interfaces
interface HiperofertaProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  image: string;
  gallery: string[];
  short_description: string;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  stock_status: string;
  stock_quantity: number;
}

interface Hiperoferta {
  id: number;
  title: string;
  product: HiperofertaProduct;
  regular_price: number;
  sale_price: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  featured: boolean;
  days_remaining: number;
}

interface HiperofertasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HiperofertasModal = ({ isOpen, onClose }: HiperofertasModalProps) => {
  const [hiperofertas, setHiperofertas] = useState<Hiperoferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Cargar hiperofertas desde la API
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchHiperofertas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando hiperofertas...');
        
        const response = await api.get<Hiperoferta[]>('/floresinc/v1/hiperofertas', {
          timeout: 10000
        });
        
        console.log('Hiperofertas cargadas:', response.data);
        
        // Asegurarse de que las URLs son relativas y no absolutas
        const processedData = response.data.map(oferta => {
          // Si la URL es absoluta, mantener solo la ruta relativa
          if (oferta.product.permalink && oferta.product.permalink.includes('://')) {
            try {
              const url = new URL(oferta.product.permalink);
              oferta.product.permalink = url.pathname;
            } catch (e) {
              // Si hay un error al procesar la URL, usar el slug para generar una URL relativa
              oferta.product.permalink = `/producto/${generateSlug(oferta.product.name)}`;
            }
          }
          return oferta;
        });
        
        setHiperofertas(processedData);
      } catch (err: unknown) {
        console.error('Error al cargar hiperofertas:', err);
        
        if (isAxiosError(err)) {
          const axiosError = err as AxiosError;
          console.error('Detalles del error:', {
            mensaje: axiosError.message,
            url: axiosError.config?.url,
            método: axiosError.config?.method,
            respuesta: axiosError.response?.data,
            estado: axiosError.response?.status
          });
        }
        
        setError('No se pudieron cargar las hiperofertas. Intenta más tarde.');
        
        // Datos de respaldo para desarrollo
        setHiperofertas([
          {
            id: 1,
            title: "Oferta Flash Smartphone",
            product: {
              id: 101,
              name: "Smartphone XYZ Pro",
              slug: "smartphone-xyz-pro",
              permalink: "/producto/smartphone-xyz-pro", // Se mantiene por compatibilidad pero no se usa
              image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
              gallery: [],
              short_description: "El smartphone más potente del mercado con cámara de 108MP",
              categories: [{ id: 1, name: "Smartphones", slug: "smartphones" }],
              stock_status: "instock",
              stock_quantity: 10
            },
            regular_price: 999.99,
            sale_price: 799.99,
            discount_percentage: 20,
            start_date: "2025-03-20",
            end_date: "2025-04-05",
            featured: true,
            days_remaining: 10
          },
          {
            id: 2,
            title: "Oferta Especial Laptop",
            product: {
              id: 102,
              name: "Laptop UltraBook 15",
              slug: "laptop-ultrabook-15",
              permalink: "/producto/laptop-ultrabook-15", // Se mantiene por compatibilidad pero no se usa
              image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
              gallery: [],
              short_description: "Laptop ultradelgada con procesador de última generación",
              categories: [{ id: 2, name: "Laptops", slug: "laptops" }],
              stock_status: "instock",
              stock_quantity: 5
            },
            regular_price: 1299.99,
            sale_price: 999.99,
            discount_percentage: 23,
            start_date: "2025-03-15",
            end_date: "2025-04-15",
            featured: true,
            days_remaining: 20
          },
          {
            id: 3,
            title: "Oferta Reloj Inteligente",
            product: {
              id: 103,
              name: "SmartWatch Pro",
              slug: "smartwatch-pro",
              permalink: "/producto/smartwatch-pro", // Se mantiene por compatibilidad pero no se usa
              image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
              gallery: [],
              short_description: "Monitorea tu salud y actividad física con este reloj inteligente",
              categories: [{ id: 3, name: "Wearables", slug: "wearables" }],
              stock_status: "instock",
              stock_quantity: 15
            },
            regular_price: 299.99,
            sale_price: 199.99,
            discount_percentage: 33,
            start_date: "2025-03-10",
            end_date: "2025-04-10",
            featured: false,
            days_remaining: 15
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHiperofertas();
  }, [isOpen]);

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="max-w-7xl w-full"
      title={
        <div className="flex items-center text-primario">
          <IoMdFlash className="text-2xl mr-2 text-yellow-500" />
          HIPEROFERTAS
          <IoMdFlash className="text-2xl ml-2 text-yellow-500" />
        </div>
      }
    >
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-6">
            <p className="text-xl font-bold mb-2">¡Ups! Algo salió mal</p>
            <p>{error}</p>
          </div>
        ) : hiperofertas.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-xl font-bold mb-2">No hay ofertas disponibles en este momento</p>
            <p className="text-gray-600">Seguro mañana sí, ¡vuelve pronto para encontrar las mejores ofertas!</p>
            <div className="mt-6">
              <IoMdFlash className="inline-block text-5xl text-yellow-500 animate-pulse" />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-600 mb-6">
              ¡No te pierdas estas ofertas exclusivas por tiempo limitado!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {hiperofertas.map((oferta) => (
                <div 
                  key={oferta.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative">
                    {/* Badge de descuento */}
                    <div className="absolute top-0 right-0 bg-red-500 text-white font-bold py-1 px-2 text-xs rounded-bl-lg z-10">
                      -{oferta.discount_percentage}%
                    </div>
                    
                    {/* Imagen */}
                    <Link 
                      to={`/producto/${generateSlug(oferta.product.name)}`}
                      onClick={onClose}
                      className="block relative h-0 pb-[100%] overflow-hidden"
                    >
                      <img 
                        src={oferta.product.image} 
                        alt={oferta.product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        loading="lazy"
                      />
                    </Link>
                  </div>
                  
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    {/* Título del producto */}
                    <Link 
                      to={`/producto/${generateSlug(oferta.product.name)}`}
                      onClick={onClose}
                      className="block text-sm font-bold text-oscuro hover:text-primario transition-colors mb-2 line-clamp-2 min-h-[2.5rem]"
                    >
                      {oferta.product.name}
                    </Link>
                    
                    {/* Precios */}
                    <div className="flex items-center mb-3">
                      <span className="text-gray-400 line-through mr-2 text-xs">
                        {formatCurrency(oferta.regular_price)}
                      </span>
                      <span className="text-lg font-bold text-primario">
                        {formatCurrency(oferta.sale_price)}
                      </span>
                    </div>
                    
                    {/* Tiempo restante */}
                    <div className="text-xs text-gray-500 mb-3">
                      {oferta.days_remaining > 0 ? (
                        <span>Termina en {oferta.days_remaining} día{oferta.days_remaining !== 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-red-500 font-bold">¡Último día!</span>
                      )}
                    </div>
                    
                    {/* Botón */}
                    <Link 
                      to={`/producto/${generateSlug(oferta.product.name)}`}
                      onClick={onClose}
                      className="block w-full bg-primario hover:bg-primario-dark text-white text-center py-2 rounded-md transition-colors duration-300 text-sm font-medium"
                    >
                      Ver oferta
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedModal>
  );
};

export default HiperofertasModal;
