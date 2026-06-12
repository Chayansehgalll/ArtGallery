import type { Artwork } from "./artworks";

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || "http://localhost:4000/api";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80";

/** Backend painting shape (subset we use) */
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
  inStock?: boolean;
  frameOptions?: string[];
  tags?: string[];
  images?: string[];
  thumbnail?: string | null;
  category?: { name?: string } | null;
}

function sizeFromDimensions(w: number, h: number): string {
  const area = w * h;
  if (area <= 18 * 24) return "Small";
  if (area <= 30 * 40) return "Medium";
  if (area <= 40 * 50) return "Large";
  return "Extra Large";
}

/** Convert a backend painting record into the site's Artwork shape */
export function mapBackendPainting(p: BackendPainting): Artwork {
  const w = p.width ?? 24;
  const h = p.height ?? 36;
  const images = p.images && p.images.length > 0 ? p.images : p.thumbnail ? [p.thumbnail] : [PLACEHOLDER];

  return {
    id: p.id,
    title: p.title,
    artist: "Yashika",
    price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
    originalPrice: p.originalPrice
      ? typeof p.originalPrice === "string"
        ? parseFloat(p.originalPrice)
        : p.originalPrice
      : undefined,
    category: p.category?.name ?? "Abstract",
    style: p.style ?? "Contemporary",
    size: sizeFromDimensions(w, h),
    dimensions: `${w} × ${h} inches`,
    year: p.year ?? new Date().getFullYear(),
    medium: p.medium ?? "Oil on Canvas",
    description: p.description ?? "",
    story: p.story ?? "",
    edition: p.edition ?? 1,
    editionTotal: p.editionTotal ?? 1,
    certificate: true,
    image: images[0],
    images,
    colors: [],
    frameColors: p.frameOptions && p.frameOptions.length > 0 ? p.frameOptions : ["Black Oak", "Walnut"],
    inStock: p.inStock ?? true,
    isOriginal: p.isOriginal ?? true,
    roomType: ["Living Room", "Office", "Bedroom"],
    // Admin-added paintings are for sale by default → show price + Add to Cart
    forSale: true,
  };
}

/** Fetch all active paintings from the backend. Returns null if unreachable. */
export async function fetchPaintings(): Promise<Artwork[] | null> {
  try {
    const res = await fetch(`${API_BASE}/paintings?limit=100`);
    if (!res.ok) return null;
    const json = await res.json();
    const list: BackendPainting[] = json?.data ?? [];
    if (!Array.isArray(list) || list.length === 0) return null;
    return list.map(mapBackendPainting);
  } catch {
    return null;
  }
}
