import React from 'react';
import { CatalogProduct } from '../../../../types/catalog';
import { getValidImageUrl } from '../../../../utils/formatters';
import logger from '../../../../utils/logger';

interface ProductImageDisplayProps {
  product: CatalogProduct;
  viewType: 'grid' | 'list';
}

const ProductImageDisplay: React.FC<ProductImageDisplayProps> = ({ product, viewType }) => {
  // Función para obtener la URL de la imagen principal de un producto
  const getMainImageUrl = (product: CatalogProduct): string => {
    try {
      // Primero intentar con catalog_image
      if (product.catalog_image && 
          product.catalog_image !== 'false' && 
          String(product.catalog_image) !== 'false') {
        const validUrl = getValidImageUrl(String(product.catalog_image));
        if (validUrl) {
          return validUrl;
        }
      }
      
      // Luego intentar con la primera imagen del array catalog_images
      if (product.catalog_images && product.catalog_images.length > 0 && 
          product.catalog_images[0] !== 'false' && 
          String(product.catalog_images[0]) !== 'false') {
        const validUrl = getValidImageUrl(String(product.catalog_images[0]));
        if (validUrl) {
          return validUrl;
        }
      }
      
      // Finalmente intentar con la primera imagen del array images
      if (product.images && product.images.length > 0) {
        const img = product.images[0];
        if (img && img.src && 
            img.src !== 'false' && 
            String(img.src) !== 'false') {
          const validUrl = getValidImageUrl(String(img.src));
          if (validUrl) {
            return validUrl;
          }
        }
      }
      
      // Si no hay imagen válida, devolver la imagen por defecto
      return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
    } catch (error) {
      logger.error('ProductImageDisplay', `Error al procesar imagen principal:`, error);
      return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
    }
  };

  // Función para extraer la URL de una imagen secundaria
  const getSecondaryImageUrl = (product: CatalogProduct, index: number): string => {
    try {
      // Primero intentar con catalog_images
      if (product.catalog_images && product.catalog_images.length > index) {
        const rawImageUrl = product.catalog_images[index];
        
        // Verificar si la imagen no es válida (false, null, etc.)
        if (
          rawImageUrl !== undefined && 
          rawImageUrl !== null && 
          rawImageUrl !== 'false' && 
          rawImageUrl !== '' && 
          String(rawImageUrl) !== 'false'
        ) {
          // Tratamiento directo basado en el tipo de dato que llega
          if (typeof rawImageUrl === 'string') {
            // Si es un string, verificar si es una URL válida directamente
            const validUrl = getValidImageUrl(rawImageUrl);
            if (validUrl) {
              logger.info('ProductImageDisplay', `URL válida de catalog_images:`, validUrl);
              return validUrl;
            }
          } else if (rawImageUrl && typeof rawImageUrl === 'object') {
            // Si es un objeto que podría tener una propiedad src
            const imgObj = rawImageUrl as any;
            if (imgObj.src && typeof imgObj.src === 'string' && imgObj.src !== 'false') {
              const validUrl = getValidImageUrl(imgObj.src);
              if (validUrl) {
                logger.info('ProductImageDisplay', `URL válida desde objeto catalog_images:`, validUrl);
                return validUrl;
              }
            }
          }
        }
      }
      
      // Si no hay imágenes en catalog_images, intentar con images
      if (product.images && product.images.length > index) {
        const img = product.images[index];
        if (img && img.src && img.src !== 'false' && String(img.src) !== 'false') {
          const validUrl = getValidImageUrl(String(img.src));
          if (validUrl) {
            logger.info('ProductImageDisplay', `URL válida desde images[${index}]:`, validUrl);
            return validUrl;
          }
        }
      }
      
      logger.warn('ProductImageDisplay', `No se encontró imagen secundaria válida para el producto ${product.id} en el índice ${index}`);
      return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
    } catch (error) {
      logger.error('ProductImageDisplay', `Error al procesar imagen secundaria ${index}:`, error);
      return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
    }
  };

  // Renderizado condicional basado en el tipo de vista
  if (viewType === 'grid') {
    return (
      <div className="product-header">
        {/* Imagen del producto */}
        <div className="aspect-w-1 aspect-h-1 w-full">
          <div className="w-full h-full rounded-t-lg overflow-hidden">
            <img 
              src={getMainImageUrl(product)} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
              }}
            />
          </div>
        </div>
        
        {/* Imágenes secundarias en formato circular */}
        <div className="flex justify-center -mt-12 pb-3 space-x-4 bg-secundario/20">
          {/* Primera imagen secundaria */}
          <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden rounded-full border-2 border-white shadow-md hover:border-primario transition-all duration-200 cursor-pointer">
            <img 
              src={getSecondaryImageUrl(product, 0)} 
              alt={`${product.name} - imagen secundaria 1`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
              }}
            />
          </div>
          
          {/* Segunda imagen secundaria */}
          <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden rounded-full border-2 border-white shadow-md hover:border-primario transition-all duration-200 cursor-pointer">
            <img 
              src={getSecondaryImageUrl(product, 1)} 
              alt={`${product.name} - imagen secundaria 2`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
              }}
            />
          </div>
        </div>
      </div>
    );
  } else {
    // Vista de lista
    return (
      <div className="md:w-1/4 lg:w-1/5 md:max-w-[200px] flex-shrink-0 relative">
        <div className="h-full md:h-[full]">
          <img 
            src={getMainImageUrl(product)} 
            alt={product.name} 
            className="w-full h-full object-cover md:rounded-l-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
            }}
          />
          
          {/* Imágenes secundarias en formato circular */}
          <div className="absolute top-1/2 transform -translate-y-1/2 -right-8 flex flex-col space-y-3">
            {/* Primera imagen secundaria */}
            <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden rounded-full border-2 border-white shadow-md hover:border-primario transition-all duration-200 cursor-pointer">
              <img 
                src={getSecondaryImageUrl(product, 0)} 
                alt={`${product.name} - imagen secundaria 1`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                }}
              />
            </div>
            
            {/* Segunda imagen secundaria */}
            <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden rounded-full border-2 border-white shadow-md hover:border-primario transition-all duration-200 cursor-pointer">
              <img 
                src={getSecondaryImageUrl(product, 1)} 
                alt={`${product.name} - imagen secundaria 2`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ProductImageDisplay;
