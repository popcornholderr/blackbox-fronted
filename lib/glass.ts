/**
 * Liquid-glass refraction, ported from mkj0kjay/vue-web-liquid-glass
 * (itself based on kube.io "Liquid Glass with CSS & SVG").
 *
 * 1. Model a convex glass bezel and trace a vertical ray through it with
 *    Snell's law -> how far each ray bends at every depth of the bezel.
 * 2. Paint that into an RGB displacement map shaped like the element
 *    (R = x shift, G = y shift, 128 = no shift).
 * 3. Feed the map to an SVG <feDisplacementMap>, used as `backdrop-filter`.
 */

const convexSquircle = (x: number) => Math.pow(1 - Math.pow(1 - x, 4), 1 / 4);

function bezelProfile(thickness: number, bezel: number, ior: number, samples = 128): number[] {
  const eta = 1 / ior;
  const refract = (nx: number, ny: number): [number, number] | null => {
    const dot = ny;
    const k = 1 - eta * eta * (1 - dot * dot);
    if (k < 0) return null;
    const ks = Math.sqrt(k);
    return [-(eta * dot + ks) * nx, eta - (eta * dot + ks) * ny];
  };

  return Array.from({ length: samples }, (_, i) => {
    const x = i / samples;
    const y = convexSquircle(x);
    const dx = x < 1 ? 0.0001 : -0.0001;
    const d = (convexSquircle(x + dx) - y) / dx;
    const m = Math.sqrt(d * d + 1);
    const r = refract(-d / m, -1 / m);
    if (!r) return 0;
    return r[0] * ((y * bezel + thickness) / r[1]);
  });
}

export type GlassMap = { url: string; scale: number };

export function createDisplacementMap(opts: {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  thickness?: number;
  ior?: number;
  strength?: number;
  dpr?: number;
}): GlassMap | null {
  if (typeof document === 'undefined') return null;
  const { width, height, radius, bezel, thickness = 90, ior = 1.5, strength = 1 } = opts;
  const dpr = opts.dpr ?? 2;

  const profile = bezelProfile(thickness, bezel, ior);
  const maxDisp = Math.max(...profile.map(Math.abs)) || 1;

  const bw = Math.floor(width * dpr);
  const bh = Math.floor(height * dpr);
  const img = new ImageData(bw, bh);
  new Uint32Array(img.data.buffer).fill(0xff008080); // neutral: no displacement

  const r = radius * dpr;
  const bz = bezel * dpr;
  const rSq = r * r;
  const rPlusSq = (r + 1) ** 2;
  const rMinusBezelSq = (r - bz) ** 2;
  const midW = bw - r * 2;
  const midH = bh - r * 2;

  for (let y1 = 0; y1 < bh; y1++) {
    for (let x1 = 0; x1 < bw; x1++) {
      const left = x1 < r;
      const right = x1 >= bw - r;
      const top = y1 < r;
      const bottom = y1 >= bh - r;
      const x = left ? x1 - r : right ? x1 - r - midW : 0;
      const y = top ? y1 - r : bottom ? y1 - r - midH : 0;
      const dSq = x * x + y * y;
      if (dSq > rPlusSq || dSq < rMinusBezelSq) continue;

      const d = Math.sqrt(dSq);
      const edge = dSq < rSq ? 1 : 1 - (d - Math.sqrt(rSq)) / (Math.sqrt(rPlusSq) - Math.sqrt(rSq));
      const idx = Math.min(profile.length - 1, (((r - d) / bz) * profile.length) | 0);
      const dist = profile[Math.max(0, idx)] ?? 0;
      const cos = d === 0 ? 0 : x / d;
      const sin = d === 0 ? 0 : y / d;
      const dX = (-cos * dist) / maxDisp;
      const dY = (-sin * dist) / maxDisp;
      const o = (y1 * bw + x1) * 4;
      img.data[o] = 128 + dX * 127 * edge;
      img.data[o + 1] = 128 + dY * 127 * edge;
      img.data[o + 2] = 0;
      img.data[o + 3] = 255;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = bw;
  canvas.height = bh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.putImageData(img, 0, 0);

  // feDisplacementMap shifts by scale * (channel - 0.5); 127/255 ~ 0.5.
  return { url: canvas.toDataURL('image/png'), scale: maxDisp * 2 * strength };
}

/** Only Chromium renders url() filters inside backdrop-filter. */
export function supportsRefraction(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua);
  return !ios && /Chrome|Chromium|Edg\//.test(ua) && !/Firefox|OPR\//.test(ua);
}
