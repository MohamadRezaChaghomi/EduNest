'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Load initial cart from localStorage (only once on mount)
  const [items, setItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Add course to cart (prevent duplicates)
  const addToCart = useCallback((course) => {
    setItems((prev) => {
      const exists = prev.find((item) => item._id === course._id);
      if (exists) return prev;
      return [...prev, { ...course, quantity: 1 }];
    });
  }, []);

  // Remove course from cart by ID
  const removeFromCart = useCallback((courseId) => {
    setItems((prev) => prev.filter((item) => item._id !== courseId));
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate total price (discount price takes priority)
  const getCartTotal = useCallback(() => {
    return items.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0;
      return sum + price;
    }, 0);
  }, [items]);

  // Get number of items in cart
  const getCartCount = useCallback(() => items.length, [items]);

  // Check if a course is already in cart
  const isInCart = useCallback((courseId) => items.some((item) => item._id === courseId), [items]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    isInCart,
  }), [items, addToCart, removeFromCart, clearCart, getCartTotal, getCartCount, isInCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}