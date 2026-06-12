import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const doorsRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline();

    // Animate progress
    const progressObj = { val: 0 };
    gsap.to(progressObj, {
      val: 100,
      duration: 2.5,
      ease: "power2.inOut",
      onUpdate: () => setProgress(Math.round(progressObj.val)),
    });

    // Text reveal
    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      0.3
    );

    // Doors open
    tl.to(doorsRef.current, {
      scaleY: 0,
      duration: 1.2,
      ease: "power4.inOut",
      transformOrigin: "top",
      delay: 0.3,
    });

    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete,
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <div ref={doorsRef} className="absolute inset-0 bg-black z-10" />
      <div ref={textRef} className="relative z-20 text-center">
        <div className="mb-8">
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            className="mx-auto mb-6"
          >
            <rect
              x="5"
              y="5"
              width="50"
              height="50"
              stroke="white"
              strokeWidth="1"
              fill="none"
            />
            <rect
              x="15"
              y="15"
              width="30"
              height="30"
              stroke="white"
              strokeWidth="0.5"
              fill="none"
            />
            <circle cx="30" cy="30" r="3" fill="white" />
          </svg>
        </div>
        <h1 className="text-white text-3xl md:text-5xl font-light tracking-[0.3em] mb-4">
          YASHIKA'S
        </h1>
        <p className="text-white/40 text-xs tracking-[0.5em] uppercase mb-12">
          Curated Fine Art
        </p>
        <div className="w-48 mx-auto">
          <div className="h-px bg-white/10 relative overflow-hidden">
            <div
              ref={progressRef}
              className="absolute inset-y-0 left-0 bg-white transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/30 text-[10px] tracking-widest mt-3">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}
