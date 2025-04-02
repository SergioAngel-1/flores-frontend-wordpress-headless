import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/apiConfig';
import ProductCard from '../products/ProductCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Product } from '../../types/woocommerce';

// Interfaces para las secciones
interface Section {
  id: string;
  name: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  title: string;
  subtitle: string;
  products: Product[];
}

interface ProductSectionsProps {
  sectionId: string;
  className?: string;
}

const ProductSection: React.FC<ProductSectionsProps> = ({ sectionId, className = '' }) => {
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    const fetchSectionData = async () => {
      // Evitar múltiples cargas durante el renderizado
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;
      
      try {
        setLoading(true);
        console.log(`Obteniendo sección ${sectionId}...`);
        
        const response = await api.get(`/floresinc/v1/home-sections/${sectionId}`, {
          timeout: 10000 // 10 segundos de timeout
        });
        
        console.log(`Datos de la sección ${sectionId}:`, response.data);
        setSection(response.data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching section ${sectionId}:`, err);
        setError(`No se pudieron cargar los productos para esta sección.`);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
    
    // Limpiar el ref cuando el componente se desmonte
    return () => {
      dataFetchedRef.current = false;
    };
  }, [sectionId]);

  if (loading) {
    return (
      <div className="py-6 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !section) {
    return null; // No mostrar nada si hay error o no hay datos
  }

  if (!section.products || section.products.length === 0) {
    return null; // No mostrar la sección si no hay productos
  }

  return (
    <section className={`py-8 bg-white ${className}`}>
      <div className="container mx-auto px-16 md:px-16 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-primario mb-2">{section.title}</h2>
            {section.subtitle && (
              <p className="text-gray-600">{section.subtitle}</p>
            )}
          </div>
          <Link 
            to={`/categoria/${section.category_slug}`}
            className="inline-block bg-primario border border-primario text-white py-2 px-6 rounded-md hover:scale-105 hover:text-[var(--claro)] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Ver más
          </Link>
        </div>

        {/* Ajustar la cuadrícula según el tipo de sección */}
        {(section.id === 'section_bottom_1' || section.id === 'section_bottom_2') ? (
          // Grid 2x2 para secciones finales
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : section.id === 'section_top_2' || section.id === 'section_middle_2' ? (
          // Grid de 8 productos en una sola fila adaptable
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {section.products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} className="h-full" />
            ))}
          </div>
        ) : (
          // Grid de 5 productos en una sola fila adaptable
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {section.products.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} className="h-full" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Hook personalizado para obtener todas las secciones
const useHomeSections = () => {
  const [sections, setSections] = useState<{[key: string]: Section}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    const fetchAllSections = async () => {
      // Evitar múltiples cargas durante el renderizado
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;
      
      try {
        setLoading(true);
        console.log('Obteniendo todas las secciones de productos...');
        
        const response = await api.get('/floresinc/v1/home-sections', {
          timeout: 10000 // 10 segundos de timeout
        });
        
        console.log('Datos de todas las secciones:', response.data);
        
        // Convertir el array a un objeto con las claves de sección
        const sectionsObj: {[key: string]: Section} = {};
        response.data.forEach((section: Section) => {
          sectionsObj[section.id] = section;
        });
        
        setSections(sectionsObj);
        setError(null);
      } catch (err) {
        console.error('Error fetching home sections:', err);
        setError('No se pudieron cargar las secciones de productos.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllSections();
    
    // Limpiar el ref cuando el componente se desmonte
    return () => {
      dataFetchedRef.current = false;
    };
  }, []);
  
  return { sections, loading, error };
};

// Componentes individuales para cada ubicación en el home
const TopProductSections: React.FC = () => {
  const { sections, loading, error } = useHomeSections();

  if (loading || error || Object.keys(sections).length === 0) {
    return null;
  }

  return (
    <>
      {sections.section_top_1 && <ProductSection sectionId="section_top_1" />}
      {sections.section_top_2 && <ProductSection sectionId="section_top_2" />}
    </>
  );
};

const MiddleProductSections: React.FC = () => {
  const { sections, loading, error } = useHomeSections();

  if (loading || error || Object.keys(sections).length === 0) {
    return null;
  }

  return (
    <>
      {sections.section_middle_1 && <ProductSection sectionId="section_middle_1" />}
      {sections.section_middle_2 && <ProductSection sectionId="section_middle_2" />}
    </>
  );
};

// Componente para las secciones finales (ambas en un mismo contenedor)
const BottomProductSections: React.FC = () => {
  const { sections, loading, error } = useHomeSections();
  const [section1, setSection1] = useState<Section | null>(null);
  const [section2, setSection2] = useState<Section | null>(null);
  const [loading1, setLoading1] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const dataFetched1Ref = useRef(false);
  const dataFetched2Ref = useRef(false);

  // Cargar datos de la sección final 1
  useEffect(() => {
    if (sections.section_bottom_1) {
      const fetchSection1Data = async () => {
        // Evitar múltiples cargas durante el renderizado
        if (dataFetched1Ref.current) return;
        dataFetched1Ref.current = true;
        
        try {
          setLoading1(true);
          console.log('Cargando sección final 1...');
          
          const response = await api.get('/floresinc/v1/home-sections/section_bottom_1', {
            timeout: 10000
          });
          
          console.log('Datos de sección final 1:', response.data);
          setSection1(response.data);
          setError1(null);
        } catch (err) {
          console.error('Error al cargar sección final 1:', err);
          setError1('No se pudieron cargar los productos para esta sección.');
        } finally {
          setLoading1(false);
        }
      };

      fetchSection1Data();
      
      // Limpiar el ref cuando el componente se desmonte o cambie la dependencia
      return () => {
        dataFetched1Ref.current = false;
      };
    }
  }, [sections.section_bottom_1]);

  // Cargar datos de la sección final 2
  useEffect(() => {
    if (sections.section_bottom_2) {
      const fetchSection2Data = async () => {
        // Evitar múltiples cargas durante el renderizado
        if (dataFetched2Ref.current) return;
        dataFetched2Ref.current = true;
        
        try {
          setLoading2(true);
          console.log('Cargando sección final 2...');
          
          const response = await api.get('/floresinc/v1/home-sections/section_bottom_2', {
            timeout: 10000
          });
          
          console.log('Datos de sección final 2:', response.data);
          setSection2(response.data);
          setError2(null);
        } catch (err) {
          console.error('Error al cargar sección final 2:', err);
          setError2('No se pudieron cargar los productos para esta sección.');
        } finally {
          setLoading2(false);
        }
      };

      fetchSection2Data();
      
      // Limpiar el ref cuando el componente se desmonte o cambie la dependencia
      return () => {
        dataFetched2Ref.current = false;
      };
    }
  }, [sections.section_bottom_2]);

  // Si no hay secciones configuradas o hay un error general, no mostrar nada
  if (loading || error || Object.keys(sections).length === 0) {
    return null;
  }

  // Si no hay ninguna sección final configurada, no mostrar nada
  if (!sections.section_bottom_1 && !sections.section_bottom_2) {
    return null;
  }

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-16 md:px-16 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {sections.section_bottom_1 && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-primario mb-2">{sections.section_bottom_1.title}</h2>
                  {sections.section_bottom_1.subtitle && (
                    <p className="text-gray-600">{sections.section_bottom_1.subtitle}</p>
                  )}
                </div>
                <Link 
                  to={`/categoria/${sections.section_bottom_1.category_slug}`}
                  className="inline-block bg-primario border border-primario text-white py-2 px-6 rounded-md hover:scale-105 hover:text-[var(--claro)] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Ver más
                </Link>
              </div>
              
              {loading1 ? (
                <div className="py-6 text-center flex-grow">
                  <LoadingSpinner />
                </div>
              ) : error1 ? (
                <p className="text-center text-red-500 flex-grow">{error1}</p>
              ) : section1 && section1.products ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                  {section1.products.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} className="h-full" />
                  ))}
                </div>
              ) : null}
            </div>
          )}
          
          {sections.section_bottom_2 && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-primario mb-2">{sections.section_bottom_2.title}</h2>
                  {sections.section_bottom_2.subtitle && (
                    <p className="text-gray-600">{sections.section_bottom_2.subtitle}</p>
                  )}
                </div>
                <Link 
                  to={`/categoria/${sections.section_bottom_2.category_slug}`}
                  className="inline-block bg-primario border border-primario text-white py-2 px-6 rounded-md hover:scale-105 hover:text-[var(--claro)] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Ver más
                </Link>
              </div>
              
              {loading2 ? (
                <div className="py-6 text-center flex-grow">
                  <LoadingSpinner />
                </div>
              ) : error2 ? (
                <p className="text-center text-red-500 flex-grow">{error2}</p>
              ) : section2 && section2.products ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
                  {section2.products.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} className="h-full" />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal que ahora solo sirve como contenedor para exportar los otros componentes
const ProductSections = {
  Top: TopProductSections,
  Middle: MiddleProductSections,
  Bottom: BottomProductSections
};

export default ProductSections;
