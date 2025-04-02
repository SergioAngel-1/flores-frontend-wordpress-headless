import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import AnimatedModal from '../components/ui/AnimatedModal';
import { catalogService } from '../services/api';
import CatalogModal from '../components/catalogs/CatalogModal';
import ProductList from '../components/catalogs/ProductList';
import { Catalog, CatalogProduct, CatalogProductInput } from '../types/catalog';
import alertService from '../services/alertService';

const CatalogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const dataFetchedRef = useRef(false);

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
        const foundCatalog = allCatalogs.find((cat: Catalog) => {
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
        
        // Obtenemos los productos del catálogo
        console.log(`Obteniendo productos del catálogo ${foundCatalog.id}`);
        const catalogProducts = await catalogService.getCatalogProducts(foundCatalog.id);
        console.log('Productos del catálogo:', catalogProducts);
        setProducts(catalogProducts);
        
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
  }, [slug, navigate]);

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

  const handleUpdateCatalog = useCallback(async (name: string, productsData: CatalogProductInput[]) => {
    if (!catalog) return;
    
    try {
      setLoading(true);
      
      // Preparar los datos para la actualización
      const updateData = { 
        name, 
        products: productsData 
      };
      
      console.log('Enviando datos para actualizar catálogo:', updateData);
      
      const updatedCatalog = await catalogService.update(catalog.id, updateData);
      console.log('Catálogo actualizado:', updatedCatalog);
      
      setCatalog(updatedCatalog);
      
      // Actualizamos los productos del catálogo
      console.log(`Obteniendo productos actualizados del catálogo ${updatedCatalog.id}`);
      const catalogProducts = await catalogService.getCatalogProducts(updatedCatalog.id);
      console.log('Productos actualizados:', catalogProducts);
      setProducts(catalogProducts);
      
      setShowModal(false);
      alertService.success('Catálogo actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar catálogo:', error);
      alertService.error('Error al actualizar el catálogo');
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  const handleUpdateProduct = useCallback(async (productId: number, updatedData: CatalogProductInput) => {
    if (!catalog) return;
    
    try {
      setLoading(true);
      
      // Llamar a la API para actualizar el producto específico del catálogo
      await catalogService.updateCatalogProduct(catalog.id, updatedData);
      
      // Actualizar la lista de productos en el estado local
      setProducts(prevProducts => 
        prevProducts.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              name: updatedData.catalog_name || product.name,
              catalog_price: updatedData.catalog_price ? updatedData.catalog_price.toString() : product.catalog_price,
              catalog_name: updatedData.catalog_name || null,
              catalog_description: updatedData.catalog_description || null,
              catalog_short_description: updatedData.catalog_short_description || null,
              catalog_sku: updatedData.catalog_sku || null,
              catalog_image: updatedData.catalog_image || null,
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

  const handleExportPDF = useCallback(async () => {
    if (!catalog) return;
    
    try {
      setLoading(true);
      console.log(`Generando PDF para el catálogo ${catalog.id}`);
      
      const response = await catalogService.generatePDF(catalog.id);
      
      // Crear URL para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear enlace temporal y simular clic para descargar
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `catalogo-${catalog.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alertService.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alertService.error('Error al generar el PDF del catálogo');
    } finally {
      setLoading(false);
    }
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
              <ProductList 
                products={products} 
                onProductUpdate={handleUpdateProduct}
              />
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
            title="Editar Catálogo"
          >
            <CatalogModal 
              initialName={catalog.name}
              initialCatalogId={catalog.id}
              initialProductIds={products.map(p => p.id)}
              initialProductsData={products.map(p => ({
                id: p.id,
                catalog_price: p.catalog_price ? parseFloat(p.catalog_price) : null,
                catalog_name: p.catalog_name,
                catalog_description: p.catalog_description,
                catalog_short_description: p.catalog_short_description,
                catalog_sku: p.catalog_sku,
                catalog_image: p.catalog_image,
                catalog_images: p.catalog_images
              }))}
              onSave={handleUpdateCatalog} 
              onCancel={() => setShowModal(false)} 
              isEditing={true}
            />
          </AnimatedModal>
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Catálogo no encontrado</h2>
          <p className="text-gray-600 mb-8">El catálogo que buscas no existe o ha sido eliminado.</p>
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
