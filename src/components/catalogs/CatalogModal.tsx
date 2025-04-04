import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../../types/woocommerce';
import { CatalogProductInput, CreateCustomProductData, CustomProduct } from '../../types/catalog';
import productService from '../../services/productService';
import catalogService from '../../services/catalogService';
import alertService from '../../services/alertService';
import { formatCurrency } from '../../utils/formatters';
import CustomProductModal from './CustomProductModal';
import logger from '../../utils/logger';

// Componentes reutilizables
// CatalogHeader se ha eliminado ya que no se utiliza
import ProductSelector from './components/ui/ProductSelector';
import SelectedProductsList from './components/ui/SelectedProductsList';
import FormInput from './components/ui/form/FormInput';
import FormActions from './components/ui/form/FormActions';
import FormImageInput from './components/ui/form/FormImageInput';

// Utilidades para normalización de productos
import { 
  normalizePrice, 
  getProductMainImage, 
  normalizeImageUrls, 
  getValidProductImage 
} from './utils/productUtils';

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
  const initialLoadRef = useRef(false);
  const [isCustomProductModalOpen, setIsCustomProductModalOpen] = useState(false);
  const [currentEditingProduct, setCurrentEditingProduct] = useState<Product | null>(null);

  const catalogIdRef = useRef<number>(initialCatalogId || 0);

  useEffect(() => {
    if (initialCatalogId) {
      catalogIdRef.current = initialCatalogId;
    }
  }, [initialCatalogId]);

  const loadSelectedProducts = useCallback(async () => {
    if (initialProductIds.length > 0) {
      try {
        if (isEditing && initialCatalogId) {
          const catalogProductsResponse = await catalogService.getCompleteProducts(initialCatalogId);
          if (catalogProductsResponse && Array.isArray(catalogProductsResponse)) {
            setSelectedProducts(catalogProductsResponse);
            return;
          }
        }

        if (initialProductsData && initialProductsData.length > 0 && 
            initialProductsData.length === initialProductIds.length) {
          const productsPromises = initialProductsData.map(async (catalogProduct) => {
            if ((catalogProduct.product_id === 0 || catalogProduct.product_id === undefined || catalogProduct.product_id === null) && 
                catalogProduct.catalog_name) {
              return {
                id: catalogProduct.id || catalogProduct.product_id || 0,
                name: catalogProduct.catalog_name || 'Producto personalizado',
                price: normalizePrice(catalogProduct.catalog_price?.toString() || '0'),
                description: catalogProduct.catalog_description || '',
                short_description: catalogProduct.catalog_short_description || '',
                sku: catalogProduct.catalog_sku || '',
                catalog_price: normalizePrice(catalogProduct.catalog_price?.toString() || '0'),
                product_price: normalizePrice(catalogProduct.product_price?.toString() || '0'),
                catalog_image: getValidProductImage(catalogProduct.catalog_image),
                catalog_images: normalizeImageUrls(catalogProduct.catalog_images || []),
                is_custom: true
              };
            } else {
              try {
                const productId = catalogProduct.product_id || catalogProduct.id;
                if (!productId || productId <= 0) {
                  console.error('ID de producto inválido:', productId);
                  return null;
                }
                
                const response = await productService.getById(productId);
                const product = response.data;
                
                if (product) {
                  return {
                    ...product,
                    catalog_price: normalizePrice(catalogProduct.catalog_price?.toString() || product.price),
                    product_price: normalizePrice(catalogProduct.product_price?.toString() || product.price),
                    catalog_name: catalogProduct.catalog_name || product.name,
                    catalog_description: catalogProduct.catalog_description || product.description,
                    catalog_short_description: catalogProduct.catalog_short_description || product.short_description,
                    catalog_sku: catalogProduct.catalog_sku || product.sku,
                    catalog_image: getValidProductImage(catalogProduct.catalog_image) || getProductMainImage(product),
                    catalog_images: normalizeImageUrls(catalogProduct.catalog_images || [])
                  };
                }
                
                return null;
              } catch (error) {
                console.error('Error al cargar productos:', error);
                
                return {
                  id: catalogProduct.product_id || 0,
                  name: catalogProduct.catalog_name || 'Producto no disponible',
                  price: normalizePrice(catalogProduct.catalog_price?.toString() || '0'),
                  description: catalogProduct.catalog_description || '',
                  short_description: catalogProduct.catalog_short_description || '',
                  sku: catalogProduct.catalog_sku || '',
                  catalog_price: normalizePrice(catalogProduct.catalog_price?.toString() || '0'),
                  product_price: normalizePrice(catalogProduct.product_price?.toString() || '0'),
                  catalog_image: getValidProductImage(catalogProduct.catalog_image),
                  catalog_images: normalizeImageUrls(catalogProduct.catalog_images || []),
                  is_unavailable: true
                };
              }
            }
          });
          
          const products = await Promise.all(productsPromises);
          
          const validProducts = products.filter(Boolean) as Product[];
          setSelectedProducts(validProducts);
          
          return;
        } else {
          const productsPromises = initialProductIds.map(async (id) => {
            if (id <= 0) {
              if (initialCatalogId) {
                try {
                  // Obtenemos los productos completos del catálogo y buscamos el personalizado por su ID
                  const catalogProductsResponse = await catalogService.getCompleteProducts(initialCatalogId);
                  const customProduct = catalogProductsResponse.find((product: any) => product.id === Math.abs(id) || product.product_id === Math.abs(id));
                  if (customProduct) {
                    return {
                      ...customProduct,
                      is_custom: true
                    };
                  }
                } catch (customError) {
                  console.error('Error al cargar producto personalizado:', customError);
                }
              }
              
              return null;
            }
            
            try {
              const response = await productService.getById(id);
              return response.data;
            } catch (error) {
              console.error(`Error al cargar producto ${id}:`, error);
              return null;
            }
          });
          
          const products = await Promise.all(productsPromises);
          
          const validProducts = products.filter(Boolean) as Product[];
          setSelectedProducts(validProducts);
        }
      } catch (error) {
        console.error('Error al cargar productos seleccionados:', error);
        alertService.error('Error al cargar productos seleccionados');
      }
    }
  }, [initialCatalogId, initialProductIds, initialProductsData, isEditing]);

  useEffect(() => {
    const loadInitialProducts = async () => {
      if (!initialLoadRef.current && initialProductIds.length > 0) {
        initialLoadRef.current = true;
        
        await loadSelectedProducts();
      }
    };
    
    loadInitialProducts();
  }, [initialProductIds, loadSelectedProducts]);

  const searchProducts = useCallback(async (term: string) => {
    if (!term.trim()) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      const response = await productService.search(term);
      const result = response.data;
      
      const filteredResults = result.filter(product => 
        !selectedProductIds.includes(product.id)
      );
      
      setProducts(filteredResults);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      alertService.error('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  }, [selectedProductIds]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchProducts(value);
  };

  const toggleProductSelection = useCallback((product: Product) => {
    const isSelected = selectedProductIds.includes(product.id);
    
    if (isSelected) {
      setSelectedProducts(prevProducts => 
        prevProducts.filter(p => p.id !== product.id)
      );
      setSelectedProductIds(prevIds => 
        prevIds.filter(id => id !== product.id)
      );
    } else {
      // Convertir el producto al formato esperado por el estado
      const normalizedProduct = {
        ...product,
        price: normalizePrice(product.price),
        // Propiedades adicionales para el catálogo
        catalog_price: normalizePrice(product.price),
        product_price: normalizePrice(product.price),
        // Mantener la estructura original de images como Image[]
        images: (product.images || []).map(img => {
          if (typeof img === 'string') {
            // Si es string, crear un objeto Image
            return {
              id: 0,
              src: img,
              name: '',
              alt: '',
              date_created: '',
              date_modified: ''
            };
          }
          return img; // Si ya es un objeto Image, mantenerlo
        })
      };
      
      setSelectedProducts(prevProducts => [...prevProducts, normalizedProduct]);
      setSelectedProductIds(prevIds => [...prevIds, product.id]);
    }
  }, [selectedProductIds]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alertService.error('Por favor, ingresa un nombre para el catálogo.');
      return;
    }
    
    if (selectedProducts.length === 0) {
      alertService.error('Por favor, selecciona al menos un producto para el catálogo.');
      return;
    }
    
    try {
      setLoading(true);
      
      const productsData = selectedProducts.map(product => {
        const existingData = initialProductsData?.find(
          p => p.product_id === product.id || p.id === product.id
        );
        
        const mainImage = getValidProductImage((product as any).catalog_image) || 
                         getProductMainImage(product);
        
        const additionalImages = normalizeImageUrls((product as any).catalog_images || []);
        
        // Usar los datos existentes como base y sobrescribir con los nuevos datos
        const productData: CatalogProductInput = {
          id: product.id,
          product_id: product.id,
          // Preservar datos existentes o usar los nuevos/predeterminados
          catalog_price: parseFloat(normalizePrice((product as any).catalog_price || existingData?.catalog_price || product.price)),
          product_price: parseFloat(normalizePrice((product as any).product_price || existingData?.product_price || product.price)),
          catalog_name: (product as any).catalog_name || existingData?.catalog_name || product.name,
          catalog_description: (product as any).catalog_description || existingData?.catalog_description || product.description,
          catalog_short_description: (product as any).catalog_short_description || existingData?.catalog_short_description || product.short_description,
          catalog_sku: (product as any).catalog_sku || existingData?.catalog_sku || product.sku,
          catalog_image: mainImage || existingData?.catalog_image || undefined,
          catalog_images: additionalImages.length > 0 ? additionalImages : existingData?.catalog_images || []
        };
        
        if ((product as any).is_custom) {
          productData.is_custom = true;
        }
        
        return productData;
      });
      
      await onSave(name, productsData, getValidProductImage(logoUrl) || undefined);
      
      onCancel();
      alertService.success(`Catálogo ${isEditing ? 'actualizado' : 'creado'} con éxito`);
    } catch (error) {
      console.error('Error al guardar el catálogo:', error);
      alertService.error('Error al guardar el catálogo. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [name, selectedProductIds, selectedProducts, onSave, isEditing, initialProductsData, logoUrl, onCancel]);

  const handleAddCustomProduct = useCallback(() => {
    setIsCustomProductModalOpen(true);
  }, []);

  const handleCustomProductSave = async (productData: CreateCustomProductData) => {
    try {
      setLoading(true);
      
      const normalizedProductData = {
        ...productData,
        price: normalizePrice(productData.price),
        image: getValidProductImage(productData.image) || "",
        images: normalizeImageUrls(productData.images || [])
      };
      
      // Log para depuración
      logger.info('CatalogModal', 'Guardando producto personalizado:', normalizedProductData);
      
      let customProduct: CustomProduct;
      
      // Verificar si es un producto existente (con id) o uno nuevo
      if ((productData as any).id) {
        // Actualizar producto existente
        customProduct = await catalogService.updateCustomProduct((productData as any).id, normalizedProductData);
        
        // Actualizar estado local
        setSelectedProducts(prev => {
          return prev.map(p => {
            if (p.id === customProduct.id) {
              // Convertir CustomProduct a un formato compatible con Product
              return {
                ...p,
                name: customProduct.name,
                price: customProduct.price.toString(),
                description: customProduct.description || '',
                short_description: customProduct.short_description || '',
                sku: customProduct.sku || '',
                // Mantener propiedades adicionales para el catálogo
                catalog_price: customProduct.price.toString(),
                product_price: customProduct.price.toString(),
                catalog_name: customProduct.name,
                catalog_description: customProduct.description,
                catalog_short_description: customProduct.short_description,
                catalog_sku: customProduct.sku,
                catalog_image: customProduct.image,
                catalog_images: customProduct.images,
                is_custom: true
              } as any;
            }
            return p;
          });
        });
      } else {
        // Crear nuevo producto
        if (!catalogIdRef.current || catalogIdRef.current <= 0) {
          throw new Error('ID del catálogo inválido');
        }
        
        // Agregar ID del catálogo
        normalizedProductData.catalog_id = catalogIdRef.current || 0;
        
        // Crear el producto
        customProduct = await catalogService.createCustomProduct(normalizedProductData);
        
        // Agregar al estado local
        // Convertir CustomProduct a un formato compatible con Product
        const compatibleProduct = {
          id: customProduct.id || -1, // ID negativo para productos personalizados
          name: customProduct.name,
          price: customProduct.price.toString(),
          description: customProduct.description || '',
          short_description: customProduct.short_description || '',
          sku: customProduct.sku || '',
          // Propiedades adicionales para el catálogo
          catalog_price: customProduct.price.toString(),
          product_price: customProduct.price.toString(),
          catalog_name: customProduct.name,
          catalog_description: customProduct.description,
          catalog_short_description: customProduct.short_description,
          catalog_sku: customProduct.sku,
          catalog_image: customProduct.image,
          catalog_images: customProduct.images,
          is_custom: true
        } as any;
        
        setSelectedProducts(prev => [...prev, compatibleProduct]);
        setSelectedProductIds(prev => [...prev, customProduct.id || -1]);
      }
      
      // Cerrar modal
      setIsCustomProductModalOpen(false);
      setCurrentEditingProduct(null);
      
      logger.info('CatalogModal', 'Producto personalizado guardado con éxito:', customProduct);
      alertService.success(`Producto personalizado ${(productData as any).id ? 'actualizado' : 'creado'} con éxito`);
    } catch (error) {
      logger.error('CatalogModal', 'Error al guardar producto personalizado:', error);
      alertService.error(`Error al ${(productData as any).id ? 'actualizar' : 'crear'} el producto personalizado`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCustomProductModal = () => {
    setIsCustomProductModalOpen(false);
    setCurrentEditingProduct(null);
  };

  // Encabezado del catálogo con componentes reutilizables
  const renderCatalogHeader = () => {
    return (
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Editar Catálogo' : 'Crear Nuevo Catálogo'}
        </h2>
        
        <FormInput
          id="catalog-name"
          label="Nombre del Catálogo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingrese nombre del catálogo"
        />
        
        <FormImageInput
          label="Logo del Catálogo (opcional)"
          imageUrl={logoUrl}
          onChange={setLogoUrl}
          placeholder="URL de la imagen del logo"
        />
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      {renderCatalogHeader()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lista de productos seleccionados */}
        <SelectedProductsList
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProducts.map(p => p.id)}
          onToggleProduct={toggleProductSelection}
          getProductImage={getProductMainImage}
          formatCurrency={formatCurrency}
        />

        {/* Selector de productos */}
        <ProductSelector
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          products={products}
          loading={loading}
          selectedProductIds={selectedProducts.map(p => p.id)}
          onToggleProduct={toggleProductSelection}
          getProductImage={getProductMainImage}
          formatCurrency={formatCurrency}
        />
        <button 
          type="button"
          onClick={handleAddCustomProduct}
          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Añadir Producto Personalizado
        </button>

        {/* Botones de acción */}
        <FormActions
          onCancel={onCancel}
          isSubmitting={loading}
          submitLabel={isEditing ? 'Actualizar Catálogo' : 'Crear Catálogo'}
          cancelLabel="Cancelar"
          loadingLabel="Guardando..."
        />
      </form>

      {/* Modal de producto personalizado */}
      {isCustomProductModalOpen && (
        <CustomProductModal
          isOpen={isCustomProductModalOpen}
          initialProduct={currentEditingProduct ? { ...currentEditingProduct } as unknown as CustomProduct : undefined}
          onSave={handleCustomProductSave}
          onClose={handleCloseCustomProductModal}
          catalogId={catalogIdRef.current}
          isEditing={!!currentEditingProduct}
        />
      )}
    </div>
  );
};

export default CatalogModal;