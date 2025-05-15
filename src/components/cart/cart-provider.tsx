'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, Variant, CartItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variant: Variant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shopify_headless_express_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product: Product, variant: Variant, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.selectedVariant.id === variant.id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        if (newQuantity <= variant.stock) {
            updatedItems[existingItemIndex].quantity = newQuantity;
             toast({ title: "Cart Updated", description: `${product.name} (${variant.name}) quantity increased.` });
        } else {
            toast({ title: "Stock Limit", description: `Cannot add more ${product.name} (${variant.name}). Max stock is ${variant.stock}.`, variant: "destructive" });
        }
        return updatedItems;
      } else {
        if (quantity <= variant.stock) {
            toast({ title: "Added to Cart", description: `${product.name} (${variant.name}) added to cart.` });
            return [...prevItems, { ...product, selectedVariant: variant, quantity }];
        } else {
             toast({ title: "Stock Limit", description: `Cannot add ${product.name} (${variant.name}). Max stock is ${variant.stock}.`, variant: "destructive" });
             return prevItems;
        }
      }
    });
    setIsCartOpen(true);
  }, [toast]);

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId && item.selectedVariant.id === variantId);
      if (itemToRemove) {
        toast({ title: "Item Removed", description: `${itemToRemove.name} (${itemToRemove.selectedVariant.name}) removed from cart.` });
      }
      return prevItems.filter(
        item => !(item.id === productId && item.selectedVariant.id === variantId)
      );
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId && item.selectedVariant.id === variantId) {
          if (quantity > 0 && quantity <= item.selectedVariant.stock) {
            toast({ title: "Quantity Updated", description: `${item.name} (${item.selectedVariant.name}) quantity set to ${quantity}.` });
            return { ...item, quantity };
          } else if (quantity > item.selectedVariant.stock) {
            toast({ title: "Stock Limit", description: `Max stock for ${item.name} (${item.selectedVariant.name}) is ${item.selectedVariant.stock}.`, variant: "destructive" });
            return { ...item, quantity: item.selectedVariant.stock }; // Set to max stock
          } else { // quantity <= 0
            return item; // Or handle removal, but current removeFromCart is separate
          }
        }
        return item;
      }).filter(item => item.quantity > 0) // Remove if quantity becomes 0 implicitly
    );
  }, [toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({ title: "Cart Cleared", description: "All items removed from cart." });
  }, [toast]);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.selectedVariant.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
