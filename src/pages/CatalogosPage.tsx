import React, { useState, useEffect } from 'react';
import { CatalogExtra } from '../services/catalogExtraService';
import { FaSpinner } from 'react-icons/fa';
import CatalogSelector from '../components/CatalogSelector';
import CatalogViewer from '../components/CatalogViewer';
import styled from 'styled-components';

// Estilos para el enlace de descarga del PDF
export const PDFDownloadLinkWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  
  a {
    background-color: var(--color-primario);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--color-oscuro);
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    svg {
      margin-right: 0.5rem;
    }
  }
`;

const CatalogosPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogExtra | null>(null);
  const [showCatalogSelector, setShowCatalogSelector] = useState<boolean>(true);

  // Cargar el catálogo por defecto
  useEffect(() => {
    const fetchDefaultCatalog = async () => {
      try {
        setLoading(true);
        // Inicialmente no cargamos ningún catálogo por defecto
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        setError('No se pudo cargar el catálogo. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchDefaultCatalog();
  }, []);

  // Manejar la selección de un catálogo
  const handleSelectCatalog = (catalog: CatalogExtra) => {
    setSelectedCatalog(catalog);
    setShowCatalogSelector(false);
  };

  // Volver a la selección de catálogos
  const handleBackToSelector = () => {
    setShowCatalogSelector(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-primario mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-texto">Cargando catálogos...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {showCatalogSelector ? (
        <CatalogSelector onSelectCatalog={handleSelectCatalog} />
      ) : selectedCatalog ? (
        <CatalogViewer catalog={selectedCatalog} onBack={handleBackToSelector} />
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600">No se encontró ningún catálogo. Por favor, selecciona uno de la lista.</p>
          <button
            onClick={handleBackToSelector}
            className="mt-4 bg-primario text-white py-2 px-4 rounded hover:bg-oscuro transition"
          >
            Seleccionar catálogo
          </button>
        </div>
      )}
    </div>
  );
};

export default CatalogosPage;
