import { useState } from 'react';
import { Link } from 'react-router-dom';
import alertService from '../../../services/alertService';

// Tipos para los favoritos
interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
}

const FavoritesSection = () => {
  // Productos favoritos de ejemplo
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([
    {
      id: 101,
      name: 'Ramo de rosas rojas',
      price: 80000,
      image: '/src/assets/images/products/ramo-rosas.jpg',
      slug: 'ramo-rosas-rojas'
    },
    {
      id: 102,
      name: 'Arreglo floral mixto',
      price: 95000,
      image: '/src/assets/images/products/arreglo-mixto.jpg',
      slug: 'arreglo-floral-mixto'
    },
    {
      id: 103,
      name: 'Bouquet de girasoles',
      price: 75000,
      image: '/src/assets/images/products/girasoles.jpg',
      slug: 'bouquet-girasoles'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleRemoveFavorite = (productId: number) => {
    alertService.confirm(
      '¿Estás seguro de que deseas eliminar este producto de tus favoritos?',
      () => {
        setFavorites(favorites.filter(product => product.id !== productId));
        alertService.success('Producto eliminado de favoritos');
      }
    );
  };

  const handleAddToCart = (product: FavoriteProduct) => {
    // Aquí iría la lógica para agregar al carrito
    alertService.success(`${product.name} agregado al carrito`);
  };

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-700">Mis favoritos</h4>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tienes productos favoritos.</p>
          <Link 
            to="/tienda" 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(product => (
            <div key={product.id} className="border border-gray-200 rounded-md overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/wp-content/themes/FloresInc/assets/img/no-image.svg';
                  }}
                />
                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <Link to={`/producto/${product.slug}`} className="text-sm font-medium text-gray-900 hover:text-primario">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                <div className="mt-4">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
