'use client';

import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from './cart-provider';
import { CartItemCard } from './cart-item-card';

export function CartDrawer() {
  const { cartItems, cartTotal, cartCount, isCartOpen, setIsCartOpen, clearCart } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            Shopping Cart ({cartCount})
             <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>

        {cartCount > 0 ? (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="divide-y divide-border">
                {cartItems.map((item) => (
                  <CartItemCard key={`${item.id}-${item.selectedVariant.id}`} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="flex-col space-y-4 border-t bg-background p-4 shadow-inner">
              <div className="flex justify-between text-base font-medium">
                <p>Subtotal</p>
                <p>${cartTotal.toFixed(2)}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-2 flex flex-col space-y-2">
                <Button asChild size="lg" onClick={() => setIsCartOpen(false)}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button variant="outline" size="lg" onClick={() => clearCart()}>
                  Clear Cart
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground" strokeWidth={1}/>
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Button asChild onClick={() => setIsCartOpen(false)}>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
