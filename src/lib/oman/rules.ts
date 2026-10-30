/**
 * Omani rules used by the feasibility study
 * -----------------------------------------
 * Every figure here has a source and the date it was last checked, and is shown
 * to the user next to the result it changes. Update `checkedOn` whenever a value
 * is reviewed. These are planning estimates, not tax or legal advice.
 */

export const OMAN_RULES = {
  checkedOn: '2026-10-31',
  spf: {
    /** Employer social protection contribution for Omani employees (all branches). */
    employerRateOmani: 0.145,
    source:
      'Social Protection Fund, Social Protection Law (Royal Decree 52/2023): employer total 14.5% for Omani staff since the sick-leave insurance branch started on 19 July 2026',
    sourceAr:
      'صندوق الحماية الاجتماعية، قانون الحماية الاجتماعية (المرسوم السلطاني 52/2023): إجمالي اشتراك صاحب العمل 14.5% للموظف العُماني منذ بدء تأمين الإجازات المرضية في 19 يوليو 2026',
  },
  vat: {
    rate: 0.05,
    mandatoryThreshold: 38500,
    voluntaryThreshold: 19250,
    source: 'Oman Tax Authority, VAT Law (Royal Decree 121/2020): 5%; registration mandatory above OMR 38,500 of taxable supplies in 12 months, voluntary from OMR 19,250',
    sourceAr: 'جهاز الضرائب، قانون ضريبة القيمة المضافة (المرسوم السلطاني 121/2020): 5%، والتسجيل إلزامي إذا تجاوزت التوريدات 38,500 ر.ع خلال 12 شهراً، واختياري من 19,250 ر.ع',
  },
  corporateTax: {
    standardRate: 0.15,
    smallRate: 0.03,
    smallMaxCapital: 50000,
    smallMaxEmployees: 15,
    /** Sources differ (OMR 100,000 or 150,000): editable in the UI, confirm with the Oman Tax Authority. */
    smallMaxGrossIncome: 100000,
    source:
      'Income Tax Law (Royal Decree 28/2009, amended by Royal Decree 9/2017): 15%, or 3% for small Omani businesses meeting capital, staff and income conditions. Published income limits differ (OMR 100,000 / 150,000): confirm with the Oman Tax Authority',
    sourceAr:
      'قانون ضريبة الدخل (المرسوم السلطاني 28/2009 المعدل بالمرسوم 9/2017): 15%، أو 3% للمنشآت العُمانية الصغيرة المستوفية لشروط رأس المال وعدد الموظفين والدخل. حد الدخل يختلف بين المصادر (100,000 / 150,000 ر.ع): يُرجى التأكد من جهاز الضرائب',
  },
  licensing: {
    portal: 'https://www.business.gov.om',
    name: 'Invest Easy (Ministry of Commerce, Industry and Investment Promotion)',
    nameAr: 'منصة استثمر بسهولة (وزارة التجارة والصناعة وترويج الاستثمار)',
  },
} as const;

/** Vision 2040 economic diversification sectors used for the impact score. */
export const VISION_2040_SECTORS = [
  { id: 'none', label: 'Not a priority sector', labelAr: 'ليس قطاعاً ذا أولوية' },
  { id: 'manufacturing', label: 'Manufacturing', labelAr: 'الصناعات التحويلية' },
  { id: 'logistics', label: 'Logistics & transport', labelAr: 'اللوجستيات والنقل' },
  { id: 'tourism', label: 'Tourism & hospitality', labelAr: 'السياحة والضيافة' },
  { id: 'fisheries_food', label: 'Fisheries, agriculture & food security', labelAr: 'الثروة السمكية والزراعة والأمن الغذائي' },
  { id: 'mining', label: 'Mining', labelAr: 'التعدين' },
  { id: 'renewables', label: 'Renewable energy & green technology', labelAr: 'الطاقة المتجددة والتقنيات الخضراء' },
  { id: 'digital_education', label: 'Technology, digital services & education', labelAr: 'التقنية والخدمات الرقمية والتعليم' },
] as const;

export type Vision2040Sector = (typeof VISION_2040_SECTORS)[number]['id'];

export function defaultVisionSector(projectType: string | null | undefined): Vision2040Sector {
  if (projectType === 'agricultural') return 'fisheries_food';
  if (projectType === 'industrial') return 'manufacturing';
  return 'none';
}

// ── VAT ─────────────────────────────────────────────────────────────────────

export interface VatResult {
  /** 1-based month in which rolling 12-month revenue first exceeds the mandatory threshold. */
  mandatoryMonth: number | null;
  /** 1-based month in which voluntary registration first becomes possible. */
  voluntaryMonth: number | null;
  /**
   * If prices already include VAT, revenue kept by the business falls by 1/21 (5/105)
   * once registered. Annual amount at the first year's revenue after registration.
   */
  annualRevenueLossIfPricesInclusive: number;
}

export function vatCheck(monthlyRevenue: number[]): VatResult {
  const { mandatoryThreshold, voluntaryThreshold, rate } = OMAN_RULES.vat;
  let mandatoryMonth: number | null = null;
  let voluntaryMonth: number | null = null;
  let rolling = 0;
  monthlyRevenue.forEach((rev, m) => {
    rolling += rev;
    if (m >= 12) rolling -= monthlyRevenue[m - 12];
    if (voluntaryMonth === null && rolling > voluntaryThreshold) voluntaryMonth = m + 1;
    if (mandatoryMonth === null && rolling > mandatoryThreshold) mandatoryMonth = m + 1;
  });
  let loss = 0;
  if (mandatoryMonth !== null) {
    const start = mandatoryMonth; // registration from the following month
    const window = monthlyRevenue.slice(start, start + 12);
    const annual = window.length ? (window.reduce((s, v) => s + v, 0) / window.length) * 12 : 0;
    loss = annual * (rate / (1 + rate));
  }
  return { mandatoryMonth, voluntaryMonth, annualRevenueLossIfPricesInclusive: loss };
}

// ── Corporate income tax ────────────────────────────────────────────────────

export interface TaxInputs {
  /** true if all owners are Omani; null if unknown. */
  omaniOwned: boolean | null;
  employees: number;
  /** Paid-up capital (equity). */
  capital: number;
  annualGrossIncome: number[];
  annualProfit: number[];
  /** Override of the small-business gross income limit. */
  maxGrossIncome?: number;
}

export interface TaxYear {
  year: number;
  small: boolean;
  rate: number;
  tax: number;
  profitAfterTax: number;
}

export interface TaxResult {
  years: TaxYear[];
  /** Conditions that rule out the 3% rate in any year (empty if eligible in every year). */
  blockers: string[];
  blockersAr: string[];
  totalTax: number;
}

export function corporateTax(inp: TaxInputs): TaxResult {
  const r = OMAN_RULES.corporateTax;
  const maxIncome = inp.maxGrossIncome ?? r.smallMaxGrossIncome;
  const blockers: string[] = [];
  const blockersAr: string[] = [];
  if (inp.omaniOwned === false) {
    blockers.push('not fully Omani-owned');
    blockersAr.push('الملكية ليست عُمانية بالكامل');
  }
  if (inp.employees > r.smallMaxEmployees) {
    blockers.push(`more than ${r.smallMaxEmployees} employees`);
    blockersAr.push(`أكثر من ${r.smallMaxEmployees} موظفاً`);
  }
  if (inp.capital > r.smallMaxCapital) {
    blockers.push(`capital above OMR ${r.smallMaxCapital.toLocaleString('en-US')}`);
    blockersAr.push(`رأس المال أعلى من ${r.smallMaxCapital.toLocaleString('en-US')} ر.ع`);
  }
  const baseEligible = blockers.length === 0;
  let incomeBlocked = false;
  const years = inp.annualProfit.map((profit, i) => {
    const income = inp.annualGrossIncome[i] ?? 0;
    const small = baseEligible && income <= maxIncome;
    if (baseEligible && income > maxIncome) incomeBlocked = true;
    const rate = small ? r.smallRate : r.standardRate;
    const tax = Math.max(0, profit) * rate;
    return { year: i + 1, small, rate, tax, profitAfterTax: profit - tax };
  });
  if (incomeBlocked) {
    blockers.push(`gross income above OMR ${maxIncome.toLocaleString('en-US')} in some years`);
    blockersAr.push(`الدخل الإجمالي أعلى من ${maxIncome.toLocaleString('en-US')} ر.ع في بعض السنوات`);
  }
  return { years, blockers, blockersAr, totalTax: years.reduce((s, y) => s + y.tax, 0) };
}

// ── National impact score ───────────────────────────────────────────────────

export interface ImpactInputs {
  omaniEmployees: number;
  totalEmployees: number;
  omanizationTarget: number; // %
  monthlyOmaniSalaries: number;
  monthlyRent: number;
  monthlyUtilities: number;
  monthlyOperatingCosts: number;
  sector: Vision2040Sector;
  annualSpf: number;
  annualCorporateTax: number;
  annualVat: number;
}

export interface ImpactResult {
  score: number;
  omanizationRate: number;
  /** Share of monthly operating costs that stays in Oman (lower bound). */
  localShare: number;
  annualLocalSpend: number;
  annualPublicContribution: number;
  parts: { id: string; label: string; labelAr: string; points: number; max: number }[];
}

export function nationalImpact(inp: ImpactInputs): ImpactResult {
  const omanizationRate = inp.totalEmployees > 0 ? (inp.omaniEmployees / inp.totalEmployees) * 100 : 0;
  const spfMonthly = inp.annualSpf / 12;
  const localMonthly = inp.monthlyOmaniSalaries + spfMonthly + inp.monthlyRent + inp.monthlyUtilities;
  const localShare = inp.monthlyOperatingCosts > 0 ? Math.min(1, localMonthly / inp.monthlyOperatingCosts) : 0;
  const parts = [
    { id: 'jobs', label: 'Jobs for Omanis (10+ = full marks)', labelAr: 'وظائف للعُمانيين (10 فأكثر = الدرجة الكاملة)', max: 30, points: Math.min(inp.omaniEmployees, 10) / 10 * 30 },
    { id: 'omanization', label: 'Omanization vs sector target', labelAr: 'التعمين مقارنة بهدف القطاع', max: 30, points: inp.omanizationTarget > 0 ? Math.min(omanizationRate / inp.omanizationTarget, 1) * 30 : 0 },
    { id: 'local', label: 'Spending that stays in Oman', labelAr: 'الإنفاق الذي يبقى داخل عُمان', max: 25, points: localShare * 25 },
    { id: 'sector', label: 'Vision 2040 priority sector', labelAr: 'قطاع ذو أولوية في رؤية 2040', max: 15, points: inp.sector !== 'none' ? 15 : 0 },
  ];
  return {
    score: Math.round(parts.reduce((s, p) => s + p.points, 0)),
    omanizationRate,
    localShare,
    annualLocalSpend: localMonthly * 12,
    annualPublicContribution: inp.annualSpf + inp.annualCorporateTax + inp.annualVat,
    parts,
  };
}
