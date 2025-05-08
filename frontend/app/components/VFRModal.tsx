/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import VFRViewer from "./VFRViewer";

export default function VFRModal() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
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
            <Dialog.Title className="sr-only">3D Model Viewer</Dialog.Title>
            <Dialog.Description className="sr-only">
              Interactive 3D model viewer for Visual Feature Recognition
            </Dialog.Description>
            <Dialog.Close className="absolute top-2 right-3 text-white text-2xl leading-none">
              ×
            </Dialog.Close>
            <VFRViewer />
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}