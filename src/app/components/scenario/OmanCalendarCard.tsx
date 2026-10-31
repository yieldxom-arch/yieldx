import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { DEMAND_PATTERNS, type DemandPattern, type SeasonalityResult } from '@/lib/scenario';
import { VISION_2040_SECTORS, type Vision2040Sector } from '@/lib/oman/rules';

interface Props {
  language: 'ar' | 'en';
  isDark: boolean;
  openingMonth: string; // YYYY-MM
  onOpeningMonth: (v: string) => void;
  pattern: DemandPattern;
  onPattern: (p: DemandPattern) => void;
  sector: Vision2040Sector;
  onSector: (s: Vision2040Sector) => void;
  seasonality: SeasonalityResult | null;
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/** Opening month, demand pattern and Vision 2040 sector, plus a strip showing each month's demand. */
export function OmanCalendarCard({ language, isDark, openingMonth, onOpeningMonth, pattern, onPattern, sector, onSector, seasonality }: Props) {
  const isRTL = language === 'ar';
  const c = isDark
    ? { up: '#3987e5', down: '#e66767', axis: 'rgba(255,255,255,0.25)', muted: '#94a3b8', text: '#f1f5f9' }
    : { up: '#2a78d6', down: '#e34948', axis: '#cbd5e1', muted: '#64748b', text: '#0f172a' };
  const inputCls = `w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-white border-cyan-300 text-slate-900'}`;
  const labelCls = `block text-sm font-medium mb-1.5 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`;

  // Strip chart: first 24 months, bars above/below a normal month (= 1).
  const shown = seasonality ? seasonality.multipliers.slice(0, 24) : [];
  const W = 860, H = 150, m = { l: 36, r: 8, t: 14, b: 30 };
  const maxDev = Math.max(0.2, ...shown.map((v) => Math.abs(v - 1)));
  const band = (W - m.l - m.r) / Math.max(1, shown.length);
  const bw = Math.min(24, band * 0.7);
  const mid = m.t + (H - m.t - m.b) / 2;
  const y = (v: number) => mid - ((v - 1) / maxDev) * ((H - m.t - m.b) / 2);
  const monthName = (i: number) => {
    const info = seasonality!.months[i];
    return `${(isRTL ? MONTHS_AR : MONTHS_EN)[info.month - 1]} ${String(info.year).slice(2)}`;
  };

  return (
    <Card className={`p-6 mb-8 ${isDark ? 'bg-slate-800/50 border-cyan-500/30' : 'bg-white border-cyan-200'}`}>
      <div className="flex items-center gap-3 mb-1">
        <CalendarDays className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
          {isRTL ? 'التقويم العُماني للمشروع' : 'Omani calendar for your project'}
        </h2>
      </div>
      <p className={`text-sm mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {isRTL
          ? 'رمضان والعيدان والصيف والخريف والإجازات الجامعية تغيّر الطلب شهراً بشهر. يتقدم رمضان نحو 11 يوماً كل سنة، فتتغير الأشهر الضعيفة من سنة لأخرى. تُعامل أرقامك الشهرية كشهر عادي.'
          : 'Ramadan, the two Eids, summer, Khareef and university breaks change demand month by month. Ramadan moves about 11 days earlier every year, so your weak months shift from year to year. Your monthly figures are treated as a normal month.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className={labelCls}>{isRTL ? 'شهر الافتتاح المخطط' : 'Planned opening month'}</label>
          <input type="month" value={openingMonth} onChange={(e) => e.target.value && onOpeningMonth(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{isRTL ? 'نمط الطلب' : 'Demand pattern'}</label>
          <select value={pattern} onChange={(e) => onPattern(e.target.value as DemandPattern)} className={inputCls}>
            {(Object.keys(DEMAND_PATTERNS) as DemandPattern[]).map((k) => (
              <option key={k} value={k}>{isRTL ? DEMAND_PATTERNS[k].labelAr : DEMAND_PATTERNS[k].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{isRTL ? 'قطاع رؤية عُمان 2040' : 'Oman Vision 2040 sector'}</label>
          <select value={sector} onChange={(e) => onSector(e.target.value as Vision2040Sector)} className={inputCls}>
            {VISION_2040_SECTORS.map((s) => (
              <option key={s.id} value={s.id}>{isRTL ? s.labelAr : s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {seasonality && pattern !== 'none' && shown.length > 0 && (
        <>
          <div className={`flex flex-wrap gap-4 text-xs mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <span className="inline-flex items-center gap-1.5"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: c.down }} />{isRTL ? 'أضعف من الشهر العادي' : 'Weaker than a normal month'}</span>
            <span className="inline-flex items-center gap-1.5"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: c.up }} />{isRTL ? 'أقوى من الشهر العادي' : 'Stronger than a normal month'}</span>
            <span>☾ {isRTL ? 'شهر فيه أيام من رمضان' : 'month with Ramadan days'}</span>
          </div>
          <div dir="ltr">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" role="img"
              aria-label={isRTL ? 'الطلب الشهري مقارنة بالشهر العادي لأول 24 شهراً' : 'Monthly demand vs a normal month, first 24 months'}>
              <line x1={m.l} x2={W - m.r} y1={mid} y2={mid} stroke={c.axis} />
              <text x={m.l - 6} y={mid + 4} textAnchor="end" fontSize={10} fill={c.muted}>100%</text>
              {shown.map((v, i) => {
                const cx = m.l + band * i + band / 2;
                const top = Math.min(y(v), mid);
                const h = Math.max(1, Math.abs(y(v) - mid));
                const info = seasonality.months[i];
                return (
                  <g key={i}>
                    <title>{`${monthName(i)}: ${Math.round(v * 100)}%${info.ramadanShare > 0 ? (isRTL ? ' · رمضان' : ' · Ramadan') : ''}${info.eidShare > 0 ? (isRTL ? ' · عيد' : ' · Eid') : ''}`}</title>
                    {Math.abs(v - 1) > 0.002 && <rect x={cx - bw / 2} y={top} width={bw} height={h} rx={3} fill={v < 1 ? c.down : c.up} />}
                    {info.ramadanShare > 0 && <text x={cx} y={m.t - 2} textAnchor="middle" fontSize={11} fill={c.text}>☾</text>}
                    {(i % 3 === 0) && <text x={cx} y={H - 10} textAnchor="middle" fontSize={10} fill={c.muted}>{monthName(i)}</text>}
                  </g>
                );
              })}
            </svg>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isRTL
              ? 'تواريخ رمضان والعيد حسب تقويم أم القرى، وقد تختلف يوماً عن الإعلان الرسمي في عُمان. معاملات النمط افتراضات قابلة للتعديل.'
              : 'Ramadan and Eid dates follow the Umm al-Qura calendar and can differ by a day from Oman’s official announcement. Pattern factors are adjustable assumptions.'}
          </p>
        </>
      )}
    </Card>
  );
}
