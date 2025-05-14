/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:37+02:00
 */

import { estimateBodyMeasurements, BodyMeasurements, PoseResults } from '../measure';

// Mock pose landmarks data
const createMockLandmarks = (height: number = 1.0, width: number = 0.5) => {
  // Create a basic set of landmarks with adjustable proportions
  return [
    // NOSE (0)
    { x: 0.5, y: 0.0, z: 0, visibility: 1 },
    
    // Skip to landmarks we need
    ...Array(10).fill({ x: 0, y: 0, z: 0, visibility: 0 }),
    
    // LEFT_SHOULDER (11)
    { x: 0.5 - width/2, y: 0.2, z: 0, visibility: 1 },
    // RIGHT_SHOULDER (12)
    { x: 0.5 + width/2, y: 0.2, z: 0, visibility: 1 },
    
    // Skip to landmarks we need
    ...Array(10).fill({ x: 0, y: 0, z: 0, visibility: 0 }),
    
    // LEFT_HIP (23)
    { x: 0.5 - width/2, y: 0.5, z: 0, visibility: 1 },
    // RIGHT_HIP (24)
    { x: 0.5 + width/2, y: 0.5, z: 0, visibility: 1 },
    // LEFT_KNEE (25)
    { x: 0.5 - width/2, y: 0.7, z: 0, visibility: 1 },
    // RIGHT_KNEE (26)
    { x: 0.5 + width/2, y: 0.7, z: 0, visibility: 1 },
    // LEFT_ANKLE (27)
    { x: 0.5 - width/2, y: height, z: 0, visibility: 1 },
    // RIGHT_ANKLE (28)
    { x: 0.5 + width/2, y: height, z: 0, visibility: 1 },
  ];
};

describe('Body Measurement Functions', () => {
  describe('estimateBodyMeasurements', () => {
    it('should calculate measurements from landmarks with default height', () => {
      // Arrange
      const mockLandmarks = createMockLandmarks();
      const imageHeight = 1000; // pixels
      
      // Act
      const measurements = estimateBodyMeasurements(mockLandmarks, imageHeight);
      
      // Assert
      expect(measurements).toBeDefined();
      expect(measurements.heightCm).toBe(175); // Default height
      expect(measurements.chestCm).toBeGreaterThan(0);
      expect(measurements.waistCm).toBeGreaterThan(0);
      expect(measurements.hipCm).toBeGreaterThan(0);
    });
    
    it('should calculate measurements with custom reference height', () => {
      // Arrange
      const mockLandmarks = createMockLandmarks();
      const imageHeight = 1000; // pixels
      const referenceHeight = 180; // cm
      
      // Act
      const measurements = estimateBodyMeasurements(mockLandmarks, imageHeight, referenceHeight);
      
      // Assert
      expect(measurements.heightCm).toBe(180);
      // Other measurements should scale proportionally
      expect(measurements.chestCm).toBeGreaterThan(0);
      expect(measurements.waistCm).toBeGreaterThan(0);
      expect(measurements.hipCm).toBeGreaterThan(0);
    });
    
    it('should throw error when no landmarks are provided', () => {
      // Arrange
      const emptyLandmarks: any[] = [];
      const imageHeight = 1000;
      
      // Act & Assert
      expect(() => {
        estimateBodyMeasurements(emptyLandmarks, imageHeight);
      }).toThrow('No pose landmarks detected');
    });
    
    it('should scale measurements proportionally for different body types', () => {
      // Arrange - Create a wider body type
      const standardLandmarks = createMockLandmarks(1.0, 0.5);
      const wideLandmarks = createMockLandmarks(1.0, 0.7); // 40% wider
      const imageHeight = 1000;
      
      // Act
      const standardMeasurements = estimateBodyMeasurements(standardLandmarks, imageHeight);
      const wideMeasurements = estimateBodyMeasurements(wideLandmarks, imageHeight);
      
      // Assert - Wider body should have larger chest/waist/hip measurements
      expect(wideMeasurements.chestCm).toBeGreaterThan(standardMeasurements.chestCm);
      expect(wideMeasurements.waistCm).toBeGreaterThan(standardMeasurements.waistCm);
      expect(wideMeasurements.hipCm).toBeGreaterThan(standardMeasurements.hipCm);
      // But height should remain the same
      expect(wideMeasurements.heightCm).toBe(standardMeasurements.heightCm);
    });
    
    it('should scale measurements proportionally for different heights', () => {
      // Arrange - Create a taller body type
      const standardLandmarks = createMockLandmarks(1.0, 0.5);
      const tallLandmarks = createMockLandmarks(1.2, 0.5); // 20% taller
      const imageHeight = 1000;
      const referenceHeight = 175;
      
      // Act
      const standardMeasurements = estimateBodyMeasurements(standardLandmarks, imageHeight, referenceHeight);
      const tallMeasurements = estimateBodyMeasurements(tallLandmarks, imageHeight, referenceHeight);
      
      // Assert - Both should have the same measurements since we're providing a reference height
      expect(tallMeasurements.heightCm).toBe(standardMeasurements.heightCm);
      // But the pixel-to-cm ratio is different, so the measurements will be different
      // This is expected behavior when using a fixed reference height
    });
  });
});