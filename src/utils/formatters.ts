/**
 * Formatea un número como moneda en formato MXN
 * @param amount - Cantidad a formatear
 * @returns Cadena formateada como moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
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
