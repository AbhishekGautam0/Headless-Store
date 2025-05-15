import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithTextProps {
  imageUrl: string;
  imageAlt: string;
  imageAiHint?: string;
  title: string;
  text: string | ReactNode;
  imagePosition?: 'left' | 'right';
  children?: ReactNode; // For CTAs or extra content
}

export function ImageWithText({
  imageUrl,
  imageAlt,
  imageAiHint,
  title,
  text,
  imagePosition = 'left',
  children,
}: ImageWithTextProps) {
  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className={cn(
          "grid md:grid-cols-2 gap-8 md:gap-12 items-center",
          imagePosition === 'right' ? 'md:grid-flow-col-dense' : ''
        )}>
          <div className={cn(
            "relative aspect-video md:aspect-[4/3] rounded-lg overflow-hidden shadow-lg",
            imagePosition === 'right' ? 'md:col-start-2' : ''
          )}>
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint={imageAiHint || "section image"}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">{title}</h2>
            {typeof text === 'string' ? <p className="text-muted-foreground text-lg">{text}</p> : text}
            {children && <div className="mt-6">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
