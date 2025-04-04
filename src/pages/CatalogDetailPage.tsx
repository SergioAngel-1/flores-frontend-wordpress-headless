import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import AnimatedModal from '../components/ui/AnimatedModal';
import catalogService from '../services/catalogService';
import CatalogModal from '../components/catalogs/CatalogModal';
import ProductList from '../components/catalogs/ProductList';
import { CatalogPDFViewer, CatalogPDFDownloadLink } from '../components/catalogs/CatalogPDF';
import { Catalog, CatalogProduct, CatalogProductInput } from '../types/catalog';
import alertService from '../services/alertService';

const CatalogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const dataFetchedRef = useRef(false);

  // Función para cargar los productos del catálogo
  const loadCatalogProducts = useCallback(async (catalogId: number) => {
    try {
      console.log(`Cargando productos completos del catálogo ${catalogId}...`);
      const catalogProducts = await catalogService.getCompleteProducts(catalogId);
      console.log('Productos cargados:', catalogProducts);
      
      // Asegurarse de que catalogProducts sea un array
      const productsArray = Array.isArray(catalogProducts) ? catalogProducts : [];
      console.log('Array de productos normalizado:', productsArray);
      
      setProducts(productsArray);
    } catch (error) {
      console.error('Error al cargar productos del catálogo:', error);
      alertService.error('Error al cargar los productos del catálogo');
    }
  }, []);

  // Cargar catálogo y sus productos
  useEffect(() => {
    const loadCatalogData = async () => {
      // Evitar múltiples cargas durante el renderizado
      if (dataFetchedRef.current) return;
      
      if (!slug) {
        navigate('/catalogos');
        return;
      }

      try {
        setLoading(true);
        console.log('Cargando datos del catálogo...');
        
        // Utilizamos el slug para buscar el catálogo
        console.log(`Obteniendo catálogo por slug: ${slug}`);
        const allCatalogs = await catalogService.getAll();
        
        // Asegurarse de que allCatalogs sea un array
        const catalogsArray = Array.isArray(allCatalogs) ? allCatalogs : (allCatalogs?.catalogs || []);
        
        console.log('Catálogos obtenidos:', catalogsArray);
        
        const foundCatalog = catalogsArray.find((cat: Catalog) => {
          const catSlug = cat.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          return catSlug === slug;
        });

        if (!foundCatalog) {
          console.log('Catálogo no encontrado por slug');
          navigate('/catalogos');
          return;
        }
        
        console.log('Catálogo encontrado:', foundCatalog);
        setCatalog(foundCatalog);
        
        // Cargar los productos usando la función dedicada
        await loadCatalogProducts(foundCatalog.id);
        
        dataFetchedRef.current = true;
      } catch (error) {
        console.error('Error al cargar catálogo:', error);
        alertService.error('Error al cargar el catálogo. Intente nuevamente más tarde.');
        navigate('/catalogos');
      } finally {
        setLoading(false);
      }
    };

    loadCatalogData();
    
    // Limpiar el ref cuando el componente se desmonte
    return () => {
      dataFetchedRef.current = false;
    };
  }, [slug, navigate, loadCatalogProducts]);

  // Efecto para animación - solo se ejecuta cuando cambian los datos relevantes
  useEffect(() => {
    if (!loading && products.length > 0) {
      gsap.fromTo(
        '.product-item',
        { 
          opacity: 0,
          y: 20
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'power2.out' 
        }
      );
    }
  }, [loading, products]);

  const handleUpdateCatalog = useCallback(async (name: string, productsData: CatalogProductInput[], logoUrl?: string) => {
    if (!catalog) return;
    
    try {
      setLoading(true);
      
      // Preparar los datos para la actualización
      const updateData = { 
        name, 
        products: productsData,
        logoUrl
      };
      
      console.log('Enviando datos para actualizar catálogo:', updateData);
      
      const updatedCatalog = await catalogService.update(catalog.id, updateData);
      console.log('Catálogo actualizado:', updatedCatalog);
      
      setCatalog(updatedCatalog);
      
      // Actualizamos los productos del catálogo usando la función dedicada
      await loadCatalogProducts(updatedCatalog.id);
      
      setShowModal(false);
      alertService.success('Catálogo actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar catálogo:', error);
      alertService.error('Error al actualizar el catálogo');
    } finally {
      setLoading(false);
    }
  }, [catalog, loadCatalogProducts]);

  const handleUpdateProduct = useCallback(async (productId: number, updatedData: CatalogProductInput) => {
    if (!catalog) return;
    
    try {
      setLoading(true);
      console.log('Intentando actualizar producto con ID:', productId);
      console.log('Datos de actualización:', updatedData);
      
      // Validar datos críticos antes de enviar
      if (updatedData.id !== productId) {
        console.error('Inconsistencia en ID de producto:', productId, updatedData.id);
        alertService.error('Error al actualizar el producto: inconsistencia en ID');
        setLoading(false);
        return;
      }
      
      // Llamar a la API para actualizar el producto específico del catálogo
      const updatedProduct = await catalogService.updateCatalogProduct(catalog.id, updatedData);
      console.log('Producto actualizado correctamente:', updatedProduct);
      
      // Actualizar la lista de productos en el estado local
      setProducts(prevProducts => 
        prevProducts.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              // Actualizar solo los campos que hayan cambiado
              name: updatedProduct.catalog_name || product.name,
              price: updatedProduct.catalog_price ? String(updatedProduct.catalog_price) : product.price,
              catalog_price: updatedProduct.catalog_price !== null ? 
                String(updatedProduct.catalog_price) : product.catalog_price,
              catalog_name: updatedProduct.catalog_name,
              catalog_description: updatedProduct.catalog_description,
              catalog_short_description: updatedProduct.catalog_short_description,
              catalog_sku: updatedProduct.catalog_sku,
              catalog_image: updatedProduct.catalog_image,
              catalog_images: updatedProduct.catalog_images
            };
          }
          return product;
        })
      );
      
      alertService.success('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      alertService.error('Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  const handleExportPDF = useCallback(() => {
    if (!catalog) return;
    setShowPdfModal(true);
  }, [catalog]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
        </div>
      ) : catalog ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <div className="flex items-center mb-2">
                <button
                  onClick={() => navigate('/catalogos')}
                  className="mr-3 text-gray-600 hover:text-primario transition-colors flex items-center"
                  aria-label="Volver a catálogos"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm">Volver</span>
                </button>
                <h1 className="text-3xl font-bold text-primario">
                  {catalog.name}
                </h1>
              </div>
              <p className="text-gray-600">
                {catalog.product_count} productos
              </p>
            </div>
            <div className="flex flex-col sm:flex-row mt-4 md:mt-0 space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                className="bg-primario hover:bg-primario-dark text-white px-4 py-2 rounded flex items-center justify-center"
                onClick={handleExportPDF}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Exportar PDF
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center"
                onClick={() => setShowModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editar catálogo
              </button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            {products.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewType('grid')}
                      className={`p-2 rounded ${viewType === 'grid' ? 'bg-primario text-white' : 'bg-gray-200 text-gray-700'}`}
                      title="Vista de cuadrícula"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewType('list')}
                      className={`p-2 rounded ${viewType === 'list' ? 'bg-primario text-white' : 'bg-gray-200 text-gray-700'}`}
                      title="Vista de lista"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <ProductList 
                  products={products} 
                  onProductUpdate={handleUpdateProduct}
                  viewType={viewType}
                />
              </>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-4">No hay productos en este catálogo</h2>
                <p className="text-gray-600 mb-8">Añade productos para comenzar a utilizar este catálogo.</p>
                <button
                  className="bg-primario hover:bg-primario-dark text-white px-6 py-3 rounded-lg"
                  onClick={() => setShowModal(true)}
                >
                  Añadir productos
                </button>
              </div>
            )}
          </div>

          {/* Modal para editar catálogo */}
          <AnimatedModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            maxWidth="max-w-4xl"
          >
            <CatalogModal
              initialName={catalog.name}
              initialLogoUrl={catalog.logo_url}
              initialProductIds={(Array.isArray(products) ? products : []).map(product => product.id)}
              initialProductsData={(Array.isArray(products) ? products : []).map(product => ({
                id: product.id,
                product_id: product.id,
                catalog_price: product.catalog_price ? parseFloat(String(product.catalog_price)) : null,
                catalog_name: product.catalog_name,
                catalog_description: product.catalog_description,
                catalog_short_description: product.catalog_short_description,
                catalog_sku: product.catalog_sku,
                catalog_image: product.catalog_image,
                catalog_images: product.catalog_images,
                is_custom: product.is_custom
              }))}
              initialCatalogId={catalog.id}
              isEditing={true}
              onSave={handleUpdateCatalog}
              onCancel={() => setShowModal(false)}
            />
          </AnimatedModal>

          {/* Modal para vista previa y descarga del PDF */}
          <AnimatedModal
            isOpen={showPdfModal}
            onClose={() => setShowPdfModal(false)}
            maxWidth="max-w-6xl"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Vista previa del catálogo en PDF</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPdfModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <CatalogPDFDownloadLink
                  catalogName={catalog.name}
                  products={products}
                  viewType={viewType}
                  logoUrl={catalog.logo_url || "/wp-content/themes/FloresInc/assets/img/logo.png"}
                />
              </div>

              <div className="border border-gray-300 rounded">
                <CatalogPDFViewer
                  catalogName={catalog.name}
                  products={products}
                  viewType={viewType}
                  logoUrl={catalog.logo_url || "/wp-content/themes/FloresInc/assets/img/logo.png"}
                />
              </div>
            </div>
          </AnimatedModal>
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-4">No se encontró el catálogo</h2>
          <button
            className="bg-primario hover:bg-primario-dark text-white px-6 py-3 rounded-lg"
            onClick={() => navigate('/catalogos')}
          >
            Volver a catálogos
          </button>
        </div>
      )}
    </div>
  );
};

export default CatalogDetailPage;
