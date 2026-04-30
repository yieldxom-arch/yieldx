import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CompetitorAnalysisMap } from './CompetitorAnalysisMap';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Navigation, TrendingUp, Users, Zap, Brain, CheckCircle, AlertTriangle,
  XCircle, Star, ChevronRight, ArrowLeft, BarChart2, Activity, Target, Eye,
  Building2, ShoppingBag, Coffee, Utensils, Briefcase, RefreshCw, ChevronDown,
  ChevronUp, Info, Layers, Filter, Search
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

// ══════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════
interface CompetitorPin {
  id: string;
  name: string;
  nameAr: string;
  rating: number;
  distance: number; // km
  category: string;
  x: number; // % position on map
  y: number;
  icon: React.ElementType;
  color: string;
}

interface AIFactor {
  labelEn: string;
  labelAr: string;
  positive: boolean;
  strength: 'high' | 'moderate' | 'low';
}

// ══════════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS (based on location seed)
// ══════════════════════════════════════════════════════════════════════
function generateSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

function generateCompetitors(location: string, sector: string): CompetitorPin[] {
  const seed = generateSeed(location + sector);
  const icons = [Building2, ShoppingBag, Coffee, Utensils, Briefcase];
  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];
  const names = [
    { en: 'Al Noor Trading', ar: 'مؤسسة النور للتجارة' },
    { en: 'Gulf Business Center', ar: 'مركز الخليج للأعمال' },
    { en: 'Oman Star Enterprise', ar: 'مشروع نجمة عُمان' },
    { en: 'Al Falah Services', ar: 'خدمات الفلاح' },
    { en: 'Muscat Pro Solutions', ar: 'مسقط برو للحلول' },
    { en: 'Al Ameen Group', ar: 'مجموعة الأمين' },
  ];

  const count = 4 + Math.floor(seededRandom(seed, 0) * 4); // 4-7
  return Array.from({ length: count }, (_, i) => {
    const nameIdx = Math.floor(seededRandom(seed, i * 3) * names.length);
    return {
      id: `c${i}`,
      name: names[nameIdx]?.en || `Competitor ${i + 1}`,
      nameAr: names[nameIdx]?.ar || `منافس ${i + 1}`,
      rating: parseFloat((3.2 + seededRandom(seed, i * 5) * 1.8).toFixed(1)),
      distance: parseFloat((0.2 + seededRandom(seed, i * 7) * 3.8).toFixed(1)),
      category: sector,
      x: 15 + seededRandom(seed, i * 11) * 70,
      y: 15 + seededRandom(seed, i * 13) * 70,
      icon: icons[i % icons.length],
      color: colors[i % colors.length],
    };
  });
}

function generateMetrics(location: string) {
  const seed = generateSeed(location);
  return {
    competitionScore: Math.floor(25 + seededRandom(seed, 1) * 75),
    marketActivityScore: Math.floor(45 + seededRandom(seed, 2) * 55),
    suitabilityScore: Math.floor(50 + seededRandom(seed, 3) * 50),
    populationDensity: Math.floor(2000 + seededRandom(seed, 4) * 18000),
  };
}

function generateSparkline(seed: number, baseVal: number) {
  return Array.from({ length: 7 }, (_, i) => ({
    day: ['س', 'أ', 'ث', 'ر', 'خ', 'ج', 'ح'][i],
    value: Math.floor(baseVal * (0.8 + seededRandom(seed, i * 17) * 0.4)),
  }));
}

// ══════════════════════════════════════════════════════════════════════
// HEAT MAP CELL
// ══════════════════════════════════════════════════════════════════════
function HeatCell({ intensity }: { intensity: number }) {
  const getColor = (v: number) => {
    if (v > 0.75) return 'rgba(239,68,68,0.7)';
    if (v > 0.55) return 'rgba(249,115,22,0.6)';
    if (v > 0.35) return 'rgba(234,179,8,0.5)';
    if (v > 0.15) return 'rgba(34,197,94,0.4)';
    return 'rgba(59,130,246,0.25)';
  };
  return (
    <div
      className="rounded-sm transition-all duration-300"
      style={{ backgroundColor: getColor(intensity), aspectRatio: '1' }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════
// GAUGE METER
// ══════════════════════════════════════════════════════════════════════
function GaugeMeter({ score, labelEn, labelAr, isRTL }: { score: number; labelEn: string; labelAr: string; isRTL: boolean }) {
  const angle = -135 + (score / 100) * 270;
  const getColor = (s: number) => s < 35 ? '#10b981' : s < 65 ? '#f59e0b' : '#ef4444';
  const color = getColor(score);
  const label = score < 35 ? (isRTL ? 'منخفضة' : 'Low') : score < 65 ? (isRTL ? 'متوسطة' : 'Moderate') : (isRTL ? 'عالية' : 'High');

  const r = 70;
  const cx = 100;
  const cy = 100;
  const startAngle = -225;
  const endAngle = startAngle + (score / 100) * 270;

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleDeg: number) {
    const angleRad = (angleDeg * Math.PI) / 180;
    return { x: centerX + radius * Math.cos(angleRad), y: centerY + radius * Math.sin(angleRad) };
  }

  function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const s = polarToCartesian(cx, cy, r, startDeg);
    const e = polarToCartesian(cx, cy, r, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const needleTip = polarToCartesian(cx, cy, r - 10, angle - 90);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 200 160" className="w-48 h-36">
        {/* Track */}
        <path d={arcPath(cx, cy, r, -225, 45)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
        {/* Fill */}
        <path d={arcPath(cx, cy, r, -225, Math.min(endAngle, 44))} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill="white" />
        {/* Score */}
        <text x={cx} y={cy + 30} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">{score}</text>
        <text x={cx} y={cy + 46} textAnchor="middle" fill={color} fontSize="11">{label}</text>
      </svg>
      <p className="text-xs text-white/60 text-center">{isRTL ? labelAr : labelEn}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// RADIAL PROGRESS
// ══════════════════════════════════════════════════════════════════════
function RadialProgress({ score, labelEn, labelAr, color, isRTL }: {
  score: number; labelEn: string; labelAr: string; color: string; isRTL: boolean;
}) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 65 65)"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-white/50">/100</span>
        </div>
      </div>
      <p className="text-xs text-white/60 text-center">{isRTL ? labelAr : labelEn}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export function SmartLocationAnalysis() {
  const { moduleData, language, setCurrentView, theme } = useYieldX();
  const isRTL = language === 'ar';
  const isDark = theme !== 'light';

  // Auto-read location from Level 1
  const location = moduleData['level1']?.location || 'مسقط';
  const businessName = moduleData['level1']?.businessName || '';
  const sector = moduleData['level0']?.selectedSector || 'commercial';

  const [isLoading, setIsLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [competitors, setCompetitors] = useState<CompetitorPin[]>([]);

  const [metrics, setMetrics] = useState({ competitionScore: 0, marketActivityScore: 0, suitabilityScore: 0, populationDensity: 0 });
  const [sparklineData, setSparklineData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'market' | 'ai'>('overview');
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);

  const seed = generateSeed(location);

  const aiFactors: AIFactor[] = [
    { labelEn: 'Strong population density', labelAr: 'كثافة سكانية قوية', positive: metrics.populationDensity > 8000, strength: metrics.populationDensity > 12000 ? 'high' : 'moderate' },
    { labelEn: 'Competitor presence', labelAr: 'وجود المنافسين', positive: metrics.competitionScore < 65, strength: metrics.competitionScore < 40 ? 'high' : metrics.competitionScore < 65 ? 'moderate' : 'low' },
    { labelEn: 'High commercial activity', labelAr: 'نشاط تجاري مرتفع', positive: metrics.marketActivityScore > 60, strength: metrics.marketActivityScore > 75 ? 'high' : 'moderate' },
    { labelEn: 'Good accessibility', labelAr: 'إمكانية وصول جيدة', positive: true, strength: seededRandom(seed, 99) > 0.4 ? 'high' : 'moderate' },
    { labelEn: 'Growth potential', labelAr: 'إمكانية النمو', positive: metrics.suitabilityScore > 60, strength: metrics.suitabilityScore > 75 ? 'high' : 'moderate' },
  ];

  // Simulate loading / analysis
  useEffect(() => {
    setIsLoading(true);
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [location]);

  useEffect(() => {
    if (!isLoading) {
      const c = generateCompetitors(location, sector);
      const m = generateMetrics(location);
      setCompetitors(c);
      setMetrics(m);
      setSparklineData(generateSparkline(seed, m.marketActivityScore));
    }
  }, [isLoading, location, sector]);



  // Heat map data (10x10 grid)
  const heatGrid = Array.from({ length: 10 }, (_, row) =>
    Array.from({ length: 10 }, (_, col) => {
      const base = seededRandom(seed, row * 100 + col * 7);
      // Center bias
      const cx = Math.abs(col - 4.5) / 4.5;
      const cy = Math.abs(row - 4.5) / 4.5;
      return base * (1 - (cx + cy) * 0.3);
    })
  );

  // ── STYLES ──
  const cardClass = `rounded-2xl border backdrop-blur-sm ${isDark
    ? 'bg-white/5 border-white/10'
    : 'bg-white/80 border-white/40 shadow-lg'}`;

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-white/60' : 'text-slate-500';
  const bg = isDark
    ? 'min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900'
    : 'min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-white';

  // ══════════════════════════════════════════════════════
  // LOADING SCREEN
  // ══════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className={`${bg} flex items-center justify-center`} dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-8"
        >
          {/* Animated radar */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <svg viewBox="0 0 160 160" className="w-full h-full">
              {[60, 45, 30, 15].map((r, i) => (
                <circle key={i} cx="80" cy="80" r={r} fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
              ))}
              <line x1="80" y1="20" x2="80" y2="140" stroke="rgba(99,102,241,0.15)" strokeWidth="1" />
              <line x1="20" y1="80" x2="140" y2="80" stroke="rgba(99,102,241,0.15)" strokeWidth="1" />
              <motion.path
                d={`M80,80 L80,20 A60,60 0 0,1 ${80 + 60 * Math.sin(Math.PI / 3)},${80 - 60 * Math.cos(Math.PI / 3)} Z`}
                fill="rgba(99,102,241,0.2)"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '80px 80px' }}
              />
              <circle cx="80" cy="80" r="4" fill="#6366f1" />
            </svg>
          </div>

          <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>
            {isRTL ? '🛰️ تحليل الموقع الذكي' : '🛰️ Smart Location Analysis'}
          </h2>
          <p className={`text-sm mb-6 ${textSecondary}`}>
            {isRTL
              ? `جارٍ تحليل بيانات الموقع لـ "${location}"...`
              : `Analyzing location data for "${location}"...`}
          </p>

          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${analysisProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className={`text-xs ${textSecondary}`}>{analysisProgress}%</p>

          <div className={`mt-6 grid grid-cols-2 gap-2 text-xs ${textSecondary}`}>
            {[
              { en: '📡 Scanning competitors', ar: '📡 فحص المنافسين' },
              { en: '👥 Population analysis', ar: '👥 تحليل الكثافة السكانية' },
              { en: '📊 Market activity', ar: '📊 النشاط التجاري' },
              { en: '🤖 AI suitability', ar: '🤖 ملاءمة الذكاء الاصطناعي' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`flex items-center gap-2 p-2 rounded-lg ${analysisProgress > i * 25 ? 'text-green-400' : ''}`}
                animate={{ opacity: analysisProgress > i * 20 ? 1 : 0.3 }}
              >
                <span>{isRTL ? item.ar : item.en}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ══════════════════════════════════════════════════════
  return (
    <div className={bg} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stars bg */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {isDark && Array.from({ length: 40 }, (_, i) => (
          <motion.div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{ left: `${seededRandom(seed, i * 3) * 100}%`, top: `${seededRandom(seed, i * 7) * 100}%` }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + seededRandom(seed, i) * 3, repeat: Infinity, delay: seededRandom(seed, i * 11) * 2 }} />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">

        {/* ─── HEADER ─── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentView('module-5')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className={`w-5 h-5 ${textPrimary} ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">🛰️</span>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>
                  {isRTL ? 'تحليل الموقع الذكي' : 'Smart Location Intelligence'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Powered
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span className={`text-sm ${textSecondary}`}>
                  {isRTL ? `الموقع المحلل: ${location}` : `Analyzing: ${location}`}
                  {businessName && ` • ${businessName}`}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setIsLoading(true); setAnalysisProgress(0); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {isRTL ? 'إعادة التحليل' : 'Refresh'}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'overview', en: '🗺️ Overview', ar: '🗺️ نظرة عامة' },
              { id: 'competitors', en: '🎯 Competitors', ar: '🎯 المنافسون' },
              { id: 'market', en: '📊 Market', ar: '📊 السوق' },
              { id: 'ai', en: '🤖 AI Insights', ar: '🤖 رؤى الذكاء الاصطناعي' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : `${isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`
                }`}
              >
                {isRTL ? tab.ar : tab.en}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── KPI STRIP ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: Users, label: isRTL ? 'الكثافة السكانية' : 'Population Density',
              value: metrics.populationDensity.toLocaleString(), suffix: isRTL ? '/كم²' : '/km²',
              color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20'
            },
            {
              icon: Target, label: isRTL ? 'مستوى المنافسة' : 'Competition Level',
              value: metrics.competitionScore, suffix: '%',
              color: metrics.competitionScore < 40 ? 'from-green-500 to-emerald-600' : metrics.competitionScore < 65 ? 'from-yellow-500 to-amber-600' : 'from-red-500 to-rose-600',
              glow: 'shadow-yellow-500/20'
            },
            {
              icon: Activity, label: isRTL ? 'النشاط التجاري' : 'Market Activity',
              value: metrics.marketActivityScore, suffix: '/100',
              color: 'from-purple-500 to-violet-600', glow: 'shadow-purple-500/20'
            },
            {
              icon: Brain, label: isRTL ? 'ملاءمة الموقع' : 'Location Suitability',
              value: metrics.suitabilityScore, suffix: '%',
              color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20'
            },
          ].map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
              className={`${cardClass} p-4 relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-10 rounded-2xl`} />
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3 shadow-lg ${kpi.glow}`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`text-2xl font-bold ${textPrimary}`}>
                  {kpi.value}<span className="text-sm font-normal text-white/50 ml-1">{kpi.suffix}</span>
                </div>
                <p className={`text-xs mt-1 ${textSecondary}`}>{kpi.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ══════════════════════════════════ OVERVIEW TAB ══════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Population Heat Map */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    <h3 className={`font-semibold ${textPrimary}`}>
                      {isRTL ? 'خريطة الكثافة السكانية' : 'Population Density Map'}
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300`}>
                    {isRTL ? 'حرارية' : 'Heat Map'}
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-slate-900/50" style={{ height: '260px' }}>
                  {/* Simulated map base */}
                  <div className="absolute inset-0 flex items-center justify-center text-white/5 text-6xl select-none">
                    🗺️
                  </div>
                  {/* Street lines simulation */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {[20, 40, 60, 80].map(v => (
                      <React.Fragment key={v}>
                        <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                        <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                      </React.Fragment>
                    ))}
                  </svg>

                  {/* Heat overlay grid */}
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(10, 1fr)', gap: '1px', padding: '4px' }}>
                    {heatGrid.flat().map((intensity, idx) => (
                      <HeatCell key={idx} intensity={intensity} />
                    ))}
                  </div>

                  {/* Center location pin */}
                  <motion.div className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-lg shadow-indigo-500/50" />
                      <div className="absolute -inset-3 rounded-full bg-indigo-500/20 animate-ping" />
                    </div>
                  </motion.div>

                  {/* Location label */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                    <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      {location}
                    </div>
                    <div className="flex gap-1">
                      {['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'].map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c, opacity: 0.7 }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-blue-500/60" />
                    <span className={textSecondary}>{isRTL ? 'منخفض' : 'Low'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-yellow-500/60" />
                    <span className={textSecondary}>{isRTL ? 'متوسط' : 'Medium'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-500/70" />
                    <span className={textSecondary}>{isRTL ? 'عالي' : 'High'}</span>
                  </div>
                </div>
              </div>

              {/* Gauges */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 className="w-5 h-5 text-purple-400" />
                  <h3 className={`font-semibold ${textPrimary}`}>
                    {isRTL ? 'مقاييس الأداء' : 'Performance Meters'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <GaugeMeter
                    score={metrics.competitionScore}
                    labelEn="Competition Intensity"
                    labelAr="حدة المنافسة"
                    isRTL={isRTL}
                  />
                  <RadialProgress
                    score={metrics.marketActivityScore}
                    labelEn="Market Activity"
                    labelAr="النشاط التجاري"
                    color="#a855f7"
                    isRTL={isRTL}
                  />
                  <RadialProgress
                    score={metrics.suitabilityScore}
                    labelEn="AI Suitability"
                    labelAr="ملاءمة الذكاء الاصطناعي"
                    color="#10b981"
                    isRTL={isRTL}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-3xl font-bold text-white">{competitors.length}</div>
                    <p className={`text-xs ${textSecondary} text-center`}>
                      {isRTL ? 'منافس مكتشف' : 'Competitors Found'}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(competitors.length, 5) }, (_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-indigo-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════ COMPETITORS TAB ══════════════════════════════════ */}
          {activeTab === 'competitors' && (
            <motion.div key="competitors" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CompetitorAnalysisMap
                location={location}
                sector={sector}
                language={language}
                isDark={isDark}
              />
            </motion.div>
          )}

          {/* ══════════════════════════════════ MARKET TAB ══════════════════════════════════ */}
          {activeTab === 'market' && (
            <motion.div key="market" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Market Activity Score */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h3 className={`font-semibold ${textPrimary}`}>
                    {isRTL ? 'درجة النشاط التجاري' : 'Market Activity Score'}
                  </h3>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <RadialProgress
                    score={metrics.marketActivityScore}
                    labelEn={`Market Activity Score: ${metrics.marketActivityScore} / 100`}
                    labelAr={`درجة النشاط التجاري: ${metrics.marketActivityScore} / 100`}
                    color="#a855f7"
                    isRTL={isRTL}
                  />
                </div>

                {/* Sparkline factors */}
                <div className="space-y-3">
                  {[
                    { en: 'Business Count', ar: 'عدد الأعمال التجارية', color: '#6366f1', val: Math.floor(seededRandom(seed, 200) * 80 + 20) },
                    { en: 'Customer Traffic', ar: 'حركة العملاء', color: '#a855f7', val: Math.floor(seededRandom(seed, 300) * 80 + 20) },
                    { en: 'Growth Trend', ar: 'اتجاه النمو', color: '#10b981', val: Math.floor(seededRandom(seed, 400) * 80 + 20) },
                  ].map((factor, i) => (
                    <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${textPrimary}`}>
                          {isRTL ? factor.ar : factor.en}
                        </span>
                        <span className="text-xs font-bold" style={{ color: factor.color }}>{factor.val}%</span>
                      </div>
                      <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={generateSparkline(seed + i * 100, factor.val)}>
                          <defs>
                            <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={factor.color} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={factor.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke={factor.color} strokeWidth={2}
                            fill={`url(#grad${i})`} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competition Level Gauge */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center gap-2 mb-5">
                  <Target className="w-5 h-5 text-orange-400" />
                  <h3 className={`font-semibold ${textPrimary}`}>
                    {isRTL ? 'مؤشر حدة المنافسة' : 'Competition Level Indicator'}
                  </h3>
                </div>

                <div className="flex justify-center mb-6">
                  <GaugeMeter
                    score={metrics.competitionScore}
                    labelEn="Competition Intensity in Selected Area"
                    labelAr="حدة المنافسة في المنطقة المحددة"
                    isRTL={isRTL}
                  />
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  {[
                    { en: 'Number of Competitors', ar: 'عدد المنافسين', val: competitors.length, max: 15 },
                    { en: 'Proximity Score', ar: 'درجة القرب', val: Math.floor(seededRandom(seed, 500) * 80 + 10), max: 100 },
                    { en: 'Market Saturation', ar: 'تشبع السوق', val: Math.floor(seededRandom(seed, 600) * 80 + 10), max: 100 },
                  ].map((item, i) => {
                    const pct = Math.min(100, (item.val / item.max) * 100);
                    const color = pct < 40 ? '#10b981' : pct < 65 ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className={`text-xs ${textSecondary}`}>{isRTL ? item.ar : item.en}</span>
                          <span className="text-xs font-semibold" style={{ color }}>{item.val}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recommendation */}
                <div className={`mt-4 p-3 rounded-xl border ${
                  metrics.competitionScore < 40
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : metrics.competitionScore < 65
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <p className="text-xs font-medium">
                    {metrics.competitionScore < 40
                      ? (isRTL ? '✅ فرصة ممتازة! المنافسة منخفضة في هذه المنطقة' : '✅ Excellent opportunity! Low competition in this area')
                      : metrics.competitionScore < 65
                        ? (isRTL ? '⚠️ منافسة معتدلة. تحتاج إلى تمييز قوي' : '⚠️ Moderate competition. Strong differentiation needed')
                        : (isRTL ? '🔴 تحذير: منافسة عالية. فكر في موقع بديل' : '🔴 Warning: High competition. Consider alternative location')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════ AI INSIGHTS TAB ══════════════════════════════════ */}
          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* AI Suitability Meter */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  <h3 className={`font-semibold ${textPrimary}`}>
                    {isRTL ? 'مؤشر ملاءمة الذكاء الاصطناعي' : 'Location Suitability AI Meter'}
                  </h3>
                </div>
                <p className={`text-xs mb-5 ${textSecondary}`}>
                  {isRTL
                    ? `تحليل ذكي يتنبأ بمدى ملاءمة "${location}" لفكرتك التجارية`
                    : `AI prediction of how suitable "${location}" is for your business idea`}
                </p>

                {/* Main suitability display */}
                <div className="flex flex-col items-center py-4 mb-5">
                  <div className="relative mb-3">
                    <svg viewBox="0 0 200 110" className="w-56">
                      {/* Track */}
                      <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" strokeLinecap="round" />
                      {/* Colored segments */}
                      {[
                        { from: 0, to: 33, color: '#ef4444' },
                        { from: 33, to: 66, color: '#f59e0b' },
                        { from: 66, to: 100, color: '#10b981' },
                      ].map((seg, i) => {
                        const startDeg = -180 + (seg.from / 100) * 180;
                        const endDeg = -180 + (seg.to / 100) * 180;
                        const r = 80;
                        const cx = 100, cy = 90;
                        const toRad = (d: number) => d * Math.PI / 180;
                        const x1 = cx + r * Math.cos(toRad(startDeg));
                        const y1 = cy + r * Math.sin(toRad(startDeg));
                        const x2 = cx + r * Math.cos(toRad(endDeg));
                        const y2 = cy + r * Math.sin(toRad(endDeg));
                        return (
                          <path key={i}
                            d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                            fill="none" stroke={seg.color} strokeWidth="16" strokeLinecap="butt"
                            opacity="0.3" />
                        );
                      })}
                      {/* Active fill */}
                      {(() => {
                        const s = metrics.suitabilityScore;
                        const r = 80;
                        const cx = 100, cy = 90;
                        const toRad = (d: number) => d * Math.PI / 180;
                        const startDeg = -180;
                        const endDeg = -180 + (s / 100) * 180;
                        const x1 = cx + r * Math.cos(toRad(startDeg));
                        const y1 = cy + r * Math.sin(toRad(startDeg));
                        const x2 = cx + r * Math.cos(toRad(endDeg));
                        const y2 = cy + r * Math.sin(toRad(endDeg));
                        const color = s < 40 ? '#ef4444' : s < 65 ? '#f59e0b' : '#10b981';
                        return (
                          <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                            fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
                        );
                      })()}
                      {/* Score text */}
                      <text x="100" y="75" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">
                        {metrics.suitabilityScore}%
                      </text>
                      <text x="100" y="92" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
                        {isRTL ? 'تطابق الموقع' : 'Location Match'}
                      </text>
                      {/* Needle */}
                      {(() => {
                        const deg = -180 + (metrics.suitabilityScore / 100) * 180;
                        const rad = deg * Math.PI / 180;
                        const r2 = 68;
                        return (
                          <line x1="100" y1="90"
                            x2={100 + r2 * Math.cos(rad)} y2={90 + r2 * Math.sin(rad)}
                            stroke="white" strokeWidth="2" strokeLinecap="round" />
                        );
                      })()}
                      <circle cx="100" cy="90" r="5" fill="white" />
                    </svg>
                  </div>

                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    metrics.suitabilityScore >= 65 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : metrics.suitabilityScore >= 40 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    <Brain className="w-4 h-4" />
                    {metrics.suitabilityScore >= 65
                      ? (isRTL ? 'موقع مناسب جداً ✨' : 'Highly Suitable Location ✨')
                      : metrics.suitabilityScore >= 40
                        ? (isRTL ? 'مناسب مع تحفظات ⚠️' : 'Suitable with Caution ⚠️')
                        : (isRTL ? 'غير مناسب ❌' : 'Not Recommended ❌')}
                  </div>
                </div>

                {/* Explainable AI Factors */}
                <div>
                  <p className={`text-xs font-semibold mb-3 ${textSecondary} uppercase tracking-wider`}>
                    {isRTL ? 'عوامل القرار (Explainable AI)' : 'Decision Factors (Explainable AI)'}
                  </p>
                  <div className="space-y-2">
                    {aiFactors.map((factor, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          factor.positive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}>
                          {factor.positive
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-medium ${textPrimary}`}>
                            {isRTL ? factor.labelAr : factor.labelEn}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {['high', 'moderate', 'low'].map((s, si) => (
                              <div key={si} className={`h-1 flex-1 rounded-full ${
                                factor.strength === 'high' ? (si <= 2 ? 'bg-emerald-400' : 'bg-white/10')
                                  : factor.strength === 'moderate' ? (si <= 1 ? 'bg-yellow-400' : 'bg-white/10')
                                    : si === 0 ? 'bg-red-400' : 'bg-white/10'
                              }`} />
                            ))}
                            <span className={`text-xs ml-1 ${textSecondary}`}>
                              {factor.strength === 'high' ? (isRTL ? 'قوي' : 'Strong')
                                : factor.strength === 'moderate' ? (isRTL ? 'متوسط' : 'Moderate')
                                  : (isRTL ? 'ضعيف' : 'Weak')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations Panel */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h3 className={`font-semibold ${textPrimary}`}>
                    {isRTL ? 'التوصيات الذكية' : 'AI Recommendations'}
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: '🎯',
                      en: 'Market Entry Strategy',
                      ar: 'استراتيجية دخول السوق',
                      desc_en: metrics.competitionScore < 50
                        ? 'The area shows favorable conditions. Consider a direct market entry approach with competitive pricing.'
                        : 'High competition detected. Focus on differentiation and niche targeting to capture market share.',
                      desc_ar: metrics.competitionScore < 50
                        ? 'المنطقة تُظهر ظروفاً مواتية. فكر في دخول مباشر بأسعار تنافسية.'
                        : 'تم اكتشاف منافسة عالية. ركز على التمييز واستهداف شريحة محددة.',
                      color: '#6366f1'
                    },
                    {
                      icon: '📍',
                      en: 'Location Optimization',
                      ar: 'تحسين الموقع',
                      desc_en: `Based on population density analysis (${metrics.populationDensity.toLocaleString()}/km²), your location has ${metrics.populationDensity > 8000 ? 'strong' : 'moderate'} demand potential.`,
                      desc_ar: `بناءً على تحليل الكثافة السكانية (${metrics.populationDensity.toLocaleString()}/كم²)، موقعك يمتلك إمكانية طلب ${metrics.populationDensity > 8000 ? 'قوية' : 'متوسطة'}.`,
                      color: '#10b981'
                    },
                    {
                      icon: '📊',
                      en: 'Competitor Advantage',
                      ar: 'الميزة التنافسية',
                      desc_en: `${competitors.length} competitors found within range. Focus on superior customer service and digital presence to stand out.`,
                      desc_ar: `تم العثور على ${competitors.length} منافسين في النطاق. ركز على خدمة عملاء متميزة وحضور رقمي للتميز.`,
                      color: '#f59e0b'
                    },
                    {
                      icon: '🚀',
                      en: 'Growth Forecast',
                      ar: 'توقعات النمو',
                      desc_en: `Market activity score of ${metrics.marketActivityScore}/100 suggests ${metrics.marketActivityScore > 65 ? 'high growth potential' : 'stable growth'} for your business.`,
                      desc_ar: `درجة النشاط التجاري ${metrics.marketActivityScore}/100 تشير إلى ${metrics.marketActivityScore > 65 ? 'إمكانية نمو عالية' : 'نمو مستقر'} لمشروعك.`,
                      color: '#a855f7'
                    },
                  ].map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        expandedFactor === i
                          ? `border-opacity-50 ${isDark ? 'bg-white/10' : 'bg-white'}`
                          : `${isDark ? 'bg-white/5 border-white/10 hover:bg-white/8' : 'bg-slate-50 border-slate-200 hover:bg-white'}`
                      }`}
                      style={{ borderColor: expandedFactor === i ? rec.color : undefined }}
                      onClick={() => setExpandedFactor(expandedFactor === i ? null : i)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{rec.icon}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${textPrimary}`}>
                            {isRTL ? rec.ar : rec.en}
                          </p>
                        </div>
                        {expandedFactor === i
                          ? <ChevronUp className="w-4 h-4 text-white/40" />
                          : <ChevronDown className="w-4 h-4 text-white/40" />}
                      </div>
                      <AnimatePresence>
                        {expandedFactor === i && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={`text-xs mt-2 leading-relaxed ${textSecondary}`}
                          >
                            {isRTL ? rec.desc_ar : rec.desc_en}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* Overall verdict */}
                <div className={`mt-4 p-4 rounded-xl border ${
                  metrics.suitabilityScore >= 65
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span className={`text-xs font-bold ${metrics.suitabilityScore >= 65 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {isRTL ? 'الحكم النهائي للذكاء الاصطناعي' : 'Final AI Verdict'}
                    </span>
                  </div>
                  <p className={`text-xs ${textSecondary}`}>
                    {isRTL
                      ? `${location} ${metrics.suitabilityScore >= 65 ? 'موقع ممتاز' : 'موقع جيد'} لمشروعك بنسبة تطابق ${metrics.suitabilityScore}%. ${metrics.suitabilityScore >= 65 ? 'ننصح بالمضي قدماً.' : 'ننصح بدراسة المنافسين بعناية.'}`
                      : `${location} is a ${metrics.suitabilityScore >= 65 ? 'highly suitable' : 'moderately suitable'} location with ${metrics.suitabilityScore}% match. ${metrics.suitabilityScore >= 65 ? 'Recommended to proceed.' : 'Recommend careful competitor analysis first.'}`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── FOOTER NAV ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setCurrentView('module-5')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? 'العودة للمستوى 5' : 'Back to Level 5'}
          </button>

          <button
            onClick={() => setCurrentView('module-6')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 transition-all"
          >
            {isRTL ? 'التمويل والمؤشرات المالية' : 'Financing & Financial KPIs'}
            <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
