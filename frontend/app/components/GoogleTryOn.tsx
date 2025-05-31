'use client';

import { useState, useRef, useCallback } from 'react';
import { overlayClothing } from '../../lib/canvas-overlay';

const CLOTHING_OPTIONS = [
  { id: 'tshirt', name: 'T-Shirt', path: '/demo-clothing/tshirt.svg' },
  { id: 'hoodie', name: 'Hoodie', path: '/demo-clothing/hoodie.svg' },
  { id: 'jacket', name: 'Jacket', path: '/demo-clothing/jacket.svg' },
  { id: 'polo', name: 'Polo Shirt', path: '/demo-clothing/polo.svg' }
];

export default function GoogleTryOn() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setSelectedClothing(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        setSelectedClothing(null);
        
        // Draw the uploaded image on canvas immediately
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, 512, 768);
              const scale = Math.min(512 / img.width, 768 / img.height);
              const scaledWidth = img.width * scale;
              const scaledHeight = img.height * scale;
              const x = (512 - scaledWidth) / 2;
              const y = (768 - scaledHeight) / 2;
              ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            };
            img.src = result;
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyClothing = async (clothingId: string) => {
    if (!uploadedImage || !canvasRef.current) return;

    setIsProcessing(true);
    setSelectedClothing(clothingId);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    const clothingImg = new Image();

    baseImg.onload = () => {
      clothingImg.onload = () => {
        overlayClothing(ctx, baseImg, clothingImg);
        setIsProcessing(false);
      };
      clothingImg.src = CLOTHING_OPTIONS.find(c => c.id === clothingId)?.path || '';
    };
    baseImg.src = uploadedImage;
  };

  return (
    <div className="google-tryon-container">
      {/* Upload Section */}
      {!uploadedImage ? (
        <div 
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-content">
            <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="upload-text">Drag & drop your photo here</p>
            <p className="upload-subtext">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              aria-label="Upload image file"
            />
          </div>
        </div>
      ) : (
        <div className="preview-section">
          {/* Canvas Display */}
          <div className="canvas-container">
            <canvas 
              ref={canvasRef}
              width={512}
              height={768}
              className="preview-canvas"
            />
            {isProcessing && (
              <div className="processing-overlay">
                <div className="spinner"></div>
                <p>Processing image...</p>
              </div>
            )}
          </div>

          {/* Clothing Options */}
          <div className="clothing-options">
            <h3>Select Clothing</h3>
            <div className="clothing-grid">
              {CLOTHING_OPTIONS.map((clothing) => (
                <button
                  key={clothing.id}
                  className={`clothing-btn ${selectedClothing === clothing.id ? 'selected' : ''}`}
                  onClick={() => applyClothing(clothing.id)}
                  disabled={isProcessing}
                >
                  <img src={clothing.path} alt={clothing.name} />
                  <span>{clothing.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button 
            className="reset-btn"
            onClick={() => {
              setUploadedImage(null);
              setSelectedClothing(null);
            }}
          >
            Upload New Photo
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="privacy-notice">
        ⚡ Client-side demo only - no images are uploaded to servers
      </p>
    </div>
  );
}