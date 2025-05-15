
import { Logo } from './logo';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { CartIcon } from '@/components/cart/cart-icon';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="page-width flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <MainNav className="mx-6" />
        </div>
        <div className="flex items-center space-x-2">
          <CartIcon />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
