// The user's own plot. It is built up level by level and its main building
// depends on the project type. Extra pieces (a well, solar panels, a majlis…)
// can be added by the user once they have earned enough XP.

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PLOT, PLOT_GATE, heightAt } from './world';
import { ghafGeometry, palmCrownGeometry, palmTrunkGeometry, swayMaterial } from './materials';
import { Reveal, ribbon } from './Nature';
import { Car, Flag, Lantern, Plaster, Teeth, nameTexture } from './Town';

export type ProjectKind = 'agricultural' | 'industrial' | 'commercial' | 'service';
export type PlotItemId = 'tree' | 'well' | 'solar' | 'pickup' | 'majlis' | 'flag';

const HALF_W = PLOT.w / 2;
const HALF_D = PLOT.d / 2;
const GATE_X = PLOT_GATE.x - PLOT.x; // local x of the gate
const GATE_W = 0.6;
/** Local position of the main building (back half of the plot). */
const BUILDING = { x: 0.8, z: -0.55, w: 1.8, d: 0.8 };

// ─── Small textures ────────────────────────────────────────────────────────────

let permitTex: THREE.Texture | null = null;
function permitTexture() {
  if (permitTex) return permitTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 96;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f7f3e8';
  g.fillRect(0, 0, 128, 96);
  g.strokeStyle = '#239C91';
  g.lineWidth = 6;
  g.strokeRect(4, 4, 120, 88);
  g.strokeStyle = '#1f7a4d';
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(34, 50);
  g.lineTo(56, 70);
  g.lineTo(96, 28);
  g.stroke();
  permitTex = new THREE.CanvasTexture(c);
  permitTex.colorSpace = THREE.SRGBColorSpace;
  return permitTex;
}

let openTex: { ar: THREE.Texture | null; en: THREE.Texture | null } = { ar: null, en: null };
function openTexture(isAr: boolean) {
  const key = isAr ? 'ar' : 'en';
  if (openTex[key]) return openTex[key]!;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const g = c.getContext('2d')!;
  g.fillStyle = '#7a1d2b';
  g.fillRect(0, 0, 256, 96);
  g.fillStyle = '#ffe9b0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 56px ${isAr ? '"Noto Kufi Arabic", "Noto Sans Arabic", Tahoma, sans-serif' : 'Inter, Arial, sans-serif'}`;
  g.fillText(isAr ? 'مفتوح' : 'OPEN', 128, 52);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  openTex[key] = t;
  return t;
}

let solarTex: THREE.Texture | null = null;
function solarTexture() {
  if (solarTex) return solarTex;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1b2f55';
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = '#8fb3e8';
  g.lineWidth = 2;
  for (let i = 0; i <= 64; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 64);
    g.moveTo(0, i);
    g.lineTo(64, i);
    g.stroke();
  }
  solarTex = new THREE.CanvasTexture(c);
  solarTex.colorSpace = THREE.SRGBColorSpace;
  return solarTex;
}

// ─── Pieces ────────────────────────────────────────────────────────────────────

function Box({ p, s, color, rough = 0.85, metal = 0, emissive, ei = 0, cast = true }: { p: [number, number, number]; s: [number, number, number]; color: string; rough?: number; metal?: number; emissive?: string; ei?: number; cast?: boolean }) {
  return (
    <mesh position={p} castShadow={cast} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive ?? '#000000'} emissiveIntensity={ei} />
    </mesh>
  );
}

/** Reveal that grows from a pivot point instead of the plot centre. */
function Pop({ show, animate, delay, at, children }: { show: boolean; animate: boolean; delay: number; at: [number, number, number]; children: React.ReactNode }) {
  return (
    <Reveal show={show} animate={animate} delay={delay} position={at}>
      <group position={[-at[0], -at[1], -at[2]]}>{children}</group>
    </Reveal>
  );
}

const ITEM_AT: Record<PlotItemId, [number, number, number]> = {
  tree: [-1.55, 0, 0.55],
  well: [-1.55, 0, 0.0],
  solar: [-1.5, 0, -0.62],
  pickup: [1.35, 0, 0.55],
  majlis: [0.25, 0, 0.5],
  flag: [HALF_W - 0.12, 0, HALF_D - 0.12],
};

function Stakes({ isAr }: { isAr: boolean }) {
  const corners: [number, number][] = [
    [-HALF_W, -HALF_D],
    [HALF_W, -HALF_D],
    [-HALF_W, HALF_D],
    [HALF_W, HALF_D],
  ];
  const label = useMemo(() => nameTexture(isAr ? 'أرض مشروعك' : 'Your plot'), [isAr]);
  return (
    <group>
      {corners.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Box p={[0, 0.14, 0]} s={[0.05, 0.28, 0.05]} color="#f2efe6" />
          <Box p={[0, 0.22, 0]} s={[0.055, 0.06, 0.055]} color="#c0392b" />
        </group>
      ))}
      {/* tape */}
      <Box p={[0, 0.2, -HALF_D]} s={[PLOT.w, 0.015, 0.01]} color="#e2b33b" cast={false} />
      <Box p={[0, 0.2, HALF_D]} s={[PLOT.w, 0.015, 0.01]} color="#e2b33b" cast={false} />
      <Box p={[-HALF_W, 0.2, 0]} s={[0.01, 0.015, PLOT.d]} color="#e2b33b" cast={false} />
      <Box p={[HALF_W, 0.2, 0]} s={[0.01, 0.015, PLOT.d]} color="#e2b33b" cast={false} />
      <group position={[0, 0, HALF_D + 0.15]}>
        <Box p={[-0.32, 0.18, 0]} s={[0.04, 0.36, 0.04]} color="#5b3a22" />
        <Box p={[0.32, 0.18, 0]} s={[0.04, 0.36, 0.04]} color="#5b3a22" />
        <mesh position={[0, 0.34, 0.025]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshStandardMaterial map={label} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Wall() {
  const h = 0.16;
  const t = 0.08;
  const leftLen = GATE_X - GATE_W / 2 + HALF_W;
  const rightLen = HALF_W - (GATE_X + GATE_W / 2);
  return (
    <group>
      {/* sand pad */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[PLOT.w, PLOT.d]} />
        <meshStandardMaterial color="#e6d3ab" roughness={1} />
      </mesh>
      {/* back wall with the gate */}
      <mesh position={[-HALF_W + leftLen / 2, h / 2, -HALF_D]} castShadow receiveShadow>
        <boxGeometry args={[leftLen, h, t]} />
        <Plaster color="#d8b78a" />
      </mesh>
      <mesh position={[HALF_W - rightLen / 2, h / 2, -HALF_D]} castShadow receiveShadow>
        <boxGeometry args={[rightLen, h, t]} />
        <Plaster color="#d8b78a" />
      </mesh>
      {/* gate pillars */}
      {[GATE_X - GATE_W / 2, GATE_X + GATE_W / 2].map(x => (
        <mesh key={x} position={[x, 0.15, -HALF_D]} castShadow>
          <boxGeometry args={[0.11, 0.3, 0.11]} />
          <Plaster color="#cfa97a" />
        </mesh>
      ))}
      {/* sides and front */}
      <mesh position={[0, h / 2, HALF_D]} castShadow receiveShadow>
        <boxGeometry args={[PLOT.w, h, t]} />
        <Plaster color="#d8b78a" />
      </mesh>
      {[-HALF_W, HALF_W].map(x => (
        <mesh key={x} position={[x, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[t, h, PLOT.d]} />
          <Plaster color="#d8b78a" />
        </mesh>
      ))}
    </group>
  );
}

function NameSign({ name, night }: { name: string; night: boolean }) {
  const tex = useMemo(() => nameTexture(name), [name]);
  return (
    <group position={[GATE_X, 0, -HALF_D - 0.18]}>
      <Box p={[-0.42, 0.26, 0]} s={[0.05, 0.52, 0.05]} color="#5b3a22" />
      <Box p={[0.42, 0.26, 0]} s={[0.05, 0.52, 0.05]} color="#5b3a22" />
      <Box p={[0, 0.46, 0]} s={[0.9, 0.24, 0.03]} color="#1f5f6b" />
      {[1, -1].map(side => (
        <mesh key={side} position={[0, 0.46, side * 0.017]} rotation={[0, side > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[0.86, 0.21]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={night ? 0.9 : 0.12} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Permit() {
  return (
    <group>
      {/* foundation slab */}
      <Box p={[BUILDING.x, 0.025, BUILDING.z]} s={[BUILDING.w + 0.1, 0.05, BUILDING.d + 0.1]} color="#b9b4aa" rough={0.95} />
      <group position={[GATE_X - 0.55, 0, -HALF_D + 0.28]}>
        <Box p={[0, 0.17, 0]} s={[0.035, 0.34, 0.035]} color="#5b3a22" />
        <mesh position={[0, 0.34, 0.02]}>
          <planeGeometry args={[0.24, 0.18]} />
          <meshStandardMaterial map={permitTexture()} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Utilities() {
  return (
    <group>
      {/* water tank on legs */}
      <group position={[HALF_W - 0.22, 0, -HALF_D + 0.22]}>
        {[
          [-0.1, -0.1],
          [0.1, -0.1],
          [-0.1, 0.1],
          [0.1, 0.1],
        ].map(([x, z], i) => (
          <Box key={i} p={[x, 0.2, z]} s={[0.025, 0.4, 0.025]} color="#6f6a63" metal={0.4} />
        ))}
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.3, 16]} />
          <meshStandardMaterial color="#e9eef2" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.16, 0.06, 16]} />
          <meshStandardMaterial color="#2f6f9a" roughness={0.5} />
        </mesh>
      </group>
      {/* power pole */}
      <group position={[-HALF_W + 0.12, 0, -HALF_D - 0.12]}>
        <Box p={[0, 0.5, 0]} s={[0.04, 1.0, 0.04]} color="#7a6a55" />
        <Box p={[0, 0.94, 0]} s={[0.32, 0.03, 0.03]} color="#7a6a55" />
      </group>
    </group>
  );
}

function Driveway() {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const x = PLOT_GATE.x;
    const z0 = PLOT_GATE.y - 0.05;
    const z1 = 4.1; // where the road ends
    for (let i = 0; i <= 12; i++) {
      const z = z0 + ((z1 - z0) * i) / 12;
      pts.push(new THREE.Vector3(x, heightAt(x, z), z));
    }
    return ribbon(pts, 0.26, 0.025).geo;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#8a8681" roughness={0.95} />
    </mesh>
  );
}

// ─── Main building, by project type ────────────────────────────────────────────

function Building({ kind, name, night, open, isAr }: { kind: ProjectKind; name: string; night: boolean; open: boolean; isAr: boolean }) {
  const sign = useMemo(() => nameTexture(name), [name]);
  const glass = night ? '#ffd38a' : '#24425a';
  const glassE = night ? '#ffb54d' : '#000000';
  const { x, z, w, d } = BUILDING;
  const front = z + d / 2;
  const openSign = open ? (
    <mesh position={[x - w / 2 + 0.22, 0.36, front + 0.02]}>
      <planeGeometry args={[0.26, 0.1]} />
      <meshStandardMaterial map={openTexture(isAr)} emissiveMap={openTexture(isAr)} emissive="#ffffff" emissiveIntensity={1.4} toneMapped={false} />
    </mesh>
  ) : null;

  if (kind === 'agricultural') {
    return (
      <group>
        {/* greenhouse tunnel */}
        <mesh position={[x - 0.3, 0, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 1.15, 16, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#e4efe6" transparent opacity={0.72} roughness={0.25} metalness={0.05} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {[-0.5, -0.25, 0, 0.25, 0.5].map(k => (
          <mesh key={k} position={[x - 0.3 + k, 0, z]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.365, 0.012, 4, 16, Math.PI]} />
            <meshStandardMaterial color="#c9ccd0" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        {/* rows of seedlings inside */}
        {[-0.18, 0, 0.18].map(rz => (
          <mesh key={rz} position={[x - 0.3, 0.04, z + rz]}>
            <boxGeometry args={[1.0, 0.06, 0.07]} />
            <meshStandardMaterial color="#3f7a35" roughness={0.9} />
          </mesh>
        ))}
        {/* store room with the name */}
        <mesh position={[x + 0.62, 0.26, z]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.52, 0.6]} />
          <Plaster color="#efe2c8" />
        </mesh>
        <mesh position={[x + 0.62, 0.42, z + 0.305]}>
          <planeGeometry args={[0.5, 0.13]} />
          <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={night ? 0.9 : 0.12} />
        </mesh>
        <Box p={[x + 0.62, 0.15, z + 0.305]} s={[0.16, 0.3, 0.01]} color="#5b3a22" />
        {open && (
          <mesh position={[x + 0.62, 0.62, z + 0.2]}>
            <planeGeometry args={[0.26, 0.1]} />
            <meshStandardMaterial map={openTexture(isAr)} emissiveMap={openTexture(isAr)} emissive="#ffffff" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        )}
      </group>
    );
  }

  if (kind === 'industrial') {
    return (
      <group>
        <mesh position={[x, 0.32, z]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.64, d]} />
          <meshStandardMaterial color="#c7ccd1" roughness={0.55} metalness={0.35} />
        </mesh>
        {/* saw-tooth roof */}
        {[-0.6, 0, 0.6].map(k => (
          <mesh key={k} position={[x + k, 0.74, z]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, d, 3, 1]} />
            <meshStandardMaterial color="#9aa3ab" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}
        <Box p={[x - 0.35, 0.22, z + d / 2 + 0.005]} s={[0.5, 0.44, 0.01]} color="#596069" metal={0.3} />
        <mesh position={[x + 0.45, 0.5, z + d / 2 + 0.01]}>
          <planeGeometry args={[0.7, 0.16]} />
          <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={night ? 0.9 : 0.12} />
        </mesh>
        {/* chimney */}
        <mesh position={[x + w / 2 - 0.15, 0.75, z - 0.2]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.7, 10]} />
          <meshStandardMaterial color="#a76542" roughness={0.8} />
        </mesh>
        {[0.2, 0.42].map(y => (
          <Box key={y} p={[x + 0.45, y, z + d / 2 + 0.006]} s={[0.6, 0.06, 0.01]} color={glass} emissive={glassE} ei={night ? 1.4 : 0} cast={false} />
        ))}
        {openSign}
      </group>
    );
  }

  if (kind === 'service') {
    return (
      <group>
        <mesh position={[x, 0.45, z]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.9, d]} />
          <Plaster color="#f4f0e7" />
        </mesh>
        <Teeth w={w} d={d} y={0.9} size={0.09} color="#e9e2d2" />
        {[0.3, 0.62].map(y => (
          <Box key={y} p={[x, y, z + d / 2 + 0.005]} s={[w - 0.2, 0.16, 0.01]} color={night ? '#ffd38a' : '#2f6f9a'} emissive={night ? '#ffb54d' : '#0b2a40'} ei={night ? 1.4 : 0.2} rough={0.15} metal={0.5} cast={false} />
        ))}
        {/* arched entrance */}
        <mesh position={[x - w / 2 + 0.35, 0.16, z + d / 2 + 0.03]}>
          <boxGeometry args={[0.24, 0.32, 0.04]} />
          <meshStandardMaterial color="#5b3a22" />
        </mesh>
        <mesh position={[x + 0.2, 1.02, z + d / 2 - 0.05]}>
          <planeGeometry args={[0.9, 0.2]} />
          <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={night ? 0.9 : 0.12} />
        </mesh>
        {openSign}
      </group>
    );
  }

  // commercial
  return (
    <group>
      <mesh position={[x, 0.42, z]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.84, d]} />
        <Plaster color="#efe2c8" />
      </mesh>
      <Teeth w={w} d={d} y={0.84} size={0.09} color="#e6d6b8" />
      {/* shop windows and door */}
      {[-0.55, 0.05, 0.6].map(k => (
        <Box key={k} p={[x + k, 0.2, z + d / 2 + 0.005]} s={[0.36, 0.3, 0.01]} color={glass} emissive={glassE} ei={night ? 1.6 : 0} rough={0.15} metal={0.4} cast={false} />
      ))}
      {[-0.55, 0, 0.55].map(k => (
        <Box key={k} p={[x + k, 0.6, z + d / 2 + 0.005]} s={[0.22, 0.16, 0.01]} color={glass} emissive={glassE} ei={night ? 1.6 : 0} cast={false} />
      ))}
      {/* awning */}
      <mesh position={[x, 0.4, z + d / 2 + 0.14]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[w - 0.1, 0.03, 0.3]} />
        <meshStandardMaterial color="#174D3B" roughness={0.8} />
      </mesh>
      <mesh position={[x, 0.74, z + d / 2 + 0.01]}>
        <planeGeometry args={[1.1, 0.18]} />
        <meshStandardMaterial map={sign} emissiveMap={sign} emissive="#ffffff" emissiveIntensity={night ? 0.9 : 0.12} />
      </mesh>
      {openSign}
    </group>
  );
}

/** Things in the yard once the equipment level is done. */
function Equipment({ kind }: { kind: ProjectKind }) {
  const at: [number, number, number] = [-0.75, 0, 0.5];
  if (kind === 'agricultural') {
    // small tractor and crates of dates
    return (
      <group position={at}>
        <group rotation={[0, 0.5, 0]}>
          <Box p={[0, 0.13, 0]} s={[0.34, 0.14, 0.18]} color="#2f7a3a" rough={0.5} metal={0.3} />
          <Box p={[-0.08, 0.26, 0]} s={[0.12, 0.14, 0.16]} color="#26323a" rough={0.2} metal={0.5} />
          {[
            [-0.11, 0.1, 0.1, 0.07],
            [-0.11, 0.1, -0.1, 0.07],
            [0.13, 0.06, 0.1, 0.04],
            [0.13, 0.06, -0.1, 0.04],
          ].map(([x, y, z, r], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[r * 1.4, r * 1.4, 0.05, 12]} />
              <meshStandardMaterial color="#1c1c1c" />
            </mesh>
          ))}
        </group>
        {[0, 1, 2].map(i => (
          <group key={i} position={[0.32, 0.04 + Math.floor(i / 2) * 0.08, -0.12 + (i % 2) * 0.12]}>
            <Box p={[0, 0, 0]} s={[0.12, 0.08, 0.1]} color="#a0703f" />
            <Box p={[0, 0.03, 0]} s={[0.1, 0.03, 0.08]} color="#5a2c1a" />
          </group>
        ))}
      </group>
    );
  }
  if (kind === 'industrial') {
    return (
      <group position={at}>
        {[0, 1, 2, 3].map(i => (
          <Box key={i} p={[-0.1 + (i % 2) * 0.17, 0.08 + Math.floor(i / 2) * 0.16, 0]} s={[0.15, 0.15, 0.15]} color="#b98b55" />
        ))}
        {[0, 1].map(i => (
          <mesh key={i} position={[0.25, 0.1, -0.12 + i * 0.14]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
            <meshStandardMaterial color={i ? '#2f6f9a' : '#b3263a'} roughness={0.5} />
          </mesh>
        ))}
      </group>
    );
  }
  if (kind === 'service') {
    // bench and a scooter
    return (
      <group position={at}>
        <Box p={[0, 0.08, 0]} s={[0.4, 0.04, 0.12]} color="#8a5a33" />
        {[-0.17, 0.17].map(x => (
          <Box key={x} p={[x, 0.04, 0]} s={[0.04, 0.08, 0.1]} color="#555" />
        ))}
        <group position={[0.3, 0, 0.15]} rotation={[0, 0.6, 0]}>
          <Box p={[0, 0.08, 0]} s={[0.24, 0.05, 0.06]} color="#c0392b" rough={0.4} metal={0.3} />
          <Box p={[0.1, 0.16, 0]} s={[0.03, 0.18, 0.03]} color="#333" />
        </group>
      </group>
    );
  }
  // commercial: café tables
  return (
    <group position={at}>
      {[
        [-0.18, 0],
        [0.22, 0.05],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.02, 14]} />
            <meshStandardMaterial color="#f4f0e7" />
          </mesh>
          <Box p={[0, 0.06, 0]} s={[0.02, 0.12, 0.02]} color="#555" />
          <mesh position={[0, 0.36, 0]} castShadow>
            <coneGeometry args={[0.2, 0.1, 8]} />
            <meshStandardMaterial color={i ? '#A76542' : '#239C91'} roughness={0.8} />
          </mesh>
          <Box p={[0, 0.22, 0]} s={[0.012, 0.28, 0.012]} color="#ddd" />
        </group>
      ))}
    </group>
  );
}

const crownMat = swayMaterial({ color: '#3f7a35', roughness: 0.8, side: THREE.DoubleSide }, 0.05);
const trunkMat = new THREE.MeshStandardMaterial({ color: '#7a5a3a', roughness: 0.95 });
const ghafLeaf = swayMaterial({ color: '#7a9a4a', roughness: 0.9, flatShading: true }, 0.03);

function Greenery() {
  const trunk = useMemo(palmTrunkGeometry, []);
  const crown = useMemo(palmCrownGeometry, []);
  return (
    <group>
      {[-HALF_W + 0.2, HALF_W - 0.2].map(x => (
        <group key={x} position={[x, 0, HALF_D - 0.2]} scale={0.6}>
          <mesh geometry={trunk} material={trunkMat} castShadow />
          <mesh geometry={crown} material={crownMat} castShadow />
        </group>
      ))}
      {[-1.1, -0.35, 0.4, 1.15].map(x => (
        <group key={x} position={[x, 0, HALF_D - 0.12]}>
          <Box p={[0, 0.05, 0]} s={[0.22, 0.1, 0.1]} color="#a76542" />
          <mesh position={[0, 0.14, 0]} castShadow>
            <icosahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#4c8a3e" flatShading roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Items the user adds ───────────────────────────────────────────────────────

function ShadeTree() {
  const { trunk, crown } = useMemo(ghafGeometry, []);
  return (
    <group position={[-1.55, 0, 0.55]}>
      <group scale={0.75}>
        <mesh geometry={trunk} material={trunkMat} castShadow />
        <mesh geometry={crown} material={ghafLeaf} castShadow />
      </group>
      <group position={[0.22, 0, 0.12]} rotation={[0, -0.4, 0]}>
        <Box p={[0, 0.08, 0]} s={[0.3, 0.03, 0.1]} color="#8a5a33" />
        {[-0.12, 0.12].map(x => (
          <Box key={x} p={[x, 0.04, 0]} s={[0.03, 0.08, 0.08]} color="#5b3a22" />
        ))}
      </group>
    </group>
  );
}

function Well() {
  return (
    <group position={[-1.55, 0, 0.0]}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.17, 0.16, 16, 1, true]} />
        <Plaster color="#c9b08a" />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 16]} />
        <meshStandardMaterial color="#1f5a6a" roughness={0.2} />
      </mesh>
      {[-0.14, 0.14].map(x => (
        <Box key={x} p={[x, 0.24, 0]} s={[0.03, 0.32, 0.03]} color="#5b3a22" />
      ))}
      <Box p={[0, 0.39, 0]} s={[0.34, 0.03, 0.03]} color="#5b3a22" />
      <Box p={[0, 0.27, 0]} s={[0.06, 0.06, 0.06]} color="#7a5a3a" />
    </group>
  );
}

function Solar() {
  return (
    <group position={[-1.5, 0, -0.62]}>
      {[-0.17, 0.17].map(x => (
        <group key={x} position={[x, 0, 0]}>
          <Box p={[0, 0.08, 0.05]} s={[0.02, 0.16, 0.02]} color="#888" metal={0.5} />
          <Box p={[0, 0.04, -0.06]} s={[0.02, 0.08, 0.02]} color="#888" metal={0.5} />
          <mesh position={[0, 0.13, 0]} rotation={[-0.7, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 0.02, 0.28]} />
            <meshStandardMaterial map={solarTexture()} roughness={0.25} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Pickup({ night }: { night: boolean }) {
  return (
    <group position={[1.35, 0, 0.55]} rotation={[0, -0.25, 0]} scale={0.85}>
      <Car color="#f4f4f2" pickup lights={night} />
    </group>
  );
}

let tentTex: THREE.Texture | null = null;
function tentTexture() {
  if (tentTex) return tentTex;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  const cols = ['#2b2522', '#f2efe6', '#7a1d2b', '#2b2522', '#c9a227'];
  for (let i = 0; i < 16; i++) {
    g.fillStyle = cols[i % cols.length];
    g.fillRect(i * 4, 0, 4, 64);
  }
  tentTex = new THREE.CanvasTexture(c);
  tentTex.colorSpace = THREE.SRGBColorSpace;
  tentTex.wrapS = THREE.RepeatWrapping;
  tentTex.repeat.set(3, 1);
  return tentTex;
}

function Majlis() {
  return (
    <group position={[0.25, 0, 0.5]}>
      {/* carpet and cushions */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.66, 0.44]} />
        <meshStandardMaterial color="#8c1d2c" roughness={1} />
      </mesh>
      {[-0.22, 0, 0.22].map(x => (
        <Box key={x} p={[x, 0.03, -0.17]} s={[0.18, 0.05, 0.07]} color="#c9a227" />
      ))}
      {/* tent roof on four poles */}
      {[
        [-0.3, -0.2],
        [0.3, -0.2],
        [-0.3, 0.2],
        [0.3, 0.2],
      ].map(([x, z], i) => (
        <Box key={i} p={[x, 0.17, z]} s={[0.025, 0.34, 0.025]} color="#5b3a22" />
      ))}
      <mesh position={[0, 0.42, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.5, 0.18, 4, 1, true]} />
        <meshStandardMaterial map={tentTexture()} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* coffee pot */}
      <mesh position={[0.1, 0.05, 0.05]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.07, 10]} />
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function FlagAndLights({ night }: { night: boolean }) {
  const bulbs = useMemo(() => Array.from({ length: 13 }, (_, i) => -HALF_W + 0.15 + (i * (PLOT.w - 0.3)) / 12), []);
  return (
    <group>
      <group position={[HALF_W - 0.12, 0, HALF_D - 0.12]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.016, 1.1, 8]} />
          <meshStandardMaterial color="#d9d9d9" metalness={0.7} roughness={0.3} />
        </mesh>
        <group scale={0.6}>
          <Flag height={1.65} />
        </group>
      </group>
      {bulbs.map((x, i) => (
        <mesh key={i} position={[x, 0.22 + Math.abs(Math.sin((i / 12) * Math.PI * 6)) * 0.03, HALF_D]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshStandardMaterial color={night ? '#ffe2a0' : '#f3e2b8'} emissive={night ? '#ffb54d' : '#000000'} emissiveIntensity={night ? 3 : 0} />
        </mesh>
      ))}
      {[-HALF_W + 0.04, HALF_W - 0.04].map(x => (
        <mesh key={x} position={[x, 0.17, HALF_D]} castShadow>
          <boxGeometry args={[0.02, 0.18, 0.02]} />
          <meshStandardMaterial color="#5b3a22" />
        </mesh>
      ))}
    </group>
  );
}

const ITEM_VIEW: Record<PlotItemId, (p: { night: boolean }) => React.ReactElement> = {
  tree: () => <ShadeTree />,
  well: () => <Well />,
  solar: () => <Solar />,
  pickup: ({ night }) => <Pickup night={night} />,
  majlis: () => <Majlis />,
  flag: ({ night }) => <FlagAndLights night={night} />,
};

// ─── The plot ──────────────────────────────────────────────────────────────────

export function YourPlot({
  done,
  kind,
  items,
  name,
  night,
  fresh,
  delay,
  isAr,
}: {
  done: boolean[];
  kind: ProjectKind;
  items: PlotItemId[];
  name: string;
  night: boolean;
  fresh: number | null;
  delay: number;
  isAr: boolean;
}) {
  // items added since the scene mounted pop in; the rest are just there
  const seen = useRef<Set<PlotItemId> | null>(null);
  if (seen.current === null) seen.current = new Set(items);
  // an item that is removed and added again pops in again
  for (const id of Array.from(seen.current)) if (!items.includes(id)) seen.current.delete(id);
  const anim = (lv: number) => fresh === lv;
  return (
    <group>
      {done[3] && <Driveway />}
      <group position={[PLOT.x, PLOT.ground, PLOT.z]}>
        {!done[0] && <Stakes isAr={isAr} />}
        <Pop show={done[0]} animate={anim(0)} delay={delay} at={[0, 0, 0]}>
          <Wall />
        </Pop>
        <Pop show={done[1]} animate={anim(1)} delay={delay} at={[GATE_X, 0, -HALF_D - 0.18]}>
          <NameSign name={name} night={night} />
        </Pop>
        <Pop show={done[2] && !done[4]} animate={anim(2)} delay={delay} at={[BUILDING.x, 0, BUILDING.z]}>
          <Permit />
        </Pop>
        <Pop show={done[3]} animate={anim(3)} delay={delay} at={[HALF_W - 0.22, 0, -HALF_D + 0.22]}>
          <Utilities />
        </Pop>
        <Pop show={done[4]} animate={anim(4)} delay={delay} at={[BUILDING.x, 0, BUILDING.z]}>
          <Building kind={kind} name={name} night={night} open={done[7]} isAr={isAr} />
        </Pop>
        <Pop show={done[4]} animate={anim(4)} delay={delay + 0.4} at={[-0.75, 0, 0.5]}>
          <Equipment kind={kind} />
        </Pop>
        <Pop show={done[6]} animate={anim(6)} delay={delay} at={[0, 0, HALF_D - 0.15]}>
          <Greenery />
        </Pop>
        {done[7] && <Lantern position={[GATE_X, 0.34, -HALF_D]} on={night} />}
        {items.map(id => (
          <Pop key={id} show animate={!seen.current!.has(id)} delay={0.6} at={ITEM_AT[id]}>
            {ITEM_VIEW[id]({ night })}
          </Pop>
        ))}
      </group>
    </group>
  );
}
