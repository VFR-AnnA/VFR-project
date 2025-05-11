/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

import VFRModal from "./components/VFRModal";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-24 text-center">
      <h1 className="text-3xl font-semibold">
        Visual Feature Recognition (VFR) Demo v2
      </h1>
      {/* overige inhoud */}
      <VFRModal />
    </main>
  );
}
