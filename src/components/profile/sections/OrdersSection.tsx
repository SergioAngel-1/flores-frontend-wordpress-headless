import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { orderService } from '../../../services/api';
import alertService from '../../../services/alertService';
import { cartService } from '../../../services/api';

// Tipos para los pedidos
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'on-hold' | 'refunded' | 'failed';
  total: number;
  items: OrderItem[];
}

const OrdersSection = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar los pedidos del usuario
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Obteniendo pedidos para el usuario:', user.id);
        const response = await orderService.getCustomerOrders(user.id);
        console.log('Respuesta de pedidos:', response.data);
        
        // Transformar los datos de la API al formato que necesitamos
        const formattedOrders: Order[] = response.data.map((order: any) => ({
          id: order.id,
          date: order.date_created,
          status: order.status,
          total: parseFloat(order.total),
          items: order.line_items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            image: item.image?.src || 'https://via.placeholder.com/150'
          }))
        }));
        
        setOrders(formattedOrders);
      } catch (err) {
        console.error('Error al obtener pedidos:', err);
        setError('No pudimos cargar tus pedidos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user?.id]);

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
      case 'processing':
        return { text: 'En proceso', color: 'bg-blue-100 text-blue-800' };
      case 'completed':
        return { text: 'Completado', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { text: 'Cancelado', color: 'bg-red-100 text-red-800' };
      case 'on-hold':
        return { text: 'En espera', color: 'bg-orange-100 text-orange-800' };
      case 'refunded':
        return { text: 'Reembolsado', color: 'bg-purple-100 text-purple-800' };
      case 'failed':
        return { text: 'Fallido', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleReorder = async (orderId: number) => {
    const orderToReorder = orders.find(order => order.id === orderId);
    if (orderToReorder) {
      try {
        // Añadir todos los productos del pedido al carrito
        for (const item of orderToReorder.items) {
          await cartService.addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            images: [{ src: item.image }]
          }, item.quantity);
        }
        
        // Disparar evento para actualizar el contador del carrito
        const event = new CustomEvent('cart-updated');
        window.dispatchEvent(event);
        
        alertService.success('Los productos han sido agregados al carrito');
      } catch (err) {
        console.error('Error al reordenar productos:', err);
        alertService.error('No pudimos añadir los productos al carrito. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleRequestHelp = (orderId: number) => {
    const orderForHelp = orders.find(order => order.id === orderId);
    if (orderForHelp) {
      alertService.prompt(
        `¿En qué podemos ayudarte con el pedido #${orderId}?`,
        '',
        (message) => {
          if (message.trim()) {
            alertService.success('Tu solicitud ha sido enviada. Te contactaremos pronto.');
          }
        }
      );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-700">Mis pedidos</h4>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primario border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando tus pedidos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button 
            className="mt-2 text-primario hover:underline"
            onClick={() => window.location.reload()}
          >
            Intentar de nuevo
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tienes pedidos realizados.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-md overflow-hidden">
              <div 
                className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">Pedido #{order.id}</span>
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusLabel(order.status).color}`}>
                      {getStatusLabel(order.status).text}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(order.date)}</p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center">
                  <span className="font-medium text-gray-900">{formatCurrency(order.total)}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`ml-2 h-5 w-5 text-gray-500 transition-transform ${expandedOrderId === order.id ? 'transform rotate-180' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="p-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-3">Productos</h5>
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-start">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h6 className="text-sm font-medium text-gray-900">{item.name}</h6>
                          <p className="mt-1 text-sm text-gray-500">
                            {formatCurrency(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">Total</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestHelp(order.id);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Ayuda con este pedido
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorder(order.id);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primario hover:bg-hover"
                    >
                      Volver a pedir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
