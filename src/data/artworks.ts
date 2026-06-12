export interface Artwork {
  id: string;
  title: string;
  artist: string;
  price: number;
  originalPrice?: number;
  category: string;
  style: string;
  size: string;
  dimensions: string;
  width?: number;
  height?: number;
  year: number;
  medium: string;
  description: string;
  story: string;
  edition: number;
  editionTotal: number;
  certificate: boolean;
  image: string;
  images: string[];
  colors: string[];
  frameColors: string[];
  inStock: boolean;
  isOriginal: boolean;
  roomType: string[];
  forSale?: boolean;
  badge?: string;
  quote?: string;
}

export const artworks: Artwork[] = [
  {
    id: "aw-001",
    title: "Ethereal Silence",
    artist: "Yashika",
    price: 4200,
    category: "Abstract",
    style: "Contemporary",
    size: "Large",
    dimensions: "36 × 48 inches",
    year: 2024,
    medium: "Oil on Canvas",
    description: "A mesmerizing exploration of silence and space, where layers of muted tones create an atmosphere of contemplative tranquility.",
    story: "Elena spent three months in the Scottish Highlands, where the profound silence inspired this piece. Each layer represents a different moment of stillness she experienced.",
    edition: 1,
    editionTotal: 1,
    certificate: true,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
      "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80"
    ],
    colors: ["#1a1a2e", "#16213e", "#0f3460"],
    frameColors: ["Black Oak", "Walnut", "White Gold"],
    inStock: true,
    isOriginal: true,
    roomType: ["Living Room", "Bedroom", "Office"],
    forSale: false,
    badge: "Exhibition Only",
    quote: "Silence is the only medium where profound truths can be accurately painted."
  },
  {
    id: "aw-002",
    title: "Golden Hour Reverie",
    artist: "Yashika",
    price: 2800,
    originalPrice: 3200,
    category: "Landscape",
    style: "Impressionist",
    size: "Medium",
    dimensions: "24 × 36 inches",
    year: 2024,
    medium: "Acrylic on Linen",
    description: "Capturing the fleeting magic of golden hour, this piece radiates warmth and nostalgia through bold brushstrokes and luminous color.",
    story: "Painted during a residency in Provence, Marcus chased the perfect light for seventeen evenings before capturing this moment.",
    edition: 12,
    editionTotal: 50,
    certificate: true,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
      "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&q=80"
    ],
    colors: ["#d4a574", "#c9a86c", "#8b6914"],
    frameColors: ["Walnut", "Natural Oak", "Brass"],
    inStock: true,
    isOriginal: false,
    roomType: ["Living Room", "Dining Room"]
  },
  {
    id: "aw-003",
    title: "Chromatic Dreams",
    artist: "Yashika",
    price: 5600,
    category: "Abstract",
    style: "Expressionist",
    size: "Extra Large",
    dimensions: "48 × 60 inches",
    year: 2023,
    medium: "Mixed Media on Canvas",
    description: "An explosive symphony of color and texture that challenges perception and invites endless interpretation.",
    story: "Sofia created this during a period of intense personal transformation, using color as therapy and expression.",
    edition: 1,
    editionTotal: 1,
    certificate: true,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
      "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80"
    ],
    colors: ["#e94560", "#533483", "#0f3460"],
    frameColors: ["Black Oak", "White Gold"],
    inStock: true,
    isOriginal: true,
    roomType: ["Living Room", "Lobby", "Office"],
    forSale: false,
    badge: "Private Collection",
    quote: "Every color has a frequency, a heartbeat that aligns with our deepest emotions."
  },
  {
    id: "aw-004",
    title: "Midnight Garden",
    artist: "Yashika",
    price: 1800,
    category: "Floral",
    style: "Contemporary",
    size: "Small",
    dimensions: "18 × 24 inches",
    year: 2024,
    medium: "Oil on Panel",
    description: "A nocturnal botanical study that reveals the secret life of flowers under moonlight, rendered with exquisite detail.",
    story: "Elena's midnight garden series explores the unseen beauty that emerges when the world sleeps.",
    edition: 23,
    editionTotal: 100,
    certificate: true,
    image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800&q=80"
    ],
    colors: ["#2d132c", "#801336", "#c72c41"],
    frameColors: ["Walnut", "Black Oak"],
    inStock: true,
    isOriginal: false,
    roomType: ["Bedroom", "Bathroom"]
  },
  {
    id: "aw-005",
    title: "Urban Geometry",
    artist: "Yashika",
    price: 3400,
    category: "Abstract",
    style: "Minimalist",
    size: "Large",
    dimensions: "36 × 48 inches",
    year: 2024,
    medium: "Acrylic on Canvas",
    description: "Sharp lines and calculated forms intersect to create a meditation on modern urban existence and architectural beauty.",
    story: "Inspired by Tokyo's skyline at dawn, James reduced the city to its essential geometric language.",
    edition: 1,
    editionTotal: 1,
    certificate: true,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"
    ],
    colors: ["#1a1a2e", "#4a4a6a", "#8a8a9a"],
    frameColors: ["Black Oak", "Brushed Steel"],
    inStock: true,
    isOriginal: true,
    roomType: ["Office", "Living Room"]
  },
  {
    id: "aw-006",
    title: "Ocean's Memory",
    artist: "Yashika",
    price: 2200,
    originalPrice: 2600,
    category: "Seascape",
    style: "Impressionist",
    size: "Medium",
    dimensions: "30 × 40 inches",
    year: 2023,
    medium: "Oil on Canvas",
    description: "The ocean remembers everything. This piece captures the eternal dialogue between sea and sky in perpetual motion.",
    story: "Painted from a cliffside studio in Cornwall, where Marcus watched the Atlantic for weeks.",
    edition: 8,
    editionTotal: 30,
    certificate: true,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80"
    ],
    colors: ["#1e3a5f", "#4a7c9b", "#87ceeb"],
    frameColors: ["Natural Oak", "White Gold", "Walnut"],
    inStock: true,
    isOriginal: false,
    roomType: ["Living Room", "Bedroom", "Bathroom"]
  },
  {
    id: "aw-007",
    title: "Whispers of Autumn",
    artist: "Yashika",
    price: 1900,
    category: "Landscape",
    style: "Contemporary",
    size: "Medium",
    dimensions: "24 × 30 inches",
    year: 2024,
    medium: "Oil on Canvas",
    description: "Autumn's fleeting beauty captured in rich amber and crimson tones that seem to glow from within.",
    story: "A walk through the Swedish forests in late October inspired this celebration of seasonal change.",
    edition: 15,
    editionTotal: 75,
    certificate: true,
    image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800&q=80"
    ],
    colors: ["#8b4513", "#d2691e", "#cd853f"],
    frameColors: ["Walnut", "Natural Oak"],
    inStock: true,
    isOriginal: false,
    roomType: ["Living Room", "Dining Room"]
  },
  {
    id: "aw-008",
    title: "Neon Solitude",
    artist: "Yashika",
    price: 4800,
    category: "Abstract",
    style: "Contemporary",
    size: "Large",
    dimensions: "40 × 50 inches",
    year: 2024,
    medium: "Mixed Media on Canvas",
    description: "A striking juxtaposition of neon vibrancy against deep void, exploring isolation in the digital age.",
    story: "Created during a month-long isolation retreat, this piece questions our relationship with artificial light.",
    edition: 1,
    editionTotal: 1,
    certificate: true,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
      "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80"
    ],
    colors: ["#0a0a0a", "#ff006e", "#8338ec"],
    frameColors: ["Black Oak", "Brushed Steel"],
    inStock: true,
    isOriginal: true,
    roomType: ["Office", "Living Room", "Lobby"],
    forSale: false,
    badge: "For Admiration Only",
    quote: "Isolation in the digital age is loud, bright, and completely silent."
  }
];

export const artists = [
  {
    id: "yashika",
    name: "Yashika",
    bio: "A contemporary visual artist creating luminous black and white works with soft tonal color accents, refined texture, and museum-grade composition.",
    image: "",
    awards: ["Solo Exhibition at White Room Gallery", "Selected by Curators Weekly"],
    exhibitions: 18,
    works: 64,
  },
];

export const categories = ["All", "Abstract", "Landscape", "Floral", "Seascape"];
export const styles = ["All", "Contemporary", "Impressionist", "Expressionist", "Minimalist"];
export const sizes = ["All", "Small", "Medium", "Large", "Extra Large"];
export const rooms = ["All", "Living Room", "Bedroom", "Office", "Dining Room", "Bathroom", "Lobby"];
