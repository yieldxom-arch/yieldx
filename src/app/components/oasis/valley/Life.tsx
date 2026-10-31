// People, moving cars, camels and the fireworks at the end.

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROAD_POINTS, SPOTS, heightAt, pointsOnCurve, rng } from './world';
import { Car } from './Town';

// ─── People ────────────────────────────────────────────────────────────────────

interface Walker {
  cx: number;
  cz: number;
  rx: number;
  rz: number;
  speed: number;
  phase: number;
  level: number; // -2 = always there
  robe: string;
  woman: boolean;
  still?: boolean;
}

const ROBES_MEN = ['#f6f4ef', '#f3efe6', '#efe9dc', '#e9e4d8', '#c9b79c', '#8c7b6b'];
const ROBES_WOMEN = ['#1c1b1f', '#26232a', '#5a2d6b', '#1f4a73', '#7a2a3a', '#2f5d4a'];

function walkers(): Walker[] {
  const r = rng(91);
  const out: Walker[] = [];
  const add = (level: number, n: number, cx: number, cz: number, spread: number, still = false) => {
    for (let i = 0; i < n; i++) {
      const woman = r() < 0.4;
      out.push({
        cx: cx + (r() - 0.5) * spread,
        cz: cz + (r() - 0.5) * spread * 0.7,
        rx: 0.3 + r() * spread * 0.35,
        rz: 0.2 + r() * spread * 0.25,
        speed: (r() < 0.5 ? -1 : 1) * (0.12 + r() * 0.18),
        phase: r() * Math.PI * 2,
        level,
        robe: woman ? ROBES_WOMEN[Math.floor(r() * ROBES_WOMEN.length)] : ROBES_MEN[Math.floor(r() * ROBES_MEN.length)],
        woman,
        still,
      });
    }
  };
  add(-2, 7, -5.5, 1.0, 4); // a few people in the old quarter from the start
  add(-2, 3, 9.5, -0.5, 4); // farmers
  add(1, 3, SPOTS.shop.x, SPOTS.shop.y + 0.9, 1.4); // at your shop
  add(2, 2, SPOTS.fort.x, SPOTS.fort.y + 2.2, 0.8, true); // guards at the gate
  add(4, 3, SPOTS.workshop.x, SPOTS.workshop.y + 0.4, 1.6); // workers
  add(5, 14, -10.4, -2.2, 4.2); // the terraced village fills with people
  add(5, 12, -4.2, 1.2, 5); // and the old quarter
  add(6, 6, 11, -0.6, 7); // farmers in the gardens
  add(7, 16, SPOTS.souq.x, SPOTS.souq.y, 2.6); // souq crowd
  add(7, 6, -0.4, 3.6, 2.6); // near the shop and road
  return out;
}

export function People({ levelsDone, fresh, delay }: { levelsDone: boolean[]; fresh: number | null; delay: number }) {
  const list = useMemo(walkers, []);
  const body = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  const cap = useRef<THREE.InstancedMesh>(null);
  const appear = useRef<number[]>(list.map(() => 1));
  const startAt = useRef<number | null>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  const axis = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    list.forEach((w, i) => {
      c.set(w.robe);
      body.current!.setColorAt(i, c);
      c.set(w.woman ? w.robe : '#a8724e');
      head.current!.setColorAt(i, c);
    });
    body.current!.instanceColor!.needsUpdate = true;
    head.current!.instanceColor!.needsUpdate = true;
  }, [list]);

  useFrame(({ clock }) => {
    if (!body.current || !head.current || !cap.current) return;
    const t = clock.getElapsedTime();
    if (fresh !== null && startAt.current === null) startAt.current = t + delay;
    if (fresh === null) startAt.current = null;
    list.forEach((w, i) => {
      const visible = w.level === -2 || levelsDone[w.level];
      let k = visible ? 1 : 0;
      if (visible && fresh === w.level && startAt.current !== null) {
        k = Math.min(1, Math.max(0, (t - startAt.current - (i % 9) * 0.12) / 0.6));
      }
      appear.current[i] = k;
      const a = w.still ? w.phase : t * w.speed + w.phase;
      const x = w.cx + Math.cos(a) * (w.still ? 0.25 : w.rx);
      const z = w.cz + Math.sin(a) * (w.still ? 0.25 : w.rz);
      const y = heightAt(x, z);
      const bob = w.still ? 0 : Math.abs(Math.sin(t * 7 + i)) * 0.012;
      const facing = w.still ? 0 : -a + (w.speed > 0 ? Math.PI : 0);
      q.setFromAxisAngle(axis, facing);
      const sc = Math.max(0.0001, k);
      v.set(x, y + 0.13 * sc + bob, z);
      s.set(sc, sc, sc);
      m.compose(v, q, s);
      body.current!.setMatrixAt(i, m);
      v.set(x, y + 0.29 * sc + bob, z);
      m.compose(v, q, s);
      head.current!.setMatrixAt(i, m);
      v.set(x, y + 0.325 * sc + bob, z);
      s.set(w.woman ? 0.0001 : sc, sc, w.woman ? 0.0001 : sc);
      m.compose(v, q, s);
      cap.current!.setMatrixAt(i, m);
    });
    body.current.instanceMatrix.needsUpdate = true;
    head.current.instanceMatrix.needsUpdate = true;
    cap.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={body} args={[undefined, undefined, list.length]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.045, 0.07, 0.26, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, list.length]} castShadow frustumCulled={false}>
        <sphereGeometry args={[0.042, 10, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={cap} args={[undefined, undefined, list.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.04, 0.043, 0.035, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </instancedMesh>
    </group>
  );
}

// ─── Moving cars ───────────────────────────────────────────────────────────────

export function Traffic({ count, lights }: { count: number; lights: boolean }) {
  const { curve } = useMemo(() => pointsOnCurve(ROAD_POINTS, 0.02, 200), []);
  const cars = useRef<(THREE.Group | null)[]>([]);
  const colors = ['#f4f4f2', '#d8dadc', '#f4f4f2', '#2b2f33', '#9a1f1f'];
  const tangent = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    cars.current.forEach((g, i) => {
      if (!g) return;
      const forward = i % 2 === 0;
      let u = (t * 0.035 + i / Math.max(1, count)) % 1;
      if (!forward) u = 1 - u;
      const p = curve.getPointAt(u);
      curve.getTangentAt(u, tangent);
      if (!forward) tangent.negate();
      const lane = (forward ? 1 : -1) * 0.16;
      g.position.set(p.x - tangent.z * lane, p.y, p.z + tangent.x * lane);
      g.rotation.y = Math.atan2(-tangent.z, tangent.x);
    });
  });
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} ref={el => (cars.current[i] = el)} scale={0.62}>
          <Car color={colors[i % colors.length]} pickup={i % 3 === 2} lights={lights} />
        </group>
      ))}
    </group>
  );
}

export function ParkedCars({ show }: { show: boolean }) {
  if (!show) return null;
  const spots: [number, number, number, string][] = [
    [SPOTS.souq.x + 2.3, SPOTS.souq.y + 1.6, 0.2, '#f4f4f2'],
    [SPOTS.souq.x + 2.3, SPOTS.souq.y + 1.0, 0.2, '#c9ccd0'],
    [SPOTS.souq.x - 2.4, SPOTS.souq.y + 1.5, -0.1, '#2b2f33'],
    [SPOTS.shop.x + 1.3, SPOTS.shop.y + 0.6, Math.PI / 2, '#f4f4f2'],
  ];
  return (
    <group>
      {spots.map(([x, z, r, c], i) => (
        <group key={i} position={[x, heightAt(x, z), z]} rotation={[0, r, 0]} scale={0.62}>
          <Car color={c} />
        </group>
      ))}
    </group>
  );
}

// ─── Camels resting near the dunes ─────────────────────────────────────────────

export function Camels() {
  const herd: [number, number, number][] = [
    [14.2, 9.8, 0.6],
    [15.1, 10.4, -0.4],
    [13.4, 10.8, 1.9],
  ];
  const c = '#c49558';
  return (
    <group>
      {herd.map(([x, z, r], i) => (
        <group key={i} position={[x, heightAt(x, z), z]} rotation={[0, r, 0]} scale={0.75}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.52, 0.22, 0.22]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
          <mesh position={[-0.02, 0.56, 0]} castShadow>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
          <mesh position={[0.3, 0.6, 0]} rotation={[0, 0, -0.55]} castShadow>
            <boxGeometry args={[0.08, 0.32, 0.08]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
          <mesh position={[0.41, 0.75, 0]} castShadow>
            <boxGeometry args={[0.15, 0.08, 0.08]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
          {[
            [-0.19, -0.07],
            [-0.19, 0.07],
            [0.19, -0.07],
            [0.19, 0.07],
          ].map(([lx, lz], k) => (
            <mesh key={k} position={[lx, 0.16, lz]} castShadow>
              <cylinderGeometry args={[0.024, 0.03, 0.34, 5]} />
              <meshStandardMaterial color={c} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ─── Fireworks in the colours of the flag ──────────────────────────────────────

const FW_COLORS = ['#ff3b4e', '#ffffff', '#2fd17a', '#ffd166', '#ff3b4e'];

function Burst({ seed, origin }: { seed: number; origin: [number, number, number] }) {
  const N = 140;
  const ref = useRef<THREE.Points>(null);
  const r = useMemo(() => rng(seed), [seed]);
  const vel = useMemo(() => new Float32Array(N * 3), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);
  const mat = useMemo(
    () => new THREE.PointsMaterial({ size: 0.16, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffffff' }),
    []
  );
  const state = useRef({ t0: -100, center: new THREE.Vector3() });
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const st = state.current;
    const life = 2.1;
    if (t - st.t0 > life + r() * 0.8) {
      st.t0 = t;
      st.center.set(origin[0] + (r() - 0.5) * 6, origin[1] + 4.5 + r() * 2.5, origin[2] + (r() - 0.5) * 4);
      mat.color.set(FW_COLORS[Math.floor(r() * FW_COLORS.length)]);
      for (let i = 0; i < N; i++) {
        const u = r() * 2 - 1;
        const th = r() * Math.PI * 2;
        const sq = Math.sqrt(1 - u * u);
        const sp = 1.6 + r() * 0.8;
        vel[i * 3] = sq * Math.cos(th) * sp;
        vel[i * 3 + 1] = u * sp;
        vel[i * 3 + 2] = sq * Math.sin(th) * sp;
      }
    }
    const age = t - st.t0;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      pos.setXYZ(
        i,
        st.center.x + vel[i * 3] * age,
        st.center.y + vel[i * 3 + 1] * age - 0.9 * age * age,
        st.center.z + vel[i * 3 + 2] * age
      );
    }
    pos.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - age / life);
    mat.size = 0.18 * (1 - age / (life * 1.5));
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

export function Fireworks() {
  const origin: [number, number, number] = [SPOTS.fort.x, heightAt(SPOTS.fort.x, SPOTS.fort.y), SPOTS.fort.y];
  return (
    <group>
      {[1, 2, 3, 4, 5].map(sd => (
        <Burst key={sd} seed={sd * 17} origin={origin} />
      ))}
    </group>
  );
}
