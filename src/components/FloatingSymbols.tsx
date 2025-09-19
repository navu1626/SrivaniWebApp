import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface FloatingSymbolsProps {
  count?: number;
  customImages?: string[]; // Array of image URLs for custom floating elements
}

// Lotus flower SVG component
const LotusSVG = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M50 85C65 85 75 75 75 60C75 45 65 35 50 35C35 35 25 45 25 60C25 75 35 85 50 85Z"
      fill={color}
      opacity="0.6"
    />
    <path
      d="M50 75C60 75 68 67 68 55C68 43 60 35 50 35C40 35 32 43 32 55C32 67 40 75 50 75Z"
      fill={color}
      opacity="0.4"
    />
    <path
      d="M50 65C55 65 60 60 60 50C60 40 55 35 50 35C45 35 40 40 40 50C40 60 45 65 50 65Z"
      fill={color}
      opacity="0.8"
    />
  </svg>
);

// Om symbol SVG component
const OmSVG = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M20 40C20 30 30 20 40 20C50 20 60 30 60 40C60 50 70 60 80 60C85 60 90 55 90 50C90 45 85 40 80 40C75 40 70 45 70 50"
      stroke={color}
      strokeWidth="3"
      fill="none"
      opacity="0.7"
    />
    <circle cx="25" cy="70" r="8" fill={color} opacity="0.6" />
    <path
      d="M40 70C40 75 45 80 50 80C55 80 60 75 60 70"
      stroke={color}
      strokeWidth="3"
      fill="none"
      opacity="0.7"
    />
  </svg>
);

// Animated flower symbols floating upward across the whole viewport
export default function FloatingSymbols({ count = 25, customImages = [] }: FloatingSymbolsProps) {
  const items = Array.from({ length: count }).map((_, i) => ({
    key: i,
    left: `${(i * 4 + (i % 10) * 3 + 2) % 98}%`,
    size: 18 + ((i * 9) % 22),
    delay: (i % 10) * 0.8,
    duration: 15 + (i % 7) * 3,
    rotate: (i % 2 ? 1 : -1) * (12 + (i % 6) * 8),
    opacity: 0.25 + ((i % 5) * 0.08),
    color: i % 3 === 0 ? '#FF6B35' : i % 3 === 1 ? '#FFD700' : '#EA580C',
    symbol: i % 2 === 0 ? 'lotus' : 'om',
    customImageIndex: customImages.length > 0 ? i % customImages.length : -1,
  }));

  // Use effect to ensure the animation covers the full document height
  useEffect(() => {
    const updateHeight = () => {
      const element = document.getElementById('floating-symbols');
      if (element) {
        element.style.height = `${Math.max(document.documentElement.scrollHeight, window.innerHeight)}px`;
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('scroll', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('scroll', updateHeight);
    };
  }, []);

  return (
    <div
      id="floating-symbols"
      className="fixed top-0 left-0 pointer-events-none z-10 overflow-hidden w-full"
      style={{ height: '100vh', minHeight: '100vh' }}
    >
      {items.map((p) => (
        <motion.div
          key={p.key}
          initial={{ y: '110%', opacity: 0, rotate: 0 }}
          animate={{
            y: '-50%',
            opacity: p.opacity,
            rotate: p.rotate,
            x: [0, 20, -20, 0] // enhanced side-to-side drift
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
            x: { repeat: Infinity, duration: p.duration * 0.5, ease: 'easeInOut' }
          }}
          style={{
            position: 'absolute',
            left: p.left,
            top: 0
          }}
        >
          {p.customImageIndex >= 0 ? (
            <img
              src={customImages[p.customImageIndex]}
              alt="floating element"
              style={{ width: p.size, height: p.size, opacity: p.opacity }}
              className="object-contain"
            />
          ) : p.symbol === 'lotus' ? (
            <LotusSVG size={p.size} color={p.color} />
          ) : (
            <OmSVG size={p.size} color={p.color} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

