import React, { useState, useCallback } from 'react';
import { CatalogProduct, CatalogProductInput } from '../../types/catalog';
import ProductEditModal from './ProductEditModal';
import alertService from '../../services/alertService';
import { formatCurrency } from '../../utils/formatters';

interface ProductListProps {
  products: CatalogProduct[];
  onProductUpdate: (productId: number, updatedData: CatalogProductInput) => Promise<void>;
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductUpdate }) => {
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  // Estado para controlar el tipo de vista (grid o lista)
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const toggleDescription = (productId: number) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(productId);
    }
  };

  const handleCloseModal = useCallback(() => {
    setEditingProduct(null);
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

  // Manejar la edición de un producto
  const handleEditProduct = (product: CatalogProduct) => {
    console.log('Editando producto:', product);
    setEditingProduct(product);
  };

  // Determinar si un producto es personalizado
  const isCustomProduct = (product: CatalogProduct): boolean => {
    return product.is_custom === true || (product as any).product_id === 0;
  };

  return (
    <>
      {/* Controles de vista */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm gap-2" role="group">
          <button
            type="button"
            onClick={() => setViewType('grid')}
            className={`p-2 text-sm font-medium border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primario/50 ${
              viewType === 'grid'
                ? 'bg-primario text-white border-primario'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            aria-current={viewType === 'grid' ? 'page' : undefined}
            title="Vista de cuadrícula"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewType('list')}
            className={`p-2 text-sm font-medium border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primario/50 ${
              viewType === 'list'
                ? 'bg-primario text-white border-primario'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            aria-current={viewType === 'list' ? 'page' : undefined}
            title="Vista de lista"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className={viewType === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`product-item bg-white border border-gray-200 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow ${
              viewType === 'list' ? 'flex flex-col md:flex-row md:h-auto min-h-[180px]' : ''
            }`}
          >
            <div className={`${
              viewType === 'list' 
                ? 'md:w-1/4 md:max-w-[180px] flex items-center justify-center self-center p-3' 
                : 'aspect-w-1 aspect-h-1 w-full'
            } overflow-hidden`}>
              <div className={viewType === 'list' ? 'w-full h-full rounded-lg overflow-hidden' : ''}>
                <img 
                  src={product.catalog_image || product.image || '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
                  alt={product.name} 
                  className={`${
                    viewType === 'list' 
                      ? 'w-full h-full object-contain rounded-lg' 
                      : 'w-full h-52 object-cover'
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                  }}
                />
              </div>
            </div>
            <div className={`p-4 ${viewType === 'list' ? 'md:w-3/4 md:flex-1 overflow-hidden' : ''}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.name}
                {isCustomProduct(product) && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Exclusivo de catálogo
                  </span>
                )}
              </h3>
              
              <div className="flex items-center justify-between mb-2">
                {isCustomProduct(product) ? (
                  <span className="text-lg font-bold text-primario">{formatCurrency(product.catalog_price || product.price || 0)}</span>
                ) : product.on_sale ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primario">{formatCurrency(product.sale_price ?? 0)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(product.regular_price ?? 0)}</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-primario">{formatCurrency(product.price)}</span>
                )}
                
                <div className="flex items-center">
                  {!isCustomProduct(product) && product.catalog_price && (
                    <div className="flex flex-col items-end mr-2">
                      <span className="text-sm text-gray-500">Precio de catálogo:</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(product.catalog_price)}</span>
                    </div>
                  )}
                  
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
              
              {(product.catalog_sku || product.sku) && (
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  SKU: {product.catalog_sku || product.sku}
                </p>
              )}
              
              {/* Si hay descripción corta, mostrarla */}
              {(product.catalog_short_description || product.short_description) && (
                <div 
                  className="mt-2 text-sm text-gray-600 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: product.catalog_short_description || product.short_description || '' }}
                />
              )}
              
              {/* Si no hay descripción corta pero hay descripción larga, mostrar un extracto SOLO si no está expandido */}
              {!(product.catalog_short_description || product.short_description) && 
               (product.catalog_description || product.description) && 
               expandedProduct !== product.id && (
                <div 
                  className="mt-2 text-sm text-gray-600 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: (product.catalog_description || product.description || '').substring(0, 100) + '...' 
                  }}
                />
              )}
              
              {/* Botón para ver/ocultar detalles y descripción completa */}
              {(product.catalog_description || product.description) && (
                <div className="mt-3">
                  <button
                    onClick={() => toggleDescription(product.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {expandedProduct === product.id ? 'Ocultar detalles' : 'Ver detalles'}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ml-1 transition-transform ${expandedProduct === product.id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Mostrar descripción completa solo cuando está expandido */}
                  {expandedProduct === product.id && (
                    <div 
                      className="mt-2 text-sm text-gray-700 border-t pt-2 product-description overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: product.catalog_description || product.description || '' }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición de producto */}
      {editingProduct && (
        <ProductEditModal
          isOpen={!!editingProduct}
          product={editingProduct as any}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          key={`product-edit-modal-${editingProduct.id}-${Date.now()}`}
        />
      )}
    </>
  );
};

export default ProductList;
