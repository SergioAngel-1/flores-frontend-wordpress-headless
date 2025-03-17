import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CartItem, 
  getCart, 
  addToCart as apiAddToCart, 
  updateCartItem as apiUpdateCartItem, 
  removeCartItem as apiRemoveCartItem, 
  clearCart as apiClearCart 
} from '../services/api';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  itemCount: number;
  subtotal: number;
  total: number;
  discount: number;
  couponCode: string | null;
  addItem: (productId: number, quantity: number, variantId?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number, variantId?: number) => Promise<void>;
  removeItem: (productId: number, variantId?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Cargar carrito al iniciar
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const cartItems = await getCart();
        setItems(cartItems);
        
        // Cargar cupón guardado si existe
        const savedCoupon = localStorage.getItem('couponCode');
        if (savedCoupon) {
          setCouponCode(savedCoupon);
          // En una implementación real, verificaríamos el cupón con el servidor
          calculateDiscount(savedCoupon, cartItems);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('No se pudo cargar el carrito. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Calcular subtotal
  const calculateSubtotal = (cartItems: CartItem[]): number => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Calcular descuento (simulado)
  const calculateDiscount = (code: string, cartItems: CartItem[]): number => {
    const subtotal = calculateSubtotal(cartItems);
    let discountAmount = 0;

    // Simulación de cupones
    switch (code.toUpperCase()) {
      case 'WELCOME10':
        discountAmount = subtotal * 0.1; // 10% de descuento
        break;
      case 'FLORES20':
        discountAmount = subtotal * 0.2; // 20% de descuento
        break;
      case 'FREESHIP':
        discountAmount = 15000; // Envío gratis (valor fijo)
        break;
      default:
        discountAmount = 0;
    }

    setDiscount(discountAmount);
    return discountAmount;
  };

  // Añadir item al carrito
  const addItem = async (productId: number, quantity: number, variantId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await apiAddToCart(productId, quantity, variantId);
      setItems(updatedCart);
      
      // Recalcular descuento si hay cupón aplicado
      if (couponCode) {
        calculateDiscount(couponCode, updatedCart);
      }
    } catch (err: any) {
      setError('No se pudo añadir el producto al carrito. Por favor, intenta de nuevo.');
      console.error('Error adding item to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar item en el carrito
  const updateItem = async (productId: number, quantity: number, variantId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await apiUpdateCartItem(productId, quantity, variantId);
      setItems(updatedCart);
      
      // Recalcular descuento si hay cupón aplicado
      if (couponCode) {
        calculateDiscount(couponCode, updatedCart);
      }
    } catch (err: any) {
      setError('No se pudo actualizar el carrito. Por favor, intenta de nuevo.');
      console.error('Error updating cart item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar item del carrito
  const removeItem = async (productId: number, variantId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await apiRemoveCartItem(productId, variantId);
      setItems(updatedCart);
      
      // Recalcular descuento si hay cupón aplicado
      if (couponCode) {
        calculateDiscount(couponCode, updatedCart);
      }
    } catch (err: any) {
      setError('No se pudo eliminar el producto del carrito. Por favor, intenta de nuevo.');
      console.error('Error removing cart item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClearCart();
      setItems([]);
      setDiscount(0);
      setCouponCode(null);
      localStorage.removeItem('couponCode');
    } catch (err: any) {
      setError('No se pudo vaciar el carrito. Por favor, intenta de nuevo.');
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar cupón
  const applyCoupon = async (code: string) => {
    try {
      // En una implementación real, verificaríamos el cupón con el servidor
      const discountAmount = calculateDiscount(code, items);
      
      if (discountAmount > 0) {
        setCouponCode(code);
        localStorage.setItem('couponCode', code);
      } else {
        setError('Cupón inválido o expirado.');
        setCouponCode(null);
        setDiscount(0);
        localStorage.removeItem('couponCode');
      }
    } catch (err: any) {
      setError('No se pudo aplicar el cupón. Por favor, intenta de nuevo.');
      console.error('Error applying coupon:', err);
    }
  };

  // Eliminar cupón
  const removeCoupon = () => {
    setCouponCode(null);
    setDiscount(0);
    localStorage.removeItem('couponCode');
  };

  // Calcular número total de items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  
  // Calcular subtotal
  const subtotal = calculateSubtotal(items);
  
  // Calcular total (subtotal - descuento)
  const total = Math.max(subtotal - discount, 0);

  const value = {
    items,
    loading,
    error,
    itemCount,
    subtotal,
    total,
    discount,
    couponCode,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
