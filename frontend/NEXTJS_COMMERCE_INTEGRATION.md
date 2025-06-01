# Next.js Commerce Integration with VFR-Anna Try-On

This document explains how to integrate VFR-Anna 3D try-on functionality into a Next.js Commerce storefront.

## Overview

The integration adds a "Try On in 3D" button to product pages that opens the VFR-Anna demo in a modal, passing the product SKU via URL parameters.

## Implementation Steps

### 1. Create TryOnButton Component

Created `app/components/TryOnButton.tsx` that:
- Opens a modal with an iframe to the VFR demo
- Passes the product SKU as a query parameter
- Provides a clean, accessible UI

```tsx
<TryOnButton sku={product.sku} />
```

### 2. Update Product Pages

In your product detail component (`app/components/product/ProductView.tsx`):
- Import the TryOnButton component
- Replace or add alongside existing AR/try-on buttons

### 3. Configure VFR Demo to Accept SKU

Updated `public/cegeka-demo.html` to:
- Read SKU from URL parameters
- Map SKU to appropriate clothing model
- Auto-select the product on load

```javascript
const sku = urlParams.get('sku');
if (sku) {
    // Map SKU to product and auto-select
}
```

## SKU Mapping

Current SKU to product mapping:
- `basic-tee` → Basic T-Shirt
- `tech-hoodie` → Tech Hoodie
- `sport-jacket` → Sport Jacket
- `premium-polo` → Premium Polo

## Benefits

1. **Seamless Integration**: Works with any e-commerce platform
2. **No CORS Issues**: Same-origin iframe communication
3. **Isolated Concerns**: Commerce and 3D demo remain separate
4. **Easy Deployment**: Single Vercel deployment serves both

## Usage Example

```tsx
// In your product page
<ProductView product={{
  id: "1",
  name: "Tech Hoodie",
  sku: "tech-hoodie",
  price: 89.99,
  // ... other product data
}} />
```

## Deployment

Deploy to Vercel:
```bash
vercel --prod --scope your-scope
```

The same deployment serves:
- Main commerce site at `/`
- VFR demo at `/cegeka-demo.html`
- All assets and APIs

## Future Enhancements

1. **Direct React Integration**: Instead of iframe, embed VFR components directly
2. **Size Recommendations**: Pass user measurements to get size suggestions
3. **Color Variants**: Support dynamic color changes based on product selection
4. **Analytics Integration**: Track try-on usage and conversions