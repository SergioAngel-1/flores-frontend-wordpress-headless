import axios from 'axios';
import { Product, Category } from '../types/woocommerce';
import OAuth from 'oauth-1.0a';
import CryptoJS from 'crypto-js';
import { showServerErrorAlert } from './alertService';
import * as config from '../config';

// Variables para controlar los errores de servidor
let serverErrorShown = false;
let lastErrorTime = 0;
const ERROR_COOLDOWN = 10000; // 10 segundos entre alertas

// Obtener las claves de la API de WooCommerce
const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET;
const apiUrl = config.API_URL; // Usar la URL base definida en config.ts

// Configuración de OAuth 1.0a
const oauth = new OAuth({
  consumer: {
    key: consumerKey,
    secret: consumerSecret
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    console.log('Datos para OAuth firma:', { base_string, key });
    return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
  }
});

// Función para obtener los headers de autenticación
const getAuthHeaders = (url: string, method: string) => {
  const requestData = {
    url,
    method
  };

  return oauth.authorize(requestData);
};

// Configurar axios para incluir credenciales en todas las solicitudes
axios.defaults.withCredentials = true;

// Interceptor para manejar errores de red
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en solicitud API:', error);
    
    // Solo mostrar alerta si no se ha mostrado recientemente
    const currentTime = Date.now();
    if (!serverErrorShown || (currentTime - lastErrorTime > ERROR_COOLDOWN)) {
      serverErrorShown = true;
      lastErrorTime = currentTime;
      
      // Mostrar mensaje de error al usuario
      showServerErrorAlert();
      
      // Resetear el estado después del cooldown
      setTimeout(() => {
        serverErrorShown = false;
      }, ERROR_COOLDOWN);
    }
    
    return Promise.reject(error);
  }
);

// Crear instancia de Axios para WooCommerce API
const wooCommerceApi = axios.create({
  baseURL: `${apiUrl}/wp-json/wc/v3`,
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
  const urlObj = new URL(`${apiUrl}/wp-json/wc/v3${config.url || ''}`);
  
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

// Interceptor para manejar errores en las respuestas
wooCommerceApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Error de API WooCommerce:', {
        status: error.response.status,
        data: error.response.data,
        config: {
          url: error.config.url,
          method: error.config.method,
          params: error.config.params
        }
      });
      
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

// Tipos
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  pending?: boolean;
  phone?: string;
  documentId?: string;
  birthDate?: string;
  gender?: string;
  newsletter?: boolean;
}

// Servicio de autenticación de WordPress
export const authService = {
  // Iniciar sesión con WordPress
  login: async (identifier: string, password: string): Promise<User> => {
    try {
      // Primero intentamos con JWT
      try {
        const jwtResponse = await axios.post(`${apiUrl}/jwt-auth/v1/token`, {
          username: identifier,
          password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Respuesta de login JWT:', jwtResponse.data);
        
        if (jwtResponse.data && jwtResponse.data.token) {
          // Guardamos el token en localStorage
          localStorage.setItem('wpToken', jwtResponse.data.token);
          
          // Devolvemos los datos del usuario
          return {
            id: jwtResponse.data.user_id || 0,
            username: jwtResponse.data.user_display_name || identifier,
            email: jwtResponse.data.user_email || '',
            firstName: jwtResponse.data.user_firstname || '',
            lastName: jwtResponse.data.user_lastname || '',
            pending: false
          };
        }
      } catch (jwtError) {
        console.log('JWT Auth no disponible, intentando método alternativo');
      }
      
      // Método alternativo: uso de cookies de autenticación de WordPress
      const cookieResponse = await axios.post(`${apiUrl}/wp-json/api/v1/token`, {
        username: identifier,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta de login alternativo:', cookieResponse.data);
      
      if (cookieResponse.data && cookieResponse.data.success) {
        // Para este método, WordPress debería establecer cookies automáticamente
        // Guardamos un indicador en localStorage
        localStorage.setItem('wpLoggedIn', 'true');
        
        // Devolvemos los datos del usuario
        return {
          id: cookieResponse.data.user_id || 0,
          username: cookieResponse.data.user_display_name || identifier,
          email: cookieResponse.data.user_email || '',
          firstName: cookieResponse.data.user_first_name || '',
          lastName: cookieResponse.data.user_last_name || '',
          pending: false
        };
      } else {
        // Por ahora, para permitir el desarrollo, simulamos un inicio de sesión exitoso
        console.log('Simulando login exitoso para desarrollo');
        localStorage.setItem('wpLoggedIn', 'true');
        return {
          id: 1,
          username: identifier,
          email: `${identifier}@example.com`,
          firstName: 'Usuario',
          lastName: 'de Prueba',
          pending: false
        };
      }
    } catch (error) {
      console.error('Error en el login:', error);
      
      // Solo para desarrollo, permitir login simulado
      console.log('Simulando login exitoso para desarrollo a pesar del error');
      localStorage.setItem('wpLoggedIn', 'true');
      return {
        id: 1,
        username: identifier,
        email: `${identifier}@example.com`,
        firstName: 'Usuario',
        lastName: 'de Prueba',
        pending: false
      };
      
      // En producción, descomentar esta línea:
      // throw error;
    }
  },
  
  // Registro de usuario
  register: async (username: string, email: string, password: string): Promise<any> => {
    try {
      // Añadimos el parámetro pending para que el usuario quede pendiente de aprobación
      const response = await axios.post(`${apiUrl}/wp/v2/users`, {
        username,
        email,
        password,
        pending: true,
        roles: ['pending_customer']
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(`${apiUrl}/wp/v2/users`, 'POST')
        }
      });
      
      console.log('Respuesta de registro:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  },
  
  // Comprobar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    // Verificar en desarrollo
    if (localStorage.getItem('wpLoggedIn') === 'true') {
      return true;
    }
    
    // Verificar token JWT
    const token = localStorage.getItem('wpToken');
    return !!token;
  },
  
  // Obtener el usuario actual
  getCurrentUser: async (): Promise<User> => {
    try {
      // En desarrollo, devolver usuario simulado
      if (localStorage.getItem('wpLoggedIn') === 'true' && !localStorage.getItem('wpToken')) {
        console.log('Devolviendo usuario simulado');
        return {
          id: 1,
          username: 'usuario_prueba',
          email: 'usuario@example.com',
          firstName: 'Usuario',
          lastName: 'de Prueba',
          pending: false
        };
      }
      
      // Intentar obtener el usuario con token JWT
      const response = await axios.get(`${apiUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('wpToken')}`
        }
      });
      
      console.log('Respuesta de getCurrentUser:', response.data);
      
      return {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        firstName: response.data.first_name || '',
        lastName: response.data.last_name || '',
        pending: false // Actualizar según la respuesta
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      
      // En desarrollo, simular usuario
      if (localStorage.getItem('wpLoggedIn') === 'true') {
        return {
          id: 1,
          username: 'usuario_prueba',
          email: 'usuario@example.com',
          firstName: 'Usuario',
          lastName: 'de Prueba',
          pending: false
        };
      }
      
      throw error;
    }
  },
  
  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem('wpToken');
    localStorage.removeItem('wpLoggedIn');
  },
};

// Servicio para productos
export const productService = {
  getAll: (params = {}) => wooCommerceApi.get<Product[]>('/products', { params }),
  getById: (id: number) => wooCommerceApi.get<Product>(`/products/${id}`),
  getBySlug: (slug: string) => wooCommerceApi.get<Product[]>('/products', { params: { slug } }),
  getByCategory: (categoryId: number, params = {}) => 
    wooCommerceApi.get<Product[]>('/products', { 
      params: { 
        ...params,
        category: categoryId 
      } 
    }),
  search: (searchTerm: string, params = {}) => 
    wooCommerceApi.get<Product[]>('/products', { 
      params: { 
        ...params,
        search: searchTerm 
      },
      timeout: 15000
    }).catch(error => {
      // Si es un error 502, devolver un array vacío para evitar romper la UI
      if (error.response && error.response.status === 502) {
        console.log('Error 502 en búsqueda, devolviendo array vacío');
        return { data: [] };
      }
      // Para otros errores, permitir que se propaguen
      return Promise.reject(error);
    }),
};

// Servicio para categorías
export const categoryService = {
  getAll: (params = {}) => wooCommerceApi.get<Category[]>('/products/categories', { 
    params: { 
      per_page: 100,  // Aumentar el número de categorías por página
      ...params 
    } 
  }),
  getById: (id: number) => wooCommerceApi.get<Category>(`/products/categories/${id}`),
  getBySlug: (slug: string) => {
    // Intentar primero con el endpoint personalizado que maneja slugs normalizados
    return axios.get<Category[]>(`${apiUrl}/wp-json/floresinc/v1/product-categories`, { 
      params: { slug }
    }).catch(error => {
      console.error('Error al obtener categoría por slug con endpoint personalizado:', error);
      
      // Si falla, intentar con el endpoint estándar de WooCommerce
      return wooCommerceApi.get<Category[]>('/products/categories', { 
        params: { slug }
      });
    });
  },
};

// Servicio de carrito
export const cartService = {
  // Obtener los items del carrito
  getItems() {
    try {
      const cartItems = localStorage.getItem('cart_items');
      if (!cartItems) return [];
      
      // Parsear los items del carrito
      const parsedItems = JSON.parse(cartItems);
      
      // Asegurarse de que cada item tenga la estructura correcta { product: {...}, quantity: number }
      return parsedItems.map((item: any) => {
        // Si ya tiene la estructura correcta, devolverlo tal cual
        if (item.product && typeof item.quantity === 'number') {
          return item;
        }
        
        // Si tiene la estructura antigua, convertirlo al nuevo formato
        if (item.id) {
          return {
            product: {
              id: item.id,
              name: item.name,
              price: item.price,
              images: item.image ? [{ src: item.image }] : [],
              short_description: ''
            },
            quantity: item.quantity || 1
          };
        }
        
        // Si no tiene una estructura reconocible, ignorarlo
        return null;
      }).filter(Boolean); // Eliminar los items nulos
    } catch (error) {
      console.error('Error al obtener los items del carrito:', error);
      return [];
    }
  },

  // Añadir un item al carrito
  addItem(product: any, quantity: number = 1) {
    try {
      const cartItems = this.getItems();
      const existingItemIndex = cartItems.findIndex((item: any) => 
        item.product && item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        cartItems.push({
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images || [],
            short_description: product.short_description || ''
          },
          quantity
        });
      }

      localStorage.setItem('cart_items', JSON.stringify(cartItems));
      return cartItems;
    } catch (error) {
      console.error('Error al añadir item al carrito:', error);
      return this.getItems();
    }
  },

  // Actualizar la cantidad de un item
  updateItemQuantity(productId: number, quantity: number) {
    try {
      const cartItems = this.getItems();
      const itemIndex = cartItems.findIndex((item: any) => 
        item.product && item.product.id === productId
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cartItems.splice(itemIndex, 1);
        } else {
          cartItems[itemIndex].quantity = quantity;
        }
        localStorage.setItem('cart_items', JSON.stringify(cartItems));
      }

      return cartItems;
    } catch (error) {
      console.error('Error al actualizar cantidad de item:', error);
      return this.getItems();
    }
  },

  // Eliminar un item del carrito
  removeItem(productId: number) {
    try {
      const cartItems = this.getItems();
      const updatedItems = cartItems.filter((item: any) => 
        !(item.product && item.product.id === productId)
      );
      localStorage.setItem('cart_items', JSON.stringify(updatedItems));
      return updatedItems;
    } catch (error) {
      console.error('Error al eliminar item del carrito:', error);
      return this.getItems();
    }
  },

  // Limpiar el carrito
  clearCart() {
    try {
      localStorage.removeItem('cart_items');
      return [];
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
      return this.getItems();
    }
  },

  // Obtener el número de items en el carrito
  getItemCount() {
    try {
      const cartItems = this.getItems();
      return cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error al obtener cantidad de items:', error);
      return 0;
    }
  },

  // Obtener el total del carrito
  getTotal() {
    try {
      const cartItems = this.getItems();
      return cartItems.reduce((total: number, item: any) => total + (item.product.price * item.quantity), 0);
    } catch (error) {
      console.error('Error al obtener total del carrito:', error);
      return 0;
    }
  }
};

// Servicio para pedidos
export const orderService = {
  // Crear un nuevo pedido en WooCommerce
  createOrder(orderData: any) {
    console.log('Creando pedido en WooCommerce:', orderData);
    return wooCommerceApi.post('/orders', orderData);
  },
  
  // Obtener un pedido por su ID
  getOrderById(id: number) {
    return wooCommerceApi.get(`/orders/${id}`);
  },
  
  // Obtener los pedidos de un cliente
  getCustomerOrders(customerId: number) {
    return wooCommerceApi.get('/orders', {
      params: {
        customer: customerId
      }
    });
  },
  
  // Actualizar el estado de un pedido
  updateOrderStatus(orderId: number, status: string) {
    return wooCommerceApi.put(`/orders/${orderId}`, {
      status: status
    });
  }
};

// Servicio para puntos y referidos
export const pointsService = {
  // Obtener puntos del usuario
  getUserPoints() {
    return axios.get(`${apiUrl}/wp-json/floresinc/v1/points`, {
      withCredentials: true
    });
  },
  
  // Obtener transacciones de puntos
  getTransactions(page = 1) {
    return axios.get(`${apiUrl}/wp-json/floresinc/v1/points/transactions`, {
      params: { page },
      withCredentials: true
    });
  },
  
  // Obtener estadísticas de referidos
  getReferralStats() {
    return axios.get(`${apiUrl}/wp-json/floresinc/v1/referrals/stats`, {
      withCredentials: true
    });
  },
  
  // Obtener código de referido
  getReferralCode() {
    return axios.get(`${apiUrl}/wp-json/floresinc/v1/referrals/code`, {
      withCredentials: true
    });
  }
};

export default {
  productService,
  categoryService,
  cartService,
  orderService,
  authService,
  pointsService
};
