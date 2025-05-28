/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T12:04+02:00
 */

/**
 * Converts a File object to a base64 data URL
 * @param file The file to convert
 * @returns A Promise that resolves to the base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file); // Returns data:image/png;base64,AAAA...
  });
}

/**
 * Validates if a file is an image and within size limits
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 * @returns An object with validation result and error message if any
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image (JPEG, PNG, WEBP, etc.)' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
}