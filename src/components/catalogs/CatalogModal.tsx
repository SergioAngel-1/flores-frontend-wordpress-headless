import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Product } from '../../types/woocommerce';
import { CatalogProductInput, CreateCustomProductData } from '../../types/catalog';
import productService from '../../services/productService';
import catalogService from '../../services/catalogService';
import alertService from '../../services/alertService';
import { formatCurrency } from '../../utils/formatters';
import ProductEditModal from './ProductEditModal';
import CustomProductModal from './CustomProductModal';
import logger from '../../utils/logger';

interface CatalogModalProps {
  initialName?: string;
  initialProductIds?: number[];
  initialProductsData?: CatalogProductInput[];
  initialCatalogId?: number;
  isEditing?: boolean;
  onSave: (name: string, productsData: CatalogProductInput[]) => void;
  onCancel: () => void;
}

const CatalogModal: React.FC<CatalogModalProps> = ({
  initialName = '',
  initialProductIds = [],
  initialProductsData = [],
  initialCatalogId,
  isEditing = false,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(initialName);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(initialProductIds);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isCustomProductModalOpen, setIsCustomProductModalOpen] = useState(false);

  // Guardar el ID del catálogo en un ref para asegurar que esté disponible en todo momento
  // Si estamos editando y no hay ID, usar un valor por defecto para depuración
  const catalogIdRef = useRef<number>(initialCatalogId || 0);
  
  // Actualizar el ref cuando cambie initialCatalogId
  useEffect(() => {
    // Log para depuración
    logger.info('CatalogModal', `useEffect para actualizar catalogIdRef - isEditing: ${isEditing}, initialCatalogId: ${initialCatalogId}, prevValue: ${catalogIdRef.current}`);
    
    // Actualizar solo si initialCatalogId es un valor válido
    if (initialCatalogId !== undefined && initialCatalogId !== null) {
      catalogIdRef.current = initialCatalogId;
      logger.info('CatalogModal', `ID del catálogo actualizado en ref: ${initialCatalogId}`);
    }
  }, [initialCatalogId, isEditing]);
  
  // Para debugging - verificar el ID del catálogo al inicio
  useEffect(() => {
    logger.info('CatalogModal', `Inicialización - isEditing: ${isEditing}, initialCatalogId: ${initialCatalogId}, catalogIdRef.current: ${catalogIdRef.current}`);
  }, []);
  
  // Para debugging
  useEffect(() => {
    if (initialCatalogId) {
      logger.info('CatalogModal', `Utilizando catálogo existente con ID: ${initialCatalogId}`);
    } else {
      logger.info('CatalogModal', 'Creando nuevo catálogo');
    }
  }, [initialCatalogId]);

  // Cargar productos seleccionados inicialmente
  useEffect(() => {
    const loadSelectedProducts = async () => {
      if (initialProductIds.length === 0 || initialLoadRef.current) return;
      
      try {
        setLoading(true);
        
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
                if (productId <= 0) {
                  // Es un producto personalizado sin datos suficientes
                  return {
                    id: catalogProduct.id,
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
                console.error(`Error al cargar el producto ${catalogProduct.product_id}:`, error);
                
                // Si hay error al cargar el producto, usar los datos del catálogo
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
            if (id <= 0) {
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
                // Producto personalizado sin datos
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
                const response = await productService.getById(id);
                return response.data;
              } catch (error) {
                console.error(`Error al cargar el producto ${id}:`, error);
                // Devolver un objeto básico para evitar errores
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
        
        initialLoadRef.current = true;
      } catch (error) {
        console.error('Error al cargar productos seleccionados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSelectedProducts();
  }, [initialProductIds, initialProductsData]);
  
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
      
      // Verificar si hay productos personalizados no guardados en la lista de productos seleccionados
      const unsavedCustomProducts = selectedProducts.filter(product => 
        (product as any)._unsavedCustomProduct && 
        (product as any).is_custom
      );
      
      console.log(`Encontrados ${unsavedCustomProducts.length} productos personalizados no guardados`);
      
      // Si hay productos personalizados no guardados, guardarlos primero
      if (unsavedCustomProducts.length > 0) {
        console.log('Guardando productos personalizados no guardados antes de guardar el catálogo');
        
        // Crear un array para almacenar los productos guardados que reemplazarán a los no guardados
        const savedProducts: any[] = [];
        
        // Guardar cada producto personalizado no guardado
        for (const unsavedProduct of unsavedCustomProducts) {
          try {
            const customProductData = (unsavedProduct as any)._unsavedCustomProduct;
            
            // Si estamos editando un catálogo existente, asociar el producto al catálogo
            if (isEditing && catalogIdRef.current) {
              customProductData.catalog_id = catalogIdRef.current;
            }
            
            console.log('Guardando producto personalizado:', customProductData);
            
            // Crear el producto personalizado en la base de datos
            const savedProduct = await catalogService.createCustomProduct(customProductData);
            
            if (savedProduct && savedProduct.id) {
              console.log('Producto personalizado guardado exitosamente:', savedProduct);
              
              // Añadir el producto guardado al array de productos guardados
              savedProducts.push({
                ...savedProduct,
                name: savedProduct.catalog_name || savedProduct.name || 'Producto personalizado',
                price: savedProduct.catalog_price?.toString() || '0',
                is_custom: true
              });
            } else {
              throw new Error('No se pudo guardar el producto personalizado');
            }
          } catch (error) {
            console.error('Error al guardar producto personalizado:', error);
            alertService.error('Error al guardar producto personalizado. Por favor, intente nuevamente.');
            setLoading(false);
            return;
          }
        }
        
        // Reemplazar los productos no guardados con los guardados en la lista de productos seleccionados
        const updatedProducts = selectedProducts.map(product => {
          // Si es un producto personalizado no guardado, buscar su versión guardada
          if ((product as any)._unsavedCustomProduct && (product as any).is_custom) {
            // Buscar el producto guardado que corresponde a este producto no guardado
            // (Comparamos por nombre ya que es la única forma de relacionarlos)
            const savedProduct = savedProducts.find(sp => 
              sp.name === product.name || 
              sp.catalog_name === product.name
            );
            
            if (savedProduct) {
              return savedProduct;
            }
          }
          
          // Si no es un producto personalizado no guardado o no se encontró su versión guardada, mantenerlo
          return product;
        });
        
        // Actualizar la lista de productos seleccionados y sus IDs
        setSelectedProducts(updatedProducts);
        setSelectedProductIds(updatedProducts.map(p => p.id));
      }
      
      // Preparar los datos de los productos seleccionados
      const productsData: CatalogProductInput[] = selectedProducts.map(product => {
        // Crear un objeto base con el ID del producto
        const productData: CatalogProductInput = {
          id: product.id
        };
        
        // Si es un producto personalizado no guardado, marcarlo
        if ((product as any)._unsavedCustomProduct) {
          productData.is_custom = true;
          productData.unsaved_data = (product as any)._unsavedCustomProduct;
        }
        
        // Manejar el precio específico del catálogo
        const catalogPrice = (product as any).catalog_price;
        if (catalogPrice !== undefined && catalogPrice !== null) {
          productData.catalog_price = typeof catalogPrice === 'string' 
            ? parseFloat(catalogPrice) 
            : catalogPrice;
        }
        
        // Manejar los datos de productos personalizados
        const isCustom = (product as any).is_custom;
        const catalogName = (product as any).catalog_name;
        
        if (isCustom || catalogName) {
          // Nombre del producto en el catálogo
          if (catalogName) {
            productData.catalog_name = catalogName;
          } else if (product.name) {
            productData.catalog_name = product.name;
          }
          
          // SKU del producto en el catálogo
          const catalogSku = (product as any).catalog_sku;
          if (catalogSku !== undefined) {
            productData.catalog_sku = catalogSku;
          }
          
          // Descripción del producto en el catálogo
          const catalogDesc = (product as any).catalog_description;
          if (catalogDesc !== undefined) {
            productData.catalog_description = catalogDesc;
          }
          
          // Descripción corta del producto en el catálogo
          const catalogShortDesc = (product as any).catalog_short_description;
          if (catalogShortDesc !== undefined) {
            productData.catalog_short_description = catalogShortDesc;
          }
          
          // Imagen principal del producto en el catálogo
          const catalogImage = (product as any).catalog_image;
          if (catalogImage !== undefined) {
            productData.catalog_image = catalogImage;
          }
          
          // Imágenes adicionales del producto en el catálogo
          const catalogImages = (product as any).catalog_images;
          if (catalogImages !== undefined && Array.isArray(catalogImages)) {
            productData.catalog_images = catalogImages;
          }
        }
        
        return productData;
      });
      
      console.log(`Guardando catálogo ${isEditing ? 'editado' : 'nuevo'} con ${productsData.length} productos`);
      
      // Llama a la función onSave proporcionada por el componente padre
      await onSave(name, productsData);
      
      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);
      console.error('Error al guardar el catálogo:', error);
      alertService.error('Error al guardar el catálogo. Por favor, intente nuevamente.');
    }
  }, [name, selectedProductIds, selectedProducts, onSave, isEditing, catalogIdRef]);
  
  const getProductImage = useCallback((product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].src;
    }
    // Usar un ícono SVG local en lugar de un servicio externo
    return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
  }, []);
  
  // Filtrar productos que ya están seleccionados
  const filteredProducts = useMemo(() => {
    return products.filter(product => !selectedProductIds.includes(product.id));
  }, [products, selectedProductIds]);

  const handleEditProduct = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsProductEditModalOpen(true);
  }, []);

  const handleAddCustomProduct = useCallback(() => {
    // Mostrar el ID del catálogo para depuración
    logger.info('CatalogModal', `Estado actual - isEditing: ${isEditing}, catalogIdRef.current: ${catalogIdRef.current}`);
    
    // Verificar que catalogIdRef.current sea un número válido
    if (isEditing && catalogIdRef.current && catalogIdRef.current > 0) {
      logger.info('CatalogModal', `Abriendo modal de producto personalizado para catálogo ID: ${catalogIdRef.current}`);
    } else {
      logger.info('CatalogModal', 'Abriendo modal de producto personalizado para nuevo catálogo (sin ID)');
    }
    
    setIsCustomProductModalOpen(true);
  }, [isEditing, catalogIdRef]);

  const handleCreateCustomProduct = useCallback(async (customProductData: CreateCustomProductData): Promise<void> => {
    try {
      // Si estamos editando un catálogo existente, crear directamente el producto personalizado
      if (isEditing && catalogIdRef.current && catalogIdRef.current > 0) {
        logger.info('CatalogModal', `Creando producto personalizado para catálogo existente ID: ${catalogIdRef.current}`);
        
        // Asegurarnos de que el ID del catálogo sea el correcto
        const productDataToSave = {
          ...customProductData,
          catalog_id: catalogIdRef.current
        };
        
        logger.info('CatalogModal', 'Datos del producto personalizado a guardar:', productDataToSave);
        
        // Crear el producto personalizado
        const newProduct = await catalogService.createCustomProduct(productDataToSave);
        
        // Verificar si el producto se creó correctamente
        if (newProduct && newProduct.id) {
          logger.info('CatalogModal', 'Producto personalizado creado exitosamente:', newProduct);
          
          // Verificar que el catalog_id se haya guardado correctamente
          if (newProduct.catalog_id !== catalogIdRef.current) {
            logger.warn('CatalogModal', `Advertencia: El producto se creó con catalog_id=${newProduct.catalog_id}, pero se esperaba catalog_id=${catalogIdRef.current}`);
          }
          
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
        logger.info('CatalogModal', 'Creando producto personalizado para nuevo catálogo');
        
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
        
        logger.info('CatalogModal', 'Producto personalizado temporal creado:', displayProduct);
        
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
                      <img src={getProductImage(product)} alt={product.name} className="w-10 h-10 mr-2 object-cover rounded" />
                      <div>
                        <span className="block font-medium text-sm">{product.name}</span>
                        <span className="block text-xs text-gray-500">Precio regular: {formatCurrency(product.price)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-500 hover:text-blue-700 p-1 mr-2"
                          title="Editar producto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => toggleProductSelection(product)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar producto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primario"></div>
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
                        <img src={getProductImage(product)} alt={product.name} className="w-10 h-10 object-cover rounded" />
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
      {isProductEditModalOpen && productToEdit && (
        <ProductEditModal
          isOpen={isProductEditModalOpen}
          product={productToEdit as any}
          onClose={() => setIsProductEditModalOpen(false)}
          key={`product-edit-modal-${productToEdit.id}-${Date.now()}`}
          onSave={async (productId, updatedData) => {
            // Actualizar el producto en la lista de productos seleccionados
            const updatedProducts = selectedProducts.map(p => {
              if (p.id === productId) {
                return {
                  ...p,
                  catalog_name: updatedData.catalog_name || p.name,
                  catalog_sku: updatedData.catalog_sku,
                  catalog_description: updatedData.catalog_description,
                  catalog_short_description: updatedData.catalog_short_description,
                  catalog_image: updatedData.catalog_image,
                  catalog_images: updatedData.catalog_images
                };
              }
              return p;
            });
            
            setSelectedProducts(updatedProducts);
            setIsProductEditModalOpen(false);
            
            // No es necesario hacer una llamada a la API aquí, ya que los cambios
            // se guardarán cuando se guarde el catálogo completo
          }}
        />
      )}
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
