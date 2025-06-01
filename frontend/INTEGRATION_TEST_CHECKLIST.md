# VFR-Anna Commerce Integration Test Checklist

## 🧪 Components to Test

### 1. Navigation Component (`/app/components/Navigation.tsx`)
- [ ] Links to all pages work correctly
- [ ] Active page highlighting
- [ ] Responsive on mobile

### 2. Shop Page (`/shop`)
- [ ] Page loads without errors
- [ ] Product information displays correctly
- [ ] VFR viewer loads

### 3. VFR Viewer Integration
- [ ] 3D model loads successfully
- [ ] Toggle between 2D and 3D views works
- [ ] Color selection updates the 3D model
- [ ] Size selection works
- [ ] No console errors

### 4. Asset Loading
- [ ] Mannequin GLB loads
- [ ] Clothing GLB files load
- [ ] Three.js libraries load correctly

## 🔍 Manual Testing Steps

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test Navigation:**
   - Visit http://localhost:3000
   - Click "Shop Demo" in navigation
   - Verify navigation between all pages

3. **Test Shop Page:**
   - Visit http://localhost:3000/shop
   - Check that product details load
   - Toggle between 2D and 3D views
   - Select different colors
   - Select different sizes

4. **Test 3D Viewer:**
   - Verify 3D model loads
   - Test rotation controls
   - Check performance (should be 60 FPS)
   - Verify no black blocks appear

5. **Test Responsive Design:**
   - Resize browser window
   - Test on mobile viewport
   - Verify layout adapts correctly

## ⚠️ Known Issues to Check

1. **GLB Loading:** Ensure `/models/mannequin.glb` and clothing models exist
2. **Script Loading:** Verify Three.js scripts are in `/public/lib/`
3. **CORS:** Check for any CORS issues with asset loading

## ✅ Ready for Production When:

- [ ] All navigation links work
- [ ] 3D viewer loads without errors
- [ ] Color and size selection functional
- [ ] No console errors
- [ ] Performance is acceptable (60 FPS)
- [ ] Mobile responsive design works

## 🚀 Deployment

Once all tests pass:
```bash
git push -u origin feat/vfr-try-on-ecom
```

Vercel will create a preview deployment automatically.