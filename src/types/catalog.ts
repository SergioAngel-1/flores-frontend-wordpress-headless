export interface Catalog {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  product_count: number;
  products?: CatalogProduct[];
}

export interface CatalogProduct {
  id: number;
  name: string;
  price: string;
  catalog_price?: string | null;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  image?: string;
  catalog_image?: string | null;
  catalog_images?: string[];
  images?: Array<{
    id: number;
    src: string;
    alt?: string;
  }>;
  sku?: string;
  catalog_sku?: string | null;
  description?: string;
  catalog_description?: string | null;
  short_description?: string;
  catalog_short_description?: string | null;
  catalog_name?: string | null;
  is_custom?: boolean;
}

export interface CatalogProductInput {
  id: number;
  product_id?: number;
  catalog_price?: number | null;
  catalog_name?: string | null;
  catalog_description?: string | null;
  catalog_short_description?: string | null;
  catalog_sku?: string | null;
  catalog_image?: string | null;
  catalog_images?: string[];
  is_custom?: boolean;
  unsaved_data?: any; // Para productos personalizados que aún no tienen ID en el backend
}

export interface CreateCatalogData {
  name: string;
  products: number[];
}

export interface UpdateCatalogData {
  name: string;
  products: number[];
}

export interface CustomProduct {
  id?: number;
  name: string;
  price: string | number;
  sku?: string;
  description?: string;
  short_description?: string;
  image?: string;
  images?: string[];
  is_custom?: boolean;
}

export interface CreateCustomProductData {
  catalog_id: number;
  name: string;
  price: number | string;
  sku?: string;
  description?: string;
  short_description?: string;
  image?: string;
  images?: string[];
  is_custom?: boolean;
}
