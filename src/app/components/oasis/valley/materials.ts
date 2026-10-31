// Shared textures and materials, generated in code (no downloads, works offline).

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { rng } from './world';

let noiseTex: THREE.CanvasTexture | null = null;
let waterTex: THREE.CanvasTexture | null = null;
let brickTex: THREE.CanvasTexture | null = null;

/** Soft grey noise used to break up flat colours (multiplied with the colour). */
export function noiseTexture() {
  if (noiseTex) return noiseTex;
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const r = rng(3);
  for (let i = 0; i < size * size; i++) {
    const v = 215 + r() * 40;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // a few blotches
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${0.04 + r() * 0.05})`;
    ctx.beginPath();
    ctx.arc(r() * size, r() * size, 4 + r() * 18, 0, Math.PI * 2);
    ctx.fill();
  }
  noiseTex = new THREE.CanvasTexture(c);
  noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
  noiseTex.colorSpace = THREE.SRGBColorSpace;
  return noiseTex;
}

/** Mud-brick plaster: soft streaks and patches. */
export function plasterTexture() {
  if (brickTex) return brickTex;
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, size, size);
  const r = rng(11);
  for (let i = 0; i < 160; i++) {
    const g = 200 + Math.floor(r() * 50);
    ctx.fillStyle = `rgba(${g},${g - 6},${g - 14},${0.25 + r() * 0.35})`;
    ctx.fillRect(r() * size, r() * size, 6 + r() * 40, 2 + r() * 10);
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(120,90,60,${0.05 + r() * 0.08})`;
    ctx.fillRect(r() * size, r() * size * 0.3 + size * 0.7, 2 + r() * 4, 10 + r() * 30);
  }
  brickTex = new THREE.CanvasTexture(c);
  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
  brickTex.colorSpace = THREE.SRGBColorSpace;
  return brickTex;
}

/** Ripples for flowing water. */
export function waterTexture() {
  if (waterTex) return waterTex;
  const w = 256;
  const h = 64;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#2f9fb3');
  grad.addColorStop(0.5, '#4cc3d2');
  grad.addColorStop(1, '#2f9fb3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const r = rng(5);
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.15 + r() * 0.35})`;
    ctx.lineWidth = 1 + r() * 1.5;
    const x = r() * w;
    const y = r() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 10, y + (r() - 0.5) * 6, x + 18 + r() * 20, y);
    ctx.stroke();
  }
  waterTex = new THREE.CanvasTexture(c);
  waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
  waterTex.colorSpace = THREE.SRGBColorSpace;
  return waterTex;
}

/** Shared uniform for wind and water movement. */
export const timeUniform = { value: 0 };

/** A standard material whose vertices sway gently in the wind (for leaves). */
export function swayMaterial(params: THREE.MeshStandardMaterialParameters, strength = 0.06) {
  const mat = new THREE.MeshStandardMaterial(params);
  mat.onBeforeCompile = shader => {
    shader.uniforms.uTime = timeUniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float seed = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.53;
        #else
          float seed = 0.0;
        #endif
        float bend = max(0.0, length(position.xz)) * ${strength.toFixed(3)};
        transformed.x += sin(uTime * 1.6 + seed) * bend;
        transformed.z += cos(uTime * 1.3 + seed * 1.7) * bend * 0.7;
        transformed.y += sin(uTime * 2.1 + seed) * bend * 0.3;`
      );
  };
  return mat;
}

// ─── Palm geometry (one merged mesh for the trunk, one for the crown) ─────────

export function palmTrunkGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const segs = 7;
  for (let i = 0; i < segs; i++) {
    const g = new THREE.CylinderGeometry(0.075 - i * 0.004, 0.085 - i * 0.004, 0.24, 7, 1);
    const bend = (i / segs) ** 2 * 0.22;
    g.translate(bend, 0.12 + i * 0.235, 0);
    g.rotateZ(-0.02 * i);
    parts.push(g);
  }
  const m = mergeGeometries(parts)!;
  m.computeVertexNormals();
  return m;
}

export const PALM_TOP = new THREE.Vector3(0.2, 1.66, 0);

export function palmCrownGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const fronds = 11;
  for (let i = 0; i < fronds; i++) {
    const len = 0.85 + (i % 3) * 0.12;
    const g = new THREE.PlaneGeometry(len, 0.3, 8, 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k) + len / 2; // 0..len
      const t = x / len;
      const y = pos.getY(k);
      // narrow towards the tip, droop downwards, fold along the middle rib
      pos.setXYZ(k, x, -t * t * 0.55 + Math.abs(y) * 0.25, y * (1 - t * 0.85));
    }
    g.computeVertexNormals();
    const tilt = i < 4 ? 0.55 : i < 8 ? 0.15 : -0.25; // some fronds up, some flat, some drooping
    g.rotateZ(tilt);
    g.rotateY((i / fronds) * Math.PI * 2 + (i % 2) * 0.3);
    parts.push(g);
  }
  const m = mergeGeometries(parts)!;
  m.translate(PALM_TOP.x, PALM_TOP.y, PALM_TOP.z);
  return m;
}

export function datesGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.DodecahedronGeometry(0.075, 0);
    const a = (i / 4) * Math.PI * 2;
    g.scale(1, 1.4, 1);
    g.translate(PALM_TOP.x + Math.cos(a) * 0.11, PALM_TOP.y - 0.12, PALM_TOP.z + Math.sin(a) * 0.11);
    parts.push(g);
  }
  return mergeGeometries(parts)!;
}

/** Ghaf / acacia tree: short trunk and a wide flat crown. */
export function ghafGeometry() {
  const trunk = new THREE.CylinderGeometry(0.05, 0.08, 0.6, 6);
  trunk.translate(0, 0.3, 0);
  trunk.rotateZ(0.12);
  const crowns: THREE.BufferGeometry[] = [];
  const r = rng(21);
  for (let i = 0; i < 5; i++) {
    const g = new THREE.IcosahedronGeometry(0.32 + r() * 0.12, 0);
    g.scale(1.3, 0.5, 1.2);
    g.translate((r() - 0.5) * 0.5, 0.68 + r() * 0.12, (r() - 0.5) * 0.5);
    crowns.push(g);
  }
  return { trunk, crown: mergeGeometries(crowns)! };
}
