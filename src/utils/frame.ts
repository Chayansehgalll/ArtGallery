/* ════════════════════════════════════════════════════════════════
   Shared frame / dimension utility
   The single source of truth for how an artwork's real-world
   dimensions translate into proportionally-correct display sizes.
   Used by Collection cards, Product details, and the 3D gallery.
   ════════════════════════════════════════════════════════════════ */

export type Orientation = "portrait" | "landscape" | "square";

export interface Dimensions {
  width: number;       // real-world width (inches)
  height: number;      // real-world height (inches)
  aspectRatio: number; // width / height
  orientation: Orientation;
}

/** Parse "36 × 48 inches" / "36x48" / "36 by 48" → { width, height } */
export function parseDimensions(input?: string | null): { width: number; height: number } | null {
  if (!input) return null;
  const m = input.match(/(\d+(?:\.\d+)?)\s*(?:×|x|X|by|\*)\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const width = parseFloat(m[1]);
  const height = parseFloat(m[2]);
  if (!width || !height) return null;
  return { width, height };
}

/** Build a normalized Dimensions object from width/height (+ optional string fallback) */
export function resolveDimensions(
  width?: number | null,
  height?: number | null,
  fallbackString?: string | null
): Dimensions {
  let w = width && width > 0 ? width : 0;
  let h = height && height > 0 ? height : 0;

  if (!w || !h) {
    const parsed = parseDimensions(fallbackString);
    if (parsed) {
      w = w || parsed.width;
      h = h || parsed.height;
    }
  }

  // Final sensible default (standard 24×36 portrait)
  if (!w) w = 24;
  if (!h) h = 36;

  const aspectRatio = w / h;
  const orientation: Orientation =
    Math.abs(aspectRatio - 1) < 0.04 ? "square" : aspectRatio > 1 ? "landscape" : "portrait";

  return { width: w, height: h, aspectRatio, orientation };
}

/** Pretty display string, e.g. "36 × 48 in" */
export function formatDimensions(d: Dimensions): string {
  const fmt = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));
  return `${fmt(d.width)} × ${fmt(d.height)} in`;
}

/**
 * Compute a CSS-ready display box that preserves the exact aspect ratio
 * while fitting inside a max width/height budget. Returns pixel size and
 * a CSS `aspect-ratio` string so the frame never stretches or crops.
 */
export function fitWithin(
  d: Dimensions,
  maxW: number,
  maxH: number
): { width: number; height: number; aspectRatio: string } {
  const ar = d.aspectRatio;
  let w = maxW;
  let h = w / ar;
  if (h > maxH) {
    h = maxH;
    w = h * ar;
  }
  return { width: Math.round(w), height: Math.round(h), aspectRatio: `${d.width} / ${d.height}` };
}

/**
 * Frame border thickness scaled to the artwork size — larger pieces get
 * proportionally chunkier frames, keeping the look consistent.
 */
export function frameThickness(d: Dimensions, base = 14): number {
  const longest = Math.max(d.width, d.height);
  return Math.max(8, Math.min(28, Math.round(base * (longest / 36))));
}

/** Real-world scale for the 3D gallery (inches → metres, 1in ≈ 0.0254m, amplified for presence) */
export function toGalleryMetres(d: Dimensions, scale = 0.06): { w: number; h: number } {
  return { w: d.width * scale, h: d.height * scale };
}
