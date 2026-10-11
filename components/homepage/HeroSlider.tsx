'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const slides = [
  { type: 'video', src: '/videos/hero-video.mp4', subtitle: 'Trustworthy & Secure AI Research' },
  { type: 'image', src: '/images/theme-network-anomaly.jpg', subtitle: 'AI-Driven Cyber Defense & Threat Intelligence' },
  { type: 'image', src: '/images/hero-slide-2.jpg', subtitle: 'Privacy & Security in Critical Infrastructures' },
  { type: 'image', src: '/images/hero-slide-3.jpg', subtitle: 'Emerging Frontiers: Quantum-Safe & Generative AI Security' },
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isPlaying) {
      const currentSlide = slides[currentIndex];
      if (currentSlide.type === 'image') {
        timer = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
      }
    }
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying]);

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const nextState = !prev;
      if (videoRef.current) {
        if (nextState) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
      return nextState;
    });
  };

  const handleVideoEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Swipe support for touch devices — a real horizontal drag (not a
  // vertical scroll) of at least 40px moves to the next/previous slide.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section className="cl-hero" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Media Background */}
      <div className="cl-hero-photo">
        {slides[currentIndex].type === 'video' ? (
          <video
            ref={videoRef}
            src={slides[currentIndex].src}
            poster="/images/hero-video-poster.jpg"
            autoPlay
            muted
            playsInline
            preload="auto"
            // Hints the browser to fetch this — the page's LCP element —
            // before lower-priority resources, shaving time off first paint.
            // React maps this camelCase prop to the real DOM attribute
            // itself — the lowercase `fetchpriority` key used earlier was
            // wrong and threw "Invalid DOM property" at runtime. The cast
            // is only needed because @types/react doesn't list this prop
            // on <video> yet even though React/the browser both support it.
            {...({ fetchPriority: 'high' } as React.VideoHTMLAttributes<HTMLVideoElement>)}
            onEnded={handleVideoEnded}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              backgroundImage: `url(${slides[currentIndex].src})`,
              width: '100%',
              height: '100%',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'saturate(1.5) brightness(1.1) contrast(1.08)',
            }}
          />
        )}
      </div>

      <div className="cl-hero-scrim" />

      {/* Floating Card Content */}
      <div className="cl-hero-inner">
        <div className="cl-hero-card">
          <p className="cl-hero-subtitle"><span style={{ color: '#0345fa' }}>Cybersecurity and Artificial Intelligence Research Lab</span></p>
          
          {currentIndex === 0 ? (
            <>
              <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                Welcome to <span className="cl-hero-title-accent">CAIRLab</span>
              </h1>
              <p>{slides[currentIndex].subtitle}</p>
            </>
          ) : (
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.2', margin: '0 0 16px 0' }}>
              {slides[currentIndex].subtitle}
            </h2>
          )}

          <div className="cl-hero-ctas">
            <Link href="/contact" className="cl-btn-blue" style={{ fontFamily: 'var(--font-mono)', border: '1px solid rgba(29, 78, 216, 0.4)', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', animation: 'shimmer 2.5s infinite' }} />
              GET IN TOUCH
            </Link>
            <Link href="/projects" className="cl-btn-white" style={{ fontFamily: 'var(--font-mono)' }}>
               EXPLORE OUR RESEARCH
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Controls matching reference */}
      <div className="cl-hero-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={togglePlay} 
            style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '4px', color: '#fff', fontSize: '12px', cursor: 'pointer', padding: '4px 8px', fontFamily: 'var(--font-mono)', backdropFilter: 'blur(4px)' }}
          >
            {isPlaying ? '■ PAUSE' : '▶ PLAY'}
          </button>
          
          <div style={{ width: '120px', height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${((currentIndex + 1) / slides.length) * 100}%`,
                background: '#ffffff',
                transition: 'width 0.3s ease',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)'
              }}
            />
          </div>

          <div className="cl-hero-dots">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`cl-dot ${currentIndex === idx ? 'on' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="cl-hero-arrow" onClick={prevSlide} style={{ borderRadius: '4px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>&lt;</span>
          </div>
          <div className="cl-hero-arrow" onClick={nextSlide} style={{ borderRadius: '4px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>&gt;</span>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes shimmer {
          100% { left: 100%; }
        }
      `}</style>
    </section>
  );
}