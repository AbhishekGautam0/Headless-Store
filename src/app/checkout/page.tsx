'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/cart/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ShoppingBag } from 'lucide-react';
// import type { Metadata } from 'next'; // Metadata is not used in client components this way

// Client component, so metadata is illustrative or would be set by a parent server component
// export const metadata: Metadata = {
//   title: 'Checkout - Shopify Headless Express',
//   description: 'Review your order and complete your purchase.',
// };


export default function CheckoutPage() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();

  if (cartCount === 0) {
    return (
      <div className="page-width py-12 text-center">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-6" strokeWidth={1} />
        <h1 className="text-3xl font-semibold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          You have no items in your cart to checkout.
        </p>
        <Button asChild size="lg">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }
  
  const handlePlaceOrder = () => {
    // This is a dummy action. In a real app, this would trigger payment processing.
    alert('Order Placed (Demo)! Thank you for your purchase.');
    clearCart();
    // Potentially redirect to an order confirmation page
  };

  return (
    <div className="page-width py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review the items in your cart.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.selectedVariant.id}`} className="flex items-center py-4 gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.images[0].src}
                      alt={item.images[0].alt}
                      fill
                      className="object-cover"
                      data-ai-hint={item.images[0].dataAiHint || "product image"}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.selectedVariant.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="font-medium">
                    ${(item.selectedVariant.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-24"> {/* Make summary card sticky */}
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-sm text-muted-foreground">Calculated at next step (Free for demo)</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span className="text-sm text-muted-foreground">Calculated at next step (None for demo)</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Order Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
                <div className="flex items-start p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-xs">
                    This is a demo checkout. No real payment will be processed.
                    </p>
                </div>
              <Button size="lg" className="w-full" onClick={handlePlaceOrder}>
                Place Order (Demo)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
