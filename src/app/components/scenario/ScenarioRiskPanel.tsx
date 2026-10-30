import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Info } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import {
  DEFAULT_DRIVERS,
  DEFAULT_EVENTS,
  simulate,
  type BaseProjection,
  type ScenarioResult,
} from '@/lib/scenario';

/** Compact summary saved with the study so the AI and the PDF report can quote it. */
export interface ScenarioSummary {
  years: number;
  iterations: number;
  seed: number;
  planNet: number;
  planBreakEvenMonth: number | null;
  pProfit: number;
  pBreakEven: number;
  netP10: number;
  netP50: number;
  netP90: number;
  breakEvenMonthP50: number | null;
  topDriver: string;
  topDriverAr: string;
}

interface Props {
  base: BaseProjection | null;
  language: 'ar' | 'en';
  isDark: boolean;
  onResult?: (summary: ScenarioSummary) => void;
}

const SEED = 2026;

// Numbers are wrapped in Unicode LTR isolates so signs and suffixes stay in place inside Arabic text.
const iso = (t: string) => `\u2066${t}\u2069`;
const fmt = (n: number) => iso(Math.round(n).toLocaleString('en-US'));
const sfmt = (n: number) =>
  iso((n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('en-US'));
const compact = (n: number) => {
  const a = Math.abs(n);
  const s = n < 0 ? '−' : '';
  if (a >= 1_000_000) return iso(s + (a / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M');
  if (a >= 1000) return iso(s + (a / 1000).toFixed(1).replace(/\.0$/, '') + 'K');
  return iso(s + Math.round(a));
};
const pct = (p: number) => Math.round(p * 100) + '%';

function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min || 1;
  const step0 = Math.pow(10, Math.floor(Math.log10(span / count)));
  const err = span / count / step0;
  const step = step0 * (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1);
  const t: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) t.push(Math.round(v));
  return t;
}

/** Horizontal bar with rounded data-end(s), square where it meets the centre line. */
function hbar(x0: number, x1: number, y: number, h: number, roundLeft: boolean, roundRight: boolean) {
  const r = Math.min(4, Math.abs(x1 - x0) / 2, h / 2);
  const rl = roundLeft ? r : 0;
  const rr = roundRight ? r : 0;
  return `M${x0 + rl},${y} H${x1 - rr} ${rr ? `Q${x1},${y} ${x1},${y + rr}` : ''} V${y + h - rr} ${
    rr ? `Q${x1},${y + h} ${x1 - rr},${y + h}` : ''
  } H${x0 + rl} ${rl ? `Q${x0},${y + h} ${x0},${y + h - rl}` : ''} V${y + rl} ${rl ? `Q${x0},${y} ${x0 + rl},${y}` : ''} Z`;
}

export function ScenarioRiskPanel({ base, language, isDark, onResult }: Props) {
  const isRTL = language === 'ar';
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  // Palette validated for colour-blind separation (light / dark steps).
  const c = isDark
    ? { s1: '#3987e5', plan: '#d95926', down: '#e66767', grid: 'rgba(255,255,255,0.08)', axis: 'rgba(255,255,255,0.22)', muted: '#94a3b8', text: '#f1f5f9', ring: '#0f172a' }
    : { s1: '#2a78d6', plan: '#eb6834', down: '#e34948', grid: '#e2e8f0', axis: '#cbd5e1', muted: '#64748b', text: '#0f172a', ring: '#ffffff' };

  const baseKey = base ? JSON.stringify(base) : '';

  useEffect(() => {
    if (!base) {
      setResult(null);
      return;
    }
    // Debounce so typing in the inputs doesn't re-run thousands of simulations per keystroke.
    const id = setTimeout(() => {
      try {
        const years = base.revenue.length;
        const r = simulate(base, DEFAULT_DRIVERS, DEFAULT_EVENTS, {
          iterations: years > 5 ? 4000 : 8000,
          seed: SEED,
          annualDiscountRate: 0.1,
        });
        setResult(r);
        onResult?.({
          years,
          iterations: r.iterations,
          seed: r.seed,
          planNet: r.baseCase.net,
          planBreakEvenMonth: r.baseCase.breakEvenMonth,
          pProfit: r.pPositiveNet,
          pBreakEven: r.pBreakEvenWithinHorizon,
          netP10: r.net.p10,
          netP50: r.net.p50,
          netP90: r.net.p90,
          breakEvenMonthP50: r.breakEvenMonth ? Math.round(r.breakEvenMonth.p50) : null,
          topDriver: r.sensitivity[0]?.label ?? '',
          topDriverAr: r.sensitivity[0]?.labelAr ?? '',
        });
      } catch (e) {
        console.error('Scenario engine error', e);
        setResult(null);
      }
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey]);

  const fan = useMemo(() => {
    if (!result) return null;
    const W = 860, H = 300, m = { l: 56, r: 96, t: 14, b: 30 };
    const plan = result.baseCase.cumulative;
    const lo = Math.min(...result.fan.map((f) => f.p10), ...plan, 0);
    const hi = Math.max(...result.fan.map((f) => f.p90), ...plan, 0);
    const ticks = niceTicks(lo, hi, 5);
    const y0 = Math.min(ticks[0], lo);
    const y1 = Math.max(ticks[ticks.length - 1], hi);
    const n = result.fan.length;
    const x = (i: number) => m.l + (i / (n - 1)) * (W - m.l - m.r);
    const y = (v: number) => m.t + (1 - (v - y0) / (y1 - y0 || 1)) * (H - m.t - m.b);
    let band = '';
    result.fan.forEach((f, i) => (band += (i ? 'L' : 'M') + x(i) + ',' + y(f.p90)));
    for (let i = n - 1; i >= 0; i--) band += 'L' + x(i) + ',' + y(result.fan[i].p10);
    const path = (vals: number[]) => vals.map((v, i) => (i ? 'L' : 'M') + x(i) + ',' + y(v)).join('');
    const xTicks = Array.from(new Set([0, ...Array.from({ length: Math.floor(n / 12) }, (_, k) => (k + 1) * 12 - 1)]));
    return { W, H, m, x, y, ticks, band: band + 'Z', p50: path(result.fan.map((f) => f.p50)), plan: path(plan), planVals: plan, n, xTicks };
  }, [result]);

  if (!base) {
    return (
      <Card className={`p-6 mb-8 ${isDark ? 'bg-slate-800/50 border-cyan-500/30' : 'bg-white border-cyan-200'}`}>
        <div className={`flex items-center gap-2 ${isDark ? 'text-cyan-200' : 'text-cyan-800'}`}>
          <Info className="w-5 h-5" />
          {isRTL
            ? 'أضف منتجاتك في مستوى السوق والاستراتيجية، أو أدخل الإيرادات الشهرية المتوقعة أعلاه، لتشغيل محاكاة المخاطر.'
            : 'Add your products in Market & Strategy, or enter the expected monthly revenue above, to run the risk simulation.'}
        </div>
      </Card>
    );
  }

  const top = result?.sensitivity[0];
  const tileCls = `p-4 rounded-lg border ${isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-slate-200'}`;
  const labelCls = `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const valueCls = `text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`;
  const subCls = `text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

  return (
    <Card className={`p-6 mb-8 ${isDark ? 'bg-slate-800/50 border-cyan-500/30' : 'bg-white border-cyan-200'}`}>
      <div className="flex items-center gap-3 mb-1">
        <Activity className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
          {isRTL ? 'محاكاة المخاطر (مونت كارلو)' : 'Risk Simulation (Monte Carlo)'}
        </h2>
      </div>
      <p className={`text-sm mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {isRTL
          ? `نختبر خطتك في ${result ? result.iterations.toLocaleString('en-US') : '…'} مستقبل محتمل بدلاً من رقم واحد. الأرقام محسوبة وليست مولّدة بالذكاء الاصطناعي، وتتكرر بنفس النتيجة لنفس المدخلات.`
          : `Your plan tested across ${result ? result.iterations.toLocaleString('en-US') : '…'} possible futures instead of one number. Figures are calculated, not AI-generated, and the same inputs always give the same result.`}
      </p>

      {!result ? (
        <div className={labelCls}>{isRTL ? 'جاري المحاكاة…' : 'Simulating…'}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={tileCls}>
              <div className={labelCls}>{isRTL ? 'احتمال تحقيق ربح' : 'Chance of making a profit'}</div>
              <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{pct(result.pPositiveNet)}</div>
              <div className={subCls}>
                {isRTL ? `خلال ${base.revenue.length} سنوات` : `within ${base.revenue.length} years`}
              </div>
            </div>
            <div className={tileCls}>
              <div className={labelCls}>{isRTL ? 'النتيجة المرجحة (P50)' : 'Likely result (P50)'}</div>
              <div className={valueCls}>{sfmt(result.net.p50)}</div>
              <div className={subCls}>{isRTL ? `الخطة: ${sfmt(result.baseCase.net)} ر.ع` : `Plan: ${sfmt(result.baseCase.net)} OMR`}</div>
            </div>
            <div className={tileCls}>
              <div className={labelCls}>{isRTL ? 'سيناريو سيئ 1 من 10 (P10)' : '1-in-10 bad case (P10)'}</div>
              <div className={valueCls}>{sfmt(result.net.p10)}</div>
              <div className={subCls}>{isRTL ? 'ر.ع' : 'OMR'}</div>
            </div>
            <div className={tileCls}>
              <div className={labelCls}>{isRTL ? 'التعادل المرجح' : 'Likely break-even'}</div>
              <div className={valueCls}>
                {result.breakEvenMonth
                  ? (isRTL ? 'الشهر ' : 'Month ') + Math.round(result.breakEvenMonth.p50)
                  : isRTL ? 'خارج الفترة' : 'Beyond horizon'}
              </div>
              <div className={subCls}>
                {isRTL ? 'الخطة: الشهر ' : 'Plan: month '}
                {result.baseCase.breakEvenMonth ?? '—'}
              </div>
            </div>
          </div>

          {top && (
            <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100' : 'bg-cyan-50 border-cyan-200 text-cyan-900'}`}>
              {isRTL
                ? `تعتمد النتيجة أكثر شيء على: ${top.labelAr}. تحقّق من هذا الافتراض أولاً.`
                : `The result depends most on: ${top.label.toLowerCase()}. Validate this assumption first.`}
            </div>
          )}

          {/* Fan chart */}
          {fan && (
            <div className="mb-6">
              <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isRTL ? 'التدفق النقدي التراكمي' : 'Cumulative cash'}
              </h3>
              <div className={`flex flex-wrap gap-4 text-xs mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <span className="inline-flex items-center gap-1.5"><i className="inline-block w-4 h-0.5 rounded" style={{ background: c.s1 }} />{isRTL ? 'المسار المرجح' : 'Likely path (P50)'}</span>
                <span className="inline-flex items-center gap-1.5"><i className="inline-block w-3.5 h-2.5 rounded-sm" style={{ background: c.s1, opacity: 0.2 }} />{isRTL ? '80% من الاحتمالات' : '80% of futures (P10–P90)'}</span>
                <span className="inline-flex items-center gap-1.5"><i className="inline-block w-4 h-0.5 rounded" style={{ background: c.plan }} />{isRTL ? 'الخطة كما هي' : 'The plan as written'}</span>
              </div>
              <div className="relative" dir="ltr">
                <svg viewBox={`0 0 ${fan.W} ${fan.H}`} className="w-full h-auto overflow-visible" role="img"
                  aria-label={isRTL ? 'مخطط التدفق النقدي التراكمي' : 'Cumulative cash fan chart'}
                  onMouseLeave={() => setHover(null)}
                  onMouseMove={(e) => {
                    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                    const sx = ((e.clientX - rect.left) / rect.width) * fan.W;
                    const i = Math.round(((sx - fan.m.l) / (fan.W - fan.m.l - fan.m.r)) * (fan.n - 1));
                    setHover(i >= 0 && i < fan.n ? i : null);
                  }}>
                  {fan.ticks.map((t) => (
                    <g key={t}>
                      <line x1={fan.m.l} x2={fan.W - fan.m.r} y1={fan.y(t)} y2={fan.y(t)} stroke={t === 0 ? c.axis : c.grid} strokeWidth={1} />
                      <text x={fan.m.l - 8} y={fan.y(t) + 4} textAnchor="end" fontSize={11} fill={c.muted}>{compact(t)}</text>
                    </g>
                  ))}
                  <text x={fan.m.l + 6} y={fan.y(0) - 6} fontSize={11} fill={c.muted}>{isRTL ? 'التعادل' : 'Break-even'}</text>
                  {fan.xTicks.map((i) => (
                    <text key={i} x={fan.x(i)} y={fan.H - 8} textAnchor="middle" fontSize={11} fill={c.muted}>
                      {i === 0 ? (isRTL ? 'شهر 1' : 'Month 1') : String(i + 1)}
                    </text>
                  ))}
                  <path d={fan.band} fill={c.s1} fillOpacity={0.14} />
                  <path d={fan.plan} fill="none" stroke={c.plan} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  <path d={fan.p50} fill="none" stroke={c.s1} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {[
                    { v: fan.planVals[fan.n - 1], col: c.plan, t: (isRTL ? 'الخطة ' : 'Plan ') + compact(fan.planVals[fan.n - 1]) },
                    { v: result.fan[fan.n - 1].p50, col: c.s1, t: (isRTL ? 'مرجح ' : 'Likely ') + compact(result.fan[fan.n - 1].p50) },
                  ].map((d) => (
                    <g key={d.t}>
                      <circle cx={fan.x(fan.n - 1)} cy={fan.y(d.v)} r={4} fill={d.col} stroke={c.ring} strokeWidth={2} />
                      <text x={fan.x(fan.n - 1) + 9} y={fan.y(d.v) + 4} fontSize={12} fontWeight={600} fill={c.text}>{d.t}</text>
                    </g>
                  ))}
                  {hover !== null && (
                    <g pointerEvents="none">
                      <line x1={fan.x(hover)} x2={fan.x(hover)} y1={fan.m.t} y2={fan.H - fan.m.b} stroke={c.axis} />
                      <circle cx={fan.x(hover)} cy={fan.y(result.fan[hover].p50)} r={4} fill={c.s1} stroke={c.ring} strokeWidth={2} />
                      <circle cx={fan.x(hover)} cy={fan.y(fan.planVals[hover])} r={4} fill={c.plan} stroke={c.ring} strokeWidth={2} />
                    </g>
                  )}
                </svg>
                {hover !== null && (
                  <div
                    className={`absolute pointer-events-none text-xs rounded-lg border px-3 py-2 shadow-lg whitespace-nowrap ${isDark ? 'bg-slate-900 border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                    style={{
                      left: `${(fan.x(hover) / fan.W) * 100}%`,
                      top: 8,
                      transform: fan.x(hover) > fan.W * 0.6 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
                    }}
                  >
                    <div className="font-semibold mb-1">{isRTL ? 'الشهر ' : 'Month '}{hover + 1}</div>
                    <div>{isRTL ? 'مرجح' : 'Likely'}: {sfmt(result.fan[hover].p50)}</div>
                    <div>P10–P90: {sfmt(result.fan[hover].p10)} … {sfmt(result.fan[hover].p90)}</div>
                    <div>{isRTL ? 'الخطة' : 'Plan'}: {sfmt(fan.planVals[hover])}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tornado */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isRTL ? 'على ماذا تعتمد النتيجة؟' : 'What the result depends on most'}
              </h3>
              <div className={`flex gap-4 text-xs mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <span className="inline-flex items-center gap-1.5"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: c.down }} />{isRTL ? 'أسوأ من الخطة' : 'Worse than plan'}</span>
                <span className="inline-flex items-center gap-1.5"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: c.s1 }} />{isRTL ? 'أفضل من الخطة' : 'Better than plan'}</span>
              </div>
              <Tornado result={result} isRTL={isRTL} colors={c} />
            </div>
            <div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isRTL ? 'أحداث عالمية (World Events)' : 'World Events'}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    <th className="text-start font-medium py-1.5">{isRTL ? 'الحدث' : 'Event'}</th>
                    <th className="text-end font-medium py-1.5">{isRTL ? 'الاحتمال' : 'Chance'}</th>
                    <th className="text-end font-medium py-1.5">{isRTL ? 'متوسط الأثر (ر.ع)' : 'Avg. impact (OMR)'}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.events.map((e, i) => (
                    <tr key={e.id} className={`border-t ${isDark ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
                      <td className="py-1.5">{isRTL ? e.labelAr : e.label}</td>
                      <td className="py-1.5 text-end tabular-nums">{pct(DEFAULT_EVENTS[i].probability)}</td>
                      <td className={`py-1.5 text-end tabular-nums ${e.avgImpactWhenOccurs < 0 ? (isDark ? 'text-red-300' : 'text-red-700') : (isDark ? 'text-green-300' : 'text-green-700')}`}>
                        {sfmt(e.avgImpactWhenOccurs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={`text-xs mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isRTL
                  ? `${result.iterations.toLocaleString('en-US')} محاكاة · بذرة ${result.seed} · تدفق نقدي تشغيلي قبل الضريبة (الإهلاك غير نقدي) · نطاقات الافتراضات قابلة للتعديل حسب القطاع.`
                  : `${result.iterations.toLocaleString('en-US')} simulations · seed ${result.seed} · operating cash before tax (depreciation is non-cash) · assumption ranges are defaults, tunable per sector.`}
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

function Tornado({
  result,
  isRTL,
  colors: c,
}: {
  result: ScenarioResult;
  isRTL: boolean;
  colors: { s1: string; down: string; axis: string; muted: string; text: string };
}) {
  const rows = result.sensitivity;
  const base = result.baseCase.net;
  const W = 520, rowH = 36, m = { l: 150, r: 60, t: 22, b: 6 }, pad = 44;
  const H = m.t + rows.length * rowH + m.b;
  const lo = Math.min(base, ...rows.map((s) => Math.min(s.netAtLow, s.netAtHigh)));
  const hi = Math.max(base, ...rows.map((s) => Math.max(s.netAtLow, s.netAtHigh)));
  const x = (v: number) => m.l + pad + ((v - lo) / (hi - lo || 1)) * (W - m.l - m.r - pad);
  return (
    <div dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" role="img"
        aria-label={isRTL ? 'حساسية النتيجة لكل افتراض' : 'Sensitivity of the result to each assumption'}>
        <line x1={x(base)} x2={x(base)} y1={m.t - 6} y2={H - m.b} stroke={c.axis} />
        <text x={x(base)} y={m.t - 10} textAnchor="middle" fontSize={11} fill={c.muted}>
          {(isRTL ? 'الخطة ' : 'Plan ') + compact(base)}
        </text>
        {rows.map((s, i) => {
          const y = m.t + i * rowH + 9;
          const h = 18;
          const worst = Math.min(s.netAtLow, s.netAtHigh);
          const best = Math.max(s.netAtLow, s.netAtHigh);
          return (
            <g key={s.kind}>
              <title>{`${isRTL ? s.labelAr : s.label}: ${fmt(worst)} … ${fmt(best)}`}</title>
              <rect x={0} y={y - 9} width={W} height={rowH} fill="transparent" />
              <text x={m.l - 12} y={y + 13} textAnchor="end" fontSize={12} fill={c.text}>{isRTL ? s.labelAr : s.label}</text>
              {worst < base - 0.5 && <path d={hbar(x(worst), x(base), y, h, true, false)} fill={c.down} />}
              {best > base + 0.5 && <path d={hbar(x(base), x(best), y, h, false, true)} fill={c.s1} />}
              {worst < base - 0.5 && <text x={x(worst) - 6} y={y + 13} textAnchor="end" fontSize={11} fill={c.muted}>{compact(worst)}</text>}
              {best > base + 0.5 && <text x={x(best) + 6} y={y + 13} fontSize={11} fill={c.muted}>{compact(best)}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
