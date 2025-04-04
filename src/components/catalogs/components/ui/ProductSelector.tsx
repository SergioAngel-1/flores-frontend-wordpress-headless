import React from 'react';
import { Product } from '../../../../types/woocommerce';
import LoadingSpinner from '../../../ui/LoadingSpinner';

interface ProductSelectorProps {
  products: Product[];
  loading: boolean;
  selectedProductIds: number[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleProduct: (product: Product) => void;
  getProductImage: (product: Product) => string | null;
  formatCurrency: (price: string | number) => string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  loading,
  selectedProductIds,
  searchTerm,
  onSearchChange,
  onToggleProduct,
  getProductImage,
  formatCurrency
}) => {
  // Filtrar productos que ya están seleccionados
  const filteredProducts = products.filter(product => !selectedProductIds.includes(product.id));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar productos
      </label>

      {/* Buscador de productos */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input
          type="search"
          className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primario focus:border-primario"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Lista de productos para seleccionar */}
      <div className="mt-1 border border-gray-300 rounded-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onToggleProduct(product)}
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => {}} // Manejado por el onClick del div padre
                    className="h-4 w-4 text-primario focus:ring-primario border-gray-300 rounded"
                  />
                  <div className="ml-3 flex items-center flex-1 mr-4">
                    <img 
                      src={getProductImage(product) || undefined} 
                      alt={product.name} 
                      className="w-10 h-10 object-cover rounded" 
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">Precio regular: {formatCurrency(product.price)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : searchTerm.trim().length >= 2 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron productos con ese término.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Cargando productos...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Todos los productos ya están seleccionados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
