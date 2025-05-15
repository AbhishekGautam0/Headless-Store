
'use client';

import type { Variant } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface ProductVariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant;
  onVariantChange: (variant: Variant) => void;
}

export function ProductVariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
}: ProductVariantSelectorProps) {
  if (!variants || variants.length === 0) { 
    return <p className="text-sm text-muted-foreground">No options available for this product.</p>;
  }
  // If only one variant, and it might be something like "Default Title", don't show selector
  if (variants.length === 1 && (variants[0].name.toLowerCase() === "default title" || variants[0].name === selectedVariant.name)) {
      return null;
  }


  const handleValueChange = (variantId: string) => {
    const newSelectedVariant = variants.find(v => v.id === variantId);
    if (newSelectedVariant) {
      onVariantChange(newSelectedVariant);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">
          Select Option: <span className="font-semibold">{selectedVariant.name}</span>
        </Label>
        <RadioGroup
          value={selectedVariant.id}
          onValueChange={handleValueChange}
          className="mt-2 flex flex-wrap gap-2"
        >
          {variants.map((variant) => (
            <Label
              key={variant.id}
              htmlFor={`variant-${variant.id}`}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-md border py-2 px-4 text-sm font-medium transition-colors focus:outline-none",
                selectedVariant.id === variant.id
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary"
                  : "border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
                !variant.availableForSale ? "cursor-not-allowed opacity-50 line-through" : ""
              )}
            >
              <RadioGroupItem
                value={variant.id}
                id={`variant-${variant.id}`}
                className="sr-only"
                disabled={!variant.availableForSale}
              />
              {variant.name}
               {!variant.availableForSale && <span className="ml-1 text-xs">(Out of stock)</span>}
            </Label>
          ))}
        </RadioGroup>
      </div>
      {selectedVariant.availableForSale && selectedVariant.stock > 0 && selectedVariant.stock < 10 && (
        <p className="text-sm text-orange-600">
          Only {selectedVariant.stock} left in stock!
        </p>
      )}
       {!selectedVariant.availableForSale && (
        <p className="text-sm text-destructive">
          This option is currently out of stock.
        </p>
      )}
    </div>
  );
}
