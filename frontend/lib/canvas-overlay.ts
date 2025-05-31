export function overlayClothing(
  ctx: CanvasRenderingContext2D,
  base: HTMLImageElement,
  clothing: HTMLImageElement
) {
  // Clear canvas
  ctx.clearRect(0, 0, 512, 768);
  
  // Draw base image (user's photo)
  // Scale to fit canvas while maintaining aspect ratio
  const scale = Math.min(512 / base.width, 768 / base.height);
  const scaledWidth = base.width * scale;
  const scaledHeight = base.height * scale;
  const x = (512 - scaledWidth) / 2;
  const y = (768 - scaledHeight) / 2;
  
  ctx.drawImage(base, x, y, scaledWidth, scaledHeight);
  
  // Overlay clothing with fixed anchor points
  // These values are tuned for a typical portrait photo
  const clothingX = 140;
  const clothingY = 120;
  const clothingWidth = 240;
  const clothingHeight = 300;
  
  // Apply slight transparency for more realistic overlay
  ctx.globalAlpha = 0.95;
  ctx.drawImage(clothing, clothingX, clothingY, clothingWidth, clothingHeight);
  ctx.globalAlpha = 1.0;
  
  // Add subtle shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}