/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import VFRViewerWrapper from "./VFRViewerWrapper";
import { ErrorBoundary } from 'react-error-boundary'
import { FC } from 'react';

const ViewerErrorBoundary: FC<{ onFail: () => void; children: React.ReactNode }> = ({ onFail, children }) => {
  return (
    <ErrorBoundary
      fallbackRender={() => {
        onFail(); // sluit modal
        return null; // niets renderen in Canvas
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default function VFRModal() {
  const handleViewerFail = () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Viewer failed to load');
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="focus:outline-none focus-visible:ring-2 px-4 py-2 bg-emerald-700 text-white rounded-lg" role="dialog" aria-modal="true" title="Open Viewer">
          Try It On
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 p-6 rounded-xl shadow-xl w-[840px] max-w-[95vw]"
          >
            <Dialog.Title className="sr-only" title="3D preview">3D Model Viewer</Dialog.Title>
            <Dialog.Description className="sr-only">
              Interactive 3D model viewer for Visual Feature Recognition
            </Dialog.Description>
            <Dialog.Close className="absolute top-2 right-3 text-white text-2xl leading-none">
              ×
            </Dialog.Close>
            <ViewerErrorBoundary onFail={handleViewerFail}>
              <VFRViewerWrapper />
            </ViewerErrorBoundary>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}