/**
 * Tipos para el menú de WordPress
 */

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
  description?: string;
  image?: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  subcategories?: SubCategory[];
  count?: number;
  description?: string;
  image?: string;
}
