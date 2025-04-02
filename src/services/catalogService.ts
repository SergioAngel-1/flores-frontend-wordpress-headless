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
      .then(response => response.data)
      .catch(error => {
        console.error('Error al obtener catálogos:', error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Obtener un catálogo específico por ID
  getById(catalogId: number) {
    return api.get(`/floresinc/v1/catalogs/${catalogId}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al obtener catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Obtener productos de un catálogo
  getProducts(catalogId: number) {
    return api.get(`/floresinc/v1/catalogs/${catalogId}/products`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al obtener productos del catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },

  // Crear un nuevo catálogo
  create(data: { name: string, products: CatalogProductInput[] }) {
    console.log('Datos recibidos para crear catálogo:', data);
    
    // Separar los productos personalizados no guardados de los productos regulares
    const customUnsavedProducts = data.products.filter(p => p.is_custom && p.unsaved_data);
    const regularProducts = data.products.filter(p => !p.is_custom || !p.unsaved_data);
    
    // Datos para enviar al endpoint de creación de catálogo
    const catalogData = {
      name: data.name,
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
                catalog_id: catalogId
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
    return api.put(`/floresinc/v1/catalogs/${catalogId}/products/${productData.id}`, productData)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error al actualizar producto ${productData.id} del catálogo ${catalogId}:`, error);
        throw new Error(getReadableErrorMessage(error));
      });
  },
  
  // Crear un producto personalizado para un catálogo
  createCustomProduct(data: CreateCustomProductData) {
    logger.info('CatalogService', 'Datos recibidos para crear producto personalizado:', data);
    
    // Asegurarse de que el precio sea un número y el catalog_id sea válido
    const formattedData = {
      ...data,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
      catalog_id: typeof data.catalog_id === 'string' ? parseInt(data.catalog_id, 10) : data.catalog_id,
      is_custom: true // Marcar explícitamente como producto personalizado
    };
    
    // Verificar que el catalog_id sea un número válido y mayor que cero
    if (isNaN(formattedData.catalog_id) || formattedData.catalog_id <= 0) {
      logger.error('CatalogService', `Error: catalog_id no es un número válido o es cero: ${data.catalog_id}`);
      throw new Error(`ID de catálogo inválido: ${data.catalog_id}. Debe ser un número mayor que cero.`);
    }
    
    logger.info('CatalogService', 'Datos formateados para enviar al endpoint:', formattedData);
    
    return api.post('/floresinc/v1/catalogs/custom-products', formattedData)
      .then(response => {
        logger.info('CatalogService', 'Respuesta completa de creación de producto personalizado:', response);
        
        // Verificar que la respuesta contiene los datos esperados
        if (response.data && response.data.id) {
          logger.info('CatalogService', `Producto personalizado creado exitosamente con ID: ${response.data.id}`);
          
          // Verificar si el producto está correctamente asociado al catálogo
          if (response.data.catalog_id !== formattedData.catalog_id) {
            logger.warn('CatalogService', `Advertencia: El producto se creó con catalog_id=${response.data.catalog_id}, pero se esperaba catalog_id=${formattedData.catalog_id}`);
          }
          
          return response.data;
        } else {
          logger.error('CatalogService', 'Respuesta inesperada al crear producto personalizado:', response.data);
          throw new Error('La respuesta del servidor no contiene los datos esperados');
        }
      })
      .catch(error => {
        logger.error('CatalogService', 'Error al crear producto personalizado:', error);
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
