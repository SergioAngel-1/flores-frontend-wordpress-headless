import React, { useState, useEffect } from 'react';
import { CatalogProductInput } from '../../types/catalog';
import AnimatedModal from '../ui/AnimatedModal';
import alertService from '../../services/alertService';
import { Product } from '../../types/woocommerce';

interface ProductEditModalProps {
  isOpen?: boolean;
  product: Product & { 
    catalog_price?: number | string | null;
    catalog_name?: string | null;
    catalog_sku?: string | null;
    catalog_description?: string | null;
    catalog_short_description?: string | null;
    catalog_image?: string | null;
    catalog_images?: string[];
  };
  onClose: () => void;
  onSave?: (productId: number, updatedData: CatalogProductInput) => Promise<void>;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ 
  isOpen = true, 
  product, 
  onClose, 
  onSave 
}) => {
  // Estado para los campos editables
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string | null>(null);
  const [sku, setSku] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [secondaryImage1, setSecondaryImage1] = useState('');
  const [secondaryImage2, setSecondaryImage2] = useState('');
  const [loading, setLoading] = useState(false);

  // Inicializar el formulario con los datos del producto
  useEffect(() => {
    if (product) {
      // Usar los valores específicos del catálogo si existen, o los valores de WooCommerce como respaldo
      setName(product.catalog_name || product.name || '');
      setPrice(product.catalog_price !== null && product.catalog_price !== undefined 
        ? String(product.catalog_price) 
        : null);
      setSku(product.catalog_sku || product.sku || '');
      setShortDescription(product.catalog_short_description || product.short_description || '');
      setDescription(product.catalog_description || product.description || '');
      
      // Manejar imágenes
      const catalogImages = product.catalog_images || [];
      setMainImage(product.catalog_image || (product.images && product.images.length > 0 ? product.images[0].src : ''));
      
      // Asegurarse de que las imágenes secundarias no sean undefined o null
      if (catalogImages.length > 0) {
        setSecondaryImage1(catalogImages[0] || '');
      } else {
        setSecondaryImage1('');
      }
      
      if (catalogImages.length > 1) {
        setSecondaryImage2(catalogImages[1] || '');
      } else {
        setSecondaryImage2('');
      }
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !onSave) {
      // Si no hay función onSave, simplemente cerrar el modal
      onClose();
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar los datos actualizados
      const updatedData: CatalogProductInput = {
        id: product.id,
        catalog_price: price ? parseFloat(price) : null,
        catalog_name: name,
        catalog_sku: sku,
        catalog_short_description: shortDescription,
        catalog_description: description,
        catalog_image: mainImage,
        catalog_images: [secondaryImage1, secondaryImage2].filter(img => img.trim() !== '')
      };
      
      await onSave(product.id, updatedData);
      alertService.success('Producto actualizado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      alertService.error('Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Producto de Catálogo"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre del producto */}
        <div>
          <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del producto
          </label>
          <input
            type="text"
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
            placeholder="Nombre del producto"
          />
        </div>
        
        {/* Precio de catálogo */}
        <div>
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio de catálogo
          </label>
          <input
            type="number"
            id="product-price"
            value={price !== null ? price : ''}
            onChange={(e) => setPrice(e.target.value ? e.target.value : null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
            placeholder="Precio de catálogo"
            step="0.01"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Dejar en blanco para usar el precio de WooCommerce</p>
        </div>
        
        {/* SKU */}
        <div>
          <label htmlFor="product-sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            id="product-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
            placeholder="SKU del producto"
          />
        </div>
        
        {/* Imágenes */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Imágenes del producto</h3>
          
          {/* Imagen principal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen principal
            </label>
            <div className="relative h-40 w-40 mx-auto mb-2 border border-gray-300 rounded-md overflow-hidden">
              <img
                className="h-full w-full object-cover"
                src={mainImage || '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
                alt="Imagen principal"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                }}
              />
            </div>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primario focus:border-primario sm:text-sm"
              placeholder="URL de la imagen principal"
              value={mainImage || ''}
              onChange={(e) => setMainImage(e.target.value)}
            />
          </div>
          
          {/* Imágenes secundarias */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Imagen secundaria 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen secundaria 1
              </label>
              <div className="relative h-24 w-24 mx-auto mb-2 border border-gray-300 rounded-md overflow-hidden">
                <img
                  className="h-full w-full object-cover"
                  src={secondaryImage1 || '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
                  alt="Imagen secundaria 1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                  }}
                />
              </div>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primario focus:border-primario sm:text-sm"
                placeholder="URL de imagen secundaria 1"
                value={secondaryImage1 || ''}
                onChange={(e) => setSecondaryImage1(e.target.value)}
              />
            </div>
            
            {/* Imagen secundaria 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen secundaria 2
              </label>
              <div className="relative h-24 w-24 mx-auto mb-2 border border-gray-300 rounded-md overflow-hidden">
                <img
                  className="h-full w-full object-cover"
                  src={secondaryImage2 || '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
                  alt="Imagen secundaria 2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                  }}
                />
              </div>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primario focus:border-primario sm:text-sm"
                placeholder="URL de imagen secundaria 2"
                value={secondaryImage2 || ''}
                onChange={(e) => setSecondaryImage2(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Descripción corta */}
        <div>
          <label htmlFor="product-short-description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción corta
          </label>
          <textarea
            id="product-short-description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
            placeholder="Descripción corta del producto"
            rows={3}
          />
        </div>
        
        {/* Descripción completa */}
        <div>
          <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción completa
          </label>
          <textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
            placeholder="Descripción completa del producto"
            rows={5}
          />
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primario border border-transparent rounded-md hover:bg-primario-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </AnimatedModal>
  );
};

export default ProductEditModal;
