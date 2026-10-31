// 3D Omani oasis: one platform per level, joined by a falaj that fills with
// water as levels are finished. Locked places are shown as pale plans, places
// in progress are partly built, finished places come alive with people.
//
// Loaded lazily (three.js is large), and only when WebGL is available.

import React, { createContext, memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { OASIS_STATIONS, type OasisStation } from './oasisData';

export type StationStatus = 'locked' | 'active' | 'done';

export interface StationState {
  levelId: number;
  status: StationStatus;
  progress: number; // 0..1
  title: string;
}

export interface OasisSceneProps {
  stations: StationState[];
  selected: number | null;
  onSelect: (levelId: number) => void;
  celebrate: number | null;
  isDark: boolean;
  isAr: boolean;
  resetSignal: number; // changes when the user presses "reset view"
  zoomLevel: number; // 0.6..1.8 multiplier
}

const PLATFORM_R = 1.55;
const PLATFORM_H = 0.35;

type Mode = 'ghost' | 'build' | 'done';

/** Material props: pale "plan" for locked places, real colour otherwise. */
function useMat(mode: Mode) {
  return (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    mode === 'ghost'
      ? { color: '#fff7e8', transparent: true, opacity: 0.32, flatShading: true }
      : { color, flatShading: true, ...extra };
}

const BuildCtx = createContext<{ mode: Mode; progress: number }>({ mode: 'done', progress: 1 });

/** Grows in when it should be visible (progress reached its threshold). */
function Piece({
  at = 0,
  children,
  position,
  rotation,
}: {
  at?: number;
  children: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const { mode, progress } = useContext(BuildCtx);
  const ref = useRef<THREE.Group>(null);
  const visible = mode === 'ghost' || mode === 'done' || progress >= at;
  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = visible ? 1 : 0;
    const s = ref.current.scale.x + (target - ref.current.scale.x) * Math.min(1, dt * 6);
    ref.current.scale.setScalar(Math.max(0.0001, s));
    ref.current.visible = s > 0.01;
  });
  return (
    <group ref={ref} position={position} rotation={rotation} scale={visible ? 1 : 0.0001}>
      {children}
    </group>
  );
}

// ─── Small building blocks ────────────────────────────────────────────────────

function Palm({ position = [0, 0, 0] as [number, number, number], scale = 1, mode = 'done' as Mode, lean = 0.12, seed = 0, dates = false }) {
  const m = useMat(mode);
  const fronds = 7;
  return (
    <group position={position} scale={scale} rotation={[0, seed, 0]}>
      <group rotation={[0, 0, lean]}>
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[0, 0.18 + i * 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.06 - i * 0.006, 0.075 - i * 0.006, 0.34, 6]} />
            <meshStandardMaterial {...m(i % 2 ? '#8a6a44' : '#7a5c3a')} />
          </mesh>
        ))}
        <group position={[0, 1.36, 0]}>
          {Array.from({ length: fronds }).map((_, i) => (
            <group key={i} rotation={[0, (i / fronds) * Math.PI * 2, 0]}>
              <mesh position={[0.34, -0.06, 0]} rotation={[0, 0, -0.55]} castShadow>
                <boxGeometry args={[0.72, 0.03, 0.16]} />
                <meshStandardMaterial {...m(i % 2 ? '#3f8f3a' : '#4fa244')} />
              </mesh>
            </group>
          ))}
          {dates && mode !== 'ghost' &&
            [0, 1, 2].map(i => (
              <mesh key={i} position={[Math.cos(i * 2.1) * 0.1, -0.12, Math.sin(i * 2.1) * 0.1]}>
                <dodecahedronGeometry args={[0.07, 0]} />
                <meshStandardMaterial color="#c46a1b" flatShading />
              </mesh>
            ))}
        </group>
      </group>
    </group>
  );
}

function Crenellations({ width, depth, y, mode, color }: { width: number; depth: number; y: number; mode: Mode; color: string }) {
  const m = useMat(mode);
  const items: [number, number][] = [];
  const step = 0.22;
  for (let x = -width / 2 + 0.08; x <= width / 2 - 0.05; x += step) {
    items.push([x, -depth / 2 + 0.04], [x, depth / 2 - 0.04]);
  }
  for (let z = -depth / 2 + 0.3; z <= depth / 2 - 0.25; z += step) {
    items.push([-width / 2 + 0.04, z], [width / 2 - 0.04, z]);
  }
  return (
    <group>
      {items.map(([x, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.1, 0.12, 0.1]} />
          <meshStandardMaterial {...m(color)} />
        </mesh>
      ))}
    </group>
  );
}

function RoundTower({ r, h, mode, color, position }: { r: number; h: number; mode: Mode; color: string; position: [number, number, number] }) {
  const m = useMat(mode);
  const teeth = 10;
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.92, r, h, 12]} />
        <meshStandardMaterial {...m(color)} />
      </mesh>
      {Array.from({ length: teeth }).map((_, i) => (
        <mesh key={i} position={[Math.cos((i / teeth) * Math.PI * 2) * r * 0.85, h + 0.06, Math.sin((i / teeth) * Math.PI * 2) * r * 0.85]} castShadow>
          <boxGeometry args={[0.1, 0.12, 0.1]} />
          <meshStandardMaterial {...m(color)} />
        </mesh>
      ))}
    </group>
  );
}

function Camel({ position, rotation = 0, mode }: { position: [number, number, number]; rotation?: number; mode: Mode }) {
  const m = useMat(mode);
  const c = '#c99b5f';
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={0.8}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.5, 0.2, 0.2]} />
        <meshStandardMaterial {...m(c)} />
      </mesh>
      <mesh position={[0, 0.56, 0]} castShadow>
        <sphereGeometry args={[0.12, 6, 5]} />
        <meshStandardMaterial {...m(c)} />
      </mesh>
      <mesh position={[0.3, 0.6, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial {...m(c)} />
      </mesh>
      <mesh position={[0.4, 0.74, 0]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.08]} />
        <meshStandardMaterial {...m(c)} />
      </mesh>
      {[
        [-0.18, -0.06],
        [-0.18, 0.06],
        [0.18, -0.06],
        [0.18, 0.06],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.34, 5]} />
          <meshStandardMaterial {...m(c)} />
        </mesh>
      ))}
    </group>
  );
}

const ROBE_COLORS = ['#f5f3ee', '#f5f3ee', '#efe9dc', '#1f1f24', '#6b3f7a', '#2f5d8a', '#f5f3ee', '#8a3b3b'];

/** A villager walking slowly in a circle around the platform. */
function Villager({ center, radius, speed, phase, index }: { center: [number, number]; radius: number; speed: number; phase: number; index: number }) {
  const ref = useRef<THREE.Group>(null);
  const robe = ROBE_COLORS[index % ROBE_COLORS.length];
  const isWoman = robe === '#1f1f24' || robe === '#6b3f7a' || robe === '#8a3b3b';
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    const x = center[0] + Math.cos(t) * radius;
    const z = center[1] + Math.sin(t) * radius;
    ref.current.position.set(x, PLATFORM_H + 0.42 + Math.abs(Math.sin(t * 6)) * 0.025, z);
    ref.current.rotation.y = -t + (speed > 0 ? Math.PI : 0);
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.1, 0.34, 7]} />
        <meshStandardMaterial color={robe} flatShading />
      </mesh>
      <mesh position={[0, 0.24, 0]} castShadow>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshStandardMaterial color={isWoman ? robe : '#b9825a'} flatShading />
      </mesh>
      {!isWoman && (
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.062, 0.066, 0.05, 8]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
      )}
    </group>
  );
}

// ─── Station props ────────────────────────────────────────────────────────────

const StationProps = memo(function StationProps(props: { station: OasisStation; mode: Mode; progress: number; allDone: boolean; isDark: boolean }) {
  const ctx = useMemo(() => ({ mode: props.mode, progress: props.progress }), [props.mode, props.progress]);
  return (
    <BuildCtx.Provider value={ctx}>
      <StationShapes {...props} />
    </BuildCtx.Provider>
  );
});

function StationShapes({ station, mode, allDone, isDark }: { station: OasisStation; mode: Mode; progress: number; allDone: boolean; isDark: boolean }) {
  const m = useMat(mode);
  const y = PLATFORM_H;
  const mud = '#d8b98a';
  const mudDark = '#b8956a';

  switch (station.levelId) {
    case 0: // the spring
      return (
        <group position={[0, y, 0]}>
          <Piece at={0}>
            <mesh position={[0, 0.06, 0]} receiveShadow>
              <cylinderGeometry args={[0.85, 0.9, 0.1, 14]} />
              <meshStandardMaterial {...m('#a39280')} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.72, 0.72, 0.04, 14]} />
              <meshStandardMaterial {...m('#3fb6c8', { emissive: '#0d4f5a', emissiveIntensity: 0.25 })} />
            </mesh>
          </Piece>
          <Piece at={0.4} position={[0.55, 0, -0.75]}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.24, 0.4, 10]} />
              <meshStandardMaterial {...m('#a8927a')} />
            </mesh>
            {[-0.2, 0.2].map(x => (
              <mesh key={x} position={[x, 0.55, 0]} castShadow>
                <boxGeometry args={[0.05, 0.5, 0.05]} />
                <meshStandardMaterial {...m('#7a5c3a')} />
              </mesh>
            ))}
            <mesh position={[0, 0.8, 0]} castShadow>
              <boxGeometry args={[0.48, 0.05, 0.05]} />
              <meshStandardMaterial {...m('#7a5c3a')} />
            </mesh>
          </Piece>
          <Piece at={0.8}>
            <Palm position={[-0.85, 0, 0.6]} scale={0.8} mode={mode} seed={1} />
          </Piece>
        </group>
      );
    case 1: // your house
      return (
        <group position={[0, y, 0]}>
          <Piece at={0}>
            <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.1, 0.76, 0.9]} />
              <meshStandardMaterial {...m(mud)} />
            </mesh>
          </Piece>
          <Piece at={0.4}>
            <mesh position={[0, 0.8, 0]} castShadow>
              <boxGeometry args={[1.18, 0.08, 0.98]} />
              <meshStandardMaterial {...m(mudDark)} />
            </mesh>
            <mesh position={[0.2, 0.22, 0.46]}>
              <boxGeometry args={[0.24, 0.44, 0.03]} />
              <meshStandardMaterial {...m('#6b4423')} />
            </mesh>
            {[-0.3, 0.45].map(x => (
              <mesh key={x} position={[x, 0.5, 0.46]}>
                <boxGeometry args={[0.16, 0.16, 0.03]} />
                <meshStandardMaterial {...m('#3d2a1a')} />
              </mesh>
            ))}
          </Piece>
          <Piece at={0.7}>
            <mesh position={[0.2, 0.52, 0.48]}>
              <boxGeometry args={[0.42, 0.11, 0.03]} />
              <meshStandardMaterial {...m('#2f6f8f', { emissive: '#1d4d66', emissiveIntensity: 0.3 })} />
            </mesh>
            <Palm position={[-0.95, 0, -0.45]} scale={0.75} mode={mode} seed={2} />
          </Piece>
        </group>
      );
    case 2: // the fort
      return (
        <group position={[0, y, 0]}>
          <Piece at={0}>
            <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.25, 0.84, 1.1]} />
              <meshStandardMaterial {...m(mud)} />
            </mesh>
          </Piece>
          <Piece at={0.35}>
            <Crenellations width={1.25} depth={1.1} y={0.9} mode={mode} color={mud} />
            <mesh position={[0, 0.24, 0.56]}>
              <boxGeometry args={[0.3, 0.48, 0.03]} />
              <meshStandardMaterial {...m('#5a3a20')} />
            </mesh>
          </Piece>
          <Piece at={0.65}>
            <RoundTower r={0.36} h={1.35} mode={mode} color={mudDark} position={[0.62, 0, -0.5]} />
          </Piece>
          <Piece at={0.9}>
            <mesh position={[-0.45, 1.25, -0.4]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.7, 4]} />
              <meshStandardMaterial {...m('#5b4a3a')} />
            </mesh>
            <mesh position={[-0.33, 1.48, -0.4]}>
              <boxGeometry args={[0.24, 0.14, 0.02]} />
              <meshStandardMaterial {...m('#7b3fa0')} />
            </mesh>
          </Piece>
        </group>
      );
    case 3: // the workshop
      return (
        <group position={[0, y, 0]}>
          <Piece at={0}>
            <mesh position={[-0.15, 0.32, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.05, 0.64, 0.8]} />
              <meshStandardMaterial {...m('#cdb08a')} />
            </mesh>
            <mesh position={[-0.15, 0.7, 0]} rotation={[0, 0, 0.12]} castShadow>
              <boxGeometry args={[1.2, 0.06, 0.95]} />
              <meshStandardMaterial {...m('#8f9aa3')} />
            </mesh>
          </Piece>
          <Piece at={0.4} position={[0.75, 0, -0.45]}>
            {[-0.12, 0.12].map(x =>
              [-0.12, 0.12].map(z => (
                <mesh key={`${x}${z}`} position={[x, 0.3, z]} castShadow>
                  <boxGeometry args={[0.04, 0.6, 0.04]} />
                  <meshStandardMaterial {...m('#6b6f75')} />
                </mesh>
              ))
            )}
            <mesh position={[0, 0.74, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.3, 10]} />
              <meshStandardMaterial {...m('#e6e8ea')} />
            </mesh>
          </Piece>
          <Piece at={0.75} position={[0.6, 0, 0.6]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.025, 0.9, 5]} />
              <meshStandardMaterial {...m('#3b3b3b')} />
            </mesh>
            <mesh position={[0, 0.92, 0]}>
              <sphereGeometry args={[0.07, 8, 6]} />
              <meshStandardMaterial {...m('#ffd27a', { emissive: '#ffb23a', emissiveIntensity: isDark ? 1.6 : 0.5 })} />
            </mesh>
          </Piece>
        </group>
      );
    case 4: // the storehouse
      return (
        <group position={[0, y, 0]}>
          <Piece at={0}>
            <mesh position={[-0.25, 0.36, -0.2]} castShadow receiveShadow>
              <boxGeometry args={[0.9, 0.72, 0.8]} />
              <meshStandardMaterial {...m(mud)} />
            </mesh>
            <mesh position={[-0.25, 0.2, 0.21]}>
              <boxGeometry args={[0.36, 0.4, 0.02]} />
              <meshStandardMaterial {...m('#5a3a20')} />
            </mesh>
          </Piece>
          <Piece at={0.4} position={[0.55, 0, 0.1]}>
            {[
              [0, 0.1, 0],
              [0.24, 0.1, 0.05],
              [0.1, 0.3, 0.02],
            ].map((p, i) => (
              <mesh key={i} position={p as [number, number, number]} castShadow>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial {...m(i === 2 ? '#a77b48' : '#b98d58')} />
              </mesh>
            ))}
          </Piece>
          <Piece at={0.75}>
            <Camel position={[0.35, 0, 0.75]} rotation={-0.6} mode={mode} />
          </Piece>
        </group>
      );
    case 5: // the majlis
      return (
        <group position={[0, y, 0]}>
          <Piece at={0}>
            <mesh position={[0, 0.02, 0.1]} receiveShadow>
              <boxGeometry args={[1.3, 0.03, 0.9]} />
              <meshStandardMaterial {...m('#a8323a')} />
            </mesh>
            <mesh position={[0, 0.035, 0.1]}>
              <boxGeometry args={[1.1, 0.02, 0.7]} />
              <meshStandardMaterial {...m('#d9a441')} />
            </mesh>
          </Piece>
          <Piece at={0.4}>
            {[
              [-0.6, -0.4],
              [0.6, -0.4],
              [-0.6, 0.55],
              [0.6, 0.55],
            ].map(([x, z], i) => (
              <mesh key={i} position={[x, 0.35, z]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.7, 5]} />
                <meshStandardMaterial {...m('#5b4a3a')} />
              </mesh>
            ))}
            <mesh position={[0, 0.72, 0.07]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[1.36, 0.04, 1.08]} />
              <meshStandardMaterial {...m('#2b2622')} />
            </mesh>
          </Piece>
          <Piece at={0.75} position={[0.05, 0.05, 0.1]}>
            <mesh position={[0, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.07, 0.14, 8]} />
              <meshStandardMaterial {...m('#d4af37', { metalness: 0.6, roughness: 0.3 })} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <coneGeometry args={[0.04, 0.08, 8]} />
              <meshStandardMaterial {...m('#d4af37', { metalness: 0.6, roughness: 0.3 })} />
            </mesh>
          </Piece>
        </group>
      );
    case 6: // the palm grove
      return (
        <group position={[0, y, 0]}>
          {[
            [-0.7, -0.5, 0.95, 0],
            [0.5, -0.7, 0.85, 0.2],
            [0.85, 0.35, 1.0, 0.5],
            [-0.35, 0.65, 0.9, 0.7],
            [0.1, 0.0, 1.05, 0.85],
          ].map(([x, z, s, at], i) => (
            <Piece key={i} at={at}>
              <Palm position={[x, 0, z]} scale={s} mode={mode} seed={i * 1.3} lean={0.1 + i * 0.03} dates={mode === 'done'} />
            </Piece>
          ))}
          <Piece at={0.95} position={[-0.75, 0, 0.45]}>
            <mesh position={[0, 0.1, 0]} castShadow>
              <boxGeometry args={[0.32, 0.2, 0.22]} />
              <meshStandardMaterial {...m('#7a4b26')} />
            </mesh>
            {[0, 1, 2].map(i => (
              <mesh key={i} position={[-0.08 + i * 0.08, 0.23 + (i % 2) * 0.02, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.03, 10]} />
                <meshStandardMaterial {...m('#e8c547', { metalness: 0.7, roughness: 0.25 })} />
              </mesh>
            ))}
          </Piece>
        </group>
      );
    case 7: // the souq
      return (
        <group position={[0, y, 0]}>
          {[
            [-0.55, -0.35, '#c0392b', 0],
            [0.55, -0.35, '#2e86c1', 0.35],
            [0, 0.55, '#27ae60', 0.7],
          ].map(([x, z, color, at], i) => (
            <Piece key={i} at={at as number} position={[x as number, 0, z as number]}>
              {[
                [-0.25, -0.18],
                [0.25, -0.18],
                [-0.25, 0.18],
                [0.25, 0.18],
              ].map(([px, pz], j) => (
                <mesh key={j} position={[px, 0.28, pz]} castShadow>
                  <boxGeometry args={[0.03, 0.56, 0.03]} />
                  <meshStandardMaterial {...m('#6b5a48')} />
                </mesh>
              ))}
              <mesh position={[0, 0.6, 0]} rotation={[0.18, 0, 0]} castShadow>
                <boxGeometry args={[0.62, 0.03, 0.5]} />
                <meshStandardMaterial {...m(color as string)} />
              </mesh>
              <mesh position={[0, 0.18, 0]} castShadow>
                <boxGeometry args={[0.5, 0.12, 0.3]} />
                <meshStandardMaterial {...m('#a0794e')} />
              </mesh>
              {mode !== 'ghost' &&
                [0, 1, 2].map(k => (
                  <mesh key={k} position={[-0.14 + k * 0.14, 0.28, 0]}>
                    <sphereGeometry args={[0.05, 6, 5]} />
                    <meshStandardMaterial color={['#e67e22', '#f1c40f', '#8e44ad'][k]} flatShading />
                  </mesh>
                ))}
            </Piece>
          ))}
        </group>
      );
    default: // the castle
      return (
        <group position={[0, y, 0]}>
          <Piece at={0}>
            <mesh position={[0.1, 0.45, 0.1]} castShadow receiveShadow>
              <boxGeometry args={[1.5, 0.9, 1.3]} />
              <meshStandardMaterial {...m(mud)} />
            </mesh>
            <Crenellations width={1.5} depth={1.3} y={0.96} mode={mode} color={mud} />
          </Piece>
          <Piece at={0}>
            <RoundTower r={0.62} h={1.75} mode={mode} color={mudDark} position={[-0.5, 0, -0.45]} />
            <mesh position={[0.2, 0.26, 0.76]}>
              <boxGeometry args={[0.34, 0.52, 0.03]} />
              <meshStandardMaterial {...m('#5a3a20')} />
            </mesh>
          </Piece>
          {allDone &&
            [
              [0.85, 0.75, 0.76],
              [-0.45, 0.75, 0.76],
              [-0.5, 1.5, 0.2],
            ].map((p, i) => (
              <mesh key={i} position={p as [number, number, number]}>
                <sphereGeometry args={[0.06, 8, 6]} />
                <meshStandardMaterial color="#ffd27a" emissive="#ffb23a" emissiveIntensity={isDark ? 2.2 : 1} />
              </mesh>
            ))}
          {allDone && <pointLight position={[0, 1.6, 0.8]} color="#ffb860" intensity={isDark ? 6 : 2} distance={6} />}
        </group>
      );
  }
}

// ─── Platforms, falaj and scenery ─────────────────────────────────────────────

function Platform({
  station,
  state,
  selected,
  onSelect,
  celebrate,
  allDone,
  isDark,
  isAr,
}: {
  station: OasisStation;
  state: StationState;
  selected: boolean;
  onSelect: (id: number) => void;
  celebrate: boolean;
  allDone: boolean;
  isDark: boolean;
  isAr: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const mode: Mode = state.status === 'locked' ? 'ghost' : state.status === 'done' ? 'done' : 'build';
  const top = state.status === 'locked' ? '#d8c8a8' : station.color;
  const side = state.status === 'locked' ? '#b5a283' : station.side;
  const [x, z] = station.pos;

  useFrame((_, dt) => {
    if (!group.current) return;
    const lift = hover || selected ? 0.16 : 0;
    group.current.position.y += (lift - group.current.position.y) * Math.min(1, dt * 8);
  });

  const villagers = state.status === 'done' ? (station.levelId === 5 || station.levelId === 7 ? 5 : 3) : state.status === 'active' ? 1 : 0;
  const labelY = station.levelId === -1 ? 2.75 : station.levelId === 6 ? 2.25 : 2.05;
  const icon = state.status === 'done' ? '✓' : state.status === 'locked' ? '🔒' : `${Math.round(state.progress * 100)}%`;

  return (
    <group position={[x, 0, z]}>
      <group
        ref={group}
        onClick={e => {
          e.stopPropagation();
          onSelect(station.levelId);
        }}
        onPointerOver={e => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = '';
        }}
      >
        <mesh position={[0, PLATFORM_H / 2 - 0.08, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[PLATFORM_R, PLATFORM_R * 1.04, PLATFORM_H + 0.16, 6]} />
          <meshStandardMaterial color={side} flatShading />
        </mesh>
        <mesh position={[0, PLATFORM_H + 0.005, 0]} receiveShadow>
          <cylinderGeometry args={[PLATFORM_R * 0.94, PLATFORM_R * 0.94, 0.02, 6]} />
          <meshStandardMaterial color={top} flatShading />
        </mesh>
        {state.status === 'done' && (
          <mesh position={[0, PLATFORM_H + 0.02, 0]} receiveShadow>
            <cylinderGeometry args={[PLATFORM_R * 0.6, PLATFORM_R * 0.66, 0.02, 12]} />
            <meshStandardMaterial color={isDark ? '#4f8a45' : '#7cbf5f'} flatShading />
          </mesh>
        )}
        {(selected || hover) && (
          <mesh position={[0, PLATFORM_H + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[PLATFORM_R * 0.95, PLATFORM_R * 1.04, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        )}
        <StationProps station={station} mode={mode} progress={state.progress} allDone={allDone} isDark={isDark} />
        {celebrate && <Sparkles count={40} scale={[3, 2.5, 3]} position={[0, 1.4, 0]} size={5} speed={0.6} color="#ffd36b" />}
        {station.levelId === -1 && allDone && (
          <Sparkles count={30} scale={[3.5, 3, 3.5]} position={[0, 1.8, 0]} size={4} speed={0.3} color="#ffe2a0" />
        )}
        <Html position={[0, labelY, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold shadow-md border transition-transform ${
              selected ? 'scale-110' : ''
            } ${
              state.status === 'done'
                ? 'bg-emerald-600 text-white border-emerald-400'
                : state.status === 'active'
                  ? 'bg-white text-slate-900 border-amber-400'
                  : 'bg-white/75 text-slate-600 border-white/60'
            }`}
          >
            <span className="opacity-80">{station.levelId === -1 ? '★' : station.levelId}</span>
            <span className="mx-1.5">{isAr ? station.place.ar : station.place.en}</span>
            <span>{icon}</span>
          </div>
        </Html>
      </group>
      {Array.from({ length: villagers }).map((_, i) => (
        <Villager
          key={i}
          index={i + station.levelId * 3 + 8}
          center={[0, 0]}
          radius={1.05 + (i % 2) * 0.12}
          speed={(i % 2 ? -1 : 1) * (0.25 + i * 0.05)}
          phase={i * 1.7 + station.levelId}
        />
      ))}
    </group>
  );
}

function FalajSegment({ from, to, flowing, isDark }: { from: [number, number]; to: [number, number]; flowing: boolean; isDark: boolean }) {
  const drops = useRef<THREE.Mesh[]>([]);
  const { start, len, angle, dir } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const full = Math.hypot(dx, dz);
    const d: [number, number] = [dx / full, dz / full];
    const s: [number, number] = [from[0] + d[0] * PLATFORM_R * 0.92, from[1] + d[1] * PLATFORM_R * 0.92];
    return { start: s, len: Math.max(0.1, full - PLATFORM_R * 1.84), angle: Math.atan2(dz, dx), dir: d };
  }, [from, to]);
  const mid: [number, number, number] = [start[0] + dir[0] * len * 0.5, 0.05, start[1] + dir[1] * len * 0.5];

  useFrame(({ clock }) => {
    if (!flowing) return;
    const t = clock.getElapsedTime();
    drops.current.forEach((d, i) => {
      if (!d) return;
      const k = (t * 0.35 + i / 3) % 1;
      d.position.set(start[0] + dir[0] * len * k, 0.12, start[1] + dir[1] * len * k);
    });
  });

  return (
    <group>
      <group position={mid} rotation={[0, -angle, 0]}>
        {[-0.2, 0.2].map(off => (
          <mesh key={off} position={[0, 0.03, off]} castShadow receiveShadow>
            <boxGeometry args={[len, 0.14, 0.08]} />
            <meshStandardMaterial color="#b49a78" flatShading />
          </mesh>
        ))}
        <mesh position={[0, 0.0, 0]} receiveShadow>
          <boxGeometry args={[len, 0.04, 0.34]} />
          <meshStandardMaterial
            color={flowing ? '#38b6c9' : '#c9b48f'}
            emissive={flowing ? (isDark ? '#0f6b7a' : '#0b4a55') : '#000000'}
            emissiveIntensity={flowing ? 0.35 : 0}
            flatShading
          />
        </mesh>
      </group>
      {flowing &&
        [0, 1, 2].map(i => (
          <mesh key={i} ref={el => (drops.current[i] = el as THREE.Mesh)}>
            <sphereGeometry args={[0.05, 6, 5]} />
            <meshStandardMaterial color="#bff3ff" emissive="#7fe3f5" emissiveIntensity={0.6} />
          </mesh>
        ))}
    </group>
  );
}

function Island({ isDark, finished }: { isDark: boolean; finished: number }) {
  const dunes = useMemo(
    () => [
      [7.6, -5.2, 1.0],
      [8.4, 4.4, 0.8],
      [1.2, 7.3, 0.7],
      [-8.6, 5.6, 0.75],
      [-1.8, -1.6, 0.5],
    ],
    []
  );
  const oasisPalms = Math.min(10, 2 + finished);
  return (
    <group>
      <mesh position={[0, -0.35, 0]} scale={[1, 1, 0.78]} receiveShadow>
        <cylinderGeometry args={[11.2, 11.2, 0.7, 8]} />
        <meshStandardMaterial color={isDark ? '#c9a676' : '#e9cf9c'} flatShading />
      </mesh>
      <mesh position={[0, -1.0, 0]} scale={[1, 1, 0.78]}>
        <cylinderGeometry args={[11.0, 10.2, 0.7, 8]} />
        <meshStandardMaterial color={isDark ? '#8f6a46' : '#b98a5a'} flatShading />
      </mesh>
      <mesh position={[0, -1.7, 0]} scale={[1, 1, 0.78]}>
        <cylinderGeometry args={[10.2, 7.5, 0.8, 8]} />
        <meshStandardMaterial color={isDark ? '#6c5038' : '#8f6a48'} flatShading />
      </mesh>

      {/* Hajar mountains at the back */}
      {[
        [-9.0, -5.6, 1.7, 2.6],
        [-7.0, -7.0, 2.0, 3.4],
        [-4.6, -7.6, 1.6, 2.4],
        [-2.2, -7.9, 1.9, 3.0],
        [0.6, -7.9, 1.5, 2.2],
        [3.2, -7.5, 1.7, 2.6],
        [5.8, -6.6, 1.3, 1.8],
      ].map(([x, z, r, h], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow receiveShadow>
          <coneGeometry args={[r, h, 6]} />
          <meshStandardMaterial color={i % 2 ? '#9b7b5c' : '#86684c'} flatShading />
        </mesh>
      ))}

      {dunes.map(([x, z, s], i) => (
        <mesh key={i} position={[x, 0, z]} scale={[s * 1.6, s * 0.35, s]} receiveShadow castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={isDark ? '#d1ae7c' : '#efd6a6'} flatShading />
        </mesh>
      ))}

      {/* The oasis pool at the heart, with more palms as levels are finished */}
      <mesh position={[0.4, 0.02, 0.2]} receiveShadow>
        <cylinderGeometry args={[1.9, 2.0, 0.05, 16]} />
        <meshStandardMaterial color={finished > 0 ? '#3aa9bd' : '#cdb48b'} emissive={finished > 0 ? '#0b4a55' : '#000'} emissiveIntensity={0.3} flatShading />
      </mesh>
      {Array.from({ length: oasisPalms }).map((_, i) => {
        const a = (i / oasisPalms) * Math.PI * 2 + 0.3;
        return <Palm key={i} position={[0.4 + Math.cos(a) * 2.35, 0, 0.2 + Math.sin(a) * 2.0]} scale={0.8 + (i % 3) * 0.1} seed={i} lean={0.08 + (i % 4) * 0.04} />;
      })}
    </group>
  );
}

function Birds({ count }: { count: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.15;
    ref.current.children.forEach((b, i) => {
      b.position.y = 4.2 + Math.sin(clock.getElapsedTime() * 2 + i) * 0.15;
      b.rotation.z = Math.sin(clock.getElapsedTime() * 8 + i) * 0.4;
    });
  });
  return (
    <group ref={ref}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (4 + (i % 3)), 4.2, Math.sin(a) * (3 + (i % 2))]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.06]} />
            <meshBasicMaterial color="#3b3b3b" />
          </mesh>
        );
      })}
    </group>
  );
}

/** Fits the orthographic camera to the container and applies the zoom buttons. */
function CameraFit({ zoomLevel, resetSignal, controls }: { zoomLevel: number; resetSignal: number; controls: React.MutableRefObject<any> }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (resetSignal > 0) controls.current?.reset?.();
    const base = Math.min(size.width / 22, size.height / 12.5);
    (camera as THREE.OrthographicCamera).zoom = base * zoomLevel;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, zoomLevel, resetSignal, controls]);
  return null;
}

export default function OasisScene({ stations, selected, onSelect, celebrate, isDark, isAr, resetSignal, zoomLevel }: OasisSceneProps) {
  const byId = useMemo(() => new Map(stations.map(s => [s.levelId, s])), [stations]);
  const finished = stations.filter(s => s.levelId >= 0 && s.status === 'done').length;
  const allDone = finished >= 8;
  const controls = useRef<any>(null);

  const order = OASIS_STATIONS;

  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [14, 13, 14], zoom: 40, near: -100, far: 200 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => (document.body.style.cursor = '')}
    >
      <CameraFit zoomLevel={zoomLevel} resetSignal={resetSignal} controls={controls} />
      <hemisphereLight args={[isDark ? '#8c9cff' : '#fff6e0', isDark ? '#3a2a4a' : '#d9b98a', isDark ? 0.55 : 0.9]} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={isDark ? 0.9 : 1.6}
        color={isDark ? '#ffd6a8' : '#fff1d6'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={isDark ? 0.25 : 0.35} />

      <Island isDark={isDark} finished={finished} />

      {order.slice(0, -1).map((s, i) => {
        const next = order[i + 1];
        const state = byId.get(s.levelId);
        return <FalajSegment key={s.levelId} from={s.pos} to={next.pos} flowing={state?.status === 'done'} isDark={isDark} />;
      })}

      {order.map(s => {
        const state = byId.get(s.levelId);
        if (!state) return null;
        return (
          <Platform
            key={s.levelId}
            station={s}
            state={state}
            selected={selected === s.levelId}
            onSelect={onSelect}
            celebrate={celebrate === s.levelId}
            allDone={allDone}
            isDark={isDark}
            isAr={isAr}
          />
        );
      })}

      {finished >= 3 && <Birds count={Math.min(7, finished)} />}

      <OrbitControls
        ref={controls}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.55}
        maxPolarAngle={1.15}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}
