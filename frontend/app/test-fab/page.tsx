/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:59+02:00
 */

"use client";

import Fab from "../components/ai-assist/Fab";
import { AIAssistantProvider } from "../contexts/AIAssistantContext";

export default function TestFabPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Test FAB Page</h1>
      <p className="mb-8">This page tests the Floating Action Button (FAB) component directly.</p>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <p>You should see a red floating button in the bottom-right corner of the screen.</p>
        <p>Click it to open the AI assistant menu.</p>
      </div>
      
      <AIAssistantProvider>
        <Fab />
      </AIAssistantProvider>
    </div>
  );
}