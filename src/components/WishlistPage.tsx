import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";
import { usePaintings, coverOf } from "../services/paintings";
import { Trash2, ShoppingBag, Eye, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const {
    wishlist,
    toggleWishlist,
    setCurrentView,
    setSelectedArtwork,
    addToCart, // Assumes standard useStore hook interface for Cart interactions
  } = useStore();

  const { paintings: artworks } = usePaintings();

  // Cross-reference saved IDs against real-time validated database entities
  const savedArtworks = useMemo(() => {
    return artworks.filter((art) => wishlist.includes(art.id));
  }, [artworks, wishlist]);

  const handleViewDetails = (artwork: any) => {
    setSelectedArtwork(artwork);
    setCurrentView("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (e: React.MouseEvent, artwork: any) => {
    e.stopPropagation();
    if (typeof addToCart === "function") {
      addToCart(artwork);
    }
  };

  return (
    <section className="min-h-screen bg-black pt-32 pb-24 px-6 md:px-12 text-white">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Navigation Row */}
        <div className="mb-12 flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <button
              onClick={() => setCurrentView("collection")}
              className="text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase flex items-center gap-2 transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Back to Collection
            </button>
            <h1 className="text-3xl md:text-5xl font-light tracking-tight">Your Wishlist</h1>
          </div>
          <div className="text-white/30 text-xs font-mono tracking-widest uppercase">
            {savedArtworks.length} Item{savedArtworks.length !== 1 ? "s" : ""} Saved
          </div>
        </div>

        {/* Empty State Layout */}
        <AnimatePresence mode="wait">
          {savedArtworks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 border border-white/5 bg-white/[0.01] max-w-2xl mx-auto px-6"
            >
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                Your wishlist is empty. Start exploring the collection and save your favorite artworks.
              </p>
              <button
                onClick={() => setCurrentView("collection")}
                className="px-6 py-3.5 bg-white text-black text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-white/90 transition-colors"
              >
                Browse Collection
              </button>
            </motion.div>
          ) : (
            /* Items Grid Container */
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {savedArtworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="group border border-white/5 bg-white/[0.02] flex flex-col justify-between"
                >
                  {/* Aspect Locked Media Card */}
                  <div className="relative overflow-hidden aspect-[3/4] bg-white/5">
                    <img
                      src={coverOf(artwork)}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                    
                    {/* Action Float Overlays */}
                    <button
                      onClick={() => toggleWishlist(artwork.id)}
                      className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className={`px-2.5 py-1 text-[8px] font-medium tracking-widest uppercase border rounded-full ${
                        artwork.forSale === false 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}>
                        {artwork.forSale === false ? "Exhibition Only" : "For Sale"}
                      </span>
                    </div>
                  </div>

                  {/* Information Details Panel */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1 mb-6">
                      <p className="text-white/40 text-[9px] tracking-[0.2em] uppercase font-medium">
                        {artwork.category} • {artwork.style}
                      </p>
                      <h3 className="text-white text-lg font-light truncate">{artwork.title}</h3>
                      <p className="text-white/60 text-xs font-light italic">{artwork.artist || "Yashika"}</p>
                      <p className="text-white/30 text-[10px] font-mono pt-1">{artwork.dimensions}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                      <span className="text-white font-mono text-base">
                        {artwork.forSale !== false ? `₹${Number(artwork.price).toLocaleString("en-IN")}` : "N/A"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(artwork)}
                          className="w-9 h-9 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                          title="View Artwork Details"
                        >
                          <Eye size={14} />
                        </button>
                        
                        {artwork.forSale !== false && (
                          <button
                            onClick={(e) => handleAddToCart(e, artwork)}
                            className="h-9 px-3 border border-white bg-white text-black text-[10px] tracking-wider uppercase font-medium flex items-center gap-2 hover:bg-white/90 transition-colors"
                          >
                            <ShoppingBag size={12} />
                            Add To Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}