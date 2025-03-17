import axios from 'axios';

// Definir la URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'https://api.floresinc.com/wp-json/wc/v3';

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores de forma global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí podríamos implementar un manejo global de errores
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// Interfaces para los tipos de datos
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  image?: string;
  count?: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  regularPrice?: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  attributes?: Array<{
    name: string;
    option: string;
  }>;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  onSale: boolean;
  description: string;
  shortDescription: string;
  sku?: string;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  stockQuantity?: number;
  categories?: Category[];
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images?: string[];
  image?: string;
  gallery?: string[];
  attributes?: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
  variants?: ProductVariant[];
  relatedIds?: number[];
  featured: boolean;
  rating?: number;
  ratingCount?: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  attributes?: Array<{
    name: string;
    option: string;
  }>;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  dateCreated: string;
  total: number;
  items: CartItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  paymentMethod: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Funciones para interactuar con la API

// Productos
export const getProducts = async (params?: any): Promise<Product[]> => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: number): Promise<Product> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const response = await api.get('/products', { params: { slug } });
    if (response.data.length === 0) {
      throw new Error(`Product with slug ${slug} not found`);
    }
    return response.data[0];
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    throw error;
  }
};

export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    const response = await api.get('/products', { params: { featured: true, per_page: limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// Categorías
export const getCategories = async (params?: any): Promise<Category[]> => {
  try {
    const response = await api.get('/products/categories', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategory = async (id: number): Promise<Category> => {
  try {
    const response = await api.get(`/products/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

// Carrito
export const getCart = async (): Promise<CartItem[]> => {
  try {
    // En una implementación real, esto podría obtener el carrito del servidor
    // Por ahora, obtenemos del localStorage
    const cartItems = localStorage.getItem('cart');
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (productId: number, quantity: number, variantId?: number): Promise<CartItem[]> => {
  try {
    // En una implementación real, esto enviaría una solicitud al servidor
    // Por ahora, actualizamos el localStorage
    const cartItems = await getCart();
    
    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(
      (item) => item.id === productId && (!variantId || item.attributes?.some((attr) => attr.name === 'variant_id' && attr.option === variantId.toString()))
    );
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Obtener detalles del producto
      const product = await getProduct(productId);
      
      // Crear nuevo item
      const newItem: CartItem = {
        id: productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      };
      
      // Añadir información de variante si es necesario
      if (variantId) {
        const variant = product.variants?.find((v) => v.id === variantId);
        if (variant) {
          newItem.price = variant.price;
          newItem.attributes = [
            { name: 'variant_id', option: variantId.toString() },
            ...(variant.attributes || []),
          ];
        }
      }
      
      cartItems.push(newItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    return cartItems;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (productId: number, quantity: number, variantId?: number): Promise<CartItem[]> => {
  try {
    const cartItems = await getCart();
    
    const itemIndex = cartItems.findIndex(
      (item) => item.id === productId && (!variantId || item.attributes?.some((attr) => attr.name === 'variant_id' && attr.option === variantId.toString()))
    );
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Eliminar item si la cantidad es 0 o menos
        cartItems.splice(itemIndex, 1);
      } else {
        // Actualizar cantidad
        cartItems[itemIndex].quantity = quantity;
      }
      
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    
    return cartItems;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeCartItem = async (productId: number, variantId?: number): Promise<CartItem[]> => {
  try {
    const cartItems = await getCart();
    
    const updatedCart = cartItems.filter(
      (item) => !(item.id === productId && (!variantId || item.attributes?.some((attr) => attr.name === 'variant_id' && attr.option === variantId.toString())))
    );
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

export const clearCart = async (): Promise<CartItem[]> => {
  try {
    localStorage.removeItem('cart');
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Autenticación
export const login = async (username: string, password: string): Promise<User> => {
  try {
    const response = await api.post('/auth/login', { username, password });
    
    // Guardar token en localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data.user;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const register = async (username: string, email: string, password: string): Promise<User> => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data.user;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Eliminar token del localStorage
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    return null;
  }
};

// Órdenes
export const createOrder = async (orderData: any): Promise<Order> => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrder = async (id: number): Promise<Order> => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

export default api;
