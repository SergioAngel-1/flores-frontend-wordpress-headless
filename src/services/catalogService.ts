import { api } from './api';
import { CreateCustomProductData, CatalogProductInput } from '../types/catalog';
import logger from '../utils/logger';

// Función para extraer mensajes de error legibles
const getReadableErrorMessage = (error: any): string => {
  if (error.response) {
    // La solicitud se realizó y el servidor respondió con un código de estado fuera del rango 2xx
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    return `Error ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    return 'No se recibió respuesta del servidor';
  } else {
    // Algo ocurrió en la configuración de la solicitud que desencadenó un error
    return error.message || 'Error desconocido';
  }
};

// Servicio para catálogos
const catalogService = {
  // Obtener todos los catálogos
  getAll() {
    return api.get('/floresinc/v1/catalogs')
      .then(response => {
        // Extraer los datos correctamente de la respuesta
        const responseData = response.data;
        
        // Verificar si los datos están anidados en una propiedad 'data'
        if (responseData && responseData.status === 'success' && Array.isArray(responseData.data)) {
          console.log('Catálogos obtenidos correctamente:', responseData.data);
          return responseData.data;
        }
        
        // Si no están anidados, devolver la respuesta directamente
        return responseData;
      })
      .catch(error => {
        console.error('Error al obtener catálogos:', error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Obtener un catálogo específico por ID
  getById(catalogId: number) {
    return api.get(`/floresinc/v1/catalogs/${catalogId}`)
      .then(response => {
        const responseData = response.data;
        
        // Verificar si los datos están anidados en una propiedad 'data'
        if (responseData && responseData.status === 'success' && responseData.data) {
          console.log(`Catálogo ${catalogId} obtenido correctamente:`, responseData.data);
          return responseData.data;
        }
        
        // Si no están anidados, devolver la respuesta directamente
        return responseData;
      })
      .catch(error => {
        console.error(`Error al obtener catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Obtener productos de un catálogo
  getProducts(catalogId: number) {
    return api.get(`/floresinc/v1/catalogs/${catalogId}/products`)
      .then(response => {
        const responseData = response.data;
        
        // Verificar si los datos están anidados en una propiedad 'data'
        if (responseData && responseData.status === 'success' && responseData.data) {
          console.log(`Productos del catálogo ${catalogId} obtenidos correctamente:`, responseData.data);
          return responseData.data;
        }
        
        // Si no están anidados, devolver la respuesta directamente
        return responseData;
      })
      .catch(error => {
        console.error(`Error al obtener productos del catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Obtener productos completos de un catálogo (con toda la información necesaria para mostrar)
  getCompleteProducts(catalogId: number) {
    return api.get(`/floresinc/v1/catalogs/${catalogId}/complete-products`)
      .then(response => {
        const responseData = response.data;
        
        // Verificar si los datos están anidados en una propiedad 'data'
        if (responseData && responseData.status === 'success' && responseData.data) {
          console.log(`Productos completos del catálogo ${catalogId} obtenidos correctamente:`, responseData.data);
          return responseData.data;
        }
        
        // Si no están anidados, devolver la respuesta directamente
        return responseData;
      })
      .catch(error => {
        console.error(`Error al obtener productos completos del catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Crear un nuevo catálogo
  create(data: { name: string, products: CatalogProductInput[], logoUrl?: string }) {
    console.log('Datos recibidos para crear catálogo:', data);
    
    // Separar los productos personalizados no guardados de los productos regulares
    const customUnsavedProducts = data.products.filter(p => p.is_custom && p.unsaved_data);
    const regularProducts = data.products.filter(p => !p.is_custom || !p.unsaved_data);
    
    // Datos para enviar al endpoint de creación de catálogo
    const catalogData = {
      name: data.name,
      logo_url: data.logoUrl || '',
      products: regularProducts
    };
    
    console.log('Datos a enviar al endpoint de catálogo:', catalogData);
    console.log('Productos personalizados a crear:', customUnsavedProducts);
    
    return api.post('/floresinc/v1/catalogs', catalogData)
      .then(async response => {
        // Si hay productos personalizados sin guardar, crearlos ahora
        if (customUnsavedProducts.length > 0 && response.data && response.data.id) {
          const catalogId = response.data.id;
          
          console.log(`Creando ${customUnsavedProducts.length} productos personalizados para el catálogo ${catalogId}`);
          
          // Crear cada producto personalizado
          const createPromises = customUnsavedProducts.map(product => {
            if (product.unsaved_data) {
              const customProductData = {
                ...product.unsaved_data,
                catalog_id: catalogId,
                is_custom: true // Marcar explícitamente como producto personalizado
              };
              
              console.log('Datos de producto personalizado a enviar:', customProductData);
              
              return api.post('/floresinc/v1/catalogs/custom-products', customProductData)
                .then(response => {
                  console.log('Respuesta de creación de producto personalizado:', response.data);
                  return response.data;
                })
                .catch(error => {
                  console.error('Error al crear producto personalizado:', error);
                  return null; // Continuar con los demás aunque uno falle
                });
            }
            return Promise.resolve(null);
          });
          
          // Esperar a que todos los productos personalizados se creen
          const createdProducts = await Promise.all(createPromises);
          console.log('Productos personalizados creados:', createdProducts);
          
          // Obtener los datos actualizados del catálogo
          return this.getById(catalogId);
        }
        
        return response.data;
      })
      .catch(error => {
        console.error('Error al crear catálogo:', error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Actualizar un catálogo existente
  update(catalogId: number, data: { name?: string, products?: CatalogProductInput[], logoUrl?: string }) {
    console.log('Datos recibidos para actualizar catálogo:', data);
    
    // Separar los productos personalizados no guardados de los productos regulares
    const customUnsavedProducts = data.products?.filter(p => p.is_custom && p.unsaved_data) || [];
    const regularProducts = data.products?.filter(p => !p.is_custom || !p.unsaved_data) || [];
    
    // Datos para enviar al endpoint de actualización de catálogo
    const catalogData: any = {};
    
    if (data.name) {
      catalogData.name = data.name;
    }
    
    if (data.logoUrl !== undefined) {
      catalogData.logo_url = data.logoUrl;
    }
    
    if (regularProducts.length > 0) {
      catalogData.products = regularProducts;
    }
    
    console.log('Datos a enviar al endpoint de actualización de catálogo:', catalogData);
    console.log('Productos personalizados a crear:', customUnsavedProducts);
    
    // Usar el método PUT para actualizar catálogos según el endpoint definido en backend
    return api.put(`/floresinc/v1/catalogs/${catalogId}`, catalogData)
      .then(async response => {
        // Si hay productos personalizados sin guardar, crearlos ahora
        if (customUnsavedProducts.length > 0) {
          console.log(`Creando ${customUnsavedProducts.length} productos personalizados para el catálogo ${catalogId}`);
          
          // Crear cada producto personalizado
          const createPromises = customUnsavedProducts.map(product => {
            if (product.unsaved_data) {
              const customProductData = {
                ...product.unsaved_data,
                catalog_id: catalogId,
                is_custom: true // Marcar explícitamente como producto personalizado
              };
              
              console.log('Datos de producto personalizado a enviar:', customProductData);
              
              return api.post('/floresinc/v1/catalogs/custom-products', customProductData)
                .then(response => {
                  console.log('Respuesta de creación de producto personalizado:', response.data);
                  return response.data;
                })
                .catch(error => {
                  console.error('Error al crear producto personalizado:', error);
                  return null; // Continuar con los demás aunque uno falle
                });
            }
            return Promise.resolve(null);
          });
          
          // Esperar a que todos los productos personalizados se creen
          const createdProducts = await Promise.all(createPromises);
          console.log('Productos personalizados creados:', createdProducts);
          
          // Obtener los datos actualizados del catálogo
          return this.getById(catalogId);
        }
        
        return response.data;
      })
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

  // Crear un producto personalizado para un catálogo
  createCustomProduct(data: CreateCustomProductData) {
    console.log('Datos recibidos para crear producto personalizado:', data);
    
    return api.post('/floresinc/v1/catalogs/custom-products', data)
      .then(response => {
        console.log('Respuesta de creación de producto personalizado:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Error al crear producto personalizado:', error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Actualizar un producto personalizado
  updateCustomProduct(productId: number, data: CreateCustomProductData) {
    return api.put(`/floresinc/v1/catalogs/custom-products/${productId}`, data)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al actualizar producto personalizado ${productId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },
  
  // Actualizar un producto específico de un catálogo
  updateCatalogProduct(catalogId: number, productData: CatalogProductInput) {
    // Logging detallado para diagnóstico
    logger.debug('catalogService', `Actualizando producto en catálogo ${catalogId}`, productData);
    
    // Asegurar que tenemos todos los IDs necesarios
    const productId = productData.product_id || productData.id;
    if (!productId) {
      logger.error('catalogService', 'Error: No se pudo determinar el ID del producto', productData);
      return Promise.reject(new Error('ID de producto no válido'));
    }
    
    // Preparar payload con la estructura correcta para el endpoint
    const payload = {
      id: productData.id,
      product_id: productId,
      catalog_price: productData.catalog_price,
      product_price: productData.product_price,
      catalog_name: productData.catalog_name || null,
      catalog_description: productData.catalog_description || null,
      catalog_short_description: productData.catalog_short_description || null,
      catalog_sku: productData.catalog_sku || null,
      catalog_image: productData.catalog_image || null,
      catalog_images: productData.catalog_images || [],
      is_custom: !!productData.is_custom
    };
    
    logger.debug('catalogService', `Enviando datos al endpoint`, payload);
    
    return api.put(`/floresinc/v1/catalogs/${catalogId}/products/${productId}`, payload)
      .then(response => {
        logger.debug('catalogService', `Producto actualizado exitosamente:`, response.data);
        return response.data;
      })
      .catch(error => {
        logger.error('catalogService', `Error al actualizar producto ${productId} en catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Eliminar un producto personalizado
  deleteCustomProduct(productId: number) {
    return api.delete(`/floresinc/v1/catalogs/custom-products/${productId}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al eliminar producto personalizado ${productId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  }
};

export default catalogService;
