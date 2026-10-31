/**
 * Example feasibility study: a specialty coffee kiosk in Nizwa.
 *
 * Illustrative figures for demos and for new users who want to see a complete
 * study. The data follows the exact shape each level saves (moduleData keys
 * level1 … level7), and every total is calculated with the same formulas the
 * levels use, so Level 6 and the report show consistent numbers straight away.
 */

import type { ProjectType } from '@/app/contexts/YieldXContext';

type Lang = 'ar' | 'en';

const DEPRECIATION_RATES = { building: 5, machinery: 10, furniture: 20, vehicle: 25, other: 10 } as const;
const SOCIAL_INSURANCE_RATE = 14.5; // % of Omani salaries (same as Level 5)
const TRAINING_BUDGET_PERCENT = 5; // % of annual salaries (same as Level 5)
const HEALTH_INSURANCE_PER_EXPAT = 100; // OMR per year (Level 5 default)

const t = (lang: Lang, ar: string, en: string) => (lang === 'ar' ? ar : en);

export function buildExampleStudy(lang: Lang): {
  projectType: ProjectType;
  projectName: string;
  moduleData: Record<string, any>;
} {
  // ── Level 4: physical resources ───────────────────────────────────────────
  const fixedAssets = [
    { id: 'fa1', name: t(lang, 'ماكينة إسبريسو مزدوجة', 'Two-group espresso machine'), acquisitionMethod: 'purchase', quantity: '1', unitPrice: '3200', assetType: 'machinery' },
    { id: 'fa2', name: t(lang, 'مطحنة قهوة', 'Coffee grinder'), acquisitionMethod: 'purchase', quantity: '2', unitPrice: '450', assetType: 'machinery' },
    { id: 'fa3', name: t(lang, 'تجهيز الكشك والديكور', 'Kiosk fit-out'), acquisitionMethod: 'purchase', quantity: '1', unitPrice: '2500', assetType: 'other' },
    { id: 'fa4', name: t(lang, 'أثاث وجلسات', 'Seating and furniture'), acquisitionMethod: 'purchase', quantity: '1', unitPrice: '800', assetType: 'furniture' },
    { id: 'fa5', name: t(lang, 'نظام نقاط البيع', 'Point-of-sale system'), acquisitionMethod: 'purchase', quantity: '1', unitPrice: '350', assetType: 'other' },
  ].map((a) => ({ ...a, depreciationRate: String(DEPRECIATION_RATES[a.assetType as keyof typeof DEPRECIATION_RATES]) }));

  const rawMaterials = [
    { id: 'rm1', name: t(lang, 'حبوب قهوة مختصة', 'Specialty coffee beans'), unit: 'kg', monthlyQuantity: '60', unitPrice: '9' },
    { id: 'rm2', name: t(lang, 'حليب', 'Milk'), unit: 'L', monthlyQuantity: '320', unitPrice: '0.5' },
    { id: 'rm3', name: t(lang, 'أكواب وأغطية', 'Cups and lids'), unit: t(lang, 'قطعة', 'pcs'), monthlyQuantity: '3000', unitPrice: '0.06' },
    { id: 'rm4', name: t(lang, 'نكهات ووجبات خفيفة', 'Syrups and snacks'), unit: t(lang, 'دفعة', 'batch'), monthlyQuantity: '1', unitPrice: '220' },
  ];

  const qp = (q: string, p: string) => (parseFloat(q) || 0) * (parseFloat(p) || 0);
  const totalFixedAssetsCost = fixedAssets.reduce((s, a) => s + qp(a.quantity, a.unitPrice), 0);
  const totalMonthlyRawMaterialCost = rawMaterials.reduce((s, m) => s + qp(m.monthlyQuantity, m.unitPrice), 0);
  const totalAnnualDepreciation = fixedAssets.reduce(
    (s, a) => s + (a.acquisitionMethod === 'purchase' ? (qp(a.quantity, a.unitPrice) * parseFloat(a.depreciationRate)) / 100 : 0),
    0,
  );

  // ── Level 5: human resources ──────────────────────────────────────────────
  const employees = [
    { id: 'e1', position: t(lang, 'باريستا', 'Barista'), count: '2', nationality: 'omani', monthlySalary: '400' },
    { id: 'e2', position: t(lang, 'باريستا', 'Barista'), count: '1', nationality: 'expat', monthlySalary: '250' },
    { id: 'e3', position: t(lang, 'مشرف الوردية', 'Shift supervisor'), count: '1', nationality: 'omani', monthlySalary: '550' },
  ];
  const cnt = (e: { count: string }) => parseInt(e.count) || 0;
  const sal = (e: { count: string; monthlySalary: string }) => cnt(e) * (parseFloat(e.monthlySalary) || 0);
  const omaniEmployees = employees.filter((e) => e.nationality === 'omani').reduce((s, e) => s + cnt(e), 0);
  const expatEmployees = employees.filter((e) => e.nationality === 'expat').reduce((s, e) => s + cnt(e), 0);
  const totalEmployees = omaniEmployees + expatEmployees;
  const totalMonthlySalaries = employees.reduce((s, e) => s + sal(e), 0);
  const omaniSalaries = employees.filter((e) => e.nationality === 'omani').reduce((s, e) => s + sal(e), 0);
  const socialInsuranceMonthly = (omaniSalaries * SOCIAL_INSURANCE_RATE) / 100;
  const healthInsuranceMonthly = (expatEmployees * HEALTH_INSURANCE_PER_EXPAT) / 12;
  const trainingBudgetAnnual = (totalMonthlySalaries * 12 * TRAINING_BUDGET_PERCENT) / 100;
  const totalAnnualHRCost = totalMonthlySalaries * 12 + socialInsuranceMonthly * 12 + healthInsuranceMonthly * 12 + trainingBudgetAnnual;

  // ── Level 7: market & strategy ────────────────────────────────────────────
  const products = [
    { id: 'p1', name: t(lang, 'مشروبات الإسبريسو', 'Espresso drinks'), price: '1.3', monthlyQuantity: '1600', profitMargin: '65' },
    { id: 'p2', name: t(lang, 'مشروبات باردة', 'Cold drinks'), price: '1.6', monthlyQuantity: '900', profitMargin: '60' },
    { id: 'p3', name: t(lang, 'وجبات خفيفة', 'Snacks'), price: '0.9', monthlyQuantity: '700', profitMargin: '45' },
  ];
  const totalMonthlyRevenue = products.reduce((s, p) => s + qp(p.price, p.monthlyQuantity), 0);
  const swotPoint = (id: string, category: string, order: number, ar: string, en: string) => ({ id, category, order, text: t(lang, ar, en) });

  const licenses = [
    { id: 'l1', name: t(lang, 'السجل التجاري', 'Commercial Registration'), status: 'required', cost: '150', authority: t(lang, 'وزارة التجارة والصناعة وترويج الاستثمار', 'Ministry of Commerce, Industry and Investment Promotion') },
    { id: 'l2', name: t(lang, 'رخصة البلدية', 'Municipality licence'), status: 'required', cost: '120', authority: t(lang, 'بلدية نزوى', 'Nizwa Municipality') },
    { id: 'l3', name: t(lang, 'موافقة الدفاع المدني', 'Civil Defence approval'), status: 'required', cost: '80', authority: t(lang, 'هيئة الدفاع المدني والإسعاف', 'Civil Defence and Ambulance Authority') },
    { id: 'l4', name: t(lang, 'عضوية غرفة التجارة', 'Chamber of Commerce membership'), status: 'required', cost: '90', authority: t(lang, 'غرفة تجارة وصناعة عُمان', 'Oman Chamber of Commerce and Industry') },
  ];
  const totalLicenseCost = licenses.reduce((s, l) => s + (parseFloat(l.cost) || 0), 0);

  const moduleData: Record<string, any> = {
    level1: {
      businessName: t(lang, 'ركن القهوة المختصة', 'Specialty Coffee Corner'),
      isExample: true,
      exampleName: t(lang, 'ركن القهوة المختصة', 'Specialty Coffee Corner'),
      projectIdea: t(lang, 'كشك قهوة مختصة قرب الجامعة في نزوى يخدم الطلبة والموظفين بسرعة وجودة عالية.', 'A specialty coffee kiosk near the university in Nizwa serving students and staff with fast, high-quality drinks.'),
      productDescription: t(lang, 'مشروبات إسبريسو وباردة ووجبات خفيفة، مع طلب مسبق عبر تطبيق.', 'Espresso and cold drinks plus snacks, with pre-ordering through an app.'),
      projectStatus: 'new',
      location: t(lang, 'نزوى', 'Nizwa'),
      owners: [
        { id: 'o1', name: t(lang, 'المؤسس 1', 'Founder 1'), nationality: 'omani', age: '22', sharePercentage: '60', experience: 'intermediate' },
        { id: 'o2', name: t(lang, 'المؤسس 2', 'Founder 2'), nationality: 'omani', age: '23', sharePercentage: '40', experience: 'beginner' },
      ],
      aiFeedback: null,
    },
    level2: {
      licenses,
      leaseContracts: [
        { id: 'lc1', propertyType: t(lang, 'كشك تجاري', 'Retail kiosk'), area: '20', monthlyRent: '350', duration: t(lang, '3 سنوات', '3 years'), leaseOrOwn: 'rent' },
      ],
      aiFeedback: null,
    },
    level3: {
      location: t(lang, 'نزوى — قرب الجامعة', 'Nizwa — near the university'),
      rentCost: '350',
      utilities: '120',
      rawMaterials: t(lang, 'حبوب القهوة، الحليب، الأكواب، النكهات والوجبات الخفيفة', 'Coffee beans, milk, cups, syrups and snacks'),
      rawMaterialsCost: String(totalMonthlyRawMaterialCost),
      licenses: t(lang, 'السجل التجاري، رخصة البلدية، الدفاع المدني، غرفة التجارة', 'Commercial Registration, municipality licence, Civil Defence, Chamber of Commerce'),
      licensesCost: String(totalLicenseCost),
      operatingHours: t(lang, '7 صباحاً حتى 11 مساءً', '7:00 to 23:00'),
      aiFeedback: null,
    },
    level4: {
      fixedAssets,
      rawMaterials,
      totalFixedAssetsCost,
      totalMonthlyRawMaterialCost,
      totalAnnualDepreciation,
      aiFeedback: null,
    },
    level5: {
      employees,
      healthInsurancePerExpat: String(HEALTH_INSURANCE_PER_EXPAT),
      omaniEmployees,
      expatEmployees,
      totalEmployees,
      omanizationRate: totalEmployees > 0 ? (omaniEmployees / totalEmployees) * 100 : 0,
      totalMonthlySalaries,
      socialInsuranceMonthly,
      healthInsuranceMonthly,
      trainingBudgetAnnual,
      totalAnnualHRCost,
      aiFeedback: null,
    },
    level6: {
      equityAmount: '12000',
      loanAmount: '6000',
      interestRate: '5',
      gracePeriodMonths: '6',
      loanTermYears: '5',
      revenueGrowthRate: '8',
      costGrowthRate: '4',
      manualMonthlyRevenue: '',
      insurances: [
        { id: '1', type: t(lang, 'تأمين الممتلكات', 'Property insurance'), coverage: t(lang, 'المعدات والكشك', 'Equipment and kiosk'), annualCost: '180' },
      ],
      aiFeedback: null,
    },
    level7: {
      competitors: [
        { id: 'c1', name: t(lang, 'مقهى سلسلة عالمية', 'International chain café'), strengths: t(lang, 'علامة معروفة', 'Well-known brand'), weaknesses: t(lang, 'أسعار أعلى وبعيد عن الجامعة', 'Higher prices, farther from campus') },
        { id: 'c2', name: t(lang, 'كافتيريا تقليدية', 'Traditional cafeteria'), strengths: t(lang, 'أسعار منخفضة', 'Low prices'), weaknesses: t(lang, 'جودة قهوة أقل', 'Lower coffee quality') },
      ],
      products,
      totalMonthlyRevenue,
      swot: {
        strengths: [swotPoint('s1', 'strength', 0, 'موقع قريب من آلاف الطلبة', 'Location close to thousands of students')],
        weaknesses: [swotPoint('w1', 'weakness', 0, 'علامة تجارية جديدة', 'New, unknown brand')],
        opportunities: [swotPoint('op1', 'opportunity', 0, 'نمو ثقافة القهوة المختصة في عُمان', 'Growing specialty coffee culture in Oman')],
        threats: [swotPoint('t1', 'threat', 0, 'انخفاض المبيعات في الإجازات الجامعية', 'Lower sales during university holidays')],
      },
      competitorSwot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      aiFeedback: null,
    },
  };

  return {
    projectType: 'commercial',
    projectName: t(lang, 'دراسة مثال: ركن القهوة المختصة', 'Example study: Specialty Coffee Corner'),
    moduleData,
  };
}
