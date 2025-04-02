import logger from './logger';

/**
 * Formatea un número como moneda en formato COP
 * @param amount - Cantidad a formatear
 * @returns Cadena formateada como moneda
 */
export const formatCurrency = (amount: number | string): string => {
  if (amount === undefined || amount === null) {
    return 'COP 0';
  }
  
  // Si es una cadena, primero la limpiamos de cualquier formato existente
  let numAmount: number;
  
  if (typeof amount === 'string') {
    // Eliminar prefijo de moneda, espacios y otros caracteres no numéricos
    let cleanAmount = amount.replace(/COP\s*/, '').trim();
    
    // Si tiene puntos como separadores de miles (formato Colombia)
    if (cleanAmount.includes('.') && cleanAmount.indexOf('.') < cleanAmount.lastIndexOf('.')) {
      cleanAmount = cleanAmount.replace(/\./g, '');
    }
    
    // Si usa comas como separadores de miles y hay al menos una
    if (cleanAmount.includes(',') && cleanAmount.indexOf(',') < cleanAmount.length - 3) {
      cleanAmount = cleanAmount.replace(/,/g, '');
    }
    
    numAmount = parseFloat(cleanAmount);
    
    // Si no se pudo convertir, devolver 0
    if (isNaN(numAmount)) {
      logger.warn('formatters', `No se pudo convertir "${amount}" a número`);
      return 'COP 0';
    }
  } else {
    numAmount = amount;
  }
  
  // Formatear como COP sin decimales
  return `COP ${numAmount.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Formatea una fecha en formato legible
 * @param dateString - Cadena de fecha en formato ISO
 * @returns Fecha formateada
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Calcula el porcentaje de descuento entre dos precios
 * @param regularPrice - Precio regular
 * @param salePrice - Precio de oferta
 * @returns Porcentaje de descuento redondeado
 */
export const calculateDiscountPercentage = (regularPrice: number, salePrice: number): number => {
  if (regularPrice <= 0 || salePrice <= 0 || salePrice >= regularPrice) {
    return 0;
  }
  
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

/**
 * Trunca un texto a una longitud máxima y añade puntos suspensivos
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Genera un slug a partir de un nombre para usar en URLs
 * @param name - Nombre a convertir en slug
 * @returns Slug para URL
 */
export const generateSlug = (name: string): string => {
  if (!name) return '';
  
  logger.debug('formatters', `Generando slug para: ${name}`);
  
  const slug = name
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
    .replace(/[^\w\s-]/g, '') // Elimina caracteres especiales
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/-+/g, '-') // Elimina guiones múltiples
    .trim(); // Elimina espacios al inicio y final
    
  logger.debug('formatters', `Slug generado: ${slug}`);
  return slug;
};

/**
 * Valida y formatea una URL de imagen para asegurar que sea utilizable
 * @param url La URL de la imagen a validar
 * @returns Una URL válida o null si no es posible formatearla
 */
export const getValidImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  try {
    // Si la URL ya está bien formada, devolverla tal cual
    if (url.match(/^https?:\/\//i)) {
      return url;
    }
    
    // Si es una URL relativa, convertirla a absoluta usando el origen actual
    if (url.startsWith('/')) {
      const baseUrl = window.location.origin;
      return `${baseUrl}${url}`;
    }
    
    // Si parece ser una ruta sin protocolo, añadir http://
    if (url.includes('.') && !url.startsWith('http')) {
      return `http://${url}`;
    }
    
    return url;
  } catch (error) {
    console.error('Error al formatear URL de imagen:', error, url);
    return null;
  }
};

/**
 * Procesa una URL de imagen secundaria que puede venir con comillas o como parte de un array serializado
 * @param imageUrl URL de la imagen que puede contener comillas o ser parte de un array
 * @returns URL limpia y válida o imagen por defecto
 */
export const processSecondaryImage = (imageUrl: string | undefined | null | boolean): string => {
  // Si la imagen es false, undefined o null, devolver imagen por defecto
  if (imageUrl === false || imageUrl === undefined || imageUrl === null) {
    logger.debug('formatters', 'processSecondaryImage: URL es false, undefined o null');
    return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
  }
  
  // Si la imagen es 'false' (string), devolver imagen por defecto
  if (imageUrl === 'false') {
    logger.debug('formatters', 'processSecondaryImage: URL es string "false"');
    return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
  }
  
  try {
    // En este punto, imageUrl debe ser un string
    const strImageUrl = String(imageUrl);
    logger.debug('formatters', `processSecondaryImage: Procesando imagen original: ${strImageUrl}`);
    
    // Eliminar comillas si están presentes
    let cleanUrl = strImageUrl.replace(/^["']|["']$/g, '');
    
    // Si la URL parece ser un array JSON, intentar extraer la URL
    if (cleanUrl.startsWith('[') && cleanUrl.endsWith(']')) {
      try {
        logger.debug('formatters', `processSecondaryImage: Detectado posible array JSON: ${cleanUrl}`);
        
        // Sustituir barras invertidas dobles por simples para JSON.parse
        const normalizedUrl = cleanUrl.replace(/\\\\/g, '\\');
        logger.debug('formatters', `processSecondaryImage: URL normalizada para JSON.parse: ${normalizedUrl}`);
        
        const parsed = JSON.parse(normalizedUrl);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cleanUrl = parsed[0];
          logger.debug('formatters', `processSecondaryImage: URL extraída del array: ${cleanUrl}`);
        }
      } catch (e) {
        logger.error('formatters', `processSecondaryImage: Error al parsear URL como JSON:`, e);
      }
    }
    
    // Reemplazar barras invertidas por barras normales
    cleanUrl = cleanUrl.replace(/\\\\/g, '/').replace(/\\/g, '/');
    logger.debug('formatters', `processSecondaryImage: URL limpia después de reemplazar barras: ${cleanUrl}`);
    
    // Obtener una URL válida o usar la imagen por defecto
    const validUrl = getValidImageUrl(cleanUrl);
    logger.debug('formatters', `processSecondaryImage: URL válida final: ${validUrl || 'null'}`);
    
    return validUrl || '/wp-content/themes/FloresInc/assets/img/no-image.svg';
  } catch (error) {
    logger.error('formatters', `processSecondaryImage: Error al procesar imagen secundaria:`, error);
    return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
  }
};

/**
 * Limpia una URL de imagen para guardarla en la base de datos
 * @param imageUrl URL de la imagen a limpiar
 * @returns URL limpia sin comillas ni caracteres especiales
 */
export const cleanImageUrlForStorage = (imageUrl: string | undefined | null | boolean): string => {
  // Si la imagen es false, undefined o null, devolver string vacío
  if (imageUrl === false || imageUrl === undefined || imageUrl === null || imageUrl === 'false') {
    logger.debug('formatters', 'cleanImageUrlForStorage: URL es false, undefined, null o "false"');
    return '';
  }
  
  logger.debug('formatters', `cleanImageUrlForStorage: Limpiando URL original: ${String(imageUrl)}`);
  
  // Eliminar comillas y espacios en blanco
  const cleanUrl = String(imageUrl).replace(/^["'\s]+|["'\s]+$/g, '').trim();
  
  logger.debug('formatters', `cleanImageUrlForStorage: URL limpia: ${cleanUrl}`);
  return cleanUrl;
};
