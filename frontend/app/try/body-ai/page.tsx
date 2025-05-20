/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-18T18:38+02:00
 */

import { Metadata } from "next";
import BodyAIDemo from "./components/BodyAIDemo";

export const metadata: Metadata = {
  title: "Body AI Demo | VFR",
  description: "Interactive body measurements with AI",
};

export default function BodyAIPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 overflow-y-scroll">
      <h1 className="text-3xl font-semibold mb-8">
        Body-AI Demo
      </h1>
      <p className="text-gray-600 max-w-2xl text-center mb-8">
        Upload a full-body photo to automatically detect your measurements and customize your avatar.
      </p>
      <BodyAIDemo />
    </main>
  );
}