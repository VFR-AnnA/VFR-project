import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cegeka VFR Demo',
  description: 'Virtual Fitting Room technology demo for Cegeka',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="demo-layout">
      {children}
    </div>
  );
}