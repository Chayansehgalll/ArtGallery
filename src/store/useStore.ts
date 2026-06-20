import { create } from "zustand";
import type { Artwork } from "../data/artworks";
import { artworks as sampleArtworks } from "../data/artworks";
import { fetchPaintings } from "../data/paintingApi";

export interface CartItem {
  artwork: Artwork;
  frame: string;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: Artwork[];
  paintings: Artwork[];
  paintingsLoaded: boolean;
  currentView: "home" | "collection" | "view" | "product" | "artist" | "gallery" | "ar" | "checkout" | "wishlist" | "custom-painting";
  selectedArtwork: Artwork | null;
  isCartOpen: boolean;
  isMenuOpen: boolean;
  isLoading: boolean;
  filterCategory: string;
  filterStyle: string;
  filterSize: string;
  filterRoom: string;
  filterPriceRange: [number, number];
  searchQuery: string;
  saleFilter: "All" | "For Sale" | "Exhibition";
  avatarGender: "male" | "female" | null;
  
  loadPaintings: () => Promise<void>;
  addToCart: (artwork: Artwork, frame: string) => void;
  removeFromCart: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  toggleWishlist: (artworkId: string) => void;
  addRecentlyViewed: (artwork: Artwork) => void;
  setCurrentView: (view: StoreState["currentView"]) => void;
  setSelectedArtwork: (artwork: Artwork | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsMenuOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setFilterCategory: (cat: string) => void;
  setFilterStyle: (style: string) => void;
  setFilterSize: (size: string) => void;
  setFilterRoom: (room: string) => void;
  setFilterPriceRange: (range: [number, number]) => void;
  setSearchQuery: (query: string) => void;
  setSaleFilter: (filter: "All" | "For Sale" | "Exhibition") => void;
  setAvatarGender: (gender: "male" | "female" | null) => void;
  clearFilters: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  paintings: sampleArtworks, // Defaults to sample data on initiation
  paintingsLoaded: false,
  currentView: "home",
  selectedArtwork: null,
  isCartOpen: false,
  isMenuOpen: false,
  isLoading: true,
  filterCategory: "All",
  filterStyle: "All",
  filterSize: "All",
  filterRoom: "All",
  filterPriceRange: [0, 500000], // Extracted to encompass custom entry maximums
  searchQuery: "",
  saleFilter: "All",
  avatarGender: null,

  loadPaintings: async () => {
    try {
      const fetched = await fetchPaintings();
      if (fetched && fetched.length > 0) {
        set({ paintings: fetched, paintingsLoaded: true, isLoading: false });
      } else {
        set({ paintings: sampleArtworks, paintingsLoaded: true, isLoading: false });
      }
    } catch (error) {
      console.error("Store cluster dropped network syncing package:", error);
      set({ paintings: sampleArtworks, paintingsLoaded: true, isLoading: false });
    }
  },

  addToCart: (artwork, frame) => {
    set((state) => {
      const existing = state.cart.find(
        (item) => item.artwork.id === artwork.id && item.frame === frame
      );
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.artwork.id === artwork.id && item.frame === frame
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { artwork, frame, quantity: 1 }] };
    });
  },

  removeFromCart: (artworkId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.artwork.id !== artworkId),
    }));
  },

  updateQuantity: (artworkId, quantity) => {
    set((state) => ({
      cart: quantity <= 0
        ? state.cart.filter((item) => item.artwork.id !== artworkId)
        : state.cart.map((item) =>
            item.artwork.id === artworkId ? { ...item, quantity } : item
          ),
    }));
  },

  toggleWishlist: (artworkId) => {
    set((state) => ({
      wishlist: state.wishlist.includes(artworkId)
        ? state.wishlist.filter((id) => id !== artworkId)
        : [...state.wishlist, artworkId],
    }));
  },

  addRecentlyViewed: (artwork) => {
    set((state) => ({
      recentlyViewed: [
        artwork,
        ...state.recentlyViewed.filter((a) => a.id !== artwork.id),
      ].slice(0, 8),
    }));
  },

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedArtwork: (artwork) => set({ selectedArtwork: artwork }),
  setIsCartOpen: (open) => set({ isCartOpen: open }),
  setIsMenuOpen: (open) => set({ isMenuOpen: open }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setFilterCategory: (cat) => set({ filterCategory: cat }),
  setFilterStyle: (style) => set({ filterStyle: style }),
  setFilterSize: (size) => set({ filterSize: size }),
  setFilterRoom: (room) => set({ filterRoom: room }),
  setFilterPriceRange: (range) => set({ filterPriceRange: range }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSaleFilter: (filter) => set({ saleFilter: filter }),
  setAvatarGender: (gender) => set({ avatarGender: gender }),

  clearFilters: () =>
    set({
      filterCategory: "All",
      filterStyle: "All",
      filterSize: "All",
      filterRoom: "All",
      filterPriceRange: [0, 500000],
      searchQuery: "",
      saleFilter: "All",
    }),

  getCartTotal: () => {
    return get().cart.reduce(
      (total, item) => total + Number(item.artwork.price) * item.quantity,
      0
    );
  },

  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
}));