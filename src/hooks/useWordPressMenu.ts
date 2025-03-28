import { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import { generateSlug } from '../utils/formatters';
import { MenuCategory } from '../types/menu';

/**
 * Hook personalizado para obtener y gestionar el menú principal desde WordPress
 */
export const useWordPressMenu = () => {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener categorías del menú desde WordPress
        const categories = await menuService.getMainMenu();
        
        // Asegurarse de que todas las categorías y subcategorías tengan un slug válido
        const processedCategories = categories.map(category => {
          // Asegurar que la categoría principal tenga un slug
          const mainCategory = {
            ...category,
            slug: category.slug || generateSlug(category.name)
          };
          
          // Si hay subcategorías, asegurar que cada una tenga un slug
          if (mainCategory.subcategories && mainCategory.subcategories.length > 0) {
            mainCategory.subcategories = mainCategory.subcategories.map(subcat => ({
              ...subcat,
              slug: subcat.slug || generateSlug(subcat.name)
            }));
          }
          
          return mainCategory;
        });
        
        setMenuCategories(processedCategories);
      } catch (err) {
        console.error('Error al cargar el menú:', err);
        setError('No se pudo cargar el menú. Por favor, intenta de nuevo más tarde.');
        
        // En caso de error, usar las categorías estáticas como fallback
        try {
          const staticMenuModule = await import('../data/menuCategories');
          // Convertir las categorías estáticas al formato MenuCategory
          const staticCategories: MenuCategory[] = staticMenuModule.default.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            subcategories: cat.subcategories?.map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug
            }))
          }));
          console.log('Cargando categorías de menú estáticas como fallback');
          setMenuCategories(staticCategories);
        } catch (importError) {
          console.error('Error al cargar el menú estático de fallback:', importError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { menuCategories, loading, error };
};

export default useWordPressMenu;
