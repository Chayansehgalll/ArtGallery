import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Heart, Search, Menu, X } from "lucide-react";
import { useStore } from "../store/useStore";
import gsap from "gsap";

export default function Navigation() {
  const {
    isCartOpen,
    setIsCartOpen,
    isMenuOpen,
    setIsMenuOpen,
    getCartCount,
    wishlist,
    currentView,
    setCurrentView,
    setSelectedArtwork,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuRef.current) {
      gsap.to(menuRef.current, {
        y: isMenuOpen ? 0 : "-100%",
        duration: 0.8,
        ease: "power4.inOut",
      });
    }
  }, [isMenuOpen]);

  const navItems = [
    { label: "Home", view: "home" as const },
    { label: "Collection", view: "collection" as const },
    { label: "Gallery", view: "gallery" as const },
    { label: "Artist", view: "artist" as const },
  ];

  const handleNav = (view: typeof currentView) => {
    setCurrentView(view);
    setIsMenuOpen(false);
    if (view === "home") setSelectedArtwork(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => handleNav("home")}
              className="flex items-center gap-3 group"
              data-cursor-text="Home"
            >
              <div className="w-8 h-8 border border-white/40 flex items-center justify-center group-hover:border-white transition-colors duration-300">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="text-white text-sm tracking-[0.3em] uppercase font-light hidden sm:block">
                Yashika's
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-12">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNav(item.view)}
                  className={`text-xs tracking-[0.2em] uppercase transition-colors duration-300 ${
                    currentView === item.view
                      ? "text-white"
                      : "text-white/40 hover:text-white"
                  }`}
                  data-cursor-text={item.label}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5">
              <button
                className="text-white/40 hover:text-white transition-colors"
                data-cursor-text="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button
                className="text-white/40 hover:text-white transition-colors relative"
                data-cursor-text="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white text-black text-[8px] rounded-full flex items-center justify-center font-medium">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="text-white/40 hover:text-white transition-colors relative"
                data-cursor-text="Cart"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white text-black text-[8px] rounded-full flex items-center justify-center font-medium">
                    {getCartCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white/40 hover:text-white transition-colors md:hidden"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
        style={{ transform: "translateY(-100%)" }}
      >
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => handleNav(item.view)}
            className="text-white text-2xl tracking-[0.3em] uppercase font-light"
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => handleNav("home")}
          className="text-white/40 text-lg tracking-[0.2em] uppercase mt-8"
        >
          Home
        </button>
      </div>
    </>
  );
}
