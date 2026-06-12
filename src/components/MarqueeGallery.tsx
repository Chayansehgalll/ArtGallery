import { useRef, useEffect } from "react";
import { type Artwork } from "../data/artworks";
import { usePaintings, coverOf } from "../services/paintings";
import { useStore } from "../store/useStore";
import gsap from "gsap";

export default function MarqueeGallery() {
  const { setCurrentView, setSelectedArtwork } = useStore();
  const { paintings: artworks } = usePaintings();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee1 = marqueeRef.current;
    const marquee2 = marqueeRef2.current;
    if (!marquee1 || !marquee2) return;

    const tl1 = gsap.to(marquee1, {
      xPercent: -50,
      duration: 40,
      ease: "none",
      repeat: -1,
    });

    const tl2 = gsap.to(marquee2, {
      xPercent: 50,
      duration: 50,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tl1.kill();
      tl2.kill();
    };
  }, []);

  const handleClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setCurrentView("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const doubledArtworks = [...artworks, ...artworks, ...artworks, ...artworks];

  return (
    <section className="py-24 bg-black overflow-hidden">
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-12">
        <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-4">
          Featured Works
        </p>
        <h2 className="text-white text-3xl md:text-4xl font-light tracking-tight">
          Infinite Gallery
        </h2>
      </div>

      {/* Marquee Row 1 */}
      <div className="relative mb-4">
        <div ref={marqueeRef} className="flex gap-4 whitespace-nowrap">
          {doubledArtworks.map((artwork, i) => (
            <button
              key={`row1-${i}`}
              onClick={() => handleClick(artwork)}
              className="flex-shrink-0 group relative"
            >
              <div className="w-64 h-80 overflow-hidden bg-white/5">
                <img
                  src={coverOf(artwork)}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs">{artwork.title}</p>
                <p className="text-white/60 text-[10px]">{artwork.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 */}
      <div className="relative">
        <div
          ref={marqueeRef2}
          className="flex gap-4 whitespace-nowrap"
          style={{ transform: "translateX(-50%)" }}
        >
          {[...doubledArtworks].reverse().map((artwork, i) => (
            <button
              key={`row2-${i}`}
              onClick={() => handleClick(artwork)}
              className="flex-shrink-0 group relative"
            >
              <div className="w-52 h-64 overflow-hidden bg-white/5">
                <img
                  src={coverOf(artwork)}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs">{artwork.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
