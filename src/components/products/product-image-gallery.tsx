'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ProductImage as ProductImageType } from '@/lib/types';

interface ProductImageGalleryProps {
  images: ProductImageType[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  useEffect(() => {
    // Ensure selectedImage is updated if images prop changes and current selectedImage is no longer valid
    if (images && images.length > 0) {
        const currentSelectedExists = images.find(img => img.id === selectedImage?.id);
        if (!currentSelectedExists) {
            setSelectedImage(images[0]);
        } else if (!selectedImage) { // If selectedImage was null but images are now present
            setSelectedImage(images[0]);
        }
    } else if (images && images.length === 0) {
        setSelectedImage(undefined as any); // Explicitly set to undefined if no images
    }
  }, [images, selectedImage]);


  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
        <Image 
            src="https://placehold.co/600x600.png" 
            alt="Placeholder image" 
            width={600} 
            height={600} 
            className="object-cover" 
        />
      </div>
    );
  }
  
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
          // data-ai-hint removed
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
                // data-ai-hint removed
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
