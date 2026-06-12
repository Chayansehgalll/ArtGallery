import { useStore } from "../store/useStore";
import {
  Globe,
  MessageCircle,
  Video,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  const { setCurrentView } = useStore();

  return (
    <footer className="bg-black border-t border-white/5">
      {/* Newsletter */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto py-20 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-4">
              Stay Connected
            </p>
            <h3 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-4">
              Join Yashika's
            </h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-md">
              Be the first to discover new collections, exclusive artist
              interviews, and private viewing invitations.
            </p>
          </div>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-6 py-4 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
            />
            <button className="px-8 py-4 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-white/40 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="text-white text-sm tracking-[0.3em] uppercase font-light">
                Yashika's
              </span>
            </div>
            <p className="text-white/30 text-xs leading-relaxed mb-6">
              Curating exceptional contemporary art for discerning collectors
              since 2018.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-white/20 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Globe size={16} />
              </a>
              <a
                href="#"
                className="text-white/20 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href="#"
                className="text-white/20 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Video size={16} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-6">
              Explore
            </p>
            <ul className="space-y-3">
              {[
                { label: "Home", view: "home" as const },
                { label: "Collection", view: "collection" as const },
                { label: "Artist", view: "artist" as const },
                { label: "Virtual Gallery", view: "gallery" as const },
                { label: "Checkout", view: "checkout" as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      setCurrentView(item.view);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-white/40 hover:text-white text-xs transition-colors flex items-center gap-1 group"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={10}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-6">
              Support
            </p>
            <ul className="space-y-3">
              {[
                "Shipping & Returns",
                "Art Care Guide",
                "Framing Services",
                "Certificate of Authenticity",
                "Trade Program",
                "Gift Cards",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/40 hover:text-white text-xs transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-6">
              Contact
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-white/20 mt-0.5 flex-shrink-0" />
                <span className="text-white/40 text-xs leading-relaxed">
                  123 Gallery Row
                  <br />
                  New York, NY 10012
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-white/20 flex-shrink-0" />
                <span className="text-white/40 text-xs">
                  +1 (212) 555-0147
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-white/20 flex-shrink-0" />
                <span className="text-white/40 text-xs">
                  hello@yashika.art
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto py-6 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-[10px] tracking-wider">
            &copy; 2024 Yashika's. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-white/20 hover:text-white/40 text-[10px] tracking-wider transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-white/20 hover:text-white/40 text-[10px] tracking-wider transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-white/20 hover:text-white/40 text-[10px] tracking-wider transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
