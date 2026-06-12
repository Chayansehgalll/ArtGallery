import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    name: "Alexandra Whitmore",
    role: "Interior Designer",
    location: "New York, NY",
    text: "The quality of curation at Yashika's is unmatched. Every piece I've acquired has become a conversation starter in my clients' homes. The AR feature alone has transformed how I present art to clients.",
    rating: 5,
    artwork: "Ethereal Silence",
  },
  {
    id: 2,
    name: "James Chen",
    role: "Art Collector",
    location: "San Francisco, CA",
    text: "I've been collecting contemporary art for over fifteen years. Yashika's selection rivals the best galleries in Chelsea. Their authentication process gives me complete confidence in every purchase.",
    rating: 5,
    artwork: "Chromatic Dreams",
  },
  {
    id: 3,
    name: "Sophie Laurent",
    role: "Gallery Owner",
    location: "Paris, France",
    text: "As a gallery owner myself, I'm incredibly particular about where I acquire pieces. Yashika's eye for emerging talent is exceptional. They've introduced me to artists I now represent in my own space.",
    rating: 5,
    artwork: "Golden Hour Reverie",
  },
  {
    id: 4,
    name: "Michael Torres",
    role: "Architect",
    location: "Miami, FL",
    text: "The virtual gallery experience is revolutionary. Being able to walk through the space and see how paintings interact with light and architecture has completely changed my approach to specifying art for projects.",
    rating: 5,
    artwork: "Urban Geometry",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current.querySelectorAll(".testimonial-reveal"),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[current];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-black border-t border-white/5"
    >
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Header */}
          <div className="testimonial-reveal">
            <p className="text-white/30 text-xs tracking-[0.5em] uppercase mb-4">
              Testimonials
            </p>
            <h2 className="text-white text-3xl md:text-5xl font-light tracking-tight mb-6">
              What Collectors Say
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-md mb-8">
              Join thousands of discerning collectors who have transformed their
              spaces with museum-quality art from Yashika's.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              <div className="flex items-center gap-2 ml-4">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1 transition-all duration-300 ${
                      i === current
                        ? "w-8 bg-white"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right - Quote */}
          <div className="testimonial-reveal relative">
            <Quote
              size={48}
              className="text-white/5 absolute -top-4 -left-4"
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="white"
                      className="text-white"
                    />
                  ))}
                </div>
                <blockquote className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-8 italic">
                  "{t.text}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {t.name}
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      {t.role} · {t.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/20 text-[10px] tracking-wider uppercase">
                      Acquired
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      {t.artwork}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
