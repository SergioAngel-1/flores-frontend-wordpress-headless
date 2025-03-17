import { useState, useEffect } from 'react';
import { productService, categoryService, orderService } from '../services/api';
import { Product, Category, Order } from '../types/woocommerce';

interface UseWooCommerceState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Hook para productos
export const useProducts = (categoryId?: number) => {
  const [state, setState] = useState<UseWooCommerceState<Product[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const response = categoryId 
          ? await productService.getByCategory(categoryId)
          : await productService.getAll();
          
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Error desconocido al cargar productos'),
        });
      }
    };

    fetchProducts();
  }, [categoryId]);

  return state;
};

// Hook para un producto específico
export const useProduct = (productId: number) => {
  const [state, setState] = useState<UseWooCommerceState<Product>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const response = await productService.getById(productId);
        
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error(`Error desconocido al cargar el producto ${productId}`),
        });
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  return state;
};

// Hook para categorías
export const useCategories = () => {
  const [state, setState] = useState<UseWooCommerceState<Category[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const response = await categoryService.getAll();
        
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Error desconocido al cargar categorías'),
        });
      }
    };

    fetchCategories();
  }, []);

  return state;
};

// Hook para crear un pedido
export const useCreateOrder = () => {
  const [state, setState] = useState<UseWooCommerceState<Order>>({
    data: null,
    loading: false,
    error: null,
  });

  const createOrder = async (orderData: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await orderService.createOrder(orderData);
        
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      
      return response.data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Error desconocido al crear el pedido'),
      });
      throw error;
    }
  };

  return { ...state, createOrder };
};

// Hook para buscar productos
export const useSearchProducts = (searchTerm: string) => {
  const [state, setState] = useState<UseWooCommerceState<Product[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchTerm || searchTerm.trim() === '') {
        setState({
          data: [],
          loading: false,
          error: null,
        });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const response = await productService.search(searchTerm);
          
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Error desconocido al buscar productos'),
        });
      }
    };

    fetchProducts();
  }, [searchTerm]);

  return state;
};

export default {
  useProducts,
  useProduct,
  useCategories,
  useCreateOrder,
  useSearchProducts,
};
