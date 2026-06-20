import { useStore } from "../store/useStore";
import { Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navigation() {
  const { currentView, setCurrentView, wishlist, cart, setIsCartOpen } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate distinct items count or sum total quantities depending on store schema
  const totalCartItems = cart?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

  const navLinks = [
    { name: "Home", view: "home" as const },
    { name: "Collection", view: "collection" as const },
    { name: "3D Gallery", view: "gallery" as const },
    { name: "Custom Painting", view: "custom-painting" as const },
    { name: "The Artist", view: "artist" as const },
  ];

  const handleNavClick = (view: typeof navLinks[number]["view"]) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b ${
        isScrolled
          ? "bg-black/80 backdrop-blur-xl border-white/5 py-4"
          : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo Identity */}
        <button
          onClick={() => handleNavClick("home")}
          className="text-white font-light text-xl tracking-[0.2em] uppercase focus:outline-none"
        >
          Yashika<span className="font-mono text-[9px] tracking-widest text-white/40 block ml-0.5">Fine Art</span>
        </button>

        {/* Primary Desktop Nav Route Layout Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.view)}
              className={`text-xs uppercase tracking-[0.2em] transition-colors focus:outline-none ${
                currentView === link.view
                  ? "text-white font-medium"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Global Functional Actions (Wishlist, Cart, Responsive Hamburger) */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Wishlist Link System Trigger with Smooth Text Reveal on Hover */}
          <button
            onClick={() => {
              setCurrentView("wishlist");
              setIsMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="relative px-3 py-2 text-white/70 hover:text-white transition-all duration-300 focus:outline-none group flex items-center gap-2 overflow-hidden rounded-md hover:bg-white/[0.03]"
            aria-label="Open Saved Wishlist"
          >
            <div className="relative flex items-center justify-center">
              <Heart
                size={18}
                className={`transition-transform duration-300 group-hover:scale-105 ${
                  wishlist?.length > 0 ? "fill-white text-white" : ""
                }`}
              />
              {wishlist?.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black font-mono text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold scale-90 animate-fade-in z-10">
                  {wishlist.length}
                </span>
              )}
            </div>
            
            {/* Smooth sliding text expander */}
            <span className="max-w-0 overflow-hidden text-[10px] uppercase tracking-[0.15em] font-light transition-all duration-300 ease-out group-hover:max-w-[80px] opacity-0 group-hover:opacity-100 whitespace-nowrap select-none">
              Wishlist
            </span>
          </button>

          {/* Cart Drawer Open Toggle System with Smooth Text Reveal on Hover */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3 py-2 text-white/70 hover:text-white transition-all duration-300 focus:outline-none group flex items-center gap-2 overflow-hidden rounded-md hover:bg-white/[0.03]"
            aria-label="Open Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag size={18} className="transition-transform duration-300 group-hover:scale-105" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black font-mono text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold scale-90 animate-fade-in z-10 arithmetic-badge">
                  {totalCartItems}
                </span>
              )}
            </div>

            {/* Smooth sliding text expander */}
            <span className="max-w-0 overflow-hidden text-[10px] uppercase tracking-[0.15em] font-light transition-all duration-300 ease-out group-hover:max-w-[60px] opacity-0 group-hover:opacity-100 whitespace-nowrap select-none">
              Cart
            </span>
          </button>

          {/* Mobile Overlay Hamburger Button Switcher */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white/70 hover:text-white transition-colors focus:outline-none md:hidden"
            aria-label="Toggle Navigation Tray Overlay"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Dynamic Slide-Down Mobile Responsive List Overlay Panel */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/5 py-8 px-6 space-y-5 animate-slide-down md:hidden flex flex-col items-start">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.view)}
              className={`text-sm uppercase tracking-[0.25em] text-left w-full py-1 ${
                currentView === link.view ? "text-white font-medium" : "text-white/60"
              }`}
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={() => {
              setCurrentView("wishlist");
              setIsMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`text-sm uppercase tracking-[0.25em] text-left w-full py-1 flex items-center gap-2 ${
              currentView === "wishlist" ? "text-white font-medium" : "text-white/60"
            }`}
          >
            Wishlist ({wishlist?.length || 0})
          </button>
          <a
            href="/admin"
            className="text-xs uppercase tracking-[0.25em] text-white/30 pt-4 border-t border-white/5 w-full block"
          >
            System Administration
          </a>
        </div>
      )}
    </nav>
  );
}