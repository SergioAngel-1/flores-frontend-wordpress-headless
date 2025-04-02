import axios from 'axios';
import * as CryptoJS from 'crypto-js';
//@ts-ignore
import OAuth from 'oauth-1.0a';
import { showServerErrorAlert } from './alertService';
import logger from '../utils/logger';

// Variables para controlar los errores de servidor
let serverErrorShown = false;
let lastErrorTime = 0;
const ERROR_COOLDOWN = 10000; // 10 segundos entre alertas

// Claves para WooCommerce API (OAuth)
export const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY || 'ck_ffbe931e6b1611cfc1deaa8c2c12c8c7daca4666';
export const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET || 'cs_5cb79deb6660f34684be577ceedee76c8cd6a4aa';

// Obtener la URL base de las variables de entorno o usar un valor predeterminado
export const baseApiUrl = import.meta.env.VITE_WP_API_URL || 'http://flores.local:10017';

// Configuración de OAuth 1.0a
export const oauth = new OAuth({
  consumer: {
    key: consumerKey,
    secret: consumerSecret
  },
  signature_method: 'HMAC-SHA1',
  // Función de hash para OAuth
  hash_function: function(base_string: string, key: string) {
    return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
  }
});

// Función para obtener los headers de autenticación
export const getAuthHeaders = (url: string, method: string) => {
  const requestData = {
    url,
    method
  };

  return oauth.authorize(requestData);
};

// Crear instancia de Axios para WooCommerce API
export const wooCommerceApi = axios.create({
  baseURL: `${baseApiUrl}/wp-json/wc/v3`,
  timeout: 10000, // Timeout global de 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true  // Habilitar cookies para mantener la sesión
});

// Interceptor para añadir los parámetros OAuth a cada solicitud
wooCommerceApi.interceptors.request.use(config => {
  // Asegurarse de que params existe
  config.params = config.params || {};
  
  // Construir la URL completa para la firma OAuth
  const urlObj = new URL(`${baseApiUrl}/wp-json/wc/v3${config.url || ''}`);
  
  // Añadir parámetros existentes a la URL
  Object.entries(config.params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value as string);
  });
  
  // Limpiar los parámetros para la firma (usaremos solo la URL)
  const fullUrl = urlObj.toString();
  
  // Obtener el método HTTP en mayúsculas
  const method = config.method?.toUpperCase() || 'GET';
  
  // Crear los datos de la solicitud para OAuth
  const requestData = {
    url: fullUrl,
    method
  };
  
  // Obtener los parámetros OAuth
  const oauthData = oauth.authorize(requestData);
  
  // Añadir los parámetros OAuth a los parámetros de la solicitud
  config.params = {
    ...config.params,
    oauth_consumer_key: oauthData.oauth_consumer_key,
    oauth_nonce: oauthData.oauth_nonce,
    oauth_signature: oauthData.oauth_signature,
    oauth_signature_method: oauthData.oauth_signature_method,
    oauth_timestamp: oauthData.oauth_timestamp,
    oauth_version: oauthData.oauth_version
  };
  
  logger.debug('API', `Petición OAuth ${method} a ${fullUrl}`);
  logger.debug('API', 'Parámetros OAuth:', oauthData);
  
  return config;
});

// Interceptor de respuesta para manejo de errores global
wooCommerceApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Respuesta del servidor con error
      logger.error('API', `Error ${error.response.status}:`, error.response.data);
      
      // Mostrar alerta solo si es un error 500 y no se ha mostrado recientemente
      if (error.response.status >= 500 && error.response.status < 600) {
        const currentTime = Date.now();
        
        if (!serverErrorShown || (currentTime - lastErrorTime > ERROR_COOLDOWN)) {
          serverErrorShown = true;
          lastErrorTime = currentTime;
          
          showServerErrorAlert();
          
          // Resetear el flag después del cooldown
          setTimeout(() => {
            serverErrorShown = false;
          }, ERROR_COOLDOWN);
        }
      }
    } else if (error.request) {
      // Solicitud realizada pero sin respuesta
      logger.error('API', 'Error de conexión:', error.message);
      
      // Mostrar alerta solo si no se ha mostrado recientemente
      const currentTime = Date.now();
      
      if (!serverErrorShown || (currentTime - lastErrorTime > ERROR_COOLDOWN)) {
        serverErrorShown = true;
        lastErrorTime = currentTime;
        
        showServerErrorAlert();
        
        // Resetear el flag después del cooldown
        setTimeout(() => {
          serverErrorShown = false;
        }, ERROR_COOLDOWN);
      }
    } else {
      // Error al configurar la solicitud
      logger.error('API', 'Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Configurar una instancia global de Axios para las demás peticiones
export const api = axios.create({
  baseURL: `${baseApiUrl}/wp-json`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Habilitar cookies para mantener la sesión
});

// Interceptor para los logs de peticiones
api.interceptors.request.use(
  config => {
    logger.debug('API', `Petición ${config.method?.toUpperCase()} a ${config.url}`);
    
    // Asegurar que el token de autenticación esté presente en todas las solicitudes si existe
    const token = localStorage.getItem('authToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug('API', 'Token de autenticación añadido a la petición');
    }
    
    return config;
  },
  error => {
    logger.error('API', 'Error en la configuración de la petición', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejo de errores global
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response) {
      // Respuesta del servidor con error
      logger.error('API', `Error ${error.response.status}:`, error.response.data);
      
      // Si es un error de autenticación (401) o autorización (403)
      if ((error.response.status === 401 || error.response.status === 403) && 
          error.config && 
          !error.config.__isRetryRequest) {
        
        // Verificar si tenemos un token en localStorage
        const token = localStorage.getItem('authToken');
        
        if (token) {
          logger.warn('API', 'Error de autenticación. Intentando renovar token...');
          
          // Marcar esta solicitud como reintento para evitar bucles infinitos
          error.config.__isRetryRequest = true;
          
          try {
            // Intentar obtener un nuevo token o validar el existente
            // Esto dependerá de la implementación específica del backend
            // Por ahora, simplemente reintentamos la solicitud con el token actual
            
            // Asegurar que el token esté en los headers
            error.config.headers.Authorization = `Bearer ${token}`;
            
            // Reintentar la solicitud original
            logger.info('API', 'Reintentando solicitud con token actualizado');
            return api(error.config);
          } catch (retryError) {
            logger.error('API', 'Error al reintentar solicitud:', retryError);
            // Si el reintento falla, eliminar el token
            localStorage.removeItem('authToken');
          }
        }
      }
      
      // Mostrar alerta solo si es un error 500 y no se ha mostrado recientemente
      if (error.response.status >= 500 && error.response.status < 600) {
        const currentTime = Date.now();
        
        if (!serverErrorShown || (currentTime - lastErrorTime > ERROR_COOLDOWN)) {
          serverErrorShown = true;
          lastErrorTime = currentTime;
          
          showServerErrorAlert();
          
          // Resetear el flag después del cooldown
          setTimeout(() => {
            serverErrorShown = false;
          }, ERROR_COOLDOWN);
        }
      }
    } else if (error.request) {
      // Solicitud realizada pero sin respuesta
      logger.error('API', 'Error de conexión:', error.message);
      
      // Mostrar alerta solo si no se ha mostrado recientemente
      const currentTime = Date.now();
      
      if (!serverErrorShown || (currentTime - lastErrorTime > ERROR_COOLDOWN)) {
        serverErrorShown = true;
        lastErrorTime = currentTime;
        
        showServerErrorAlert();
        
        // Resetear el flag después del cooldown
        setTimeout(() => {
          serverErrorShown = false;
        }, ERROR_COOLDOWN);
      }
    } else {
      // Error al configurar la solicitud
      logger.error('API', 'Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Exportar tipos comunes
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  pending?: boolean;
  phone?: string;
  documentId?: string;
  birthDate?: string;
  gender?: string;
  newsletter?: boolean;
}
