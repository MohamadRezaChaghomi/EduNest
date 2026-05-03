'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // بارگذاری اولیه از localStorage با استفاده از initializer function
  const [items, setItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // ذخیره در localStorage هنگام تغییر items (این useEffect مجاز است چون بعد از رندر اتفاق می‌افتد)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (course) => {
    setItems(prev => {
      const exists = prev.find(item => item._id === course._id);
      if (exists) return prev;
      return [...prev, { ...course, quantity: 1 }];
    });
  };

  const removeFromCart = (courseId) => {
    setItems(prev => prev.filter(item => item._id !== courseId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((sum, item) => {
      const price = item.discountPrice || item.price;
      return sum + price;
    }, 0);
  };

  const getCartCount = () => items.length;

  const isInCart = (courseId) => items.some(item => item._id === courseId);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}