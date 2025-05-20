/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:35+02:00
 */

import BodyAIDemoModern from "./components/BodyAIDemoModern";

export default function BodyAIPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12">
      <div className="mx-auto w-full max-w-screen-sm px-4">
        <h1 className="text-3xl font-semibold mb-8">
          Body-AI Demo
        </h1>
        <p className="text-gray-600 max-w-2xl text-center mb-8">
          Upload a full-body photo to automatically detect your measurements and customize your avatar.
        </p>
        <BodyAIDemoModern />
      </div>
    </main>
  );
}