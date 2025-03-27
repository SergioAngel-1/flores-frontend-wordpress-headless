import { Product } from '../types/woocommerce';

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
  variation_id?: number;
  variation?: any;
}

// Servicio de carrito
const cartService = {
  // Obtener los items del carrito
  getItems(): CartItem[] {
    const cartItems = localStorage.getItem('cart_items');
    return cartItems ? JSON.parse(cartItems) : [];
  },

  // Añadir un item al carrito
  addItem(product: Product, quantity: number = 1, variation_id?: number, variation?: any): CartItem[] {
    const cartItems = this.getItems();
    
    // Comprobar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(item => 
      item.id === product.id && (variation_id ? item.variation_id === variation_id : true)
    );
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad si el producto ya existe
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Añadir nuevo producto al carrito
      cartItems.push({
        id: product.id,
        product,
        quantity,
        variation_id,
        variation
      });
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
    
    return cartItems;
  },

  // Actualizar cantidad de un item en el carrito
  updateItemQuantity(productId: number, quantity: number, variation_id?: number): CartItem[] {
    const cartItems = this.getItems();
    
    const itemIndex = cartItems.findIndex(item => 
      item.id === productId && (variation_id ? item.variation_id === variation_id : true)
    );
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Eliminar el item si la cantidad es 0 o menor
        cartItems.splice(itemIndex, 1);
      } else {
        // Actualizar la cantidad
        cartItems[itemIndex].quantity = quantity;
      }
      
      // Guardar en localStorage
      localStorage.setItem('cart_items', JSON.stringify(cartItems));
    }
    
    return cartItems;
  },

  // Eliminar un item del carrito
  removeItem(productId: number, variation_id?: number): CartItem[] {
    const cartItems = this.getItems();
    
    const updatedItems = cartItems.filter(item => 
      !(item.id === productId && (variation_id ? item.variation_id === variation_id : true))
    );
    
    // Guardar en localStorage
    localStorage.setItem('cart_items', JSON.stringify(updatedItems));
    
    return updatedItems;
  },

  // Vaciar el carrito
  clearCart(): void {
    localStorage.removeItem('cart_items');
  },

  // Calcular el total del carrito
  getCartTotal(): number {
    const cartItems = this.getItems();
    
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price);
      return total + (price * item.quantity);
    }, 0);
  },

  // Contar el número de items en el carrito
  getItemCount(): number {
    const cartItems = this.getItems();
    
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }
};

export default cartService;
