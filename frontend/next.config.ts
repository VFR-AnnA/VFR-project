import type { NextConfig } from "next";
import webpack from 'webpack';

/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

const nextConfig: NextConfig = {
  webpack(config) {
    // Add banner plugin
    config.plugins.push(
      new webpack.BannerPlugin({
        banner: `
Avatar-Wallet VFR – Proprietary (© 2025 Artur Gabrielian)
Build-stamp: 2025-05-06T12:00+02:00
SHA256: 3dd4…ab9c
`.trim(),
        raw: false,
      })
    );

    // Configure for Three.js and WebGL
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource'
    });

    return config;
  },
  // Allow connections from other devices on the network
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;
