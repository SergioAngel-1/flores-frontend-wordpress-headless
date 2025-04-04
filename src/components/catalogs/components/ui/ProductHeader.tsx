import React from 'react';
import { CatalogProduct } from '../../../../types/catalog';

interface ProductHeaderProps {
  product: CatalogProduct;
  viewType: 'grid' | 'list';
  isCustomProduct: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ product, viewType, isCustomProduct }) => {
  // Para vista de grid o mobile en lista
  if (viewType === 'grid' || (viewType === 'list' && window.innerWidth < 768)) {
    return (
      <div className={`p-3 bg-secundario/20 border-b border-secundario ${viewType === 'list' ? 'md:hidden' : ''}`}>
        <h3 className={`${viewType === 'grid' ? 'text-xl text-center' : 'text-lg'} font-semibold text-primario line-clamp-2`}>
          {product.name}
          {isCustomProduct && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primario/10 text-primario">
              Exclusivo de catálogo
            </span>
          )}
        </h3>
        
        {(product.catalog_sku || product.sku) && viewType === 'grid' && (
          <p className="text-xs text-texto/70 mt-1">
            SKU: {product.catalog_sku || product.sku}
          </p>
        )}
      </div>
    );
  } else {
    // Vista de lista en desktop
    return (
      <div className="hidden md:block p-3 pl-12 bg-secundario/20 border-b border-secundario">
        <h3 className="text-xl font-semibold text-primario line-clamp-2">
          {product.name}
          {isCustomProduct && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primario/10 text-primario">
              Exclusivo de catálogo
            </span>
          )}
        </h3>
        
        {(product.catalog_sku || product.sku) && (
          <p className="text-xs text-primario mt-1">
            SKU: {product.catalog_sku || product.sku}
          </p>
        )}
      </div>
    );
  }
};

export default ProductHeader;
