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
    // Limpiamos cualquier carácter escapado en la URL
    let cleanUrl = url.replace(/\\\//g, '/');
    
    // Eliminar comillas al principio y al final si existen
    cleanUrl = cleanUrl.replace(/^["']|["']$/g, '');
    
    // Eliminar espacios en blanco
    cleanUrl = cleanUrl.trim();
    
    // Registrar para debugging
    logger.debug('formatters', `getValidImageUrl: URL original: ${url}, URL limpia: ${cleanUrl}`);
    
    // Si es 'false' (como string), retornar null
    if (cleanUrl === 'false') {
      return null;
    }
    
    // Si la URL ya está bien formada con http o https, devolverla tal cual
    if (cleanUrl.match(/^https?:\/\//i)) {
      return cleanUrl;
    }
    
    // Manejar URLs con dominio local pero sin protocolo (flores.local)
    if (cleanUrl.match(/^[\w.-]+\.local\//i)) {
      return `http://${cleanUrl}`;
    }
    
    // Si es una URL relativa, convertirla a absoluta usando el origen actual
    if (cleanUrl.startsWith('/')) {
      const baseUrl = window.location.origin;
      return `${baseUrl}${cleanUrl}`;
    }
    
    // Si parece ser una ruta sin protocolo, añadir http://
    if (cleanUrl.includes('.') && !cleanUrl.startsWith('http')) {
      return `http://${cleanUrl}`;
    }
    
    // En caso de duda, devolver la URL limpia
    return cleanUrl;
  } catch (error) {
    // Corregir el error de lint pasando el mensaje correcto
    logger.error('formatters', `Error al formatear URL de imagen: ${String(error)}. URL: ${url}`);
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
    
    // Verificar si es una URL válida directamente
    const validUrl = getValidImageUrl(strImageUrl);
    if (validUrl) {
      logger.debug('formatters', `processSecondaryImage: URL válida directa: ${validUrl}`);
      return validUrl;
    }
    
    // Obtener una URL válida o usar la imagen por defecto
    return '/wp-content/themes/FloresInc/assets/img/no-image.svg';
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
  
  try {
    // Convertir a string en caso de que sea otro tipo
    let url = String(imageUrl);
    logger.debug('formatters', `cleanImageUrlForStorage: Limpiando URL original: ${url}`);
    
    // Reemplazo de barras invertidas escapadas (\/) con barras normales (/)
    url = url.replace(/\\\//g, '/');
    
    // Eliminar comillas al principio y al final si existen
    url = url.replace(/^["']|["']$/g, '');
    
    // Eliminar espacios en blanco al inicio y final
    url = url.trim();
    
    logger.debug('formatters', `cleanImageUrlForStorage: URL limpia: ${url}`);
    return url;
  } catch (error) {
    logger.error('formatters', `Error al limpiar URL para almacenamiento: ${String(error)}`);
    return '';
  }
};

/**
 * Valida y limpia un array de URLs de imágenes para guardarlas en la base de datos
 * @param imageUrls Array de URLs de imágenes o string JSON
 * @returns Array de URLs limpias y válidas
 */
export const validateImageUrlArray = (imageUrls: any): string[] => {
  if (!imageUrls) {
    return [];
  }
  
  let urlArray: any[] = [];
  
  try {
    // Si es un string, intentar parsearlo como JSON
    if (typeof imageUrls === 'string') {
      try {
        // Intentar analizar como JSON
        const parsed = JSON.parse(imageUrls);
        if (Array.isArray(parsed)) {
          logger.debug('formatters', `validateImageUrlArray: Parseado string JSON a array con ${parsed.length} elementos`);
          urlArray = parsed;
        } else {
          // Si no es un array después de parsear, convertirlo en array de un solo elemento
          logger.debug('formatters', 'validateImageUrlArray: El string JSON parseado no es un array, usando como elemento único');
          urlArray = [imageUrls];
        }
      } catch (error) {
        // Si no se puede parsear como JSON, tratarlo como una sola URL
        logger.debug('formatters', 'validateImageUrlArray: No se pudo parsear string como JSON, tratándolo como URL única');
        urlArray = [imageUrls];
      }
    } else if (Array.isArray(imageUrls)) {
      // Si ya es un array, usarlo directamente
      urlArray = imageUrls;
    } else {
      // Para cualquier otro tipo, convertir a array de un elemento
      urlArray = [imageUrls];
    }
    
    // Filtrar valores nulos/undefined y limpiar cada URL
    const validUrls = urlArray
      .filter((url: any) => url !== null && url !== undefined && url !== false && url !== 'false')
      .map((url: any) => cleanImageUrlForStorage(url))
      .filter((url: string) => url !== ''); // Eliminar URLs vacías después de la limpieza
    
    logger.debug('formatters', `validateImageUrlArray: Procesadas ${urlArray.length} URLs, resultando en ${validUrls.length} válidas`);
    return validUrls;
  } catch (error) {
    logger.error('formatters', `Error general en validateImageUrlArray: ${String(error)}`);
    return [];
  }
};
