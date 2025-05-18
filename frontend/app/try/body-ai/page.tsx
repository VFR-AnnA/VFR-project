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
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Body AI Measurements</h1>
      <BodyAIDemo />
    </main>
  );
}