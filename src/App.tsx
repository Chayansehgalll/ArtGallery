import { useEffect, useState, useCallback, useRef } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { useStore } from "./store/useStore";
import LoadingScreen from "./components/LoadingScreen";
import CustomCursor from "./components/CustomCursor";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import FeaturedSection from "./components/FeaturedSection";
import MarqueeGallery from "./components/MarqueeGallery";
import Testimonials from "./components/Testimonials";
import Collection from "./components/Collection";
import ProductPage from "./components/ProductPage";
import ArtistSection from "./components/ArtistSection";
import GalleryExperience from "./components/GalleryExperience";
import CheckoutPage from "./components/CheckoutPage";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import AdminApp from "./admin/AdminApp";

/* ── Route <-> view mapping ─────────────────────────────── */
type View = "home" | "collection" | "product" | "artist" | "gallery" | "ar" | "checkout";

const VIEW_TO_PATH: Record<View, string> = {
  home: "/",
  collection: "/collection",
  product: "/product",
  artist: "/artists",
  gallery: "/gallery",
  checkout: "/checkout",
  ar: "/product",
};

function pathToView(path: string): View {
  if (path.startsWith("/collection")) return "collection";
  if (path.startsWith("/product")) return "product";
  if (path.startsWith("/artists")) return "artist";
  if (path.startsWith("/gallery")) return "gallery";
  if (path.startsWith("/checkout")) return "checkout";
  return "home";
}

/* ── Keeps zustand currentView and the URL in sync ──────── */
function RouterSync() {
  const { currentView, setCurrentView } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const syncing = useRef(false);

  // URL changed (back/forward, direct link) -> update view
  useEffect(() => {
    const view = pathToView(location.pathname);
    if (view !== currentView) {
      syncing.current = true;
      setCurrentView(view);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // View changed via setCurrentView (buttons everywhere) -> navigate
  useEffect(() => {
    if (syncing.current) {
      syncing.current = false;
      return;
    }
    const targetPath = VIEW_TO_PATH[currentView] || "/";
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  return null;
}

/* ── Page wrapper with fade transition ──────────────────── */
function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HomeView() {
  return (
    <Page>
      <Hero />
      <FeaturedSection />
      <MarqueeGallery />
      <Testimonials />
    </Page>
  );
}

export default function App() {
  const { isLoading, setIsLoading, loadPaintings } = useStore();
  const location = useLocation();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  const isAdmin = location.pathname.startsWith("/admin");

  // Load paintings from backend (falls back to samples if offline)
  useEffect(() => {
    loadPaintings();
  }, [loadPaintings]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  useEffect(() => {
    if (isAdmin) return; // No smooth-scroll/3D chrome inside admin
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(lenisInstance);

    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
    };
  }, [isAdmin]);

  // Scroll to top on route change
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
  }, [location.pathname, lenis]);

  const isGallery = location.pathname.startsWith("/gallery");

  // Admin panel is fully standalone — no site nav, footer, cursor, or loader
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <RouterSync />
      <CustomCursor />
      <Navigation />
      <CartDrawer />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeView />} />
          <Route path="/collection" element={<Page><Collection /></Page>} />
          <Route path="/product" element={<Page><ProductPage /></Page>} />
          <Route path="/artists" element={<Page><ArtistSection /></Page>} />
          <Route path="/gallery" element={<Page className="h-screen"><GalleryExperience /></Page>} />
          <Route path="/checkout" element={<Page><CheckoutPage /></Page>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {!isGallery && <Footer />}
    </div>
  );
}
