import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Product } from '../../types/woocommerce';
import { CatalogProductInput, CreateCustomProductData } from '../../types/catalog';
import productService from '../../services/productService';
import catalogService from '../../services/catalogService';
import alertService from '../../services/alertService';
import { formatCurrency, getValidImageUrl } from '../../utils/formatters';
import CustomProductModal from './CustomProductModal';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CatalogModalProps {
  initialName?: string;
  initialProductIds?: number[];
  initialProductsData?: CatalogProductInput[];
  initialCatalogId?: number;
  initialLogoUrl?: string;
  isEditing?: boolean;
  onSave: (name: string, productsData: CatalogProductInput[], logoUrl?: string) => void;
  onCancel: () => void;
}

const CatalogModal: React.FC<CatalogModalProps> = ({
  initialName = '',
  initialProductIds = [],
  initialProductsData = [],
  initialCatalogId,
  initialLogoUrl = '',
  isEditing = false,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(initialName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(initialProductIds || []);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);
  const [isCustomProductModalOpen, setIsCustomProductModalOpen] = useState(false);

  // Guardar el ID del catálogo en un ref para asegurar que esté disponible en todo momento
  const catalogIdRef = useRef<number | undefined>(initialCatalogId);

  // Actualizar el ref cuando cambie initialCatalogId
  useEffect(() => {
    // Actualizar solo si initialCatalogId es un valor válido
    if (initialCatalogId !== undefined && initialCatalogId !== null) {
      catalogIdRef.current = initialCatalogId;
    }
  }, [initialCatalogId]);

  // Cargar productos seleccionados
  const loadSelectedProducts = useCallback(async () => {
    if (initialCatalogId && initialProductIds.length > 0) {
      try {
        // Si estamos editando un catálogo existente, obtener los productos directamente de la tabla de catálogos
        if (isEditing && initialCatalogId) {
          const catalogProductsResponse = await catalogService.getCompleteProducts(initialCatalogId);
          if (catalogProductsResponse && Array.isArray(catalogProductsResponse)) {
            setSelectedProducts(catalogProductsResponse);
            setSelectedProductIds(catalogProductsResponse.map(p => p.id));
            return;
          }
        }
        
        // Si no estamos editando o no se pudieron obtener los productos del catálogo,
        // usar el método anterior como fallback
        
        // Si ya tenemos los datos iniciales de los productos, usarlos directamente
        if (initialProductsData && initialProductsData.length > 0 && 
            initialProductsData.length === initialProductIds.length) {
          // Obtener los productos completos usando los IDs
          const productsPromises = initialProductsData.map(async (catalogProduct) => {
            // Si es un producto personalizado (product_id = 0 o undefined/null y catalog_name existe), 
            // no intentar obtenerlo de WooCommerce
            if ((catalogProduct.product_id === 0 || catalogProduct.product_id === undefined || catalogProduct.product_id === null) && 
                catalogProduct.catalog_name) {
              // Devolver un producto personalizado construido a partir de los datos del catálogo
              return {
                id: catalogProduct.id,
                name: catalogProduct.catalog_name || 'Producto personalizado',
                price: catalogProduct.catalog_price?.toString() || '0',
                description: catalogProduct.catalog_description || '',
                short_description: catalogProduct.catalog_short_description || '',
                sku: catalogProduct.catalog_sku || '',
                images: catalogProduct.catalog_images ? 
                  catalogProduct.catalog_images.map(img => ({ src: img })) : [],
                // Propiedades necesarias para el componente
                catalog_price: catalogProduct.catalog_price,
                catalog_name: catalogProduct.catalog_name,
                catalog_description: catalogProduct.catalog_description,
                catalog_short_description: catalogProduct.catalog_short_description,
                catalog_sku: catalogProduct.catalog_sku,
                catalog_image: catalogProduct.catalog_image,
                catalog_images: catalogProduct.catalog_images,
                is_custom: true
              };
            } else {
              // Para productos normales, obtenerlos de WooCommerce
              try {
                // Asegurarnos de que no intentamos obtener productos con ID <= 0
                const productId = catalogProduct.product_id || catalogProduct.id;
                if (productId <= 0 || !productId) {
                  // Es un producto personalizado sin datos suficientes
                  return {
                    id: catalogProduct.id || 0,
                    name: catalogProduct.catalog_name || 'Producto personalizado',
                    price: catalogProduct.catalog_price?.toString() || '0',
                    description: catalogProduct.catalog_description || '',
                    short_description: catalogProduct.catalog_short_description || '',
                    sku: catalogProduct.catalog_sku || '',
                    images: catalogProduct.catalog_images ? 
                      catalogProduct.catalog_images.map(img => ({ src: img })) : [],
                    catalog_price: catalogProduct.catalog_price,
                    catalog_name: catalogProduct.catalog_name,
                    catalog_description: catalogProduct.catalog_description,
                    catalog_short_description: catalogProduct.catalog_short_description,
                    catalog_sku: catalogProduct.catalog_sku,
                    catalog_image: catalogProduct.catalog_image,
                    catalog_images: catalogProduct.catalog_images,
                    is_custom: true
                  };
                }
                
                // Verificar si el producto ya está en caché para evitar solicitudes innecesarias
                try {
                  const response = await productService.getById(productId);
                  const product = response.data;
                  
                  // Combinar con datos del catálogo
                  return {
                    ...product,
                    catalog_price: catalogProduct.catalog_price,
                    catalog_name: catalogProduct.catalog_name,
                    catalog_description: catalogProduct.catalog_description,
                    catalog_short_description: catalogProduct.catalog_short_description,
                    catalog_sku: catalogProduct.catalog_sku,
                    catalog_image: catalogProduct.catalog_image,
                    catalog_images: catalogProduct.catalog_images
                  };
                } catch (error) {
                  console.error(`Error al cargar el producto ${productId}:`, error);
                  
                  // Si hay error al cargar el producto, tratarlo como producto personalizado
                  return {
                    id: catalogProduct.id || 0,
                    name: catalogProduct.catalog_name || `Producto personalizado`,
                    price: catalogProduct.catalog_price?.toString() || '0',
                    description: catalogProduct.catalog_description || '',
                    short_description: catalogProduct.catalog_short_description || '',
                    sku: catalogProduct.catalog_sku || '',
                    images: [],
                    catalog_price: catalogProduct.catalog_price,
                    catalog_name: catalogProduct.catalog_name,
                    catalog_description: catalogProduct.catalog_description,
                    catalog_short_description: catalogProduct.catalog_short_description,
                    catalog_sku: catalogProduct.catalog_sku,
                    catalog_image: catalogProduct.catalog_image,
                    catalog_images: catalogProduct.catalog_images,
                    is_custom: true
                  };
                }
              } catch (error) {
                console.error('Error al cargar productos:', error);
                
                // Si hay error al cargar los productos, usar los datos del catálogo
                return {
                  id: catalogProduct.id,
                  name: catalogProduct.catalog_name || `Producto ${catalogProduct.product_id || catalogProduct.id}`,
                  price: catalogProduct.catalog_price?.toString() || '0',
                  description: catalogProduct.catalog_description || '',
                  short_description: catalogProduct.catalog_short_description || '',
                  sku: catalogProduct.catalog_sku || '',
                  images: [],
                  catalog_price: catalogProduct.catalog_price,
                  catalog_name: catalogProduct.catalog_name,
                  catalog_description: catalogProduct.catalog_description,
                  catalog_short_description: catalogProduct.catalog_short_description,
                  catalog_sku: catalogProduct.catalog_sku,
                  catalog_image: catalogProduct.catalog_image,
                  catalog_images: catalogProduct.catalog_images,
                  is_custom: true
                };
              }
            }
          });
          
          const products = await Promise.all(productsPromises);
          
          // Asegurarse de que no hay duplicados
          const uniqueProducts = products;
          const uniqueIds = [...new Set(initialProductIds)];
          
          setSelectedProducts(uniqueProducts as Product[]);
          setSelectedProductIds(uniqueIds);
        } else {
          // Si no tenemos datos iniciales, intentar cargar productos desde WooCommerce
          // Pero verificar primero si hay IDs especiales (para productos personalizados)
          const productsPromises = initialProductIds.map(async (id) => {
            // Si el ID es 0 o negativo, es un producto personalizado
            if (id <= 0 || !id) {
              // Buscar si hay datos adicionales en initialProductsData
              const catalogData = initialProductsData?.find(p => p.id === id);
              
              if (catalogData) {
                return {
                  id: catalogData.id,
                  name: catalogData.catalog_name || 'Producto personalizado',
                  price: catalogData.catalog_price?.toString() || '0',
                  description: catalogData.catalog_description || '',
                  short_description: catalogData.catalog_short_description || '',
                  sku: catalogData.catalog_sku || '',
                  images: catalogData.catalog_images ? 
                    catalogData.catalog_images.map(img => ({ src: img })) : [],
                  catalog_price: catalogData.catalog_price,
                  catalog_name: catalogData.catalog_name,
                  catalog_description: catalogData.catalog_description,
                  catalog_short_description: catalogData.catalog_short_description,
                  catalog_sku: catalogData.catalog_sku,
                  catalog_image: catalogData.catalog_image,
                  catalog_images: catalogData.catalog_images,
                  is_custom: true
                };
              } else {
                // Si no hay datos adicionales, crear un producto personalizado básico
                return {
                  id,
                  name: 'Producto personalizado',
                  price: '0',
                  images: [],
                  is_custom: true
                };
              }
            } else {
              // Para productos normales, obtenerlos de WooCommerce
              try {
                // Verificar si el producto ya está en caché para evitar solicitudes innecesarias
                try {
                  const response = await productService.getById(id);
                  return response.data;
                } catch (error) {
                  console.error(`Error al cargar el producto ${id}:`, error);
                  
                  // Si hay error al cargar el producto, tratarlo como producto personalizado
                  return {
                    id,
                    name: `Producto personalizado`,
                    price: '0',
                    images: [],
                    is_custom: true
                  };
                }
              } catch (error) {
                console.error('Error al cargar productos:', error);
                
                // Si hay error al cargar los productos, usar los datos del catálogo
                return {
                  id,
                  name: `Producto ${id}`,
                  price: '0',
                  images: [],
                  is_custom: true
                };
              }
            }
          });
          
          const products = await Promise.all(productsPromises);
          
          // Asegurarse de que no hay duplicados
          const uniqueProducts = products;
          const uniqueIds = [...new Set(initialProductIds)];
          
          setSelectedProducts(uniqueProducts as Product[]);
          setSelectedProductIds(uniqueIds);
        }
      } catch (error) {
        console.error('Error al cargar productos seleccionados:', error);
        alertService.error('Error al cargar productos seleccionados');
      }
    }
  }, [initialCatalogId, initialProductIds, initialProductsData, isEditing]);

  // Cargar productos seleccionados inicialmente
  useEffect(() => {
    const loadInitialProducts = async () => {
      if (initialProductIds.length === 0 || initialLoadRef.current) return;
      
      try {
        setLoading(true);
        
        await loadSelectedProducts();
        
        initialLoadRef.current = true;
      } catch (error) {
        console.error('Error al cargar productos seleccionados:', error);
        alertService.error('Error al cargar productos seleccionados');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialProducts();
  }, [initialProductIds, initialProductsData, loadSelectedProducts]);

  // Buscar productos
  useEffect(() => {
    const searchProducts = async () => {
      try {
        setLoading(true);
        let response;
        
        if (searchTerm.trim().length < 2) {
          // Cargar los primeros 10 productos si no hay término de búsqueda
          response = await productService.getAll({ per_page: 10 });
        } else {
          // Buscar productos según el término
          response = await productService.search(searchTerm);
        }
        
        setProducts(response.data);
      } catch (error) {
        console.error('Error al buscar productos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(searchProducts, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  const toggleProductSelection = useCallback((product: Product) => {
    // Verificar si el producto ya está seleccionado por su ID
    const isSelected = selectedProductIds.includes(product.id);
    
    if (isSelected) {
      // Eliminar el producto
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
      setSelectedProductIds(prev => prev.filter(id => id !== product.id));
    } else {
      // Verificar que el producto no esté ya en la lista antes de agregarlo
      if (!selectedProductIds.includes(product.id)) {
        // Agregar el producto
        setSelectedProducts(prev => [...prev, product]);
        setSelectedProductIds(prev => [...prev, product.id]);
      }
    }
  }, [selectedProductIds]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alertService.error('Por favor, ingresa un nombre para el catálogo.');
      return;
    }
    
    // Validar que haya al menos un producto seleccionado
    if (selectedProductIds.length === 0) {
      alertService.error('Por favor, selecciona al menos un producto para el catálogo.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar los datos de los productos
      const productsData = selectedProducts.map(product => {
        // Buscar si hay datos personalizados para este producto
        const existingData = initialProductsData?.find(p => p.id === product.id || p.product_id === product.id);
        
        // Crear un objeto con los datos del producto
        const productData: CatalogProductInput = {
          id: product.id,
          product_id: product.id,
          catalog_price: existingData?.catalog_price !== undefined ? existingData.catalog_price : null,
          product_price: product.price ? parseFloat(product.price) : null,
          catalog_name: existingData?.catalog_name || product.name,
          catalog_description: existingData?.catalog_description || product.description,
          catalog_short_description: existingData?.catalog_short_description || product.short_description,
          catalog_sku: existingData?.catalog_sku || product.sku,
          catalog_image: existingData?.catalog_image || (product.images && product.images.length > 0 ? product.images[0].src : undefined),
          catalog_images: existingData?.catalog_images || (product.images ? product.images.map(img => img.src) : [])
        };
        
        // Si es un producto personalizado, marcar como tal
        if ((product as any).is_custom) {
          productData.is_custom = true;
        }
        
        return productData;
      });
      
      // Llamar a la función onSave con el nombre del catálogo y los datos de los productos
      await onSave(name, productsData, logoUrl);
      
      // Cerrar el modal si todo fue exitoso
      onCancel();
    } catch (error) {
      console.error('Error al guardar el catálogo:', error);
      alertService.error('Error al guardar el catálogo. Por favor, intente nuevamente.');
    }
  }, [name, selectedProductIds, selectedProducts, onSave, isEditing, catalogIdRef, initialProductsData, logoUrl]);

  const getProductImage = useCallback((product: Product) => {
    // Usamos una aserción de tipos para manejar las propiedades extendidas de Product
    const extendedProduct = product as Product & { 
      catalog_images?: string[]; 
      catalog_image?: string | null;
    };
    
    // Comprobar si el producto tiene imágenes específicas del catálogo
    if (extendedProduct.catalog_images && extendedProduct.catalog_images.length > 0) {
      return getValidImageUrl(extendedProduct.catalog_images[0]);
    }
    
    // Si no hay imágenes específicas del catálogo, usar imágenes estándar del producto
    if (product.images && product.images.length > 0) {
      return getValidImageUrl(product.images[0].src);
    }
    
    // Si el producto tiene una imagen de catálogo específica
    if (extendedProduct.catalog_image) {
      return getValidImageUrl(extendedProduct.catalog_image);
    }
    
    // Usar un ícono SVG local si no hay imágenes disponibles
    return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
  }, []);

  const handleAddCustomProduct = useCallback(() => {
    setIsCustomProductModalOpen(true);
  }, []);

  const handleCreateCustomProduct = useCallback(async (customProductData: CreateCustomProductData): Promise<void> => {
    try {
      // Si estamos editando un catálogo existente, crear directamente el producto personalizado
      if (isEditing && catalogIdRef.current && catalogIdRef.current > 0) {
        // Asegurarnos de que el ID del catálogo sea el correcto
        const productDataToSave = {
          ...customProductData,
          catalog_id: catalogIdRef.current,
          is_custom: true // Asegurar que se marque como producto personalizado
        };
        
        // Crear el producto personalizado
        const newProduct = await catalogService.createCustomProduct(productDataToSave);
        
        // Verificar si el producto se creó correctamente
        if (newProduct && newProduct.id) {
          // Agregar el producto personalizado a la lista de productos seleccionados
          setSelectedProducts(prev => [...prev, {
            ...newProduct,
            name: newProduct.catalog_name || newProduct.name || 'Producto personalizado',
            price: newProduct.catalog_price?.toString() || '0',
            is_custom: true
          }]);
          setSelectedProductIds(prev => [...prev, newProduct.id]);
          
          // Cerrar el modal de producto personalizado
          setIsCustomProductModalOpen(false);
        } else {
          throw new Error('No se pudo crear el producto personalizado');
        }
      } else {
        // Si estamos creando un nuevo catálogo, simplemente añadir el producto a la lista temporal
        // Crear un objeto simple para mostrar en la interfaz
        const displayProduct = {
          id: Date.now(), // Usar timestamp como ID único pero solo para manejo interno
          name: customProductData.name,
          price: customProductData.price.toString(),
          images: customProductData.images ? customProductData.images.map(img => ({ src: img })) : [],
          catalog_price: customProductData.price,
          catalog_name: customProductData.name,
          catalog_description: customProductData.description,
          catalog_short_description: customProductData.short_description,
          catalog_sku: customProductData.sku,
          catalog_image: customProductData.image,
          catalog_images: customProductData.images,
          is_custom: true,
          _unsavedCustomProduct: customProductData // Guardar datos originales para enviar al backend
        } as any;
        
        // Agregar el producto a la lista seleccionada
        setSelectedProducts(prev => [...prev, displayProduct]);
        setSelectedProductIds(prev => [...prev, displayProduct.id]);
        
        // Cerrar el modal de producto personalizado
        setIsCustomProductModalOpen(false);
      }
    } catch (error) {
      console.error('Error al crear producto personalizado:', error);
      alertService.error('Error al crear producto personalizado');
    }
  }, [isEditing, catalogIdRef]);

  // Filtrar productos que ya están seleccionados
  const filteredProducts = useMemo(() => {
    return products.filter(product => !selectedProductIds.includes(product.id));
  }, [products, selectedProductIds]);

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">{isEditing ? 'Editar catálogo' : 'Crear catálogo'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="catalog-name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del catálogo
          </label>
          <div className="relative">
            <input
              type="text"
              id="catalog-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primario focus:border-primario"
              placeholder="Ingresa un nombre para el catálogo"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="catalog-logo" className="block text-sm font-medium text-gray-700 mb-2">
            Logo del catálogo
          </label>
          <div className="relative">
            <input
              type="text"
              id="catalog-logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primario focus:border-primario"
              placeholder="Ingresa la URL del logo del catálogo"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar productos
          </label>

          {/* Buscador de productos */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="search"
              className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primario focus:border-primario"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Contador de seleccionados */}
          <div className="mb-2 text-sm text-gray-500">
            {selectedProductIds.length} productos seleccionados
          </div>

          {/* Lista de productos seleccionados */}
          {selectedProducts.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Productos seleccionados:</h4>
              <div className="max-h-60 overflow-y-auto">
                {selectedProducts.map(product => (
                  <div key={`selected-${product.id}`} className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                    <div className="flex items-center flex-1 mr-4">
                      <img 
                        src={getProductImage(product) || undefined} 
                        alt={product.name} 
                        className="w-10 h-10 mr-2 object-cover rounded" 
                      />
                      <div>
                        <span className="block font-medium text-sm">{product.name}</span>
                        <span className="block text-xs text-gray-500">Precio original: {formatCurrency((product as any).product_price || product.price)}</span>
                        <span className="block text-xs text-gray-500">Precio del catálogo: {formatCurrency((product as any).catalog_price)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar producto"
                          onClick={() => toggleProductSelection(product)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de productos para seleccionar */}
          <div className="mt-1 border border-gray-300 rounded-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleProductSelection(product)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => {}} // Manejado por el onClick del div padre
                        className="h-4 w-4 text-primario focus:ring-primario border-gray-300 rounded"
                      />
                      <div className="ml-3 flex items-center flex-1 mr-4">
                        <img src={getProductImage(product) || undefined} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">Precio regular: {formatCurrency(product.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : searchTerm.trim().length >= 2 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron productos con ese término.</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Cargando productos...</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Todos los productos ya están seleccionados.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleAddCustomProduct}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
            >
              Crear producto personalizado
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(new Event('submit') as any)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-primario-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
          >
            {isEditing ? 'Guardar cambios' : 'Crear catálogo'}
          </button>
        </div>
      </form>
      {isCustomProductModalOpen && (
        <CustomProductModal 
          isOpen={isCustomProductModalOpen}
          onClose={() => setIsCustomProductModalOpen(false)}
          onSave={handleCreateCustomProduct}
          catalogId={catalogIdRef.current}
          key={`custom-product-modal-${Date.now()}`}
        />
      )}
    </div>
  );
};

export default React.memo(CatalogModal);
