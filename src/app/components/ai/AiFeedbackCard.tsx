import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Star, Table } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import type { AiFeedback } from '@/lib/ai';

interface AiFeedbackCardProps {
  feedback: AiFeedback | null;
  isLoading: boolean;
  language: 'ar' | 'en';
}

const labels = {
  ar: {
    title: 'تقييم الذكاء الاصطناعي',
    score: 'النتيجة',
    strengths: 'نقاط القوة',
    risks: 'المخاطر والضعف',
    suggestions: 'اقتراحات التحسين',
    projection: 'التوقعات المالية (3 سنوات)',
    year: 'السنة',
    revenue: 'الإيرادات',
    expenses: 'المصروفات',
    netProfit: 'صافي الربح',
    cumulative: 'التدفق النقدي التراكمي',
    loading: 'جارٍ تحليل إجاباتك...',
    outOf: 'من 100',
  },
  en: {
    title: 'AI Feedback',
    score: 'Score',
    strengths: 'Strengths',
    risks: 'Risks & Weaknesses',
    suggestions: 'Improvement Suggestions',
    projection: '3-Year Financial Projection',
    year: 'Year',
    revenue: 'Revenue',
    expenses: 'Expenses',
    netProfit: 'Net Profit',
    cumulative: 'Cumulative Cash Flow',
    loading: 'Analysing your answers…',
    outOf: '/ 100',
  },
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-green-400';
  if (score >= 60) return 'stroke-yellow-400';
  return 'stroke-red-400';
}

export function AiFeedbackCard({ feedback, isLoading, language }: AiFeedbackCardProps) {
  const t = labels[language] ?? labels.en;
  const isRTL = language === 'ar';

  if (!isLoading && !feedback) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Card className="p-6 border border-[#4ECDC4]/30 bg-gradient-to-br from-[#1B1B3A]/80 to-[#0F0F25]/80 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">{t.title}</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-8 text-[#4ECDC4]">
            <div className="w-5 h-5 border-2 border-[#4ECDC4]/30 border-t-[#4ECDC4] rounded-full animate-spin" />
            <span className="text-sm">{t.loading}</span>
          </div>
        ) : feedback ? (
          <div className="space-y-6">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#ffffff10" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    className={scoreRingColor(feedback.score)}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(feedback.score / 100) * 176} 176`}
                  />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${scoreColor(feedback.score)}`}>
                  {feedback.score}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">{t.score}</div>
                <div className={`text-3xl font-bold ${scoreColor(feedback.score)}`}>
                  {feedback.score} <span className="text-base font-normal text-slate-400">{t.outOf}</span>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <div className="flex items-center gap-2 text-green-400 font-semibold text-sm mb-3">
                <TrendingUp className="w-4 h-4" />
                {t.strengths}
              </div>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Star className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div>
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-3">
                <AlertTriangle className="w-4 h-4" />
                {t.risks}
              </div>
              <ul className="space-y-2">
                {feedback.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400 font-bold text-xs flex items-center justify-center">!</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div>
              <div className="flex items-center gap-2 text-[#4ECDC4] font-semibold text-sm mb-3">
                <Lightbulb className="w-4 h-4" />
                {t.suggestions}
              </div>
              <ul className="space-y-2">
                {feedback.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-[#4ECDC4]/20 text-[#4ECDC4] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial Projection (Level 6 only) */}
            {feedback.financialProjection && feedback.financialProjection.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-[#4ECDC4] font-semibold text-sm mb-3">
                  <Table className="w-4 h-4" />
                  {t.projection}
                </div>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-slate-400">
                        <th className="px-3 py-2 text-start font-medium">{t.year}</th>
                        <th className="px-3 py-2 text-start font-medium">{t.revenue}</th>
                        <th className="px-3 py-2 text-start font-medium">{t.expenses}</th>
                        <th className="px-3 py-2 text-start font-medium">{t.netProfit}</th>
                        <th className="px-3 py-2 text-start font-medium">{t.cumulative}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.financialProjection.map((row, i) => (
                        <tr key={i} className="border-t border-white/5 text-slate-300 hover:bg-white/5">
                          <td className="px-3 py-2 font-medium text-[#4ECDC4]">{row.year}</td>
                          <td className="px-3 py-2">{row.revenue}</td>
                          <td className="px-3 py-2">{row.expenses}</td>
                          <td className={`px-3 py-2 font-semibold ${row.netProfit.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>{row.netProfit}</td>
                          <td className="px-3 py-2">{row.cumulativeCashFlow}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
