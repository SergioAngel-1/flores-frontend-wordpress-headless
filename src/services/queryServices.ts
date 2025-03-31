import { api } from './apiConfig';
import logger from '../utils/logger';

// Interfaz para definir la estructura de la caché
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Tipos de contenido que pueden cachearse
type CacheableContentType = 
  | 'product'
  | 'products' 
  | 'category' 
  | 'categories' 
  | 'order' 
  | 'user' 
  | 'catalog'
  | 'banner'
  | 'homeSection'
  | 'legal';

// Interfaz para opciones de consulta optimizada
interface QueryOptions {
  ttl?: number;               // Tiempo de vida en milisegundos
  skipCache?: boolean;        // Omitir caché para esta solicitud
  forceRefresh?: boolean;     // Forzar actualización incluso si hay datos en caché
  batchKey?: string;          // Clave para agrupar solicitudes en lote
  loadingCallback?: (isLoading: boolean) => void; // Callback para estado de carga
  errorCallback?: (error: any) => void;          // Callback para errores
}

// Valores predeterminados TTL (Time To Live) en milisegundos por tipo de contenido
const DEFAULT_TTL: Record<CacheableContentType, number> = {
  product: 5 * 60 * 1000,        // 5 minutos para productos individuales
  products: 2 * 60 * 1000,       // 2 minutos para listas de productos
  category: 30 * 60 * 1000,      // 30 minutos para categorías individuales
  categories: 30 * 60 * 1000,    // 30 minutos para listas de categorías
  order: 0,                      // Sin caché para órdenes (datos sensibles)
  user: 10 * 60 * 1000,          // 10 minutos para datos de usuario
  catalog: 10 * 60 * 1000,       // 10 minutos para catálogos
  banner: 30 * 60 * 1000,        // 30 minutos para banners
  homeSection: 5 * 60 * 1000,    // 5 minutos para secciones de inicio
  legal: 60 * 60 * 1000          // 60 minutos para contenido legal (cambia poco)
};

// Definición de interfaz para solicitudes en lote
interface BatchRequest {
  id: string;
  url: string;
  method: string;
  params?: any;
  data?: any;
  resolve: (value: { data: any }) => void;
  reject: (reason: any) => void;
}

// Sistema de Gestión de Caché
class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private batchRequests: Map<string, BatchRequest[]> = new Map();
  private batchTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private BATCH_DELAY = 50; // milisegundos de espera para agrupar solicitudes

  // Construir clave de caché única
  public buildCacheKey(contentType: CacheableContentType, id: string | number | null, params?: any): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return `${contentType}_${id || 'list'}_${paramsString}`;
  }

  // Obtener elemento de la caché
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Verificar si el elemento existe y no ha expirado
    if (item && item.expiresAt > Date.now()) {
      return item.data as T;
    }
    
    // Si ha expirado, eliminarlo de la caché
    if (item) {
      this.cache.delete(key);
    }
    
    return null;
  }

  // Guardar elemento en la caché
  set<T>(key: string, data: T, ttl: number): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });
    
    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      logger.debug('cache', `📦 Cache: Item added [${key}], expires in ${ttl/1000}s`);
    }
  }

  // Invalidar un elemento específico de la caché
  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('cache', `🗑️ Cache: Item invalidated [${key}]`);
      }
    }
  }

  // Invalidar todos los elementos de un tipo específico
  invalidateByType(contentType: CacheableContentType): void {
    // Obtener todas las claves que comienzan con el tipo de contenido
    const keysToRemove: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(contentType)) {
        keysToRemove.push(key);
      }
    });
    
    // Eliminar elementos
    keysToRemove.forEach(key => this.cache.delete(key));
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('cache', `🗑️ Cache: Invalidated ${keysToRemove.length} items of type [${contentType}]`);
    }
  }

  // Invalidar elementos relacionados (ej: al actualizar un producto, invalidar listas de productos)
  invalidateRelated(contentType: CacheableContentType, _id?: string | number): void {
    this.invalidateByType(contentType);
    
    // Si se actualiza un producto, también invalidar categorías relacionadas
    if (contentType === 'product') {
      this.invalidateByType('products');
      // Idealmente aquí también invalidaríamos las categorías específicas
      // pero necesitaríamos conocer a qué categorías pertenece el producto
    }
    
    // Si se actualiza una categoría, invalidar productos
    if (contentType === 'category') {
      this.invalidateByType('categories');
      this.invalidateByType('products');
    }
  }

  // Añadir una solicitud al lote
  addToBatch(batchKey: string, request: BatchRequest): void {
    // Obtener o inicializar el array de solicitudes para esta clave de lote
    const requests = this.batchRequests.get(batchKey) || [];
    requests.push(request);
    this.batchRequests.set(batchKey, requests);
    
    // Cancelar el timeout anterior si existe
    if (this.batchTimeouts.has(batchKey)) {
      clearTimeout(this.batchTimeouts.get(batchKey)!);
    }
    
    // Establecer un nuevo timeout para procesar este lote
    const timeout = setTimeout(() => {
      this.processBatch(batchKey);
    }, this.BATCH_DELAY);
    
    this.batchTimeouts.set(batchKey, timeout);
  }

  // Procesar un lote de solicitudes
  private async processBatch(batchKey: string): Promise<void> {
    const requests = this.batchRequests.get(batchKey) || [];
    
    if (requests.length === 0) {
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('batch', `🔄 Processing batch [${batchKey}] with ${requests.length} requests`);
    }
    
    this.batchRequests.delete(batchKey);
    this.batchTimeouts.delete(batchKey);
    
    // Si solo hay una solicitud, procesarla normalmente
    if (requests.length === 1) {
      const request = requests[0];
      try {
        const response = await api({
          url: request.url,
          method: request.method,
          params: request.params,
          data: request.data
        });
        request.resolve({ data: response.data });
      } catch (error) {
        request.reject(error);
      }
      return;
    }
    
    // Si hay múltiples solicitudes, usar el endpoint de lotes
    try {
      // Preparar solicitudes de lote
      const batchRequests = requests.map((req) => ({
        id: req.id,
        method: req.method,
        path: req.url,
        body: req.data || {},
        params: req.params || {}
      }));
      
      // Endpoint ficticio de lotes (debería implementarse en el backend)
      const response = await api.post('/floresinc/v1/batch', {
        requests: batchRequests
      });
      
      // Distribuir respuestas a cada promesa original
      const batchResponses = response.data.responses;
      requests.forEach(req => {
        const batchResponse = batchResponses.find((b: any) => b.id === req.id);
        if (batchResponse) {
          if (batchResponse.status >= 200 && batchResponse.status < 300) {
            req.resolve({ data: batchResponse.data });
          } else {
            req.reject({ response: { data: batchResponse.data, status: batchResponse.status } });
          }
        } else {
          req.reject(new Error('No response received for this request in batch'));
        }
      });
    } catch (error) {
      // Si falla el lote completo, rechazar todas las promesas
      requests.forEach(req => req.reject(error));
    }
  }
}

// Instancia global del gestor de caché
const cacheManager = new CacheManager();

// Clase principal para consultas optimizadas
class OptimizedQuery {
  // Método genérico para ejecutar cualquier consulta con caché
  async query<T>(
    contentType: CacheableContentType,
    endpoint: string,
    id: string | number | null = null,
    params: any = {},
    options: QueryOptions = {}
  ): Promise<T> {
    const {
      ttl = DEFAULT_TTL[contentType],
      skipCache = false,
      forceRefresh = false,
      batchKey,
      loadingCallback,
      errorCallback
    } = options;
    
    // Notificar inicio de carga
    if (loadingCallback) {
      loadingCallback(true);
    }
    
    try {
      // Construir clave de caché
      const cacheKey = cacheManager.buildCacheKey(contentType, id, params);
      
      // Verificar caché si no se omite
      if (!skipCache && !forceRefresh && ttl > 0) {
        const cachedData = cacheManager.get<T>(cacheKey);
        if (cachedData) {
          if (process.env.NODE_ENV === 'development') {
            logger.debug('cache', `✅ Cache hit [${cacheKey}]`);
          }
          
          // Notificar fin de carga
          if (loadingCallback) {
            loadingCallback(false);
          }
          
          return cachedData;
        } else if (process.env.NODE_ENV === 'development') {
          logger.debug('cache', `❌ Cache miss [${cacheKey}]`);
        }
      } else if (process.env.NODE_ENV === 'development' && forceRefresh) {
        logger.debug('cache', `🔄 Force refresh [${cacheKey}]`);
      }
      
      // Si no está en caché, realizar solicitud
      let response: { data: T };
      
      if (batchKey) {
        // Ejecutar como parte de un lote
        response = await new Promise<{ data: T }>((resolve, reject) => {
          cacheManager.addToBatch(batchKey, {
            id: `${contentType}_${id || 'list'}_${Date.now()}`,
            url: endpoint,
            method: 'GET',
            params,
            resolve,
            reject
          });
        });
      } else {
        // Ejecutar como solicitud individual
        response = await api.get<T>(endpoint, { params });
      }
      
      // Guardar en caché si tiene TTL
      if (ttl > 0 && !skipCache) {
        cacheManager.set(cacheKey, response.data, ttl);
      }
      
      // Notificar fin de carga
      if (loadingCallback) {
        loadingCallback(false);
      }
      
      return response.data;
    } catch (error) {
      // Manejar error
      if (errorCallback) {
        errorCallback(error);
      }
      
      // Notificar fin de carga
      if (loadingCallback) {
        loadingCallback(false);
      }
      
      throw error;
    }
  }

  // --- Métodos específicos para diferentes tipos de datos ---

  // Productos
  async getProducts(params: any = {}, options: QueryOptions = {}): Promise<any[]> {
    return this.query('products', '/wc/v3/products', null, params, options);
  }
  
  async getProductById(id: number, options: QueryOptions = {}): Promise<any> {
    return this.query('product', `/wc/v3/products/${id}`, id, {}, options);
  }
  
  async getProductsByCategory(categoryId: number, params: any = {}, options: QueryOptions = {}): Promise<any[]> {
    return this.query('products', '/wc/v3/products', null, { ...params, category: categoryId }, options);
  }
  
  async searchProducts(searchTerm: string, params: any = {}, options: QueryOptions = {}): Promise<any[]> {
    // Búsquedas normalmente no se cachean o tienen TTL bajo
    const searchOptions = { ...options, ttl: options.ttl || 60 * 1000 }; // 1 minuto por defecto
    return this.query('products', '/wc/v3/products', null, { ...params, search: searchTerm }, searchOptions);
  }
  
  // Categorías
  async getCategories(params: any = {}, options: QueryOptions = {}): Promise<any[]> {
    return this.query('categories', '/wc/v3/products/categories', null, { ...params, per_page: 100 }, options);
  }
  
  async getCategoryById(id: number, options: QueryOptions = {}): Promise<any> {
    return this.query('category', `/wc/v3/products/categories/${id}`, id, {}, options);
  }
  
  // Contenido de la página de inicio
  async getHomeSections(options: QueryOptions = {}): Promise<any[]> {
    return this.query('homeSection', '/floresinc/v1/home-sections', null, {}, options);
  }
  
  // Catálogos
  async getCatalogs(options: QueryOptions = {}): Promise<any[]> {
    return this.query('catalog', '/floresinc/v1/catalogs', null, {}, options);
  }
  
  async getCatalogById(id: number, options: QueryOptions = {}): Promise<any> {
    return this.query('catalog', `/floresinc/v1/catalogs/${id}`, id, {}, options);
  }
  
  // Métodos para invalidar caché
  invalidateProducts(): void {
    cacheManager.invalidateByType('products');
    cacheManager.invalidateByType('product');
  }
  
  invalidateProduct(id: number): void {
    cacheManager.invalidateRelated('product', id);
  }
  
  invalidateCategories(): void {
    cacheManager.invalidateByType('categories');
    cacheManager.invalidateByType('category');
  }
  
  invalidateCategory(id: number): void {
    cacheManager.invalidateRelated('category', id);
  }
  
  // Métodos para cargar datos paginados con Lazy Loading
  async getPaginatedProducts(
    page: number = 1,
    perPage: number = 10,
    params: any = {},
    options: QueryOptions = {}
  ): Promise<{ data: any[], totalPages: number, totalItems: number }> {
    const queryParams = {
      ...params,
      page,
      per_page: perPage
    };
    
    // Usar el encabezado X-WP-Total y X-WP-TotalPages para paginación
    try {
      const apiResponse = await api.get('/wc/v3/products', { params: queryParams });
      
      const totalItems = parseInt(apiResponse.headers['x-wp-total'] || '0', 10);
      const totalPages = parseInt(apiResponse.headers['x-wp-totalpages'] || '0', 10);
      
      // Cachear cada página por separado
      if (options.ttl !== 0 && !options.skipCache) {
        const cacheKey = cacheManager.buildCacheKey('products', null, queryParams);
        cacheManager.set(cacheKey, apiResponse.data, options.ttl || DEFAULT_TTL.products);
      }
      
      return {
        data: apiResponse.data,
        totalPages,
        totalItems
      };
    } catch (error) {
      if (options.errorCallback) {
        options.errorCallback(error);
      }
      throw error;
    }
  }
  
  // Cargar datos en lotes
  async batchLoad<T>(
    requests: Array<{
      contentType: CacheableContentType;
      endpoint: string;
      id?: string | number;
      params?: any;
    }>,
    options: QueryOptions = {}
  ): Promise<Record<string, T>> {
    const batchKey = `batch_${Date.now()}`;
    const results: Record<string, T> = {};
    
    // Crear un array de promesas para todas las solicitudes
    const promises = requests.map(async (req) => {
      const key = `${req.contentType}_${req.id || 'list'}`;
      try {
        const data = await this.query<T>(
          req.contentType,
          req.endpoint,
          req.id || null,
          req.params || {},
          { ...options, batchKey }
        );
        results[key] = data;
      } catch (error) {
        logger.error('batch', `Error loading batch item [${key}]:`, error);
        throw error;
      }
    });
    
    // Esperar a que todas las promesas se resuelvan
    await Promise.all(promises);
    
    return results;
  }
}

// Instancia única para toda la aplicación
const queryService = new OptimizedQuery();

export default queryService;
