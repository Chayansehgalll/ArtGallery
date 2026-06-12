import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useStore } from "../store/useStore";

import { ArrowRight, Volume2, VolumeX } from "lucide-react";

/* ── Stable painting frame (no conditional mount / no position mutation) ── */
function PaintingFrame({
  position,
  rotation,
  imageUrl,
  onClick,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  imageUrl: string;
  title?: string;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // stable target vector – never re-allocated
  const scaleTarget = useRef(new THREE.Vector3(1, 1, 1));

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageUrl]);

  useFrame(() => {
    if (!groupRef.current) return;
    scaleTarget.current.setScalar(hovered ? 1.04 : 1);
    groupRef.current.scale.lerp(scaleTarget.current, 0.06);

    // fade glow opacity instead of mount/unmount
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity += ((hovered ? 0.07 : 0) - mat.opacity) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.2, 2.8, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Canvas painting */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[2, 2.6]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>

      {/* Always-mounted glow plane – opacity animated in useFrame */}
      <mesh ref={glowRef} position={[0, 0, 0.003]}>
        <planeGeometry args={[2.3, 2.9]} />
        <meshBasicMaterial color="white" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Gallery room ── */
function GalleryRoom() {
  const { setCurrentView, setSelectedArtwork } = useStore();
  const allArtworks = useStore((s) => s.paintings);
  // Always have 5 slots for the hero wall — repeat if fewer paintings exist
  const artworks = Array.from({ length: 5 }, (_, i) => allArtworks[i % allArtworks.length]);

  const handlePaintingClick = (index: number) => {
    setSelectedArtwork(artworks[index]);
    setCurrentView("product");
  };

  return (
    <>
      {/* Floor with subtle reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[200, 80]}
          resolution={512}
          mixBlur={1}
          mixStrength={25}
          roughness={0.95}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#080808"
          metalness={0.4}
          mirror={0.35}
        />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#111111" roughness={0.92} />
      </mesh>
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.92} />
      </mesh>
      <mesh position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.92} />
      </mesh>

      {/* Paintings – all at the same Y height, no sine oscillation */}
      <PaintingFrame
        position={[-3, 1, -5.9]}
        rotation={[0, 0, 0]}
        imageUrl={artworks[0].image}
        title={artworks[0].title}
        onClick={() => handlePaintingClick(0)}
      />
      <PaintingFrame
        position={[0, 1, -5.9]}
        rotation={[0, 0, 0]}
        imageUrl={artworks[1].image}
        title={artworks[1].title}
        onClick={() => handlePaintingClick(1)}
      />
      <PaintingFrame
        position={[3, 1, -5.9]}
        rotation={[0, 0, 0]}
        imageUrl={artworks[2].image}
        title={artworks[2].title}
        onClick={() => handlePaintingClick(2)}
      />
      <PaintingFrame
        position={[-7.9, 1, -2]}
        rotation={[0, Math.PI / 2, 0]}
        imageUrl={artworks[3].image}
        title={artworks[3].title}
        onClick={() => handlePaintingClick(3)}
      />
      <PaintingFrame
        position={[7.9, 1, 2]}
        rotation={[0, -Math.PI / 2, 0]}
        imageUrl={artworks[4].image}
        title={artworks[4].title}
        onClick={() => handlePaintingClick(4)}
      />

      {/* Warm museum lighting */}
      <ambientLight intensity={0.15} color="#fff4e6" />
      <spotLight position={[0, 7, 2]} angle={0.5} penumbra={1} intensity={1.8} color="#fff6ee" />
      <spotLight position={[-5, 6, -2]} angle={0.4} penumbra={1} intensity={0.8} color="#f4f0ff" />
      <spotLight position={[5, 6, -2]} angle={0.4} penumbra={1} intensity={0.8} color="#fff0ee" />

      <ContactShadows position={[0, -1.99, 0]} opacity={0.35} scale={20} blur={2.5} far={4} />
    </>
  );
}

/* ── Camera that follows mouse gently ── */
function CameraRig() {
  const { camera, pointer } = useThree();
  const target = useRef({ x: 0, y: 1 });

  useFrame(() => {
    target.current.x += (pointer.x * 1.5 - target.current.x) * 0.015;
    target.current.y += (pointer.y * 0.4 + 1 - target.current.y) * 0.015;
    camera.position.x += (target.current.x - camera.position.x) * 0.02;
    camera.position.y += (target.current.y - camera.position.y) * 0.02;
    camera.lookAt(0, 1, 0);
  });

  return null;
}

/* ── Floating dust particles ── */
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 150;

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 18;
      p[i * 3 + 1] = Math.random() * 8;
      p[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return p;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#ffffff" transparent opacity={0.3} depthWrite={false} />
    </points>
  );
}

/* ── Main hero export ── */
export default function Hero() {
  const { setCurrentView } = useStore();
  const artworks = useStore((s) => s.paintings);
  const textRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 3.5 });
    tl.fromTo(
      textRef.current?.children || [],
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" }
    );
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 1, 5], fov: 60 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
        >
          <color attach="background" args={["#000000"]} />
          <CameraRig />
          <GalleryRoom />
          <FloatingParticles />
          <Environment preset="city" />
          <fog attach="fog" args={["#000000", 10, 25]} />
        </Canvas>
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div ref={textRef} className="text-center px-6">
          <p className="text-white/40 text-xs tracking-[0.5em] uppercase mb-6">
            Yashika's Curated Fine Art Collection
          </p>
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-8 leading-[1.1]">
            Art that transforms
            <br />
            <span className="italic font-extralight">your space.</span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-md mx-auto mb-12 leading-relaxed">
            Discover museum-quality original paintings and limited edition prints
            by Yashika.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
            <button
              onClick={() => setCurrentView("collection")}
              className="group px-8 py-4 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-all duration-300 flex items-center gap-3"
              data-cursor-text="Explore"
            >
              Explore Collection
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setCurrentView("gallery")}
              className="px-8 py-4 border border-white/20 text-white text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/5 hover:border-white/40 transition-all duration-300"
              data-cursor-text="Tour"
            >
              Virtual Gallery Tour
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-12 py-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-white/30 text-[10px] tracking-[0.2em] uppercase">
            <span className="text-white/60">{artworks.length}</span> Artworks
          </div>
          <div className="text-white/30 text-[10px] tracking-[0.2em] uppercase">
            <span className="text-white/60">1</span> Artist
          </div>
        </div>
        <button onClick={() => setMuted(!muted)} className="text-white/30 hover:text-white/60 transition-colors">
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
    </section>
  );
}
