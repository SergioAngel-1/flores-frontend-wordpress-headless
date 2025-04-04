import React from 'react';
import { CatalogProduct } from '../../../../types/catalog';

interface ProductDescriptionProps {
  product: CatalogProduct;
  viewType: 'grid' | 'list';
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ product, viewType }) => {
  return (
    <>
      {/* Descripción corta */}
      {(product.catalog_short_description || product.short_description) && (
        <div 
          className={`text-sm text-gray-600 ${viewType === 'list' ? 'line-clamp-3' : 'mb-3'}`}
          dangerouslySetInnerHTML={{ __html: product.catalog_short_description || product.short_description || '' }}
        />
      )}
      
      {/* Si no hay descripción corta pero hay descripción larga, mostrar un extracto en vista de lista */}
      {viewType === 'list' && 
        !(product.catalog_short_description || product.short_description) && 
        (product.catalog_description || product.description) && (
        <div 
          className="text-sm text-gray-600 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: product.catalog_description || product.description || '' }}
        />
      )}
      
      {/* Descripción larga (solo en grid o completa en lista) */}
      {(product.catalog_description || product.description) && (
        <div 
          className="text-sm text-gray-700 mt-3 border-t border-gray-100 pt-3"
          dangerouslySetInnerHTML={{ __html: product.catalog_description || product.description || '' }}
        />
      )}
    </>
  );
};

export default ProductDescription;
