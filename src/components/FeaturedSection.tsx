import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePaintings, selectFeatured, coverOf } from "../services/paintings";
import { resolveDimensions } from "../utils/frame";
import { useStore } from "../store/useStore";
import { ArrowRight, Star, Clock, Users } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedSection() {
  const { setCurrentView, setSelectedArtwork } = useStore();
  const { paintings } = usePaintings();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll(".reveal");
      elements.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            },
          }
        );
      });
    }
  }, []);

  const featured = selectFeatured(paintings, 3);

  const stats = [
    { icon: Star, value: "500+", label: "Five-Star Reviews" },
    { icon: Clock, value: "48h", label: "Shipping Worldwide" },
    { icon: Users, value: "12K+", label: "Happy Collectors" },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-black">
      {/* Stats Bar */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-white/5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="text-center"
            >
              <stat.icon size={20} className="mx-auto mb-3 text-white/20" />
              <p className="text-white text-3xl md:text-4xl font-light mb-2">
                {stat.value}
              </p>
              <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Works */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-24">
        <div className="flex items-end justify-between mb-12">
          <div className="reveal">
            <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-4">
              Curated Selection
            </p>
            <h2 className="text-white text-3xl md:text-5xl font-light tracking-tight">
              Featured Works
            </h2>
          </div>
          <button
            onClick={() => setCurrentView("collection")}
            className="reveal hidden md:flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-[0.15em] uppercase transition-colors group"
          >
            View All
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.15,
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="group cursor-pointer"
              onClick={() => {
                setSelectedArtwork(artwork);
                setCurrentView("product");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div
                className="relative overflow-hidden bg-white/5 mb-4"
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                {artwork.isOriginal && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-white text-[9px] tracking-[0.2em] uppercase">
                      Original
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <button className="w-full py-3 bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium">
                    View Details
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">
                  {artwork.artist}
                </p>
                <h3 className="text-white text-lg font-light">
                  {artwork.title}
                </h3>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-white/60 text-sm">
                    ₹{artwork.price.toLocaleString()}
                  </span>
                  <span className="text-white/20 text-[10px] tracking-wider">
                    {artwork.dimensions}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why Yashika's */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-4">
              Why Choose Us
            </p>
            <h2 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-6">
              The Yashika's Difference
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              We believe that acquiring art should be as meaningful as the art
              itself. Every piece in our collection is hand-selected, authenticated,
              and delivered with white-glove service.
            </p>
            <div className="space-y-6">
              {[
                {
                  title: "Certificate of Authenticity",
                  desc: "Every original and limited edition comes with a signed certificate",
                },
                {
                  title: "White Glove Delivery",
                  desc: "Professional art handlers ensure safe, insured delivery worldwide",
                },
                {
                  title: "30-Day Satisfaction",
                  desc: "Not perfect for your space? Return within 30 days, no questions",
                },
                {
                  title: "Artist Direct",
                  desc: "We work directly with artists, ensuring fair compensation",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white/40 text-xs">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-light mb-1">
                      {item.title}
                    </h4>
                    <p className="text-white/30 text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal relative">
            <div className="aspect-[4/5] bg-white/5 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&q=80"
                alt="Gallery Interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-white/5 backdrop-blur-sm border border-white/10 p-6 hidden lg:block">
              <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase mb-2">
                Since
              </p>
              <p className="text-white text-4xl font-light">2018</p>
              <p className="text-white/30 text-xs mt-2">
                Curating exceptional art for discerning collectors
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
