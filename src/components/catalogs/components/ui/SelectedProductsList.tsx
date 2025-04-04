import React from 'react';
import { Product } from '../../../../types/woocommerce';

interface SelectedProductsListProps {
  selectedProducts: Product[];
  selectedProductIds: number[];
  onToggleProduct: (product: Product) => void;
  getProductImage: (product: Product) => string | null;
  formatCurrency: (price: string | number) => string;
}

const SelectedProductsList: React.FC<SelectedProductsListProps> = ({
  selectedProducts,
  selectedProductIds,
  onToggleProduct,
  getProductImage,
  formatCurrency
}) => {
  if (selectedProducts.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Productos seleccionados:</h4>
      <div className="mb-2 text-sm text-gray-500">
        {selectedProductIds.length} productos seleccionados
      </div>
      <div className="max-h-60 overflow-y-auto">
        {selectedProducts.map(product => (
          <div key={`selected-${product.id}`} className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
            <div className="flex items-center flex-1 mr-4">
              <img 
                src={getProductImage(product) || undefined} 
                alt={product.name} 
                className="w-10 h-10 mr-2 object-cover rounded" 
              />
              <div>
                <span className="block font-medium text-sm">{product.name}</span>
                <span className="block text-xs text-gray-500">
                  Precio original: {formatCurrency((product as any).product_price || product.price)}
                </span>
                <span className="block text-xs text-gray-500">
                  Precio del catálogo: {formatCurrency((product as any).catalog_price)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Eliminar producto"
                  onClick={() => onToggleProduct(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedProductsList;
