export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          &copy; {new Date().getFullYear()} Shopify Headless Express. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
