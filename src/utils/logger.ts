/**
 * Utilidad centralizada para el manejo de logs en la aplicación
 * Solo mostrará logs en entorno de desarrollo
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Determina si el entorno actual es de desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// Categorías que deben ser silenciadas (demasiado verbosas)
const mutedCategories = [
  'BannerCarousel',
  'SocialNetworks',
  'formatters',
  'FeaturedCategories'
];

// Categorías que siempre se muestran, independientemente de su verbosidad
const alwaysShownCategories = [
  'auth',
  'api',
  'cache',
  'batch'
];

/**
 * Función centralizada para manejo de logs
 * @param category Categoría del log (ej: 'AuthContext', 'api')
 * @param message Mensaje a mostrar
 * @param level Nivel del log (debug, info, warn, error)
 * @param data Datos adicionales (opcional)
 */
export const log = (
  category: string,
  message: string,
  level: LogLevel = 'info',
  data?: any
): void => {
  // Solo mostrar logs en desarrollo
  if (!isDevelopment) return;
  
  // Verificar si la categoría está silenciada, a menos que esté en alwaysShownCategories
  if (mutedCategories.includes(category) && !alwaysShownCategories.includes(category)) return;
  
  // Formatear el prefijo del mensaje
  const prefix = `[${category}]`;
  
  // Elegir la función de console adecuada según el nivel
  switch (level) {
    case 'debug':
      console.debug(prefix, message, data || '');
      break;
    case 'info':
      console.log(prefix, message, data || '');
      break;
    case 'warn':
      console.warn(prefix, message, data || '');
      break;
    case 'error':
      console.error(prefix, message, data || '');
      break;
  }
};

/**
 * Abreviaciones para cada nivel de log
 */
export const logger = {
  debug: (category: string, message: string, data?: any) => log(category, message, 'debug', data),
  info: (category: string, message: string, data?: any) => log(category, message, 'info', data),
  warn: (category: string, message: string, data?: any) => log(category, message, 'warn', data),
  error: (category: string, message: string, data?: any) => log(category, message, 'error', data)
};

export default logger;
