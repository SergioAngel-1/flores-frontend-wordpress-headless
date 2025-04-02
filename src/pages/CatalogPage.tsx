import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Catalog, CatalogProductInput } from '../types/catalog';
import catalogService from '../services/catalogService';
import alertService from '../services/alertService';
import AnimatedModal from '../components/ui/AnimatedModal';
import CatalogModal from '../components/catalogs/CatalogModal';
import CatalogList from '../components/catalogs/CatalogList';
import EmptyState from '../components/catalogs/EmptyState';

const CatalogPage = () => {
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredCatalogs, setFilteredCatalogs] = useState<Catalog[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const dataFetchedRef = useRef(false);
  const catalogsPerPage = 10;

  // Cargar catálogos
  useEffect(() => {
    const loadCatalogs = async () => {
      // Evitar múltiples cargas durante el renderizado
      if (dataFetchedRef.current) return;
      
      try {
        setLoading(true);
        console.log('Cargando catálogos...');
        
        const response = await catalogService.getAll();
        console.log('Catálogos cargados:', response);
        
        setCatalogs(response);
        dataFetchedRef.current = true;
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        alertService.error('Error al cargar los catálogos. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadCatalogs();
    
    // Limpiar el ref cuando el componente se desmonte
    return () => {
      dataFetchedRef.current = false;
    };
  }, []);

  // Filtrar y paginar catálogos
  useEffect(() => {
    // Primero filtramos por término de búsqueda
    const filtered = searchTerm 
      ? catalogs.filter(catalog => 
          catalog.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : catalogs;
    
    // Calculamos el total de páginas
    const newTotalPages = Math.ceil(filtered.length / catalogsPerPage);
    setTotalPages(newTotalPages);
    
    // Ajustamos la página actual si está fuera de rango
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
    
    // Calculamos índices para paginación
    const startIndex = (currentPage - 1) * catalogsPerPage;
    const endIndex = startIndex + catalogsPerPage;
    
    // Obtenemos los catálogos para la página actual
    const paginatedCatalogs = filtered.slice(startIndex, endIndex);
    
    setFilteredCatalogs(paginatedCatalogs);
  }, [catalogs, searchTerm, currentPage]);

  // Efecto para animación - solo se ejecuta cuando cambian los datos relevantes
  useEffect(() => {
    if (!loading && filteredCatalogs.length > 0) {
      gsap.fromTo(
        '.catalog-item',
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
  }, [loading, filteredCatalogs]);

  const handleCreateCatalog = useCallback(async (name: string, productsData: CatalogProductInput[]) => {
    try {
      setLoading(true);
      
      // Asegurar que los datos se envían en el formato correcto
      const catalogData = {
        name: name.trim(),
        products: productsData
      };
      
      console.log('Enviando datos para crear catálogo:', catalogData);
      
      const response = await catalogService.create(catalogData);
      console.log('Respuesta de creación de catálogo:', response);
      
      // Verificar que la respuesta contiene los datos esperados
      if (response && response.id) {
        // Añadir el nuevo catálogo a la lista
        setCatalogs(prev => [...prev, response]);
        
        // Cerrar el modal y mostrar mensaje de éxito
        setShowModal(false);
        
        // Mostrar notificación de éxito
        alertService.success('Catálogo creado exitosamente');
      } else {
        console.error('Respuesta inesperada al crear catálogo:', response);
        alertService.error('Error al crear el catálogo: Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error al crear catálogo:', error);
      
      // Mostrar mensaje de error al usuario
      let errorMessage = 'Error al crear el catálogo';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      alertService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCatalogClick = useCallback((catalogId: number, catalogName: string) => {
    const slug = catalogName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    navigate(`/catalogos/${slug}`, { state: { catalogId } });
  }, [navigate]);

  const handleDeleteCatalog = useCallback(async (catalogId: number) => {
    try {
      // Mostrar confirmación antes de eliminar
      alertService.confirm(
        '¿Estás seguro de que deseas eliminar este catálogo? Esta acción no se puede deshacer.',
        async () => {
          setLoading(true);
          await catalogService.delete(catalogId);
          
          // Actualizar la lista de catálogos
          setCatalogs(prev => prev.filter(catalog => catalog.id !== catalogId));
          
          alertService.success('Catálogo eliminado exitosamente');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error al eliminar catálogo:', error);
      alertService.error('Error al eliminar el catálogo');
      setLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset a la primera página con cada búsqueda
  }, []);

  const handleEditCatalog = useCallback(async (catalog: Catalog) => {
    try {
      // No establecer loading aquí para evitar re-renderizados innecesarios de la lista
      setIsEditing(true);
      
      // Log para depuración
      console.log(`Editando catálogo con ID: ${catalog.id}, Nombre: ${catalog.name}`);
      
      // Cargar los productos del catálogo
      const response = await catalogService.getProducts(catalog.id);
      
      // La respuesta ya es el objeto de datos, no necesitamos acceder a response.data
      if (response) {
        // Actualizar el catálogo seleccionado con los productos cargados
        const catalogWithProducts = {
          ...catalog,
          products: response
        };
        
        console.log('Catálogo con productos cargados:', catalogWithProducts);
        
        // Primero actualizar el catálogo seleccionado
        setSelectedCatalog(catalogWithProducts);
        
        // Verificar que el catálogo tenga un ID válido antes de abrir el modal
        if (!catalogWithProducts.id) {
          console.error('Error: El catálogo no tiene un ID válido');
          alertService.error('Error al editar el catálogo: ID no válido');
          return;
        }
        
        // Luego abrir el modal (esto evita que se abra sin datos)
        setShowModal(true);
      } else {
        throw new Error('No se pudieron cargar los productos del catálogo');
      }
    } catch (error) {
      console.error(`Error al cargar los productos del catálogo ${catalog.id}:`, error);
      alertService.error('Error al cargar los productos del catálogo');
      
      // Resetear estados en caso de error
      setIsEditing(false);
      setSelectedCatalog(null);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primario" data-component-name="CatalogPage">
          Catálogos
        </h1>
        <button
          className="bg-primario hover:bg-primario-dark text-white px-4 py-2 rounded flex items-center"
          onClick={() => {
            setIsEditing(false);
            setShowModal(true);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Crear Catálogo
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primario focus:border-primario"
            placeholder="Buscar catálogos..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
        </div>
      ) : catalogs.length === 0 ? (
        <EmptyState onCreateClick={() => setShowModal(true)} />
      ) : (
        <>
          <CatalogList 
            catalogs={filteredCatalogs} 
            onCatalogClick={handleCatalogClick}
            onDeleteCatalog={handleDeleteCatalog}
            onEditCatalog={handleEditCatalog}
          />
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav aria-label="Paginación de catálogos">
                <ul className="inline-flex -space-x-px text-sm">
                  <li>
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center px-3 h-8 ml-0 leading-tight bg-white border border-gray-300 rounded-l-lg ${
                        currentPage === 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      Anterior
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handlePageChange(index + 1)}
                        className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                          currentPage === index + 1
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 border-blue-300'
                            : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                        }`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center px-3 h-8 leading-tight bg-white border border-gray-300 rounded-r-lg ${
                        currentPage === totalPages 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      Siguiente
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal para crear/editar catálogo */}
      <AnimatedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? "Editar Catálogo" : "Crear Catálogo"}
      >
        <CatalogModal 
          onSave={handleCreateCatalog} 
          onCancel={() => setShowModal(false)} 
          isEditing={isEditing}
          initialName={selectedCatalog?.name || ''}
          initialCatalogId={selectedCatalog?.id}
          initialProductIds={selectedCatalog?.products?.map(p => p.id) || []}
          initialProductsData={selectedCatalog?.products?.map(p => ({
            id: p.id,
            catalog_price: p.catalog_price ? parseFloat(p.catalog_price) : null,
            catalog_name: p.catalog_name,
            catalog_description: p.catalog_description,
            catalog_short_description: p.catalog_short_description,
            catalog_sku: p.catalog_sku,
            catalog_image: p.catalog_image,
            catalog_images: p.catalog_images
          })) || []}
        />
      </AnimatedModal>
    </div>
  );
};

export default CatalogPage;
