import { ReactNode } from 'react';

// Define metadata export
export const metadata = {
  title: 'VFR Generator',
  description: 'Generate custom 3D models for the Virtual Fitting Room',
};

export default function GeneratorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="generator-layout">
      {children}
    </div>
  );
}