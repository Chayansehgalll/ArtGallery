/* ════════════════════════════════════════════════════════════════
SHARED PAINTING DATA SOURCE

Single source of truth for painting data across the app:
Home, Collection, Gallery, Product, Featured, Recommendations,
Wishlist, Search.

• Fetches live data from backend (/api/paintings)
• Normalizes backend → Artwork shape
• Falls back to local sample data if backend fails
• Shared module-level cache with reactive subscriptions
════════════════════════════════════════════════════════════════ */

import { useSyncExternalStore } from "react";
import { artworks as LOCAL_ARTWORKS, type Artwork } from "../data/artworks";
import { resolveDimensions, formatDimensions } from "../utils/frame";

/* ── API base ── */
const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || "http://localhost:4000/api";

/* ── Backend shape ── */
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
    typeof p.category === "string"
      ? p.category
      : p.category?.name || "Uncategorized";

  const cover =
    p.coverImage || p.mainImage || p.images?.[0] || p.thumbnail || "";

  const main =
    p.mainImage || p.coverImage || p.images?.[0] || p.thumbnail || "";

  const images =
    p.images && p.images.length ? p.images : main ? [main] : [];

  const price =
    typeof p.price === "string" ? parseFloat(p.price) : p.price ?? 0;

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
    frameColors:
      p.frameOptions && p.frameOptions.length
        ? p.frameOptions
        : ["Black Oak", "Walnut"],
    inStock: p.inStock ?? true,
    isOriginal: p.isOriginal ?? true,
    roomType: [],
    forSale: p.forSale ?? true,
    badge: p.badge,
    quote: p.quote,
  };
}

/* ── Ensure local data has dimensions ── */
function withDims(list: Artwork[]): Artwork[] {
  return list.map((a) => {
    if (a.width && a.height) return a;
    const dims = resolveDimensions(a.width, a.height, a.dimensions);
    return { ...a, width: dims.width, height: dims.height };
  });
}

/* ── State store ── */
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
  listeners.forEach((l) => l());
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

/* ── Fetch control ── */
let fetchPromise: Promise<void> | null = null;

export async function fetchPaintings(force = false): Promise<void> {
  if (fetchPromise && !force) return fetchPromise;
  if (state.status === "loading") return fetchPromise ?? Promise.resolve();

  setState({ status: "loading" });

  fetchPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/paintings?limit=100`);
      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();
      const list: BackendPainting[] = json?.data || [];

      if (Array.isArray(list) && list.length > 0) {
        setState({
          paintings: list.map(normalize),
          status: "ready",
          source: "backend",
        });
      } else {
        setState({
          paintings: withDims(LOCAL_ARTWORKS),
          status: "ready",
          source: "local",
        });
      }
    } catch {
      setState({
        paintings: withDims(LOCAL_ARTWORKS),
        status: "ready",
        source: "local",
      });
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/* ── Subscription model ── */
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (state.status === "idle") fetchPaintings();
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

/* ── Hook ── */
export function usePaintings() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    paintings: snap.paintings,
    status: snap.status,
    source: snap.source,
    refresh: () => fetchPaintings(true),
  };
}

/* ── Helpers ── */
export function coverOf(a: Artwork): string {
  return a.coverImage || a.image || a.mainImage || a.images?.[0] || "";
}

export function mainOf(a: Artwork): string {
  return a.mainImage || a.image || a.coverImage || a.images?.[0] || "";
}

/* ── Selectors ── */
export function selectForSale(list: Artwork[]) {
  return list.filter((a) => a.forSale !== false);
}

export function selectExhibition(list: Artwork[]) {
  return list.filter((a) => a.forSale === false);
}

export function selectFeatured(list: Artwork[], limit = 3) {
  return list.slice(0, limit);
}

export function selectRelated(
  list: Artwork[],
  current: Artwork,
  limit = 4
) {
  return list
    .filter(
      (a) =>
        a.id !== current.id &&
        (a.category === current.category || a.style === current.style)
    )
    .slice(0, limit);
}

export function selectGallery(list: Artwork[], max = 10) {
  return list.slice(0, max);
}