import { Product, Image } from '../../../types/woocommerce';
import { CustomProduct } from '../../../types/catalog';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Tipo unificado para representar productos (tanto WooCommerce como personalizados)
 */
export interface UnifiedProduct {
  id: number;
  name: string;
  price: string;
  product_price?: string;  // Precio original del producto
  catalog_price?: string;  // Precio en el catálogo
  image: string | null;    // Imagen principal
  images: string[];        // Imágenes secundarias
  description?: string;    // Descripción completa
  short_description?: string; // Descripción corta
  sku?: string;            // SKU del producto
  isCustom?: boolean;      // Indica si es un producto personalizado
}

/**
 * Normaliza un valor de precio a string con formato consistente
 */
export const normalizePrice = (price: string | number | undefined): string => {
  if (price === undefined || price === null) return "0";
  if (typeof price === 'string') {
    // Intentar convertir a número para validación
    const numPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
    return isNaN(numPrice) ? "0" : numPrice.toString();
  }
  return price.toString();
};

/**
 * Obtiene una URL de imagen válida o retorna null
 */
export const getValidProductImage = (imageUrl: string | undefined | null): string | null => {
  if (!imageUrl) return null;
  
  // Validar que la URL es válida
  try {
    new URL(imageUrl); // Intentar crear un objeto URL para validar
    return imageUrl;
  } catch (e) {
    // Si la URL no tiene protocolo, intentar agregar http
    if (!imageUrl.startsWith('http')) {
      try {
        new URL(`http://${imageUrl}`);
        return `http://${imageUrl}`;
      } catch {
        return imageUrl; // Devolver la URL original aunque no sea válida
      }
    }
    return imageUrl; // Devolver la URL original aunque no sea válida
  }
};

/**
 * Normaliza un array de URLs de imágenes eliminando valores vacíos o inválidos
 */
export const normalizeImageUrls = (urls: (string | undefined | null)[]): string[] => {
  return urls
    .map(url => getValidProductImage(url))
    .filter((url): url is string => url !== null && url !== "");
};

/**
 * Convierte un producto de WooCommerce al formato unificado
 */
export const convertWooProductToUnified = (product: Product): UnifiedProduct => {
  // Obtener la imagen principal
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0].src 
    : null;
  
  // Obtener imágenes secundarias (excluyendo la principal)
  const secondaryImages = product.images 
    ? product.images.slice(1).map(img => img.src).filter(Boolean) as string[]
    : [];

  return {
    id: product.id || 0, // Asegurar que id sea número válido
    name: product.name,
    price: normalizePrice(product.price),
    product_price: normalizePrice((product as any).product_price || product.price),
    catalog_price: normalizePrice((product as any).catalog_price || product.price),
    image: mainImage,
    images: secondaryImages,
    description: product.description,
    short_description: product.short_description,
    sku: product.sku,
    isCustom: false
  };
};

/**
 * Convierte un producto personalizado al formato unificado
 */
export const convertCustomProductToUnified = (product: CustomProduct): UnifiedProduct => {
  return {
    id: product.id || 0, // Asegurar que id sea número válido
    name: product.name,
    price: normalizePrice(product.price),
    product_price: normalizePrice(product.price),
    catalog_price: normalizePrice(product.price),
    image: getValidProductImage(product.image),
    images: normalizeImageUrls(product.images || []),
    description: product.description,
    short_description: product.short_description,
    sku: product.sku,
    isCustom: true
  };
};

/**
 * Función para formatear y mostrar el precio con el formato adecuado
 */
export const displayPrice = (price: string | number | undefined): string => {
  return formatCurrency(normalizePrice(price));
};

/**
 * Obtiene la imagen principal de un producto (compatible con ambos tipos)
 */
export const getProductMainImage = (product: Product | CustomProduct | UnifiedProduct): string | null => {
  // Si es un producto unificado
  if ('image' in product && product.image) {
    return product.image;
  }
  
  // Si es un producto WooCommerce
  if ('images' in product && Array.isArray(product.images)) {
    if (product.images.length > 0) {
      // Caso para imágenes como string (formato personalizado)
      if (typeof product.images[0] === 'string') {
        return product.images[0];
      } 
      // Caso para imágenes como objetos (formato WooCommerce)
      else if (typeof product.images[0] === 'object' && product.images[0] && 'src' in product.images[0]) {
        return product.images[0].src;
      }
    }
  }
  
  // Si es un producto personalizado en formato antiguo
  if ((product as any).image) {
    return (product as any).image;
  }
  
  return null;
};

/**
 * Obtiene todas las imágenes de un producto (compatible con ambos tipos)
 */
export const getProductImages = (product: Product | CustomProduct | UnifiedProduct): string[] => {
  const images: string[] = [];
  
  // Agregar imagen principal si existe
  const mainImage = getProductMainImage(product);
  if (mainImage) {
    images.push(mainImage);
  }
  
  // Agregar imágenes secundarias
  if ('images' in product && Array.isArray(product.images)) {
    // Si son productos WooCommerce (tienen objetos con src)
    if (product.images.length > 0 && typeof product.images[0] === 'object') {
      // Asegurarse que son objetos Image con src
      const wooImages = product.images.filter(img => 
        typeof img === 'object' && img && 'src' in img
      ) as Image[];
      
      // Agregar imágenes secundarias desde la posición 1 (excluyendo la principal)
      if (wooImages.length > 1) {
        images.push(...wooImages.slice(1).map(img => img.src).filter(Boolean));
      }
    } 
    // Si son strings directamente (formato unificado o personalizado)
    else if (product.images.length > 0 && typeof product.images[0] === 'string') {
      const stringImages = product.images as string[];
      // Si ya agregamos la principal, no incluirla de nuevo
      if (mainImage && stringImages[0] === mainImage && stringImages.length > 1) {
        images.push(...stringImages.slice(1));
      } else {
        images.push(...stringImages);
      }
    }
  }
  
  return images;
};
