import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { type Artwork } from "../data/artworks";
import { usePaintings, selectGallery, coverOf, mainOf } from "../services/paintings";
import { resolveDimensions } from "../utils/frame";
import { useStore } from "../store/useStore";
import {
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  User, X, Heart, ShoppingBag, ZoomIn, Maximize2, MapPin,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS — 50×50m gallery, 10m ceiling
   ═══════════════════════════════════════════════════════════════════ */
const MOVE = 0.1;
const RUN = 0.2;
const CEIL = 10;
const HW = 25;
const HD = 25;
const MARGIN = 1.0;

function clamp(x: number, z: number): [number, number] {
  return [
    Math.max(-HW + MARGIN, Math.min(HW - MARGIN, x)),
    Math.max(-HD + MARGIN, Math.min(HD - MARGIN, z)),
  ];
}

// 10 painting spots — maximum of 10 paintings inside the gallery as requested
const SPOTS: [number, number, number, number, number, string][] = [
  // North wall
  [-12, 2.5, -HD + 0.15, 0, 0, "North Wall"],
  [0, 2.8, -HD + 0.15, 0, 1, "North Wall"],
  [12, 2.5, -HD + 0.15, 0, 2, "North Wall"],
  // South wall
  [-12, 2.5, HD - 0.15, Math.PI, 3, "South Wall"],
  [0, 2.8, HD - 0.15, Math.PI, 4, "South Wall"],
  [12, 2.5, HD - 0.15, Math.PI, 5, "South Wall"],
  // West wall
  [-HW + 0.15, 2.5, -6, Math.PI / 2, 6, "West Wall"],
  [-HW + 0.15, 2.5, 6, Math.PI / 2, 7, "West Wall"],
  // East wall
  [HW - 0.15, 2.5, -6, -Math.PI / 2, 0, "East Wall"],
  [HW - 0.15, 2.5, 6, -Math.PI / 2, 1, "East Wall"],
];

/* ═══════════════════════════════════════════════════════════════════
   INPUT
   ═══════════════════════════════════════════════════════════════════ */
function useKeyboard() {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const d = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const u = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", d); window.addEventListener("keyup", u);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);
  return keys;
}

/* ═══════════════════════════════════════════════════════════════════
   PAINTING
   ═══════════════════════════════════════════════════════════════════ */
function Painting({
  position, rotation, imageUrl, artIdx, width, height, playerPos, onApproach,
}: {
  position: [number, number, number]; rotation: [number, number, number];
  imageUrl: string; artIdx: number; width: number; height: number;
  playerPos: React.RefObject<{ x: number; z: number }>;
  onApproach: (i: number, c: boolean) => void;
}) {
  const gRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const wasClose = useRef(false);
  const sv = useRef(new THREE.Vector3(1, 1, 1));
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load(imageUrl);
    t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [imageUrl]);

  // Proportional frame: longest side ≈ 3 units, exact aspect ratio preserved
  const dims = useMemo(() => {
    const ar = (width || 24) / (height || 36);
    const longest = 3;
    const cw = ar >= 1 ? longest : longest * ar;
    const ch = ar >= 1 ? longest / ar : longest;
    const border = 0.18;
    return {
      cw, ch,
      fw: cw + border, fh: ch + border,
      bw: cw + border * 0.55, bh: ch + border * 0.55,
      iw: cw - 0.04, ih: ch - 0.04,
      glowW: cw + 0.45, glowH: ch + 0.45,
      lightY: ch / 2 + 0.1,
      labelY: -ch / 2 - 0.22,
      topH: cw * 0.32,
    };
  }, [width, height]);

  useFrame(() => {
    if (!gRef.current || !playerPos.current) return;
    const dx = playerPos.current.x - position[0];
    const dz = playerPos.current.z - position[2];
    const close = Math.sqrt(dx * dx + dz * dz) < 6;
    if (close !== wasClose.current) { wasClose.current = close; onApproach(artIdx, close); }
    sv.current.setScalar(close ? 1.015 : 1);
    gRef.current.scale.lerp(sv.current, 0.05);
    if (glowRef.current) { const m = glowRef.current.material as THREE.MeshBasicMaterial; m.opacity += ((close ? 0.12 : 0) - m.opacity) * 0.08; }
    if (spotRef.current) spotRef.current.intensity += ((close ? 5 : 2.5) - spotRef.current.intensity) * 0.05;
  });

  return (
    <group ref={gRef} position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.07]}><boxGeometry args={[dims.fw, dims.fh, 0.09]} /><meshStandardMaterial color="#3d3024" roughness={0.35} metalness={0.55} /></mesh>
      <mesh position={[0, 0, -0.03]}><boxGeometry args={[dims.bw, dims.bh, 0.04]} /><meshStandardMaterial color="#4a3c2e" roughness={0.4} metalness={0.45} /></mesh>
      <mesh position={[0, 0, -0.012]}><boxGeometry args={[dims.iw + 0.06, dims.ih + 0.06, 0.005]} /><meshStandardMaterial color="#b09a6a" roughness={0.2} metalness={0.88} /></mesh>
      <mesh position={[0, 0, 0.001]}><planeGeometry args={[dims.cw, dims.ch]} /><meshStandardMaterial map={tex} roughness={0.82} /></mesh>
      <mesh ref={glowRef} position={[0, 0, 0.004]}><planeGeometry args={[dims.glowW, dims.glowH]} /><meshBasicMaterial color="#fff8e0" transparent opacity={0} depthWrite={false} /></mesh>
      <mesh position={[0, dims.lightY, 0.08]}><boxGeometry args={[dims.topH, 0.028, 0.06]} /><meshStandardMaterial color="#b09a6a" roughness={0.2} metalness={0.9} /></mesh>
      <spotLight ref={spotRef} position={[0, dims.lightY + 1.4, 1.5]} angle={0.38} penumbra={0.92} intensity={2.5} color="#fff6e0" distance={10} decay={2} />
      <mesh position={[0, dims.labelY, 0.03]}><planeGeometry args={[Math.min(1.3, dims.cw * 0.7), 0.28]} /><meshStandardMaterial color="#f5f0e8" roughness={0.92} /></mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AVATAR — gender-aware (male default, female with toggle)
   ═══════════════════════════════════════════════════════════════════ */
function Avatar({
  posRef, rotY, isMoving, isRunning, isFemale,
}: {
  posRef: React.RefObject<{ x: number; z: number }>;
  rotY: React.RefObject<number>;
  isMoving: boolean; isRunning: boolean;
  isFemale: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const lLeg = useRef<THREE.Group>(null);
  const rLeg = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Mesh>(null);
  const lEyelid = useRef<THREE.Mesh>(null);
  const rEyelid = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const blinkT = useRef(0);

  useFrame((_, dt) => {
    if (!g.current || !posRef.current) return;
    g.current.position.set(posRef.current.x, -2, posRef.current.z);
    g.current.rotation.y = rotY.current ?? 0;
    if (isMoving) {
      const spd = isRunning ? 14 : 8; t.current += dt * spd;
      const sw = Math.sin(t.current) * (isRunning ? 0.6 : 0.38);
      if (lLeg.current) lLeg.current.rotation.x = sw;
      if (rLeg.current) rLeg.current.rotation.x = -sw;
      if (lArm.current) lArm.current.rotation.x = -sw * 0.5;
      if (rArm.current) rArm.current.rotation.x = sw * 0.5;
      if (head.current) head.current.position.y = 1.58 + Math.abs(Math.sin(t.current)) * 0.012;
    } else {
      t.current = 0;
      [lLeg, rLeg, lArm, rArm].forEach(r => { if (r.current) r.current.rotation.x *= 0.85; });
      if (chest.current) chest.current.scale.z = 1 + Math.sin(Date.now() * 0.002) * 0.01;
      if (head.current) head.current.position.y = 1.58;
    }
    blinkT.current += dt;
    const blinkOpen = (blinkT.current % 4) > 0.15;
    const eyeScale = blinkOpen ? 0.01 : 1;
    if (lEyelid.current) lEyelid.current.scale.y = eyeScale;
    if (rEyelid.current) rEyelid.current.scale.y = eyeScale;
  });

  // gender proportions
  const height = isFemale ? 1.65 : 1.78;
  const chestY = isFemale ? 1.18 : 1.2;
  const chestW = isFemale ? 0.33 : 0.38;
  const chestD = isFemale ? 0.18 : 0.2;
  const hipW = isFemale ? 0.34 : 0.32;
  const skin = isFemale ? "#e8c8a0" : "#d4a574";
  const hair = isFemale ? "#3a1a0a" : "#2a1a0a";
  const shirt = isFemale ? "#f0e8e0" : "#f5f0eb";
  const pants = isFemale ? "#2e2e34" : "#3a3a3e";

  return (
    <group ref={g} scale-y={height / 1.7}>
      {/* Head */}
      <group ref={head} position={[0, 1.58, 0]}>
        <mesh castShadow><sphereGeometry args={[0.13, 20, 20]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>
        {/* Hair — longer for female */}
        <mesh position={[0, 0.06, -0.02]}>
          <sphereGeometry args={[0.14, 16, 16, 0, Math.PI * 2, 0, isFemale ? Math.PI * 0.65 : Math.PI * 0.55]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {isFemale && (
          <mesh position={[0, -0.03, -0.12]}>
            <boxGeometry args={[0.08, 0.14, 0.04]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
        )}
        {/* Eyes */}
        <mesh position={[0.045, 0.02, 0.11]}><sphereGeometry args={[0.022, 10, 10]} /><meshStandardMaterial color="#fefefe" roughness={0.3} /></mesh>
        <mesh position={[-0.045, 0.02, 0.11]}><sphereGeometry args={[0.022, 10, 10]} /><meshStandardMaterial color="#fefefe" roughness={0.3} /></mesh>
        <mesh position={[0.045, 0.02, 0.13]}><sphereGeometry args={[0.011, 8, 8]} /><meshStandardMaterial color="#3a2a18" roughness={0.5} /></mesh>
        <mesh position={[-0.045, 0.02, 0.13]}><sphereGeometry args={[0.011, 8, 8]} /><meshStandardMaterial color="#3a2a18" roughness={0.5} /></mesh>
        <mesh ref={lEyelid} position={[0.045, 0.035, 0.115]}><boxGeometry args={[0.04, 0.015, 0.02]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
        <mesh ref={rEyelid} position={[-0.045, 0.035, 0.115]}><boxGeometry args={[0.04, 0.015, 0.02]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
        <mesh position={[0, -0.01, 0.13]}><boxGeometry args={[0.02, 0.03, 0.02]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
        <mesh position={[0, -0.045, 0.12]}><boxGeometry args={[0.04, 0.008, 0.01]} /><meshStandardMaterial color="#b07060" roughness={0.6} /></mesh>
        <mesh position={[0.13, 0, 0]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
        <mesh position={[-0.13, 0, 0]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color={skin} roughness={0.7} /></mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 1.44, 0]}><cylinderGeometry args={[0.042, 0.048, 0.07, 10]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>

      {/* Chest */}
      <mesh ref={chest} position={[0, chestY, 0]} castShadow>
        <boxGeometry args={[chestW, 0.42, chestD]} />
        <meshStandardMaterial color={shirt} roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.39, 0.08]}><boxGeometry args={[0.14, 0.03, 0.06]} /><meshStandardMaterial color={shirt} roughness={0.6} /></mesh>

      {/* Belt */}
      <mesh position={[0, 0.96, 0]}><boxGeometry args={[0.39, 0.04, 0.21]} /><meshStandardMaterial color="#5a4830" roughness={0.45} metalness={0.25} /></mesh>
      <mesh position={[0, 0.96, 0.11]}><boxGeometry args={[0.04, 0.03, 0.01]} /><meshStandardMaterial color="#b09a6a" roughness={0.2} metalness={0.85} /></mesh>

      {/* Hips — wider for female */}
      <mesh position={[0, 0.88, 0]}><boxGeometry args={[hipW, 0.12, 0.19]} /><meshStandardMaterial color={pants} roughness={0.7} /></mesh>

      {/* Arms */}
      <group ref={lArm} position={[0.24, 1.34, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.1, 0.3, 0.1]} /><meshStandardMaterial color={shirt} roughness={0.65} /></mesh>
        <mesh position={[0, -0.34, 0]}><boxGeometry args={[0.08, 0.13, 0.08]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>
        <mesh position={[0, -0.44, 0.01]}><boxGeometry args={[0.06, 0.07, 0.04]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>
        {[-0.02, 0, 0.02].map((fx, i) => <mesh key={i} position={[fx, -0.5, 0.01]}><boxGeometry args={[0.012, 0.04, 0.015]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>)}
        <mesh position={[0.035, -0.44, 0.025]}><boxGeometry args={[0.015, 0.035, 0.015]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>
      </group>
      <group ref={rArm} position={[-0.24, 1.34, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.1, 0.3, 0.1]} /><meshStandardMaterial color={shirt} roughness={0.65} /></mesh>
        <mesh position={[0, -0.34, 0]}><boxGeometry args={[0.08, 0.13, 0.08]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>
        <mesh position={[0, -0.44, 0.01]}><boxGeometry args={[0.06, 0.07, 0.04]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>
        {[-0.02, 0, 0.02].map((fx, i) => <mesh key={i} position={[fx, -0.5, 0.01]}><boxGeometry args={[0.012, 0.04, 0.015]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>)}
        <mesh position={[-0.035, -0.44, 0.025]}><boxGeometry args={[0.015, 0.035, 0.015]} /><meshStandardMaterial color={skin} roughness={0.75} /></mesh>
      </group>

      {/* Legs */}
      <group ref={lLeg} position={[0.09, 0.8, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow><boxGeometry args={[0.13, 0.46, 0.13]} /><meshStandardMaterial color={pants} roughness={0.7} /></mesh>
        <mesh position={[0, -0.52, 0.02]}><boxGeometry args={[0.12, 0.1, 0.2]} /><meshStandardMaterial color="#2a2420" roughness={0.55} /></mesh>
      </group>
      <group ref={rLeg} position={[-0.09, 0.8, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow><boxGeometry args={[0.13, 0.46, 0.13]} /><meshStandardMaterial color={pants} roughness={0.7} /></mesh>
        <mesh position={[0, -0.52, 0.02]}><boxGeometry args={[0.12, 0.1, 0.2]} /><meshStandardMaterial color="#2a2420" roughness={0.55} /></mesh>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CAMERA
   ═══════════════════════════════════════════════════════════════════ */
function Cam({
  posRef, rotY, camX, camY, isRunning,
}: {
  posRef: React.RefObject<{ x: number; z: number }>;
  rotY: React.RefObject<number>;
  camX: React.RefObject<number>; camY: React.RefObject<number>;
  isRunning: boolean;
}) {
  const { camera } = useThree();
  const cp = useRef(new THREE.Vector3());
  const cl = useRef(new THREE.Vector3());
  const shakeT = useRef(0);

  useFrame((_, dt) => {
    if (!posRef.current) return;
    const px = posRef.current.x, pz = posRef.current.z;
    const ry = rotY.current ?? 0, ax = camX.current ?? 0, ay = camY.current ?? 0.18;
    shakeT.current += dt * (isRunning ? 18 : 0);
    const shake = isRunning ? Math.sin(shakeT.current) * 0.012 : 0;

    // Third-person follow camera
    const dist = 4.5, h = 2.4;
    const tp = new THREE.Vector3(
      px - Math.sin(ry + ax) * dist * Math.cos(ay),
      -2 + h + Math.sin(ay) * 2 + shake,
      pz - Math.cos(ry + ax) * dist * Math.cos(ay)
    );
    const tl = new THREE.Vector3(px, -2 + 1.3, pz);

    cp.current.lerp(tp, 0.11); cl.current.lerp(tl, 0.11);
    camera.position.copy(cp.current); camera.lookAt(cl.current);
  });
  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   PLAYER — CORRECTED L/R
   The previous bug: mx = (rgt - lft), and the velocity formula was
   tvx = sin(ry)*mz + cos(ry)*mx. When mx > 0 (right key), cos(ry)*mx
   moved the character in the world-X direction, which at ry=0 (facing
   +Z) is world-right. But the camera faces +Z, so right should be +X.
   At ry=0, sin(0)=0, cos(0)=1, so mx>0 → tvx>0 → moves right. CORRECT.
   
   The actual bug was that the virtual left/right pads sent x = -1 for
   left but the earlier code treated v.x differently. Let's verify
   carefully and make camera-relative right = cos(ry)*mx, left = -cos(ry)*mx.
   At ry=0 (facing into screen), D/→ should move screen-right = world-right = +x.
   cos(0) = 1, so mx>0 → +tvx → right. Correct.
   A/← should move screen-left = world-left = -x.
   mx<0 → -tvx → left. Correct.
   
   The real fix: the virtual pad 'left' sends x = -1, 'right' sends x = +1.
   Keyboard 'A'/'ArrowLeft' → lft = 1, 'D'/'ArrowRight' → rgt = 1.
   mx = (rgt + vr) - (lft + vl). If pressing D → mx = 1 → right. If pressing
   left pad → vl = 1 → mx = -1 → left. This should be correct now.
   ═══════════════════════════════════════════════════════════════════ */
function Player({
  keys, posRef, rotY, vi, onMove,
}: {
  keys: React.RefObject<Record<string, boolean>>;
  posRef: React.MutableRefObject<{ x: number; z: number }>;
  rotY: React.MutableRefObject<number>;
  vi: React.RefObject<{ x: number; z: number; sprint: boolean }>;
  onMove: (m: boolean, r: boolean) => void;
}) {
  const vel = useRef({ x: 0, z: 0 });
  const wm = useRef(false); const wr = useRef(false);

  useFrame(() => {
    const k = keys.current ?? {};
    const v = vi.current ?? { x: 0, z: 0, sprint: false };

    // Keyboard: ArrowLeft/A = LEFT (strafe left), ArrowRight/D = RIGHT (strafe right)
    const fwd = (k["KeyW"] || k["ArrowUp"] ? 1 : 0);
    const bwd = (k["KeyS"] || k["ArrowDown"] ? 1 : 0);
    const kl = (k["KeyA"] || k["ArrowLeft"] ? 1 : 0);
    const kr = (k["KeyD"] || k["ArrowRight"] ? 1 : 0);
    // Virtual: left pad → x negative, right pad → x positive
    const vl = v.x < 0 ? -v.x : 0;
    const vr = v.x > 0 ? v.x : 0;
    const sprint = k["ShiftLeft"] || k["ShiftRight"] || v.sprint;

    const mz = Math.max(-1, Math.min(1, fwd - bwd + v.z));
    // Fixed: Because the camera looks towards +Z, world +X is to the left.
    // So moving Right means moving in -X. Thus we subtract Right from Left.
    const mx = Math.max(-1, Math.min(1, (kl + vl) - (kr + vr)));
    const moving = Math.abs(mz) > 0.01 || Math.abs(mx) > 0.01;
    const spd = sprint ? RUN : MOVE;
    const ry = rotY.current;

    // Camera-relative: at ry=0 facing forward (+Z),
    // right = +X = cos(ry)*mx, left = -X
    // forward = +Z = sin(ry)*mz (but sin(0)=0!) wait...
    // Actually: forward = the direction the avatar faces = along rotY.
    // sin(ry)*mz gives world-x component, cos(ry)*mz gives world-z component.
    // At ry=0 (facing +Z): sin(0)=0, cos(0)=1, so mz>0 → +Z → forward. ✓
    // Right is perpendicular = +90° = cos(ry) for world-x, -sin(ry) for world-z.
    // At ry=0: cos(0)=1, so mx>0 → +X → right. ✓
    const tvx = (Math.sin(ry) * mz + Math.cos(ry) * mx) * spd;
    const tvz = (Math.cos(ry) * mz - Math.sin(ry) * mx) * spd;

    vel.current.x += (tvx - vel.current.x) * 0.22;
    vel.current.z += (tvz - vel.current.z) * 0.22;

    const [nx, nz] = clamp(posRef.current.x + vel.current.x, posRef.current.z + vel.current.z);
    posRef.current.x = nx; posRef.current.z = nz;

    const run = sprint && moving;
    if (moving !== wm.current || run !== wr.current) { wm.current = moving; wr.current = run; onMove(moving, run); }
  });
  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   DUST
   ═══════════════════════════════════════════════════════════════════ */
function Dust() {
  const ref = useRef<THREE.Points>(null);
  const pos = useMemo(() => {
    const p = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      p[i * 3] = (Math.random() - 0.5) * HW * 2;
      p[i * 3 + 1] = Math.random() * CEIL - 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * HD * 2;
    }
    return p;
  }, []);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.006; });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial size={0.022} color="#d4c8b0" transparent opacity={0.22} depthWrite={false} />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MUSEUM — 50×50m, 10m ceiling
   ═══════════════════════════════════════════════════════════════════ */
function Museum() {
  const wall = "#f0ece4"; const wallB = "#e8e2d6";
  const marble = "#f8f5f0"; const trim = "#b09a6a";
  const wood = "#6b4e32"; const concrete = "#d5cfc6";

  return (
    <group>
      {/* ── MARBLE FLOOR ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[HW * 2 + 3, HD * 2 + 3]} />
        <meshStandardMaterial color={marble} roughness={0.12} metalness={0.06} />
      </mesh>
      {/* Brass inlay grid every 10m */}
      {[-20, -10, 0, 10, 20].map(x => (
        <mesh key={`fx-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -1.99, 0]}>
          <planeGeometry args={[0.03, HD * 2 - 2]} />
          <meshStandardMaterial color={trim} roughness={0.18} metalness={0.88} />
        </mesh>
      ))}
      {[-20, -10, 0, 10, 20].map(z => (
        <mesh key={`fz-${z}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.99, z]}>
          <planeGeometry args={[0.03, HW * 2 - 2]} />
          <meshStandardMaterial color={trim} roughness={0.18} metalness={0.88} />
        </mesh>
      ))}

      {/* ── CEILING (higher) ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL - 2, 0]}>
        <planeGeometry args={[HW * 2 + 3, HD * 2 + 3]} />
        <meshStandardMaterial color="#faf8f4" roughness={0.82} />
      </mesh>
      {/* Central skylight cluster */}
      {[-8, 0, 8].map(x => [-8, 0, 8].map(z => (
        <group key={`sky-${x}-${z}`} position={[x, CEIL - 2.01, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5, 5]} />
            <meshStandardMaterial color="#dce6f0" roughness={0.25} metalness={0.08} transparent opacity={0.7} />
          </mesh>
          {[[-2.5, 0], [2.5, 0], [0, -2.5], [0, 2.5]].map(([fx, fz], i) => (
            <mesh key={i} position={[fx, 0.02, fz]} rotation={[Math.PI / 2, 0, fx === 0 ? Math.PI / 2 : 0]}>
              <boxGeometry args={[5, 0.1, 0.04]} /><meshStandardMaterial color="#ccc8be" roughness={0.5} />
            </mesh>
          ))}
        </group>
      )))}

      {/* Ceiling coffer grid */}
      {Array.from({ length: 10 }, (_, i) => (i - 4.5) * 5.2).map(x => (
        <mesh key={`ccx-${x}`} position={[x, CEIL - 2.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.07, HD * 2, 0.05]} /><meshStandardMaterial color="#e8e4dc" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => (i - 4.5) * 5.2).map(z => (
        <mesh key={`ccz-${z}`} position={[0, CEIL - 2.03, z]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <boxGeometry args={[0.07, HW * 2, 0.05]} /><meshStandardMaterial color="#e8e4dc" roughness={0.7} />
        </mesh>
      ))}

      {/* ── WALLS (taller: CEIL=10) ── */}
      <mesh position={[0, CEIL / 2 - 2, -HD]}><planeGeometry args={[HW * 2, CEIL]} /><meshStandardMaterial color={wall} roughness={0.88} /></mesh>
      <mesh position={[0, CEIL / 2 - 2, HD]} rotation={[0, Math.PI, 0]}><planeGeometry args={[HW * 2, CEIL]} /><meshStandardMaterial color={wall} roughness={0.88} /></mesh>
      <mesh position={[-HW, CEIL / 2 - 2, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[HD * 2, CEIL]} /><meshStandardMaterial color={wallB} roughness={0.88} /></mesh>
      <mesh position={[HW, CEIL / 2 - 2, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[HD * 2, CEIL]} /><meshStandardMaterial color={wallB} roughness={0.88} /></mesh>

      {/* ── WAINSCOTING ── */}
      {[
        { p: [0, -0.5, -HD + 0.03] as [number, number, number], r: [0, 0, 0] as [number, number, number], w: HW * 2 },
        { p: [0, -0.5, HD - 0.03] as [number, number, number], r: [0, Math.PI, 0] as [number, number, number], w: HW * 2 },
        { p: [-HW + 0.03, -0.5, 0] as [number, number, number], r: [0, Math.PI / 2, 0] as [number, number, number], w: HD * 2 },
        { p: [HW - 0.03, -0.5, 0] as [number, number, number], r: [0, -Math.PI / 2, 0] as [number, number, number], w: HD * 2 },
      ].map((d, i) => (
        <group key={`ws-${i}`} position={d.p} rotation={d.r}>
          <mesh><boxGeometry args={[d.w, 3, 0.06]} /><meshStandardMaterial color="#e4ddd2" roughness={0.8} /></mesh>
          <mesh position={[0, 1.52, 0.02]}><boxGeometry args={[d.w, 0.045, 0.035]} /><meshStandardMaterial color={trim} roughness={0.22} metalness={0.82} /></mesh>
          <mesh position={[0, -1.48, 0.02]}><boxGeometry args={[d.w, 0.05, 0.035]} /><meshStandardMaterial color="#d8d0c4" roughness={0.6} /></mesh>
        </group>
      ))}

      {/* ── CROWN MOULDING ── */}
      {[
        { p: [0, CEIL - 2.12, -HD + 0.04] as [number, number, number], r: [0, 0, 0] as [number, number, number], w: HW * 2 },
        { p: [0, CEIL - 2.12, HD - 0.04] as [number, number, number], r: [0, Math.PI, 0] as [number, number, number], w: HW * 2 },
        { p: [-HW + 0.04, CEIL - 2.12, 0] as [number, number, number], r: [0, Math.PI / 2, 0] as [number, number, number], w: HD * 2 },
        { p: [HW - 0.04, CEIL - 2.12, 0] as [number, number, number], r: [0, -Math.PI / 2, 0] as [number, number, number], w: HD * 2 },
      ].map((d, i) => (
        <mesh key={`cm-${i}`} position={d.p} rotation={d.r}>
          <boxGeometry args={[d.w, 0.2, 0.14]} /><meshStandardMaterial color="#e0dbd0" roughness={0.55} />
        </mesh>
      ))}

      {/* ── COLUMNS (8 corners + mid-wall) ── */}
      {[
        [-HW + 1.2, -HD + 1.2], [HW - 1.2, -HD + 1.2],
        [-HW + 1.2, HD - 1.2], [HW - 1.2, HD - 1.2],
        [-HW + 1.2, 0], [HW - 1.2, 0],
        [0, -HD + 1.2], [0, HD - 1.2],
      ].map(([cx, cz], i) => (
        <group key={`col-${i}`} position={[cx, -2, cz]}>
          <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.8, 0.24, 0.8]} /><meshStandardMaterial color={marble} roughness={0.18} /></mesh>
          <mesh position={[0, CEIL / 2 - 0.12, 0]} castShadow><cylinderGeometry args={[0.24, 0.28, CEIL - 0.48, 16]} /><meshStandardMaterial color="#f2ede5" roughness={0.28} /></mesh>
          <mesh position={[0, CEIL - 0.24, 0]}><boxGeometry args={[0.9, 0.22, 0.9]} /><meshStandardMaterial color={marble} roughness={0.18} /></mesh>
        </group>
      ))}

      {/* ── BENCHES (distributed) ── */}
      {[
        [-8, 0, 0], [8, 0, 0], [0, -8, Math.PI / 2], [0, 8, -Math.PI / 2],
        [-16, -16, Math.PI / 4], [16, -16, -Math.PI / 4],
        [-16, 16, -Math.PI / 4], [16, 16, Math.PI / 4],
      ].map(([bx, bz, br], i) => (
        <group key={`bn-${i}`} position={[bx, -2, bz]} rotation={[0, br, 0]}>
          <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[2.4, 0.1, 0.7]} /><meshStandardMaterial color="#f0e8dc" roughness={0.5} /></mesh>
          <mesh position={[0, 0.22, 0]}><boxGeometry args={[2.3, 0.4, 0.6]} /><meshStandardMaterial color={wood} roughness={0.5} /></mesh>
          {([-1, 1] as const).map(lx => ([-0.22, 0.22] as const).map(lz => (
            <mesh key={`${lx}${lz}`} position={[lx, 0.02, lz]}><cylinderGeometry args={[0.022, 0.022, 0.035, 8]} /><meshStandardMaterial color="#888" roughness={0.35} metalness={0.65} /></mesh>
          )))}
        </group>
      ))}

      {/* ── CENTER SCULPTURE ── */}
      <group position={[0, -2, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.5, 0.55, 1.0, 16]} /><meshStandardMaterial color={marble} roughness={0.16} /></mesh>
        <mesh position={[0, 1.02, 0]}><cylinderGeometry args={[0.58, 0.58, 0.04, 16]} /><meshStandardMaterial color="#eae4da" roughness={0.18} /></mesh>
        <mesh position={[0, 1.55, 0]} castShadow><torusKnotGeometry args={[0.28, 0.08, 80, 16]} />
          <meshStandardMaterial color={trim} roughness={0.12} metalness={0.88} />
        </mesh>
        <spotLight position={[0, 5, 1.5]} angle={0.38} penumbra={1.2} intensity={1.8} color="#fff8f0" distance={10} decay={2} />
      </group>

      {/* ── ADDITIONAL SCULPTURES ── */}
      {[
        [-18, -18, 0], [18, -18, 1], [-18, 18, 2], [18, 18, 3],
      ].map(([sx, sz, si], i) => (
        <group key={`sc-${i}`} position={[sx, -2, sz]}>
          <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.35, 0.4, 0.8, 14]} /><meshStandardMaterial color={marble} roughness={0.18} /></mesh>
          <mesh position={[0, 0.82, 0]}><cylinderGeometry args={[0.42, 0.42, 0.03, 14]} /><meshStandardMaterial color="#eae4da" roughness={0.2} /></mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            {si % 2 === 0 ? <dodecahedronGeometry args={[0.25, 0]} /> : <icosahedronGeometry args={[0.25, 0]} />}
            <meshStandardMaterial color={si < 2 ? marble : trim} roughness={si < 2 ? 0.18 : 0.12} metalness={si < 2 ? 0.04 : 0.88} />
          </mesh>
          <spotLight position={[0, 3.5, 1]} angle={0.4} penumbra={1.2} intensity={0.8} color="#fff8f0" distance={7} decay={2} />
        </group>
      ))}

      {/* ── PLANTS (all corners + midwall) ── */}
      {[
        [-HW + 2, -HD + 2], [HW - 2, -HD + 2], [-HW + 2, HD - 2], [HW - 2, HD - 2],
        [-HW + 2, 0], [HW - 2, 0], [0, -HD + 2], [0, HD - 2],
      ].map(([px, pz], i) => (
        <group key={`pl-${i}`} position={[px, -2, pz]}>
          <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.28, 0.2, 0.6, 10]} /><meshStandardMaterial color={concrete} roughness={0.6} /></mesh>
          <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.04, 0.06, 0.8, 8]} /><meshStandardMaterial color="#7a6040" roughness={0.8} /></mesh>
          {[[0, 1.6, 0, 0.44], [-0.22, 1.4, 0.14, 0.32], [0.22, 1.45, -0.1, 0.34], [0, 1.85, 0, 0.28]].map(([fx, fy, fz, fr], j) => (
            <mesh key={j} position={[fx, fy, fz]}><sphereGeometry args={[fr, 10, 10]} /><meshStandardMaterial color={j % 2 ? "#4a7a42" : "#3a6a38"} roughness={0.88} /></mesh>
          ))}
        </group>
      ))}

      {/* ── HANGING LIGHTS ── */}
      {[-15, -5, 5, 15].map(x => [-15, -5, 5, 15].map(z => (
        <group key={`hl-${x}-${z}`} position={[x, CEIL - 3.0, z]}>
          <mesh><cylinderGeometry args={[0.007, 0.007, 1.4, 6]} /><meshStandardMaterial color="#333" roughness={0.4} metalness={0.6} /></mesh>
          <mesh position={[0, -0.7, 0]}><cylinderGeometry args={[0.18, 0.14, 0.12, 12]} /><meshStandardMaterial color="#e0dcd4" roughness={0.4} /></mesh>
          <pointLight position={[0, -0.85, 0]} intensity={0.5} color="#fff4e0" distance={12} decay={2} />
        </group>
      )))}

      {/* ═══ LIGHTING ═══ */}
      <ambientLight intensity={0.5} color="#fffaf2" />
      <directionalLight position={[8, 18, 5]} intensity={2.0} color="#fffaf0" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={60} shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30} />
      <directionalLight position={[-6, 14, -6]} intensity={0.6} color="#f0f4ff" />
      <pointLight position={[0, 6, -20]} intensity={0.5} color="#fff6eb" distance={30} decay={2} />
      <pointLight position={[0, 6, 20]} intensity={0.4} color="#fff6eb" distance={30} decay={2} />
      <pointLight position={[0, 6, 0]} intensity={0.5} color="#fff6eb" distance={30} decay={2} />
      <Environment preset="apartment" />
      <ContactShadows position={[0, -1.99, 0]} opacity={0.1} scale={55} blur={3} far={8} color="#8a7a6a" />
      <fog attach="fog" args={["#f4f0ea", 30, 60]} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCENE
   ═══════════════════════════════════════════════════════════════════ */
function Scene(p: {
  posRef: React.MutableRefObject<{ x: number; z: number }>;
  rotY: React.MutableRefObject<number>;
  isMoving: boolean; isRunning: boolean; isFemale: boolean;
  camX: React.MutableRefObject<number>; camY: React.MutableRefObject<number>;
  keys: React.RefObject<Record<string, boolean>>;
  vi: React.RefObject<{ x: number; z: number; sprint: boolean }>;
  onMove: (m: boolean, r: boolean) => void;
  onApproach: (i: number, c: boolean) => void;
  galleryArt: Artwork[];
}) {
  return (
    <>
      <Cam posRef={p.posRef} rotY={p.rotY} camX={p.camX} camY={p.camY} isRunning={p.isRunning} />
      <Player keys={p.keys} posRef={p.posRef} rotY={p.rotY} vi={p.vi} onMove={p.onMove} />
      <Museum />
      <Dust />
      <Avatar posRef={p.posRef} rotY={p.rotY} isMoving={p.isMoving} isRunning={p.isRunning} isFemale={p.isFemale} />
      {SPOTS.map(([x, y, z, ry], i) => {
        if (i >= p.galleryArt.length) return null;
        const art = p.galleryArt[i];
        const d = resolveDimensions(art.width, art.height, art.dimensions);
        return (
          <Painting key={art.id + "-" + i} position={[x, y, z]} rotation={[0, ry, 0]}
            imageUrl={mainOf(art)} width={d.width} height={d.height}
            artIdx={i} playerPos={p.posRef} onApproach={p.onApproach} />
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MINIMAP
   ═══════════════════════════════════════════════════════════════════ */
function Minimap({ posRef, rotY, near }: {
  posRef: React.RefObject<{ x: number; z: number }>;
  rotY: React.RefObject<number>; near: number | null;
}) {
  const c = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let id: number;
    const draw = () => {
      const cv = c.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      const w = cv.width, h = cv.height;
      const sc = w / (HW * 2 + 8);
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-(rotY.current ?? 0));
      ctx.translate(-w / 2, -h / 2);
      ctx.fillStyle = "rgba(248,245,240,0.9)"; ctx.fillRect(0, 0, w, h);
      const rw = HW * 2 * sc, rd = HD * 2 * sc;
      const cx = w / 2, cy = h / 2;
      ctx.strokeStyle = "rgba(176,154,106,0.5)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - rw / 2, cy - rd / 2, rw, rd);
      SPOTS.forEach(([px, , pz, , ,], i) => {
        const mx = cx + px * sc, mz = cy + pz * sc;
        ctx.fillStyle = near === i ? "#b09a6a" : "rgba(176,154,106,0.3)";
        ctx.fillRect(mx - 3, mz - 3, 6, 6);
      });
      ctx.restore();
      ctx.fillStyle = "#b09a6a";
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#6b4e32"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 3, cy - 9); ctx.lineTo(cx, cy - 14); ctx.lineTo(cx + 3, cy - 9); ctx.stroke();
      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [posRef, rotY, near]);
  return <canvas ref={c} width={160} height={160} className="rounded-xl border border-black/5 shadow-sm bg-white/90 backdrop-blur-sm" />;
}

/* ═══════════════════════════════════════════════════════════════════
   INFO PANEL
   ═══════════════════════════════════════════════════════════════════ */
function InfoPanel({ art, onClose, onProduct }: { art: Artwork; onClose: () => void; onProduct: () => void }) {
  const { toggleWishlist, wishlist, addToCart } = useStore();
  return (
    <div className="absolute right-3 top-14 bottom-14 w-80 max-w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl flex flex-col z-30 overflow-hidden slide-in-from-right rounded-xl">
      <div className="flex items-center justify-between p-4 border-b border-black/5">
        <p className="text-black/40 text-[10px] tracking-[0.3em] uppercase font-medium">Artwork</p>
        <button onClick={onClose} className="text-black/30 hover:text-black transition-colors"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div
          className="bg-black/5 overflow-hidden rounded-lg"
          style={{ aspectRatio: (() => { const d = resolveDimensions(art.width, art.height, art.dimensions); return `${d.width} / ${d.height}`; })() }}
        >
          <img src={coverOf(art)} alt={art.title} className="w-full h-full object-cover" />
        </div>
        <div><p className="text-black/35 text-[10px] tracking-[0.2em] uppercase mb-0.5">{art.artist}</p>
          <h3 className="text-black text-xl font-light">{art.title}</h3></div>
        <p className="text-black text-2xl font-light">${art.price.toLocaleString()}</p>
        <p className="text-black/45 text-xs leading-relaxed">{art.description}</p>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-black/45 tracking-wider uppercase">
          {[["Size", art.dimensions], ["Medium", art.medium], ["Year", String(art.year)], ["Edition", `${art.edition}/${art.editionTotal}`]].map(([l, v]) => (
            <div key={l} className="border border-black/5 rounded-lg p-2.5"><p className="text-black/20 mb-0.5">{l}</p><p className="text-black/55">{v}</p></div>
          ))}
        </div>
        <div><p className="text-black/20 text-[10px] tracking-[0.2em] uppercase mb-2">Frames</p>
          <div className="flex flex-wrap gap-1.5">{art.frameColors.map(f => <span key={f} className="px-2.5 py-1 border border-black/8 text-black/45 text-[10px] tracking-wider rounded-md">{f}</span>)}</div></div>
      </div>
      <div className="p-4 border-t border-black/5 space-y-2">
        <div className="flex gap-2">
          <button onClick={() => { addToCart(art, art.frameColors[0]); onClose(); }}
            className="flex-1 py-3 bg-black text-white text-[10px] tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 hover:bg-black/85 transition-colors rounded-lg"><ShoppingBag size={12} /> Add to Cart</button>
          <button onClick={() => toggleWishlist(art.id)} className="w-11 border border-black/10 rounded-lg flex items-center justify-center text-black/30 hover:text-black transition-colors">
            <Heart size={14} fill={wishlist.includes(art.id) ? "currentColor" : "none"} /></button>
        </div>
        <button onClick={onProduct} className="w-full py-2.5 border border-black/8 text-black/45 text-[10px] tracking-[0.2em] uppercase hover:bg-black/3 transition-colors flex items-center justify-center gap-2 rounded-lg"><ZoomIn size={12} /> Full Details</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   VIRTUAL CONTROLS
   ═══════════════════════════════════════════════════════════════════ */
function Controls({ vi }: {
  vi: React.MutableRefObject<{ x: number; z: number; sprint: boolean }>;
}) {
  const press = (d: string) => {
    if (d === "up") vi.current.z = 1;
    if (d === "down") vi.current.z = -1;
    if (d === "left") vi.current.x = -1;
    if (d === "right") vi.current.x = 1;
  };
  const release = (d: string) => {
    if (d === "up" || d === "down") vi.current.z = 0;
    if (d === "left" || d === "right") vi.current.x = 0;
  };
  const B = ({ d, icon }: { d: string; icon: React.ReactNode }) => (
    <button onPointerDown={() => press(d)} onPointerUp={() => release(d)} onPointerLeave={() => release(d)}
      className="w-11 h-11 bg-white/85 backdrop-blur-md border border-black/8 shadow-sm flex items-center justify-center text-black/40 active:bg-black/5 active:text-black transition-colors select-none touch-none rounded-xl">
      {icon}
    </button>
  );
  return (
    <div className="absolute bottom-5 left-5 pointer-events-auto z-20 select-none">
      <div className="flex flex-col items-center gap-1">
        <B d="up" icon={<ChevronUp size={18} />} />
        <div className="flex gap-1">
          <B d="left" icon={<ChevronLeft size={18} />} />
          <div className="w-11 h-11 bg-white/40 backdrop-blur-md border border-black/8 shadow-sm flex items-center justify-center text-black/30 rounded-xl">
            <User size={14} />
          </div>
          <B d="right" icon={<ChevronRight size={18} />} />
        </div>
        <B d="down" icon={<ChevronDown size={18} />} />
      </div>
      <p className="mt-1.5 text-center text-black/15 text-[7px] tracking-[0.15em] uppercase">WASD/Arrows · Shift=Run</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════ */
export default function GalleryExperience() {
  const { setCurrentView, setSelectedArtwork, avatarGender, setAvatarGender } = useStore();
  const { paintings } = usePaintings();
  const galleryArt = useMemo(() => selectGallery(paintings, SPOTS.length), [paintings]);
  const posRef = useRef({ x: 0, z: 15 });
  const rotY = useRef(0);
  const camX = useRef(0);
  const camY = useRef(0.18);
  const vi = useRef({ x: 0, z: 0, sprint: false });
  const keys = useKeyboard();

  const [im, setIm] = useState(false);
  const [ir, setIr] = useState(false);
  const [near, setNear] = useState<number | null>(null);
  const [panel, setPanel] = useState(false);
  const [pidx, setPidx] = useState(0);
  const [showEntryScreen, setShowEntryScreen] = useState(true);
  const [pendingGender, setPendingGender] = useState<"male" | "female">(avatarGender || "male");
  const [sensitivity, setSensitivity] = useState(5);
  const sensRef = useRef(0.005);
  useEffect(() => { sensRef.current = 0.002 + sensitivity * 0.0012; }, [sensitivity]);

  const drag = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const onDown = useCallback((e: React.PointerEvent) => { drag.current = true; last.current = { x: e.clientX, y: e.clientY }; }, []);
  const onMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - last.current.x; const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    rotY.current -= dx * sensRef.current;
    camY.current = Math.max(-0.5, Math.min(0.5, camY.current + dy * sensRef.current));
  }, []);
  const onUp = useCallback(() => { drag.current = false; }, []);
  const onWheel = useCallback((e: React.WheelEvent) => {
    camY.current = Math.max(-0.5, Math.min(0.5, camY.current + e.deltaY * 0.001));
  }, []);

  const onMoveCb = useCallback((m: boolean, r: boolean) => { setIm(m); setIr(r); }, []);
  const onApproach = useCallback((i: number, c: boolean) => { if (c) setNear(i); else setNear(p => p === i ? null : p); }, []);
  const openPanel = useCallback(() => { if (near !== null) { setPidx(near); setPanel(true); } }, [near]);
  const viewProduct = useCallback(() => { const a = galleryArt[pidx]; if (a) setSelectedArtwork(a); setCurrentView("product"); }, [pidx, galleryArt, setSelectedArtwork, setCurrentView]);
  const goTo = useCallback((i: number) => {
    const s = SPOTS[i]; if (!s) return;
    const ox = Math.sin(s[3]) * 4; const oz = Math.cos(s[3]) * 4;
    const [nx, nz] = clamp(s[0] + ox, s[2] + oz);
    posRef.current = { x: nx, z: nz };
    rotY.current = s[3] + Math.PI;
  }, []);

  return (
    <section className="h-screen w-full bg-[#f4f0ea] relative overflow-hidden select-none"
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}>

      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 2.5, 30], fov: 60 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
          dpr={[1, 1.5]} shadows>
          <color attach="background" args={["#f4f0ea"]} />
          <Scene posRef={posRef} rotY={rotY} isMoving={im} isRunning={ir} isFemale={avatarGender === "female"}
            camX={camX} camY={camY} keys={keys} vi={vi} onMove={onMoveCb} onApproach={onApproach} galleryArt={galleryArt} />
        </Canvas>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 100px rgba(0,0,0,0.05)" }} />

        {/* Top bar */}
        <div className="absolute top-4 left-5 right-5 flex items-start justify-between pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-xl px-4 py-2.5 border border-black/5 shadow-sm">
            <p className="text-black/25 text-[9px] tracking-[0.35em] uppercase font-medium">Yashika's — Virtual Museum</p>
            <h2 className="text-black/70 text-sm md:text-base font-light tracking-tight mt-0.5">{near !== null ? SPOTS[near]?.[5] ?? "Gallery" : "Explore the Gallery"}</h2>
          </div>

          {/* Gender toggle */}
          <div className="flex items-center gap-2">
            <button onClick={() => setAvatarGender(avatarGender === "female" ? "male" : "female")}
              className="h-9 px-3 bg-white/80 backdrop-blur-md border border-black/5 shadow-sm rounded-xl flex items-center gap-2 text-black/40 hover:text-black text-[10px] tracking-wider uppercase transition-colors"
              title={avatarGender === "female" ? "Switch to Male" : "Switch to Female"}>
              <User size={13} />
              <span className="hidden sm:inline">{avatarGender === "female" ? "Female" : "Male"}</span>
            </button>
          </div>
        </div>

        {/* Painting prompt */}
        {near !== null && !panel && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-24 md:bottom-20 pointer-events-auto">
            <button onClick={openPanel} className="px-6 py-3 bg-white/90 backdrop-blur-xl border border-black/8 shadow-lg text-black/60 text-[11px] tracking-[0.15em] uppercase flex items-center gap-3 hover:bg-white transition-colors rounded-xl animate-pulse">
              <Maximize2 size={14} />View "{galleryArt[near]?.title ?? "Artwork"}"</button>
          </div>
        )}

        <Controls vi={vi} />
        <div className="absolute top-16 right-4 pointer-events-auto"><Minimap posRef={posRef} rotY={rotY} near={near} /></div>

        <div className="absolute bottom-5 right-4 pointer-events-none">
          <div className="bg-white/70 backdrop-blur-md border border-black/5 shadow-sm px-3 py-1.5 flex items-center gap-2 rounded-lg">
            <MapPin size={10} className="text-black/25" /><span className="text-black/30 text-[9px] tracking-wider">{ir ? "Running" : im ? "Walking" : "Idle"}</span></div>
        </div>

        <div className="absolute top-16 left-5 hidden lg:block pointer-events-auto">
          <div className="bg-white/85 backdrop-blur-md border border-black/5 shadow-sm p-3 w-44 rounded-xl">
            <p className="text-black/25 text-[8px] tracking-[0.3em] uppercase font-medium mb-2">Navigate To</p>
            <div className="space-y-0.5 max-h-52 overflow-y-auto">
              {SPOTS.map(([,,,,, room], i) => {
                if (i >= galleryArt.length) return null;
                const a = galleryArt[i];
                return (
                  <button key={i} onClick={() => goTo(i)} className={`w-full text-left px-2 py-1.5 text-[9px] tracking-wider rounded-md transition-colors ${near === i ? "text-black bg-black/5" : "text-black/30 hover:bg-black/3 hover:text-black/50"}`}>
                    <span className="block truncate">{a.title}</span><span className="text-black/15">{room}</span></button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {panel && galleryArt[pidx] && <InfoPanel art={galleryArt[pidx]} onClose={() => setPanel(false)} onProduct={viewProduct} />}

      {/* Entry Screen Overlay — black themed */}
      {showEntryScreen && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center p-6 overflow-y-auto">
          {/* Soft radial glow backdrop */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.06), transparent 60%)" }} />

          <div className="relative w-full max-w-2xl py-10">
            <div className="text-center mb-10">
              <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-3">Yashika's Virtual Museum</p>
              <h1 className="text-white text-3xl md:text-5xl font-light tracking-tight mb-4">Welcome to the Gallery</h1>
              <p className="text-white/40 text-sm max-w-md mx-auto">Choose your visitor, then step inside.</p>
            </div>

            {/* Character selection */}
            <div className="flex gap-4 justify-center mb-8">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setPendingGender(g)}
                  className={`group w-36 md:w-48 p-5 border rounded-2xl transition-all ${
                    pendingGender === g
                      ? "border-white/40 bg-white/[0.06] shadow-lg"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                    pendingGender === g ? "bg-white/10" : "bg-white/5"
                  }`}>
                    <User size={28} className={pendingGender === g ? "text-white" : "text-white/40"} />
                  </div>
                  <h3 className="text-white text-base font-light tracking-tight capitalize">{g} Visitor</h3>
                </button>
              ))}
            </div>

            {/* Mouse sensitivity */}
            <div className="max-w-sm mx-auto mb-8">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <p className="text-white/30 text-[9px] tracking-[0.25em] uppercase mb-2">Mouse Sensitivity</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={1} max={10} value={sensitivity}
                    onChange={(e) => setSensitivity(parseInt(e.target.value))}
                    className="flex-1 accent-white"
                  />
                  <span className="text-white/60 text-xs w-5 text-center">{sensitivity}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-8">
              <p className="text-white/30 text-[9px] tracking-[0.25em] uppercase mb-3">Movement Controls</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  ["W / ↑", "Forward"], ["S / ↓", "Backward"],
                  ["A / ←", "Left"], ["D / →", "Right"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <kbd className="inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs mb-1">{key}</kbd>
                    <p className="text-white/40 text-[9px] tracking-wider uppercase">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-[10px] text-center mt-4">
                Hold <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-white/60">Shift</kbd> to run · Drag mouse to look around · Click paintings to view details
              </p>
            </div>

            {/* Enter buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setAvatarGender(pendingGender);
                  setShowEntryScreen(false);
                }}
                className="px-10 py-4 bg-white text-black text-xs tracking-[0.25em] uppercase font-medium hover:bg-white/90 transition-colors rounded-xl"
              >
                Enter Gallery
              </button>
              <button
                onClick={() => {
                  setAvatarGender(pendingGender);
                  setShowEntryScreen(false);
                  document.documentElement.requestFullscreen?.().catch(() => {});
                }}
                className="px-10 py-4 border border-white/15 text-white/60 text-xs tracking-[0.25em] uppercase hover:border-white/40 hover:text-white transition-colors rounded-xl"
              >
                Enter Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
