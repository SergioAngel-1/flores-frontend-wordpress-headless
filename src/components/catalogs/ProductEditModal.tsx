import React, { useState, useEffect } from 'react';
import { CatalogProductInput } from '../../types/catalog';
import AnimatedModal from '../ui/AnimatedModal';
import alertService from '../../services/alertService';
import logger from '../../utils/logger'; // Importar el logger
import { Product } from '../../types/woocommerce';
import { formatCurrency, processSecondaryImage, cleanImageUrlForStorage } from '../../utils/formatters';

interface ProductEditModalProps {
  isOpen?: boolean;
  product: Product & { 
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
  const [productPrice, setProductPrice] = useState<string | null>(null);
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
      
      // Corregir la inicialización del precio para asegurar que se muestra correctamente
      if (product.catalog_price !== null && product.catalog_price !== undefined) {
        // Convertir a string para el input, asegurando que sea un número válido
        const priceValue = typeof product.catalog_price === 'string' 
          ? product.catalog_price 
          : String(product.catalog_price);
        setPrice(priceValue);
        
        // Log para depuración
        logger.debug('ProductEditModal', `Inicializando precio de catálogo: ${priceValue} (tipo: ${typeof product.catalog_price})`);
      } else {
        setPrice(null);
      }
      
      setProductPrice(product.product_price !== null && product.product_price !== undefined
        ? String(product.product_price)
        : product.price ? String(product.price) : null);
      setSku(product.catalog_sku || product.sku || '');
      setShortDescription(product.catalog_short_description || product.short_description || '');
      setDescription(product.catalog_description || product.description || '');
      
      // Manejar imágenes
      const catalogImages = product.catalog_images || [];
      setMainImage(product.catalog_image || (product.images && product.images.length > 0 ? product.images[0].src : ''));
      
      // Procesar imágenes secundarias
      try {
        // Si catalogImages es un string (posiblemente un array serializado), intentar parsearlo
        if (catalogImages.length > 0) {
          logger.info('ProductEditModal', `Procesando imágenes secundarias para producto ${product.id}. Total: ${catalogImages.length}`);
          logger.debug('ProductEditModal', `Imágenes secundarias originales:`, catalogImages);
          
          const firstImage = typeof catalogImages[0] === 'string' ? cleanImageUrlForStorage(catalogImages[0]) : '';
          logger.info('ProductEditModal', `Primera imagen secundaria limpia: ${firstImage}`);
          setSecondaryImage1(firstImage);
          
          if (catalogImages.length > 1) {
            const secondImage = typeof catalogImages[1] === 'string' ? cleanImageUrlForStorage(catalogImages[1]) : '';
            logger.info('ProductEditModal', `Segunda imagen secundaria limpia: ${secondImage}`);
            setSecondaryImage2(secondImage);
          } else {
            setSecondaryImage2('');
          }
        } else {
          logger.debug('ProductEditModal', `No hay imágenes secundarias para producto ${product.id}`);
          setSecondaryImage1('');
          setSecondaryImage2('');
        }
      } catch (error) {
        logger.error('ProductEditModal', `Error al procesar imágenes secundarias:`, error);
        setSecondaryImage1('');
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
        product_price: productPrice ? parseFloat(productPrice) : null,
        catalog_name: name,
        catalog_sku: sku,
        catalog_short_description: shortDescription,
        catalog_description: description,
        catalog_image: mainImage,
        catalog_images: [
          cleanImageUrlForStorage(secondaryImage1),
          cleanImageUrlForStorage(secondaryImage2)
        ].filter(img => img.trim() !== ''),
        is_custom: product.is_custom || false // Mantener el valor existente o establecer como false por defecto
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
        
        {/* Precio original */}
        <div>
          <label htmlFor="product-original-price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio original
          </label>
          <input
            type="text"
            id="product-original-price"
            value={productPrice !== null ? formatCurrency(parseFloat(productPrice)) : ''}
            disabled={true}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
            placeholder="Precio original"
          />
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
                  src={processSecondaryImage(secondaryImage1) || '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
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
                value={cleanImageUrlForStorage(secondaryImage1) || ''}
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
                  src={processSecondaryImage(secondaryImage2) || '/wp-content/themes/FloresInc/assets/img/no-image.svg'} 
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
                value={cleanImageUrlForStorage(secondaryImage2) || ''}
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
