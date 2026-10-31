// The study journey as a living miniature of a Nizwa valley.
// Loaded lazily; only rendered when WebGL is available.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Html, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, N8AO, SMAA, TiltShift2, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Boxes, Building2, Check, Coins, FileText, Layers, Lock, Settings2, Shield, Star, Store, Users } from 'lucide-react';
import { VALLEY_LEVELS } from './oasisData';
import { SPOTS, heightAt } from './valley/world';
import { Falaj, GardenWalls, Ground, Palms, Scrub, Waters } from './valley/Nature';
import { Fort, Houses, Road, Shop, Souq, Watchtower, Workshop } from './valley/Town';
import { Camels, Fireworks, ParkedCars, People, Traffic } from './valley/Life';
import { CurrentRing, Trail, type SegmentState } from './valley/Trail';

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
  /** The level the user should do next (null when everything is done). */
  current: number | null;
  /** Where the mission card covers the map, so the camera can frame around it. */
  panelSide: 'left' | 'right' | 'none';
}

const ICONS = [Layers, Building2, Shield, Settings2, Boxes, Users, Coins, Store];
const OVERVIEW = { pos: [16, 33, 50] as const, target: [1.5, -1.0, 0.8] as const };
const FLY_DELAY = 1.5;

function spotOf(levelId: number) {
  const lv = VALLEY_LEVELS.find(l => l.levelId === levelId)!;
  const p = SPOTS[lv.spot];
  const ground = heightAt(p.x, p.y);
  return { x: p.x, z: p.y, ground, markerY: ground + lv.markerY };
}

// ─── Level markers ─────────────────────────────────────────────────────────────

const PALETTE = { palm: '#174D3B', falaj: '#239C91', sand: '#D7B889', terracotta: '#A76542', limestone: '#F4F0E7', charcoal: '#252C2A', gold: '#C9A227' };

function Marker({ state, selected, current, onSelect, isAr }: { state: StationState; selected: boolean; current: boolean; onSelect: (id: number) => void; isAr: boolean }) {
  const [hover, setHover] = useState(false);
  const { x, z, ground, markerY } = useMemo(() => spotOf(state.levelId), [state.levelId]);
  const Icon = state.levelId >= 0 ? ICONS[state.levelId] : FileText;
  const showLabel = selected || hover;
  const done = state.status === 'done';
  const locked = state.status === 'locked' && !current;
  const size = current ? 46 : done ? 34 : 28;
  const ring = 2 * Math.PI * 20;
  const bg = current ? PALETTE.falaj : done ? PALETTE.palm : 'rgba(37,44,42,.72)';
  return (
    <group>
      <mesh position={[x, (ground + markerY - 0.25) / 2, z]}>
        <cylinderGeometry args={[0.012, 0.012, markerY - ground - 0.25, 6]} />
        <meshBasicMaterial color={current ? '#ffe2a0' : '#ffffff'} transparent opacity={locked ? 0.25 : 0.5} />
      </mesh>
      <Html position={[x, markerY, z]} center zIndexRange={[30, 0]}>
        <button
          type="button"
          dir={isAr ? 'rtl' : 'ltr'}
          onClick={() => onSelect(state.levelId)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={state.title}
          className="flex items-center gap-2 select-none"
          style={{ transform: selected ? 'scale(1.1)' : undefined, transition: 'transform .2s' }}
        >
          <span className="relative grid place-items-center rounded-full" style={{ width: size, height: size }}>
            {current && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(201,162,39,.45)' }} />}
            <span
              className="relative grid place-items-center rounded-full"
              style={{
                width: size,
                height: size,
                background: bg,
                border: `2px solid ${current ? PALETTE.gold : done ? '#9fe0c9' : 'rgba(244,240,231,.55)'}`,
                boxShadow: current ? '0 0 0 4px rgba(201,162,39,.25), 0 6px 18px rgba(35,156,145,.55)' : selected ? '0 0 0 3px rgba(244,240,231,.9)' : '0 3px 10px rgba(0,0,0,.35)',
              }}
            >
              {current && state.progress > 0 && (
                <svg viewBox="0 0 46 46" className="absolute inset-0 -rotate-90" style={{ width: size, height: size }}>
                  <circle cx="23" cy="23" r="20" fill="none" stroke="#ffe7a3" strokeWidth="3" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - state.progress)} />
                </svg>
              )}
              {done ? (
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              ) : locked ? (
                <Lock className="w-3.5 h-3.5" style={{ color: PALETTE.limestone }} />
              ) : state.levelId === -1 ? (
                <Star className="w-5 h-5 text-white" />
              ) : (
                <Icon className="w-5 h-5 text-white" />
              )}
              <span
                className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold grid place-items-center"
                style={{ background: PALETTE.limestone, color: PALETTE.charcoal, border: `1px solid ${PALETTE.sand}` }}
              >
                {state.levelId >= 0 ? state.levelId : '★'}
              </span>
            </span>
          </span>
          {showLabel && (
            <span
              className="whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold shadow-lg"
              style={{ background: 'rgba(244,240,231,.96)', color: PALETTE.charcoal, border: `1px solid ${PALETTE.sand}`, fontFamily: isAr ? '"Noto Kufi Arabic", sans-serif' : undefined }}
            >
              {state.title}
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
  panelSide,
}: {
  selected: number | null;
  fresh: number | null;
  resetSignal: number;
  zoomSignal: number;
  zoomDir: 1 | -1;
  panelSide: 'left' | 'right' | 'none';
}) {
  const ref = useRef<CameraControls>(null);
  const first = useRef(true);
  // shift the view away from the mission card so the valley stays visible
  const shift = panelSide === 'left' ? -1 : panelSide === 'right' ? 1 : 0;

  const fly = (levelId: number, smooth = true) => {
    const s = spotOf(levelId);
    const ty = s.ground + 0.6;
    ref.current?.setFocalOffset(shift * 3.4, 0, 0, smooth);
    ref.current?.setLookAt(s.x + 8.5, ty + 12, s.z + 16, s.x, ty, s.z, smooth);
  };
  const overview = (smooth = true) => {
    ref.current?.setFocalOffset(shift * 8.5, 0, 0, smooth);
    ref.current?.setLookAt(...OVERVIEW.pos, ...OVERVIEW.target, smooth);
  };

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

export default function ValleyScene({ stations, selected, onSelect, fresh, timeOfDay, isAr, businessName, resetSignal, zoomSignal, zoomDir, current, panelSide }: ValleySceneProps) {
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
  const zoneStates = useMemo(
    // 2 finished, 1 current, 3 open but not current, 0 locked
    () => Array.from({ length: 8 }, (_, i) => (done[i] ? 2 : current === i ? 1 : stations.find(s => s.levelId === i)?.status === 'active' ? 3 : 0)),
    [done, stations, current]
  );
  const segments: SegmentState[] = useMemo(() => {
    const stopDone = [...done, final];
    return Array.from({ length: 8 }, (_, k) => (stopDone[k + 1] ? 'done' : stopDone[k] ? 'current' : 'locked'));
  }, [done, final, current]);
  const currentSpot = current !== null ? spotOf(current) : null;

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

      <Ground green={green} zoneStates={zoneStates} />
      <Trail segments={segments} />
      {currentSpot && <CurrentRing x={currentSpot.x} z={currentSpot.z} />}
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
        <Marker key={s.levelId} state={s} selected={selected === s.levelId} current={current === s.levelId} onSelect={onSelect} isAr={isAr} />
      ))}

      <CameraRig selected={selected} fresh={fresh} resetSignal={resetSignal} zoomSignal={zoomSignal} zoomDir={zoomDir} panelSide={panelSide} />

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

