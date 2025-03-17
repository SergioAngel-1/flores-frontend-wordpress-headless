import axios from 'axios';
import { Product, Category } from '../types/woocommerce';

// Obtener las claves de la API de WooCommerce
const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET;
const apiUrl = import.meta.env.VITE_WP_API_URL;

// Configuración base de Axios para WooCommerce API
const wooCommerceApi = axios.create({
  baseURL: `${apiUrl}/wp-json/wc/v3`,
});

// Interceptor para añadir las credenciales a cada solicitud
wooCommerceApi.interceptors.request.use(config => {
  // Asegurarse de que params existe
  config.params = config.params || {};
  
  // Añadir las credenciales a los parámetros
  config.params.consumer_key = consumerKey;
  config.params.consumer_secret = consumerSecret;
  
  return config;
});

// Interceptor para manejar errores
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
    } else if (error.request) {
      console.error('Error de red:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Servicio para productos
export const productService = {
  getAll: (params = {}) => wooCommerceApi.get<Product[]>('/products', { params }),
  getById: (id: number) => wooCommerceApi.get<Product>(`/products/${id}`),
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
      } 
    }),
};

// Servicio para categorías
export const categoryService = {
  getAll: (params = {}) => wooCommerceApi.get<Category[]>('/products/categories', { params }),
};

// Servicio para el carrito (simulado localmente)
export const cartService = {
  items: [] as Product[],
  
  addItem: (product: Product) => {
    cartService.items.push(product);
    localStorage.setItem('cart', JSON.stringify(cartService.items));
  },
  
  removeItem: (productId: number) => {
    const index = cartService.items.findIndex(item => item.id === productId);
    if (index !== -1) {
      cartService.items.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cartService.items));
    }
  },
  
  getItems: () => {
    try {
      const storedItems = localStorage.getItem('cart');
      if (storedItems) {
        cartService.items = JSON.parse(storedItems);
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
    return cartService.items;
  },
  
  getItemCount: () => {
    cartService.getItems();
    return cartService.items.length;
  },
  
  clearCart: () => {
    cartService.items = [];
    localStorage.removeItem('cart');
  }
};

// Servicio para pedidos
export const orderService = {
  createOrder: (orderData: any) => 
    wooCommerceApi.post('/orders', orderData),
  
  getOrderById: (id: number) => 
    wooCommerceApi.get(`/orders/${id}`),
  
  getCustomerOrders: (customerId: number) => 
    wooCommerceApi.get('/orders', { 
      params: { customer: customerId } 
    }),
};

export default {
  productService,
  categoryService,
  cartService,
  orderService
};
