import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types/woocommerce';
import alertService from '../services/alertService';

// Definir la interfaz para el contexto
interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  discount: number;
  shipping: number;
  couponApplied: boolean;
  couponCode: string;
  couponDiscount: number;
  addItem: (product: Product, quantity?: number, variation_id?: number, variation?: any) => void;
  updateItemQuantity: (productId: number, quantity: number, variation_id?: number, showAlert?: boolean) => void;
  removeItem: (productId: number, variation_id?: number, skipAlert?: boolean) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discountPercentage: number) => void;
  removeCoupon: () => void;
  isLoading: boolean;
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Proveedor del contexto
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  // Cargar items del localStorage al iniciar
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Actualizar localStorage cuando cambian los items
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage();
      calculateTotals();
    }
  }, [items, couponApplied, couponDiscount, isLoading]);

  // Cargar carrito desde localStorage
  const loadCartFromStorage = () => {
    try {
      const cartItemsJson = localStorage.getItem('cart_items');
      if (cartItemsJson) {
        const loadedItems = JSON.parse(cartItemsJson);
        
        // Validar y filtrar items
        const validItems = loadedItems.filter((item: CartItem) => 
          item && item.id && item.product && item.quantity > 0
        );
        
        setItems(validItems);
        
        // Cargar estado del cupón si existe
        const couponJson = localStorage.getItem('cart_coupon');
        if (couponJson) {
          const couponData = JSON.parse(couponJson);
          setCouponApplied(couponData.applied);
          setCouponCode(couponData.code);
          setCouponDiscount(couponData.discount);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      setItems([]);
      setIsLoading(false);
    }
  };

  // Guardar carrito en localStorage
  const saveCartToStorage = () => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items));
      
      // Guardar estado del cupón
      const couponData = {
        applied: couponApplied,
        code: couponCode,
        discount: couponDiscount
      };
      localStorage.setItem('cart_coupon', JSON.stringify(couponData));
    } catch (error) {
      console.error('Error al guardar el carrito:', error);
    }
  };

  // Calcular totales
  const calculateTotals = () => {
    // Calcular subtotal
    const newSubtotal = items.reduce((acc, item) => {
      const price = parseFloat(item.product.price);
      return acc + (price * item.quantity);
    }, 0);
    
    setSubtotal(newSubtotal);
    
    // Calcular descuento
    const newDiscount = couponApplied ? (newSubtotal * (couponDiscount / 100)) : 0;
    setDiscount(newDiscount);
    
    // Calcular envío (gratis si el subtotal es mayor a 100,000)
    const newShipping = newSubtotal > 100000 ? 0 : 10000;
    setShipping(newShipping);
    
    // Calcular total
    const newTotal = newSubtotal - newDiscount + newShipping;
    setTotal(newTotal);
    
    // Calcular cantidad de items
    const newItemCount = items.reduce((count, item) => count + item.quantity, 0);
    setItemCount(newItemCount);
  };

  // Añadir un item al carrito
  const addItem = (product: Product, quantity = 1, variation_id?: number, variation?: any) => {
    // Buscar si el producto ya existe en el carrito
    const existingItemIndex = items.findIndex(item => 
      item.id === product.id && 
      (variation_id ? item.variation_id === variation_id : true)
    );
    
    if (existingItemIndex !== -1) {
      // Actualizar cantidad si el producto ya existe
      const updatedItems = [...items];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      updatedItems[existingItemIndex].quantity = newQuantity;
      setItems(updatedItems);
      
      // Si se agrega más de una unidad a la vez, usar mensaje plural
      if (quantity > 1) {
        alertService.success(`${quantity} unidades de ${product.name} agregadas al carrito`);
      } else {
        alertService.success(`Unidad de ${product.name} agregada al carrito`);
      }
    } else {
      // Añadir nuevo producto al carrito
      const newItem: CartItem = {
        id: product.id,
        product,
        quantity,
        variation_id,
        variation
      };
      
      setItems(prevItems => [...prevItems, newItem]);
      
      // Si se agrega más de una unidad a la vez, usar mensaje plural
      if (quantity > 1) {
        alertService.success(`${quantity} unidades de ${product.name} agregadas al carrito`);
      } else {
        alertService.success(`${product.name} agregado al carrito`);
      }
    }
  };

  // Actualizar cantidad de un item
  const updateItemQuantity = (productId: number, quantity: number, variation_id?: number, showAlert: boolean = false) => {
    if (quantity <= 0) {
      removeItem(productId, variation_id, !showAlert); // Si showAlert es true, no omitir la alerta en removeItem
      return;
    }
    
    const itemToUpdate = items.find(item => 
      item.id === productId && 
      (variation_id ? item.variation_id === variation_id : true)
    );
    
    if (itemToUpdate) {
      const currentQuantity = itemToUpdate.quantity;
      const updatedItems = items.map(item => 
        (item.id === productId && 
         (variation_id ? item.variation_id === variation_id : true))
          ? { ...item, quantity }
          : item
      );
      
      setItems(updatedItems);
      
      // Mostrar alerta solo si se solicita explícitamente
      if (showAlert) {
        if (quantity > currentQuantity) {
          // Si se incrementa la cantidad
          if (currentQuantity === 0) {
            alertService.success(`${itemToUpdate.product.name} agregado al carrito`);
          } else {
            alertService.success(`Unidad de ${itemToUpdate.product.name} agregada al carrito`);
          }
        } else if (quantity < currentQuantity) {
          // Si se disminuye la cantidad
          alertService.info(`Unidad de ${itemToUpdate.product.name} eliminada`);
        }
      }
    }
  };

  // Eliminar un item del carrito
  const removeItem = (productId: number, variation_id?: number, skipAlert: boolean = false) => {
    const itemToRemove = items.find(item => 
      item.id === productId && 
      (variation_id ? item.variation_id === variation_id : true)
    );
    
    if (itemToRemove) {
      const productName = itemToRemove.product.name;
      
      const updatedItems = items.filter(item => 
        !(item.id === productId && 
          (variation_id ? item.variation_id === variation_id : true))
      );
      
      setItems(updatedItems);
      
      // Mostrar alerta solo si no viene de updateItemQuantity
      if (!skipAlert) {
        alertService.info(`${productName} eliminado del carrito`);
      }
    }
  };

  // Vaciar el carrito
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart_items');
    alertService.info('Carrito vaciado');
  };

  // Aplicar cupón
  const applyCoupon = (code: string, discountPercentage: number) => {
    setCouponApplied(true);
    setCouponCode(code);
    setCouponDiscount(discountPercentage);
    alertService.success(`Cupón ${code} aplicado con éxito`);
  };

  // Eliminar cupón
  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponDiscount(0);
    alertService.info('Cupón eliminado');
  };

  const contextValue: CartContextType = {
    items,
    itemCount,
    subtotal,
    total,
    discount,
    shipping,
    couponApplied,
    couponCode,
    couponDiscount,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    isLoading
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
