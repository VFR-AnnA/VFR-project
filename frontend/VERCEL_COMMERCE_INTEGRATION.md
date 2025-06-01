# VFR-Anna Vercel Commerce Integration

This branch demonstrates how to integrate VFR-Anna's 3D try-on technology into a Vercel Commerce store.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000/shop
```

## 📁 Integration Structure

```
app/
├── components/
│   ├── vfr/
│   │   ├── VFRViewer.tsx      # Main VFR component wrapper
│   │   └── VFRDemoStage.tsx   # 3D scene implementation
│   ├── product/
│   │   └── ProductView.tsx    # E-commerce product page
│   └── Navigation.tsx         # Global navigation
├── shop/
│   └── page.tsx              # Shop demo page
└── layout.tsx                # Updated with preloads
```

## 🛍️ Key Features

### 1. Product Page Integration
- Toggle between 2D gallery and 3D view
- Real-time color switching
- Size selection with recommendations
- Add to cart functionality

### 2. SKU Mapping
Products are mapped to 3D models via SKU in VFRDemoStage.tsx

### 3. Performance Optimizations
- Lazy loading with dynamic imports
- Asset preloading in layout
- Suspense boundaries for smooth loading

## 📊 Comparison: Google 2D vs VFR-Anna 3D

| Feature | Google 2D Try-On | VFR-Anna 3D |
|---------|------------------|-------------|
| View | Single front (1024px) | Full 360° real-time |
| Accuracy | No size/physics | ±2cm with physics |
| Platform | Google Shopping only | Any e-commerce site |
| Region | USA beta | Global via Vercel Edge |
| Speed | 5-10 seconds | Instant (60 FPS) |

## 🔗 Demo Pages

- `/` - Original 3D Demo
- `/shop` - E-commerce Integration
- `/google-vs-vfr` - Technology Comparison
- `/cegeka-demo.html` - Cegeka Brand Demo

## 🚀 Deployment

```bash
# Commit changes
git add .
git commit -m "feat: integrate VFR-Anna try-on in commerce demo"

# Push to branch
git push -u origin feat/vfr-try-on-ecom
```

Vercel will automatically build and deploy preview URLs for testing.