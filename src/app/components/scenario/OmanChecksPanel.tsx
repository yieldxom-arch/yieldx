import React, { useEffect, useMemo } from 'react';
import { ShieldCheck, Landmark, Flag, ExternalLink, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { cashSurvival, loanSchedule, monthlyOperatingCash, type BaseProjection } from '@/lib/scenario';
import { OMAN_RULES, corporateTax, nationalImpact, vatCheck, type Vision2040Sector } from '@/lib/oman/rules';

export interface DevTerms {
  rate: string; // annual %
  grace: string; // months
  term: string; // years
}

export interface OmanChecksSummary {
  vatMandatoryMonth: number | null;
  taxRateYear1: number | null;
  totalTax: number;
  financing: { id: string; ownMoney: number; firstNegativeMonth: number | null; lowestBalance: number; toughFirstNegativeMonth: number | null; totalInterest: number }[];
  impactScore: number;
  omanizationRate: number;
  annualLocalSpend: number;
  annualPublicContribution: number;
  checkedOn: string;
}

interface Props {
  language: 'ar' | 'en';
  isDark: boolean;
  base: BaseProjection | null;
  seasonality?: number[];
  totalInvestment: number;
  upfrontSpend: number; // fixed assets + pre-operating costs (everything except working capital)
  equity: number;
  loan: number;
  interestRatePct: number;
  graceMonths: number;
  termYears: number;
  devTerms: DevTerms;
  onDevTerms: (t: DevTerms) => void;
  incomeLimit: string;
  onIncomeLimit: (v: string) => void;
  annualRevenue: number[];
  annualProfit: number[];
  totalEmployees: number;
  omaniEmployees: number;
  omanizationTarget: number;
  monthlyOmaniSalaries: number;
  monthlyRent: number;
  monthlyUtilities: number;
  monthlyOperatingCosts: number;
  omaniOwned: boolean | null;
  sector: Vision2040Sector;
  licenceCount: number;
  onSummary?: (s: OmanChecksSummary) => void;
}

const iso = (t: string) => `⁦${t}⁩`;
const fmt = (n: number) => iso(Math.round(n).toLocaleString('en-US'));
const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export function OmanChecksPanel(p: Props) {
  const isRTL = p.language === 'ar';
  const omr = isRTL ? 'ر.ع' : 'OMR';
  const card = `p-6 mb-8 ${p.isDark ? 'bg-slate-800/50 border-cyan-500/30' : 'bg-white border-cyan-200'}`;
  const h2 = `text-2xl font-bold ${p.isDark ? 'text-white' : 'text-cyan-900'}`;
  const sub = `text-sm mb-4 ${p.isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const muted = p.isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = `w-full px-3 py-1.5 rounded-lg border text-sm ${p.isDark ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-white border-cyan-300 text-slate-900'}`;

  const calc = useMemo(() => {
    if (!p.base) return null;
    const months = p.base.revenue.length * 12;
    const seas = p.seasonality;
    const monthlyRevenue = Array.from({ length: months }, (_, m) => (p.base!.revenue[Math.floor(m / 12)] / 12) * (seas?.[m] ?? 1));
    const vat = vatCheck(monthlyRevenue);
    const tax = corporateTax({
      omaniOwned: p.omaniOwned,
      employees: p.totalEmployees,
      capital: p.equity,
      annualGrossIncome: p.annualRevenue,
      annualProfit: p.annualProfit,
      maxGrossIncome: num(p.incomeLimit) || OMAN_RULES.corporateTax.smallMaxGrossIncome,
    });
    const spfMonthly = p.monthlyOmaniSalaries * OMAN_RULES.spf.employerRateOmani;

    const opCash = monthlyOperatingCash(p.base, { seasonality: seas, excludeFinancing: true });
    const tough = monthlyOperatingCash(p.base, { seasonality: seas, excludeFinancing: true, revenueFactor: 0.8 });
    const option = (id: string, label: string, labelAr: string, ownMoney: number, loanAmount: number, rate: number, grace: number, term: number) => {
      const sched = loanSchedule({ amount: loanAmount, annualRate: rate / 100, graceMonths: grace, termYears: term }, months);
      const start = ownMoney + loanAmount - p.upfrontSpend;
      const plan = cashSurvival(opCash, start, sched.payments);
      const bad = cashSurvival(tough, start, sched.payments);
      const firstRepayment = sched.payments.find((v, i) => i >= grace && v > 0) ?? 0;
      return { id, label, labelAr, ownMoney, loanAmount, instalment: firstRepayment, totalInterest: sched.totalInterest, plan, bad };
    };
    const devAmount = p.loan > 0 ? p.loan : Math.max(0, p.totalInvestment - p.equity);
    const options = [
      option('own', 'Own money only', 'تمويل ذاتي فقط', p.totalInvestment, 0, 0, 0, 1),
      option('plan', 'Your financing plan', 'خطة التمويل الحالية', p.equity, p.loan, p.interestRatePct, p.graceMonths, p.termYears || 1),
      option('dev', 'Development finance offer', 'عرض تمويل تنموي', p.equity, devAmount, num(p.devTerms.rate), num(p.devTerms.grace), num(p.devTerms.term) || 1),
    ];

    const year1Revenue = p.annualRevenue[0] ?? 0;
    const annualVat = vat.mandatoryMonth !== null && vat.mandatoryMonth <= 12 ? year1Revenue * OMAN_RULES.vat.rate : 0;
    const impact = nationalImpact({
      omaniEmployees: p.omaniEmployees,
      totalEmployees: p.totalEmployees,
      omanizationTarget: p.omanizationTarget,
      monthlyOmaniSalaries: p.monthlyOmaniSalaries,
      monthlyRent: p.monthlyRent,
      monthlyUtilities: p.monthlyUtilities,
      monthlyOperatingCosts: p.monthlyOperatingCosts,
      sector: p.sector,
      annualSpf: spfMonthly * 12,
      annualCorporateTax: tax.years[0]?.tax ?? 0,
      annualVat,
    });
    return { vat, tax, spfMonthly, options, impact };
  }, [p]);

  const summary: OmanChecksSummary | null = calc
    ? {
        vatMandatoryMonth: calc.vat.mandatoryMonth,
        taxRateYear1: calc.tax.years[0]?.rate ?? null,
        totalTax: calc.tax.totalTax,
        financing: calc.options.map((o) => ({
          id: o.id,
          ownMoney: o.ownMoney,
          firstNegativeMonth: o.plan.firstNegativeMonth,
          lowestBalance: o.plan.lowestBalance,
          toughFirstNegativeMonth: o.bad.firstNegativeMonth,
          totalInterest: o.totalInterest,
        })),
        impactScore: calc.impact.score,
        omanizationRate: calc.impact.omanizationRate,
        annualLocalSpend: calc.impact.annualLocalSpend,
        annualPublicContribution: calc.impact.annualPublicContribution,
        checkedOn: OMAN_RULES.checkedOn,
      }
    : null;
  const summaryKey = summary ? JSON.stringify(summary) : '';
  useEffect(() => {
    if (summary) p.onSummary?.(summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryKey]);

  if (!calc) return null;
  const { vat, tax, spfMonthly, options, impact } = calc;

  const Row = ({ status, title, children, source }: { status: 'ok' | 'warn' | 'info'; title: string; children: React.ReactNode; source?: string }) => (
    <div className={`flex gap-3 py-3 border-t ${p.isDark ? 'border-white/10' : 'border-slate-200'}`}>
      <div className="pt-0.5">
        {status === 'ok' && <CheckCircle2 className="w-5 h-5 text-green-500" aria-label={isRTL ? 'متوافق' : 'OK'} />}
        {status === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-500" aria-label={isRTL ? 'انتبه' : 'Attention'} />}
        {status === 'info' && <Info className={`w-5 h-5 ${p.isDark ? 'text-cyan-300' : 'text-cyan-600'}`} aria-label={isRTL ? 'معلومة' : 'Info'} />}
      </div>
      <div className="flex-1">
        <div className={`font-semibold ${p.isDark ? 'text-white' : 'text-slate-900'}`}>{title}</div>
        <div className={`text-sm ${p.isDark ? 'text-slate-200' : 'text-slate-700'}`}>{children}</div>
        {source && <div className={`text-xs mt-1 ${muted}`}>{(isRTL ? 'المصدر: ' : 'Source: ') + source}</div>}
      </div>
    </div>
  );

  const omanOk = impact.omanizationRate >= p.omanizationTarget;
  const taxSmallAll = tax.years.length > 0 && tax.years.every((y) => y.small);

  return (
    <>
      {/* ── Omani rules check ── */}
      <Card className={card}>
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className={`w-6 h-6 ${p.isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <h2 className={h2}>{isRTL ? 'فحص الأنظمة العُمانية' : 'Omani rules check'}</h2>
        </div>
        <p className={sub}>
          {isRTL
            ? `كل نتيجة مبنية على قاعدة عُمانية مع مصدرها. آخر مراجعة للقواعد: ${OMAN_RULES.checkedOn}. تقديرات تخطيطية وليست استشارة ضريبية أو قانونية.`
            : `Every result comes from an Omani rule, with its source. Rules last checked: ${OMAN_RULES.checkedOn}. Planning estimates, not tax or legal advice.`}
        </p>

        <Row status="info" title={isRTL ? 'الحماية الاجتماعية للموظفين العُمانيين' : 'Social protection for Omani staff'} source={isRTL ? OMAN_RULES.spf.sourceAr : OMAN_RULES.spf.source}>
          {isRTL
            ? `اشتراك صاحب العمل: ${fmt(spfMonthly)} ر.ع شهرياً (14.5% من رواتب العُمانيين).`
            : `Employer contribution: ${fmt(spfMonthly)} OMR per month (14.5% of Omani salaries).`}
        </Row>

        <Row status={omanOk ? 'ok' : 'warn'} title={isRTL ? 'التعمين' : 'Omanization'}>
          {isRTL
            ? `نسبتك ${Math.round(impact.omanizationRate)}% مقابل هدف قطاعك في YieldX ${p.omanizationTarget}%. نسب التعمين الرسمية تحددها وزارة العمل لكل مهنة، تأكد منها لنشاطك.`
            : `Your rate is ${Math.round(impact.omanizationRate)}% against YieldX's target for your sector of ${p.omanizationTarget}%. Official Omanization quotas are set per profession by the Ministry of Labour: confirm them for your activity.`}
        </Row>

        <Row status={vat.mandatoryMonth ? 'warn' : 'ok'} title={isRTL ? 'ضريبة القيمة المضافة (5%)' : 'VAT (5%)'} source={isRTL ? OMAN_RULES.vat.sourceAr : OMAN_RULES.vat.source}>
          {vat.mandatoryMonth
            ? isRTL
              ? `يصبح التسجيل إلزامياً في الشهر ${vat.mandatoryMonth} من التشغيل (تجاوز 38,500 ر.ع خلال 12 شهراً)، والتقديم خلال 30 يوماً. إذا كانت أسعارك تشمل الضريبة فستحتفظ بنحو ${fmt(vat.annualRevenueLossIfPricesInclusive)} ر.ع أقل سنوياً.`
              : `Registration becomes mandatory in month ${vat.mandatoryMonth} of operation (over OMR 38,500 in 12 months); apply within 30 days. If your prices already include VAT, you keep about ${fmt(vat.annualRevenueLossIfPricesInclusive)} OMR less per year.`
            : isRTL
              ? 'لا يصل المشروع إلى حد التسجيل الإلزامي خلال فترة الدراسة.'
              : 'The project does not reach the mandatory registration threshold within the study period.'}
          {!vat.mandatoryMonth && vat.voluntaryMonth && (isRTL ? ` التسجيل الاختياري متاح من الشهر ${vat.voluntaryMonth}.` : ` Voluntary registration is possible from month ${vat.voluntaryMonth}.`)}
        </Row>

        <Row status={taxSmallAll ? 'ok' : 'info'} title={isRTL ? 'ضريبة الدخل على الشركات' : 'Corporate income tax'} source={isRTL ? OMAN_RULES.corporateTax.sourceAr : OMAN_RULES.corporateTax.source}>
          <div>
            {tax.years.map((y) => (
              <span key={y.year} className="inline-block me-3">
                {isRTL ? `السنة ${y.year}: ` : `Year ${y.year}: `}
                <strong>{Math.round(y.rate * 100)}%</strong> = {fmt(y.tax)} {omr}
              </span>
            ))}
          </div>
          <div className="mt-1">
            {tax.blockers.length === 0
              ? isRTL ? 'مؤهل لنسبة 3% للمنشآت الصغيرة حسب بيانات دراستك.' : 'Eligible for the 3% small-business rate based on your study data.'
              : (isRTL ? 'نسبة 3% غير متاحة بسبب: ' : 'The 3% rate is ruled out by: ') + (isRTL ? tax.blockersAr : tax.blockers).join(isRTL ? '، ' : ', ') + '.'}
            {p.omaniOwned === null && (isRTL ? ' جنسية الملاك غير محددة في المستوى 1.' : ' Owner nationality is not set in Level 1.')}
          </div>
          <label className={`mt-2 flex items-center gap-2 text-xs ${muted}`}>
            {isRTL ? 'حد الدخل الإجمالي للمنشآت الصغيرة (ر.ع):' : 'Small-business gross income limit (OMR):'}
            <input type="number" value={p.incomeLimit} onChange={(e) => p.onIncomeLimit(e.target.value)} className={`${inputCls} max-w-[140px]`} />
          </label>
        </Row>

        <Row status="info" title={isRTL ? 'التراخيص' : 'Licences'}>
          {isRTL ? `${p.licenceCount} تراخيص في دراستك. ` : `${p.licenceCount} licences in your study. `}
          <a href={OMAN_RULES.licensing.portal} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 underline ${p.isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
            {isRTL ? 'تحقق من نشاطك ورسومه على منصة استثمر بسهولة' : 'Check your exact activity and fees on Invest Easy'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {isRTL ? ' (محاكي التراخيص وقائمة الأنشطة).' : ' (licence simulator and activity list).'}
        </Row>
      </Card>

      {/* ── Financing survival test ── */}
      <Card className={card}>
        <div className="flex items-center gap-3 mb-1">
          <Landmark className={`w-6 h-6 ${p.isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <h2 className={h2}>{isRTL ? 'اختبار النجاة المالية' : 'Financing survival test'}</h2>
        </div>
        <p className={sub}>
          {isRTL
            ? 'هل يبقى رصيد المشروع النقدي موجباً كل شهر؟ نقارن طرق التمويل مع التقويم العُماني، ثم مع إيرادات أقل بنسبة 20%. يقدّم بنك التنمية وهيئة ريادة برامج تمويل للمؤسسات الصغيرة والمتوسطة: أدخل شروط العرض الذي تحصل عليه.'
            : 'Does the business keep a positive cash balance every month? We compare financing options with the Omani calendar applied, then with 20% lower revenue. The Development Bank and Riyada offer SME financing programmes: enter the terms of the offer you get.'}
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4 max-w-xl">
          <label className={`text-xs ${muted}`}>{isRTL ? 'فائدة العرض السنوية %' : 'Offer interest rate %'}
            <input type="number" value={p.devTerms.rate} onChange={(e) => p.onDevTerms({ ...p.devTerms, rate: e.target.value })} className={inputCls} />
          </label>
          <label className={`text-xs ${muted}`}>{isRTL ? 'فترة السماح (أشهر)' : 'Grace period (months)'}
            <input type="number" value={p.devTerms.grace} onChange={(e) => p.onDevTerms({ ...p.devTerms, grace: e.target.value })} className={inputCls} />
          </label>
          <label className={`text-xs ${muted}`}>{isRTL ? 'مدة القرض (سنوات)' : 'Loan term (years)'}
            <input type="number" value={p.devTerms.term} onChange={(e) => p.onDevTerms({ ...p.devTerms, term: e.target.value })} className={inputCls} />
          </label>
        </div>
        <div className={`overflow-x-auto rounded-lg border ${p.isDark ? 'border-slate-700' : 'border-cyan-200'}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={p.isDark ? 'bg-slate-900/40 text-slate-300' : 'bg-cyan-50 text-cyan-800'}>
                <th className="px-3 py-2 text-start font-medium">{isRTL ? 'الخيار' : 'Option'}</th>
                <th className="px-3 py-2 text-end font-medium">{isRTL ? 'أموالك' : 'Your money'}</th>
                <th className="px-3 py-2 text-end font-medium">{isRTL ? 'القسط الشهري' : 'Monthly instalment'}</th>
                <th className="px-3 py-2 text-end font-medium">{isRTL ? 'أدنى رصيد (الشهر)' : 'Lowest cash (month)'}</th>
                <th className="px-3 py-2 text-start font-medium">{isRTL ? 'مع الخطة' : 'With the plan'}</th>
                <th className="px-3 py-2 text-start font-medium">{isRTL ? 'مع إيرادات أقل 20%' : 'With 20% less revenue'}</th>
                <th className="px-3 py-2 text-end font-medium">{isRTL ? 'إجمالي الفوائد' : 'Total interest'}</th>
              </tr>
            </thead>
            <tbody className={p.isDark ? 'text-slate-200' : 'text-slate-800'}>
              {options.map((o) => {
                const verdict = (m: number | null) =>
                  m === null
                    ? <span className={p.isDark ? 'text-green-300' : 'text-green-700'}>{isRTL ? '✓ يبقى موجباً' : '✓ Stays positive'}</span>
                    : <span className={p.isDark ? 'text-red-300' : 'text-red-700'}>{isRTL ? `✗ ينفد النقد في الشهر ${m}` : `✗ Runs out of cash in month ${m}`}</span>;
                return (
                  <tr key={o.id} className={`border-t ${p.isDark ? 'border-slate-700' : 'border-cyan-100'}`}>
                    <td className="px-3 py-2">{isRTL ? o.labelAr : o.label}</td>
                    <td className="px-3 py-2 text-end tabular-nums">{fmt(o.ownMoney)}</td>
                    <td className="px-3 py-2 text-end tabular-nums">{o.loanAmount > 0 ? fmt(o.instalment) : '—'}</td>
                    <td className="px-3 py-2 text-end tabular-nums">{fmt(o.plan.lowestBalance)} ({o.plan.lowestMonth})</td>
                    <td className="px-3 py-2">{verdict(o.plan.firstNegativeMonth)}</td>
                    <td className="px-3 py-2">{verdict(o.bad.firstNegativeMonth)}</td>
                    <td className="px-3 py-2 text-end tabular-nums">{o.loanAmount > 0 ? fmt(o.totalInterest) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={`text-xs mt-2 ${muted}`}>
          {isRTL
            ? 'القرض: فوائد فقط خلال فترة السماح ثم أقساط متساوية. الرصيد يبدأ بالتمويل ناقص الأصول وتكاليف ما قبل التشغيل، ويشمل رأس المال العامل.'
            : 'Loan: interest only during the grace period, then equal instalments. Cash starts at the financing minus assets and pre-opening costs, so it includes the working capital.'}
        </p>
      </Card>

      {/* ── National impact ── */}
      <Card className={card}>
        <div className="flex items-center gap-3 mb-1">
          <Flag className={`w-6 h-6 ${p.isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <h2 className={h2}>{isRTL ? 'الأثر الوطني' : 'National impact'}</h2>
        </div>
        <p className={sub}>
          {isRTL ? 'ماذا يقدّم المشروع لعُمان؟ الدرجة مجموع أربعة أجزاء ظاهرة أدناه.' : 'What does the project give Oman? The score is the sum of the four parts shown below.'}
        </p>
        <div className="grid md:grid-cols-[180px_1fr] gap-6 items-start">
          <div className={`p-4 rounded-lg border text-center ${p.isDark ? 'bg-slate-900/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-xs ${muted}`}>{isRTL ? 'درجة الأثر الوطني' : 'National impact score'}</div>
            <div className={`text-5xl font-bold ${p.isDark ? 'text-white' : 'text-slate-900'}`}>{impact.score}</div>
            <div className={`text-xs ${muted}`}>/ 100</div>
          </div>
          <div className="space-y-2">
            {impact.parts.map((part) => (
              <div key={part.id}>
                <div className={`flex justify-between text-sm ${p.isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <span>{isRTL ? part.labelAr : part.label}</span>
                  <span className="tabular-nums">{Math.round(part.points)} / {part.max}</span>
                </div>
                <div className={`h-2 rounded-full ${p.isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div className="h-2 rounded-full" style={{ width: `${(part.points / part.max) * 100}%`, background: p.isDark ? '#3987e5' : '#2a78d6' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-sm ${p.isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          <div>{isRTL ? 'وظائف للعُمانيين' : 'Jobs for Omanis'}: <strong>{fmt(p.omaniEmployees)}</strong> / {fmt(p.totalEmployees)}</div>
          <div>{isRTL ? 'إنفاق يبقى في عُمان سنوياً (حد أدنى)' : 'Spending kept in Oman per year (at least)'}: <strong>{fmt(impact.annualLocalSpend)} {omr}</strong></div>
          <div>{isRTL ? 'مساهمة في الإيرادات العامة سنوياً' : 'Public revenue per year'}: <strong>{fmt(impact.annualPublicContribution)} {omr}</strong></div>
        </div>
        <p className={`text-xs mt-2 ${muted}`}>
          {isRTL
            ? 'الإنفاق المحلي = رواتب العُمانيين + الحماية الاجتماعية + الإيجار + المرافق (المواد الخام غير محسوبة لأن مصدرها غير معروف). الإيرادات العامة = الحماية الاجتماعية + ضريبة الدخل في السنة 1 + ضريبة القيمة المضافة المحصلة إذا كان التسجيل إلزامياً في السنة 1.'
            : 'Local spending = Omani salaries + social protection + rent + utilities (raw materials are left out because their origin is unknown). Public revenue = social protection + year-1 income tax + VAT collected if registration is mandatory in year 1.'}
        </p>
      </Card>
    </>
  );
}
