import React, { useState, useCallback, useEffect } from 'react';
import { CatalogProduct, CatalogProductInput } from '../../types/catalog';
import ProductEditModal from './ProductEditModal';
import alertService from '../../services/alertService';
import { formatCurrency, getValidImageUrl } from '../../utils/formatters';
import { Product } from '../../types/woocommerce'; // Importar el tipo Product

interface ProductListProps {
  products: CatalogProduct[];
  onProductUpdate: (productId: number, updatedData: CatalogProductInput) => Promise<void>;
  viewType?: 'grid' | 'list';
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductUpdate, viewType: externalViewType }) => {
  // Estados
  const [internalViewType, setInternalViewType] = useState<'grid' | 'list'>(externalViewType || 'grid');
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Actualizar el viewType interno cuando cambie el externo
  useEffect(() => {
    if (externalViewType) {
      setInternalViewType(externalViewType);
    }
  }, [externalViewType]);

  // Usar el viewType externo si está proporcionado, de lo contrario usar el interno
  const viewType = externalViewType || internalViewType;

  // Manejar la edición de un producto
  const handleEditProduct = (product: CatalogProduct) => {
    console.log('Editando producto:', product);

    // Convertir CatalogProduct a un formato compatible con ProductEditModal
    // que espera Product con propiedades de catálogo adicionales
    const productForEdit = {
      id: product.id,
      name: product.name,
      price: product.price,
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      on_sale: product.on_sale,
      description: product.description || '',
      short_description: product.short_description || '',
      images: product.images || [],
      sku: product.sku || '',
      slug: '', // Propiedades requeridas por Product pero no usadas realmente
      permalink: '',
      date_created: '',
      date_modified: '',
      // Propiedades adicionales requeridas por Product pero no utilizadas
      type: 'simple',
      status: 'publish',
      featured: false,
      catalog_visibility: 'visible',
      // Propiedades específicas de catálogo
      catalog_price: product.catalog_price,
      product_price: product.product_price,
      catalog_name: product.catalog_name,
      catalog_description: product.catalog_description,
      catalog_short_description: product.catalog_short_description,
      catalog_sku: product.catalog_sku,
      catalog_image: product.catalog_image,
      catalog_images: product.catalog_images,
      is_custom: product.is_custom
    } as unknown as Product & { 
      catalog_price?: number | string | null;
      product_price?: number | string | null;
      catalog_name?: string | null;
      catalog_sku?: string | null;
      catalog_description?: string | null;
      catalog_short_description?: string | null;
      catalog_image?: string | null;
      catalog_images?: string[];
      is_custom?: boolean;
    };

    setProductToEdit(productForEdit);
    setIsProductEditModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsProductEditModalOpen(false);
    setProductToEdit(null);
  }, []);

  const handleSaveProduct = useCallback(async (productId: number, updatedData: CatalogProductInput) => {
    try {
      await onProductUpdate(productId, updatedData);
      alertService.success('Producto actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      alertService.error('Error al actualizar el producto');
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
  }, [onProductUpdate]);

  // Determinar si un producto es personalizado
  const isCustomProduct = (product: CatalogProduct): boolean => {
    return product.is_custom === true || (product as any).product_id === 0;
  };

  return (
    <div>
      {/* Controles de vista solo se muestran si no se proporciona viewType externamente */}
      {!externalViewType && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setInternalViewType('grid')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                viewType === 'grid'
                  ? 'bg-primario text-white border-primario'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setInternalViewType('list')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                viewType === 'list'
                  ? 'bg-primario text-white border-primario'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Vista de cuadrícula */}
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div 
              key={product.id} 
              className={`product-item bg-white border border-gray-200 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full`}
            >
              {/* HEADER: Imagen y nombre del producto */}
              <div className="product-header">
                {/* Imagen del producto */}
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <div className="w-full h-full rounded-t-lg overflow-hidden">
                    <img 
                      src={getValidImageUrl(product.catalog_image) || getValidImageUrl(product.image) || '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                      }}
                    />
                  </div>
                </div>
                
                {/* Nombre del producto */}
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                    {isCustomProduct(product) && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Exclusivo de catálogo
                      </span>
                    )}
                  </h3>
                  
                  {(product.catalog_sku || product.sku) && (
                    <p className="text-xs text-gray-500 mt-1">
                      SKU: {product.catalog_sku || product.sku}
                    </p>
                  )}
                </div>
              </div>
              
              {/* BODY: Precios y descripción */}
              <div className="product-body p-4 flex-grow">
                {/* Precios */}
                <div className="flex items-center justify-between mb-3">
                  {isCustomProduct(product) ? (
                    <span className="text-xl font-bold text-primario">{formatCurrency(product.catalog_price || product.price || 0)}</span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-primario">{formatCurrency(product.catalog_price || product.price)}</span>
                      {product.product_price && product.catalog_price && product.product_price !== product.catalog_price && (
                        <span className="text-sm text-gray-500 line-through">Precio original: {formatCurrency(product.product_price)}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                      title="Editar producto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Descripción corta */}
                {(product.catalog_short_description || product.short_description) && (
                  <div 
                    className="text-sm text-gray-600 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: product.catalog_short_description || product.short_description || '' }}
                  />
                )}
                
                {/* Si no hay descripción corta pero hay descripción larga, mostrar un extracto */}
                {!(product.catalog_short_description || product.short_description) && 
                 (product.catalog_description || product.description) && (
                  <div 
                    className="text-sm text-gray-600 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: product.catalog_description || product.description || '' }}
                  />
                )}
              </div>
              
              {/* FOOTER: CTA promocional */}
              <div className="product-footer p-3 bg-yellow-50 border-t border-yellow-100">
                <span className="text-sm font-medium text-yellow-800 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ¡Lleva 4 y te regalamos el otro!
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <div 
              key={product.id} 
              className={`product-item bg-white border border-gray-200 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow`}
            >
              <div className="md:flex">
                {/* HEADER: Imagen y nombre del producto (en vista móvil) */}
                <div className="md:hidden p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                    {isCustomProduct(product) && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Exclusivo de catálogo
                      </span>
                    )}
                  </h3>
                </div>

                {/* Imagen del producto */}
                <div className="md:w-1/4 lg:w-1/5 md:max-w-[200px]">
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img 
                      src={getValidImageUrl(product.catalog_image) || getValidImageUrl(product.image) || '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
                      alt={product.name} 
                      className="w-full h-full object-cover md:rounded-l-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                      }}
                    />
                  </div>
                </div>

                <div className="md:w-3/4 md:flex-1 overflow-hidden flex flex-col">
                  {/* HEADER: Nombre del producto (en desktop) */}
                  <div className="hidden md:block p-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                      {isCustomProduct(product) && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Exclusivo de catálogo
                        </span>
                      )}
                    </h3>
                    
                    {(product.catalog_sku || product.sku) && (
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {product.catalog_sku || product.sku}
                      </p>
                    )}
                  </div>
                  
                  {/* BODY: Precios y descripción */}
                  <div className="p-4 flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      {isCustomProduct(product) ? (
                        <span className="text-xl font-bold text-primario">{formatCurrency(product.catalog_price || product.price || 0)}</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-primario">{formatCurrency(product.catalog_price || product.price)}</span>
                          {product.product_price && product.catalog_price && product.product_price !== product.catalog_price && (
                            <span className="text-sm text-gray-500 line-through">Precio original: {formatCurrency(product.product_price)}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                          title="Editar producto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Descripción corta */}
                    {(product.catalog_short_description || product.short_description) && (
                      <div 
                        className="text-sm text-gray-600 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: product.catalog_short_description || product.short_description || '' }}
                      />
                    )}
                    
                    {/* Si no hay descripción corta pero hay descripción larga, mostrar un extracto */}
                    {!(product.catalog_short_description || product.short_description) && 
                     (product.catalog_description || product.description) && (
                      <div 
                        className="text-sm text-gray-600 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: product.catalog_description || product.description || '' }}
                      />
                    )}
                  </div>
                  
                  {/* FOOTER: CTA promocional */}
                  <div className="p-3 bg-yellow-50 border-t border-yellow-100 mt-auto">
                    <span className="text-sm font-medium text-yellow-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ¡Lleva 4 y te regalamos el otro!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal de edición de producto */}
      {isProductEditModalOpen && productToEdit && (
        <ProductEditModal
          isOpen={isProductEditModalOpen}
          product={productToEdit}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          key={`product-edit-modal-${productToEdit.id}-${Date.now()}`}
        />
      )}
    </div>
  );
};

export default ProductList;
