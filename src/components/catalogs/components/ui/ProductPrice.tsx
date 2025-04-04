import React from 'react';
import { CatalogProduct } from '../../../../types/catalog';
import { formatCurrency } from '../../../../utils/formatters';

interface ProductPriceProps {
  product: CatalogProduct;
  isCustomProduct: boolean;
  onEditClick: () => void;
}

const ProductPrice: React.FC<ProductPriceProps> = ({ product, isCustomProduct, onEditClick }) => {
  return (
    <div className="flex items-center justify-between mb-3">
      {isCustomProduct ? (
        <span className="text-xl font-bold text-primario">
          {formatCurrency(product.catalog_price || product.price || 0)}
        </span>
      ) : (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-primario">
            {formatCurrency(product.catalog_price || product.price)}
          </span>
          {product.product_price && product.catalog_price && product.product_price !== product.catalog_price && (
            <span className="text-sm text-gray-500 line-through">
              Precio original: {formatCurrency(product.product_price)}
            </span>
          )}
        </div>
      )}
      
      <div className="flex items-center">
        <button
          onClick={onEditClick}
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
  );
};

export default ProductPrice;
