/**
 * Omani calendar for the scenario engine
 * --------------------------------------
 * Turns real calendar dates into monthly demand multipliers:
 *  - Ramadan and the two Eids, from the Umm al-Qura Islamic calendar built into
 *    the browser (Intl). Ramadan moves about 11 days earlier every year, so the
 *    weak and strong months of a project change from one year to the next.
 *    Oman confirms dates by moon sighting, so real dates can differ by a day.
 *  - Summer (June to August): heat, travel, and the midday outdoor-work break.
 *  - Khareef season in Dhofar (about 21 June to 21 September).
 *  - University summer break (about mid-June to end of August).
 *
 * The factors in DEMAND_PATTERNS are starting assumptions, meant to be tuned
 * per business. The user's monthly figures are treated as a normal month.
 */

export type DemandPattern = 'none' | 'general' | 'food_retail' | 'student' | 'tourism_dhofar' | 'outdoor_work';

export interface CalendarMonth {
  year: number;
  /** 1–12 (Gregorian). */
  month: number;
  days: number;
  /** Share of the month's days that fall in Ramadan (0–1). */
  ramadanShare: number;
  /** Share of the month's days that are Eid al-Fitr (1–3 Shawwal) or Eid al-Adha (10–13 Dhu al-Hijjah). */
  eidShare: number;
  /** Share of the month in summer (June–August). */
  summerShare: number;
  /** Share of the month in Khareef season (about 21 June – 21 September). */
  khareefShare: number;
  /** Share of the month in the university summer break (about 15 June – 31 August). */
  universityBreakShare: number;
}

interface PatternFactors {
  label: string;
  labelAr: string;
  /** Demand multiplier during Ramadan days (1 = no change). */
  ramadan: number;
  eid: number;
  summer: number;
  khareef: number;
  universityBreak: number;
}

export const DEMAND_PATTERNS: Record<DemandPattern, PatternFactors> = {
  none: { label: 'No seasonal pattern', labelAr: 'بدون نمط موسمي', ramadan: 1, eid: 1, summer: 1, khareef: 1, universityBreak: 1 },
  general: { label: 'General business', labelAr: 'نشاط عام', ramadan: 0.92, eid: 1.2, summer: 0.95, khareef: 1, universityBreak: 1 },
  food_retail: { label: 'Food, cafés & retail', labelAr: 'أغذية ومقاهٍ وتجزئة', ramadan: 0.85, eid: 1.6, summer: 0.92, khareef: 1, universityBreak: 1 },
  student: { label: 'Near a university or school', labelAr: 'قرب جامعة أو مدرسة', ramadan: 0.85, eid: 0.5, summer: 1, khareef: 1, universityBreak: 0.5 },
  tourism_dhofar: { label: 'Tourism in Dhofar (Khareef)', labelAr: 'سياحة في ظفار (الخريف)', ramadan: 0.9, eid: 1.4, summer: 1, khareef: 1.8, universityBreak: 1 },
  outdoor_work: { label: 'Construction & outdoor work', labelAr: 'بناء وأعمال خارجية', ramadan: 0.85, eid: 0.6, summer: 0.85, khareef: 1, universityBreak: 1 },
};

let hijriFormatter: Intl.DateTimeFormat | null = null;
function hijri(date: Date): { month: number; day: number } | null {
  try {
    if (!hijriFormatter) {
      hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        month: 'numeric',
        day: 'numeric',
        timeZone: 'Asia/Muscat',
      });
    }
    let month = 0;
    let day = 0;
    for (const p of hijriFormatter.formatToParts(date)) {
      if (p.type === 'month') month = parseInt(p.value, 10);
      if (p.type === 'day') day = parseInt(p.value, 10);
    }
    return month && day ? { month, day } : null;
  } catch {
    return null; // Islamic calendar unavailable: Ramadan/Eid effects are skipped.
  }
}

function between(month: number, day: number, from: [number, number], to: [number, number]): boolean {
  const v = month * 100 + day;
  return v >= from[0] * 100 + from[1] && v <= to[0] * 100 + to[1];
}

const cache = new Map<string, CalendarMonth>();

export function calendarMonth(year: number, month: number): CalendarMonth {
  const key = `${year}-${month}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let ramadan = 0;
  let eid = 0;
  let khareef = 0;
  let uniBreak = 0;
  for (let d = 1; d <= days; d++) {
    const h = hijri(new Date(Date.UTC(year, month - 1, d, 12)));
    if (h) {
      if (h.month === 9) ramadan++;
      if ((h.month === 10 && h.day <= 3) || (h.month === 12 && h.day >= 10 && h.day <= 13)) eid++;
    }
    if (between(month, d, [6, 21], [9, 21])) khareef++;
    if (between(month, d, [6, 15], [8, 31])) uniBreak++;
  }
  const info: CalendarMonth = {
    year,
    month,
    days,
    ramadanShare: ramadan / days,
    eidShare: eid / days,
    summerShare: month >= 6 && month <= 8 ? 1 : 0,
    khareefShare: khareef / days,
    universityBreakShare: uniBreak / days,
  };
  cache.set(key, info);
  return info;
}

export function monthMultiplier(info: CalendarMonth, pattern: DemandPattern): number {
  const f = DEMAND_PATTERNS[pattern] ?? DEMAND_PATTERNS.none;
  const part = (factor: number, share: number) => 1 + (factor - 1) * share;
  return (
    part(f.ramadan, info.ramadanShare) *
    part(f.eid, info.eidShare) *
    part(f.summer, info.summerShare) *
    part(f.khareef, info.khareefShare) *
    part(f.universityBreak, info.universityBreakShare)
  );
}

export interface SeasonalityResult {
  /** One demand multiplier per month from the opening month. */
  multipliers: number[];
  months: CalendarMonth[];
  /** Month numbers (1-based from opening) that contain Ramadan days. */
  ramadanMonths: number[];
}

/** Demand multipliers for `count` months starting at the opening month (month is 1–12). */
export function buildSeasonality(
  startYear: number,
  startMonth: number,
  count: number,
  pattern: DemandPattern,
): SeasonalityResult {
  const multipliers: number[] = [];
  const months: CalendarMonth[] = [];
  const ramadanMonths: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startMonth - 1 + i;
    const info = calendarMonth(startYear + Math.floor(idx / 12), (idx % 12) + 1);
    months.push(info);
    multipliers.push(monthMultiplier(info, pattern));
    if (info.ramadanShare > 0) ramadanMonths.push(i + 1);
  }
  return { multipliers, months, ramadanMonths };
}

/** A sensible default pattern for each YieldX project type. */
export function defaultPattern(projectType: string | null | undefined): DemandPattern {
  switch (projectType) {
    case 'commercial':
      return 'food_retail';
    case 'service':
      return 'general';
    case 'industrial':
      return 'outdoor_work';
    case 'agricultural':
      return 'none';
    default:
      return 'general';
  }
}
