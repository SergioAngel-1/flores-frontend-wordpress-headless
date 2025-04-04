import React, { useState, useCallback, useEffect } from 'react';
import { CatalogProduct, CatalogProductInput } from '../../types/catalog';
import ProductEditModal from './ProductEditModal';
import alertService from '../../services/alertService';
import { Product } from '../../types/woocommerce';
import ViewTypeToggle from './components/ui/ViewTypeToggle';
import ProductCard from './components/ui/ProductCard';

interface ProductListProps {
  products: CatalogProduct[];
  onProductUpdate: (productId: number, updatedData: CatalogProductInput) => Promise<void>;
  viewType?: 'grid' | 'list';
}

const ProductList: React.FC<ProductListProps> = ({ products: initialProducts, onProductUpdate, viewType: externalViewType }) => {
  // Estados
  const [internalViewType, setInternalViewType] = useState<'grid' | 'list'>(externalViewType || 'grid');
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
  
  // Actualizar el viewType interno cuando cambie el externo
  useEffect(() => {
    if (externalViewType) {
      setInternalViewType(externalViewType);
    }
  }, [externalViewType]);
  
  // Actualizar productos cuando cambien los props
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);
  
  // Usar el viewType externo si está proporcionado, de lo contrario usar el interno
  const viewType = externalViewType || internalViewType;

  // Manejar la edición de un producto
  const handleEditProduct = (product: CatalogProduct) => {
    console.log('Editando producto:', product);

    // Crear una copia profunda del producto para evitar problemas de referencia
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
      // Propiedades específicas de catálogo - asegurar que se pasen correctamente
      catalog_price: product.catalog_price !== undefined ? product.catalog_price : null,
      product_price: product.product_price !== undefined ? product.product_price : product.price,
      catalog_name: product.catalog_name || null,
      catalog_description: product.catalog_description || null,
      catalog_short_description: product.catalog_short_description || null,
      catalog_sku: product.catalog_sku || null,
      catalog_image: product.catalog_image || null,
      catalog_images: Array.isArray(product.catalog_images) ? [...product.catalog_images] : [],
      is_custom: Boolean(product.is_custom)
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

    // Log para depuración
    console.log('Producto preparado para edición:', productForEdit);
    
    setProductToEdit(productForEdit);
    setIsProductEditModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsProductEditModalOpen(false);
    setProductToEdit(null);
  }, []);

  const handleSaveProduct = useCallback(async (productId: number, updatedData: CatalogProductInput) => {
    try {
      // Log para depuración
      console.log('Guardando producto con datos:', updatedData);
      
      await onProductUpdate(productId, updatedData);
      
      // Actualización optimista de la UI - actualizar el producto en la lista local
      // para reflejar los cambios inmediatamente sin esperar una recarga completa
      setProducts(prevProducts => 
        prevProducts.map(p => {
          if (p.id === productId) {
            // Crear una copia del producto con los datos actualizados
            // asegurando que los tipos sean compatibles
            const updatedProduct: CatalogProduct = {
              ...p,
              catalog_price: typeof updatedData.catalog_price === 'number' 
                ? String(updatedData.catalog_price) 
                : updatedData.catalog_price,
              catalog_name: updatedData.catalog_name || p.name,
              catalog_sku: updatedData.catalog_sku,
              catalog_description: updatedData.catalog_description,
              catalog_short_description: updatedData.catalog_short_description,
              catalog_image: updatedData.catalog_image,
              catalog_images: updatedData.catalog_images || []
            };
            return updatedProduct;
          }
          return p;
        })
      );
      
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

  // Función para cambiar el tipo de vista
  const handleViewTypeChange = (type: 'grid' | 'list') => {
    setInternalViewType(type);
  };

  return (
    <div>
      {/* Controles de vista solo se muestran si no se proporciona viewType externamente */}
      {!externalViewType && (
        <ViewTypeToggle viewType={viewType} onViewTypeChange={handleViewTypeChange} />
      )}

      {/* Vista de cuadrícula o lista */}
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              viewType={viewType}
              onEditProduct={handleEditProduct}
              isCustomProduct={isCustomProduct}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              viewType={viewType}
              onEditProduct={handleEditProduct}
              isCustomProduct={isCustomProduct}
            />
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