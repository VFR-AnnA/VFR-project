/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:55+02:00
 */

"use client";

import { ReactNode } from "react";
import { AIAssistantProvider } from "../../contexts/AIAssistantContext";

interface ClientProviderWrapperProps {
  children: ReactNode;
}

export default function ClientProviderWrapper({ children }: ClientProviderWrapperProps) {
  return <AIAssistantProvider>{children}</AIAssistantProvider>;
}