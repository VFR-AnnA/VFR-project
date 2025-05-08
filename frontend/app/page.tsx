/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

import Image from "next/image";
import VFRModal from "./components/VFRModal";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Visual Feature Recognition (VFR) Demo</h1>
      <VFRModal />
    </main>
  );
}
