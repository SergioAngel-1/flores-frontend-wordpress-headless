import React, { useState, useRef } from 'react';
import { CatalogExtra } from '../services/catalogExtraService';
import { FaThLarge, FaList, FaArrowLeft, FaEye, FaFilePdf } from 'react-icons/fa';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import CatalogPDF from './CatalogPDF';

interface CatalogViewerProps {
  catalog: CatalogExtra;
  onBack: () => void;
}

// Componente para manejar errores en el PDF
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error en el componente PDF:', error);
    return null;
  }
};

const CatalogViewer: React.FC<CatalogViewerProps> = ({ catalog, onBack }) => {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<boolean>(false);
  const [showImageValidation, setShowImageValidation] = useState<boolean>(false);
  const [validationMode, setValidationMode] = useState<'preview' | 'download'>('download');
  const [imageValidationStatus, setImageValidationStatus] = useState<{
    total: number;
    loaded: number;
    failed: number;
    inProgress: boolean;
    failedUrls: string[];
  }>({
    total: 0,
    loaded: 0,
    failed: 0,
    inProgress: false,
    failedUrls: []
  });
  const imageValidationRef = useRef<HTMLDivElement>(null);

  // Memoizar el documento PDF para evitar re-renderizaciones innecesarias
  const renderPDF = () => (
    <CatalogPDF catalog={catalog} displayMode={displayMode} />
  );

  // Función para normalizar URL
  const normalizeUrl = (url: string): string => {
    if (!url || url.trim() === '') return '';
    
    if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:')) {
      const baseUrl = window.location.origin;
      const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      return `${baseUrl}/${cleanUrl}`;
    }
    
    return url;
  };

  // Función para validar las imágenes antes de descargar o previsualizar el PDF
  const validateImages = (mode: 'preview' | 'download') => {
    // Establecer el modo de validación
    setValidationMode(mode);
    
    // Mostrar el modal de validación
    setShowImageValidation(true);
    setImageValidationStatus({
      total: 0,
      loaded: 0,
      failed: 0,
      inProgress: true,
      failedUrls: []
    });

    // Recopilar todas las URLs de imágenes del catálogo
    const imageUrls: string[] = [];
    
    // Añadir el logo si existe
    if (catalog.logo) {
      imageUrls.push(catalog.logo);
    }
    
    // Añadir imágenes de productos
    catalog.products.forEach(product => {
      if (product.main_image && product.main_image.trim() !== '') {
        imageUrls.push(product.main_image);
      }
      if (product.secondary_image_1 && product.secondary_image_1.trim() !== '') {
        imageUrls.push(product.secondary_image_1);
      }
      if (product.secondary_image_2 && product.secondary_image_2.trim() !== '') {
        imageUrls.push(product.secondary_image_2);
      }
    });
    
    // Actualizar el total de imágenes
    setImageValidationStatus(prev => ({
      ...prev,
      total: imageUrls.length
    }));
    
    // Si no hay imágenes para validar, terminar inmediatamente
    if (imageUrls.length === 0) {
      setImageValidationStatus(prev => ({
        ...prev,
        inProgress: false
      }));
      return;
    }
    
    // Validar cada imagen
    let loadedCount = 0;
    let failedCount = 0;
    let failedUrlsList: string[] = [];
    
    // Crear un proxy para las imágenes que evite problemas de CORS
    const validateImageWithProxy = (url: string) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        
        // Normalizar URL para la validación
        const normalizedUrl = normalizeUrl(url);
        
        img.onload = () => {
          // La imagen se cargó correctamente
          loadedCount++;
          setImageValidationStatus(prev => ({
            ...prev,
            loaded: loadedCount,
            inProgress: (loadedCount + failedCount) < imageUrls.length
          }));
          
          // Desplazar al final del modal para mostrar el progreso más reciente
          if (imageValidationRef.current) {
            imageValidationRef.current.scrollTop = imageValidationRef.current.scrollHeight;
          }
          
          resolve(true);
        };
        
        img.onerror = () => {
          // Intentar con un enfoque alternativo usando fetch y canvas
          fetch(normalizedUrl, { 
            mode: 'no-cors',  // Usar no-cors para evitar restricciones CORS
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
          })
          .then(blob => {
            // Crear una URL de objeto para la imagen
            const objectUrl = URL.createObjectURL(blob);
            const imgElement = new Image();
            
            imgElement.onload = () => {
              // La imagen se cargó correctamente a través del proxy
              URL.revokeObjectURL(objectUrl);
              loadedCount++;
              setImageValidationStatus(prev => ({
                ...prev,
                loaded: loadedCount,
                inProgress: (loadedCount + failedCount) < imageUrls.length
              }));
              
              // Desplazar al final del modal
              if (imageValidationRef.current) {
                imageValidationRef.current.scrollTop = imageValidationRef.current.scrollHeight;
              }
              
              resolve(true);
            };
            
            imgElement.onerror = () => {
              // La imagen falló incluso con el proxy
              URL.revokeObjectURL(objectUrl);
              handleImageFailure(url, normalizedUrl);
              resolve(false);
            };
            
            imgElement.src = objectUrl;
          })
          .catch(() => {
            // Falló el fetch, intentar con un iframe como último recurso
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Crear un timeout para detectar si la imagen no se carga
            const timeoutId = setTimeout(() => {
              document.body.removeChild(iframe);
              handleImageFailure(url, normalizedUrl);
              resolve(false);
            }, 5000); // 5 segundos de timeout
            
            iframe.onload = () => {
              clearTimeout(timeoutId);
              
              try {
                // Intentar acceder al contenido del iframe
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                
                if (iframeDoc) {
                  // Si podemos acceder al documento, la imagen probablemente existe
                  loadedCount++;
                  setImageValidationStatus(prev => ({
                    ...prev,
                    loaded: loadedCount,
                    inProgress: (loadedCount + failedCount) < imageUrls.length
                  }));
                  
                  // Desplazar al final del modal
                  if (imageValidationRef.current) {
                    imageValidationRef.current.scrollTop = imageValidationRef.current.scrollHeight;
                  }
                  
                  document.body.removeChild(iframe);
                  resolve(true);
                } else {
                  document.body.removeChild(iframe);
                  handleImageFailure(url, normalizedUrl);
                  resolve(false);
                }
              } catch (e) {
                // Error al acceder al contenido del iframe (probablemente por CORS)
                document.body.removeChild(iframe);
                handleImageFailure(url, normalizedUrl);
                resolve(false);
              }
            };
            
            // Navegar al iframe a la URL de la imagen
            iframe.src = normalizedUrl;
          });
        };
        
        // Función auxiliar para manejar fallos de imagen
        const handleImageFailure = (originalUrl: string, normalizedUrl: string) => {
          failedCount++;
          failedUrlsList.push(originalUrl);
          
          setImageValidationStatus(prev => ({
            ...prev,
            failed: failedCount,
            failedUrls: [...failedUrlsList],
            inProgress: (loadedCount + failedCount) < imageUrls.length
          }));
          
          console.error(`Error al cargar imagen: ${originalUrl} (normalizada: ${normalizedUrl})`);
          
          // Desplazar al final del modal
          if (imageValidationRef.current) {
            imageValidationRef.current.scrollTop = imageValidationRef.current.scrollHeight;
          }
        };
        
        // Establecer atributos para evitar problemas de caché
        img.crossOrigin = "anonymous";
        
        // Iniciar la carga de la imagen con la URL normalizada
        img.src = normalizedUrl;
      });
    };
    
    // Procesar todas las imágenes en paralelo
    Promise.all(imageUrls.map(url => validateImageWithProxy(url)))
      .then(() => {
        console.log('Validación de imágenes completada');
        // La validación se completa automáticamente cuando todas las promesas se resuelven
      })
      .catch(error => {
        console.error('Error durante la validación de imágenes:', error);
        // Asegurarse de que el estado de validación se actualice correctamente
        setImageValidationStatus(prev => ({
          ...prev,
          inProgress: false
        }));
      });
  };

  // Función para continuar después de la validación
  const continueAfterValidation = () => {
    setShowImageValidation(false);
    
    if (validationMode === 'preview') {
      setPreviewMode(true);
      setPdfError(false);
    }
  };

  // Componente para el botón de descarga de PDF
  const PDFDownloadLinkWrapper = () => {
    return (
      <ErrorBoundary>
        <button
          onClick={() => validateImages('download')}
          className="bg-primario text-white py-2 px-4 rounded flex items-center justify-center hover:bg-oscuro transition"
          disabled={!catalog || catalog.products.length === 0}
        >
          <FaFilePdf className="mr-2" /> Descargar PDF
        </button>
        
        {showImageValidation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  Validando imágenes para {validationMode === 'preview' ? 'previsualización' : 'PDF'}
                </h3>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto" ref={imageValidationRef}>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Progreso:</span>
                    <span className="text-gray-700">
                      {imageValidationStatus.loaded + imageValidationStatus.failed} / {imageValidationStatus.total}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primario h-2.5 rounded-full" 
                      style={{ 
                        width: `${imageValidationStatus.total > 0 
                          ? ((imageValidationStatus.loaded + imageValidationStatus.failed) / imageValidationStatus.total) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="text-green-800 font-medium">Cargadas</div>
                    <div className="text-2xl font-bold text-green-600">{imageValidationStatus.loaded}</div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <div className="text-red-800 font-medium">Fallidas</div>
                    <div className="text-2xl font-bold text-red-600">{imageValidationStatus.failed}</div>
                  </div>
                </div>
                
                {imageValidationStatus.failedUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Imágenes con problemas:</h4>
                    <div className="bg-red-50 p-3 rounded border border-red-200 max-h-40 overflow-y-auto">
                      <ul className="list-disc pl-5 space-y-1">
                        {imageValidationStatus.failedUrls.map((url, index) => (
                          <li key={index} className="text-sm text-red-800 break-all">
                            {url}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Nota: Las imágenes con problemas se reemplazarán por un marcador de posición en el PDF.
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowImageValidation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                
                {validationMode === 'download' ? (
                  <PDFDownloadLink
                    document={renderPDF()}
                    fileName={`catalogo-${catalog.slug || 'productos'}.pdf`}
                    className={`px-4 py-2 rounded-md text-white ${imageValidationStatus.inProgress ? 'bg-gray-400 cursor-not-allowed' : 'bg-primario hover:bg-oscuro'}`}
                    onClick={() => !imageValidationStatus.inProgress && setShowImageValidation(false)}
                  >
                    {({ loading, error }) => 
                      loading || imageValidationStatus.inProgress ? 
                        "Generando..." : 
                        error ? 
                          "Error al generar" : 
                          "Descargar PDF"
                    }
                  </PDFDownloadLink>
                ) : (
                  <button
                    onClick={continueAfterValidation}
                    disabled={imageValidationStatus.inProgress}
                    className={`px-4 py-2 rounded-md text-white ${imageValidationStatus.inProgress ? 'bg-gray-400 cursor-not-allowed' : 'bg-primario hover:bg-oscuro'}`}
                  >
                    {imageValidationStatus.inProgress ? "Validando..." : "Continuar a previsualización"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </ErrorBoundary>
    );
  };

  if (previewMode) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <button 
            onClick={() => setPreviewMode(false)}
            className="bg-secundario text-texto py-2 px-4 rounded flex items-center hover:bg-border transition"
          >
            <FaArrowLeft className="mr-2" /> Volver
          </button>
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                setDisplayMode(displayMode === 'grid' ? 'list' : 'grid');
                setPdfError(false);
              }}
              className="bg-primario text-white py-2 px-4 rounded flex items-center hover:bg-oscuro transition"
            >
              {displayMode === 'grid' ? (
                <><FaList className="mr-2" /> Usar vista de lista</>
              ) : (
                <><FaThLarge className="mr-2" /> Usar vista de cuadrícula</>
              )}
            </button>
            <button 
              onClick={() => onBack()}
              className="bg-secundario text-texto py-2 px-4 rounded flex items-center hover:bg-border transition"
            >
              <FaArrowLeft className="mr-2" /> Volver a catálogos
            </button>
          </div>
        </div>
        <div className="flex-grow">
          {pdfError ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-lg text-center">
                <h3 className="text-xl font-bold mb-2">Error al generar el PDF</h3>
                <p className="mb-4">Hubo un problema al generar la vista previa del PDF. Por favor, intenta cambiar a la vista de cuadrícula o lista.</p>
                <button 
                  onClick={() => {
                    setDisplayMode(displayMode === 'grid' ? 'list' : 'grid');
                    setPdfError(false);
                  }}
                  className="bg-primario text-white py-2 px-4 rounded"
                >
                  Cambiar vista
                </button>
              </div>
            </div>
          ) : (
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <ErrorBoundary>
                {renderPDF()}
              </ErrorBoundary>
            </PDFViewer>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">{catalog.title}</h1>
          <button 
            onClick={onBack}
            className="bg-secundario text-texto py-2 px-4 rounded flex items-center hover:bg-border transition"
          >
            <FaArrowLeft className="mr-2" /> Volver a catálogos
          </button>
        </div>
        <p className="text-gray-600 mb-6">Catálogo de productos con precios especiales</p>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Información del catálogo</h2>
            <p className="text-gray-600">Total de productos: {catalog.products.length}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => validateImages('preview')}
              className="bg-primario text-white py-2 px-4 rounded flex items-center justify-center hover:bg-oscuro transition"
              disabled={!catalog || catalog.products.length === 0}
              title={!catalog ? "Cargando catálogo..." : catalog.products.length === 0 ? "No hay productos en el catálogo" : "Previsualizar catálogo"}
            >
              <FaEye className="mr-2" /> Previsualizar
            </button>
            
            <PDFDownloadLinkWrapper />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primario">Vista previa de productos</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`p-2 rounded flex items-center ${displayMode === 'grid' ? 'bg-primario text-white' : 'bg-secundario text-texto'}`}
              title="Vista de cuadrícula"
            >
              <FaThLarge className="mr-1" /> Cuadrícula
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`p-2 rounded flex items-center ${displayMode === 'list' ? 'bg-primario text-white' : 'bg-secundario text-texto'}`}
              title="Vista de lista"
            >
              <FaList className="mr-1" /> Lista
            </button>
          </div>
        </div>
        
        {/* Información de depuración */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <p className="font-semibold">Información del catálogo:</p>
          <p>Total de productos: {catalog.products.length}</p>
          <details>
            <summary className="cursor-pointer text-primario font-medium">Ver detalles de productos</summary>
            <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(catalog.products.map(p => ({id: p.id, name: p.name, is_custom: p.is_custom})), null, 2)}
            </pre>
          </details>
        </div>
        
        {catalog.products.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600">No hay productos en este catálogo.</p>
            <p className="text-sm text-gray-500 mt-2">Añade productos desde el panel de administración de WordPress.</p>
          </div>
        ) : displayMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.products.map(product => (
              <div key={product.id} className="border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                {product.main_image && (
                  <div className="h-48 overflow-hidden bg-claro relative">
                    <img 
                      src={product.main_image} 
                      alt={product.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Q0EzQUYiPlNpbiBpbWFnZW48L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="font-bold text-lg text-primario truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                  
                  {product.short_description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{product.short_description}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      {product.regular_price !== product.custom_price && (
                        <span className="text-gray-500 line-through mr-2">${product.regular_price}</span>
                      )}
                      <span className="text-primario font-bold">${product.custom_price}</span>
                    </div>
                    
                    {product.regular_price !== product.custom_price && (
                      <span className="bg-primario text-white text-xs px-2 py-1 rounded">
                        {Math.round(((parseFloat(product.regular_price) - parseFloat(product.custom_price)) / parseFloat(product.regular_price)) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {catalog.products.map(product => (
              <div key={product.id} className="border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col md:flex-row">
                {product.main_image && (
                  <div className="w-full md:w-48 h-48 overflow-hidden bg-claro relative">
                    <img 
                      src={product.main_image} 
                      alt={product.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Q0EzQUYiPlNpbiBpbWFnZW48L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-4 flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-primario">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                    </div>
                    
                    <div className="mt-2 md:mt-0 md:text-right">
                      {product.regular_price !== product.custom_price && (
                        <div>
                          <span className="text-gray-500 line-through">${product.regular_price}</span>
                          <span className="bg-primario text-white text-xs px-2 py-1 rounded ml-2">
                            {Math.round(((parseFloat(product.regular_price) - parseFloat(product.custom_price)) / parseFloat(product.regular_price)) * 100)}% OFF
                          </span>
                        </div>
                      )}
                      <span className="text-primario font-bold text-xl">${product.custom_price}</span>
                    </div>
                  </div>
                  
                  {product.short_description && (
                    <p className="text-sm text-gray-700 mt-3">{product.short_description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogViewer;
