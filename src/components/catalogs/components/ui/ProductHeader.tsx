import React from 'react';
import { CatalogProduct } from '../../../../types/catalog';

interface ProductHeaderProps {
  product: CatalogProduct;
  viewType: 'grid' | 'list';
  isCustomProduct: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ product, viewType, isCustomProduct }) => {
  // Aplicar clases específicas según vista
  const containerClasses = viewType === 'grid'
    ? 'p-3 bg-secundario/20 border-b border-secundario'
    : 'p-3 bg-secundario/20 border-b border-secundario md:p-3 md:pl-12';
  
  const titleClasses = viewType === 'grid'
    ? 'text-xl text-center font-semibold text-primario line-clamp-2'
    : 'text-lg md:text-xl font-semibold text-primario line-clamp-2';
  
  return (
    <div className={containerClasses}>
      <h3 className={titleClasses}>
        {product.name}
        {isCustomProduct && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primario/10 text-primario">
            Exclusivo de catálogo
          </span>
        )}
      </h3>
      
      {(product.catalog_sku || product.sku) && (
        <p className="text-xs text-texto/70 md:text-primario mt-1">
          SKU: {product.catalog_sku || product.sku}
        </p>
      )}
    </div>
  );
};

export default ProductHeader;
