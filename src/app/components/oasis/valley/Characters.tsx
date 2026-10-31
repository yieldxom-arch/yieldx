// Animated Omani characters: the player, who walks to the level you pick, and
// villagers who appear as levels are finished. Models: KayKit Adventurers
// (CC0, Kay Lousberg), recoloured into dishdasha and abaya, with a kumma or
// massar added here. Animations are shared from one file.

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { PLOT, PLOT_GATE, heightAt } from './world';
import { findPath, standFor } from './nav';

const BASE = (import.meta as any).env?.BASE_URL ?? '/';
export const MODEL_URLS = {
  man: `${BASE}models/omani-man.glb`,
  elder: `${BASE}models/omani-elder.glb`,
  woman: `${BASE}models/omani-woman.glb`,
  anims: `${BASE}models/omani-anims.glb`,
};
export function preloadCharacters() {
  Object.values(MODEL_URLS).forEach(u => useGLTF.preload(u));
}

export type Look = 'man' | 'elder' | 'woman';
export type AnimName = 'Idle' | 'Walking_A' | 'Running_A' | 'Cheer' | 'Interact' | 'Sit_Floor_Idle' | 'PickUp' | 'Use_Item';

/** Height of a villager in the valley (the models are ~2.47 units tall). */
export const VILLAGER_SCALE = 0.16;
const PLAYER_SCALE = 0.23;

// ─── Headwear ──────────────────────────────────────────────────────────────────

let kummaTex: THREE.Texture | null = null;
let massarTex: THREE.Texture | null = null;

function kummaTexture() {
  if (kummaTex) return kummaTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f7f4ee';
  g.fillRect(0, 0, 256, 64);
  const motif = ['#2f6f9a', '#b3263a', '#c9a227'];
  for (let i = 0; i < 16; i++) {
    const x = i * 16 + 8;
    g.fillStyle = motif[i % 3];
    g.beginPath();
    g.moveTo(x, 10);
    g.lineTo(x + 6, 22);
    g.lineTo(x, 34);
    g.lineTo(x - 6, 22);
    g.closePath();
    g.fill();
    g.fillRect(x - 1, 40, 2, 12);
  }
  g.fillStyle = '#c9a227';
  g.fillRect(0, 58, 256, 6);
  kummaTex = new THREE.CanvasTexture(c);
  kummaTex.colorSpace = THREE.SRGBColorSpace;
  kummaTex.wrapS = THREE.RepeatWrapping;
  return kummaTex;
}

function massarTexture() {
  if (massarTex) return massarTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d')!;
  const colours = ['#7b2d3b', '#c9a227', '#3a5f8a', '#e9dcc0', '#7b2d3b', '#2f6a4f'];
  for (let i = 0; i < 16; i++) {
    g.fillStyle = colours[i % colours.length];
    g.fillRect(0, i * 8, 128, 8);
  }
  massarTex = new THREE.CanvasTexture(c);
  massarTex.colorSpace = THREE.SRGBColorSpace;
  massarTex.wrapS = massarTex.wrapT = THREE.RepeatWrapping;
  massarTex.repeat.set(3, 1);
  return massarTex;
}

function headwear(look: Look) {
  const g = new THREE.Group();
  if (look === 'man') {
    const side = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.58, 0.34, 24, 1, true),
      new THREE.MeshStandardMaterial({ map: kummaTexture(), roughness: 0.85, side: THREE.DoubleSide })
    );
    const top = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshStandardMaterial({ color: '#f7f4ee', roughness: 0.85 }));
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.17;
    g.add(side, top);
    g.position.y = 0.86;
  } else if (look === 'elder') {
    const mat = new THREE.MeshStandardMaterial({ map: massarTexture(), roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.56 - i * 0.07, 0.12, 8, 24), mat);
      t.rotation.x = Math.PI / 2;
      t.rotation.z = i * 0.9;
      t.position.y = i * 0.11;
      g.add(t);
    }
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.47, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    top.scale.y = 0.45;
    top.position.y = 0.12;
    g.add(top);
    g.position.y = 0.84;
  }
  g.traverse(o => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });
  return g;
}

// ─── One animated character ────────────────────────────────────────────────────

function useCharacter(look: Look) {
  const { scene } = useGLTF(MODEL_URLS[look]);
  const { animations } = useGLTF(MODEL_URLS.anims);
  const root = useMemo(() => {
    const o = cloneSkinned(scene) as THREE.Group;
    let head: THREE.Object3D | null = null;
    o.traverse(n => {
      const m = n as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.frustumCulled = false;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat && 'roughness' in mat) mat.roughness = 0.85;
      }
      if ((n as THREE.Bone).isBone && n.name === 'head') head = n;
    });
    if (head && look !== 'woman') (head as THREE.Object3D).add(headwear(look));
    return o;
  }, [scene, look]);
  const mixer = useMemo(() => new THREE.AnimationMixer(root), [root]);
  const actions = useMemo(() => {
    const out: Partial<Record<AnimName, THREE.AnimationAction>> = {};
    for (const clip of animations) out[clip.name as AnimName] = mixer.clipAction(clip);
    return out;
  }, [animations, mixer]);
  useEffect(() => () => void mixer.stopAllAction(), [mixer]);
  return { root, actions, mixer };
}

function useAnimator(actions: Partial<Record<AnimName, THREE.AnimationAction>>) {
  const current = useRef<AnimName | null>(null);
  return (name: AnimName, timeScale = 1, fade = 0.25) => {
    const next = actions[name];
    if (!next) return;
    next.timeScale = timeScale;
    if (current.current === name) return;
    const prev = current.current ? actions[current.current] : null;
    next.reset().setEffectiveWeight(1).fadeIn(prev ? fade : 0).play();
    if (prev) prev.fadeOut(fade);
    current.current = name;
  };
}

// ─── Villagers ─────────────────────────────────────────────────────────────────

export interface VillagerSpec {
  look: Look;
  /** level that must be finished for them to appear (-2 = always) */
  level: number;
  at: [number, number];
  /** walk back and forth to this point; otherwise stay at `at` */
  to?: [number, number];
  anim?: AnimName;
  face?: number;
  /** start of the loop, so walkers are not in step */
  phase?: number;
}

function Villager({ spec }: { spec: VillagerSpec }) {
  const { root, actions, mixer } = useCharacter(spec.look);
  const play = useAnimator(actions);
  const group = useRef<THREE.Group>(null);
  const st = useRef({ born: -1, t: spec.phase ?? 0, dir: 1, pause: 0 });

  useEffect(() => {
    play(spec.to ? 'Walking_A' : spec.anim ?? 'Idle');
    mixer.setTime((spec.phase ?? 0) * 3);
  }, []);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    mixer.update(dt);
    const g = group.current;
    if (!g) return;
    const s = st.current;
    if (s.born < 0) s.born = clock.getElapsedTime();
    const grow = Math.min(1, (clock.getElapsedTime() - s.born) / 0.6);
    g.scale.setScalar(VILLAGER_SCALE * (grow < 1 ? 1 - (1 - grow) ** 3 : 1));

    let x = spec.at[0];
    let z = spec.at[1];
    let heading = spec.face ?? 0;
    if (spec.to) {
      const [bx, bz] = spec.to;
      const len = Math.hypot(bx - x, bz - z) || 1;
      if (s.pause > 0) {
        s.pause -= dt;
        play('Idle');
        if (s.pause <= 0) play('Walking_A');
      } else {
        s.t += (dt * 0.42 * s.dir) / len;
        if (s.t >= 1 || s.t <= 0) {
          s.t = Math.min(1, Math.max(0, s.t));
          s.dir *= -1;
          s.pause = 1.2 + ((spec.phase ?? 0) % 1) * 1.5;
        }
      }
      const fx = s.dir > 0 ? bx - spec.at[0] : spec.at[0] - bx;
      const fz = s.dir > 0 ? bz - spec.at[1] : spec.at[1] - bz;
      heading = Math.atan2(fx, fz);
      x = spec.at[0] + (bx - spec.at[0]) * s.t;
      z = spec.at[1] + (bz - spec.at[1]) * s.t;
    }
    g.position.set(x, heightAt(x, z), z);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, heading, 0.15);
  });

  return (
    <group ref={group} scale={0.0001}>
      <primitive object={root} />
    </group>
  );
}

export function Villagers({ list, levelsDone }: { list: VillagerSpec[]; levelsDone: boolean[] }) {
  return (
    <group>
      {list.map((v, i) => (v.level === -2 || levelsDone[v.level] ? <Villager key={i} spec={v} /> : null))}
    </group>
  );
}

// ─── The player ────────────────────────────────────────────────────────────────

const ringGeo = new THREE.RingGeometry(0.19, 0.25, 32);
const gemGeo = new THREE.OctahedronGeometry(0.07, 0);

export type PlayerTarget = Parameters<typeof standFor>[0];

/** Inside the plot: through the gate to a free spot in the yard (local → world). */
const PLOT_INSIDE = [
  { x: PLOT_GATE.x, z: PLOT_GATE.y + 0.25 },
  { x: PLOT_GATE.x, z: PLOT.z - 0.05 },
  { x: PLOT.x - 0.3, z: PLOT.z + 0.2 },
  { x: PLOT.x - 0.25, z: PLOT.z + 0.85 },
];

function stopFor(target: PlayerTarget) {
  return target === 'plot' ? PLOT_INSIDE[PLOT_INSIDE.length - 1] : standFor(target);
}

export function Player({ look, target, cheer }: { look: 'man' | 'woman'; target: PlayerTarget; cheer: boolean }) {
  const { root, actions, mixer } = useCharacter(look);
  const play = useAnimator(actions);
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const gem = useRef<THREE.Mesh>(null);
  const walk = useRef<{ pts: { x: number; z: number }[]; seg: number; t: number; speed: number } | null>(null);
  const pos = useRef(stopFor(target));
  const lastTarget = useRef<PlayerTarget>(target);
  const cheerUntil = useRef(0);
  const cheered = useRef(false);
  const wantCheer = useRef(cheer);
  wantCheer.current = cheer;

  useEffect(() => {
    play('Idle');
  }, []);

  useEffect(() => {
    const goal = stopFor(target);
    const from = pos.current;
    const leavingPlot = lastTarget.current === 'plot' && target !== 'plot';
    lastTarget.current = target;
    if (Math.hypot(goal.x - from.x, goal.z - from.z) < 0.05) return;
    const gate = standFor('plot');
    let pts: { x: number; z: number }[];
    if (target === 'plot') pts = [...findPath(from, gate), ...PLOT_INSIDE];
    else if (leavingPlot) pts = [from, ...PLOT_INSIDE.slice(0, -1).reverse(), ...findPath(gate, goal)];
    else pts = findPath(from, goal);
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    // short hops are walked; longer trips are run, arriving within ~6 seconds
    if (len < 2.5) {
      walk.current = { pts, seg: 0, t: 0, speed: 0.75 };
      play('Walking_A', 1.5);
    } else {
      const speed = Math.min(4, Math.max(1.2, len / 6));
      walk.current = { pts, seg: 0, t: 0, speed };
      play('Running_A', Math.min(1.9, Math.max(0.9, speed / 1.4)));
    }
    cheered.current = false;
  }, [target]);

  useFrame(({ clock, camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    mixer.update(dt);
    const g = group.current;
    if (!g) return;
    const now = clock.getElapsedTime();
    let heading = g.rotation.y;
    const w = walk.current;
    if (w) {
      let move = w.speed * dt;
      while (move > 0 && w.seg < w.pts.length - 1) {
        const a = w.pts[w.seg];
        const b = w.pts[w.seg + 1];
        const len = Math.hypot(b.x - a.x, b.z - a.z) || 0.0001;
        const left = (1 - w.t) * len;
        if (move < left) {
          w.t += move / len;
          move = 0;
        } else {
          move -= left;
          w.seg++;
          w.t = 0;
        }
        heading = Math.atan2(b.x - a.x, b.z - a.z);
      }
      const a = w.pts[Math.min(w.seg, w.pts.length - 1)];
      const b = w.pts[Math.min(w.seg + 1, w.pts.length - 1)];
      pos.current = { x: a.x + (b.x - a.x) * w.t, z: a.z + (b.z - a.z) * w.t };
      if (w.seg >= w.pts.length - 1) {
        walk.current = null;
        pos.current = w.pts[w.pts.length - 1];
      }
    } else {
      // face the viewer when standing still
      const toCam = Math.atan2(camera.position.x - pos.current.x, camera.position.z - pos.current.z);
      heading = toCam;
      if (wantCheer.current && !cheered.current) {
        cheered.current = true;
        cheerUntil.current = now + 3.4;
      }
      if (!wantCheer.current) cheered.current = false;
      play(now < cheerUntil.current ? 'Cheer' : 'Idle');
    }
    const { x, z } = pos.current;
    const y = heightAt(x, z);
    g.position.set(x, y, z);
    let d = heading - g.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    g.rotation.y += d * Math.min(1, dt * 10);

    if (ring.current) {
      const k = 1 + Math.sin(now * 3) * 0.08;
      ring.current.scale.setScalar(k);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.sin(now * 3) * 0.2;
    }
    if (gem.current) {
      gem.current.position.y = 0.78 + Math.sin(now * 2.4) * 0.04;
      gem.current.rotation.y = now * 1.6;
    }
  });

  return (
    <group ref={group}>
      <group scale={PLAYER_SCALE}>
        <primitive object={root} />
      </group>
      <mesh ref={ring} geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <meshBasicMaterial color="#f1c34a" transparent opacity={0.7} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={gem} geometry={gemGeo} position={[0, 0.78, 0]}>
        <meshStandardMaterial color="#f1c34a" emissive="#f1a92a" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  );
}
