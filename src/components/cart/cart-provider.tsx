
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
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) { // Basic validation
          setCartItems(parsedCart);
        } else {
          localStorage.removeItem(CART_STORAGE_KEY); // Clear invalid data
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem(CART_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product: Product, variant: Variant, quantity: number = 1) => {
    let toastProps: { title: string; description: string; variant?: 'default' | 'destructive' } | null = null;
    let shouldOpenCart = false;

    if (!variant.availableForSale) {
      toastProps = { title: "Not Available", description: `${product.name} (${variant.name}) is currently not available for purchase.`, variant: "destructive"};
    } else {
      // Product is availableForSale
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(
          item => item.id === product.id && item.selectedVariant.id === variant.id
        );

        if (existingItemIndex > -1) { // Item already in cart
          const updatedItems = [...prevItems];
          const currentItem = updatedItems[existingItemIndex];
          let newQuantity = currentItem.quantity + quantity;

          // Only limit by stock if stock is tracked (greater than 0)
          if (variant.stock > 0 && newQuantity > variant.stock) {
            newQuantity = variant.stock; // Cap at available stock
            toastProps = { title: "Stock Limit Reached", description: `Maximum available stock for ${product.name} (${variant.name}) reached. Total in cart: ${newQuantity}.`, variant: "destructive" };
          } else {
            toastProps = { title: "Cart Updated", description: `${quantity} more ${product.name} (${variant.name}) added. Total: ${newQuantity}.` };
          }
          updatedItems[existingItemIndex].quantity = newQuantity;
          shouldOpenCart = true;
          return updatedItems;

        } else { // Adding new item
          let quantityToAdd = quantity;
          // Only limit by stock if stock is tracked (greater than 0)
          if (variant.stock > 0 && quantityToAdd > variant.stock) {
            quantityToAdd = variant.stock; // Cap at available stock
            toastProps = { title: "Stock Limit Reached", description: `Only ${variant.stock} of ${product.name} (${variant.name}) available. Added ${quantityToAdd} to cart.`, variant: "destructive" };
          } else {
            toastProps = { title: "Added to Cart", description: `${quantityToAdd} x ${product.name} (${variant.name}) added to cart.` };
          }
          shouldOpenCart = true;
          return [...prevItems, { ...product, selectedVariant: variant, quantity: quantityToAdd }];
        }
      });
    }

    if (toastProps) {
      const finalToastProps = toastProps; 
      setTimeout(() => { 
        toast(finalToastProps);
        if (shouldOpenCart && !isCartOpen) { // Only open if not already open
          setIsCartOpen(true);
        }
      }, 0);
    }
  }, [toast, isCartOpen]); // Added isCartOpen to dependencies

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    let itemRemovedName = "";
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId && item.selectedVariant.id === variantId);
      if (itemToRemove) {
        itemRemovedName = `${itemToRemove.name} (${itemToRemove.selectedVariant.name})`;
      }
      return prevItems.filter(
        item => !(item.id === productId && item.selectedVariant.id === variantId)
      );
    });
    if (itemRemovedName) {
      const finalItemName = itemRemovedName;
       setTimeout(() => {
        toast({ title: "Item Removed", description: `${finalItemName} removed from cart.` });
      }, 0);
    }
  }, [toast]);

  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    const toastMessagesCollector: Array<{ title: string; description: string; variant?: 'default' | 'destructive' }> = [];
    
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId && item.selectedVariant.id === variantId) {
          if (!item.selectedVariant.availableForSale) {
            toastMessagesCollector.push({ title: "Not Available", description: `${item.name} (${item.selectedVariant.name}) is no longer available. Quantity not changed.`, variant: "destructive" });
            return item; 
          }
          
          if (quantity <= 0) {
             toastMessagesCollector.push({ title: "Item Removed", description: `${item.name} (${item.selectedVariant.name}) removed due to quantity set to 0 or less.`});
             return { ...item, quantity: 0 }; // Mark for removal
          }

          // Only limit by stock if stock is tracked (greater than 0)
          if (item.selectedVariant.stock > 0 && quantity > item.selectedVariant.stock) {
            toastMessagesCollector.push({ title: "Stock Limit", description: `Max stock for ${item.name} (${item.selectedVariant.name}) is ${item.selectedVariant.stock}. Quantity set to ${item.selectedVariant.stock}.`, variant: "destructive" });
            return { ...item, quantity: item.selectedVariant.stock }; // Set to max stock
          }
          
          // If quantity is valid and within stock (if tracked) or no stock tracking
          toastMessagesCollector.push({ title: "Quantity Updated", description: `${item.name} (${item.selectedVariant.name}) quantity set to ${quantity}.` });
          return { ...item, quantity };
        }
        return item;
      }).filter(item => item.quantity > 0) 
    );

    if (toastMessagesCollector.length > 0) {
      setTimeout(() => {
        toastMessagesCollector.forEach(msg => toast(msg));
      }, 0);
    }
  }, [toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setTimeout(() => {
      toast({ title: "Cart Cleared", description: "All items removed from cart." });
    }, 0);
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
