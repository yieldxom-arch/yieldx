// The study journey as a living miniature of a Nizwa valley.
// Loaded lazily; only rendered when WebGL is available.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Html, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, N8AO, SMAA, TiltShift2, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Boxes, Building2, Coins, FileText, Layers, Settings2, Shield, Store, Users } from 'lucide-react';
import { VALLEY_LEVELS } from './oasisData';
import { SPOTS, heightAt } from './valley/world';
import { Falaj, GardenWalls, Ground, Palms, Scrub, Waters } from './valley/Nature';
import { Fort, Houses, Road, Shop, Souq, Watchtower, Workshop } from './valley/Town';
import { Camels, Fireworks, ParkedCars, People, Traffic } from './valley/Life';

export type StationStatus = 'locked' | 'active' | 'done';

export interface StationState {
  levelId: number;
  status: StationStatus;
  progress: number; // 0..1
  title: string;
}

export type TimeOfDay = 'day' | 'dusk' | 'night';

export interface ValleySceneProps {
  stations: StationState[];
  selected: number | null;
  onSelect: (levelId: number) => void;
  fresh: number | null;
  timeOfDay: TimeOfDay;
  isAr: boolean;
  businessName: string;
  resetSignal: number;
  zoomSignal: number; // positive count of zoom presses; sign of last press below
  zoomDir: 1 | -1;
}

const ICONS = [Layers, Building2, Shield, Settings2, Boxes, Users, Coins, Store];
const OVERVIEW = { pos: [15, 31, 47] as const, target: [1.5, -1.0, 0.8] as const };
const FLY_DELAY = 1.5;

function spotOf(levelId: number) {
  const lv = VALLEY_LEVELS.find(l => l.levelId === levelId)!;
  const p = SPOTS[lv.spot];
  const ground = heightAt(p.x, p.y);
  return { x: p.x, z: p.y, ground, markerY: ground + lv.markerY };
}

// ─── Level markers ─────────────────────────────────────────────────────────────

function Marker({ state, selected, onSelect, isAr }: { state: StationState; selected: boolean; onSelect: (id: number) => void; isAr: boolean }) {
  const [hover, setHover] = useState(false);
  const { x, z, ground, markerY } = useMemo(() => spotOf(state.levelId), [state.levelId]);
  const Icon = state.levelId >= 0 ? ICONS[state.levelId] : FileText;
  const showLabel = selected || hover || state.status === 'active';
  const pct = Math.round(state.progress * 100);
  const ring = 2 * Math.PI * 17;
  const color = state.status === 'done' ? '#10b981' : state.status === 'active' ? '#f59e0b' : '#94a3b8';
  return (
    <group>
      <mesh position={[x, (ground + markerY - 0.25) / 2, z]}>
        <cylinderGeometry args={[0.012, 0.012, markerY - ground - 0.25, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
      <mesh position={[x, ground + 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.14, 0.2, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      <Html position={[x, markerY, z]} center zIndexRange={[30, 0]}>
        <button
          type="button"
          dir={isAr ? 'rtl' : 'ltr'}
          onClick={() => onSelect(state.levelId)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          title={state.title}
          className="flex items-center gap-1.5 select-none"
          style={{ transform: selected ? 'scale(1.12)' : undefined, transition: 'transform .2s' }}
        >
          <span className="relative grid place-items-center w-10 h-10 rounded-full shadow-lg" style={{ background: 'rgba(255,255,255,.95)' }}>
            <svg viewBox="0 0 40 40" className="absolute inset-0 w-10 h-10 -rotate-90">
              <circle cx="20" cy="20" r="17" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="20"
                cy="20"
                r="17"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={ring}
                strokeDashoffset={ring * (1 - (state.status === 'done' ? 1 : state.progress))}
              />
            </svg>
            <Icon className="w-4 h-4" style={{ color: state.status === 'locked' ? '#94a3b8' : '#0f766e' }} />
            <span
              className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold grid place-items-center text-white"
              style={{ background: color }}
            >
              {state.levelId >= 0 ? state.levelId : '★'}
            </span>
          </span>
          {showLabel && (
            <span className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold shadow-md" style={{ background: 'rgba(255,255,255,.95)', color: '#0f172a' }}>
              {state.title}
              {state.status === 'active' && pct > 0 ? ` · ${pct}%` : ''}
            </span>
          )}
        </button>
      </Html>
    </group>
  );
}

// ─── Camera ────────────────────────────────────────────────────────────────────

function CameraRig({
  selected,
  fresh,
  resetSignal,
  zoomSignal,
  zoomDir,
}: {
  selected: number | null;
  fresh: number | null;
  resetSignal: number;
  zoomSignal: number;
  zoomDir: 1 | -1;
}) {
  const ref = useRef<CameraControls>(null);
  const first = useRef(true);

  const fly = (levelId: number, smooth = true) => {
    const s = spotOf(levelId);
    const ty = s.ground + 0.6;
    ref.current?.setLookAt(s.x + 7, ty + 9.5, s.z + 13, s.x, ty, s.z, smooth);
  };
  const overview = (smooth = true) => ref.current?.setLookAt(...OVERVIEW.pos, ...OVERVIEW.target, smooth);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.mouseButtons.wheel = 0; // don't capture page scrolling
    ref.current.mouseButtons.right = 0;
    ref.current.touches.two = 0;
    ref.current.minDistance = 5;
    ref.current.maxDistance = 85;
    ref.current.minPolarAngle = 0.3;
    ref.current.maxPolarAngle = 1.22;
    ref.current.smoothTime = 0.55;
    overview(false);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (fresh !== null) setTimeout(() => fly(fresh), 500);
      return;
    }
    if (selected !== null) fly(selected);
  }, [selected]);

  useEffect(() => {
    if (resetSignal > 0) overview();
  }, [resetSignal]);

  useEffect(() => {
    if (zoomSignal > 0) ref.current?.dolly(zoomDir * 5, true);
  }, [zoomSignal]);

  return <CameraControls ref={ref} makeDefault />;
}

// ─── Lighting per time of day ──────────────────────────────────────────────────

const LIGHT = {
  day: { sun: [-18, 15, 14], sunColor: '#ffd49e', sunI: 3.6, sky: '#c4dbf5', ground: '#a8774a', hemiI: 0.62, fog: '#f0d8b0', env: 0.4 },
  dusk: { sun: [-24, 8, 9], sunColor: '#ff9b5a', sunI: 2.4, sky: '#8f86c9', ground: '#7a523d', hemiI: 0.55, fog: '#7d5a63', env: 0.35 },
  night: { sun: [16, 20, -6], sunColor: '#9fb6ff', sunI: 0.55, sky: '#2b3566', ground: '#1b1622', hemiI: 0.3, fog: '#151a35', env: 0.12 },
} as const;

function SceneEnv({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const { scene } = useThree();
  useEffect(() => {
    (scene as any).environmentIntensity = LIGHT[timeOfDay].env;
  }, [scene, timeOfDay]);
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={timeOfDay === 'night' ? 0.6 : 2.2} color={timeOfDay === 'day' ? '#fff0d6' : timeOfDay === 'dusk' ? '#ffb27a' : '#7d8cff'} position={[-10, 9, 8]} scale={[18, 7, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.2} color={timeOfDay === 'night' ? '#30407a' : '#cfe3ff'} position={[10, 12, -12]} scale={[22, 8, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 16, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
    </Environment>
  );
}

// ─── Scene ─────────────────────────────────────────────────────────────────────

export default function ValleyScene({ stations, selected, onSelect, fresh, timeOfDay, isAr, businessName, resetSignal, zoomSignal, zoomDir }: ValleySceneProps) {
  const [quality, setQuality] = useState<'high' | 'low'>(() =>
    typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) <= 4 ? 'low' : 'high'
  );
  const done = useMemo(() => Array.from({ length: 8 }, (_, i) => stations.find(s => s.levelId === i)?.status === 'done'), [stations]);
  const final = done.every(Boolean);
  const night = timeOfDay === 'night';
  const lampsOn = night || timeOfDay === 'dusk';
  const green = 0.12 + (done[0] ? 0.28 : 0) + (done[6] ? 0.6 : 0);
  const anim = (lv: number) => fresh === lv;
  const L = LIGHT[timeOfDay];
  const traffic = (done[3] ? 1 : 0) + (done[7] ? 3 : 0);

  return (
    <Canvas
      shadows="soft"
      dpr={quality === 'high' ? [1, 1.75] : [0.8, 1.1]}
      camera={{ fov: 30, position: [...OVERVIEW.pos], near: 0.5, far: 220 }}
      gl={{ antialias: quality === 'low', alpha: true, powerPreference: 'high-performance' }}
      flat={quality === 'high'}
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} flipflops={2} />
      <fog attach="fog" args={[L.fog, 48, 120]} />
      <hemisphereLight args={[L.sky, L.ground, L.hemiI]} />
      <directionalLight
        position={L.sun as unknown as [number, number, number]}
        color={L.sunColor}
        intensity={L.sunI}
        castShadow
        shadow-mapSize={quality === 'high' ? [4096, 4096] : [2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <SceneEnv timeOfDay={timeOfDay} />

      <Ground green={green} />
      <Scrub />
      <GardenWalls />
      <Palms lush={done[6]} animate={anim(6)} delay={FLY_DELAY} />
      <Falaj flowing={done[0]} animate={anim(0)} delay={FLY_DELAY} />
      <Waters spring={done[0]} pools={done[6]} animate={anim(0) || anim(6)} delay={FLY_DELAY} />

      <Houses night={night} />
      <Fort open={done[2]} animate={anim(2)} delay={FLY_DELAY} night={night} />
      <Watchtower beacon={final} />
      <Souq busy={done[7]} animate={anim(7)} delay={FLY_DELAY} night={night} />
      <Shop open={done[1]} animate={anim(1)} delay={FLY_DELAY} name={businessName} night={night} />
      <Workshop built={done[4]} animate={anim(4)} delay={FLY_DELAY} night={night} />
      <Road paved={done[3]} animate={anim(3)} delay={FLY_DELAY} lampsOn={lampsOn} />

      <People levelsDone={done} fresh={fresh} delay={FLY_DELAY} />
      {traffic > 0 && <Traffic count={traffic} lights={lampsOn} />}
      <ParkedCars show={done[7]} />
      <Camels />
      {final && <Fireworks />}

      {stations.map(s => (
        <Marker key={s.levelId} state={s} selected={selected === s.levelId} onSelect={onSelect} isAr={isAr} />
      ))}

      <CameraRig selected={selected} fresh={fresh} resetSignal={resetSignal} zoomSignal={zoomSignal} zoomDir={zoomDir} />

      {quality === 'high' && (
        <EffectComposer multisampling={0}>
          <N8AO halfRes aoRadius={1.1} distanceFalloff={0.6} intensity={2.2} quality="medium" />
          <Bloom mipmapBlur luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={night ? 1.1 : 0.45} />
          <TiltShift2 blur={0.09} taper={0.55} />
          <Vignette offset={0.32} darkness={0.42} />
          <SMAA />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

