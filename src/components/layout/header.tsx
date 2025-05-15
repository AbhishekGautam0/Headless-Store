
import { Logo } from './logo';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { CartIcon } from '@/components/cart/cart-icon';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Set .page-width to relative to allow absolute positioning for the nav */}
      <div className="page-width relative flex h-16 items-center justify-between">
        {/* Left Aligned Logo */}
        <div className="flex flex-shrink-0 items-center">
          <Logo />
        </div>

        {/* Centered Main Navigation for medium screens and up */}
        {/* Positioned absolutely to ensure true centering within the page-width div */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <MainNav /> {/* MainNav itself handles its internal link spacing */}
        </div>

        {/* Right Aligned Icons */}
        <div className="flex flex-shrink-0 items-center space-x-2">
          <CartIcon />
          {/* MobileNav is responsible for showing hamburger on small screens */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
