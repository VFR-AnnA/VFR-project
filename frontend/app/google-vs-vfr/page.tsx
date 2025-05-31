'use client';

import GoogleTryOn from '../components/GoogleTryOn';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './comparison.css';

// Dynamically import VFR viewer to avoid SSR issues
const VFRViewerWrapper = dynamic(
  () => import('@/app/components/VFRViewerWrapper'),
  { ssr: false }
);

const comparisonData = {
  technology: {
    google: "2D Image Overlay",
    vfr: "3D Real-Time Rendering"
  },
  speed: {
    google: "~5-10 seconds processing",
    vfr: "Instant (60 FPS)"
  },
  interaction: {
    google: "Static result",
    vfr: "360° rotation, zoom, physics"
  },
  accuracy: {
    google: "Approximate fit",
    vfr: "Precise body measurements"
  },
  scalability: {
    google: "Cloud-dependent",
    vfr: "Client-side rendering"
  },
  availability: {
    google: "US-only (beta)",
    vfr: "Global availability"
  }
};

export default function GoogleVsVfr() {
  const [showComparison, setShowComparison] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleSwitchTo3D = () => {
    window.location.href = '/cegeka-demo.html';
  };

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollLeft > 10) {
        container.classList.add('scrolled');
      } else {
        container.classList.remove('scrolled');
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [showComparison]);

  return (
    <main className="demo-container">
      {/* Header with navigation */}
      <header className="header-nav">
        <Link
          href="/"
          className="back-home-btn"
        >
          ⬅︎ Home
        </Link>
        <h1 className="page-title">VFR-Anna Demo</h1>
        <div className="header-spacer"></div>
      </header>

      <div className="demo-header">
        <h1>2D vs 3D Try-On Technology Comparison</h1>
        <p>Experience the difference between traditional 2D overlay and advanced 3D real-time rendering</p>
      </div>

      <div className="comparison-grid">
        {/* Google 2D Side */}
        <section className="google-side">
          <div className="section-header">
            <h2>Google 2D Try-On (Mock)</h2>
            <span className="tech-badge">2D Technology</span>
          </div>
          <GoogleTryOn />
        </section>

        {/* VFR 3D Side */}
        <section className="vfr-anna-side relative overflow-hidden">
          <div className="absolute inset-0 bg-[#001b39]/60 z-0" />
          <div className="relative z-10">
            <div className="section-header">
              <h2>VFR-Anna 3D Real-Time</h2>
              <span className="tech-badge premium">3D Technology</span>
            </div>
            <div className="vfr-viewer-container">
              <VFRViewerWrapper
                params={{ heightCm: 175 }}
                showControls={true}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div className="comparison-table-container" ref={tableContainerRef}>
          <h3>Technical Comparison</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Google 2D</th>
                <th>VFR-Anna 3D</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(comparisonData).map(([key, value]) => (
                <tr key={key}>
                  <td className="feature-name">{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                  <td className="google-value">{value.google}</td>
                  <td className="vfr-value">{value.vfr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CTA Button */}
      <div className="cta-container">
        <button 
          className="switch-to-3d-btn"
          onClick={handleSwitchTo3D}
        >
          <span className="btn-text">Switch to Full 3D Experience</span>
          <span className="btn-arrow">→</span>
        </button>
        <p className="cta-subtitle">Experience the future of virtual try-on technology</p>
      </div>
    </main>
  );
}