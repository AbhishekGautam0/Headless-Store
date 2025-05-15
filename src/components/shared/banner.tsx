import type { ReactNode } from 'react';
import Image from 'next/image';

interface BannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string; // Will now be a path like /images/my-banner.jpg
  imageAlt?: string;
  // imageAiHint removed as it's for placeholders
  children?: ReactNode;
}

export function Banner({ title, subtitle, imageUrl, imageAlt, children }: BannerProps) {
  const hasImage = imageUrl && imageAlt;

  return (
    <section className={`relative py-16 md:py-24 ${hasImage ? 'text-white' : 'bg-muted/30'}`}>
      {hasImage && (
        <Image
          src={imageUrl} // e.g., /images/banner.jpg
          alt={imageAlt}
          fill
          className="object-cover z-0"
          priority
          // data-ai-hint removed
        />
      )}
      {hasImage && <div className="absolute inset-0 bg-black/50 z-0"></div>}
      <div className="page-width relative z-10 text-center">
        <h1 className={`text-4xl md:text-5xl font-bold ${hasImage ? 'text-white' : 'text-foreground'}`}>{title}</h1>
        {subtitle && <p className={`mt-4 text-lg md:text-xl ${hasImage ? 'text-gray-200' : 'text-muted-foreground'}`}>{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
