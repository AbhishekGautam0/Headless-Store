
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

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.selectedVariant.id === variant.id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];
        const newQuantity = currentItem.quantity + quantity;
        
        if (!variant.availableForSale) {
          toastProps = { title: "Not Available", description: `${product.name} (${variant.name}) is currently not available.`, variant: "destructive"};
          return updatedItems; // Do not update quantity
        }
        if (newQuantity <= variant.stock) {
            updatedItems[existingItemIndex].quantity = newQuantity;
            toastProps = { title: "Cart Updated", description: `${product.name} (${variant.name}) quantity increased.` };
        } else {
            // If trying to add more than available stock, add up to stock.
            if (currentItem.quantity < variant.stock) {
                 updatedItems[existingItemIndex].quantity = variant.stock;
                 toastProps = { title: "Stock Limit Reached", description: `Added up to available stock for ${product.name} (${variant.name}). Max stock is ${variant.stock}.`, variant: "destructive" };
            } else {
                toastProps = { title: "Stock Limit", description: `Cannot add more ${product.name} (${variant.name}). Max stock is ${variant.stock}.`, variant: "destructive" };
            }
        }
        return updatedItems;
      } else {
        if (!variant.availableForSale) {
            toastProps = { title: "Not Available", description: `${product.name} (${variant.name}) is currently not available.`, variant: "destructive"};
            return prevItems;
        }
        if (quantity <= variant.stock) {
            toastProps = { title: "Added to Cart", description: `${product.name} (${variant.name}) added to cart.` };
            return [...prevItems, { ...product, selectedVariant: variant, quantity }];
        } else {
             // If trying to add more than available stock, add up to stock.
             if (variant.stock > 0) {
                toastProps = { title: "Stock Limit Reached", description: `Added up to available stock for ${product.name} (${variant.name}). Adding ${variant.stock}.`, variant: "destructive" };
                return [...prevItems, { ...product, selectedVariant: variant, quantity: variant.stock }];
             } else {
                toastProps = { title: "Out of Stock", description: `${product.name} (${variant.name}) is out of stock.`, variant: "destructive" };
                return prevItems;
             }
        }
      }
    });

    if (toastProps) {
      const finalToastProps = toastProps;
      setTimeout(() => {
        toast(finalToastProps);
      }, 0);
    }
    if (toastProps?.variant !== 'destructive' || toastProps.title === "Cart Updated" || toastProps.title === "Stock Limit Reached") { // Open cart unless it was a hard "Not Available" or "Out of Stock"
        setIsCartOpen(true);
    }
  }, [toast]);

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
            toastMessagesCollector.push({ title: "Not Available", description: `${item.name} (${item.selectedVariant.name}) is no longer available for sale.`, variant: "destructive" });
            return item; // Keep current quantity or remove if 0 by filter below
          }
          if (quantity > 0 && quantity <= item.selectedVariant.stock) {
            toastMessagesCollector.push({ title: "Quantity Updated", description: `${item.name} (${item.selectedVariant.name}) quantity set to ${quantity}.` });
            return { ...item, quantity };
          } else if (quantity > item.selectedVariant.stock) {
            toastMessagesCollector.push({ title: "Stock Limit", description: `Max stock for ${item.name} (${item.selectedVariant.name}) is ${item.selectedVariant.stock}. Set to max.`, variant: "destructive" });
            return { ...item, quantity: item.selectedVariant.stock }; // Set to max stock
          } else { 
             // Quantity <= 0, will be filtered out. Can add a "removed" toast if desired.
             // For now, implicit removal by filter.
            return { ...item, quantity: 0 }; // Mark for removal
          }
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
