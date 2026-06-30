import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Share2,
  Download,
  Copy,
  X,
  Check,
  Pause,
  Play,
  ChevronRight,
  BarChart3,
  Award,
  Clock,
  Lock,
  PanelRightOpen,
  PanelRightClose,
  TrendingUp,
  Layers,
  Target,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import type { LevelProgress, FinancialKPIs, BMCData } from '@/app/contexts/YieldXContext';

// ─── YieldX Design Tokens (kept in-sync with theme.css) ─────────────────────
const TOKEN = {
  navy: '#1B1B3A',
  darkNavy: '#0F0F25',
  teal: '#4ECDC4',
  tealLight: '#5DD9C1',
  cyan: '#7FDBCA',
  mint: '#A8E6CF',
  white: '#ffffff',
} as const;

// ─── 3D Math ─────────────────────────────────────────────────────────────────
type Vec3 = readonly [number, number, number];

function rotateX(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}

function rotateY(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

function transformVec3(v: Vec3, rx: number, ry: number): Vec3 {
  return rotateY(rotateX(v, rx), ry);
}

function project(
  v: Vec3,
  fov: number,
  cx: number,
  cy: number,
): [number, number, number] {
  const depth = v[2] + 700;
  if (depth <= 0) return [cx, cy, 0.001];
  const s = fov / depth;
  return [v[0] * s + cx, -v[1] * s + cy, s];
}

// ─── Scene Data Types ─────────────────────────────────────────────────────────
interface SceneNode {
  id: string;
  levelId: number;
  title: string;
  titleAr: string;
  status: string;
  progress: number;
  xp: number;
  maxXp: number;
  grade?: number;
  hexColor: string;
  r: number;
  g: number;
  b: number;
  glowAlpha: number;
  basePos: Vec3;
}

const LEVEL_TITLES_EN = [
  'Project Type',
  'Identity & Ownership',
  'Legal Framework',
  'Physical Resources',
  'Human Resources',
  'Market Strategy',
  'Financing & KPIs',
  'BMC Implementation',
];
const LEVEL_TITLES_AR = [
  'نوع المشروع',
  'الهوية والملكية',
  'الإطار القانوني',
  'الموارد المادية',
  'الموارد البشرية',
  'السوق والاستراتيجية',
  'التمويل والمؤشرات',
  'نموذج الأعمال',
];

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function buildScene(levels: LevelProgress[]): SceneNode[] {
  return levels.map((level, i) => {
    const angle = i * ((Math.PI * 2) / 5);
    const basePos: Vec3 = [
      140 * Math.cos(angle),
      (i - 3.5) * 75,
      140 * Math.sin(angle),
    ];

    let hexColor: string;
    let glowAlpha: number;
    const s = level.submissionStatus;
    if (s === 'graded' || s === 'submitted' || level.completed) {
      hexColor = TOKEN.teal;
      glowAlpha = 0.75;
    } else if (s === 'in-progress') {
      hexColor = TOKEN.cyan;
      glowAlpha = 0.5;
    } else if (level.unlocked) {
      hexColor = TOKEN.mint;
      glowAlpha = 0.25;
    } else {
      hexColor = '#4a4a6a';
      glowAlpha = 0.08;
    }

    const [r, g, b] = hexToRgb(hexColor);
    return {
      id: `level-${level.levelId}`,
      levelId: level.levelId,
      title: LEVEL_TITLES_EN[i] ?? `Level ${i}`,
      titleAr: LEVEL_TITLES_AR[i] ?? `مستوى ${i}`,
      status: s ?? (level.unlocked ? 'not-started' : 'locked'),
      progress: level.maxXp > 0 ? level.xp / level.maxXp : 0,
      xp: level.xp,
      maxXp: level.maxXp,
      grade: level.grade,
      hexColor,
      r,
      g,
      b,
      glowAlpha,
      basePos,
    };
  });
}

// ─── Canvas 2D capability check ───────────────────────────────────────────────
function supportsCanvas2D(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('2d');
  } catch {
    return false;
  }
}

// ─── Scene config persistence ─────────────────────────────────────────────────
interface SceneConfig { rx: number; ry: number; zoom: number }
const DEFAULT_SCENE: SceneConfig = { rx: -0.25, ry: 0.6, zoom: 1 };

function loadSceneConfig(projectId: string | null): SceneConfig {
  try {
    const raw = localStorage.getItem(`yieldx_3d_scene_${projectId ?? 'default'}`);
    if (raw) return { ...DEFAULT_SCENE, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SCENE };
}

function saveSceneConfig(projectId: string | null, cfg: SceneConfig): void {
  try {
    localStorage.setItem(`yieldx_3d_scene_${projectId ?? 'default'}`, JSON.stringify(cfg));
  } catch { /* ignore */ }
}

// ─── Star field (stable, seeded pseudo-random) ────────────────────────────────
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: ((i * 9301 + 49297) % 233280) / 233280,
  y: ((i * 6273 + 81739) % 193280) / 193280,
  r: 0.5 + (i % 10) / 14,
  phase: i * 0.7,
}));

// ─── Canvas 2-D Renderer ──────────────────────────────────────────────────────
function renderScene(
  ctx: CanvasRenderingContext2D,
  nodes: SceneNode[],
  edges: [number, number][],
  rx: number,
  ry: number,
  zoom: number,
  selectedId: string | null,
  t: number,
  w: number,
  h: number,
) {
  const cx = w / 2;
  const cy = h / 2;
  const fov = 600 * zoom;

  ctx.clearRect(0, 0, w, h);

  // Background gradient
  const bg = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy, Math.max(w, h) * 0.75);
  bg.addColorStop(0, '#252545');
  bg.addColorStop(1, TOKEN.darkNavy);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Star field
  for (const star of STARS) {
    const alpha = 0.25 + 0.25 * Math.sin(t * 0.4 + star.phase);
    ctx.beginPath();
    ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  // Transform + project all nodes
  const projected = nodes.map((node) => {
    const tp = transformVec3(node.basePos, rx, ry);
    const [px, py, scale] = project(tp, fov, cx, cy);
    return { ...node, px, py, scale, depth: tp[2] };
  });

  // Depth sort: farthest first (painter's algorithm)
  const sorted = [...projected].sort((a, b) => a.depth - b.depth);

  // Orbital grid rings
  ctx.save();
  ctx.strokeStyle = 'rgba(78,205,196,0.07)';
  ctx.lineWidth = 1;
  const steps = 32;
  for (const ringY of [-1, 0, 1]) {
    const yWorld = ringY * 150;
    const pts: [number, number][] = [];
    for (let k = 0; k <= steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      const tp = transformVec3([140 * Math.cos(a), yWorld, 140 * Math.sin(a)], rx, ry);
      const [px, py, s] = project(tp, fov, cx, cy);
      if (s > 0) pts.push([px, py]);
    }
    if (pts.length > 1) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Edges
  ctx.save();
  for (const [ai, bi] of edges) {
    const a = projected[ai];
    const b = projected[bi];
    if (!a || !b) continue;
    const avgAlpha = Math.min(1, Math.max(0.08, (Math.min(a.depth, b.depth) + 450) / 900));
    const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
    grad.addColorStop(0, `rgba(78,205,196,${avgAlpha * 0.6})`);
    grad.addColorStop(0.5, `rgba(127,219,202,${avgAlpha * 0.8})`);
    grad.addColorStop(1, `rgba(78,205,196,${avgAlpha * 0.6})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(0.5, 1.5 * ((a.scale + b.scale) / 2));
    ctx.beginPath();
    ctx.moveTo(a.px, a.py);
    ctx.lineTo(b.px, b.py);
    ctx.stroke();
  }
  ctx.restore();

  // Nodes
  for (const node of sorted) {
    const { px, py, scale, depth, r, g, b } = node;
    const isSelected = node.id === selectedId;
    const depthAlpha = Math.min(1, Math.max(0.15, (depth + 450) / 900));
    const pulse = isSelected ? 1 + 0.07 * Math.sin(t * 3.5) : 1;
    const nodeR = 26 * scale * pulse;

    if (node.glowAlpha > 0.1) {
      const glowR = nodeR * 2.8;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      glow.addColorStop(0, `rgba(${r},${g},${b},${node.glowAlpha * depthAlpha * (isSelected ? 1.3 : 1)})`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(px, py, nodeR + 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${depthAlpha * 0.9})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    if (node.progress > 0 && node.progress <= 1) {
      const arcR = nodeR + 3;
      ctx.beginPath();
      ctx.arc(px, py, arcR, -Math.PI / 2, -Math.PI / 2 + node.progress * Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${depthAlpha * 0.8})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const sphere = ctx.createRadialGradient(
      px - nodeR * 0.3, py - nodeR * 0.35, 0,
      px, py, nodeR,
    );
    sphere.addColorStop(0, `rgba(${Math.min(255, r + 50)},${Math.min(255, g + 50)},${Math.min(255, b + 50)},${depthAlpha})`);
    sphere.addColorStop(0.55, `rgba(${r},${g},${b},${depthAlpha})`);
    sphere.addColorStop(1, `rgba(${Math.max(0, r - 40)},${Math.max(0, g - 40)},${Math.max(0, b - 40)},${depthAlpha})`);
    ctx.beginPath();
    ctx.arc(px, py, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = sphere;
    ctx.fill();

    const spec = ctx.createRadialGradient(
      px - nodeR * 0.35, py - nodeR * 0.4, 0,
      px - nodeR * 0.35, py - nodeR * 0.4, nodeR * 0.6,
    );
    spec.addColorStop(0, `rgba(255,255,255,${0.35 * depthAlpha})`);
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(px, py, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = spec;
    ctx.fill();

    const fontSize = Math.max(9, Math.round(14 * scale));
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(255,255,255,${depthAlpha * 0.95})`;
    ctx.fillText(`${node.levelId}`, px, py);

    if (scale > 0.55 && nodeR > 14) {
      const labelFs = Math.max(8, Math.round(10 * scale));
      ctx.font = `${labelFs}px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(200,240,235,${depthAlpha * 0.75})`;
      ctx.fillText(node.title, px, py + nodeR + 12 * scale);
    }
  }
}

// ─── Static HTML fallback (no canvas support) ────────────────────────────────
function FallbackGrid({ nodes, language, isDark }: { nodes: SceneNode[]; language: string; isDark: boolean }) {
  const isAr = language === 'ar';
  const cardBg = isDark ? TOKEN.navy : '#ffffff';
  const cardText = isDark ? 'rgba(255,255,255,0.8)' : '#1f2937';
  const subText = isDark ? 'rgba(255,255,255,0.4)' : '#4b5563';
  const glowBg = isDark ? `linear-gradient(135deg, #7FDBCA18, ${TOKEN.navy})` : `linear-gradient(135deg, rgba(78,205,196,0.10), #ffffff)`;

  return (
    <div className="w-full h-full overflow-auto p-6">
      <p className="text-center text-white/40 text-xs mb-4">
        {isAr ? 'عرض بديل — الجهاز لا يدعم رسم الكانفاس' : 'Fallback view — canvas rendering not supported on this device'}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{
              borderColor: node.hexColor + '40',
              background: `linear-gradient(135deg, ${node.hexColor}18, ${TOKEN.navy})`,
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base mx-auto"
              style={{ background: node.hexColor }}
            >
              {node.levelId}
            </div>
            <p className="text-xs text-center text-white/80 font-medium">
              {isAr ? node.titleAr : node.title}
            </p>
            <div className="w-full h-1 rounded-full bg-white/10">
              <div
                className="h-1 rounded-full"
                style={{ width: `${node.progress * 100}%`, background: node.hexColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, language }: { status: string; language: string }) {
  const isAr = language === 'ar';
  const map: Record<string, { label: string; labelAr: string; cls: string }> = {
    graded:       { label: 'Graded',       labelAr: 'مُقيَّم',      cls: 'bg-[#4ECDC4]/20 text-[#4ECDC4] border-[#4ECDC4]/30' },
    submitted:    { label: 'Submitted',    labelAr: 'مُقدَّم',      cls: 'bg-[#7FDBCA]/20 text-[#7FDBCA] border-[#7FDBCA]/30' },
    'in-progress':{ label: 'In Progress',  labelAr: 'قيد التنفيذ',  cls: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30' },
    'not-started':{ label: 'Not Started',  labelAr: 'لم يبدأ',      cls: 'bg-white/10 text-white/50 border-white/10' },
    locked:       { label: 'Locked',       labelAr: 'مغلق',         cls: 'bg-white/5 text-white/30 border-white/5' },
  };
  const cfg = map[status] ?? map['not-started'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.cls}`}>
      {status === 'graded' || status === 'submitted' ? <Check className="w-3 h-3" /> :
       status === 'in-progress' ? <Clock className="w-3 h-3" /> :
       status === 'locked' ? <Lock className="w-3 h-3" /> :
       <BarChart3 className="w-3 h-3" />}
      {isAr ? cfg.labelAr : cfg.label}
    </span>
  );
}

// ─── Node Details Panel ───────────────────────────────────────────────────────
function NodePanel({
  node,
  language,
  onClose,
  onNavigate,
}: {
  node: SceneNode;
  language: string;
  onClose: () => void;
  onNavigate?: (levelId: number) => void;
}) {
  const isAr = language === 'ar';
  const pct = Math.round(node.progress * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="absolute top-1/2 right-4 -translate-y-1/2 w-56 rounded-2xl border overflow-hidden shadow-2xl z-20"
      style={{
        background: `linear-gradient(135deg, ${TOKEN.navy}f0, ${TOKEN.darkNavy}f0)`,
        borderColor: node.hexColor + '50',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{ background: node.hexColor }}
          >
            {node.levelId}
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <p className="text-white font-semibold text-sm leading-tight">
            {isAr ? node.titleAr : node.title}
          </p>
          <div className="mt-1">
            <StatusBadge status={node.status} language={language} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/50">
            <span>{isAr ? 'التقدم' : 'Progress'}</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%`, background: node.hexColor }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50 flex items-center gap-1">
            <Award className="w-3 h-3" />
            {isAr ? 'النقاط' : 'XP'}
          </span>
          <span className="font-semibold" style={{ color: node.hexColor }}>
            {node.xp} / {node.maxXp}
          </span>
        </div>

        {node.grade != null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">{isAr ? 'الدرجة' : 'Grade'}</span>
            <span className="font-bold text-white">{node.grade}%</span>
          </div>
        )}

        {onNavigate && node.status !== 'locked' && (
          <button
            onClick={() => onNavigate(node.levelId)}
            className="w-full py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: node.hexColor + '25', color: node.hexColor, border: `1px solid ${node.hexColor}40` }}
          >
            {isAr ? 'فتح المستوى' : 'Open Level'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Share Panel ──────────────────────────────────────────────────────────────
function SharePanel({
  projectId,
  projectName,
  language,
  onClose,
  onDownload,
}: {
  projectId: string | null;
  projectName: string;
  language: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  const isAr = language === 'ar';
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?view=project-3d-view&project=${projectId ?? ''}`;
  const embedCode = `<iframe src="${shareUrl}" width="900" height="600" frameborder="0" style="border-radius:16px;border:none;" title="${projectName} — 3D View"></iframe>`;

  const copy = async (text: string, which: 'link' | 'embed') => {
    await navigator.clipboard.writeText(text);
    if (which === 'link') { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    else { setCopiedEmbed(true); setTimeout(() => setCopiedEmbed(false), 2000); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 rounded-2xl border p-5 shadow-2xl z-30 space-y-4"
      style={{
        background: `${TOKEN.navy}f8`,
        borderColor: TOKEN.teal + '40',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">
          {isAr ? 'مشاركة العرض ثلاثي الأبعاد' : 'Share 3D View'}
        </h3>
        <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <p className="text-white/50 text-xs">{isAr ? 'رابط المشاركة' : 'Share link'}</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 text-xs rounded-lg px-3 py-2 bg-white/5 border border-white/10 text-white/70 truncate outline-none"
          />
          <button
            onClick={() => copy(shareUrl, 'link')}
            className="shrink-0 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4ECDC4]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-white/50 text-xs">{isAr ? 'كود التضمين' : 'Embed code'}</p>
        <div className="flex items-start gap-2">
          <textarea
            readOnly
            value={embedCode}
            rows={3}
            className="flex-1 text-xs rounded-lg px-3 py-2 bg-white/5 border border-white/10 text-white/60 resize-none outline-none font-mono"
          />
          <button
            onClick={() => copy(embedCode, 'embed')}
            className="shrink-0 mt-0.5 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            {copiedEmbed ? <Check className="w-3.5 h-3.5 text-[#4ECDC4]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ background: TOKEN.teal + '25', color: TOKEN.teal, border: `1px solid ${TOKEN.teal}40` }}
        onMouseOver={(e) => (e.currentTarget.style.background = TOKEN.teal + '40')}
        onMouseOut={(e) => (e.currentTarget.style.background = TOKEN.teal + '25')}
      >
        <Download className="w-4 h-4" />
        {isAr ? 'تحميل لقطة PNG' : 'Download PNG snapshot'}
      </button>
    </motion.div>
  );
}

// ─── Full Project View Panel ──────────────────────────────────────────────────
function FullProjectPanel({
  nodes,
  financialKPIs,
  bmcData,
  projectName,
  projectType,
  language,
  onClose,
  onNavigate,
}: {
  nodes: SceneNode[];
  financialKPIs: FinancialKPIs | null | undefined;
  bmcData: BMCData | null | undefined;
  projectName: string;
  projectType?: string;
  language: string;
  onClose: () => void;
  onNavigate?: (levelId: number) => void;
}) {
  const isAr = language === 'ar';
  const completedCount = nodes.filter(n =>
    n.status === 'graded' || n.status === 'submitted' || n.progress >= 1,
  ).length;
  const overallPct = nodes.length > 0
    ? Math.round((nodes.reduce((s, n) => s + n.progress, 0) / nodes.length) * 100)
    : 0;
  const totalXp = nodes.reduce((s, n) => s + n.xp, 0);
  const maxTotalXp = nodes.reduce((s, n) => s + n.maxXp, 0);

  const bmcFilledCount = bmcData
    ? Object.values(bmcData).filter(v => Array.isArray(v) && v.length > 0).length
    : 0;
  const bmcTotal = 9;

  const projectTypeLabels: Record<string, { en: string; ar: string }> = {
    agricultural: { en: 'Agricultural', ar: 'زراعي' },
    industrial:   { en: 'Industrial',   ar: 'صناعي' },
    commercial:   { en: 'Commercial',   ar: 'تجاري' },
    service:      { en: 'Service',      ar: 'خدمي' },
  };
  const typeLabel = projectType
    ? (isAr ? projectTypeLabels[projectType]?.ar : projectTypeLabels[projectType]?.en) ?? projectType
    : null;

  // SVG progress arc
  const arcR = 28;
  const arcCirc = 2 * Math.PI * arcR;
  const arcDash = (overallPct / 100) * arcCirc;

  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      className="absolute top-0 left-0 bottom-0 w-72 z-20 flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${TOKEN.navy}f5 0%, ${TOKEN.darkNavy}f5 100%)`,
        borderRight: `1px solid ${TOKEN.teal}20`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${TOKEN.teal}15` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 flex-shrink-0" style={{ color: TOKEN.teal }} />
          <span className="text-white font-semibold text-sm truncate">
            {isAr ? 'عرض المشروع الكامل' : 'Full Project View'}
          </span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Project identity */}
        <div className="px-4 py-4 space-y-1" style={{ borderBottom: `1px solid ${TOKEN.teal}10` }}>
          <p className="text-white font-bold text-sm leading-tight truncate">{projectName}</p>
          {typeLabel && (
            <span
              className="inline-block text-xs px-2 py-0.5 rounded-full"
              style={{ background: TOKEN.teal + '25', color: TOKEN.teal }}
            >
              {typeLabel}
            </span>
          )}
        </div>

        {/* Overall progress */}
        <div className="px-4 py-4" style={{ borderBottom: `1px solid ${TOKEN.teal}10` }}>
          <p className="text-white/50 text-xs mb-3">{isAr ? 'التقدم الإجمالي' : 'Overall Progress'}</p>
          <div className="flex items-center gap-4">
            {/* Arc gauge */}
            <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
              <circle cx="36" cy="36" r={arcR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              <circle
                cx="36" cy="36" r={arcR}
                fill="none"
                stroke={TOKEN.teal}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${arcDash} ${arcCirc}`}
                transform="rotate(-90 36 36)"
              />
              <text x="36" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">
                {overallPct}%
              </text>
            </svg>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-white/40">{isAr ? 'المستويات المكتملة' : 'Levels done'}</p>
                <p className="text-white font-semibold">{completedCount} / {nodes.length}</p>
              </div>
              <div>
                <p className="text-white/40">{isAr ? 'النقاط' : 'XP earned'}</p>
                <p className="font-semibold" style={{ color: TOKEN.teal }}>{totalXp} / {maxTotalXp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level list */}
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${TOKEN.teal}10` }}>
          <p className="text-white/50 text-xs mb-2">{isAr ? 'المستويات' : 'Levels'}</p>
          <div className="space-y-1">
            {nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => node.status !== 'locked' && onNavigate?.(node.levelId)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors text-left"
                style={{ cursor: node.status === 'locked' ? 'default' : 'pointer' }}
                onMouseOver={(e) => { if (node.status !== 'locked') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: node.hexColor, opacity: node.status === 'locked' ? 0.35 : 1 }}
                >
                  {node.levelId}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: node.status === 'locked' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)' }}>
                    {isAr ? node.titleAr : node.title}
                  </p>
                  <div className="w-full h-0.5 rounded-full bg-white/10 mt-1">
                    <div className="h-0.5 rounded-full" style={{ width: `${node.progress * 100}%`, background: node.hexColor }} />
                  </div>
                </div>
                {node.status === 'locked'
                  ? <Lock className="w-3 h-3 text-white/20 flex-shrink-0" />
                  : <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Financial KPIs */}
        {financialKPIs && (
          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${TOKEN.teal}10` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: TOKEN.cyan }} />
              <p className="text-white/50 text-xs">{isAr ? 'المؤشرات المالية' : 'Financial KPIs'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'ROI', labelAr: 'العائد', value: `${financialKPIs.roi?.toFixed(1) ?? '—'}%`, color: TOKEN.teal },
                { label: 'IRR', labelAr: 'معدل العائد', value: `${financialKPIs.irr?.toFixed(1) ?? '—'}%`, color: TOKEN.cyan },
                { label: 'NPV', labelAr: 'صافي القيمة', value: financialKPIs.npv != null ? `${(financialKPIs.npv / 1000).toFixed(0)}K` : '—', color: TOKEN.mint },
                { label: isAr ? 'فترة الاسترداد' : 'Payback', labelAr: 'فترة الاسترداد', value: financialKPIs.paybackPeriod != null ? `${financialKPIs.paybackPeriod.toFixed(1)}y` : '—', color: TOKEN.tealLight },
              ].map(({ label, labelAr, value, color }) => (
                <div
                  key={label}
                  className="rounded-lg px-2.5 py-2"
                  style={{ background: color + '12', border: `1px solid ${color}20` }}
                >
                  <p className="text-white/40 text-xs">{isAr ? labelAr : label}</p>
                  <p className="font-bold text-sm leading-tight" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BMC completion */}
        {bmcData && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5" style={{ color: TOKEN.mint }} />
              <p className="text-white/50 text-xs">{isAr ? 'نموذج الأعمال' : 'Business Model Canvas'}</p>
            </div>
            <div
              className="rounded-lg px-3 py-2.5 flex items-center justify-between"
              style={{ background: TOKEN.mint + '12', border: `1px solid ${TOKEN.mint}20` }}
            >
              <div>
                <p className="text-white/40 text-xs">{isAr ? 'العناصر المكتملة' : 'Filled blocks'}</p>
                <p className="font-bold text-sm" style={{ color: TOKEN.mint }}>{bmcFilledCount} / {bmcTotal}</p>
              </div>
              <div className="w-12 h-12">
                <svg viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                  <circle
                    cx="20" cy="20" r="16"
                    fill="none"
                    stroke={TOKEN.mint}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(bmcFilledCount / bmcTotal) * 100.53} 100.53`}
                    transform="rotate(-90 20 20)"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export interface ProjectVisualization3DProps {
  onClose?: () => void;
  /** When provided, clicking a node's "Open Level" button calls this */
  onNavigateToLevel?: (levelId: number) => void;
  /** Compact embedding mode — disables fullscreen toggle */
  compact?: boolean;
}

export function ProjectVisualization3D({
  onClose,
  onNavigateToLevel,
  compact = false,
}: ProjectVisualization3DProps) {
  const {
    levels,
    savedProjects,
    activeSavedProjectId,
    language,
    financialKPIs,
    bmcData,
    setCurrentView,
    theme,
  } = useYieldX();
  const isAr = language === 'ar';
  const isDark = theme === 'dark';


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const drag = useRef({ active: false, lastX: 0, lastY: 0 });
  const lastRenderTime = useRef(0);
  // Track last pointer-down position to distinguish click vs drag
  const pointerDownPos = useRef({ x: 0, y: 0 });

  const activeProject = useMemo(
    () => savedProjects.find((p) => p.id === activeSavedProjectId) ?? savedProjects[0] ?? null,
    [savedProjects, activeSavedProjectId],
  );

  // Restore saved scene config for this project
  const savedCfg = useMemo(
    () => loadSceneConfig(activeProject?.id ?? null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProject?.id],
  );

  const rs = useRef({
    rx: savedCfg.rx,
    ry: savedCfg.ry,
    zoom: savedCfg.zoom,
    autoRotate: true,
    selectedId: null as string | null,
    t: 0,
    isDragging: false,
  });

  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(480);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SceneNode | null>(null);
  const [hasCanvas2D] = useState(supportsCanvas2D);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(true);

  const nodes = useMemo(() => buildScene(levels), [levels]);
  const edges = useMemo<[number, number][]>(
    () => nodes.slice(0, -1).map((_, i) => [i, i + 1] as [number, number]),
    [nodes],
  );

  const overallProgress = useMemo(() => {
    if (!nodes.length) return 0;
    return nodes.reduce((sum, n) => sum + n.progress, 0) / nodes.length;
  }, [nodes]);

  const completedCount = nodes.filter(
    (n) => n.status === 'graded' || n.status === 'submitted' || n.progress >= 1,
  ).length;

  // ── Resize observer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) {
        // Cap at 1920×1080 for performance
        setCanvasW(Math.min(1920, Math.floor(e.contentRect.width)));
        setCanvasH(Math.min(1080, Math.floor(e.contentRect.height)));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Tab visibility pause ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // ── Intersection Observer pause (when scrolled off-screen) ───────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setCanvasVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Animation loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasCanvas2D) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const state = rs.current;

    function tick(timestamp: number) {
      if (!running) return;

      // Pause when tab hidden or off-screen
      if (tabHidden || !canvasVisible) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Frame-rate throttle: 20fps idle, 60fps when dragging
      const targetFPS = state.isDragging ? 60 : 20;
      const minInterval = 1000 / targetFPS;
      if (timestamp - lastRenderTime.current < minInterval) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastRenderTime.current = timestamp;

      state.t += 0.016;
      if (state.autoRotate && !drag.current.active) {
        state.ry += 0.003;
      }
      renderScene(ctx!, nodes, edges, state.rx, state.ry, state.zoom, state.selectedId, state.t, canvasW, canvasH);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [nodes, edges, canvasW, canvasH, tabHidden, canvasVisible, hasCanvas2D]);

  // ── Save scene config on unmount / project change ────────────────────────────
  useEffect(() => {
    return () => {
      const { rx, ry, zoom } = rs.current;
      saveSceneConfig(activeProject?.id ?? null, { rx, ry, zoom });
    };
  }, [activeProject?.id]);

  // ── Pointer controls ─────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    drag.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    rs.current.isDragging = true;
    if (rs.current.autoRotate) {
      rs.current.autoRotate = false;
      setIsAutoRotating(false);
    }
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    rs.current.ry += dx * 0.007;
    rs.current.rx = Math.max(-1.3, Math.min(1.3, rs.current.rx + dy * 0.007));
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current.active = false;
    rs.current.isDragging = false;
  }, []);

  // ── Touch pinch-to-zoom ──────────────────────────────────────────────────────
  const lastPinchDist = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && lastPinchDist.current != null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = dist / lastPinchDist.current;
      rs.current.zoom = Math.max(0.25, Math.min(3.5, rs.current.zoom * delta));
      lastPinchDist.current = dist;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    lastPinchDist.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    rs.current.zoom *= 1 - e.deltaY * 0.001;
    rs.current.zoom = Math.max(0.25, Math.min(3.5, rs.current.zoom));
  }, []);

  const onClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ignore if pointer moved significantly (was a drag)
    const moved = Math.hypot(
      e.clientX - pointerDownPos.current.x,
      e.clientY - pointerDownPos.current.y,
    );
    if (moved > 5) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvasW / rect.width);
    const my = (e.clientY - rect.top) * (canvasH / rect.height);
    const { rx, ry, zoom } = rs.current;
    const fov = 600 * zoom;
    const cx = canvasW / 2;
    const cy = canvasH / 2;

    let hit: SceneNode | null = null;
    let minD = Infinity;
    for (const node of nodes) {
      const tp = transformVec3(node.basePos, rx, ry);
      const [px, py, s] = project(tp, fov, cx, cy);
      const r = 26 * s;
      const d = Math.hypot(mx - px, my - py);
      if (d < r + 8 && d < minD) { minD = d; hit = node; }
    }
    rs.current.selectedId = hit?.id ?? null;
    setSelectedNode(hit);
  }, [nodes, canvasW, canvasH]);

  // ── Control actions ──────────────────────────────────────────────────────────
  const resetView = useCallback(() => {
    rs.current.rx = DEFAULT_SCENE.rx;
    rs.current.ry = DEFAULT_SCENE.ry;
    rs.current.zoom = DEFAULT_SCENE.zoom;
    rs.current.autoRotate = true;
    setIsAutoRotating(true);
  }, []);

  const adjustZoom = useCallback((delta: number) => {
    rs.current.zoom = Math.max(0.25, Math.min(3.5, rs.current.zoom * (1 + delta)));
  }, []);

  const toggleAutoRotate = useCallback(() => {
    const next = !rs.current.autoRotate;
    rs.current.autoRotate = next;
    setIsAutoRotating(next);
  }, []);

  const downloadSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${activeProject?.name ?? 'project'}-3d-view.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [activeProject]);

  const handleNavigate = useCallback((levelId: number) => {
    if (onNavigateToLevel) {
      onNavigateToLevel(levelId);
    } else {
      setCurrentView(`module-${levelId}` as any);
    }
  }, [onNavigateToLevel, setCurrentView]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative flex flex-col select-none overflow-hidden ${
        isFullScreen && !compact ? 'fixed inset-0 z-[9990]' : 'rounded-2xl'
      }`}
      style={{ background: TOKEN.darkNavy }}
    >
      {/* ── Top bar ── */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: `${TOKEN.navy}cc`, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${TOKEN.teal}20` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${TOKEN.teal}, ${TOKEN.cyan})` }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={isDark ? '#ffffff' : '#111827'}
              />
            </svg>

          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {activeProject?.name ?? (isAr ? 'مشروعي' : 'My Project')}
            </p>
            <p className="text-white/40 text-xs">
              {isAr ? 'عرض ثلاثي الأبعاد' : '3D Project View'}
              {!hasCanvas2D && (
                <span className="ml-2 opacity-60">{isAr ? '(بديل)' : '(fallback)'}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-3 mr-2">
            <div className="text-center">
              <p className="text-white font-bold text-sm leading-none">{completedCount}/{nodes.length}</p>
              <p className="text-white/40 text-xs mt-0.5">{isAr ? 'مكتمل' : 'Done'}</p>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <p className="font-bold text-sm leading-none" style={{ color: TOKEN.teal }}>
                {Math.round(overallProgress * 100)}%
              </p>
              <p className="text-white/40 text-xs mt-0.5">{isAr ? 'تقدم' : 'Progress'}</p>
            </div>
          </div>

          {/* Full Project View toggle */}
          <button
            onClick={() => setShowProjectPanel((v) => !v)}
            className="p-2 rounded-xl border transition-all"
            style={{
              borderColor: showProjectPanel ? TOKEN.teal + '60' : TOKEN.teal + '30',
              background: showProjectPanel ? `${TOKEN.teal}20` : `${TOKEN.teal}10`,
              color: showProjectPanel ? TOKEN.teal : 'rgba(255,255,255,0.6)',
            }}
            title={isAr ? 'عرض المشروع الكامل' : 'Full Project View'}
          >
            {showProjectPanel
              ? <PanelRightClose className="w-4 h-4" />
              : <PanelRightOpen className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowShare((v) => !v)}
            className="p-2 rounded-xl border transition-all text-white/60 hover:text-white"
            style={{ borderColor: TOKEN.teal + '30', background: `${TOKEN.teal}10` }}
            title={isAr ? 'مشاركة' : 'Share'}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {!compact && (
            <button
              onClick={() => setIsFullScreen((v) => !v)}
              className="p-2 rounded-xl border transition-all text-white/60 hover:text-white"
              style={{ borderColor: TOKEN.teal + '30', background: `${TOKEN.teal}10` }}
              title={isAr ? 'ملء الشاشة' : 'Full screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border transition-all text-white/60 hover:text-red-400"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Canvas area ── */}
      <div ref={containerRef} className="relative flex-1 min-h-0 overflow-hidden">
        {hasCanvas2D ? (
          <canvas
            ref={canvasRef}
            width={canvasW}
            height={canvasH}
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
            style={{ display: 'block' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
            onClick={onClick}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        ) : (
          <FallbackGrid nodes={nodes} language={language} />
        )}

        {/* Hint overlay (fades after mount) */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-full text-xs text-white/70"
            style={{ background: `${TOKEN.navy}cc`, border: `1px solid ${TOKEN.teal}20` }}
          >
            <span>🖱️</span>
            <span>
              {isAr
                ? 'اسحب للتدوير • عجلة التمرير للتكبير • انقر على عقدة للتفاصيل'
                : 'Drag to orbit • Scroll to zoom • Click a node for details'}
            </span>
          </div>
        </motion.div>

        {/* Paused indicator when tab is hidden */}
        {tabHidden && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/60"
              style={{ background: `${TOKEN.navy}cc`, border: `1px solid ${TOKEN.teal}15` }}
            >
              <Pause className="w-4 h-4" />
              {isAr ? 'موقوف مؤقتاً' : 'Paused'}
            </div>
          </div>
        )}

        {/* Node details panel */}
        <AnimatePresence>
          {selectedNode && (
            <NodePanel
              node={selectedNode}
              language={language}
              onClose={() => { setSelectedNode(null); rs.current.selectedId = null; }}
              onNavigate={handleNavigate}
            />
          )}
        </AnimatePresence>

        {/* Share panel */}
        <AnimatePresence>
          {showShare && (
            <SharePanel
              projectId={activeSavedProjectId}
              projectName={activeProject?.name ?? 'project'}
              language={language}
              onClose={() => setShowShare(false)}
              onDownload={() => { downloadSnapshot(); setShowShare(false); }}
            />
          )}
        </AnimatePresence>

        {/* Full Project View side panel */}
        <AnimatePresence>
          {showProjectPanel && (
            <FullProjectPanel
              nodes={nodes}
              financialKPIs={activeProject?.financialKPIs ?? financialKPIs}
              bmcData={activeProject?.bmcData ?? bmcData}
              projectName={activeProject?.name ?? (isAr ? 'مشروعي' : 'My Project')}
              projectType={activeProject?.projectType}
              language={language}
              onClose={() => setShowProjectPanel(false)}
              onNavigate={handleNavigate}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom control bar ── */}
      <div
        className="relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 flex-shrink-0"
        style={{ background: `${TOKEN.navy}cc`, backdropFilter: 'blur(12px)', borderTop: `1px solid ${TOKEN.teal}20` }}
      >
        <button
          onClick={() => adjustZoom(-0.15)}
          className="p-2 rounded-xl border text-white/60 hover:text-white transition-colors"
          style={{ borderColor: TOKEN.teal + '25', background: `${TOKEN.teal}08` }}
          title={isAr ? 'تصغير' : 'Zoom out'}
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          className="p-2 rounded-xl border text-white/60 hover:text-white transition-colors"
          style={{ borderColor: TOKEN.teal + '25', background: `${TOKEN.teal}08` }}
          title={isAr ? 'إعادة ضبط العرض' : 'Reset view'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleAutoRotate}
          className="px-3 py-2 rounded-xl border text-xs font-medium transition-all"
          style={{
            borderColor: TOKEN.teal + '40',
            background: `${TOKEN.teal}15`,
            color: TOKEN.teal,
          }}
          title={isAr ? 'تدوير تلقائي' : 'Auto-rotate'}
        >
          {isAutoRotating
            ? <><Pause className="w-3.5 h-3.5 inline mr-1" />{isAr ? 'إيقاف' : 'Pause'}</>
            : <><Play className="w-3.5 h-3.5 inline mr-1" />{isAr ? 'تشغيل' : 'Play'}</>}
        </button>

        <button
          onClick={() => adjustZoom(0.15)}
          className="p-2 rounded-xl border text-white/60 hover:text-white transition-colors"
          style={{ borderColor: TOKEN.teal + '25', background: `${TOKEN.teal}08` }}
          title={isAr ? 'تكبير' : 'Zoom in'}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-white/10 text-xs text-white/40">
          {[
            { color: TOKEN.teal,    label: isAr ? 'مكتمل'  : 'Done' },
            { color: TOKEN.cyan,    label: isAr ? 'جارٍ'   : 'In progress' },
            { color: TOKEN.mint,    label: isAr ? 'متاح'   : 'Available' },
            { color: '#4a4a6a',     label: isAr ? 'مغلق'   : 'Locked' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Full-Page Wrapper (used by route 'project-3d-view') ─────────────────────
export function ProjectVisualization3DPage() {
  const { setCurrentView, language } = useYieldX();
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: TOKEN.darkNavy }}>
      {/* Slim nav bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: TOKEN.teal + '20', background: `${TOKEN.navy}cc` }}
      >
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: TOKEN.teal }}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          {isAr ? 'الرجوع' : 'Back'}
        </button>
        <span className="text-white/20">|</span>
        <span className="text-white/60 text-sm">
          {isAr ? 'عرض المشروع ثلاثي الأبعاد' : '3D Project Visualization'}
        </span>
      </div>
      <div className="flex-1 p-4">
        <ProjectVisualization3D onClose={() => setCurrentView('dashboard')} />
      </div>
    </div>
  );
}
