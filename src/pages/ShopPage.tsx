import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useProducts, useCategories } from '../hooks/useWooCommerce';
import { Product } from '../types/woocommerce';

const ShopPage = () => {
  const { data: products, loading: productsLoading } = useProducts();
  const { data: categories, loading: categoriesLoading } = useCategories();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Efecto para filtrar productos
  useEffect(() => {
    if (!products) return;

    let filtered = [...products];

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.categories.some(cat => cat.id === selectedCategory)
      );
    }

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
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
        break;
      default:
        // Mantener el orden predeterminado
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Animaciones con GSAP
  useEffect(() => {
    if (!productsLoading && filteredProducts.length > 0) {
      const productCards = document.querySelectorAll('.product-card');
      
      gsap.fromTo(
        productCards,
        { opacity: 0, y: 20 },
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

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-primario mb-8">Nuestra Tienda</h1>
      
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Búsqueda */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario"
            />
          </div>
          
          {/* Filtro por categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <div className="relative">
              <select
                id="category"
                value={selectedCategory || ''}
                onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario appearance-none"
              >
                <option value="">Todas las categorías</option>
                {!categoriesLoading && categories && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Ordenar por */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <div className="relative">
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primario appearance-none"
              >
                <option value="default">Predeterminado</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
                <option value="newest">Más recientes</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resultados */}
      <div>
        {productsLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-medium text-gray-600">No se encontraron productos</h2>
            <p className="mt-2 text-gray-500">Intenta con otros filtros o términos de búsqueda</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-gray-600">{filteredProducts.length} productos encontrados</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                  <Link to={`/producto/${product.id}`} className="block">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                      <img 
                        src={product.images && product.images.length > 0 
                          ? product.images[0].src 
                          : 'https://via.placeholder.com/300x300?text=No+Image'
                        } 
                        alt={product.name} 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-oscuro mb-1 truncate">{product.name}</h3>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-primario">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        
                        {product.on_sale && (
                          <span className="bg-acento text-white text-xs px-2 py-1 rounded">Oferta</span>
                        )}
                      </div>
                      
                      {product.categories && product.categories.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500">
                          {product.categories[0].name}
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4 pt-0">
                    <button 
                      className="w-full bg-primario text-white py-2 px-4 rounded-md hover:bg-hover transition-colors"
                      onClick={() => {
                        // Aquí se implementará la lógica para agregar al carrito
                        console.log(`Agregando ${product.name} al carrito`);
                        alert(`${product.name} agregado al carrito`);
                      }}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
