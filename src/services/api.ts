import { api, wooCommerceApi, baseApiUrl } from './apiConfig';

// Imprimir información de configuración
console.log(`API configurada con URL base: ${baseApiUrl}`);

// Interfaces y tipos
export interface Address {
  id: number | string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface User {
  id: number;
  username?: string;
  name?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  documentId?: string;
  pending?: boolean;
  birthDate?: string;
  gender?: string;
  newsletter?: boolean;
  addresses?: Address[];
  defaultAddress?: Address | null;
}

// Función para extraer mensajes de error legibles
const getReadableErrorMessage = (error: any): string => {
  if (error.response) {
    // El servidor respondió con un código de error
    if (error.response.status === 403) {
      return 'Usuario o contraseña incorrectos';
    } else if (error.response.data && typeof error.response.data === 'string' && error.response.data.includes('error crítico')) {
      return 'Error en el servidor WordPress. Por favor, contacte al administrador.';
    } else if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    } else if (error.response.status === 500) {
      return 'Error interno del servidor. Por favor, intente más tarde.';
    }
  } else if (error.request) {
    // La petición fue realizada pero no se recibió respuesta
    return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
  }
  
  // Error general
  return 'Error al procesar la solicitud. Por favor, intente nuevamente.';
};

// Servicio de autenticación de WordPress
const authService = {
  // Iniciar sesión con WordPress
  login(identifier: string, password: string): Promise<User> {
    console.log('Iniciando sesión con:', { identifier });
    
    // Implementación alternativa para intentar solucionar el problema de autenticación
    return new Promise((resolve, reject) => {
      // Usar URL directa para evitar problemas de enrutamiento
      api.post('/jwt-auth/v1/token', {
        username: identifier,
        password: password
      })
      .then(response => {
        console.log('Respuesta de login recibida:', response.status);
        
        // Guardar token en localStorage
        if (response.data && response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          console.log('Token guardado en localStorage');
          
          // Establecer el token para futuras peticiones
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          // Construir usuario minimo con la información disponible
          const minimalUser: User = {
            id: response.data.user_id || 0,
            username: response.data.user_nicename || identifier,
            email: response.data.user_email || '',
            firstName: '',
            lastName: '',
            displayName: response.data.user_display_name || identifier
          };
          
          // Intentar obtener datos completos del usuario
          this.getCurrentUser()
            .then(user => {
              console.log('Datos completos del usuario obtenidos');
              resolve(user);
            })
            .catch(error => {
              console.warn('No se pudieron obtener datos completos del usuario, usando datos mínimos', error);
              resolve(minimalUser);
            });
        } else {
          console.error('La respuesta no contiene un token válido:', response.data);
          reject(new Error('No se recibió un token válido del servidor'));
        }
      })
      .catch(error => {
        console.error('Error en login:', error);
        
        // Comprobar si a pesar del error 500 se ha establecido un token (esto puede ocurrir en algunos casos)
        const token = localStorage.getItem('authToken');
        
        if (token) {
          console.log('Se encontró un token en localStorage a pesar del error de API');
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Intentar obtener datos del usuario para ver si el token es válido
          this.getCurrentUser()
            .then(user => {
              console.log('El token parece ser válido a pesar del error 500, usuario obtenido');
              resolve(user);
            })
            .catch(userError => {
              console.error('El token no es válido a pesar de existir', userError);
              localStorage.removeItem('authToken');
              reject(error);
            });
        } else {
          // Usar función de ayuda para obtener mensajes de error legibles
          const errorMessage = getReadableErrorMessage(error);
          reject(new Error(errorMessage));
        }
      });
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
  
  // Verificar la validez del token y refrescar datos del usuario si es necesario
  async verifyToken(): Promise<boolean> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('No hay token para verificar');
      return false;
    }
    
    try {
      // Asegurar que el token está configurado en los headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Intentar obtener datos básicos del usuario para verificar el token
      const response = await api.get('/wp/v2/users/me');
      
      if (response.data && response.data.id) {
        console.log('Token verificado correctamente');
        return true;
      } else {
        console.warn('Respuesta de verificación de token sin ID de usuario');
        return false;
      }
    } catch (error: any) {
      console.error('Error al verificar token:', error);
      
      // Si el error es de autenticación, eliminar el token
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Token inválido, eliminando...');
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
      }
      
      return false;
    }
  },
  
  // Obtener el usuario actual
  getCurrentUser(): Promise<User> {
    console.log('Obteniendo usuario actual...');
    
    // Verificar si hay un token de autenticación
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('getCurrentUser: No hay token de autenticación');
      return Promise.reject(new Error('No hay usuario autenticado'));
    }
    
    // Asegurar que el token está configurado en los headers
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    return new Promise((resolve, reject) => {
      // Primero intentar obtener los datos básicos del usuario
      api.get('/wp/v2/users/me')
        .then(response => {
          // Transformar respuesta de WP a nuestro formato de Usuario
          const wpUser = response.data;
          console.log('Datos de usuario obtenidos:', wpUser.id);
          
          // Verificar si tenemos direcciones en la respuesta
          const addresses = wpUser.addresses || [];
          const defaultAddress = wpUser.defaultAddress || null;
          
          console.log('Direcciones obtenidas:', addresses.length);
          console.log('Dirección predeterminada:', defaultAddress ? 'Sí' : 'No');
          
          // Usuario básico con la información disponible
          const basicUser: User = {
            id: wpUser.id,
            username: wpUser.slug || wpUser.name,
            email: wpUser.email || '',
            firstName: wpUser.first_name || '',
            lastName: wpUser.last_name || '',
            displayName: wpUser.name,
            pending: false,
            addresses: addresses,
            defaultAddress: defaultAddress
          };
          
          // Intentar obtener meta datos adicionales del usuario
          // Corregido: Usar el endpoint correcto que está disponible en el backend
          api.get('/floresinc/v1/user/profile')
            .then(profileResponse => {
              const profileData = profileResponse.data;
              console.log('Perfil de usuario obtenido');
              
              // Si no tenemos direcciones en la respuesta básica, intentar obtenerlas explícitamente
              let addressesPromise = Promise.resolve({ data: addresses });
              if (!addresses || addresses.length === 0) {
                console.log('Obteniendo direcciones explícitamente...');
                addressesPromise = api.get('/floresinc/v1/user/addresses');
              }
              
              addressesPromise
                .then(addressesResponse => {
                  const userAddresses = addressesResponse.data || [];
                  
                  // Determinar la dirección predeterminada
                  let userDefaultAddress = defaultAddress;
                  if (!userDefaultAddress && userAddresses.length > 0) {
                    userDefaultAddress = userAddresses.find((addr: Address) => addr.isDefault) || userAddresses[0];
                  }
                  
                  // Completar el usuario con los datos del perfil y direcciones
                  const fullUser: User = {
                    ...basicUser,
                    phone: profileData.phone || '',
                    documentId: profileData.documentId || profileData.document_id || '',
                    birthDate: profileData.birthDate || '',
                    gender: profileData.gender || '',
                    newsletter: profileData.newsletter === '1' || profileData.newsletter === true,
                    pending: profileData.pending === '1' || profileData.pending === true,
                    addresses: userAddresses,
                    defaultAddress: userDefaultAddress
                  };
                  
                  resolve(fullUser);
                })
                .catch(addressesError => {
                  console.warn('Error al obtener direcciones:', addressesError);
                  // Si falla al obtener direcciones, usar los datos que ya tenemos
                  const fullUser: User = {
                    ...basicUser,
                    phone: profileData.phone || '',
                    documentId: profileData.documentId || profileData.document_id || '',
                    birthDate: profileData.birthDate || '',
                    gender: profileData.gender || '',
                    newsletter: profileData.newsletter === '1' || profileData.newsletter === true,
                    pending: profileData.pending === '1' || profileData.pending === true
                  };
                  
                  resolve(fullUser);
                });
            })
            .catch(profileError => {
              console.warn('Error al obtener perfil, usando datos básicos:', profileError);
              
              // Si falla al obtener el perfil, intentar obtener al menos las direcciones
              api.get('/floresinc/v1/user/addresses')
                .then(addressesResponse => {
                  const userAddresses = addressesResponse.data || [];
                  
                  // Determinar la dirección predeterminada
                  let userDefaultAddress = defaultAddress;
                  if (!userDefaultAddress && userAddresses.length > 0) {
                    userDefaultAddress = userAddresses.find((addr: Address) => addr.isDefault) || userAddresses[0];
                  }
                  
                  // Actualizar el usuario con las direcciones
                  basicUser.addresses = userAddresses;
                  basicUser.defaultAddress = userDefaultAddress;
                  
                  resolve(basicUser);
                })
                .catch(addressesError => {
                  console.warn('Error al obtener direcciones:', addressesError);
                  // Si falla todo, devolver datos básicos
                  resolve(basicUser);
                });
            });
        })
        .catch(error => {
          console.error('Error al obtener usuario:', error);
          
          if (error.response && error.response.status === 403) {
            // Token inválido o expirado
            console.log('Token inválido o expirado, eliminando...');
            localStorage.removeItem('authToken');
            delete api.defaults.headers.common['Authorization'];
          }
          
          reject(error);
        });
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
  getAll(params = {}) {
    return api.get('/floresinc/v1/catalogs', { params })
      .then(response => response.data)
      .catch(error => {
        console.error('Error al obtener catálogos:', error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Obtener un catálogo por su ID
  getById(id: number) {
    return api.get(`/floresinc/v1/catalogs/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al obtener catálogo ${id}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Obtener los productos de un catálogo
  getCatalogProducts(catalogId: number) {
    return api.get(`/floresinc/v1/catalogs/${catalogId}/products`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al obtener productos del catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Obtener la configuración del catálogo (nombre, descripción, etc.)
  getCatalogConfig(catalogId: number) {
    return api.get(`/floresinc/v1/catalogs/${catalogId}/config`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al obtener configuración del catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Crear un nuevo catálogo
  create(data: { name: string, products: { id: number, catalog_price?: number | null }[] }) {
    console.log('API - Enviando solicitud para crear catálogo:', data);
    return api.post('/floresinc/v1/catalogs', data)
      .then(response => {
        console.log('API - Respuesta de creación de catálogo:', response);
        // Asegurarse de que estamos devolviendo los datos de la respuesta, no toda la respuesta
        return response.data;
      })
      .catch(error => {
        console.error('API - Error al crear catálogo:', error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Actualizar un catálogo existente
  update(catalogId: number, data: { name?: string, products?: { id: number, catalog_price?: number | null }[] }) {
    return api.put(`/floresinc/v1/catalogs/${catalogId}`, data)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al actualizar catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Eliminar un catálogo
  delete(catalogId: number) {
    return api.delete(`/floresinc/v1/catalogs/${catalogId}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al eliminar catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },
  
  // Actualizar un producto de un catálogo
  updateCatalogProduct(catalogId: number, productData: { id: number, catalog_price?: number | null }) {
    return api.put(`/floresinc/v1/catalogs/${catalogId}/products/${productData.id}`, productData);
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
