import axios from 'axios';
import * as CryptoJS from 'crypto-js';
//@ts-ignore
import OAuth from 'oauth-1.0a';
import { showServerErrorAlert } from './alertService';

// Variables para controlar los errores de servidor
let serverErrorShown = false;
let lastErrorTime = 0;
const ERROR_COOLDOWN = 10000; // 10 segundos entre alertas

// Claves para WooCommerce API (OAuth)
export const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY || 'ck_ffbe931e6b1611cfc1deaa8c2c12c8c7daca4666';
export const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET || 'cs_5cb79deb6660f34684be577ceedee76c8cd6a4aa';

// Obtener la URL base de las variables de entorno o usar un valor predeterminado
export const baseApiUrl = import.meta.env.VITE_WP_API_URL || 'http://flores.local';

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
  baseURL: `/wp-json/wc/v3`,
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
  
  console.log('Realizando petición OAuth a:', fullUrl);
  console.log('Parámetros OAuth:', oauthData);
  
  return config;
});

// Interceptor de respuesta para manejo de errores global
wooCommerceApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Respuesta del servidor con error
      console.error(`Error ${error.response.status}:`, error.response.data);
      
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
      console.error('Error de conexión:', error.message);
      
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
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Configurar una instancia global de Axios para las demás peticiones
export const api = axios.create({
  baseURL: '/wp-json',
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
    console.log(`Petición ${config.method?.toUpperCase()} a ${config.url}`);
    return config;
  },
  error => {
    console.error('Error en la configuración de la petición:', error);
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
