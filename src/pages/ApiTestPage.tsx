import { useState, useEffect } from 'react';
import { productService, categoryService } from '../services/api';
import { Product, Category } from '../types/woocommerce';

const ApiTestPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Intentar obtener productos
        const productsResponse = await productService.getAll();
        setProducts(productsResponse.data);
        
        // Intentar obtener categorías
        const categoriesResponse = await categoryService.getAll();
        setCategories(categoriesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al conectar con la API de WooCommerce. Por favor, verifica tus credenciales y la conexión.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primario mb-6">Prueba de Conexión a la API</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primario"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <div>
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p className="font-bold">¡Conexión exitosa!</p>
            <p>La conexión con la API de WooCommerce se ha establecido correctamente.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resumen de productos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-oscuro mb-4">Productos</h2>
              <p className="mb-4">Se han cargado <span className="font-bold text-primario">{products.length}</span> productos.</p>
              
              {products.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Ejemplos de productos:</h3>
                  <ul className="space-y-2">
                    {products.slice(0, 3).map(product => (
                      <li key={product.id} className="border-b border-gray-200 pb-2">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">Precio: ${product.price}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Resumen de categorías */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-oscuro mb-4">Categorías</h2>
              <p className="mb-4">Se han cargado <span className="font-bold text-primario">{categories.length}</span> categorías.</p>
              
              {categories.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Lista de categorías:</h3>
                  <ul className="space-y-2">
                    {categories.map(category => (
                      <li key={category.id} className="border-b border-gray-200 pb-2">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.count} productos</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Documentación de endpoints */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-oscuro mb-4">Documentación de Endpoints</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-medium mb-3">Endpoints disponibles:</h3>
              <ul className="space-y-4">
                <li>
                  <p className="font-medium">Productos</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    GET {import.meta.env.VITE_WP_API_URL}/wc/v3/products
                  </code>
                </li>
                <li>
                  <p className="font-medium">Categorías</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    GET {import.meta.env.VITE_WP_API_URL}/wc/v3/products/categories
                  </code>
                </li>
                <li>
                  <p className="font-medium">Pedidos</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    GET {import.meta.env.VITE_WP_API_URL}/wc/v3/orders
                  </code>
                </li>
                <li>
                  <p className="font-medium">Crear Pedido</p>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    POST {import.meta.env.VITE_WP_API_URL}/wc/v3/orders
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTestPage;
