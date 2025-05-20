/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-17T08:45+02:00
 */

"use client";

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import styles from './styles.module.css';

// Constants
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic'
];

// File type extensions for display
const FILE_TYPE_EXTENSIONS = '.jpg · .png · .heic';

// Maximum file size in bytes (4MB)
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export interface DropUploaderProps {
  onUpload: (file: File) => void;
  className?: string;
  ariaLabel?: string;
  maxFileSize?: number;
  allowMultiple?: boolean;
}

const DropUploader: React.FC<DropUploaderProps> = ({
  onUpload,
  className = '',
  ariaLabel = 'Upload photo',
  maxFileSize = MAX_FILE_SIZE,
  allowMultiple = false
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Handle file validation
  const validateFile = (file: File): boolean => {
    // Reset states
    setIsRejected(false);
    setError(null);

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(`Invalid file type. Please upload ${FILE_TYPE_EXTENSIONS}`);
      setIsRejected(true);
      return false;
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      setError(`File too large. Maximum size is ${maxSizeMB} MB`);
      setIsRejected(true);
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      // Announce file selection for screen readers
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.textContent = `File selected: ${file.name}`;
      document.body.appendChild(liveRegion);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 99) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 100);

      // Call the onUpload handler
      onUpload(file);
      
      // Reset progress after upload completes
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(0);
      }, 1500);
    }
  }, [onUpload]);

  // Handle file input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag events
  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  }, [isDragActive]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const files = event.dataTransfer.files;

    // Check if multiple files were dropped
    if (files.length > 1 && !allowMultiple) {
      setError('Please upload only one file at a time');
      setIsRejected(true);
      return;
    }

    const file = files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect, allowMultiple]);

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  // Handle click to open file browser
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`${className} h-[260px]`}>
      <div
        ref={dropzoneRef}
        className={`${styles.dropzone} ${
          isDragActive ? styles.dragActive : ''
        } ${isRejected ? styles.rejected : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
      >
        {/* Upload progress overlay */}
        {uploadProgress > 0 && (
          <div className={styles.progressOverlay} aria-live="polite">
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : 'Processing...'}
            </div>
          </div>
        )}
        {/* Upload icon */}
        {!isRejected ? (
          <svg
            className={styles.icon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        ) : (
          <svg
            className={styles.iconError}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}

        <p className={styles.text}>
          {isDragActive
            ? 'Drop to upload'
            : isRejected
              ? 'File rejected'
              : 'Drag and drop your photo here'}
        </p>
        <p className={styles.subText}>
          or click to browse
        </p>
        <p className={styles.subText}>
          {FILE_TYPE_EXTENSIONS} (max {maxFileSize / (1024 * 1024)} MB)
        </p>
      </div>

      {error && <p className={styles.errorMessage} role="alert">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleInputChange}
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
        multiple={allowMultiple}
      />
    </div>
  );
};

export default DropUploader;