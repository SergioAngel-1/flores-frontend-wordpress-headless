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
export const consumerKey = 'ck_ffbe931e6b1611cfc1deaa8c2c12c8c7daca4666';
export const consumerSecret = 'cs_5cb79deb6660f34684be577ceedee76c8cd6a4aa';

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
  }
});

// Interceptor para añadir los parámetros OAuth a cada solicitud
wooCommerceApi.interceptors.request.use(config => {
  // Asegurarse de que params existe
  config.params = config.params || {};
  
  // Construir la URL completa para la firma OAuth
  const urlObj = new URL(`http://flores.local/wp-json/wc/v3${config.url || ''}`);
  
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
      
      // Registrar payload de la solicitud en caso de error
      if (error.config) {
        console.log('Request data:', {
          url: error.config.url,
          method: error.config.method,
          params: error.config.params,
          data: error.config.data
        });
      }
      
      // Mostrar mensaje amigable al usuario en caso de error de servidor
      if (error.response.status === 502) {
        const currentTime = new Date().getTime();
        if (!serverErrorShown || currentTime - lastErrorTime > ERROR_COOLDOWN) {
          showServerErrorAlert();
          serverErrorShown = true;
          lastErrorTime = currentTime;
        }
      }
    } else if (error.request) {
      console.error('Error de red:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Instancia normal de axios para otras peticiones
export const axiosInstance = axios.create({
  timeout: 10000
});

// Interceptor para añadir token JWT a las peticiones autenticadas
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  
  // Si hay token JWT disponible y la url contiene wp-json, añadirlo a las cabeceras
  if (token && config.url && config.url.includes('/wp-json/')) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});

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
