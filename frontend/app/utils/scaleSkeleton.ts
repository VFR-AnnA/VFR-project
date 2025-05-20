/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-19T09:50+02:00
 */

import { Bone } from 'three';
import { AvatarParams } from '../../types/avatar-params';

type SkeletonMap = {
  spine?: Bone;
  chest?: Bone;
  hips?: Bone;
};

/**
 * Scales a skeleton based on avatar parameters
 * Provides more dramatic visual feedback than the current implementation
 * 
 * @param bones - Map of key bones in the skeleton
 * @param params - Avatar parameters (height, chest, waist, hip)
 */
export function scaleSkeleton(
  bones: SkeletonMap,
  { heightCm, chestCm, waistCm, hipCm }: AvatarParams,
) {
  // Y-scale (height) - distribute between torso + legs
  const heightScale = heightCm / 175;
  
  // Apply height scale to parent bone if available
  if (bones.spine?.parent) {
    bones.spine.parent.scale.y = heightScale;
  }

  // X/Z-scale (width) with more dramatic scaling factors
  if (bones.chest) {
    // Apply 1.5x multiplier for more visible effect
    const chestScale = (chestCm / 95) * 1.5;
    bones.chest.scale.x = bones.chest.scale.z = chestScale;
  }
  
  if (bones.hips) {
    // Apply 1.5x multiplier for more visible effect
    const hipScale = (hipCm / 100) * 1.5;
    bones.hips.scale.x = bones.hips.scale.z = hipScale;
  }
  
  // Waist scaling with weighted blend (60% parameter, 40% base)
  if (bones.spine) {
    const waistScale = 0.6 * (waistCm / 80) + 0.4;
    bones.spine.scale.x = bones.spine.scale.z = waistScale * 1.5;
  }
}