import React, { useState, useEffect, useRef } from 'react';
import { CustomProduct, CreateCustomProductData } from '../../types/catalog';
import AnimatedModal from '../ui/AnimatedModal';
import alertService from '../../services/alertService';
import { formatCurrency } from '../../utils/formatters';
import logger from '../../utils/logger';

interface CustomProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: CreateCustomProductData) => Promise<void>;
  catalogId: number;
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
  const catalogIdRef = useRef<number>(catalogId);
  
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
      
      // Si el precio ya viene formateado como COP, usarlo directamente
      // de lo contrario, formatearlo
      if (initialProduct.price) {
        if (typeof initialProduct.price === 'string' && initialProduct.price.includes('COP')) {
          setPrice(initialProduct.price);
        } else {
          setPrice(formatCurrency(initialProduct.price));
        }
      } else {
        setPrice(formatCurrency(0));
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
    
    if (!name.trim()) {
      alertService.error('El nombre del producto es obligatorio');
      return;
    }
    
    // Verificar que el ID del catálogo sea válido
    if (!catalogIdRef.current || catalogIdRef.current <= 0) {
      logger.error('CustomProductModal', `Error: ID del catálogo inválido: ${catalogIdRef.current}`);
      alertService.error('No se puede crear el producto: ID de catálogo inválido');
      return;
    }
    
    // Convertir el precio al formato adecuado para guardar
    let numericPrice: number;
    if (typeof price === 'string') {
      // Limpiar el precio de formato (COP, puntos, comas)
      const cleanedPrice = price.replace(/COP\s*/i, '').replace(/\./g, '').replace(/,/g, '').trim();
      numericPrice = parseFloat(cleanedPrice);
      
      if (isNaN(numericPrice)) {
        alertService.error('El precio debe ser un número válido');
        return;
      }
    } else {
      numericPrice = price;
    }
    
    setLoading(true);
    
    try {
      // Preparar imágenes
      const images: string[] = [];
      if (mainImage) images.push(mainImage);
      if (secondaryImage1) images.push(secondaryImage1);
      if (secondaryImage2) images.push(secondaryImage2);
      
      // Obtener el ID del catálogo del ref
      const currentCatalogId = catalogIdRef.current;
      
      // Log para depuración
      logger.info('CustomProductModal', `Preparando datos para crear producto personalizado con catalog_id: ${currentCatalogId}`);
      
      const productData: CreateCustomProductData = {
        catalog_id: currentCatalogId,
        name,
        price: numericPrice,
        sku,
        description,
        short_description: shortDescription,
        image: mainImage,
        images,
        is_custom: true // Marcar explícitamente como producto personalizado
      };
      
      // Log para depuración
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
      
      alertService.success(isEditing ? 'Producto personalizado actualizado correctamente' : 'Producto personalizado creado correctamente');
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
          
          <form onSubmit={handleSubmit}>
            {/* Nombre del producto */}
            <div className="mb-4">
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario`}
                placeholder="Nombre del producto"
              />
            </div>
            
            {/* Precio */}
            <div className="mb-4">
              <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="product-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => {
                  // Al perder el foco, formatear como COP
                  try {
                    setPrice(formatCurrency(price));
                  } catch (error) {
                    console.error('Error al formatear precio:', error);
                  }
                }}
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario`}
                placeholder="Precio del producto (COP)"
              />
            </div>
            
            {/* SKU */}
            <div className="mb-4">
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
            
            {/* Descripción corta */}
            <div className="mb-4">
              <label htmlFor="product-short-description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción corta
              </label>
              <textarea
                id="product-short-description"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
                placeholder="Descripción corta del producto"
              />
            </div>
            
            {/* Descripción completa */}
            <div className="mb-4">
              <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción completa
              </label>
              <textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primario focus:border-primario"
                placeholder="Descripción completa del producto"
              />
            </div>
            
            {/* Imágenes del producto */}
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
