import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { useProducts, useCategories } from '../hooks/useWooCommerce';
import { Product } from '../types/woocommerce';
import { generateSlug } from '../utils/formatters';
import { categoryService } from '../services/api';
import ProductCard from '../components/products/ProductCard';

const ShopPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const { data: products, loading: productsLoading } = useProducts(selectedCategory);
  const { data: categories } = useCategories();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loadingCategory, setLoadingCategory] = useState(false);

  // Función para normalizar slugs (eliminar acentos, convertir a minúsculas, etc.)
  const normalizeSlug = useCallback((text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Efecto para establecer la categoría seleccionada basada en el slug de la URL
  useEffect(() => {
    if (!slug) {
      console.log('ShopPage: No hay slug, mostrando todas las categorías');
      setSelectedCategory(undefined);
      setCategoryName('Todos los productos');
      return;
    }

    console.log('ShopPage: Buscando categoría para slug:', slug);
    setLoadingCategory(true);

    // Usar el nuevo método para buscar categorías por slug
    categoryService.getBySlug(slug)
      .then(response => {
        if (response.data && response.data.length > 0) {
          const category = response.data[0];
          console.log('ShopPage: Categoría encontrada:', category);
          setSelectedCategory(category.id);
          setCategoryName(category.name);
        } else {
          console.log('ShopPage: Respuesta vacía al buscar categoría');
          throw new Error('Categoría no encontrada');
        }
      })
      .catch(error => {
        console.error('ShopPage: Error al buscar categoría por slug:', error);
        
        // Intentar buscar en las categorías cargadas por el hook useCategories
        if (categories && categories.length > 0) {
          console.log('ShopPage: Intentando buscar en categorías cargadas localmente');
          const normalizedUrlSlug = normalizeSlug(slug);
          
          const category = categories.find(cat => {
            const categorySlug = cat.slug || generateSlug(cat.name);
            const normalizedCategorySlug = normalizeSlug(categorySlug);
            
            console.log(`ShopPage: Comparando normalizado: ${normalizedCategorySlug} con ${normalizedUrlSlug}`);
            return normalizedCategorySlug === normalizedUrlSlug;
          });
          
          if (category) {
            console.log('ShopPage: Categoría encontrada localmente:', category);
            setSelectedCategory(category.id);
            setCategoryName(category.name);
          } else {
            console.log('ShopPage: No se encontró categoría localmente');
            setSelectedCategory(undefined);
            setCategoryName(`Categoría no encontrada: ${slug}`);
          }
        } else {
          console.log('ShopPage: No hay categorías disponibles localmente');
          setSelectedCategory(undefined);
          setCategoryName(`Categoría no encontrada: ${slug}`);
        }
      })
      .finally(() => {
        setLoadingCategory(false);
      });
  }, [slug, categories, normalizeSlug]);

  // Efecto para filtrar productos
  useEffect(() => {
    if (!products) return;

    console.log('ShopPage: Filtrando productos con los siguientes criterios:');
    console.log('- Categoría seleccionada:', selectedCategory);
    console.log('- Término de búsqueda:', searchTerm);
    console.log('- Ordenar por:', sortBy);
    console.log('- Total de productos disponibles:', products.length);

    let filtered = [...products];

    // Ya no es necesario filtrar por categoría aquí, ya que useProducts
    // ya está trayendo los productos de la categoría seleccionada
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term)
      );
    }

    // Ordenar productos
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
        break;
      case 'popularity':
        filtered.sort((a, b) => b.total_sales - a.total_sales);
        break;
      // Por defecto, ordenar alfabéticamente
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    console.log('ShopPage: Productos filtrados:', filtered.length);
    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy]);

  // Efecto para animar los productos cuando se cargan
  useEffect(() => {
    if (!productsLoading && filteredProducts.length > 0) {
      gsap.fromTo(
        '.product-animate',
        { 
          opacity: 0,
          y: 20
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'power2.out' 
        }
      );
    }
  }, [productsLoading, filteredProducts]);

  const handleCategoryChange = (categoryId: number | undefined) => {
    setSelectedCategory(categoryId);
    
    // Actualizar el nombre de la categoría para mostrar en la interfaz
    if (categoryId === undefined) {
      setCategoryName('Todos los productos');
    } else {
      const selectedCat = categories?.find(cat => cat.id === categoryId);
      if (selectedCat) {
        setCategoryName(selectedCat.name);
      }
    }
    
    // Opcional: Actualizar la URL sin recargar la página usando history.pushState
    if (categoryId === undefined) {
      window.history.pushState({}, '', '/tienda');
    } else {
      const selectedCat = categories?.find(cat => cat.id === categoryId);
      if (selectedCat) {
        const categorySlug = selectedCat.slug || generateSlug(selectedCat.name);
        window.history.pushState({}, '', `/tienda/${categorySlug}`);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primario mb-8" data-component-name="ShopPage">
        {loadingCategory ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primario" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando categoría...
          </span>
        ) : categoryName}
      </h1>
      
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Búsqueda */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar productos
            </label>
            <input
              type="text"
              id="search"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent"
              placeholder="¿Qué estás buscando?"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Ordenar por */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              id="sort"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="default">Nombre (A-Z)</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="date">Más recientes</option>
              <option value="popularity">Popularidad</option>
            </select>
          </div>
          
          {/* Filtrar por categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="category"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent"
              value={selectedCategory || ''}
              onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Todas las categorías</option>
              {categories && categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Resultados */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {productsLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center" data-component-name="ShopPage">
            <p className="text-lg text-gray-600" data-component-name="ShopPage">
              {searchTerm 
                ? "No se encontraron productos que coincidan con tu búsqueda." 
                : selectedCategory 
                  ? "No hay productos disponibles en esta categoría actualmente."
                  : "No hay productos disponibles en la tienda actualmente."
              }
            </p>
            <p className="mt-2 text-gray-500" data-component-name="ShopPage">
              {searchTerm && "Intenta con otros términos o "}
              {selectedCategory && (
                <>
                  <button 
                    onClick={() => handleCategoryChange(undefined)} 
                    className="text-primario hover:underline focus:outline-none"
                  >
                    Ver todas las categorías
                  </button>
                </>
              )}
              {!searchTerm && !selectedCategory && "Por favor, vuelve más tarde."}
            </p>
            
            {/* Sugerencias de categorías populares */}
            {(searchTerm || selectedCategory) && categories && categories.length > 0 && (
              <div className="mt-6">
                <p className="font-medium text-gray-700 mb-3">Categorías populares:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.slice(0, 5).map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Grilla de productos usando el componente ProductCard
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                className="h-full"
                animationClass="product-animate"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
