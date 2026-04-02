"use client";

import {
  useRef,
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
  MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Html,
  Line,
  AdaptiveDpr,
} from "@react-three/drei";
import * as THREE from "three";
import { useSimulationStore } from "@/store/simulation";
import { generateFullTrajectory, getMoonPosition } from "@/lib/orbital";
import { formatDistance } from "@/lib/format";
import { Vec3 } from "@/config/types";

// Scale: 1 THREE unit = 10,000 km
const SCALE = 1 / 10_000;
const EARTH_RADIUS = 6371 * SCALE;
const MOON_RADIUS = 1737 * SCALE;

function toScaled(v: Vec3): [number, number, number] {
  return [v.x * SCALE, v.z * SCALE, -v.y * SCALE];
}

const FULL_TRAJECTORY = generateFullTrajectory(600);

// Load texture safely — returns null if file doesn't exist
function useOptionalTexture(path: string): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (tex) => setTexture(tex),
      undefined,
      () => {} // silently ignore load errors (missing file)
    );
  }, [path]);

  return texture;
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useOptionalTexture("/textures/earth.jpg");

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        color={texture ? undefined : "#1a6fa0"}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

function Moon({ met }: { met: number }) {
  const moonPos = getMoonPosition(met);
  const pos = toScaled(moonPos);
  const texture = useOptionalTexture("/textures/moon.jpg");

  return (
    <mesh position={pos}>
      <sphereGeometry args={[MOON_RADIUS, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        color={texture ? undefined : "#8a8a8a"}
        roughness={0.95}
      />
    </mesh>
  );
}

function TrajectoryPath({ met }: { met: number }) {
  const allPoints = useMemo(
    () => FULL_TRAJECTORY.map((p) => new THREE.Vector3(...toScaled(p.position))),
    []
  );

  const splitIdx = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < FULL_TRAJECTORY.length; i++) {
      if (FULL_TRAJECTORY[i].met <= met) idx = i;
      else break;
    }
    return Math.max(1, idx);
  }, [met]);

  const pastPoints = allPoints.slice(0, splitIdx + 1);
  const futurePoints = allPoints.slice(splitIdx);

  return (
    <>
      {pastPoints.length >= 2 && (
        <Line points={pastPoints} color="#00b4d8" lineWidth={1.5} opacity={0.85} transparent />
      )}
      {futurePoints.length >= 2 && (
        <Line
          points={futurePoints}
          color="#00b4d8"
          lineWidth={1}
          opacity={0.2}
          transparent
          dashed
          dashSize={0.3}
          gapSize={0.2}
        />
      )}
    </>
  );
}

function OrionMarker({ position }: { position: Vec3 }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const pos = toScaled(position);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 2) * 0.5;
    }
  });

  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={1.5} />
      </mesh>
      <pointLight ref={lightRef} color="#ff6b35" intensity={2} distance={5} />
    </group>
  );
}

function DistanceLabels({ position, met }: { position: Vec3; met: number }) {
  const moonPos = getMoonPosition(met);
  const orionPos = toScaled(position);
  const moonScaled = toScaled(moonPos);

  const distToEarth = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
  const distToMoon = Math.sqrt(
    (position.x - moonPos.x) ** 2 +
      (position.y - moonPos.y) ** 2 +
      (position.z - moonPos.z) ** 2
  );

  const earthMid: [number, number, number] = [
    orionPos[0] / 2,
    orionPos[1] / 2 + 0.3,
    orionPos[2] / 2,
  ];
  const moonMid: [number, number, number] = [
    (orionPos[0] + moonScaled[0]) / 2,
    (orionPos[1] + moonScaled[1]) / 2 + 0.3,
    (orionPos[2] + moonScaled[2]) / 2,
  ];

  return (
    <>
      <Html position={earthMid} center>
        <div
          style={{
            fontSize: "11px",
            color: "rgba(0,180,216,0.8)",
            background: "rgba(0,0,0,0.5)",
            padding: "2px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          {formatDistance(distToEarth)} to Earth
        </div>
      </Html>
      <Html position={moonMid} center>
        <div
          style={{
            fontSize: "11px",
            color: "rgba(252,163,17,0.8)",
            background: "rgba(0,0,0,0.5)",
            padding: "2px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          {formatDistance(distToMoon)} to Moon
        </div>
      </Html>
    </>
  );
}

// Internal handle exposed from within the Canvas
interface InternalHandle {
  focusEarth: () => void;
  focusMoon: () => void;
  focusOrion: () => void;
}

function CameraController({
  handleRef,
  metRef,
  positionRef,
}: {
  handleRef: MutableRefObject<InternalHandle | null>;
  metRef: MutableRefObject<number>;
  positionRef: MutableRefObject<Vec3>;
}) {
  const { camera } = useThree();

  useImperativeHandle(handleRef, () => ({
    focusEarth: () => {
      camera.position.set(2, 1.5, 4);
      camera.lookAt(0, 0, 0);
    },
    focusMoon: () => {
      const moonPos = getMoonPosition(metRef.current);
      const [mx, my, mz] = toScaled(moonPos);
      camera.position.set(mx + 3, my + 2, mz + 4);
      camera.lookAt(mx, my, mz);
    },
    focusOrion: () => {
      const [ox, oy, oz] = toScaled(positionRef.current);
      camera.position.set(ox + 2, oy + 1, oz + 3);
      camera.lookAt(ox, oy, oz);
    },
  }));

  return null;
}

export interface SceneHandle {
  focusEarth: () => void;
  focusMoon: () => void;
  focusOrion: () => void;
}

const OrbitScene = forwardRef<SceneHandle>((_, ref) => {
  const internalRef = useRef<InternalHandle | null>(null);
  const metRef = useRef(0);
  const positionRef = useRef<Vec3>({ x: 6571, y: 0, z: 0 });

  // Subscribe to store
  const { position, met } = useSimulationStore();
  metRef.current = met;
  positionRef.current = position;

  useImperativeHandle(ref, () => ({
    focusEarth: () => internalRef.current?.focusEarth(),
    focusMoon: () => internalRef.current?.focusMoon(),
    focusOrion: () => internalRef.current?.focusOrion(),
  }));

  return (
    <Canvas
      camera={{ position: [20, 15, 55], fov: 40 }}
      gl={{ antialias: true }}
      className="w-full h-full"
    >
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.15} />
      <directionalLight position={[100, 50, 0]} intensity={1.8} color="#fff5e0" />

      <Stars radius={200} depth={60} count={3000} factor={4} fade />

      <Earth />
      <Moon met={met} />

      <TrajectoryPath met={met} />
      <OrionMarker position={position} />
      <DistanceLabels position={position} met={met} />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={1}
        maxDistance={120}
        enablePan
      />

      <CameraController
        handleRef={internalRef}
        metRef={metRef}
        positionRef={positionRef}
      />
    </Canvas>
  );
});

OrbitScene.displayName = "OrbitScene";

export default OrbitScene;
