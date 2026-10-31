// Ground, cut sides, plinth, vegetation, rocks, the falaj and water.

import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  BASE_BOTTOM,
  FALAJ_POINTS,
  GARDENS,
  SPOTS,
  WORLD,
  blocked,
  buildSkirt,
  buildTerrain,
  distToFalaj,
  distToRoad,
  heightAt,
  inGarden,
  paintTerrain,
  pointsOnCurve,
  scatter,
  type Spot,
} from './world';
import {
  datesGeometry,
  ghafGeometry,
  noiseTexture,
  palmCrownGeometry,
  palmTrunkGeometry,
  swayMaterial,
  timeUniform,
  waterTexture,
} from './materials';

const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

/** 0 → 1 over `dur` seconds after `delay`, starting when `run` turns true. */
export function useGrowth(run: boolean, delay = 0, dur = 1.2) {
  const start = useRef<number | null>(null);
  const value = useRef(run ? 1 : 0);
  useFrame(({ clock }) => {
    if (!run) {
      start.current = null;
      return;
    }
    if (value.current >= 1) return;
    if (start.current === null) start.current = clock.getElapsedTime() + delay;
    value.current = Math.min(1, Math.max(0, (clock.getElapsedTime() - start.current) / dur));
  });
  return value;
}

/** Shows children; when `animate` is true they grow in with a small bounce. */
export function Reveal({
  show,
  animate,
  delay = 0,
  position,
  rotation,
  children,
}: {
  show: boolean;
  animate: boolean;
  delay?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !show) return;
    if (!animate) {
      ref.current.scale.setScalar(1);
      return;
    }
    if (start.current === null) start.current = clock.getElapsedTime() + delay;
    const t = Math.min(1, Math.max(0, (clock.getElapsedTime() - start.current) / 0.9));
    ref.current.scale.setScalar(Math.max(0.0001, t === 0 ? 0.0001 : easeOutBack(t)));
  });
  if (!show) return null;
  return (
    <group ref={ref} position={position} rotation={rotation} scale={animate ? 0.0001 : 1}>
      {children}
    </group>
  );
}

// ─── Ground ────────────────────────────────────────────────────────────────────

/**
 * The ground. Each level owns an area of the valley: locked areas look faded,
 * like unexplored land; borders glow (gold for the current level, teal when
 * finished).
 * zoneStates: 0 locked, 1 current/open, 2 finished — one per level 0..7.
 */
export function Ground({ green, zoneStates }: { green: number; zoneStates: number[] }) {
  const { geo, dry, lush } = useMemo(() => {
    const g = buildTerrain(0);
    const d = (g.attributes.color.array as Float32Array).slice();
    paintTerrain(g, 1);
    const l = (g.attributes.color.array as Float32Array).slice();
    return { geo: g, dry: d, lush: l };
  }, []);
  const current = useRef(-1);
  const skirt = useMemo(buildSkirt, []);
  const tex = useMemo(() => {
    const t = noiseTexture().clone();
    t.repeat.set(22, 16);
    t.needsUpdate = true;
    return t;
  }, []);
  const uniforms = useMemo(
    () => ({
      uLock: { value: zoneStates.map(s => (s === 0 ? 1 : 0)) },
      uState: { value: zoneStates.slice() },
    }),
    []
  );
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, roughness: 0.96, metalness: 0 });
    m.onBeforeCompile = shader => {
      shader.uniforms.uLock = uniforms.uLock;
      shader.uniforms.uState = uniforms.uState;
      shader.uniforms.uTime = timeUniform;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          attribute float aZone;
          attribute float aEdge;
          uniform float uLock[8];
          uniform float uState[8];
          uniform float uTime;
          varying float vLock;
          varying vec3 vEdgeCol;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vLock = 0.0;
          vEdgeCol = vec3(0.0);
          if (aZone > -0.5) {
            int zi = int(aZone + 0.5);
            vLock = uLock[zi];
            float st = uState[zi];
            vec3 c = st > 2.5 ? vec3(0.0) : st > 1.5 ? vec3(0.45, 2.3, 1.85) : (st > 0.5 ? vec3(3.2, 2.1, 0.45) * (0.65 + 0.35 * sin(uTime * 3.0)) : vec3(0.0));
            vEdgeCol = c * aEdge;
          }`
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          varying float vLock;
          varying vec3 vEdgeCol;`
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(lum) * vec3(0.97, 0.95, 0.92), vLock * 0.62);`
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          totalEmissiveRadiance += vEdgeCol;`
        );
    };
    return m;
  }, [tex, uniforms]);

  useFrame((_, dt) => {
    // fade areas in and out smoothly
    const lock = uniforms.uLock.value as number[];
    zoneStates.forEach((s, i) => {
      const target = s === 0 ? 1 : 0;
      lock[i] += (target - lock[i]) * Math.min(1, dt * 1.5);
      (uniforms.uState.value as number[])[i] = s;
    });

    const apply = () => {
      const arr = geo.attributes.color.array as Float32Array;
      const k = current.current;
      for (let i = 0; i < arr.length; i++) arr[i] = dry[i] + (lush[i] - dry[i]) * k;
      geo.attributes.color.needsUpdate = true;
    };
    if (current.current < 0) {
      current.current = green;
      apply();
      return;
    }
    if (current.current === green) return;
    const diff = green - current.current;
    current.current = Math.abs(diff) < 0.003 ? green : current.current + diff * Math.min(1, dt * 1.2);
    apply();
  });

  return (
    <group>
      <mesh geometry={geo} material={material} receiveShadow castShadow />
      <mesh geometry={skirt} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* walnut plinth like a museum model */}
      <mesh position={[0, BASE_BOTTOM - 0.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[WORLD.w + 1.4, 0.6, WORLD.d + 1.4]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, BASE_BOTTOM - 0.02, 0]} receiveShadow>
        <boxGeometry args={[WORLD.w + 0.6, 0.06, WORLD.d + 0.6]} />
        <meshStandardMaterial color="#c9a46a" roughness={0.35} metalness={0.6} />
      </mesh>
    </group>
  );
}

// ─── Instanced helpers ─────────────────────────────────────────────────────────

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3();

function setInstance(mesh: THREE.InstancedMesh, i: number, x: number, y: number, z: number, rx: number, ry: number, rz: number, sx: number, sy = sx, sz = sx) {
  tmpE.set(rx, ry, rz);
  tmpQ.setFromEuler(tmpE);
  tmpV.set(x, y, z);
  tmpS.set(sx, sy, sz);
  tmpM.compose(tmpV, tmpQ, tmpS);
  mesh.setMatrixAt(i, tmpM);
}

// ─── Palms ─────────────────────────────────────────────────────────────────────

interface PalmSpot extends Spot {
  lean: number;
  extra: boolean;
}

function palmSpots(): PalmSpot[] {
  const base = scatter(
    210,
    41,
    (x, z) => z > -6.5 && !blocked(x, z, 0.3) && distToRoad(x, z) > 0.7 && distToFalaj(x, z) > 0.32 && (inGarden(x, z) || distToFalaj(x, z) < 1.1 || (z > 7.6 && z < 10.6 && x < 8)),
    [0.85, 1.25]
  ).map(s => ({ ...s, lean: (Math.random() - 0.5) * 0.18, extra: false }));
  const extra = scatter(
    260,
    43,
    (x, z) => z > -6.5 && !blocked(x, z, 0.3) && distToRoad(x, z) > 0.7 && distToFalaj(x, z) > 0.32 && (inGarden(x, z, 1.05) || distToFalaj(x, z) < 1.6),
    [0.8, 1.3]
  ).map(s => ({ ...s, lean: (Math.random() - 0.5) * 0.2, extra: true }));
  return [...base, ...extra];
}

export function Palms({ lush, animate, delay }: { lush: boolean; animate: boolean; delay: number }) {
  const spots = useMemo(palmSpots, []);
  const trunkGeo = useMemo(palmTrunkGeometry, []);
  const crownGeo = useMemo(palmCrownGeometry, []);
  const dateGeo = useMemo(datesGeometry, []);
  const trunk = useRef<THREE.InstancedMesh>(null);
  const crown = useRef<THREE.InstancedMesh>(null);
  const dates = useRef<THREE.InstancedMesh>(null);
  const crownMat = useMemo(() => swayMaterial({ color: '#ffffff', roughness: 0.8, side: THREE.DoubleSide }, 0.05), []);
  const growth = useGrowth(lush, delay, 2.2);
  const lastGrowth = useRef(-1);

  useLayoutEffect(() => {
    if (!trunk.current || !crown.current) return;
    const c = new THREE.Color();
    spots.forEach((s, i) => {
      c.setHSL(0.27 + Math.random() * 0.05, 0.42 + Math.random() * 0.15, 0.24 + Math.random() * 0.08);
      crown.current!.setColorAt(i, c);
      c.setHSL(0.08, 0.3, 0.3 + Math.random() * 0.08);
      trunk.current!.setColorAt(i, c);
    });
    crown.current.instanceColor!.needsUpdate = true;
    trunk.current.instanceColor!.needsUpdate = true;
  }, [spots]);

  useFrame(() => {
    if (!trunk.current || !crown.current || !dates.current) return;
    const g = lush ? (animate ? growth.current : 1) : 0;
    if (g === lastGrowth.current) return;
    lastGrowth.current = g;
    spots.forEach((s, i) => {
      let k = 1;
      if (s.extra) {
        // each new palm sprouts at a slightly different time
        const local = Math.min(1, Math.max(0, g * 1.6 - (i % 17) / 17 * 0.6));
        k = local === 0 ? 0.0001 : easeOutBack(local);
      }
      const sc = s.s * k;
      setInstance(trunk.current!, i, s.x, s.y - 0.05, s.z, 0, s.r, s.lean, sc);
      setInstance(crown.current!, i, s.x, s.y - 0.05, s.z, 0, s.r, s.lean, sc);
      setInstance(dates.current!, i, s.x, s.y - 0.05, s.z, 0, s.r, s.lean, lush ? sc : 0.0001);
    });
    trunk.current.instanceMatrix.needsUpdate = true;
    crown.current.instanceMatrix.needsUpdate = true;
    dates.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={trunk} args={[trunkGeo, undefined, spots.length]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" roughness={0.95} map={noiseTexture()} />
      </instancedMesh>
      <instancedMesh ref={crown} args={[crownGeo, crownMat, spots.length]} castShadow receiveShadow frustumCulled={false} />
      <instancedMesh ref={dates} args={[dateGeo, undefined, spots.length]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#c2621a" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

// ─── Ghaf trees, shrubs, rocks ─────────────────────────────────────────────────

export function Scrub() {
  const ghaf = useMemo(
    () => scatter(80, 51, (x, z) => z > -5.5 && !blocked(x, z, 0.6) && !inGarden(x, z, 1.2) && distToRoad(x, z) > 1 && distToFalaj(x, z) > 1.2, [0.9, 1.5]),
    []
  );
  const shrubs = useMemo(
    () => scatter(720, 52, (x, z) => !blocked(x, z, 0.2) && distToRoad(x, z) > 0.6 && distToFalaj(x, z) > 0.4 && heightAt(x, z) < 6, [0.5, 1.3]),
    []
  );
  const rocks = useMemo(
    () => scatter(130, 53, (x, z) => ((z < -4 && z > -9) || Math.abs(z - 9.2) < 1.6 || Math.abs(x) > 17) && !blocked(x, z, 0.3) && distToRoad(x, z) > 0.6, [0.5, 1.6]),
    []
  );
  const { trunk: ghafTrunk, crown: ghafCrown } = useMemo(ghafGeometry, []);
  const shrubGeo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.16, 0);
    g.scale(1.2, 0.75, 1.1);
    g.translate(0, 0.08, 0);
    return g;
  }, []);
  const rockGeo = useMemo(() => {
    const g = new THREE.DodecahedronGeometry(0.22, 0);
    g.scale(1.3, 0.7, 1);
    return g;
  }, []);
  const crownMat = useMemo(() => swayMaterial({ color: '#ffffff', roughness: 0.85, flatShading: true }, 0.03), []);
  const refs = {
    gt: useRef<THREE.InstancedMesh>(null),
    gc: useRef<THREE.InstancedMesh>(null),
    sh: useRef<THREE.InstancedMesh>(null),
    rk: useRef<THREE.InstancedMesh>(null),
  };

  useLayoutEffect(() => {
    const c = new THREE.Color();
    ghaf.forEach((s, i) => {
      setInstance(refs.gt.current!, i, s.x, s.y - 0.05, s.z, 0, s.r, 0, s.s);
      setInstance(refs.gc.current!, i, s.x, s.y - 0.05, s.z, 0, s.r, 0, s.s);
      c.setHSL(0.2 + Math.random() * 0.06, 0.3 + Math.random() * 0.15, 0.3 + Math.random() * 0.08);
      refs.gc.current!.setColorAt(i, c);
    });
    shrubs.forEach((s, i) => {
      setInstance(refs.sh.current!, i, s.x, s.y, s.z, 0, s.r, 0, s.s);
      c.setHSL(0.16 + Math.random() * 0.1, 0.25 + Math.random() * 0.2, 0.3 + Math.random() * 0.12);
      refs.sh.current!.setColorAt(i, c);
    });
    rocks.forEach((s, i) => {
      setInstance(refs.rk.current!, i, s.x, s.y + 0.02, s.z, Math.random(), s.r, Math.random() * 0.4, s.s);
      c.setHSL(0.06 + Math.random() * 0.02, 0.22 + Math.random() * 0.1, 0.3 + Math.random() * 0.1);
      refs.rk.current!.setColorAt(i, c);
    });
    Object.values(refs).forEach(r => {
      r.current!.instanceMatrix.needsUpdate = true;
      if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true;
    });
  }, [ghaf, shrubs, rocks]);

  return (
    <group>
      <instancedMesh ref={refs.gt} args={[ghafTrunk, undefined, ghaf.length]} castShadow>
        <meshStandardMaterial color="#5a4330" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={refs.gc} args={[ghafCrown, crownMat, ghaf.length]} castShadow receiveShadow />
      <instancedMesh ref={refs.sh} args={[shrubGeo, undefined, shrubs.length]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
      </instancedMesh>
      <instancedMesh ref={refs.rk} args={[rockGeo, undefined, rocks.length]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

// ─── The falaj ─────────────────────────────────────────────────────────────────

export function ribbon(points: THREE.Vector3[], half: number, lift: number, wallHeight = 0) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  let length = 0;
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const next = points[Math.min(points.length - 1, i + 1)];
    const prev = points[Math.max(0, i - 1)];
    const dir = new THREE.Vector3().subVectors(next, prev).setY(0).normalize();
    const side = new THREE.Vector3().crossVectors(up, dir).normalize();
    if (i > 0) length += p.distanceTo(points[i - 1]);
    const y = p.y + lift;
    if (wallHeight > 0) {
      // a wall: outer bottom, outer top, inner top, inner bottom
      const o = side.clone().multiplyScalar(half);
      const w = side.clone().multiplyScalar(0.07);
      pos.push(p.x + o.x + w.x, y - 0.15, p.z + o.z + w.z, p.x + o.x + w.x, y + wallHeight, p.z + o.z + w.z, p.x + o.x - w.x, y + wallHeight, p.z + o.z - w.z, p.x + o.x - w.x, y - 0.15, p.z + o.z - w.z);
      uv.push(length, 0, length, 0.3, length, 0.6, length, 1);
    } else {
      pos.push(p.x + side.x * half, y, p.z + side.z * half, p.x - side.x * half, y, p.z - side.z * half);
      uv.push(length, 0, length, 1);
    }
  }
  const stride = wallHeight > 0 ? 4 : 2;
  for (let i = 0; i < points.length - 1; i++) {
    for (let k = 0; k < stride - 1; k++) {
      const a = i * stride + k;
      const b = a + 1;
      const c = a + stride;
      const d = b + stride;
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return { geo: g, length };
}

export function Falaj({ flowing, animate, delay }: { flowing: boolean; animate: boolean; delay: number }) {
  const { points } = useMemo(() => pointsOnCurve(FALAJ_POINTS, 0.02, 320), []);
  const walls = useMemo(() => [ribbon(points, 0.17, 0, 0.12).geo, ribbon(points, -0.17, 0, 0.12).geo], [points]);
  const bed = useMemo(() => ribbon(points, 0.16, 0.0).geo, [points]);
  const water = useMemo(() => ribbon(points, 0.12, 0.07).geo, [points]);
  const tex = useMemo(() => {
    const t = waterTexture().clone();
    t.repeat.set(0.6, 1);
    t.needsUpdate = true;
    return t;
  }, []);
  const growth = useGrowth(flowing, delay, 3.5);
  const total = (water.index as THREE.BufferAttribute).count;

  useFrame((_, dt) => {
    tex.offset.x -= dt * 0.35;
    const g = flowing ? (animate ? growth.current : 1) : 0;
    water.setDrawRange(0, Math.floor((total / 6) * g) * 6);
  });

  return (
    <group>
      {walls.map((g, i) => (
        <mesh key={i} geometry={g} castShadow receiveShadow>
          <meshStandardMaterial color="#b79c7c" roughness={0.9} map={noiseTexture()} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={bed} receiveShadow>
        <meshStandardMaterial color="#9c8466" roughness={1} />
      </mesh>
      <mesh geometry={water}>
        <meshStandardMaterial map={tex} color="#9fe8f2" roughness={0.15} metalness={0.1} emissive="#0e5a66" emissiveIntensity={0.35} transparent opacity={0.92} />
      </mesh>
    </group>
  );
}

/** The spring at the foot of the mountains, and pools in the wadi. */
export function Waters({ spring, pools, animate, delay }: { spring: boolean; pools: boolean; animate: boolean; delay: number }) {
  const tex = useMemo(() => {
    const t = waterTexture().clone();
    t.repeat.set(2, 2);
    t.needsUpdate = true;
    return t;
  }, []);
  useFrame((_, dt) => {
    tex.offset.x += dt * 0.03;
    tex.offset.y += dt * 0.02;
    timeUniform.value += dt;
  });
  const sx = SPOTS.spring.x;
  const sz = SPOTS.spring.y;
  const sy = heightAt(sx, sz);
  const poolSpots = useMemo(
    () =>
      [-9, -3.5, 2.5, 7.5].map(x => {
        const z = 9.2 + Math.sin(x * 0.23 + 0.6) * 1.4;
        let low = Infinity;
        for (let dx = -1; dx <= 1; dx += 0.5) low = Math.min(low, heightAt(x + dx, z));
        return { x, z, y: low + 0.12 };
      }),
    []
  );
  const stones = useMemo(() => Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2), []);
  return (
    <group>
      <group position={[sx, sy, sz]}>
        {stones.map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.75, 0.08, Math.sin(a) * 0.6]} rotation={[i, i * 2, 0]} castShadow>
            <dodecahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#8a7a68" roughness={0.9} flatShading />
          </mesh>
        ))}
        <Reveal show={spring} animate={animate} delay={delay} position={[0, 0.06, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.8, 1]}>
            <circleGeometry args={[0.72, 24]} />
            <meshStandardMaterial map={tex} color="#a6eef7" roughness={0.1} emissive="#0e5a66" emissiveIntensity={0.3} />
          </mesh>
        </Reveal>
      </group>
      {poolSpots.map((p, i) => (
        <Reveal key={i} show={pools} animate={animate} delay={delay + i * 0.25} position={[p.x, p.y, p.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.6, 0.7, 1]}>
            <circleGeometry args={[0.9, 24]} />
            <meshStandardMaterial map={tex} color="#9fe3ee" roughness={0.08} metalness={0.15} emissive="#0e5a66" emissiveIntensity={0.25} transparent opacity={0.94} />
          </mesh>
        </Reveal>
      ))}
    </group>
  );
}


/** Low mud walls around the palm gardens, with gaps where the falaj and road pass. */
export function GardenWalls() {
  const geos = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (const [cx, cz, rx, rz] of GARDENS) {
      let seg: THREE.Vector3[] = [];
      const flush = () => {
        if (seg.length > 2) out.push(ribbon(seg, 0, 0, 0.16).geo);
        seg = [];
      };
      const n = 90;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = cx + Math.cos(a) * rx * 1.1;
        const z = cz + Math.sin(a) * rz * 1.1;
        const ok = distToFalaj(x, z) > 0.45 && distToRoad(x, z) > 0.6 && !blocked(x, z, 0.2) && Math.abs(x) < WORLD.w / 2 - 0.4 && Math.abs(z) < WORLD.d / 2 - 0.4;
        if (ok) seg.push(new THREE.Vector3(x, heightAt(x, z) + 0.02, z));
        else flush();
      }
      flush();
    }
    return out;
  }, []);
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} castShadow receiveShadow>
          <meshStandardMaterial color="#c4a074" roughness={0.95} map={noiseTexture()} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
