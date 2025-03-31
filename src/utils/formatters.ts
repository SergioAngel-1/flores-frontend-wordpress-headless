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
      console.warn(`formatCurrency: No se pudo convertir "${amount}" a número`);
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
  
  console.log('Generando slug para:', name);
  
  const slug = name
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
    .replace(/[^\w\s-]/g, '') // Elimina caracteres especiales
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/-+/g, '-') // Elimina guiones múltiples
    .trim(); // Elimina espacios al inicio y final
    
  console.log('Slug generado:', slug);
  return slug;
};
