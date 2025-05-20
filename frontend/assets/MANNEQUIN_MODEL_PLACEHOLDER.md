# Optimized Mannequin Model

This directory will contain the optimized mannequin model for the WebGPU cloth drape experiment.

## Requirements

- File format: glTF/GLB
- Filename: `mannequin_low.glb`
- Vertex count: Maximum 10,000 vertices
- UV mapping: Required for texture mapping
- Rigging: Basic skeleton for posing (optional)

## Optimization Process

1. Start with the original mannequin model from `public/models/mannequin.glb`
2. Reduce polygon count while maintaining silhouette
3. Ensure proper UV mapping is preserved
4. Export as GLB format
5. Place the optimized model in this directory

## Optimization Tools

Recommended tools for model optimization:
- Blender
- Meshlab
- Simplygon
- Instant Meshes

## Status

- [ ] Original model analyzed
- [ ] Polygon reduction completed
- [ ] UV mapping verified
- [ ] Optimized model exported
- [ ] Optimized model placed in this directory