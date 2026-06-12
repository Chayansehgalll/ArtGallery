import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { artists } from "../data/artworks";
import { useStore } from "../store/useStore";
import {
  Award,
  MapPin,
  Calendar,
  Palette,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ArtistSection() {
  const { setCurrentView } = useStore();
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll(".artist-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });
    }
  }, []);

  const artist = artists[0];
  const milestones = [
    { year: "2018", title: "Studio Founded", desc: "Yashika began the practice in a small light-filled studio" },
    { year: "2019", title: "First Solo Show", desc: "A debut exhibition of monochrome textures and stillness" },
    { year: "2021", title: "Collectors Notice", desc: "Private collectors began acquiring the first editions" },
    { year: "2022", title: "Museum Presence", desc: "Large-scale works entered curated interiors and hotels" },
    { year: "2024", title: "Digital Gallery", desc: "The work expanded into an immersive online museum" },
  ];

  return (
    <section ref={sectionRef} className="min-h-screen bg-black pt-32 pb-24">
      {/* Header */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-20">
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-4">
            The Artist
        </p>
        <h2 className="text-white text-4xl md:text-6xl font-light tracking-tight mb-6">
            Yashika
        </h2>
        <p className="text-white/40 text-sm max-w-lg leading-relaxed">
            One artist. One voice. Yashika's work is shaped for collectors who
            want a quiet but unforgettable presence in the room.
        </p>
      </div>

      {/* Artist Spotlight */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-stretch">
          <div className="artist-card relative min-h-[520px] overflow-hidden border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%),linear-gradient(135deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0))]">
            <div className="absolute inset-0 flex items-center justify-center">
              {artist.image ? (
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_35%),linear-gradient(180deg,_#111,_#000)]" />
              )}
              <div className="relative z-10 text-center px-8">
                <div className="w-28 h-28 mx-auto mb-8 rounded-full border border-white/10 flex items-center justify-center bg-black/30 backdrop-blur-md">
                  <span className="text-white text-3xl font-light tracking-[0.3em]">
                    Y
                  </span>
                </div>
                <h3 className="text-white text-3xl md:text-5xl font-light tracking-tight mb-3">
                  Yashika
                </h3>
                <p className="text-white/45 text-sm leading-relaxed max-w-xl mx-auto mb-10">
                  {artist.bio}
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
                  <div className="border border-white/10 bg-white/5 p-4">
                    <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
                      Exhibitions
                    </p>
                    <p className="text-white text-2xl font-light">{artist.exhibitions}</p>
                  </div>
                  <div className="border border-white/10 bg-white/5 p-4">
                    <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
                      Works
                    </p>
                    <p className="text-white text-2xl font-light">{artist.works}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="border border-white/5 p-8 bg-white/[0.03]">
              <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3">
                Style
              </p>
              <p className="text-white text-sm leading-relaxed">
                Yashika works in a restrained monochrome language with subtle tonal
                shifts, high-detail textures, and a cinematic sense of light.
              </p>
            </div>

            <div className="space-y-4">
              {artist.awards.map((award) => (
                <div key={award} className="flex items-center gap-3 text-white/25 text-[10px] tracking-wider uppercase border-b border-white/5 pb-4">
                  <Award size={10} />
                  {award}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setCurrentView("collection");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group flex items-center gap-2 text-white text-xs tracking-[0.2em] uppercase mt-4 hover:gap-3 transition-all"
            >
              Explore Yashika's Collection
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="px-6 md:px-12 max-w-[1600px] mx-auto mb-32">
        <div className="text-center mb-16">
          <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-4">
            The Journey
          </p>
          <h3 className="text-white text-3xl md:text-4xl font-light tracking-tight">
            Yashika's Story
          </h3>
        </div>

        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block" />

          <div className="space-y-16 md:space-y-24">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                className={`relative flex items-center ${
                  index % 2 === 0
                    ? "md:flex-row"
                    : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? "md:text-right md:pr-16" : "md:text-left md:pl-16"
                  }`}
                >
                  <div
                    className={`inline-block ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}
                  >
                    <span className="text-white/20 text-5xl md:text-7xl font-light">
                      {milestone.year}
                    </span>
                    <h4 className="text-white text-lg font-light mt-2">
                      {milestone.title}
                    </h4>
                    <p className="text-white/30 text-sm mt-1">
                      {milestone.desc}
                    </p>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full items-center justify-center z-10">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Studio Section */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] bg-white/5 overflow-hidden">
            <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%),linear-gradient(180deg,_#101010,_#050505)] flex items-center justify-center">
              <div className="text-center px-8">
                <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase mb-4">
                  Studio Portrait Placeholder
                </p>
                <p className="text-white text-4xl font-light">Y</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <p className="text-white/30 text-xs tracking-[0.5em] uppercase">
              Behind the Scenes
            </p>
            <h3 className="text-white text-3xl md:text-4xl font-light tracking-tight">
              The Creative Process
            </h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Every work begins as a quiet composition of light, contrast, and
              texture. Yashika spends weeks refining brush density, frame color,
              and viewing distance so each piece feels intentional in a home or
              gallery setting.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="flex items-start gap-3">
                <Palette size={18} className="text-white/30 mt-0.5" />
                <div>
                  <p className="text-white text-sm">Hand-Finished</p>
                  <p className="text-white/30 text-xs mt-1">
                    Every original is created with layered detail
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-white/30 mt-0.5" />
                <div>
                  <p className="text-white text-sm">Independent Studio</p>
                  <p className="text-white/30 text-xs mt-1">
                    Built for private viewing and collectors
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-white/30 mt-0.5" />
                <div>
                  <p className="text-white text-sm">Time Investment</p>
                  <p className="text-white/30 text-xs mt-1">
                    Average 6 to 10 weeks per piece
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award size={18} className="text-white/30 mt-0.5" />
                <div>
                  <p className="text-white text-sm">Certified</p>
                  <p className="text-white/30 text-xs mt-1">
                    Certificate of authenticity
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentView("collection");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group flex items-center gap-2 text-white text-xs tracking-[0.2em] uppercase mt-4 hover:gap-3 transition-all"
            >
              Explore Yashika's Collection
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
