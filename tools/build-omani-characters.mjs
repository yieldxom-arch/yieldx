// Build web-ready Omani villagers from the KayKit Adventurers pack (CC0).
// - removes weapons, hats and props
// - recolours the clothing cells of the palette texture (dishdasha, abaya)
// - strips every animation (they live in one shared omani-anims.glb)
// - quantizes + meshopt-compresses
//
// Usage (needs @gltf-transform/core, functions, extensions, meshoptimizer, pngjs):
//   git clone https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 kaykit
//   KAYKIT_DIR=kaykit node tools/build-omani-characters.mjs public/models/
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, quantize, reorder, resample, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { PNG } from 'pngjs';
import fs from 'node:fs';

const SRC = (process.env.KAYKIT_DIR || 'kaykit') + '/addons/kaykit_character_pack_adventures/Characters/gltf/';
const OUT = process.argv[2] || 'public/models/';
fs.mkdirSync(OUT, { recursive: true });

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Recolour 128px cells of an 8x4 palette, keeping each cell's shading. */
function recolour(pngBuf, map) {
  const png = PNG.sync.read(pngBuf);
  const W = png.width, H = png.height, cw = W / 8, ch = H / 4;
  for (const [cell, color] of Object.entries(map)) {
    const r = +cell[1], c = +cell[3];
    const [tr, tg, tb] = hex(color);
    // mean luminance of the cell
    let sum = 0, n = 0;
    for (let y = r * ch; y < (r + 1) * ch; y++) for (let x = c * cw; x < (c + 1) * cw; x++) {
      const i = (y * W + x) * 4; sum += 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]; n++;
    }
    const mean = Math.max(1, sum / n);
    for (let y = r * ch; y < (r + 1) * ch; y++) for (let x = c * cw; x < (c + 1) * cw; x++) {
      const i = (y * W + x) * 4;
      const l = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
      // keep a softened version of the original gradient
      const k = 0.78 + 0.22 * (l / mean);
      png.data[i] = Math.min(255, tr * k); png.data[i + 1] = Math.min(255, tg * k); png.data[i + 2] = Math.min(255, tb * k);
    }
  }
  return PNG.sync.write(png);
}

const SHAYLA = '#6a2c55', SKIN = '#e9b48e';
const WHITE = '#f3efe6', CREAM = '#e7dfcf', BLACK = '#1f1c22', GOLD = '#c9a227', SANDAL = '#6b4a32', BEARD = '#dcd8cf';

const VARIANTS = [
  {
    out: 'omani-man', src: 'Mage',
    drop: ['Spellbook', 'Spellbook_open', '1H_Wand', '2H_Staff', 'Mage_Hat', 'Mage_Cape'],
    colours: { r1c0: WHITE, r0c3: WHITE, r0c4: CREAM, r0c5: CREAM, r2c2: CREAM, r1c7: WHITE, r2c3: CREAM, r2c0: WHITE },
  },
  {
    out: 'omani-elder', src: 'Barbarian',
    drop: ['1H_Axe_Offhand', 'Barbarian_Round_Shield', '1H_Axe', '2H_Axe', 'Mug', 'Barbarian_Hat', 'Barbarian_Cape'],
    colours: { r0c6: WHITE, r1c0: WHITE, r1c1: WHITE, r1c2: WHITE, r0c7: CREAM, r0c3: CREAM, r1c7: WHITE, r2c3: WHITE, r0c1: BEARD },
  },
  {
    out: 'omani-woman', src: 'Rogue_Hooded',
    drop: ['Knife_Offhand', '1H_Crossbow', '2H_Crossbow', 'Knife', 'Throwable'],
    colours: { r1c0: BLACK, r1c1: SHAYLA, r0c3: SHAYLA, r0c6: BLACK, r0c5: BLACK, r1c7: BLACK, r2c5: SKIN, r2c3: '#2a2526' },
  },
];

function dropAnim(a) {
  for (const c of a.listChannels()) c.dispose();
  for (const s of a.listSamplers()) s.dispose();
  a.dispose();
}

const KEEP_ANIMS = ['Idle', 'Walking_A', 'Running_A', 'Cheer', 'Interact', 'Sit_Floor_Idle', 'PickUp', 'Use_Item'];

async function finish(doc, file) {
  await doc.transform(
    prune(),
    dedup(),
    resample(),
    reorder({ encoder: MeshoptEncoder }),
    quantize(),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  await io.write(OUT + file, doc);
  return fs.statSync(OUT + file).size;
}

for (const v of VARIANTS) {
  const doc = await io.read(SRC + v.src + '.glb');
  const root = doc.getRoot();
  for (const node of root.listNodes()) {
    if (v.drop.includes(node.getName())) {
      const mesh = node.getMesh();
      node.dispose();
      if (mesh) mesh.dispose();
    }
  }
  for (const a of root.listAnimations()) dropAnim(a);
  for (const tex of root.listTextures()) {
    tex.setImage(recolour(Buffer.from(tex.getImage()), v.colours));
    tex.setName(v.out);
  }
  const size = await finish(doc, v.out + '.glb');
  console.log(v.out, (size / 1024).toFixed(0) + ' KB');
}

// Shared animations: skeleton + clips, no meshes.
{
  const doc = await io.read(SRC + 'Mage.glb');
  const root = doc.getRoot();
  for (const a of root.listAnimations()) if (!KEEP_ANIMS.includes(a.getName())) dropAnim(a);
  for (const node of root.listNodes()) {
    if (node.getMesh()) { const m = node.getMesh(); node.setMesh(null); node.setSkin(null); m.dispose(); }
  }
  for (const s of root.listSkins()) s.dispose();
  for (const t of root.listTextures()) t.dispose();
  for (const m of root.listMaterials()) m.dispose();
  const size = await finish(doc, 'omani-anims.glb');
  console.log('omani-anims', (size / 1024).toFixed(0) + ' KB', root.listAnimations().map(a => a.getName()).join(','));
}
