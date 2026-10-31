// The YieldX Advisor: one AI advisor for the whole study.
// Replaces the three separate advisors (Atlas, Nova, Orion) and the separate
// chatbot. It reviews the study and answers questions about it.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Lightbulb, Loader2, RefreshCw, Send, Sparkles, Info, X } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { AdvisorError, askAdvisor, getAdvisorInsights, type AdvisorArea, type AdvisorChatTurn, type AdvisorInsight } from '@/lib/advisor';

interface CopilotBridgeProps {
  language: 'en' | 'ar';
  onMessageRead?: (messageId: string) => void;
  onActionTaken?: (messageId: string, actionId: string) => void;
}

const C = {
  palm: '#174D3B',
  falaj: '#239C91',
  falajDark: '#16645d',
  sand: '#D7B889',
  terracotta: '#A76542',
  limestone: '#F4F0E7',
  charcoal: '#252C2A',
  gold: '#C9A227',
};

const AREA_LABEL: Record<AdvisorArea, { en: string; ar: string; color: string }> = {
  finance: { en: 'Finance', ar: 'المالية', color: '#239C91' },
  market: { en: 'Market', ar: 'السوق', color: '#A76542' },
  legal: { en: 'Legal', ar: 'القانونية', color: '#5b6bb5' },
  operations: { en: 'Operations', ar: 'التشغيل', color: '#8a6a2b' },
  people: { en: 'People', ar: 'الموارد البشرية', color: '#7a3f6b' },
  strategy: { en: 'Strategy', ar: 'الاستراتيجية', color: '#174D3B' },
};

const STORAGE = 'yieldx_advisor';

export function CopilotBridge({ language }: CopilotBridgeProps) {
  const { moduleData, projectTypeData, financialKPIs, activeSavedProjectId, user } = useYieldX();
  const isAr = language === 'ar';
  const tx = (en: string, ar: string) => (isAr ? ar : en);
  const heading = isAr ? { fontFamily: '"Noto Kufi Arabic", system-ui, sans-serif' } : undefined;

  const [open, setOpen] = useState(false);
  const [insights, setInsights] = useState<AdvisorInsight[]>([]);
  const [reviewedKey, setReviewedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<AdvisorChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const lastRun = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const context = useMemo(() => ({ projectTypeData, moduleData, financialKPIs }), [projectTypeData, moduleData, financialKPIs]);
  const studyKey = useMemo(() => {
    try {
      return JSON.stringify(context).length + ':' + JSON.stringify(context).slice(0, 4000);
    } catch {
      return String(Date.now());
    }
  }, [context]);
  const hasStudy = Boolean(projectTypeData || Object.keys(moduleData || {}).some(k => /^level[0-7]$/.test(k)));
  const storeKey = `${STORAGE}:${activeSavedProjectId || 'default'}:${language}`;

  // Remember the last review per study and language.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
      if (saved?.insights) {
        setInsights(saved.insights);
        setReviewedKey(saved.key || '');
      } else {
        setInsights([]);
        setReviewedKey('');
      }
    } catch {
      /* ignore */
    }
    setChat([]);
  }, [storeKey]);

  const explain = (e: unknown) => {
    const kind = e instanceof AdvisorError ? e.kind : 'unavailable';
    return kind === 'auth'
      ? tx('Please sign in to use the advisor.', 'يرجى تسجيل الدخول لاستخدام المستشار.')
      : kind === 'rate'
        ? tx('Too many requests. Please wait a moment and try again.', 'طلبات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.')
        : kind === 'network'
          ? tx('No internet connection. Please check your connection.', 'لا يوجد اتصال بالإنترنت. تحقق من الاتصال.')
          : tx('The advisor is not available right now. Please try again later.', 'المستشار غير متاح الآن. حاول مرة أخرى لاحقاً.');
  };

  const review = async (force = false) => {
    if (!hasStudy) return;
    if (!force && reviewedKey === studyKey && insights.length) return;
    if (Date.now() - lastRun.current < 8000) return;
    lastRun.current = Date.now();
    setLoading(true);
    setError(null);
    try {
      const list = await getAdvisorInsights(context, language);
      setInsights(list);
      setReviewedKey(studyKey);
      try {
        localStorage.setItem(storeKey, JSON.stringify({ insights: list, key: studyKey }));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(explain(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void review();
  }, [open]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('yieldx:open-copilot-bridge', onOpen);
    window.addEventListener('yieldx:open-advisor', onOpen);
    return () => {
      window.removeEventListener('yieldx:open-copilot-bridge', onOpen);
      window.removeEventListener('yieldx:open-advisor', onOpen);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat, sending]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || sending) return;
    setInput('');
    const history = chat;
    setChat([...history, { role: 'user', content: q }]);
    setSending(true);
    try {
      const answer = await askAdvisor(history, q, context, language);
      setChat(h => [...h, { role: 'assistant', content: answer || tx('I could not find an answer. Please rephrase.', 'لم أجد إجابة. أعد صياغة السؤال من فضلك.') }]);
    } catch (e) {
      setChat(h => [...h, { role: 'assistant', content: explain(e) }]);
    } finally {
      setSending(false);
    }
  };

  const suggestions = isAr
    ? ['ما أكبر خطر في مشروعي؟', 'هل سعري مناسب؟', 'كيف أرفع نسبة التعمين؟', 'ما الذي ينقص دراستي؟']
    : ['What is the biggest risk in my project?', 'Is my price right?', 'How can I raise my Omanization rate?', 'What is missing from my study?'];

  const typeIcon = (t: AdvisorInsight['type']) =>
    t === 'warning' ? (
      <AlertTriangle className="w-4 h-4" style={{ color: '#c2410c' }} />
    ) : t === 'celebration' ? (
      <CheckCircle2 className="w-4 h-4" style={{ color: C.falaj }} />
    ) : t === 'suggestion' ? (
      <Lightbulb className="w-4 h-4" style={{ color: C.gold }} />
    ) : (
      <Info className="w-4 h-4" style={{ color: C.falajDark }} />
    );

  const fresh = insights.length > 0 && reviewedKey !== studyKey;

  return (
    <>
      <motion.button
        className="fixed bottom-6 start-6 z-50 h-14 ps-4 pe-5 rounded-full shadow-2xl flex items-center gap-2 text-white font-semibold"
        style={{ background: `linear-gradient(135deg, ${C.falaj}, ${C.palm})`, border: `1px solid ${C.gold}` }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        aria-label={tx('YieldX Advisor', 'مستشار YieldX')}
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline" style={heading}>
          {tx('Advisor', 'المستشار')}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              dir={isAr ? 'rtl' : 'ltr'}
              className="relative w-full max-w-5xl h-[86vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ background: C.limestone, color: C.charcoal, border: `1px solid ${C.sand}` }}
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.palm}, ${C.falaj}, ${C.gold}, ${C.terracotta})` }} />
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(215,184,137,.6)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full grid place-items-center text-white" style={{ background: `linear-gradient(135deg, ${C.falaj}, ${C.palm})` }}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold" style={heading}>
                      {tx('YieldX Advisor', 'مستشار YieldX')}
                    </h2>
                    <p className="text-xs opacity-75">
                      {tx('One advisor for your whole study: finance, market, legal, operations and people.', 'مستشار واحد لدراستك كاملة: المالية والسوق والقانون والتشغيل والموارد البشرية.')}
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full grid place-items-center hover:bg-black/5" aria-label={tx('Close', 'إغلاق')}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2">
                {/* Review */}
                <div className="min-h-0 flex flex-col border-b md:border-b-0 md:border-e" style={{ borderColor: 'rgba(215,184,137,.6)' }}>
                  <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <h3 className="font-bold" style={heading}>
                      {tx('Review of your study', 'مراجعة دراستك')}
                    </h3>
                    <button
                      onClick={() => review(true)}
                      disabled={loading || !hasStudy}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 disabled:opacity-50"
                      style={{ background: 'rgba(35,156,145,.12)', color: C.falajDark }}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      {insights.length ? tx('Review again', 'راجع مرة أخرى') : tx('Review', 'راجع')}
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 space-y-2.5">
                    {!hasStudy && (
                      <p className="text-sm opacity-80 rounded-xl p-3" style={{ background: 'rgba(37,44,42,.05)' }}>
                        {tx('Start your study (Level 0) and the advisor will review it here.', 'ابدأ دراستك (المستوى 0) وسيراجعها المستشار هنا.')}
                      </p>
                    )}
                    {fresh && !loading && (
                      <p className="text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(201,162,39,.14)', color: '#6b520b' }}>
                        {tx('Your study changed since this review. Press "Review again" to update it.', 'تغيّرت دراستك منذ هذه المراجعة. اضغط "راجع مرة أخرى" لتحديثها.')}
                      </p>
                    )}
                    {error && (
                      <p className="text-sm rounded-xl p-3" style={{ background: 'rgba(194,65,12,.08)', color: '#9a3412' }}>
                        {error}
                      </p>
                    )}
                    {loading && (
                      <div className="flex items-center gap-2 text-sm opacity-80 p-3">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {tx('Reading your study…', 'جارٍ قراءة دراستك…')}
                      </div>
                    )}
                    {insights.map(ins => (
                      <motion.div
                        key={ins.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-3 bg-white/70 border"
                        style={{ borderColor: ins.priority === 'high' ? 'rgba(194,65,12,.35)' : 'rgba(215,184,137,.7)' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {typeIcon(ins.type)}
                          <span className="text-[11px] font-bold rounded-full px-2 py-0.5 text-white" style={{ background: AREA_LABEL[ins.area].color }}>
                            {isAr ? AREA_LABEL[ins.area].ar : AREA_LABEL[ins.area].en}
                          </span>
                          {ins.priority === 'high' && (
                            <span className="text-[11px] font-bold" style={{ color: '#c2410c' }}>
                              {tx('Important', 'مهم')}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-sm">{ins.title}</div>
                        <p className="text-sm opacity-85 mt-0.5 leading-relaxed">{ins.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Chat */}
                <div className="min-h-0 flex flex-col">
                  <div className="px-5 pt-4 pb-2">
                    <h3 className="font-bold" style={heading}>
                      {tx('Ask the advisor', 'اسأل المستشار')}
                    </h3>
                  </div>
                  <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-5 space-y-2.5">
                    {chat.length === 0 && (
                      <div className="text-sm opacity-80">
                        <p>{tx(`Hello${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! Ask me anything about your study.`, `مرحباً${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! اسألني أي شيء عن دراستك.`)}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {suggestions.map(s => (
                            <button
                              key={s}
                              onClick={() => send(s)}
                              className="text-xs rounded-full px-3 py-1.5 border hover:bg-white"
                              style={{ borderColor: C.sand }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {chat.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed"
                          style={
                            m.role === 'user'
                              ? { background: C.falaj, color: 'white' }
                              : { background: 'white', border: `1px solid rgba(215,184,137,.7)` }
                          }
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {tx('Thinking…', 'يفكر…')}
                      </div>
                    )}
                  </div>
                  <form
                    className="p-4 flex items-center gap-2"
                    onSubmit={e => {
                      e.preventDefault();
                      void send();
                    }}
                  >
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder={tx('Type your question…', 'اكتب سؤالك…')}
                      className="flex-1 rounded-xl px-3.5 py-2.5 text-sm bg-white border outline-none focus:ring-2"
                      style={{ borderColor: C.sand }}
                      maxLength={2000}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="h-10 w-10 rounded-xl grid place-items-center text-white disabled:opacity-50"
                      style={{ background: C.falaj }}
                      aria-label={tx('Send', 'إرسال')}
                    >
                      <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </form>
                  <p className="px-5 pb-3 -mt-2 text-[11px] opacity-60">
                    {tx('The advisor only uses the numbers in your study and can make mistakes. Check important decisions.', 'يستخدم المستشار أرقام دراستك فقط وقد يخطئ. تحقق من القرارات المهمة.')}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
