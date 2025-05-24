/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-18T08:16+02:00  |  SHA256: 3dd4…ab9c
 */

import { Metadata } from "next";
import BodyAIDemo from "./components/BodyAIDemo";

export const metadata: Metadata = {
  title: "Body AI Demo | VFR",
  description: "Interactive body measurements with AI",
};

export default function BodyAIPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-8 lg:p-12">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 md:mb-8">
        Body-AI Demo
      </h1>
      <p className="text-gray-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl text-center text-sm sm:text-base mb-4 sm:mb-6 md:mb-8">
        Upload a full-body photo to automatically detect your measurements and customize your avatar.
      </p>
      <BodyAIDemo />
    </main>
  );
}