import React from 'react';
import { CatalogProduct, CatalogProductInput } from '../../../../types/catalog';
import ProductImageDisplay from './ProductImageDisplay';
import ProductHeader from './ProductHeader';
import ProductPrice from './ProductPrice';
import ProductDescription from './ProductDescription';
import ProductPromoFooter from './ProductPromoFooter';

interface ProductCardProps {
  product: CatalogProduct;
  viewType: 'grid' | 'list';
  onEditProduct: (product: CatalogProduct) => void;
  isCustomProduct: (product: CatalogProduct) => boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewType, onEditProduct, isCustomProduct }) => {
  // Si es vista grid
  if (viewType === 'grid') {
    return (
      <div 
        className="product-item bg-white border border-gray-200 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
      >
        {/* Imagen y nombre del producto */}
        <ProductImageDisplay product={product} viewType={viewType} />
        
        {/* Nombre del producto */}
        <ProductHeader 
          product={product} 
          viewType={viewType} 
          isCustomProduct={isCustomProduct(product)} 
        />
        
        {/* BODY: Precios y descripción */}
        <div className="product-body p-4 flex-grow">
          {/* Precios */}
          <ProductPrice 
            product={product} 
            isCustomProduct={isCustomProduct(product)} 
            onEditClick={() => onEditProduct(product)} 
          />
          
          {/* Descripción */}
          <ProductDescription product={product} viewType={viewType} />
        </div>
        
        {/* FOOTER: CTA promocional */}
        <ProductPromoFooter />
      </div>
    );
  } else {
    // Vista de lista
    return (
      <div 
        className="product-item bg-white border border-gray-200 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="md:flex h-full">
          {/* Header mobile */}
          <ProductHeader 
            product={product} 
            viewType={viewType} 
            isCustomProduct={isCustomProduct(product)} 
          />

          {/* Imagen del producto */}
          <ProductImageDisplay product={product} viewType={viewType} />

          <div className="md:w-3/4 md:flex-1 overflow-hidden flex flex-col">
            {/* HEADER: Nombre del producto (en desktop) */}
            <ProductHeader 
              product={product} 
              viewType={viewType} 
              isCustomProduct={isCustomProduct(product)} 
            />
            
            {/* BODY: Precios y descripción */}
            <div className="p-3 pl-12 flex-grow">
              {/* Precios */}
              <ProductPrice 
                product={product} 
                isCustomProduct={isCustomProduct(product)} 
                onEditClick={() => onEditProduct(product)} 
              />
              
              {/* Descripción */}
              <ProductDescription product={product} viewType={viewType} />
            </div>
            
            {/* FOOTER: CTA promocional */}
            <ProductPromoFooter />
          </div>
        </div>
      </div>
    );
  }
};

export default ProductCard;
