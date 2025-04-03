import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CatalogProduct, CatalogProductInput } from '../../types/catalog';
import ProductList from './ProductList';
import alertService from '../../services/alertService';

interface CatalogPDFProps {
  catalogName: string;
  products: CatalogProduct[];
  viewType: 'grid' | 'list';
  logoUrl: string;
}

/**
 * Componente que renderiza el contenido del catálogo para exportar a PDF
 */
const CatalogPDFContent: React.FC<CatalogPDFProps> = ({ 
  catalogName, 
  products, 
  viewType, 
  logoUrl 
}) => {
  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="pdf-container bg-white p-8" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <img src={logoUrl} alt="Logo" className="h-12" />
        <div className="text-right">
          <h2 className="text-xl font-bold">{catalogName}</h2>
          <p className="text-sm text-gray-600">Fecha: {currentDate}</p>
        </div>
      </div>
      
      {/* Contenido del catálogo - Usando el mismo componente ProductList */}
      <ProductList 
        products={products} 
        viewType={viewType}
        onProductUpdate={(_: number, __: CatalogProductInput) => Promise.resolve()} // Función que devuelve una Promise vacía, ignorando parámetros
      />
      
      {/* Pie de página */}
      <div className="border-t border-gray-200 pt-4 mt-8 text-sm text-gray-500 flex justify-between">
        <div> {new Date().getFullYear()} Flores Inc.</div>
        <div>Catálogo generado el {currentDate}</div>
      </div>
    </div>
  );
};

/**
 * Componente para exportar el catálogo a PDF utilizando html2canvas y jsPDF
 */
export const CatalogPDFDownloadLink: React.FC<CatalogPDFProps & { fileName?: string }> = ({ 
  fileName, 
  ...props 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = React.useState(false);

  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    try {
      setGenerating(true);
      alertService.info('Generando PDF, por favor espere...');
      
      // Renderizar el componente ProductList en un elemento oculto
      const contentElement = contentRef.current;
      
      // Usar html2canvas para convertir el contenido HTML a una imagen
      const canvas = await html2canvas(contentElement, {
        scale: 2, // Mayor calidad
        useCORS: true, // Permitir imágenes de otros dominios
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false, // No permitir imágenes contaminadas (cross-origin)
        imageTimeout: 15000, // Timeout para cargar imágenes (15s)
        onclone: (document) => {
          // Ajustar estilos en el clon para mejor renderizado
          const elements = document.querySelectorAll('.pdf-container *');
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.fontFamily = 'Arial, sans-serif';
            }
          });
          return document;
        }
      });
      
      // Calcular dimensiones para el PDF (A4)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Crear documento PDF
      const pdf = new jsPDF({
        orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      let pdfName = fileName || `catalogo-${props.catalogName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      
      // Manejar contenido de múltiples páginas
      let position = 0;
      let heightLeft = imgHeight;
      
      // Añadir la primera página
      pdf.addImage({
        imageData: canvas,
        format: 'PNG',
        x: 0,
        y: position,
        width: imgWidth,
        height: imgHeight
      });
      
      heightLeft -= pageHeight;
      
      // Añadir páginas adicionales si el contenido es más largo que una página
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage({
          imageData: canvas,
          format: 'PNG',
          x: 0,
          y: position,
          width: imgWidth,
          height: imgHeight
        });
        heightLeft -= pageHeight;
      }
      
      // Descargar el PDF
      pdf.save(pdfName);
      alertService.success('PDF generado correctamente');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alertService.error('Error al generar el PDF. Intente nuevamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      {/* Botón para generar y descargar el PDF */}
      <button
        onClick={generatePDF}
        disabled={generating}
        className="bg-primario hover:bg-primario-dark text-white px-4 py-2 rounded flex items-center justify-center disabled:opacity-50"
      >
        {generating ? (
          <>
            <span className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
            Generando PDF...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Descargar PDF
          </>
        )}
      </button>
      
      {/* Contenedor oculto para renderizar el contenido que se convertirá a PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1000px' }} ref={contentRef}>
        <CatalogPDFContent {...props} />
      </div>
    </>
  );
};

/**
 * Componente para visualizar el catálogo en formato PDF
 */
export const CatalogPDFViewer: React.FC<CatalogPDFProps> = (props) => (
  <div className="pdf-viewer">
    <CatalogPDFContent {...props} />
  </div>
);

export default CatalogPDFContent;
