'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ProductImage as ProductImageType } from '@/lib/types'; // Renamed to avoid conflict

interface ProductImageGalleryProps {
  images: ProductImageType[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
        <p>No image available</p>
      </div>
    );
  }
  
  // Ensure selectedImage is always valid
  React.useEffect(() => {
    if (!images.find(img => img.id === selectedImage?.id)) {
      setSelectedImage(images[0]);
    }
  }, [images, selectedImage]);


  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg">
        <Image
          src={selectedImage?.src || 'https://placehold.co/600x600.png'}
          alt={selectedImage?.alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-opacity duration-300 ease-in-out"
          priority
          data-ai-hint={selectedImage?.dataAiHint || "product detail"}
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className={cn(
                "aspect-square relative overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                selectedImage?.id === image.id ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-80"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="10vw"
                className="object-cover"
                data-ai-hint={image.dataAiHint || "thumbnail image"}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
