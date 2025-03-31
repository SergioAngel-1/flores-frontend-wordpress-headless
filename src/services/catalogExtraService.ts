import { api } from './apiConfig';

export interface CatalogExtraProduct {
  id: number | string;
  name: string;
  sku: string;
  description: string;
  short_description: string;
  regular_price: string;
  custom_price: string;
  main_image: string;
  secondary_image_1: string;
  secondary_image_2: string;
  categories?: string[];
  is_custom?: boolean;
}

export interface CatalogExtra {
  id: number;
  title: string;
  slug: string;
  logo: string;
  products: CatalogExtraProduct[];
}

const getAll = async (): Promise<CatalogExtra[]> => {
  const response = await api.get('/floresinc/v1/catalogs');
  return response.data;
};

const getById = async (id: number): Promise<CatalogExtra | null> => {
  try {
    const response = await api.get(`/floresinc/v1/catalogs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el catálogo por ID:', error);
    return null;
  }
};

const getBySlug = async (slug: string): Promise<CatalogExtra | null> => {
  try {
    const response = await api.get(`/floresinc/v1/catalogs/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el catálogo por slug:', error);
    return null;
  }
};

export const catalogExtraService = {
  getAll,
  getById,
  getBySlug
};

export const useGetCatalog = (slug?: string) => {
  // Este hook es una simplificación para mantener compatibilidad con el componente existente
  const getCatalog = async () => {
    if (!slug) {
      throw new Error('Se requiere un slug para obtener el catálogo');
    }
    return await catalogExtraService.getBySlug(slug);
  };

  const catalog = getCatalog();
  
  return {
    data: catalog,
    isLoading: false,
    error: null
  };
};

export default catalogExtraService;
