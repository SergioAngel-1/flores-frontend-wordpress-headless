import { useState } from 'react';
import alertService from '../../../services/alertService';

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
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  items: OrderItem[];
}

const OrdersSection = () => {
  // Pedidos de ejemplo
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1001,
      date: '2025-03-10',
      status: 'completed',
      total: 120000,
      items: [
        {
          id: 1,
          name: 'Ramo de rosas rojas',
          price: 80000,
          quantity: 1,
          image: '/src/assets/images/products/ramo-rosas.jpg'
        },
        {
          id: 2,
          name: 'Tarjeta personalizada',
          price: 20000,
          quantity: 2,
          image: '/src/assets/images/products/tarjeta.jpg'
        }
      ]
    },
    {
      id: 1002,
      date: '2025-03-15',
      status: 'processing',
      total: 95000,
      items: [
        {
          id: 3,
          name: 'Arreglo floral mixto',
          price: 95000,
          quantity: 1,
          image: '/src/assets/images/products/arreglo-mixto.jpg'
        }
      ]
    }
  ]);

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

  const handleReorder = (orderId: number) => {
    const orderToReorder = orders.find(order => order.id === orderId);
    if (orderToReorder) {
      console.log(`Reordenando productos del pedido ${orderId}`);
      alertService.success('Los productos han sido agregados al carrito');
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

      {orders.length === 0 ? (
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
                      onClick={() => handleRequestHelp(order.id)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Ayuda con este pedido
                    </button>
                    <button
                      onClick={() => handleReorder(order.id)}
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
