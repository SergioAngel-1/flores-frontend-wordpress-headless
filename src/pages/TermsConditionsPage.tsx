import { useState, useEffect, useRef } from 'react';
import { api } from '../services/apiConfig';

const TermsConditionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termsData, setTermsData] = useState<{
    title: string;
    content: string;
    date: string;
    modified: string;
  } | null>(null);
  
  // Referencia para el contenedor principal
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTermsConditions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/floresinc/v1/legal/terms_conditions');
        
        if (response.data.data) {
          setTermsData({
            title: response.data.data.title,
            content: response.data.data.content,
            date: response.data.data.date,
            modified: response.data.data.modified
          });
          
          // Desplazar hacia arriba después de cargar el contenido
          setTimeout(() => {
            if (contentRef.current) {
              window.scrollTo({
                top: contentRef.current.offsetTop - 100,
                behavior: 'smooth'
              });
            }
          }, 100);
        } else {
          setError('No se encontraron los términos y condiciones');
        }
      } catch (err) {
        console.error('Error al cargar los términos y condiciones:', err);
        setError('Error al cargar los términos y condiciones. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchTermsConditions();
    
    // Desplazar hacia arriba al montar el componente
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen" ref={contentRef}>
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
            <p className="ml-3 text-primario font-medium">Cargando...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex flex-col items-center justify-center text-center">
            <div className="text-red-500 text-3xl mb-2">⚠️</div>
            <p className="text-red-700 mb-3">{error}</p>
          </div>
        ) : termsData ? (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-primario mb-6">{termsData.title}</h1>
            
            <div className="text-sm text-gray-500 mb-6 flex flex-wrap gap-x-6">
              <p>Fecha de publicación: {formatDate(termsData.date)}</p>
              <p>Última actualización: {formatDate(termsData.modified)}</p>
            </div>
            
            <div 
              className="prose prose-lg max-w-none legal-content"
              dangerouslySetInnerHTML={{ __html: termsData.content }}
            />
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-lg text-gray-600">No se encontraron los términos y condiciones</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsConditionsPage;
