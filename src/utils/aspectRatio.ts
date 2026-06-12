import type { Artwork } from "../data/artworks";

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL ASPECT-RATIO / FRAME UTILITY
   ───────────────────────────────────────────────────────────────────
   Single source of truth for displaying any painting + frame at its
   true proportions everywhere (Collection, Product, Gallery, Cart,
   Wishlist, 360° viewer, AR). Never stretches, crops, or distorts.
   ═══════════════════════════════════════════════════════════════════ */

export type Orientation = "portrait" | "landscape" | "square";

export interface ArtDimensions {
  /** real-world width in inches (parsed from dimensions string) */
  width: number;
  /** real-world height in inches */
  height: number;
  /** width / height */
  aspectRatio: number;
  orientation: Orientation;
  /** CSS aspect-ratio value e.g. "36 / 48" */
  cssAspect: string;
  /** Tailwind/inline padding-bottom % for ratio boxes */
  paddingTop: string;
}

const DEFAULT: ArtDimensions = {
  width: 24,
  height: 36,
  aspectRatio: 24 / 36,
  orientation: "portrait",
  cssAspect: "24 / 36",
  paddingTop: `${(36 / 24) * 100}%`,
};

/**
 * Parse a dimensions string like "36 × 48 inches" / "30x40" / "24 X 36 in".
 * Convention: first number = width, second = height.
 */
export function parseDimensions(dimensions?: string | null): ArtDimensions {
  if (!dimensions) return DEFAULT;

  const match = dimensions.match(/(\d+(?:\.\d+)?)\s*[×xX*]\s*(\d+(?:\.\d+)?)/);
  if (!match) return DEFAULT;

  const width = parseFloat(match[1]);
  const height = parseFloat(match[2]);
  if (!width || !height) return DEFAULT;

  return buildDimensions(width, height);
}

/** Build a full ArtDimensions object from raw width/height (inches OR pixels). */
export function buildDimensions(width: number, height: number): ArtDimensions {
  const aspectRatio = width / height;
  const orientation: Orientation =
    Math.abs(width - height) < 0.5
      ? "square"
      : width > height
        ? "landscape"
        : "portrait";

  return {
    width,
    height,
    aspectRatio,
    orientation,
    cssAspect: `${width} / ${height}`,
    paddingTop: `${(height / width) * 100}%`,
  };
}

/**
 * Get dimensions for an artwork. Prefers explicit pixel/inch fields if
 * present, otherwise parses the human-readable `dimensions` string.
 */
export function getArtDimensions(
  art: Pick<Artwork, "dimensions"> & {
    width?: number;
    height?: number;
  }
): ArtDimensions {
  if (art.width && art.height) {
    return buildDimensions(art.width, art.height);
  }
  return parseDimensions(art.dimensions);
}

/**
 * Frame border thickness scales gently with the artwork's largest side
 * so big pieces get proportionally chunkier frames. Returned as a
 * fraction (0–1) of the SHORTER display side, clamped for elegance.
 */
export function frameBorderRatio(dims: ArtDimensions): number {
  const longest = Math.max(dims.width, dims.height);
  // ~6% baseline, grows slightly for large works, clamped 5%–9%
  const ratio = 0.05 + Math.min(0.04, (longest - 24) / 24 * 0.02);
  return Math.max(0.05, Math.min(0.09, ratio));
}

/**
 * Compute pixel display size for a framed artwork that must fit inside a
 * bounding box while preserving aspect ratio (object-fit: contain style,
 * but for the frame+art unit). Frame and art scale together.
 */
export function fitInside(
  dims: ArtDimensions,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  const boxRatio = maxW / maxH;
  if (dims.aspectRatio > boxRatio) {
    // art is wider than box → constrain by width
    return { width: maxW, height: maxW / dims.aspectRatio };
  }
  // constrain by height
  return { width: maxH * dims.aspectRatio, height: maxH };
}

/**
 * 3D frame geometry for Three.js (gallery + 360° viewer).
 * Returns world-unit sizes that preserve the painting's real aspect ratio.
 * `targetMax` is the largest dimension in world units.
 */
export function get3DFrameGeometry(dims: ArtDimensions, targetMax = 2.8) {
  let artW: number;
  let artH: number;
  if (dims.aspectRatio >= 1) {
    artW = targetMax;
    artH = targetMax / dims.aspectRatio;
  } else {
    artH = targetMax;
    artW = targetMax * dims.aspectRatio;
  }

  const border = Math.max(artW, artH) * frameBorderRatio(dims);
  const frameW = artW + border * 2;
  const frameH = artH + border * 2;
  // depth scales subtly with size for realism
  const depth = 0.06 + Math.min(0.06, Math.max(artW, artH) * 0.02);

  return { artW, artH, frameW, frameH, depth, border };
}

export function orientationLabel(o: Orientation): string {
  return o.charAt(0).toUpperCase() + o.slice(1);
}
