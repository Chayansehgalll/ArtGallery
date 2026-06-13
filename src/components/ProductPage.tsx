import { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../store/useStore";
import {
  usePaintings,
  selectRelated,
  coverOf,
  mainOf,
} from "../services/paintings";
import { resolveDimensions } from "../utils/frame";
import {
  ArrowLeft,
  Heart,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  Check,
  Truck,
  Shield,
  Award,
  ChevronRight,
  Minus,
  Plus,
  X,
} from "lucide-react";
import gsap from "gsap";

function Painting3D({
  imageUrl,
  frameColor,
  width,
  height,
}: {
  imageUrl: string;
  frameColor: string;
  width: number;
  height: number;
}) {
  const meshRef = useRef<THREE.Group>(null);

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageUrl]);

  // Build geometry from real proportions, normalized so the longest side ≈ 3 units
  const { canvasW, canvasH, frameW, frameH } = useMemo(() => {
    const ar = width / height;
    const longest = 3;
    const cw = ar >= 1 ? longest : longest * ar;
    const ch = ar >= 1 ? longest / ar : longest;
    return { canvasW: cw, canvasH: ch, frameW: cw + 0.2, frameH: ch + 0.2 };
  }, [width, height]);

  const frameColors: Record<string, string> = {
    "Black Oak": "#1a1a1a",
    Walnut: "#5c3a1e",
    "White Gold": "#f5f5dc",
    "Natural Oak": "#c4a77d",
    Brass: "#b5a642",
    "Brushed Steel": "#8a8a8a",
  };

  return (
    <group ref={meshRef}>
      {/* Frame */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[frameW, frameH, 0.12]} />
        <meshStandardMaterial
          color={frameColors[frameColor] || "#1a1a1a"}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      {/* Canvas — exact aspect ratio, never stretched */}
      <mesh>
        <planeGeometry args={[canvasW, canvasH]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
      {/* Backing */}
      <mesh position={[0, 0, -0.12]}>
        <planeGeometry args={[frameW, frameH]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

export default function ProductPage() {
  const {
    selectedArtwork,
    setCurrentView,
    setSelectedArtwork,
    addToCart,
    toggleWishlist,
    wishlist,
    addRecentlyViewed,
  } = useStore();

  const [selectedFrame, setSelectedFrame] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAR, setShowAR] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { paintings } = usePaintings();
  const artwork = selectedArtwork || paintings[0];
  const dims = resolveDimensions(
    artwork?.width,
    artwork?.height,
    artwork?.dimensions,
  );

  // Full-resolution main image first, then any extra gallery images (deduped).
  const viewImages = (() => {
    if (!artwork) return [] as string[];
    const main = mainOf(artwork);
    const extras = (artwork.images || []).filter((u) => u && u !== main);
    return [main, ...extras].filter(Boolean);
  })();

  useEffect(() => {
    if (artwork) {
      addRecentlyViewed(artwork);
      setSelectedFrame(artwork.frameColors[0]);
    }
  }, [artwork, addRecentlyViewed]);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
      );
    }
  }, []);

  const handleAddToCart = () => {
    addToCart(artwork, selectedFrame);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const relatedArtworks = artwork ? selectRelated(paintings, artwork, 4) : [];

  return (
    <div ref={pageRef} className="min-h-screen bg-black pt-24 pb-24">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-8">
        <button
          onClick={() => {
            setCurrentView("collection");
            setSelectedArtwork(null);
          }}
          className="flex items-center gap-2 text-white/30 hover:text-white text-xs tracking-[0.15em] uppercase transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Collection
        </button>
      </div>

      {/* Main Product */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Section */}
          <div className="space-y-4">
            <div
              ref={imageRef}
              className="relative bg-white/5 overflow-hidden group"
              style={{ aspectRatio: `${dims.width} / ${dims.height}` }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={viewImages[selectedImage] || mainOf(artwork)}
                  alt={artwork.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                  style={{ transform: `scale(${zoom})` }}
                />
              </AnimatePresence>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                  className="w-10 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                  className="w-10 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="w-10 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Original Badge */}
              {artwork.isOriginal && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-white text-black">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-medium">
                    Original Artwork
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {viewImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 overflow-hidden border transition-all ${
                    selectedImage === i
                      ? "border-white"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${artwork.title} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* 3D Viewer Toggle */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-4">
                3D Viewer
              </p>
              <div className="h-80 bg-white/5">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <Suspense fallback={null}>
                    <Painting3D
                      imageUrl={mainOf(artwork)}
                      frameColor={selectedFrame}
                      width={dims.width}
                      height={dims.height}
                    />
                    <OrbitControls
                      enablePan={false}
                      minDistance={3}
                      maxDistance={8}
                      autoRotate
                      autoRotateSpeed={1}
                    />
                    <Environment preset="studio" />
                    <ContactShadows
                      position={[0, -2, 0]}
                      opacity={0.4}
                      scale={10}
                    />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[5, 5, 5]} intensity={1} castShadow />
                  </Suspense>
                </Canvas>
              </div>
              <p className="text-white/20 text-[10px] text-center mt-2">
                Drag to rotate • Scroll to zoom
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:sticky lg:top-32 lg:self-start space-y-8">
            {/* Artist & Title */}
            <div>
              <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-2">
                {artwork.artist}
              </p>
              <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-4">
                {artwork.title}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-white text-2xl font-light">
                  ₹{artwork.price.toLocaleString()}
                </span>
                {artwork.originalPrice && (
                  <span className="text-white/30 line-through text-lg">
                    ₹{artwork.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-white/50 text-sm leading-relaxed">
              {artwork.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
              <div>
                <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1">
                  Dimensions
                </p>
                <p className="text-white text-sm">{artwork.dimensions}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1">
                  Medium
                </p>
                <p className="text-white text-sm">{artwork.medium}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1">
                  Year
                </p>
                <p className="text-white text-sm">{artwork.year}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-1">
                  Category
                </p>
                <p className="text-white text-sm">{artwork.category}</p>
              </div>
            </div>

            {/* Edition Info */}
            {artwork.editionTotal > 1 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10">
                <Award size={16} className="text-white/40" />
                <div>
                  <p className="text-white text-xs">
                    Limited Edition {artwork.edition} of {artwork.editionTotal}
                  </p>
                  <p className="text-white/30 text-[10px]">
                    Each print is numbered and hand-signed
                  </p>
                </div>
              </div>
            )}

            {/* Frame Selector */}
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3">
                Frame Style
              </p>
              <div className="flex gap-3">
                {artwork.frameColors.map((frame) => (
                  <button
                    key={frame}
                    onClick={() => setSelectedFrame(frame)}
                    className={`px-4 py-3 border text-xs tracking-wider transition-all ${
                      selectedFrame === frame
                        ? "border-white bg-white text-black"
                        : "border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {frame}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3">
                Quantity
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60 hover:border-white/30 hover:text-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white text-sm w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60 hover:border-white/30 hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={16} />
                    Added to Cart
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAR(true)}
                  className="flex-1 py-4 border border-white/20 text-white text-xs tracking-[0.2em] uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera size={14} />
                  See on Your Wall
                </button>
                <button
                  onClick={() => toggleWishlist(artwork.id)}
                  className="w-14 h-14 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors"
                >
                  <Heart
                    size={18}
                    fill={wishlist.includes(artwork.id) ? "white" : "none"}
                  />
                </button>
                <button className="w-14 h-14 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
              <div className="text-center">
                <Truck size={18} className="mx-auto mb-2 text-white/30" />
                <p className="text-white/40 text-[9px] tracking-wider uppercase">
                  Free Shipping
                </p>
              </div>
              <div className="text-center">
                <Shield size={18} className="mx-auto mb-2 text-white/30" />
                <p className="text-white/40 text-[9px] tracking-wider uppercase">
                  Insured Delivery
                </p>
              </div>
              <div className="text-center">
                <Award size={18} className="mx-auto mb-2 text-white/30" />
                <p className="text-white/40 text-[9px] tracking-wider uppercase">
                  Certificate
                </p>
              </div>
            </div>

            {/* Artist Story */}
            <div className="pt-8 border-t border-white/5">
              <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-4">
                The Story
              </p>
              <p className="text-white/50 text-sm leading-relaxed italic">
                "{artwork.story}"
              </p>
            </div>
          </div>
        </div>

        {/* Related Artworks */}
        {relatedArtworks.length > 0 && (
          <div className="mt-24 pt-16 border-t border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white text-xl font-light tracking-tight">
                You May Also Like
              </h3>
              <button
                onClick={() => setCurrentView("collection")}
                className="text-white/40 hover:text-white text-xs tracking-[0.15em] uppercase flex items-center gap-2 transition-colors"
              >
                View All
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedArtworks.slice(0, 4).map((art) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedArtwork(art)}
                  className="group text-left"
                >
                  <div
                    className="bg-white/5 overflow-hidden mb-3"
                    style={{
                      aspectRatio: (() => {
                        const d = resolveDimensions(
                          art.width,
                          art.height,
                          art.dimensions,
                        );
                        return `${d.width} / ${d.height}`;
                      })(),
                    }}
                  >
                    <img
                      src={coverOf(art)}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-white/40 text-[10px] tracking-wider uppercase mb-1">
                    {art.artist}
                  </p>
                  <p className="text-white text-sm font-light">{art.title}</p>
                  <p className="text-white/60 text-xs mt-1">
                    ₹{art.price.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AR Modal */}
      <AnimatePresence>
        {showAR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-6"
          >
            <button
              onClick={() => setShowAR(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="text-center max-w-md">
              <Camera size={48} className="mx-auto mb-6 text-white/20" />
              <h3 className="text-white text-2xl font-light mb-4">
                View in Your Space
              </h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                Use your device's camera to see how this artwork would look on
                your wall. Our AR technology automatically detects walls and
                scales the artwork to real-world dimensions.
              </p>
              <div className="space-y-3">
                <button className="w-full py-4 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium">
                  Start AR Experience
                </button>
                <p className="text-white/20 text-[10px]">
                  Requires camera access. Works best on mobile devices with AR
                  support.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-white/30 text-[10px] tracking-wider uppercase mb-4">
                  Artwork Dimensions
                </p>
                <p className="text-white text-lg">{artwork.dimensions}</p>
                <p className="text-white/40 text-xs mt-1">
                  Will be scaled to real-world size
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
