import { wooCommerceApi } from './apiConfig';
import { orderService as centralOrderService } from './api';
import cartService from './cartService';
import { showServerErrorAlert } from './alertService';

// Tipos de datos para pedidos
export interface OrderLineItem {
  product_id: number;
  quantity: number;
  variation_id?: number;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface BillingAddress extends ShippingAddress {
  company?: string;
}

export interface OrderData {
  payment_method: string;
  payment_method_title: string;
  set_paid?: boolean;
  customer_id?: number;
  billing: BillingAddress;
  shipping: ShippingAddress;
  line_items: OrderLineItem[];
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  coupon_lines?: Array<{
    code: string;
  }>;
}

export interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  shipping_total: string;
  discount_total: string;
  customer_id: number;
  billing: BillingAddress;
  shipping: ShippingAddress;
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: any[];
    sku: string;
    price: number;
    image: {
      id: string;
      src: string;
    };
    parent_name: string | null;
  }>;
  shipping_lines: Array<{
    id: number;
    method_title: string;
    method_id: string;
    instance_id: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: any[];
  }>;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string;
}

// Servicio para gestionar pedidos con WooCommerce
const orderService = {
  // Crear un nuevo pedido
  async createOrder(orderData: OrderData): Promise<Order> {
    try {
      const response = await centralOrderService.createOrder(orderData);
      
      // Limpiar el carrito después de crear el pedido exitosamente
      if (response.data && response.data.id) {
        cartService.clearCart();
        
        // Disparar evento de actualización del carrito
        const event = new CustomEvent('cart-updated');
        window.dispatchEvent(event);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      showServerErrorAlert();
      throw error;
    }
  },
  
  // Obtener un pedido por su ID
  async getOrderById(id: number): Promise<Order> {
    try {
      const response = await centralOrderService.getOrderById(id);
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el pedido ${id}:`, error);
      throw error;
    }
  },
  
  // Obtener los pedidos de un cliente
  async getCustomerOrders(customerId: number): Promise<Order[]> {
    try {
      const response = await centralOrderService.getCustomerOrders(customerId);
      
      return response.data;
    } catch (error) {
      console.error(`Error al obtener los pedidos del cliente ${customerId}:`, error);
      throw error;
    }
  },
  
  // Verificar disponibilidad de métodos de pago
  async getPaymentMethods(): Promise<Array<{id: string, title: string, description: string}>> {
    try {
      const response = await wooCommerceApi.get('/payment_gateways');
      
      // Filtrar solo los métodos de pago habilitados
      return response.data.filter((method: any) => method.enabled);
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      return [
        { id: 'bacs', title: 'Transferencia bancaria', description: 'Realiza tu pago directamente en nuestra cuenta bancaria.' },
        { id: 'cod', title: 'Pago contra entrega', description: 'Paga en efectivo al momento de la entrega.' }
      ]; // Valores predeterminados en caso de error
    }
  },
  
  // Verificar disponibilidad de métodos de envío
  async getShippingMethods(): Promise<Array<{id: string, title: string, cost: string}>> {
    try {
      const response = await wooCommerceApi.get('/shipping_methods');
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener métodos de envío:', error);
      return [
        { id: 'flat_rate', title: 'Tarifa fija', cost: '100' },
        { id: 'free_shipping', title: 'Envío gratis', cost: '0' }
      ]; // Valores predeterminados en caso de error
    }
  },
  
  // Aplicar cupón de descuento
  async validateCoupon(code: string): Promise<{valid: boolean, amount: string, discount_type: string}> {
    try {
      const response = await wooCommerceApi.get('/coupons', {
        params: {
          code
        }
      });
      
      if (response.data && response.data.length > 0) {
        const coupon = response.data[0];
        return {
          valid: true,
          amount: coupon.amount,
          discount_type: coupon.discount_type
        };
      }
      
      return { valid: false, amount: '0', discount_type: 'fixed_cart' };
    } catch (error) {
      console.error('Error al validar cupón:', error);
      return { valid: false, amount: '0', discount_type: 'fixed_cart' };
    }
  }
};

export default orderService;
