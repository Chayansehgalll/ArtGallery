/* ════════════════════════════════════════════════════════════════
   SHARED PAINTING DATA SOURCE
   The single source of truth for painting data across the whole app:
   Home, Collection, Gallery, Product, Featured, Recommendations,
   Wishlist, and Search all read from here.

   • Fetches live data from the backend (/api/paintings)
   • Normalizes the backend shape → the app's Artwork shape
   • Falls back to bundled sample data when the backend is offline
   • Caches results in a module-level store and notifies subscribers,
     so every component stays in sync without its own fetch.
   ════════════════════════════════════════════════════════════════ */

import { useSyncExternalStore } from "react";
import { artworks as LOCAL_ARTWORKS, type Artwork } from "../data/artworks";
import { resolveDimensions, formatDimensions } from "../utils/frame";

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || "http://localhost:4000/api";

/* ── Backend painting shape (subset we use) ── */
interface BackendPainting {
  id: string;
  title: string;
  description?: string;
  story?: string;
  price: number | string;
  originalPrice?: number | string | null;
  width?: number;
  height?: number;
  medium?: string;
  style?: string;
  year?: number;
  edition?: number;
  editionTotal?: number;
  isOriginal?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  inStock?: boolean;
  forSale?: boolean;
  frameOptions?: string[];
  tags?: string[];
  coverImage?: string;
  mainImage?: string;
  images?: string[];
  thumbnail?: string;
  category?: { name?: string } | string | null;
  badge?: string;
  quote?: string;
}

/* ── Normalize backend → Artwork ── */
function normalize(p: BackendPainting): Artwork {
  const dims = resolveDimensions(p.width, p.height);
  const categoryName =
    typeof p.category === "string" ? p.category : p.category?.name || "Uncategorized";
  
  // Image resolution with explicit fallback logic per spec:
  // - coverImage: used for thumbnails (cards, lists, wishlist, cart)
  //   Prefers coverImage, falls back to mainImage
  const cover = p.coverImage || p.mainImage || p.images?.[0] || p.thumbnail || "";
  
  // - mainImage: used for full-resolution view (product details, full-screen, zoom)
  //   Prefers mainImage, falls back to coverImage
  const main = p.mainImage || p.coverImage || p.images?.[0] || p.thumbnail || "";
  
  // Additional gallery images
  const images = p.images && p.images.length ? p.images : main ? [main] : [];
  
  const price = typeof p.price === "string" ? parseFloat(p.price) : p.price ?? 0;
  const originalPrice =
    p.originalPrice != null
      ? typeof p.originalPrice === "string"
        ? parseFloat(p.originalPrice)
        : p.originalPrice
      : undefined;

  return {
    id: p.id,
    title: p.title,
    artist: "Yashika",
    price,
    originalPrice,
    category: categoryName,
    style: p.style || "Contemporary",
    size:
      dims.width * dims.height > 2000
        ? "Extra Large"
        : dims.width * dims.height > 1200
          ? "Large"
          : dims.width * dims.height > 600
            ? "Medium"
            : "Small",
    dimensions: formatDimensions(dims),
    width: dims.width,
    height: dims.height,
    year: p.year ?? new Date().getFullYear(),
    medium: p.medium || "Oil on Canvas",
    description: p.description || "",
    story: p.story || "",
    edition: p.edition ?? 1,
    editionTotal: p.editionTotal ?? 1,
    certificate: true,
    image: cover || main,
    coverImage: cover,
    mainImage: main,
    images,
    colors: [],
    frameColors: p.frameOptions && p.frameOptions.length ? p.frameOptions : ["Black Oak", "Walnut"],
    inStock: p.inStock ?? true,
    isOriginal: p.isOriginal ?? true,
    roomType: [],
    forSale: p.forSale ?? true,
    badge: p.badge,
    quote: p.quote,
  };
}

/* ── Ensure local sample data also carries width/height ── */
function withDims(list: Artwork[]): Artwork[] {
  return list.map((a) => {
    if (a.width && a.height) return a;
    const dims = resolveDimensions(a.width, a.height, a.dimensions);
    return { ...a, width: dims.width, height: dims.height };
  });
}

/* ── Module-level store ── */
type Status = "idle" | "loading" | "ready" | "error";
interface State {
  paintings: Artwork[];
  status: Status;
  source: "backend" | "local";
}

let state: State = {
  paintings: withDims(LOCAL_ARTWORKS),
  status: "idle",
  source: "local",
};

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

let fetchPromise: Promise<void> | null = null;

export async function fetchPaintings(force = false): Promise<void> {
  if (fetchPromise && !force) return fetchPromise;
  if (state.status === "loading") return fetchPromise ?? Promise.resolve();

  setState({ status: "loading" });

  fetchPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/paintings?limit=100`);
      if (!res.ok) throw new Error("bad response");
      const json = await res.json();
      const list: BackendPainting[] = json?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setState({
          paintings: list.map(normalize),
          status: "ready",
          source: "backend",
        });
        return;
      }
      // Backend reachable but empty → keep local sample so UI isn't blank
      setState({ paintings: withDims(LOCAL_ARTWORKS), status: "ready", source: "local" });
    } catch {
      // Offline → graceful fallback to bundled data
      setState({ paintings: withDims(LOCAL_ARTWORKS), status: "ready", source: "local" });
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/* ── React hook: every component subscribes to the SAME data ── */
function subscribe(cb: () => void) {
  listeners.add(cb);
  // Kick off a fetch the first time anyone subscribes
  if (state.status === "idle") fetchPaintings();
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return state;
}

export function usePaintings() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    paintings: snap.paintings,
    status: snap.status,
    source: snap.source,
    refresh: () => fetchPaintings(true),
  };
}

/* ── Image helpers ──
   Use coverOf() everywhere a thumbnail/preview is shown (lists, cards,
   cart, wishlist, search, recommendations). Use mainOf() only on the
   product details page / lightbox for the full-resolution artwork. */
export function coverOf(a: Artwork): string {
  return a.coverImage || a.image || a.mainImage || a.images?.[0] || "";
}
export function mainOf(a: Artwork): string {
  return a.mainImage || a.image || a.coverImage || a.images?.[0] || "";
}

/* ── Selectors (pure, derive from a list) ── */
export function selectForSale(list: Artwork[]) {
  return list.filter((a) => a.forSale !== false);
}
export function selectExhibition(list: Artwork[]) {
  return list.filter((a) => a.forSale === false);
}
export function selectFeatured(list: Artwork[], limit = 3) {
  return list.slice(0, limit);
}
export function selectRelated(list: Artwork[], current: Artwork, limit = 4) {
  return list
    .filter((a) => a.id !== current.id && (a.category === current.category || a.style === current.style))
    .slice(0, limit);
}
/** Up to `max` paintings for the 3D gallery (featured/latest first) */
export function selectGallery(list: Artwork[], max = 10) {
  return list.slice(0, max);
}