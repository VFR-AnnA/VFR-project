# VFR Clothing System Documentation

## Overview
The VFR project includes a dynamic clothing system that allows users to switch between different garments on the 3D mannequin in real-time. The system supports multiple clothing items, dynamic color changes, and is optimized for performance.

## Features
- ✅ Dynamic clothing switching (None/Hoodie/T-Shirt)
- ✅ Real-time color picker for garments
- ✅ Memory-efficient with disposal methods
- ✅ Support for Draco-compressed GLB files
- ✅ Works across all brand themes (Cegeka/SportTech/FashionForward)

## File Structure
```
public/
├── lib/
│   └── ClothingManager.js      # Core clothing management system
└── models/
    └── clothes/
        ├── hoodie.glb          # Hoodie 3D model
        ├── hoodie-draco.glb    # Compressed hoodie (optional)
        ├── tshirt.glb          # T-shirt 3D model
        └── tshirt-draco.glb    # Compressed t-shirt (optional)
```

## Adding New Clothing Items

### 1. Prepare Your GLB Model
- **Pivot Point**: Set at `(0, -shoulderHeight, 0)`
- **Scale**: Pre-scale to fit the mannequin (no runtime transforms needed)
- **Materials**: Use PBR materials for best results

### 2. Add Model to Project
Place your GLB file in: `public/models/clothes/your-item.glb`

### 3. Update ClothingManager
Edit `public/lib/ClothingManager.js`:
```javascript
this.CLOTHES = {
  none: null,
  hoodie: '/models/clothes/hoodie.glb',
  tshirt: '/models/clothes/tshirt.glb',
  youritem: '/models/clothes/your-item.glb'  // Add your item
};
```

### 4. Update UI
In `cegeka-demo.html`, add a button for your item:
```javascript
const clothingOptions = [
  { id: 'none', label: 'None' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'tshirt', label: 'T-Shirt' },
  { id: 'youritem', label: 'Your Item' }  // Add this
];
```

## Draco Compression (Optional)

Reduce file sizes by 65-85% using Draco compression:

```bash
# Run the compression script
node scripts/compress-glb.js

# Or manually compress a single file
npx gltf-pipeline -i hoodie.glb -o hoodie-draco.glb -d
```

Then update the paths in ClothingManager to use the compressed versions:
```javascript
this.CLOTHES = {
  hoodie: '/models/clothes/hoodie-draco.glb',
  tshirt: '/models/clothes/tshirt-draco.glb'
};
```

## API Reference

### ClothingManager Methods

#### `load(name, url)`
Loads a clothing item from a URL.
```javascript
await clothingManager.load('jacket', '/models/clothes/jacket.glb');
```

#### `show(name)`
Shows a specific clothing item and hides others.
```javascript
clothingManager.show('hoodie');  // Show hoodie
clothingManager.show('none');    // Hide all clothing
```

#### `setColor(hex)`
Changes the color of the current clothing item.
```javascript
clothingManager.setColor('#ff0000');  // Red
```

#### `disposeClothing(name)`
Removes a clothing item and frees GPU memory.
```javascript
clothingManager.disposeClothing('hoodie');
```

#### `loadPredefinedClothes()`
Loads all clothing items defined in the CLOTHES mapping.
```javascript
await clothingManager.loadPredefinedClothes();
```

## Performance Optimization

### For Many Garments
1. **Lazy Loading**: Load items only when needed
2. **External Storage**: Use S3/CDN for large assets
3. **Compression**: Always use Draco compression
4. **Disposal**: Call `disposeClothing()` when switching

### Memory Management
The ClothingManager includes automatic disposal of:
- Geometry buffers
- Material resources
- Texture maps
- Scene graph nodes

## Troubleshooting

### Clothing Not Visible
- Check browser console for loading errors
- Verify file paths are correct
- Ensure model pivot is at origin
- Check if model scale matches mannequin

### Performance Issues
- Use compressed GLB files
- Reduce texture sizes
- Implement LOD (Level of Detail)
- Dispose unused clothing items

### Color Not Changing
- Ensure materials have a `color` property
- Check if using PBR materials
- Verify material names in the GLB

## Example Integration

```javascript
// Initialize
const clothingManager = new ClothingManager(avatarRoot, gltfLoader);

// Load predefined clothes
await clothingManager.loadPredefinedClothes();

// Show hoodie
clothingManager.show('hoodie');

// Change color
clothingManager.setColor('#0066cc');

// Clean up when done
clothingManager.disposeAll();
```

## Future Enhancements
- [ ] Texture pattern support
- [ ] Size variations (S/M/L/XL)
- [ ] Layering system (shirt + jacket)
- [ ] Animation support (fabric physics)
- [ ] Thumbnail previews
- [ ] Save/load outfit combinations