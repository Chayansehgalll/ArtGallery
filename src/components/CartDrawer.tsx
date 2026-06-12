import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
} from "lucide-react";
import gsap from "gsap";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    setCurrentView,
  } = useStore();

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (drawerRef.current) {
      gsap.to(drawerRef.current, {
        x: isCartOpen ? 0 : "100%",
        duration: 0.6,
        ease: "power4.inOut",
      });
    }
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[56] bg-black border-l border-white/10 flex flex-col"
        style={{ transform: "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-white/40" />
            <h2 className="text-white text-sm tracking-[0.2em] uppercase font-light">
              Your Cart
            </h2>
            <span className="text-white/30 text-xs">({getCartCount()})</span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-white/30 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-white/10 mb-4" />
              <p className="text-white/30 text-sm">Your cart is empty</p>
              <p className="text-white/20 text-xs mt-2">
                Explore our collection to find your perfect piece
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.artwork.id}-${item.frame}`}
                className="flex gap-4 pb-6 border-b border-white/5"
              >
                <div className="w-24 h-28 bg-white/5 overflow-hidden flex-shrink-0">
                  <img
                    src={item.artwork.image}
                    alt={item.artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white text-sm font-light truncate">
                        {item.artwork.title}
                      </p>
                      <p className="text-white/30 text-[10px] tracking-wider uppercase mt-1">
                        {item.artwork.artist}
                      </p>
                      <p className="text-white/40 text-[10px] mt-1">
                        Frame: {item.frame}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.artwork.id)}
                      className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.artwork.id,
                            item.quantity - 1
                          )
                        }
                        className="w-7 h-7 border border-white/10 flex items-center justify-center text-white/40 hover:border-white/30 hover:text-white transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-white text-xs w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.artwork.id,
                            item.quantity + 1
                          )
                        }
                        className="w-7 h-7 border border-white/10 flex items-center justify-center text-white/40 hover:border-white/30 hover:text-white transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <p className="text-white text-sm">
                      ${(item.artwork.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-white/30 text-[10px]">
              <Truck size={12} />
              Free shipping on all orders
            </div>
            <div className="flex items-center justify-between py-4 border-t border-white/5">
              <span className="text-white/40 text-xs tracking-wider uppercase">
                Subtotal
              </span>
              <span className="text-white text-lg font-light">
                ${getCartTotal().toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setCurrentView("checkout");
              }}
              className="w-full py-4 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-3"
            >
              Checkout
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3 border border-white/10 text-white/40 text-xs tracking-[0.2em] uppercase hover:border-white/30 hover:text-white transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
