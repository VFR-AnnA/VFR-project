/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-18T18:47+02:00
 */

import Image from "next/image";
import Link from "next/link";
import VFRModal from "./components/VFRModal";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 md:p-24 text-center">
      <h1 className="text-3xl font-semibold">
        Visual Feature Recognition (VFR) Demo
      </h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <VFRModal />
        
        <div className="flex flex-col gap-4 mt-8">
          <h2 className="text-xl font-semibold">Advanced Features</h2>
          
          <Link href="/try/body-ai" className="group">
            <div className="px-8 py-6 bg-zinc-900 rounded-xl transition-all group-hover:bg-zinc-800">
              <h3 className="text-lg font-medium mb-2">Body-AI Demo</h3>
              <p className="text-sm text-gray-400 mb-4">
                Interactive 3D body measurements with AI and drag-drop photo upload
              </p>
              <div className="px-4 py-2 bg-blue-600 text-white rounded-lg w-min mx-auto whitespace-nowrap">
                Try It Now
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
