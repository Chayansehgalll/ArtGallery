import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categories, styles, sizes, rooms, type Artwork } from "../data/artworks";
import { usePaintings, coverOf } from "../services/paintings";
import { resolveDimensions } from "../utils/frame";
import { useStore } from "../store/useStore";
import {
  Search,
  SlidersHorizontal,
  X,
  Heart,
  ArrowUpRight,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Collection() {
  const {
    setCurrentView,
    setSelectedArtwork,
    toggleWishlist,
    wishlist,
    filterCategory,
    setFilterCategory,
    filterStyle,
    setFilterStyle,
    filterSize,
    setFilterSize,
    filterRoom,
    setFilterRoom,
    filterPriceRange,
    setFilterPriceRange,
    searchQuery,
    setSearchQuery,
    clearFilters,
  } = useStore();

  const { paintings: artworks } = usePaintings();

  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [spotlightId, setSpotlightId] = useState<string>("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const { saleFilter, setSaleFilter } = useStore();
  
  const filteredArtworks = useMemo(() => {
    return artworks.filter((art) => {
      if (saleFilter === "For Sale" && art.forSale === false) return false;
      if (saleFilter === "Exhibition" && art.forSale !== false) return false;
      if (filterCategory !== "All" && art.category !== filterCategory) return false;
      if (filterStyle !== "All" && art.style !== filterStyle) return false;
      if (filterSize !== "All" && art.size !== filterSize) return false;
      if (filterRoom !== "All" && !art.roomType.includes(filterRoom)) return false;
      if (art.price < filterPriceRange[0] || art.price > filterPriceRange[1]) return false;
      if (
        searchQuery &&
        !art.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !art.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    artworks,
    filterCategory,
    filterStyle,
    filterSize,
    filterRoom,
    filterPriceRange,
    searchQuery,
    saleFilter,
  ]);

  const exhibitionArtworks = useMemo(() => {
    return artworks.filter((a) => a.forSale === false);
  }, [artworks]);

  const spotlightArtwork =
    filteredArtworks.find((art) => art.id === spotlightId) ??
    filteredArtworks[0] ??
    artworks[0];

  useEffect(() => {
    if (filteredArtworks.length === 0) return;
    if (!filteredArtworks.some((art) => art.id === spotlightId)) {
      setSpotlightId(filteredArtworks[0].id);
    }
  }, [filteredArtworks, spotlightId]);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  const handleProductClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setCurrentView("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCompare = (artwork: Artwork) => {
    setCompareIds((current) => {
      if (current.includes(artwork.id)) {
        return current.filter((id) => id !== artwork.id);
      }
      if (current.length >= 2) {
        return [current[1], artwork.id];
      }
      return [...current, artwork.id];
    });
  };

  const FilterChip = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[10px] tracking-[0.15em] uppercase border transition-all duration-300 ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/70"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="min-h-screen bg-black pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-16">
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-4">
            Browse Collection
          </p>
          <h2 className="text-white text-4xl md:text-6xl font-light tracking-tight mb-6">
            The Collection
          </h2>
          <p className="text-white/40 text-sm max-w-lg leading-relaxed">
            Each piece in our curated collection has been hand-selected for its
            artistic merit, emotional depth, and transformative presence.
          </p>
        </div>

        {/* Spotlight */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch">
          <div className="relative overflow-hidden border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%),linear-gradient(135deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] min-h-[420px]">
            <img
              src={coverOf(spotlightArtwork)}
              alt={spotlightArtwork.title}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-lighten"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10 max-w-xl">
              <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-3">
                Curator's Spotlight
              </p>
              <h3 className="text-white text-3xl md:text-5xl font-light tracking-tight mb-4">
                {spotlightArtwork.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                {spotlightArtwork.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-white/35 text-[10px] tracking-[0.2em] uppercase mb-8">
                <span>{spotlightArtwork.artist}</span>
                <span>•</span>
                <span>{spotlightArtwork.dimensions}</span>
                <span>•</span>
                <span>{spotlightArtwork.medium}</span>
              </div>
              <div className="flex flex-wrap gap-3 pointer-events-auto">
                <button
                  onClick={() => handleProductClick(spotlightArtwork)}
                  className="px-5 py-3 bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors"
                >
                  View Piece
                </button>
                <button
                  onClick={() => toggleCompare(spotlightArtwork)}
                  className="px-5 py-3 border border-white/15 text-white text-[10px] tracking-[0.2em] uppercase hover:border-white/40 transition-colors"
                >
                  {compareIds.includes(spotlightArtwork.id)
                    ? "Remove Compare"
                    : "Compare"}
                </button>
                <button
                  onClick={() => toggleWishlist(spotlightArtwork.id)}
                  className="px-5 py-3 border border-white/15 text-white/70 text-[10px] tracking-[0.2em] uppercase hover:border-white/40 transition-colors"
                >
                  Wishlist
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-white/5 p-6 bg-white/[0.03]">
              <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-3">
                Quick Selection
              </p>
              <div className="space-y-3">
                {filteredArtworks.slice(0, 4).map((artwork) => (
                  <button
                    key={artwork.id}
                    onClick={() => setSpotlightId(artwork.id)}
                    className={`w-full text-left flex items-center gap-4 p-3 border transition-colors ${
                      spotlightArtwork.id === artwork.id
                        ? "border-white/30 bg-white/5"
                        : "border-white/5 hover:border-white/15 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="w-14 h-20 overflow-hidden bg-white/5 flex-shrink-0">
                      <img
                        src={coverOf(artwork)}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-light truncate">
                        {artwork.title}
                      </p>
                      <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mt-1">
                        {artwork.artist} • {artwork.dimensions}
                      </p>
                    </div>
                    <span className="text-white/40 text-xs">
                      ${artwork.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setGridCols(2)}
                className="border border-white/5 p-4 text-left hover:border-white/20 transition-colors"
              >
                <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
                  Spacious View
                </p>
                <p className="text-white text-sm font-light">
                  Larger tiles for slower browsing.
                </p>
              </button>
              <button
                onClick={() => setGridCols(3)}
                className="border border-white/5 p-4 text-left hover:border-white/20 transition-colors"
              >
                <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
                  Dense View
                </p>
                <p className="text-white text-sm font-light">
                  More works visible at a glance.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Curated Exhibition Section (Shows when All or Exhibition is selected) */}
        <AnimatePresence>
          {(saleFilter === "All" || saleFilter === "Exhibition") && exhibitionArtworks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              className="mb-24"
            >
              <div className="flex items-center gap-4 mb-10">
                <h3 className="text-white text-2xl font-light tracking-tight">Curated Exhibition</h3>
                <div className="h-px bg-white/10 flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exhibitionArtworks.map((art) => (
                  <div key={art.id} onClick={() => handleProductClick(art)} className="group cursor-pointer">
                    <div className="relative aspect-[4/5] bg-white/5 overflow-hidden mb-6">
                      <img src={coverOf(art)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10">
                        <span className="text-white/90 text-[9px] tracking-[0.2em] uppercase">{art.badge}</span>
                      </div>
                    </div>
                    <div className="px-2">
                      <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-2">{art.year} • {art.medium}</p>
                      <h4 className="text-white text-xl font-light mb-4">{art.title}</h4>
                      {art.quote && (
                        <blockquote className="text-white/60 text-sm italic leading-relaxed border-l border-white/20 pl-4 py-1">
                          "{art.quote}"
                        </blockquote>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 pb-8 border-b border-white/5">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-xs pl-10 pr-4 py-3 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
              />
            </div>
            <div className="flex items-center p-1 bg-white/5 border border-white/10">
              {(["All", "For Sale", "Exhibition"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSaleFilter(filter)}
                  className={`px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors ${
                    saleFilter === filter ? "bg-white text-black font-medium" : "text-white/40 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-[0.15em] uppercase transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
            <div className="flex items-center gap-1 border border-white/10">
              <button
                onClick={() => setGridCols(2)}
                className={`p-2 transition-colors ${
                  gridCols === 2 ? "text-white" : "text-white/20"
                }`}
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 transition-colors ${
                  gridCols === 3 ? "text-white" : "text-white/20"
                }`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
              className="overflow-hidden mb-12"
            >
              <div className="pb-8 border-b border-white/5 space-y-6">
                {/* Category */}
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <FilterChip
                        key={cat}
                        label={cat}
                        active={filterCategory === cat}
                        onClick={() => setFilterCategory(cat)}
                      />
                    ))}
                  </div>
                </div>
                {/* Style */}
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3">
                    Style
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((s) => (
                      <FilterChip
                        key={s}
                        label={s}
                        active={filterStyle === s}
                        onClick={() => setFilterStyle(s)}
                      />
                    ))}
                  </div>
                </div>
                {/* Size */}
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <FilterChip
                        key={s}
                        label={s}
                        active={filterSize === s}
                        onClick={() => setFilterSize(s)}
                      />
                    ))}
                  </div>
                </div>
                {/* Room */}
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3">
                    Room
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rooms.map((r) => (
                      <FilterChip
                        key={r}
                        label={r}
                        active={filterRoom === r}
                        onClick={() => setFilterRoom(r)}
                      />
                    ))}
                  </div>
                </div>
                {/* Price */}
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3">
                    Price Range: ${filterPriceRange[0]} - ${filterPriceRange[1]}
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filterPriceRange[1]}
                    onChange={(e) =>
                      setFilterPriceRange([0, parseInt(e.target.value)])
                    }
                    className="w-full md:w-80 accent-white"
                  />
                </div>
                <button
                  onClick={clearFilters}
                  className="text-white/30 hover:text-white text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 transition-colors"
                >
                  <X size={12} />
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="mb-8 text-white/30 text-[10px] tracking-[0.2em] uppercase">
          Showing {filteredArtworks.length} artwork
          {filteredArtworks.length !== 1 ? "s" : ""}
        </div>

        {/* Masonry Grid */}
        <div
          ref={gridRef}
          className={`grid gap-6 ${
            gridCols === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {filteredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.05,
                  ease: [0.76, 0, 0.24, 1],
                }}
                className="group relative cursor-pointer self-start"
                onMouseEnter={() => setHoveredId(artwork.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleProductClick(artwork)}
              >
                <div
                  className="relative overflow-hidden bg-white/5"
                  style={{
                    aspectRatio: (() => {
                      const d = resolveDimensions(artwork.width, artwork.height, artwork.dimensions);
                      return `${d.width} / ${d.height}`;
                    })(),
                  }}
                >
                  <img
                    src={coverOf(artwork)}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500" />
                  
                  {/* Hover Info */}
                  <AnimatePresence>
                    {hoveredId === artwork.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex flex-col justify-end p-6"
                      >
                        <div className="space-y-2">
                          <p className="text-white/60 text-[10px] tracking-[0.2em] uppercase">
                            {artwork.artist}
                          </p>
                          <h3 className="text-white text-lg font-light">
                            {artwork.title}
                          </h3>
                          {artwork.forSale !== false && (
                            <p className="text-white/80 text-sm">
                              ${artwork.price.toLocaleString()}
                            </p>
                          )}
                          <div className="flex items-center gap-3 pt-2">
                            <span className="text-white/40 text-[10px] tracking-wider uppercase">
                              {artwork.dimensions}
                            </span>
                            <span className="text-white/20">|</span>
                            <span className="text-white/40 text-[10px] tracking-wider uppercase">
                              {artwork.medium}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(artwork);
                            }}
                            className="text-white text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 hover:gap-3 transition-all"
                          >
                            View Details
                            <ArrowUpRight size={12} />
                          </button>
                          
                          {artwork.forSale !== false && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompare(artwork);
                                  setSpotlightId(artwork.id);
                                }}
                                className={`text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 transition-all ${
                                  compareIds.includes(artwork.id)
                                    ? "text-white"
                                    : "text-white/40 hover:text-white"
                                }`}
                              >
                                {compareIds.includes(artwork.id) ? "In Compare" : "Compare"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(artwork.id);
                                }}
                                className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                              >
                                <Heart size={12} fill={wishlist.includes(artwork.id) ? "white" : "none"} />
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Badge */}
                  {artwork.forSale === false ? (
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10">
                      <span className="text-white/90 text-[9px] tracking-[0.2em] uppercase">
                        {artwork.badge || "Exhibition Only"}
                      </span>
                    </div>
                  ) : (
                    <>
                      {artwork.isOriginal && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/10">
                          <span className="text-white text-[9px] tracking-[0.2em] uppercase">
                            Original
                          </span>
                        </div>
                      )}
                      {artwork.originalPrice && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-white text-black">
                          <span className="text-[9px] tracking-[0.2em] uppercase font-medium">
                            Sale
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredArtworks.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/30 text-sm tracking-wider">
              No artworks match your criteria
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-white text-xs tracking-[0.2em] uppercase underline underline-offset-4"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Compare Tray */}
        <AnimatePresence>
          {compareIds.length > 0 && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl pointer-events-auto"
            >
              <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
                    Compare Mode
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {compareIds.map((id) => {
                      const art = artworks.find((item) => item.id === id);
                      if (!art) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => setSpotlightId(id)}
                          className="flex items-center gap-3 border border-white/10 px-3 py-2 text-left hover:border-white/30 transition-colors"
                        >
                          <img
                            src={coverOf(art)}
                            alt={art.title}
                            className="w-10 h-12 object-cover"
                          />
                          <div>
                            <p className="text-white text-xs">{art.title}</p>
                            <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">
                              {art.dimensions}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCompareIds([])}
                    className="px-4 py-3 text-white/40 text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:text-white hover:border-white/30 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      const first = artworks.find((item) => item.id === compareIds[0]);
                      if (first) handleProductClick(first);
                    }}
                    className="px-4 py-3 bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors"
                  >
                    Focus Piece
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
