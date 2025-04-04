import React, { useState, useEffect, useRef } from 'react';
import { CustomProduct, CreateCustomProductData } from '../../types/catalog';
import AnimatedModal from '../ui/AnimatedModal';
import alertService from '../../services/alertService';
import { formatCurrency } from '../../utils/formatters';
import logger from '../../utils/logger';

// Componentes de formulario
import FormInput from './components/ui/form/FormInput';
import FormTextArea from './components/ui/form/FormTextArea';
import FormImageInput from './components/ui/form/FormImageInput';
import FormSecondaryImages from './components/ui/form/FormSecondaryImages';

// Utilidades para manejo de productos
import { normalizePrice, normalizeImageUrls, getValidProductImage } from './utils/productUtils';

interface CustomProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: CreateCustomProductData) => Promise<void>;
  catalogId?: number;
  initialProduct?: CustomProduct;
  isEditing?: boolean;
}

const CustomProductModal: React.FC<CustomProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  catalogId,
  initialProduct,
  isEditing = false
}) => {
  // Estado para los campos editables
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [sku, setSku] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [secondaryImage1, setSecondaryImage1] = useState('');
  const [secondaryImage2, setSecondaryImage2] = useState('');
  const [loading, setLoading] = useState(false);

  // Guardar el ID del catálogo en un ref para asegurar que esté disponible en todo momento
  const catalogIdRef = useRef<number | undefined>(catalogId);
  
  // Actualizar el ref cuando cambie catalogId
  useEffect(() => {
    logger.info('CustomProductModal', `useEffect para actualizar catalogIdRef - catalogId: ${catalogId}, prevValue: ${catalogIdRef.current}`);
    
    // Actualizar el ref con el nuevo valor
    catalogIdRef.current = catalogId;
    
    logger.info('CustomProductModal', `ID del catálogo actualizado en ref: ${catalogIdRef.current}`);
  }, [catalogId]);
  
  // Para debugging - verificar el ID del catálogo al inicio
  useEffect(() => {
    logger.info('CustomProductModal', `Inicialización - catalogId: ${catalogId}, catalogIdRef.current: ${catalogIdRef.current}`);
  }, []);

  // Cargar datos iniciales si estamos editando
  useEffect(() => {
    if (initialProduct && isEditing) {
      setName(initialProduct.name || '');
      
      // Mejorar el manejo del precio inicial
      if (initialProduct.price !== undefined && initialProduct.price !== null) {
        // Verificar el tipo de dato y formato
        if (typeof initialProduct.price === 'string') {
          // Si ya es string, verificar si necesita formateo
          if (initialProduct.price.includes('COP')) {
            setPrice(initialProduct.price);
          } else {
            // Intentar convertir a número y formatear
            const numPrice = parseFloat(initialProduct.price);
            if (!isNaN(numPrice)) {
              setPrice(formatCurrency(numPrice));
            } else {
              setPrice(formatCurrency(0));
              logger.warn('CustomProductModal', `Precio no numérico recibido: ${initialProduct.price}`);
            }
          }
        } else if (typeof initialProduct.price === 'number') {
          // Si es número, formatear directamente
          setPrice(formatCurrency(initialProduct.price));
          logger.debug('CustomProductModal', `Precio numérico formateado: ${initialProduct.price} -> ${formatCurrency(initialProduct.price)}`);
        } else {
          setPrice(formatCurrency(0));
          logger.warn('CustomProductModal', `Tipo de precio no reconocido: ${typeof initialProduct.price}`);
        }
      } else {
        setPrice(formatCurrency(0));
        logger.debug('CustomProductModal', 'Precio no definido, usando 0 como valor predeterminado');
      }
      
      setSku(initialProduct.sku || '');
      setShortDescription(initialProduct.short_description || '');
      setDescription(initialProduct.description || '');
      
      if (initialProduct.image) {
        setMainImage(initialProduct.image);
      }
      
      if (initialProduct.images && initialProduct.images.length > 0) {
        setSecondaryImage1(initialProduct.images[0] || '');
        if (initialProduct.images.length > 1) {
          setSecondaryImage2(initialProduct.images[1] || '');
        }
      }
    }
  }, [initialProduct, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!name.trim()) {
      alertService.error('El nombre del producto es obligatorio');
      return;
    }
    
    if (!price.trim() || isNaN(parseFloat(price))) {
      alertService.error('El precio debe ser un número válido');
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar datos del producto usando utilidades de normalización
      const productData: CreateCustomProductData = {
        catalog_id: catalogIdRef.current || 0, // Asegurar que sea un número válido
        name: name.trim(),
        price: normalizePrice(price),
        sku: sku.trim(),
        image: getValidProductImage(mainImage) || "",
        images: normalizeImageUrls([secondaryImage1, secondaryImage2]),
        description: description.trim(),
        short_description: shortDescription.trim(),
        is_custom: true // Marcar explícitamente como producto personalizado
      };
      
      logger.info('CustomProductModal', 'Enviando datos de producto personalizado:', productData);
      
      await onSave(productData);
      
      // Limpiar el formulario después de guardar
      if (!isEditing) {
        setName('');
        setPrice('');
        setSku('');
        setShortDescription('');
        setDescription('');
        setMainImage('');
        setSecondaryImage1('');
        setSecondaryImage2('');
      }
      
      // La alerta se manejará en el componente padre para evitar duplicación
      onClose();
    } catch (error) {
      console.error('Error al guardar el producto personalizado:', error);
      alertService.error('Error al guardar el producto personalizado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {isEditing ? 'Editar Producto Personalizado' : 'Crear Producto Personalizado'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre del producto */}
            <FormInput
              id="product-name"
              label="Nombre del producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del producto"
            />
            
            {/* Precio del producto */}
            <FormInput
              id="product-price"
              label="Precio"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio del producto"
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
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes del producto</h4>
              
              {/* Imagen principal */}
              <div className="mb-4">
                <FormImageInput
                  label="Imagen principal"
                  imageUrl={mainImage}
                  onChange={setMainImage}
                  placeholder="URL de la imagen principal"
                  size="medium"
                  fallbackImage="/wp-content/themes/FloresInc/assets/img/no-image.svg"
                />
              </div>
              
              {/* Imágenes secundarias */}
              <FormSecondaryImages
                image1Url={secondaryImage1}
                image2Url={secondaryImage2}
                onImage1Change={setSecondaryImage1}
                onImage2Change={setSecondaryImage2}
              />
            </div>
            
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
          </form>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primario text-base font-medium text-white hover:bg-primario-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario sm:ml-3 sm:w-auto sm:text-sm"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              'Guardar'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primario sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default CustomProductModal;
