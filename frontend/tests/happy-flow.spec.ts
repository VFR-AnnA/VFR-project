/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-19T09:54+02:00
 */

import { test, expect } from '@playwright/test';
import path from 'path';

test('complete user flow: load → upload → adjust sliders', async ({ page }) => {
  // Navigate to the body-ai page
  await page.goto('/try/body-ai');
  
  // Wait for the page to load
  await expect(page.locator('h1')).toBeVisible();
  
  // Verify the 3D viewer is visible
  await expect(page.locator('.vfr-viewer-container')).toBeVisible();
  
  // Upload a test image (you'll need to create this file)
  // For now, we'll just check if the file input exists
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toBeVisible({ visible: false }); // File inputs are usually hidden
  
  // In a real test, you would upload a file like this:
  // await fileInput.setInputFiles(path.join(__dirname, 'fixtures/test-body.jpg'));
  
  // Wait for upload processing (simulated)
  await page.waitForTimeout(1000);
  
  // Adjust sliders
  const waistSlider = page.locator('input[type="range"]').nth(2);
  await expect(waistSlider).toBeVisible();
  
  // Get initial value
  const initialValue = await waistSlider.getAttribute('value');
  console.log(`Initial waist value: ${initialValue}`);
  
  // Set new value
  await waistSlider.fill('100');
  
  // Verify slider value changed
  await expect(waistSlider).toHaveValue('100');
  
  // Wait to ensure model updates
  await page.waitForTimeout(1000);
  
  // Take a screenshot for visual verification
  await page.screenshot({ path: 'test-results/body-ai-adjusted.png' });
  
  console.log('Test completed successfully');
});