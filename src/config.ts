// Configuración global de la aplicación

// URL base de la API de WordPress
export const API_URL = process.env.VITE_WP_API_URL || 'http://flores.local/wp-json';

// Claves de WooCommerce
export const WC_CONSUMER_KEY = process.env.VITE_WC_CONSUMER_KEY || '';
export const WC_CONSUMER_SECRET = process.env.VITE_WC_CONSUMER_SECRET || '';

// Configuración de paginación
export const ITEMS_PER_PAGE = 12;

// Configuración de timeouts para peticiones
export const API_TIMEOUT = 10000; // 10 segundos

// URLs de redes sociales
export const SOCIAL_MEDIA = {
  facebook: 'https://facebook.com/floresinc',
  instagram: 'https://instagram.com/floresinc',
  twitter: 'https://twitter.com/floresinc',
  whatsapp: 'https://wa.me/573223237785'
};

// Configuración de mapas
export const MAP_API_KEY = process.env.VITE_MAP_API_KEY || '';

// Límites de la aplicación
export const MAX_ADDRESSES = 3;
export const MIN_AGE = 18;

// Configuración de imágenes
export const DEFAULT_IMAGE = '/images/placeholder.jpg';
export const BANNER_SIZES = {
  desktop: { width: 1920, height: 500 },
  mobile: { width: 768, height: 400 }
};

// Configuración de moneda
export const CURRENCY = {
  code: 'COP',
  symbol: '$',
  decimals: 0
};
