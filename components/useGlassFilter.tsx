"use client";
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { createDisplacementMap, supportsRefraction, type GlassMap } from '@/lib/glass';

/**
 * Real refraction for one glass element (Chromium only; everything else
 * keeps the plain frosted material from globals.css).
 * Returns the hidden SVG <filter> to render + the backdrop-filter style.
 */
export function useGlassFilter(opts: {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  thickness?: number;
  strength?: number;
  blur?: number;
  saturate?: number;
}): { defs: ReactNode; style: CSSProperties | undefined } {
  const rawId = useId();
  const id = 'lg' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const [map, setMap] = useState<GlassMap | null>(null);
  const { width, height, radius, bezel, thickness, strength } = opts;

  useEffect(() => {
    if (!supportsRefraction()) return;
    setMap(createDisplacementMap({ width, height, radius, bezel, thickness, strength }));
  }, [width, height, radius, bezel, thickness, strength]);

  if (!map) return { defs: null, style: undefined };

  const value = `url(#${id}) blur(${opts.blur ?? 0.8}px) saturate(${opts.saturate ?? 1.9}) brightness(1.03)`;
  return {
    defs: (
      <svg
        aria-hidden
        colorInterpolationFilters="sRGB"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
      >
        <defs>
          <filter id={id} x="0" y="0" width={width} height={height} filterUnits="userSpaceOnUse">
            <feImage href={map.url} x="0" y="0" width={width} height={height} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={map.scale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    ),
    style: { backdropFilter: value, WebkitBackdropFilter: value },
  };
}
