import { api, wooCommerceApi } from './apiConfig';

// Interfaces y tipos
interface User {
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

// Servicio de autenticación de WordPress
const authService = {
  // Iniciar sesión con WordPress
  login(identifier: string, password: string): Promise<User> {
    return api.post('/jwt-auth/v1/token', {
      username: identifier,
      password: password
    })
      .then(response => {
        const { token } = response.data;
        
        // Guardar token en localStorage (usar authToken para consistencia)
        localStorage.setItem('authToken', token);
        
        // Obtener datos del usuario autenticado
        return this.getCurrentUser();
      })
      .catch(error => {
        console.error('Error en login:', error);
        
        // Mensajes de error más descriptivos
        if (error.response) {
          if (error.response.status === 403) {
            throw new Error('Usuario o contraseña incorrectos');
          } else if (error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
          }
        }
        
        throw new Error('Error al intentar iniciar sesión');
      });
  },
  
  // Registro de usuario
  register(username: string, email: string, password: string, phone?: string, referralCode?: string) {
    const userData = {
      username,
      email,
      password,
      phone,
      referral_code: referralCode
    };
    
    return api.post('/floresinc/v1/register', userData)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.error('Error en registro:', error);
        throw error;
      });
  },
  
  // Comprobar si el usuario está autenticado
  isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
  },
  
  // Obtener el usuario actual
  getCurrentUser(): Promise<User> {
    if (!this.isAuthenticated()) {
      return Promise.reject(new Error('No hay usuario autenticado'));
    }
    
    return api.get('/wp/v2/users/me')
      .then(response => {
        // Transformar respuesta de WP a nuestro formato de Usuario
        const wpUser = response.data;
        
        // Obtener meta datos adicionales del usuario
        return api.get(`/floresinc/v1/user/${wpUser.id}/profile`)
          .then(profileResponse => {
            const profileData = profileResponse.data;
            
            const user: User = {
              id: wpUser.id,
              username: wpUser.slug,
              email: wpUser.email || '',
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              displayName: wpUser.name,
              phone: profileData.phone || '',
              documentId: profileData.document_id || '',
              birthDate: profileData.birth_date || '',
              gender: profileData.gender || '',
              newsletter: profileData.newsletter === '1',
            };
            
            return user;
          });
      })
      .catch(error => {
        console.error('Error al obtener usuario actual:', error);
        
        if (error.response && error.response.status === 401) {
          // Token inválido o expirado, cerrar sesión
          this.logout();
        }
        
        throw error;
      });
  },
  
  // Cerrar sesión
  logout() {
    localStorage.removeItem('authToken');
  }
};

// Servicio para productos
const productService = {
  getAll(params = {}) {
    return api.get('/wc/v3/products', { params });
  },
  getById(id: number) {
    return api.get(`/wc/v3/products/${id}`);
  },
  getBySlug(slug: string) {
    return api.get(`/wc/v3/products?slug=${slug}`);
  },
  getByCategory(categoryId: number, params = {}) {
    const queryParams = {
      category: categoryId,
      ...params
    };
    
    return api.get('/wc/v3/products', { params: queryParams });
  },
  search(searchTerm: string, params = {}) {
    const queryParams = {
      search: searchTerm,
      ...params
    };
    
    return api.get('/wc/v3/products', { params: queryParams });
  },
  // Obtener productos recomendados (API personalizada)
  getRecommended(limit = 6) {
    return api.get('/floresinc/v1/recommended-products', {
      params: { limit }
    });
  }
};

// Servicio para categorías
const categoryService = {
  getAll(params = {}) {
    return api.get('/wc/v3/products/categories', { 
      params: {
        ...params,
        per_page: 100 // Obtener más categorías por defecto
      } 
    });
  },
  getById(id: number) {
    return api.get(`/wc/v3/products/categories/${id}`);
  },
  getBySlug(slug: string) {
    return api.get(`/wc/v3/products/categories?slug=${slug}`)
      .then(response => {
        if (response.data && response.data.length > 0) {
          return response.data[0];
        } else {
          throw new Error('Categoría no encontrada');
        }
      })
      .catch(error => {
        console.error(`Error al obtener categoría por slug ${slug}:`, error);
        throw error;
      });
  },
  // Obtener categorías destacadas (API personalizada)
  getFeatured() {
    return api.get('/floresinc/v1/featured-categories');
  }
};

// Servicio de carrito
const cartService = {
  // Obtener los items del carrito
  getItems() {
    const cartData = localStorage.getItem('cart');
    
    if (!cartData) {
      return [];
    }
    
    try {
      return JSON.parse(cartData);
    } catch (error) {
      console.error('Error al parsear datos del carrito:', error);
      return [];
    }
  },
  
  // Añadir un item al carrito
  addItem(product: any, quantity: number = 1) {
    const cartItems = this.getItems();
    
    // Asegurarnos de que el precio esté en formato numérico
    let price = product.price;
    if (typeof price === 'string') {
      // Eliminar primero el prefijo de moneda y espacios
      price = price.replace(/COP\s*/, '').trim();
      
      // Si tiene puntos como separadores de miles (formato Colombia)
      if (price.includes('.') && price.indexOf('.') < price.lastIndexOf('.')) {
        // Formato tipo 19.000 -> Quitar los puntos
        price = price.replace(/\./g, '');
      }
      
      // Si usa comas como separadores de miles y hay al menos una
      if (price.includes(',') && price.indexOf(',') < price.length - 3) {
        // Formato tipo 19,000 -> Quitar las comas
        price = price.replace(/,/g, '');
      }
    }
    
    // Verificar si el producto ya existe en el carrito
    const existingItemIndex = cartItems.findIndex(
      (item: any) => item.product_id === product.id
    );
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Añadir nuevo item si no existe
      cartItems.push({
        product_id: product.id,
        product_name: product.name,
        price: price,
        regular_price: product.regular_price || '',
        sale_price: product.sale_price || '',
        image: product.images && product.images.length > 0 ? product.images[0].src : '',
        quantity: quantity
      });
    }
    
    // Guardar carrito actualizado
    localStorage.setItem('cart', JSON.stringify(cartItems));
    return cartItems;
  },
  
  // Actualizar la cantidad de un item
  updateItemQuantity(productId: number, quantity: number) {
    const cartItems = this.getItems();
    
    // Encontrar el índice del producto
    const itemIndex = cartItems.findIndex(
      (item: any) => item.product_id === productId
    );
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, eliminar el item
        cartItems.splice(itemIndex, 1);
      } else {
        // Actualizar cantidad
        cartItems[itemIndex].quantity = quantity;
      }
      
      // Guardar carrito actualizado
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    
    return cartItems;
  },
  
  // Eliminar un item del carrito
  removeItem(productId: number) {
    const cartItems = this.getItems().filter(
      (item: any) => item.product_id !== productId
    );
    
    // Guardar carrito actualizado
    localStorage.setItem('cart', JSON.stringify(cartItems));
    return cartItems;
  },
  
  // Limpiar el carrito
  clearCart() {
    localStorage.removeItem('cart');
    return [];
  },
  
  // Obtener el número de items en el carrito
  getItemCount() {
    const cartItems = this.getItems();
    return cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
  },
  
  // Obtener el total del carrito
  getTotal() {
    const cartItems = this.getItems();
    
    // Usar una implementación más robusta para el cálculo del total
    try {
      const total = cartItems.reduce((total: number, item: any) => {
        // Si no hay precio o cantidad, saltar el item
        if (!item.price || !item.quantity) return total;
        
        // Procesar el precio si es una cadena
        let priceValue = 0;
        if (typeof item.price === 'string') {
          // Eliminar 'COP' y espacios
          let priceStr = item.price.replace(/COP\s*/i, '').trim();
          
          // Reemplazar puntos (separadores de miles en formato colombiano)
          // Ejemplo: "19.000" -> "19000"
          priceStr = priceStr.replace(/\./g, '');
          
          // Intentar convertir a número (considerando que puede tener coma decimal)
          priceValue = parseFloat(priceStr.replace(',', '.'));
        } else if (typeof item.price === 'number') {
          priceValue = item.price;
        }
        
        // Asegurarse de que la cantidad sea un número
        const quantity = parseInt(String(item.quantity), 10) || 0;
        
        // Calcular el subtotal para este item
        const subtotal = priceValue * quantity;
        
        console.log('Procesando item para total:', {
          nombre: item.product_name,
          precio_original: item.price,
          precio_procesado: priceValue,
          cantidad: quantity,
          subtotal: subtotal
        });
        
        // Acumular al total
        return total + subtotal;
      }, 0);
      
      console.log('Total final calculado:', total);
      return total;
    } catch (error) {
      console.error('Error al calcular total del carrito:', error);
      return 0; // Valor seguro en caso de error
    }
  }
};

// Servicio para pedidos
const orderService = {
  // Crear un nuevo pedido en WooCommerce
  createOrder(orderData: any) {
    return api.post('/wc/v3/orders', orderData);
  },
  
  // Obtener un pedido por su ID
  getOrderById(id: number) {
    return api.get(`/wc/v3/orders/${id}`);
  },
  
  // Obtener los pedidos de un cliente
  getCustomerOrders(customerId: number) {
    return api.get('/wc/v3/orders', {
      params: {
        customer: customerId
      }
    });
  },
  
  // Actualizar el estado de un pedido
  updateOrderStatus(orderId: number, status: string) {
    return api.put(`/wc/v3/orders/${orderId}`, { status });
  }
};

// Servicio para puntos y referidos
const pointsService = {
  /**
   * Obtiene los Flores Coins del usuario actual
   */
  getUserPoints() {
    return api.get('/floresinc/v1/points');
  },
  
  /**
   * Obtiene las estadísticas de referidos del usuario
   */
  getReferralStats() {
    return api.get('/floresinc/v1/referrals/stats');
  },
  
  /**
   * Obtiene el historial de transacciones de Flores Coins del usuario
   */
  getPointsTransactions(page = 1) {
    return api.get('/floresinc/v1/points/transactions', {
      params: { page }
    });
  },
  
  /**
   * Obtiene el código de referido
   */
  getReferralCode() {
    return api.get('/floresinc/v1/referrals/code');
  },
  
  /**
   * Obtiene información del referido por código
   */
  getReferrerByCode(code: string) {
    if (!code) {
      return Promise.reject(new Error('El código de referido es obligatorio'));
    }
    
    return api.get(`/floresinc/v1/referrals/code/${code}`)
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.error('Error al obtener información del referido:', error);
        
        if (error.response && error.response.status === 404) {
          throw new Error('Código de referido no válido');
        }
        
        throw new Error('Error al verificar el código de referido');
      });
  },
  
  /**
   * Valida si un código de referido existe y devuelve información del usuario asociado
   */
  validateReferralCode(code: string) {
    if (!code) {
      return Promise.reject(new Error('El código de referido es obligatorio'));
    }
    
    return api.get(`/floresinc/v1/referrals/validate/${code}`)
      .then(response => {
        return { 
          valid: true, 
          referrer: response.data 
        };
      })
      .catch(error => {
        console.error('Error al validar código de referido:', error);
        return { valid: false, error: error.message };
      });
  },
  
  /**
   * Transfiere Flores Coins a otro usuario utilizando su código de referido
   */
  transferPoints(recipientCode: string, pointsAmount: number, notes: string = '') {
    if (!recipientCode) {
      return Promise.reject(new Error('El código de referido es obligatorio'));
    }
    
    if (!pointsAmount || pointsAmount <= 0) {
      return Promise.reject(new Error('La cantidad de puntos debe ser mayor a 0'));
    }
    
    return api.post('/floresinc/v1/user/points/transfer', {
      recipient_code: recipientCode,
      points: pointsAmount,
      notes
    });
  }
};

// Servicio para catálogos
const catalogService = {
  // Obtener todos los catálogos
  getAll() {
    return api.get('/floresinc/v1/catalog');
  },
  
  // Obtener un catálogo por su ID
  getById(id: number) {
    return api.get(`/floresinc/v1/catalog/${id}`);
  },
  
  // Obtener los productos de un catálogo
  getCatalogProducts(catalogId: number) {
    return api.get(`/floresinc/v1/catalog/${catalogId}/products`);
  },

  // Obtener todos los productos personalizados de un catálogo
  getCustomProducts(catalogId: number) {
    return api.get(`/floresinc/v1/catalog/${catalogId}/custom-products`);
  },

  // Obtener la configuración del catálogo (nombre, descripción, etc.)
  getCatalogConfig(catalogId: number) {
    return api.get(`/floresinc/v1/catalog/${catalogId}/config`);
  },

  // Generar el PDF del catálogo
  generatePDF(catalogId: number) {
    return api.get(`/floresinc/v1/catalog/${catalogId}/pdf`, { 
      responseType: 'blob' 
    });
  }
};

// Servicio para banners
const bannerService = {
  // Obtener todos los banners
  getAll() {
    return api.get('/floresinc/v1/banners');
  },
  
  // Obtener banners por tipo
  getByType(type: string) {
    return api.get(`/floresinc/v1/banners/${type}`);
  }
};

// Servicio para secciones de inicio
const homeSectionService = {
  // Obtener todas las secciones
  getAll() {
    return api.get('/floresinc/v1/home-sections');
  },
  
  // Obtener productos de una sección específica
  getSectionProducts(sectionId: string) {
    return api.get(`/floresinc/v1/home-sections/${sectionId}`);
  }
};

// Servicio para contenido legal
const legalService = {
  getPrivacyPolicy() {
    return api.get('/floresinc/v1/legal/privacy_policy');
  },
  
  getTermsConditions() {
    return api.get('/floresinc/v1/legal/terms_conditions');
  }
};

// Exportar los servicios y la API
export {
  api,
  wooCommerceApi,
  authService,
  productService,
  categoryService,
  cartService,
  orderService,
  pointsService,
  catalogService,
  bannerService,
  homeSectionService,
  legalService
};
