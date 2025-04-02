import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import alertService from '../../services/alertService';
import { FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { api } from '../../services/apiConfig';
import { useCart } from '../../contexts/CartContext';

interface PromotionalProduct {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: { src: string }[];
  permalink: string;
}

const PromotionalGrid: React.FC<{ categoryId?: number }> = ({ categoryId }) => {
  const [products, setProducts] = useState<PromotionalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const { items, addItem, updateItemQuantity, removeItem } = useCart();

  // Cargar productos promocionales
  useEffect(() => {
    const fetchPromotionalProducts = async () => {
      try {
        setLoading(true);
        setProducts([]); // Limpiar productos anteriores
        
        // Determinar si estamos en una página de categoría
        let endpoint = '/floresinc/v1/promotional-grid';
        
        // Si se proporciona un ID de categoría, usar el endpoint específico
        if (categoryId) {
          endpoint = `/floresinc/v1/promotional-grid/category/${categoryId}`;
          console.log(`Cargando grilla promocional para categoría ID: ${categoryId}`);
        } else {
          console.log('Cargando grilla promocional por defecto');
        }
        
        const response = await api.get(endpoint);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Grilla promocional cargada con ${response.data.length} productos`);
          console.log('Productos de la grilla:', response.data.map((p: PromotionalProduct) => p.name).join(', '));
          setProducts(response.data);
        } else {
          console.log('No se encontraron productos en la grilla promocional');
          // Debug: mostrar la respuesta completa para analizar
          console.log('Respuesta de la API:', response.data);
          setProducts([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar productos promocionales:', err);
        setError('No se pudieron cargar los productos promocionales.');
        setLoading(false);
      }
    };

    fetchPromotionalProducts();
  }, [categoryId]); // Quitar location.pathname para que no recargue en cambios de URL que no afectan la categoría

  // Inicializar las cantidades desde el carrito cuando se cargan los productos
  useEffect(() => {
    if (products.length > 0) {
      const newQuantities: { [key: number]: number } = {};

      products.forEach(product => {
        const cartItem = items.find(item => item.product.id === product.id);
        newQuantities[product.id] = cartItem ? cartItem.quantity : 0;
      });

      setQuantities(newQuantities);
    }
  }, [products, items]);

  // Animaciones con CSS
  useEffect(() => {
    if (!loading && products.length > 0) {
      const gridItems = document.querySelectorAll('.promo-grid-item');
      
      gridItems.forEach((item, index) => {
        const element = item as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateX(5px)';
        
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateX(0)';
          element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, index * 80); // Simular el stagger de GSAP
      });
    }
  }, [loading, products]);

  const handleAddToCart = (product: PromotionalProduct) => {
    // Convertir el precio a número para usarlo correctamente
    // El precio viene como "COP 123.456" desde el backend
    const numericPrice = parseFloat(product.price.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.'));
    
    console.log('Agregando producto al carrito:', {
      id: product.id,
      name: product.name,
      price: numericPrice
    });

    // Transformar el producto promocional al formato esperado por el contexto del carrito
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: numericPrice.toString(),
      images: product.images || [],
      permalink: product.permalink,
      regular_price: product.regular_price ? parseFloat(product.regular_price.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.')).toString() : '',
      sale_price: product.sale_price ? parseFloat(product.sale_price.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.')).toString() : '',
      // Añadimos propiedades requeridas por Product pero que no usamos realmente
      slug: '',
      date_created: '',
      date_modified: '',
      type: '',
      status: '',
      featured: false,
      catalog_visibility: '',
      description: '',
      short_description: '',
      sku: '',
      date_on_sale_from: null,
      date_on_sale_to: null,
      on_sale: false,
      purchasable: true,
      total_sales: 0,
      virtual: false,
      downloadable: false,
      downloads: [],
      download_limit: 0,
      download_expiry: 0,
      tax_status: '',
      tax_class: '',
      manage_stock: false,
      stock_quantity: null,
      stock_status: '',
      backorders: '',
      backorders_allowed: false,
      backordered: false,
      sold_individually: false,
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      shipping_required: false,
      shipping_taxable: false,
      shipping_class: '',
      shipping_class_id: 0,
      reviews_allowed: false,
      average_rating: '',
      rating_count: 0,
      related_ids: [],
      upsell_ids: [],
      cross_sell_ids: [],
      parent_id: 0,
      purchase_note: '',
      categories: [],
      tags: [],
      attributes: [],
      default_attributes: [],
      variations: [],
      grouped_products: [],
      menu_order: 0,
      price_html: '',
      meta_data: []
    } as any;

    addItem(productToAdd, 1);
    setQuantities(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));

    // Mostrar alerta
    alertService.success(`${product.name} añadido al carrito`);
  };

  const handleUpdateQuantity = (product: PromotionalProduct, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(product.id);
      setQuantities(prev => ({ ...prev, [product.id]: 0 }));
      alertService.info(`${product.name} eliminado del carrito`);
    } else {
      updateItemQuantity(product.id, newQuantity);
      setQuantities(prev => ({ ...prev, [product.id]: newQuantity }));

      // Si estamos incrementando la cantidad, mostrar alerta
      if (newQuantity > (quantities[product.id] || 0)) {
        alertService.success(`${product.name} añadido al carrito`);
      }
    }
  };

  if (error) {
    console.error("Error en PromotionalGrid:", error);
    return null; // No mostrar nada si hay un error
  }
  
  if (loading) {
    return (
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs uppercase tracking-wider font-medium text-gray-400 mb-3">No te puede faltar</p>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primario"></div>
        </div>
      </div>
    );
  }
  
  if (products.length === 0) {
    console.log("No hay productos para mostrar en la grilla promocional");
    return null; // No mostrar nada si no hay productos
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-100 product-animate">
      <p className="text-xs uppercase tracking-wider font-medium text-gray-400 mb-3">No te puede faltar</p>

      <div className="flex flex-col items-start space-y-2">
        {products.map((product) => (
          <div key={product.id} className="flex w-full items-center">
            <Link
              to={product.permalink}
              className="promo-grid-item group inline-flex items-center py-1.5 px-3 mr-2 flex-grow rounded-md
                       bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm
                       hover:bg-white/80 hover:shadow-md transition-all"
              data-component-name="LinkWithRef"
            >
              {/* Imagen pequeña */}
              <div className="w-8 h-8 flex-shrink-0 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={(product.images && product.images.length > 0) ? product.images[0].src : '/wp-content/themes/FloresInc/assets/img/no-image.svg'}
                  alt={product.name}
                  className="w-6 h-6 object-contain"
                />
              </div>

              {/* Título y precio */}
              <div className="flex items-center ml-3">
                <span className="text-xs text-gray-600 mr-3">{product.name}</span>

                {/* Precio */}
                <div className="flex-shrink-0 flex items-center">
                  {product.regular_price && product.regular_price !== product.price && (
                    <span className="text-xs text-gray-400 line-through mr-1">
                      {product.regular_price}
                    </span>
                  )}
                  <span className="text-xs font-medium text-primario">
                    {product.price}
                  </span>
                </div>

                <svg
                  className="w-3 h-3 text-gray-400 group-hover:text-primario transition-colors ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  data-component-name="PromotionalGrid"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Botón de agregar al carrito o controles de cantidad */}
            {quantities[product.id] === 0 || !quantities[product.id] ? (
              <button
                onClick={() => handleAddToCart(product)}
                className="flex items-center justify-center p-1.5 rounded-full bg-white shadow-sm hover:bg-primario hover:text-white transition-colors border border-gray-100"
                title="Agregar al carrito"
              >
                <FiShoppingCart size={14} />
              </button>
            ) : (
              <div className="flex items-center border border-primario rounded overflow-hidden">
                <button
                  onClick={() => handleUpdateQuantity(product, (quantities[product.id] || 0) - 1)}
                  className="bg-primario/10 hover:bg-primario/20 text-primario p-1 transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <FiMinus size={14} />
                </button>
                <span className="px-2 text-xs font-medium min-w-[20px] text-center">{quantities[product.id]}</span>
                <button
                  onClick={() => handleUpdateQuantity(product, (quantities[product.id] || 0) + 1)}
                  className="bg-primario/10 hover:bg-primario/20 text-primario p-1 transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalGrid;
