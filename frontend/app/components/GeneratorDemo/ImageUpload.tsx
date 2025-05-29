'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import { validateImageFile } from '../../utils/fileUtils';

interface ImageUploadProps {
  onImageSelect: (imageData: { file: File; dataUrl: string }) => void;
  onImageClear: () => void;
  disabled?: boolean;
}

export default function ImageUpload({ onImageSelect, onImageClear, disabled = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreview(dataUrl);
        onImageSelect({ file, dataUrl });
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (disabled) return;
      
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreview(dataUrl);
        onImageSelect({ file, dataUrl });
      };
      reader.readAsDataURL(file);
    },
    [disabled, onImageSelect]
  );

  // Handle click on upload area
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle clear button click
  const handleClear = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageClear();
  }, [onImageClear]);

  return (
    <div className={styles.imageUploadContainer}>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${
          disabled ? styles.disabled : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {preview ? (
          <div className={styles.previewContainer}>
            <Image
              src={preview}
              alt="Preview"
              fill
              style={{ objectFit: 'contain' }}
              className={styles.imagePreview}
            />
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              disabled={disabled}
              aria-label="Clear image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className={styles.uploadPlaceholder}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.uploadIcon}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className={styles.uploadText}>
              Drag & drop an image or click to browse
            </p>
            <p className={styles.uploadHint}>
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.fileInput}
        disabled={disabled}
        aria-label="Upload image"
        title="Upload image"
      />
    </div>
  );
}