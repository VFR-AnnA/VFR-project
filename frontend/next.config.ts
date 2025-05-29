import type { NextConfig } from "next";
import webpack from 'webpack';

/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

const nextConfig: NextConfig = {
  // Skip ESLint during builds
  eslint: {
    ignoreDuringBuilds: true
  },
  // Skip TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true
  },
  // Disable Babel and use SWC
  experimental: {
    forceSwcTransforms: true
  },
  // Expose environment variables to the client
  // SECURITY: API keys should NOT be exposed to the client
  env: {
    // REMOVED: MESHY_KEY and HUNYUAN_KEY for security reasons
    GEN_PROVIDER: process.env.GEN_PROVIDER,
    NEXT_PUBLIC_FEATURE_GEN: process.env.NEXT_PUBLIC_FEATURE_GEN,
    NEXT_PUBLIC_FEATURE_REFINE_PBR: process.env.NEXT_PUBLIC_FEATURE_REFINE_PBR
  },
  
  // Add explicit redirects
  async redirects() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/",
            destination: "/generator-demo",
            permanent: false,
          },
          {
            source: "/demo",
            destination: "/try/body-ai",
            permanent: false,
          },
        ]
      : [
          {
            source: "/demo",
            destination: "/try/body-ai",
            permanent: false,
          },
        ];
  },
  
  // Add rewrite rules for model files
  async rewrites() {
    return [
      {
        source: '/try/generator/models/:slug*',
        destination: '/models/:slug*',
      },
    ];
  },
  
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

    // Configure for Web Workers
    config.module.rules.push({
      test: /bodyAIWorker\.ts$/,
      type: 'asset/resource'
    });

    // Configure for MediaPipe WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource'
    });

    return config;
  },
  // Allow connections from other devices on the network and transpile ESM packages
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@mediapipe/pose',
    '@mediapipe/camera_utils',
    '@mediapipe/drawing_utils'
  ],
};

export default nextConfig;
