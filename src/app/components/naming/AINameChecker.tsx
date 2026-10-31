import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  ExternalLink,
  Info,
  Landmark,
  Lightbulb,
  Loader2,
  ScrollText,
  Users,
  XCircle,
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { useYieldX } from '@/app/contexts/YieldXContext';
import {
  TRADE_NAME_RULES,
  TRADE_NAME_SOURCE,
  checkTradeName,
  isSimilarName,
  namingTips,
  type NameCheckRecord,
  type OfficialNameStatus,
} from '@/lib/oman/tradeNames';
import { checkNameInRegistry, type RegistryCounts } from '@/lib/oman/nameRegistry';

interface AINameCheckerProps {
  value?: string;
  businessName?: string;
  language?: 'ar' | 'en';
  onChange?: (value: string) => void;
  /** Kept for older callers; the checker no longer generates name suggestions. */
  onNameSelect?: (name: string) => void;
  placeholder?: string;
  /** The last saved check, so the official result survives a reload. */
  savedCheck?: NameCheckRecord | null;
  /** Called whenever the check result changes, so the parent can save it. */
  onCheckChange?: (record: NameCheckRecord) => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Trade-name check for Oman. Three layers:
 * 1. Rules from Ministerial Decision 124/2016 (checked in the app).
 * 2. Other YieldX studies (your own, plus other users' as counts only).
 * 3. The official answer from the Ministry's Invest Easy service, which the
 *    user checks and records here.
 */
export function AINameChecker({
  value,
  businessName,
  language = 'en',
  onChange,
  placeholder,
  savedCheck,
  onCheckChange,
}: AINameCheckerProps) {
  const { savedProjects, activeSavedProjectId } = useYieldX();
  const isAr = language === 'ar';
  const tx = (en: string, ar: string) => (isAr ? ar : en);

  const [inputValue, setInputValue] = useState(value ?? businessName ?? '');
  const [debounced, setDebounced] = useState(inputValue.trim());
  const [registry, setRegistry] = useState<RegistryCounts | null | 'loading'>(null);
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);
  const [official, setOfficial] = useState<NameCheckRecord['official']>(
    savedCheck?.official ?? { status: 'not_checked' }
  );
  const [officialFor, setOfficialFor] = useState<string>(savedCheck?.name ?? '');
  const [officialDate, setOfficialDate] = useState<string>(savedCheck?.official?.date ?? todayISO());

  useEffect(() => {
    setInputValue(value ?? businessName ?? '');
  }, [value, businessName]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(inputValue.trim()), 400);
    return () => clearTimeout(id);
  }, [inputValue]);

  const rules = useMemo(() => checkTradeName(debounced), [debounced]);
  const tips = useMemo(() => namingTips(debounced), [debounced]);

  // Your own other studies with the same or a similar name.
  const ownMatches = useMemo(() => {
    if (!debounced) return [] as { name: string; kind: 'same' | 'similar' }[];
    const out: { name: string; kind: 'same' | 'similar' }[] = [];
    for (const p of savedProjects || []) {
      if (p.id === activeSavedProjectId) continue;
      const names = [p.moduleDataSnapshot?.level1?.businessName, p.name].filter(
        (n): n is string => typeof n === 'string' && n.trim().length > 0
      );
      for (const n of names) {
        const kind = isSimilarName(debounced, n);
        if (kind) {
          out.push({ name: n, kind });
          break;
        }
      }
    }
    return out;
  }, [debounced, savedProjects, activeSavedProjectId]);

  // Other users' studies: counts only.
  useEffect(() => {
    let cancelled = false;
    if (!rules.normalized) {
      setRegistry(null);
      return;
    }
    setRegistry('loading');
    checkNameInRegistry(rules.normalized).then(r => {
      if (!cancelled) setRegistry(r);
    });
    return () => {
      cancelled = true;
    };
  }, [rules.normalized]);

  // The official result belongs to the exact name that was checked.
  const officialApplies = officialFor.trim() !== '' && officialFor.trim() === debounced;
  const officialStatus: OfficialNameStatus = officialApplies ? official.status : 'not_checked';

  // Report the result upward so Level 1 can save it and print it in the report.
  const lastSent = useRef('');
  useEffect(() => {
    if (!onCheckChange) return;
    const record: NameCheckRecord = {
      name: debounced,
      rules: rules.verdict,
      ruleIssues: rules.issues.map(i => `${i.id}:${i.level}`),
      yieldx: {
        own: ownMatches.length,
        others: registry && registry !== 'loading' ? registry.exact + registry.similar : null,
        checkedAt: todayISO(),
      },
      official: officialApplies ? official : { status: 'not_checked' },
    };
    const key = JSON.stringify({ ...record, yieldx: { ...record.yieldx, checkedAt: '' } });
    if (key === lastSent.current || registry === 'loading') return;
    lastSent.current = key;
    onCheckChange(record);
  }, [debounced, rules, ownMatches, registry, official, officialApplies, onCheckChange]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange?.(e.target.value);
  };

  const openInvestEasy = async () => {
    try {
      await navigator.clipboard?.writeText(debounced);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* copying is a convenience only */
    }
    window.open(TRADE_NAME_SOURCE.official.url, '_blank', 'noopener,noreferrer');
  };

  const recordOfficial = (status: OfficialNameStatus) => {
    setOfficial({ status, date: officialDate || todayISO() });
    setOfficialFor(debounced);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(isAr ? 'ar-OM' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  const verdictStyle = {
    ok: {
      box: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/30',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      label: tx('No problems found with the rules', 'لا توجد مخالفات للقواعد'),
    },
    risky: {
      box: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-500/30',
      text: 'text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
      label: tx('May be refused', 'قد يُرفض'),
    },
    not_allowed: {
      box: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-500/30',
      text: 'text-red-800 dark:text-red-200',
      icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
      label: tx('Not allowed by the rules', 'غير مسموح حسب القواعد'),
    },
  }[rules.verdict];

  const cardBase = 'p-4 border bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700';
  const heading = 'font-semibold text-slate-900 dark:text-white';
  const muted = 'text-xs text-slate-600 dark:text-slate-400';

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={inputValue}
        onChange={handleInput}
        className="w-full px-4 py-2 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder={placeholder || tx('Enter business name', 'أدخل اسم المشروع')}
      />

      {debounced.length >= 2 && (
        <div className="space-y-3">
          {/* 1. Rules check */}
          <Card className={`p-4 border ${verdictStyle.box}`}>
            <div className="flex items-start gap-3">
              <ScrollText className="w-5 h-5 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className={heading}>{tx('1. Omani naming rules', '١. قواعد الأسماء التجارية في عُمان')}</h4>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${verdictStyle.text}`}>
                    {verdictStyle.icon}
                    {verdictStyle.label}
                  </span>
                </div>

                {rules.issues.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {rules.issues.map(issue => (
                      <li key={issue.id} className="flex items-start gap-2 text-sm">
                        {issue.level === 'not_allowed' ? (
                          <XCircle className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        )}
                        <span className="text-slate-800 dark:text-slate-200">{isAr ? issue.ar : issue.en}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => setShowRules(s => !s)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-300 hover:underline"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRules ? 'rotate-180' : ''}`} />
                  {showRules ? tx('Hide the rules', 'إخفاء القواعد') : tx('Show the rules we check', 'عرض القواعد التي نفحصها')}
                </button>
                {showRules && (
                  <ul className="mt-2 space-y-1.5">
                    {TRADE_NAME_RULES.map(r => (
                      <li key={r.id} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span
                          className={`shrink-0 mt-px px-1.5 py-px rounded border text-[10px] font-medium ${
                            r.checked === 'auto'
                              ? 'border-emerald-300 text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-300'
                              : r.checked === 'partly'
                                ? 'border-amber-300 text-amber-800 dark:border-amber-500/40 dark:text-amber-300'
                                : 'border-slate-300 text-slate-700 dark:border-slate-500 dark:text-slate-300'
                          }`}
                        >
                          {r.checked === 'auto'
                            ? tx('checked', 'يُفحص')
                            : r.checked === 'partly'
                              ? tx('partly checked', 'يُفحص جزئياً')
                              : tx('check yourself', 'تحقق بنفسك')}
                        </span>
                        <span>{isAr ? r.ar : r.en}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className={`${muted} mt-3`}>
                  {tx('Source: ', 'المصدر: ')}
                  {isAr ? TRADE_NAME_SOURCE.decision.ar : TRADE_NAME_SOURCE.decision.en}
                  {tx('. Checked on ', '. تاريخ المراجعة: ')}
                  {formatDate(TRADE_NAME_SOURCE.checkedOn)}
                  {tx(
                    '. The app checks for known problem words and brands; it cannot catch every case.',
                    '. يفحص التطبيق الكلمات والعلامات المعروفة، ولا يمكنه اكتشاف كل الحالات.'
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* 2. YieldX check */}
          <Card className={cardBase}>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className={heading}>{tx('2. Other YieldX studies', '٢. دراسات أخرى في YieldX')}</h4>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-800 dark:text-slate-200">
                  <li className="flex items-start gap-2">
                    {ownMatches.length === 0 ? (
                      <Check className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <span>
                      {ownMatches.length === 0
                        ? tx('None of your other studies uses this name.', 'لا تستخدم أي دراسة أخرى لديك هذا الاسم.')
                        : tx(
                            `Your study "${ownMatches[0].name}" uses ${ownMatches[0].kind === 'same' ? 'the same' : 'a similar'} name.`,
                            `دراستك "${ownMatches[0].name}" تستخدم اسماً ${ownMatches[0].kind === 'same' ? 'مطابقاً' : 'مشابهاً'}.`
                          )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    {registry === 'loading' ? (
                      <Loader2 className="w-4 h-4 mt-0.5 animate-spin text-slate-500 shrink-0" />
                    ) : registry === null ? (
                      <Info className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                    ) : registry.exact + registry.similar === 0 ? (
                      <Check className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <span>
                      {registry === 'loading'
                        ? tx('Checking other users’ studies…', 'جارٍ فحص دراسات المستخدمين الآخرين…')
                        : registry === null
                          ? tx(
                              'Other users’ studies could not be checked right now (you need to be signed in and online).',
                              'تعذّر فحص دراسات المستخدمين الآخرين الآن (يجب تسجيل الدخول والاتصال بالإنترنت).'
                            )
                          : registry.exact + registry.similar === 0
                            ? tx('No other YieldX user has a study with this name.', 'لا يوجد مستخدم آخر في YieldX لديه دراسة بهذا الاسم.')
                            : tx(
                                `${registry.exact} other ${registry.exact === 1 ? 'study uses' : 'studies use'} the same name and ${registry.similar} a similar one.`,
                                `${registry.exact} دراسة أخرى تستخدم الاسم نفسه و${registry.similar} اسماً مشابهاً.`
                              )}
                    </span>
                  </li>
                </ul>
                <p className={`${muted} mt-2`}>
                  {tx(
                    'This only covers studies made in YieldX, not businesses registered with the Ministry. Other users’ names are never shown.',
                    'يشمل هذا الدراسات المعدّة في YieldX فقط، وليس المنشآت المسجلة لدى الوزارة. لا تُعرض أسماء المستخدمين الآخرين.'
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* 3. Official check */}
          <Card className={cardBase}>
            <div className="flex items-start gap-3">
              <Landmark className="w-5 h-5 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className={heading}>{tx('3. Official check with the Ministry', '٣. التحقق الرسمي من الوزارة')}</h4>
                  {officialStatus !== 'not_checked' && (
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                        officialStatus === 'available' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {officialStatus === 'available' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {officialStatus === 'available' ? tx('Available', 'متاح') : tx('Taken', 'مستخدم')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {tx(
                    'Only the Ministry of Commerce, Industry and Investment Promotion can confirm whether a name is free. Check it on Invest Easy, then record the answer here.',
                    'وزارة التجارة والصناعة وترويج الاستثمار وحدها تؤكد توفر الاسم. تحقق منه في منصة استثمر بسهولة ثم سجّل النتيجة هنا.'
                  )}
                </p>
                <p className={`${muted} mt-1`}>{isAr ? TRADE_NAME_SOURCE.official.pathAr : TRADE_NAME_SOURCE.official.pathEn}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openInvestEasy}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                    {copied ? tx('Name copied, opening…', 'تم نسخ الاسم، جارٍ الفتح…') : tx('Copy name and open Invest Easy', 'انسخ الاسم وافتح استثمر بسهولة')}
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{tx('What did it say?', 'ماذا كانت النتيجة؟')}</span>
                  <input
                    type="date"
                    value={officialDate}
                    max={todayISO()}
                    onChange={e => setOfficialDate(e.target.value)}
                    aria-label={tx('Date checked', 'تاريخ التحقق')}
                    className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => recordOfficial('available')}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      officialStatus === 'available'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tx('Available', 'متاح')}
                  </button>
                  <button
                    type="button"
                    onClick={() => recordOfficial('taken')}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      officialStatus === 'taken'
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tx('Taken', 'مستخدم')}
                  </button>
                </div>

                <p className={`${muted} mt-2`}>
                  {officialStatus !== 'not_checked'
                    ? tx(
                        `Recorded: checked on Invest Easy on ${formatDate(official.date)}. This goes into your report.`,
                        `مُسجَّل: تم التحقق في استثمر بسهولة بتاريخ ${formatDate(official.date)}. ستظهر النتيجة في تقريرك.`
                      )
                    : officialFor && !officialApplies
                      ? tx(
                          `You recorded a result for "${officialFor}". The name has changed, so check the new name.`,
                          `سجّلت نتيجة للاسم "${officialFor}". تغيّر الاسم، فتحقق من الاسم الجديد.`
                        )
                      : tx('Not checked with the Ministry yet.', 'لم يتم التحقق من الوزارة بعد.')}
                </p>
              </div>
            </div>
          </Card>

          {/* Naming tips */}
          {tips.length > 0 && (
            <Card className={cardBase}>
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className={heading}>{tx('Naming tips', 'نصائح لاختيار الاسم')}</h4>
                  <ul className="mt-2 space-y-1.5 list-disc ps-5 text-sm text-slate-700 dark:text-slate-300">
                    {tips.map(t => (
                      <li key={t.id}>{isAr ? t.ar : t.en}</li>
                    ))}
                  </ul>
                  <p className={`${muted} mt-2`}>{tx('Advice only, not a legal check.', 'نصائح فقط، وليست فحصاً قانونياً.')}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export { AINameChecker as TradeNameChecker };
