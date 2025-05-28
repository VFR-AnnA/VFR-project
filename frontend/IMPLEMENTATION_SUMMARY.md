# VFR‑Anna • Branch‑structuur & Checklists per Module

> **Doel** — Elk onderdeel in een eigen, overzichtelijke feature‑branch; code blijft schoon, stabiel en makkelijk te testen/mergen.

---

## 1. Aanbevolen branch‑structuur

```
main                 ← Alleen stable, altijd demo‑ready
│
├─ feature/3d-core          ← Core avatar‑viewer & scaling
├─ feature/clothing         ← Kleding‑overlay + physics draping
├─ feature/uploader         ← Drag‑and‑drop / image capture
├─ feature/api              ← API‑calls & analytics events
├─ feature/ui               ← Responsive UI + accessibility
├─ feature/benchmark        ← FPS‑overlay & perf‑metrics
├─ feature/white-label      ← Thema's, branding & skins
```

**Werkwijze**

1. Maak per module een branch vanaf **main**.
2. Bouw, commit, test (unit + manual) → push.
3. Open Pull Request, laat CI (lint/tests) groen worden.
4. Review, squash‑merge → main blijft stable.

---

## 2. Checklists per module

### ▶ **feature/3d-core**

*Core 3D avatar‑viewer & body‑scaling*

- [ ] **Viewer Component**
  - [ ] Implement progressive loading (stub → full model)
  - [ ] Optimize frame loop for demand-driven rendering
  - [ ] Add support for morph targets / body scaling
  - [ ] Implement camera controls with proper constraints
  - [ ] Add lighting setup with environment maps
  - [ ] Ensure proper cleanup of Three.js resources

- [ ] **Avatar Parameters**
  - [ ] Define standard body measurements (height, chest, waist, hip)
  - [ ] Implement parameter-to-scale conversion functions
  - [ ] Add validation for measurement ranges
  - [ ] Create default presets for different body types

- [ ] **Performance**
  - [ ] Implement model LOD (Level of Detail) switching
  - [ ] Add DRACO compression support for models
    - [ ] Use gltf-pipeline for compression: `npx gltf-pipeline -i model.glb -o model-draco.glb -d`
  - [ ] Optimize texture loading and memory usage
  - [ ] Implement proper dispose methods for all resources

- [ ] **Testing**
  - [ ] Unit tests for parameter conversion functions
  - [ ] Visual regression tests for avatar rendering
  - [ ] Performance benchmarks for rendering efficiency
  - [ ] Cross-browser compatibility tests
    - [ ] Desktop: Chrome, Edge, Safari
    - [ ] Mobile: iOS Safari (AR Quick-Look), Android Chrome (WebXR)
    - [ ] Use Lighthouse (mobile) with targets: FCP < 1s, a11y > 95

### ▶ **feature/clothing**

*Kleding overlay + physics simulation*

- [ ] **Clothing Models**
  - [ ] Implement clothing model loading and positioning
  - [ ] Add support for multiple clothing layers
  - [ ] Create attachment points for different body types
  - [ ] Implement texture swapping for different materials

- [ ] **Physics Simulation**
  - [ ] Implement basic cloth physics for draping
  - [ ] Add collision detection with avatar body
  - [ ] Optimize physics calculations for performance
  - [ ] Create precomputed physics states for common poses

- [ ] **Try-On Experience**
  - [ ] Build modal UI for clothing try-on
  - [ ] Implement size selection with visual feedback
  - [ ] Add rotation controls for viewing from all angles
  - [ ] Create smooth transitions between clothing items

- [ ] **AI Integration**
  - [ ] Implement variant generation for clothing styles
  - [ ] Add style transfer capabilities for customization
  - [ ] Create API for AI-assisted fitting recommendations
  - [ ] Implement caching for generated variants

### ▶ **feature/uploader**

*Drag‑and‑drop & image capture*

- [ ] **Drag-and-Drop Interface**
  - [ ] Implement accessible drag-and-drop zone
  - [ ] Add file type validation (jpg, png, heic)
  - [ ] Implement file size limits and validation
  - [ ] Add progress indicators for uploads

- [ ] **Image Processing**
  - [ ] Implement client-side image resizing/compression
  - [ ] Add EXIF data handling (orientation, metadata)
  - [ ] Create preview generation functionality
  - [ ] Implement background removal option

- [ ] **Camera Capture**
  - [ ] Add webcam/device camera access
  - [ ] Implement capture UI with countdown
  - [ ] Add image quality optimization
  - [ ] Create fallbacks for devices without camera

- [ ] **Accessibility & UX**
  - [ ] Ensure keyboard navigation support
  - [ ] Add screen reader announcements
  - [ ] Implement error handling with clear messages
  - [ ] Add drag-over visual indicators

### ▶ **feature/api**

*API‑integratie + analytics*

- [ ] **3D Model Generation**
  - [ ] Implement provider factory pattern
  - [ ] Add Meshy.ai integration
  - [ ] Add Hunyuan integration
  - [ ] Create fallback/retry mechanisms

- [ ] **API Security**
  - [ ] Implement secure key management
  - [ ] Add rate limiting for API calls
  - [ ] Create proper error handling and logging
  - [ ] Implement request validation

- [ ] **Analytics Events**
  - [ ] Add generation success/failure tracking
  - [ ] Implement performance metrics collection
  - [ ] Create user interaction tracking
  - [ ] Add conversion funnel analytics

- [ ] **Caching & Optimization**
  - [ ] Implement model caching strategy
  - [ ] Add request deduplication
  - [ ] Create background processing with workers
  - [ ] Implement progressive loading indicators

### ▶ **feature/ui**

*Responsive design & accessibility*

- [ ] **Responsive Layout**
  - [ ] Implement mobile-first design approach
  - [ ] Create breakpoint system for different devices
  - [ ] Add touch-friendly controls for mobile
  - [ ] Ensure proper viewport handling

- [ ] **Accessibility**
  - [ ] Implement ARIA attributes throughout
    - [ ] Add aria-label to all `<button>` elements
  - [ ] Add keyboard navigation support
  - [ ] Ensure proper focus management
    - [ ] Add :focus-visible outline to .btn class in stylesheet
  - [ ] Create screen reader announcements

- [ ] **UI Components**
  - [ ] Build reusable component library
  - [ ] Implement consistent styling system
  - [ ] Add loading states and transitions
  - [ ] Create error handling components

- [ ] **User Experience**
  - [ ] Implement intuitive navigation flow
  - [ ] Add helpful tooltips and guidance
  - [ ] Create smooth transitions between states
  - [ ] Implement proper form validation

### ▶ **feature/benchmark**

*Performance overlay & metrics*

- [ ] **FPS Monitoring**
  - [ ] Implement FPS counter with rolling average
  - [ ] Add frame time measurement
  - [ ] Create visual indicators for performance thresholds
  - [ ] Implement CPU usage monitoring

- [ ] **Memory Tracking**
  - [ ] Add texture memory usage tracking
  - [ ] Implement geometry memory monitoring
  - [ ] Create memory leak detection
  - [ ] Add warning system for high memory usage

- [ ] **Network Monitoring**
  - [ ] Implement API call timing
  - [ ] Add bandwidth usage tracking
  - [ ] Create request queue visualization
  - [ ] Implement connection quality detection

- [ ] **Performance Reporting**
  - [ ] Create performance data export
  - [ ] Implement automated performance regression tests
  - [ ] Add benchmark comparison with previous versions
  - [ ] Create detailed performance reports

### ▶ **feature/white-label**

*Branding & theming*

- [ ] **Theme System**
  - [ ] Implement CSS variables for theming
  - [ ] Create theme switching functionality
  - [ ] Add dark/light mode support
  - [ ] Implement theme persistence

- [ ] **Branding Options**
  - [ ] Add logo customization
    - [ ] Place Cegeka logo in /assets/cegeka-logo.svg
    - [ ] Update `<link rel="icon">` in HTML head
    - [ ] Update `<meta name="theme-color">` in HTML head
  - [ ] Implement color scheme configuration
  - [ ] Create font family customization
  - [ ] Add custom UI element styling

- [ ] **Configuration**
  - [ ] Implement JSON-based theme configuration
  - [ ] Create admin UI for theme customization
  - [ ] Add theme preview functionality
  - [ ] Implement theme export/import
  - [ ] Update GLB-URL in CEGEKA_PRODUCTS configuration

- [ ] **Integration**
  - [ ] Create documentation for white-labeling
  - [ ] Add API for programmatic theme changes
  - [ ] Implement theme inheritance system
  - [ ] Create theme validation tools
  - [ ] Add presenter mode with autoplay URL parameter detection
    - [ ] In viewerManager.updateProductGrid() detect new URLSearchParams(location.search).has('autoplay')
    - [ ] Execute default selections automatically when autoplay is enabled

---

## 3. CI‑flow (voor elke PR)

1. **Lint + Type‑check** (`npm run lint && tsc --noEmit`)
2. **Unit tests** (`npm test`)
3. **E2E / Playwright** (UI + a11y)
4. **Bundle & perf check** (Benchmark script)

→ Groen? **Merge** → automatisch deploy naar `staging.demo.vfr‑anna.eu`.

## 4. Deployment

```bash
git checkout demo/cegeka-monday
npm run build          # indien je bundler gebruikt
npx serve . -S         # local HTTPS test
# Netlify drag-and-drop of `netlify deploy --prod`
```

---

### Quick Tips

* Gebruik conventionele commitmsgs (`feat: …`, `fix: …`).
* Houd branches klein (< 400 LOC diff) ⇒ snellere reviews.
* **main** is altijd demo‑ready; tag releases (`v0.x.y`).
* Na merge direct `git pull main` voor volgende feature‑branch.

---

## 5. Implementatieplan Cegeka Demo

### 1. Nieuwe feature-branch

```bash
git checkout demo/cegeka-monday   # of maak 'm eerst: git checkout -b demo/cegeka-monday
```

### 2. Bestanden toevoegen / aanpassen

| Bestand | Actie | Code-snippet |
|---------|-------|--------------|
| package.json | ⬆ Toevoegen dev-dependency + build-script | ```json
"devDependencies": {
 "gltf-pipeline": "^3.0.0",
 "@google/draco3d": "^1.6.0"
},
"scripts": {
 "compress:glb": "gltf-pipeline -i public/models -o public/models-draco -d",
 "prebuild": "npm run compress:glb",
 "build": "vite build" // of next build/react-scripts build
}
``` |
| _headers (alleen Netlify) | ⬆ Basic-Auth & caching | ```
# Basisbeveiliging voor demo
/*
 Basic-Auth: Artur $SITE_PASSWORD

# Cache GLB's 1 jaar
/models-draco/*
 Cache-Control: public, max-age=31536000, immutable
``` |
| vercel.json (alleen Vercel) | ⬆ Route-bescherming | ```json
{
 "routes": [
  {"src": "/(.*)", "dest": "/$1", "headers": {"www-authenticate": "Basic realm=\"Demo\""}}
 ]
}
``` |
| /public/assets/cegeka-logo.svg | ➕ Plaats definitieve logo-bestand | (sleep in Roo) |
| Global CSS / Tailwind config | 🎨 Voeg Cegeka-kleuren toe | ```css
:root {
 --primary: #003d7a;
 --accent: #ff6600;
}
``` |
| viewerConfig.ts | 🎛️ Update GLB-paden naar /models-draco/… | — |

### 3. Environment variables (Roo → .env of CI-panel)

```bash
SITE_PASSWORD=SterkWachtwoord456
```

Netlify: Site settings → Environment variables
Vercel: Project → Settings → Environment variables

### 4. Build & lokale HTTPS-test

```bash
npm ci
npm run build
npx serve dist -S            # lokaal met self-signed HTTPS
```

### 5. Deploy & staging-URL

**Netlify**
```bash
netlify deploy --prod -m "Cegeka demo build"
```
→ URL: https://demo.vfr-anna.netlify.app

**Vercel**
```bash
git push origin demo/cegeka-monday   # Vercel pakt automatisch
```
→ URL: https://demo-vfr-anna.vercel.app

### 6. Back-up Loom-video

1. Open staging-URL in incognito.
2. Start Loom-opname (1080p, 2 min).
3. Privé-link delen in je kalenderuitnodiging.

### 7. Resultaat: compleet live demomodel

- Avatar-viewer (height-slider + body-presets)
- Cegeka-hoodie (Draco-gecomprimeerd, instant load)
- Drag-&-drop overlay (eigen GLB's)
- Mock size-badge (M – 94 % confidence)
- White-label thema & logo
- FPS-counter (≥ 60)
- Basis-auth + HTTPS (veilig gedeeld)

Klaar om maandag te tonen — plus een Loom-fallback mocht wifi tegenzitten. Succes met implementeren! Laat het weten als je ergens vastloopt, dan lever ik direct een patch.