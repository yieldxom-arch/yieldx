// The journey trail: glowing dots that link the levels in order, like a quest
// path. Walked parts glow teal, the way to the current level pulses gold, the
// rest is faint.

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPOTS, ZONE_SPOTS, heightAt } from './world';

export type SegmentState = 'done' | 'current' | 'locked';

const DONE = new THREE.Color(0.25, 1.45, 1.15);
const NEXT = new THREE.Color(2.2, 1.45, 0.3);
const LOCKED = new THREE.Color(0.95, 0.92, 0.85);

/** stops: level 0..7 then the final tower. */
export function Trail({ segments }: { segments: SegmentState[] }) {
  const stops = useMemo(() => [...ZONE_SPOTS, SPOTS.tower], []);
  const dots = useMemo(() => {
    const out: { x: number; y: number; z: number; seg: number; t: number }[] = [];
    for (let s = 0; s < stops.length - 1; s++) {
      const a = stops[s];
      const b = stops[s + 1];
      const len = a.distanceTo(b);
      const n = Math.max(2, Math.floor(len / 0.42));
      // skip the dots right under the markers
      for (let i = 2; i < n - 1; i++) {
        const t = i / n;
        // a gentle curve so the trail does not look ruler-straight
        const bend = Math.sin(t * Math.PI) * 0.06 * len;
        const nx = -(b.y - a.y) / len;
        const nz = (b.x - a.x) / len;
        const x = a.x + (b.x - a.x) * t + nx * bend;
        const z = a.y + (b.y - a.y) * t + nz * bend;
        out.push({ x, y: heightAt(x, z) + 0.1, z, seg: s, t });
      }
    }
    return out;
  }, [stops]);

  const ref = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);
  const v = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    dots.forEach((d, i) => {
      const st = segments[d.seg];
      ref.current!.setColorAt(i, st === 'done' ? DONE : st === 'current' ? NEXT : LOCKED);
    });
    ref.current.instanceColor!.needsUpdate = true;
  }, [dots, segments]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    dots.forEach((d, i) => {
      const st = segments[d.seg];
      let s = st === 'locked' ? 0.55 : 0.85;
      if (st === 'current') {
        // a wave running towards the current level
        const w = Math.sin((d.t - t * 0.45) * Math.PI * 6);
        s = 0.75 + Math.max(0, w) * 0.65;
      }
      v.set(d.x, d.y + (st === 'current' ? Math.max(0, Math.sin((d.t - t * 0.45) * Math.PI * 6)) * 0.05 : 0), d.z);
      sc.set(s, s * 0.6, s);
      m.compose(v, q, sc);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dots.length]} frustumCulled={false} renderOrder={2}>
      <sphereGeometry args={[0.07, 10, 6]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.92} depthWrite={false} />
    </instancedMesh>
  );
}

/** A soft pulsing ring on the ground under the current level. */
export function CurrentRing({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const y = heightAt(x, z) + 0.06;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const k = (clock.getElapsedTime() * 0.6) % 1;
    ref.current.scale.setScalar(0.6 + k * 1.6);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - k);
  });
  return (
    <mesh ref={ref} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
      <ringGeometry args={[0.55, 0.68, 40]} />
      <meshBasicMaterial color={new THREE.Color(2.2, 1.5, 0.35)} toneMapped={false} transparent depthWrite={false} />
    </mesh>
  );
}
