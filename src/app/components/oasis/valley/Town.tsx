// Buildings: the village houses, the fort, the watchtower, the souq, your shop,
// your workshop, and the road with its street lamps.

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROAD_POINTS, SPOTS, heightAt, houseSpots, pointsOnCurve } from './world';
import { noiseTexture, plasterTexture, swayMaterial } from './materials';
import { Reveal, ribbon, useGrowth } from './Nature';

const MUD = '#cfa97a';
const MUD_DARK = '#b88f5e';
const WOOD = '#5b3a22';

function Plaster({ color = MUD, rough = 0.95 }: { color?: string; rough?: number }) {
  return <meshStandardMaterial color={color} map={plasterTexture()} roughness={rough} />;
}

const WARM = new THREE.Color('#ffc46b');

// ─── Village houses (instanced) ────────────────────────────────────────────────

export function Houses({ night }: { night: boolean }) {
  const spots = useMemo(houseSpots, []);
  const body = useRef<THREE.InstancedMesh>(null);
  const parapet = useRef<THREE.InstancedMesh>(null);
  const windows = useRef<THREE.InstancedMesh>(null);
  const doors = useRef<THREE.InstancedMesh>(null);
  const boxGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  const winMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a1d14', roughness: 0.6 }), []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const c = new THREE.Color();
    const tones = ['#d6b88e', '#cba57a', '#c19b6d', '#dcc39c', '#b98f60'];
    const modern = '#ece3d2';
    let w = 0;
    spots.forEach((s, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.r);
      const isModern = s.z > 6;
      v.set(s.x, s.y - 0.35, s.z);
      sc.set(s.w, s.h + 0.35, s.d);
      m.compose(v, q, sc);
      body.current!.setMatrixAt(i, m);
      c.set(isModern ? modern : tones[Math.floor(s.tone * tones.length)]);
      body.current!.setColorAt(i, c);
      v.set(s.x, s.y + s.h, s.z);
      sc.set(s.w + 0.06, 0.07, s.d + 0.06);
      m.compose(v, q, sc);
      parapet.current!.setMatrixAt(i, m);
      c.multiplyScalar(0.9);
      parapet.current!.setColorAt(i, c);
      // two windows per storey on the front, one door
      const front = new THREE.Vector3(0, 0, s.d / 2 + 0.012).applyQuaternion(q);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
      for (let st = 0; st < s.storeys; st++) {
        for (const side of [-0.24, 0.24]) {
          if (st === 0 && side < 0) continue;
          v.set(s.x + front.x + right.x * side * s.w, s.y + 0.22 + st * (s.h / s.storeys), s.z + front.z + right.z * side * s.w);
          sc.set(0.12, 0.14, 0.02);
          m.compose(v, q, sc);
          windows.current!.setMatrixAt(w++, m);
        }
      }
      v.set(s.x + front.x - right.x * 0.22 * s.w, s.y - 0.02, s.z + front.z - right.z * 0.22 * s.w);
      sc.set(0.16, 0.3, 0.02);
      m.compose(v, q, sc);
      doors.current!.setMatrixAt(i, m);
    });
    windows.current!.count = w;
    [body, parapet, windows, doors].forEach(r => {
      r.current!.instanceMatrix.needsUpdate = true;
      if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true;
    });
  }, [spots]);

  useLayoutEffect(() => {
    winMat.emissive = night ? WARM : new THREE.Color('#000000');
    winMat.emissiveIntensity = night ? 2.2 : 0;
    winMat.color.set(night ? '#ffcf86' : '#2a1d14');
  }, [night, winMat]);

  return (
    <group>
      <instancedMesh ref={body} args={[boxGeo, undefined, spots.length]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" map={plasterTexture()} roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={parapet} args={[undefined, undefined, spots.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, winMat, spots.length * 4]}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={doors} args={[undefined, undefined, spots.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

// ─── Building parts ────────────────────────────────────────────────────────────

function Teeth({ w, d, y, size = 0.12, color = MUD }: { w: number; d: number; y: number; size?: number; color?: string }) {
  const items: [number, number][] = [];
  const step = size * 2;
  for (let x = -w / 2 + size / 2; x <= w / 2 - size / 2 + 1e-6; x += step) items.push([x, -d / 2 + size / 2], [x, d / 2 - size / 2]);
  for (let z = -d / 2 + size * 1.5; z <= d / 2 - size * 1.5 + 1e-6; z += step) items.push([-w / 2 + size / 2, z], [w / 2 - size / 2, z]);
  return (
    <group>
      {items.map(([x, z], i) => (
        <mesh key={i} position={[x, y + size / 2, z]} castShadow>
          <boxGeometry args={[size, size, size]} />
          <Plaster color={color} />
        </mesh>
      ))}
    </group>
  );
}

function RoundTeeth({ r, y, n, size = 0.14, color = MUD }: { r: number; y: number; n: number; size?: number; color?: string }) {
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * r, y + size / 2, Math.sin(a) * r]} rotation={[0, -a, 0]} castShadow>
            <boxGeometry args={[size * 0.8, size, size * 1.2]} />
            <Plaster color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

function Lantern({ position, on }: { position: [number, number, number]; on: boolean }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.06, 10, 8]} />
      <meshStandardMaterial color={on ? '#ffd38a' : '#7a6a55'} emissive={on ? '#ffb54d' : '#000000'} emissiveIntensity={on ? 4 : 0} />
    </mesh>
  );
}

/** Flag of Oman (simplified), waving. */
function Flag({ height }: { height: number }) {
  const mat = useMemo(() => swayMaterial({ vertexColors: true, roughness: 0.7, side: THREE.DoubleSide }, 0.25), []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.66, 0.4, 10, 3);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const col: number[] = [];
    const red = new THREE.Color('#c8102e');
    const white = new THREE.Color('#ffffff');
    const green = new THREE.Color('#008751');
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + 0.33;
      const y = pos.getY(i);
      const c = x < 0.2 ? red : y > 0.066 ? white : y < -0.066 ? green : red;
      col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.translate(0.33, 0, 0);
    return g;
  }, []);
  return (
    <group position={[0, height, 0]}>
      <mesh geometry={geo} material={mat} castShadow />
    </group>
  );
}

// ─── The fort (inspired by Nizwa Fort's round tower) ───────────────────────────

export function Fort({ open, animate, delay, night }: { open: boolean; animate: boolean; delay: number; night: boolean }) {
  const x = SPOTS.fort.x;
  const z = SPOTS.fort.y;
  const y = heightAt(x, z);
  const W = 3.6;
  const D = 3.2;
  const H = 1.25;
  const T = 0.3;
  const sink = 0.8;
  const leftDoor = useRef<THREE.Group>(null);
  const rightDoor = useRef<THREE.Group>(null);
  const flag = useRef<THREE.Group>(null);
  const growth = useGrowth(open, delay, 2.4);

  useFrame(() => {
    const g = open ? (animate ? growth.current : 1) : 0;
    if (leftDoor.current) leftDoor.current.rotation.y = -1.25 * g;
    if (rightDoor.current) rightDoor.current.rotation.y = 1.25 * g;
    if (flag.current) flag.current.position.y = 0.6 + g * 1.0;
  });

  const wall = (px: number, pz: number, w: number, d: number) => (
    <mesh position={[px, (H - sink) / 2, pz]} castShadow receiveShadow>
      <boxGeometry args={[w, H + sink, d]} />
      <Plaster />
    </mesh>
  );
  const gate = 0.62;
  const side = (W - gate) / 2;

  return (
    <group position={[x, y, z]}>
      {/* courtyard walls with a gate in front */}
      {wall(0, -D / 2, W, T)}
      {wall(-W / 2, 0, T, D)}
      {wall(W / 2, 0, T, D)}
      {wall(-W / 2 + side / 2, D / 2, side, T)}
      {wall(W / 2 - side / 2, D / 2, side, T)}
      <mesh position={[0, H - 0.12, D / 2]} castShadow>
        <boxGeometry args={[gate + 0.1, 0.3, T + 0.04]} />
        <Plaster color={MUD_DARK} />
      </mesh>
      <Teeth w={W} d={D} y={H} size={0.13} />
      {/* gate doors */}
      <group ref={leftDoor} position={[-gate / 2, 0, D / 2 + 0.02]}>
        <mesh position={[gate / 4, (H - 0.3) / 2, 0]} castShadow>
          <boxGeometry args={[gate / 2, H - 0.3, 0.06]} />
          <meshStandardMaterial color={WOOD} roughness={0.7} />
        </mesh>
      </group>
      <group ref={rightDoor} position={[gate / 2, 0, D / 2 + 0.02]}>
        <mesh position={[-gate / 4, (H - 0.3) / 2, 0]} castShadow>
          <boxGeometry args={[gate / 2, H - 0.3, 0.06]} />
          <meshStandardMaterial color={WOOD} roughness={0.7} />
        </mesh>
      </group>
      {/* corner towers */}
      {[
        [W / 2, D / 2],
        [-W / 2, D / 2],
        [W / 2, -D / 2],
      ].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, (1.8 - sink) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.72, 1.8 + sink, 0.72]} />
            <Plaster color={i === 1 ? MUD_DARK : MUD} />
          </mesh>
          <Teeth w={0.72} d={0.72} y={1.8} size={0.12} />
          {[0.6, 1.2].map(h => (
            <mesh key={h} position={[0, h, 0.365]}>
              <boxGeometry args={[0.06, 0.18, 0.02]} />
              <meshStandardMaterial color="#2a1d14" />
            </mesh>
          ))}
        </group>
      ))}
      {/* the great round tower */}
      <group position={[-0.75, 0, -0.55]}>
        <mesh position={[0, (2.6 - sink) / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.12, 1.28, 2.6 + sink, 36]} />
          <Plaster color="#c9a273" />
        </mesh>
        <mesh position={[0, 2.62, 0]} castShadow>
          <cylinderGeometry args={[1.16, 1.12, 0.08, 36]} />
          <Plaster color={MUD_DARK} />
        </mesh>
        <RoundTeeth r={1.08} y={2.64} n={26} size={0.15} />
        {[0.9, 1.6, 2.2].map((h, i) =>
          [0.3, 1.1, 1.9].map(a => (
            <mesh key={`${h}${a}`} position={[Math.cos(a + i * 0.4) * 1.2, h, Math.sin(a + i * 0.4) * 1.2]} rotation={[0, -(a + i * 0.4) + Math.PI / 2, 0]}>
              <boxGeometry args={[0.07, 0.2, 0.04]} />
              <meshStandardMaterial color="#2a1d14" />
            </mesh>
          ))
        )}
        <mesh position={[0.4, 3.0, 0.4]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 1.9, 6]} />
          <meshStandardMaterial color="#5b4a3a" />
        </mesh>
        <group ref={flag} position={[0.42, 0.6, 0.4]}>
          <Flag height={2.2} />
        </group>
        <Lantern position={[0.9, 2.8, 0.75]} on={night} />
        <Lantern position={[-0.9, 2.8, 0.75]} on={night} />
      </group>
      {/* inner house */}
      <mesh position={[0.85, 0.5 - sink / 2, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.0 + sink, 1.2]} />
        <Plaster color="#d4b083" />
      </mesh>
      <Teeth w={1.4} d={1.2} y={0.5 + 0.5} size={0.1} color="#d4b083" />
      <Lantern position={[-0.45, 1.05, D / 2 + 0.2]} on={night || open} />
      <Lantern position={[0.45, 1.05, D / 2 + 0.2]} on={night || open} />
      {night && <pointLight position={[0, 2.2, D / 2 + 1.2]} color="#ffb860" intensity={8} distance={7} decay={1.6} />}
    </group>
  );
}

// ─── Watchtower on the ridge ───────────────────────────────────────────────────

export function Watchtower({ beacon }: { beacon: boolean }) {
  const x = SPOTS.tower.x;
  const z = SPOTS.tower.y;
  const y = heightAt(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.5, 1.7, 20]} />
        <Plaster color="#c19c6e" />
      </mesh>
      <RoundTeeth r={0.36} y={1.4} n={12} size={0.11} color="#c19c6e" />
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={beacon ? '#ffd38a' : '#6b5a48'} emissive={beacon ? '#ff9a3a' : '#000'} emissiveIntensity={beacon ? 6 : 0} />
      </mesh>
      {beacon && <pointLight position={[0, 1.9, 0]} color="#ffab55" intensity={6} distance={6} decay={1.5} />}
    </group>
  );
}

// ─── Cars ──────────────────────────────────────────────────────────────────────

export function Car({ color = '#f4f4f2', pickup = false, lights = false }: { color?: string; pickup?: boolean; lights?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.92, 0.22, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[pickup ? 0.14 : -0.06, 0.38, 0]} castShadow>
        <boxGeometry args={[pickup ? 0.4 : 0.6, 0.2, 0.38]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[pickup ? 0.14 : -0.06, 0.39, 0]}>
        <boxGeometry args={[pickup ? 0.41 : 0.61, 0.13, 0.385]} />
        <meshStandardMaterial color="#26323a" roughness={0.1} metalness={0.6} />
      </mesh>
      {[
        [0.3, 0.2],
        [0.3, -0.2],
        [-0.3, 0.2],
        [-0.3, -0.2],
      ].map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.09, wz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 12]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.9} />
        </mesh>
      ))}
      {lights && (
        <>
          <mesh position={[0.465, 0.22, 0.13]}>
            <boxGeometry args={[0.01, 0.04, 0.07]} />
            <meshStandardMaterial color="#fff6d8" emissive="#fff1c0" emissiveIntensity={5} />
          </mesh>
          <mesh position={[0.465, 0.22, -0.13]}>
            <boxGeometry args={[0.01, 0.04, 0.07]} />
            <meshStandardMaterial color="#fff6d8" emissive="#fff1c0" emissiveIntensity={5} />
          </mesh>
        </>
      )}
    </group>
  );
}

// ─── The souq ──────────────────────────────────────────────────────────────────

const AWNINGS = ['#b3261e', '#1f7a4d', '#f2efe6', '#c28a2c', '#1f5f8b', '#7a2a3a'];

export function Souq({ busy, animate, delay, night }: { busy: boolean; animate: boolean; delay: number; night: boolean }) {
  const x = SPOTS.souq.x;
  const z = SPOTS.souq.y;
  const y = heightAt(x, z);
  const stalls = [
    [-1.0, -0.75, 0],
    [0, -0.75, 0],
    [1.0, -0.75, 0],
    [-1.0, 0.75, Math.PI],
    [0, 0.75, Math.PI],
    [1.0, 0.75, Math.PI],
  ];
  return (
    <group position={[x, y, z]}>
      {/* the old arcade behind */}
      <mesh position={[0, 0.25, -1.55]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.3, 0.7]} />
        <Plaster color="#d8b98c" />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map(ax => (
        <mesh key={ax} position={[ax, 0.3, -1.19]}>
          <boxGeometry args={[0.42, 0.55, 0.02]} />
          <meshStandardMaterial color="#3b2a1d" />
        </mesh>
      ))}
      <Teeth w={3.4} d={0.7} y={0.9} size={0.1} color="#d8b98c" />
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[3.4, 0.06, 2.4]} />
        <meshStandardMaterial color="#c7ad86" roughness={1} map={noiseTexture()} />
      </mesh>
      {stalls.map(([sx, sz, rot], i) => {
        const open = busy || i < 2;
        return (
          <group key={i} position={[sx, 0, sz]} rotation={[0, rot, 0]}>
            {open ? (
              <Reveal show animate={animate && busy && i >= 2} delay={delay + i * 0.15}>
                {[
                  [-0.38, -0.28],
                  [0.38, -0.28],
                  [-0.38, 0.28],
                  [0.38, 0.28],
                ].map(([px, pz], k) => (
                  <mesh key={k} position={[px, 0.32, pz]} castShadow>
                    <cylinderGeometry args={[0.02, 0.02, 0.64, 5]} />
                    <meshStandardMaterial color="#5b4a3a" />
                  </mesh>
                ))}
                <mesh position={[0, 0.68, 0.04]} rotation={[0.22, 0, 0]} castShadow>
                  <boxGeometry args={[0.9, 0.03, 0.72]} />
                  <meshStandardMaterial color={AWNINGS[i]} roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.2, -0.05]} castShadow receiveShadow>
                  <boxGeometry args={[0.72, 0.3, 0.38]} />
                  <meshStandardMaterial color="#8a6340" roughness={0.8} />
                </mesh>
                {busy &&
                  [0, 1, 2, 3].map(k => (
                    <mesh key={k} position={[-0.24 + k * 0.16, 0.39, -0.05]} castShadow>
                      <sphereGeometry args={[0.065, 8, 6]} />
                      <meshStandardMaterial color={['#e07a1f', '#e8c33b', '#7b3a8a', '#c0392b'][k]} roughness={0.6} />
                    </mesh>
                  ))}
              </Reveal>
            ) : (
              <mesh position={[0, 0.3, -0.05]} castShadow>
                <boxGeometry args={[0.8, 0.6, 0.5]} />
                <meshStandardMaterial color="#8f7a62" roughness={0.9} />
              </mesh>
            )}
          </group>
        );
      })}
      {busy && night && <pointLight position={[0, 1.4, 0]} color="#ffbf70" intensity={5} distance={5} decay={1.6} />}
      {busy &&
        [
          [-1.6, 0.0],
          [1.6, 0.0],
        ].map(([lx, lz], i) => <Lantern key={i} position={[lx, 0.9, lz]} on={night || busy} />)}
    </group>
  );
}

// ─── Your shop, with your business name ────────────────────────────────────────

function nameTexture(name: string) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#1f5f6b');
  grad.addColorStop(1, '#15444d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#d9b26a';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);
  const isAr = /[؀-ۿ]/.test(name);
  ctx.direction = isAr ? 'rtl' : 'ltr';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff7e6';
  let size = 64;
  const font = (s: number) => `700 ${s}px ${isAr ? '"Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif' : 'Inter, "Segoe UI", Arial, sans-serif'}`;
  ctx.font = font(size);
  while (ctx.measureText(name).width > 460 && size > 22) {
    size -= 2;
    ctx.font = font(size);
  }
  ctx.fillText(name, 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function Shop({ open, animate, delay, name, night }: { open: boolean; animate: boolean; delay: number; name: string; night: boolean }) {
  const x = SPOTS.shop.x;
  const z = SPOTS.shop.y;
  const y = heightAt(x, z);
  const tex = useMemo(() => nameTexture(name), [name]);
  return (
    <group position={[x, y, z]}>
      {!open && (
        <group>
          {[
            [-0.6, -0.45],
            [0.6, -0.45],
            [-0.6, 0.45],
            [0.6, 0.45],
          ].map(([px, pz], i) => (
            <mesh key={i} position={[px, 0.12, pz]}>
              <boxGeometry args={[0.04, 0.24, 0.04]} />
              <meshStandardMaterial color="#c0392b" />
            </mesh>
          ))}
        </group>
      )}
      <Reveal show={open} animate={animate} delay={delay}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.35, 1.6, 1.05]} />
          <Plaster color="#efe2c8" />
        </mesh>
        <Teeth w={1.35} d={1.05} y={1.4} size={0.1} color="#e6d6b8" />
        <mesh position={[0, 0.3, 0.53]}>
          <boxGeometry args={[0.42, 0.6, 0.02]} />
          <meshStandardMaterial color={night ? '#ffcf86' : '#4a3020'} emissive={night ? '#ffb54d' : '#000'} emissiveIntensity={night ? 1.5 : 0} />
        </mesh>
        {[-0.38, 0.38].map(wx => (
          <mesh key={wx} position={[wx, 1.05, 0.53]}>
            <boxGeometry args={[0.2, 0.24, 0.02]} />
            <meshStandardMaterial color={night ? '#ffcf86' : '#2a1d14'} emissive={night ? '#ffb54d' : '#000'} emissiveIntensity={night ? 2 : 0} />
          </mesh>
        ))}
        <mesh position={[0, 0.74, 0.56]} castShadow>
          <boxGeometry args={[1.0, 0.25, 0.03]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={night ? 0.9 : 0.15} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.58, 0.72]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[1.1, 0.03, 0.36]} />
          <meshStandardMaterial color="#b3261e" roughness={0.8} />
        </mesh>
      </Reveal>
    </group>
  );
}

// ─── Your workshop ─────────────────────────────────────────────────────────────

export function Workshop({ built, animate, delay, night }: { built: boolean; animate: boolean; delay: number; night: boolean }) {
  const x = SPOTS.workshop.x;
  const z = SPOTS.workshop.y;
  const y = heightAt(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, -0.25, 0]}>
      {/* boundary wall */}
      {[
        [0, -1.25, 3.2, 0.1],
        [-1.6, 0, 0.1, 2.5],
        [1.6, 0, 0.1, 2.5],
        [-1.0, 1.25, 1.2, 0.1],
        [1.0, 1.25, 1.2, 0.1],
      ].map(([wx, wz, ww, wd], i) => (
        <mesh key={i} position={[wx, 0.1, wz]} castShadow receiveShadow>
          <boxGeometry args={[ww, 0.4, wd]} />
          <Plaster color="#e2d3b8" />
        </mesh>
      ))}
      <mesh position={[0, 0.0, 0]} receiveShadow>
        <boxGeometry args={[3.1, 0.04, 2.4]} />
        <meshStandardMaterial color="#b7a184" roughness={1} map={noiseTexture()} />
      </mesh>
      <Reveal show={built} animate={animate} delay={delay}>
        <mesh position={[-0.45, 0.55, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.1, 1.2]} />
          <Plaster color="#d9c7a7" />
        </mesh>
        <mesh position={[-0.45, 1.16, -0.4]} rotation={[0, 0, 0.08]} castShadow>
          <boxGeometry args={[2.0, 0.05, 1.4]} />
          <meshStandardMaterial color="#9aa4ab" roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[-0.45, 0.38, 0.21]}>
          <boxGeometry args={[0.9, 0.7, 0.02]} />
          <meshStandardMaterial color={night ? '#ffd9a0' : '#6d7479'} emissive={night ? '#ffb54d' : '#000'} emissiveIntensity={night ? 1.2 : 0} metalness={0.5} roughness={0.4} />
        </mesh>
        <group position={[1.05, 0, -0.6]}>
          {[-0.14, 0.14].map(px =>
            [-0.14, 0.14].map(pz => (
              <mesh key={`${px}${pz}`} position={[px, 0.35, pz]} castShadow>
                <boxGeometry args={[0.04, 0.7, 0.04]} />
                <meshStandardMaterial color="#6b6f75" metalness={0.5} />
              </mesh>
            ))
          )}
          <mesh position={[0, 0.85, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.36, 16]} />
            <meshStandardMaterial color="#f2f2f0" roughness={0.4} metalness={0.2} />
          </mesh>
        </group>
        {[
          [0.6, 0.12, 0.5],
          [0.85, 0.12, 0.5],
          [0.72, 0.36, 0.5],
          [0.6, 0.12, 0.25],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} castShadow>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial color={i === 2 ? '#a77b48' : '#b98d58'} roughness={0.9} map={noiseTexture()} />
          </mesh>
        ))}
        <group position={[-0.7, 0, 0.75]} rotation={[0, 0.1, 0]}>
          <Car color="#f1f1ef" pickup lights={night} />
        </group>
      </Reveal>
    </group>
  );
}

// ─── The road and street lamps ─────────────────────────────────────────────────

function asphaltTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#4b4846';
  ctx.fillRect(0, 0, 256, 64);
  for (let i = 0; i < 900; i++) {
    const g = 60 + Math.random() * 30;
    ctx.fillStyle = `rgba(${g},${g},${g},0.5)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 64, 1, 1);
  }
  ctx.fillStyle = '#e9e4d6';
  ctx.fillRect(0, 30, 120, 4);
  ctx.fillStyle = '#d8cfb8';
  ctx.fillRect(0, 2, 256, 3);
  ctx.fillRect(0, 59, 256, 3);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Road({ paved, animate, delay, lampsOn }: { paved: boolean; animate: boolean; delay: number; lampsOn: boolean }) {
  const { points } = useMemo(() => pointsOnCurve(ROAD_POINTS, 0.04, 220), []);
  const asphalt = useMemo(() => ribbon(points, 0.36, 0.0), [points]);
  const tex = useMemo(() => {
    const t = asphaltTexture();
    t.repeat.set(0.45, 1);
    return t;
  }, []);
  const lamps = useMemo(() => {
    const out: { x: number; y: number; z: number; r: number }[] = [];
    for (let i = 8; i < points.length - 4; i += 18) {
      const p = points[i];
      const n = points[i + 1];
      const dir = new THREE.Vector3().subVectors(n, p).setY(0).normalize();
      const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(((i / 18) % 2 ? 1 : -1) * 0.55);
      out.push({ x: p.x + side.x, y: heightAt(p.x + side.x, p.z + side.z), z: p.z + side.z, r: Math.atan2(-side.z, side.x) });
    }
    return out;
  }, [points]);
  const growth = useGrowth(paved, delay, 2.5);
  const total = (asphalt.geo.index as THREE.BufferAttribute).count;
  useFrame(() => {
    const g = paved ? (animate ? growth.current : 1) : 0;
    asphalt.geo.setDrawRange(0, Math.floor((total / 6) * g) * 6);
  });
  return (
    <group>
      <mesh geometry={asphalt.geo} receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.85} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      {lamps.map((l, i) => (
        <Reveal key={i} show={paved} animate={animate} delay={delay + 0.6 + i * 0.12} position={[l.x, l.y, l.z]} rotation={[0, l.r, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.026, 1.0, 6]} />
            <meshStandardMaterial color="#5f6468" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[-0.12, 0.98, 0]} castShadow>
            <boxGeometry args={[0.26, 0.025, 0.04]} />
            <meshStandardMaterial color="#5f6468" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[-0.24, 0.95, 0]}>
            <boxGeometry args={[0.09, 0.03, 0.06]} />
            <meshStandardMaterial color={lampsOn ? '#fff1c8' : '#d9d6cf'} emissive={lampsOn ? '#ffd27a' : '#000'} emissiveIntensity={lampsOn ? 6 : 0} />
          </mesh>
        </Reveal>
      ))}
    </group>
  );
}
