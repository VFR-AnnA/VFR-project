/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:34+02:00
 */

/**
 * Avatar parameters for body customization
 */
export interface AvatarParams {
  // Body dimensions
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
}

/**
 * Default avatar parameters
 */
export const DEFAULT_AVATAR_PARAMS: AvatarParams = {
  heightCm: 175,
  chestCm: 95,
  waistCm: 80,
  hipCm: 100
};

/**
 * Parameter range constraints
 */
export const AVATAR_PARAM_RANGES = {
  heightCm: { min: 150, max: 200 },
  chestCm: { min: 70, max: 130 },
  waistCm: { min: 60, max: 120 },
  hipCm: { min: 80, max: 140 }
};

/**
 * Convert body measurements to avatar scale factors
 * @param params - Avatar parameters
 * @returns Object with scale factors for the 3D model
 */
export function paramsToScaleFactors(params: AvatarParams): { 
  height: number; 
  chest: number; 
  waist: number; 
  hip: number;
} {
  // Calculate scale factors relative to default values
  const heightScale = params.heightCm / DEFAULT_AVATAR_PARAMS.heightCm;
  const chestScale = params.chestCm / DEFAULT_AVATAR_PARAMS.chestCm;
  const waistScale = params.waistCm / DEFAULT_AVATAR_PARAMS.waistCm;
  const hipScale = params.hipCm / DEFAULT_AVATAR_PARAMS.hipCm;
  
  return {
    height: heightScale,
    chest: chestScale,
    waist: waistScale,
    hip: hipScale
  };
}