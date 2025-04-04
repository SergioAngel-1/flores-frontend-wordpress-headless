import React, { useState, useEffect } from 'react';
import { CatalogProductInput } from '../../types/catalog';
import AnimatedModal from '../ui/AnimatedModal';
import alertService from '../../services/alertService';
import logger from '../../utils/logger';
import { Product } from '../../types/woocommerce';
import { formatCurrency, processSecondaryImage, cleanImageUrlForStorage } from '../../utils/formatters';

// Componentes de formulario
import FormInput from './components/ui/form/FormInput';
import FormTextArea from './components/ui/form/FormTextArea';
import FormActions from './components/ui/form/FormActions';
import ProductImages from './components/ProductImages';

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
        <FormInput
          id="product-name"
          label="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del producto"
        />
        
        {/* Precio de catálogo */}
        <FormInput
          id="product-price"
          label="Precio de catálogo"
          value={price}
          onChange={(e) => setPrice(e.target.value ? e.target.value : null)}
          placeholder="Precio de catálogo"
          type="number"
          step="0.01"
          min="0"
          helperText="Dejar en blanco para usar el precio de WooCommerce"
        />
        
        {/* Precio original */}
        <FormInput
          id="product-original-price"
          label="Precio original"
          value={productPrice !== null ? formatCurrency(parseFloat(productPrice)) : ''}
          onChange={() => {}} // No se puede cambiar
          placeholder="Precio original"
          disabled={true}
        />
        
        {/* SKU */}
        <FormInput
          id="product-sku"
          label="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU del producto"
        />
        
        {/* Imágenes */}
        <ProductImages
          mainImage={mainImage}
          secondaryImage1={secondaryImage1}
          secondaryImage2={secondaryImage2}
          onMainImageChange={setMainImage}
          onSecondaryImage1Change={setSecondaryImage1}
          onSecondaryImage2Change={setSecondaryImage2}
        />
        
        {/* Descripción corta */}
        <FormTextArea
          id="product-short-description"
          label="Descripción corta"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Descripción corta del producto"
          rows={3}
        />
        
        {/* Descripción completa */}
        <FormTextArea
          id="product-description"
          label="Descripción completa"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción completa del producto"
          rows={5}
        />
        
        {/* Botones de acción */}
        <FormActions
          onCancel={onClose}
          isSubmitting={loading}
          submitLabel="Guardar cambios"
          loadingLabel="Guardando..."
        />
      </form>
    </AnimatedModal>
  );
};

export default ProductEditModal;
