import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Share2, CheckCircle, Award, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { generateFeasibilityReport } from '@/lib/ai';
import jsPDF from 'jspdf';

export function CompletionReport() {
  const { user, levels, moduleData, totalXP, language, theme } = useYieldX();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const completedLevels = levels.filter((l) => l.completed).length;
  const completionPercentage = (completedLevels / levels.length) * 100;

  // This panel renders inside a dialog that now switches between light/dark —
  // its own "glass on dark" styling must follow suit instead of staying white-text-only.
  const cardBg = isDark ? 'bg-white/10 border-white/20' : 'bg-slate-900/5 border-slate-900/10';
  const cardBgFaint = isDark ? 'bg-white/5 border-white/10' : 'bg-slate-900/5 border-slate-900/10';
  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const mutedText = isDark ? 'text-purple-200' : 'text-purple-700';
  const mutedTextAlt = isDark ? 'text-purple-300' : 'text-purple-600';

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const text = await generateFeasibilityReport(moduleData, language as 'ar' | 'en');
      setReportText(text);
    } catch (err) {
      console.error('Report generation failed', err);
      setReportText(language === 'ar'
        ? 'فشل إنشاء التقرير. تأكد من إعداد مفتاح VITE_ANTHROPIC_API_KEY.'
        : 'Report generation failed. Make sure VITE_ANTHROPIC_API_KEY is set.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportText) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    doc.setFontSize(16);
    doc.text(language === 'ar' ? 'دراسة الجدوى — YieldX' : 'Feasibility Study — YieldX', margin, 20);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(reportText, maxWidth);
    let y = 30;
    lines.forEach((line: string) => {
      if (y > 280) { doc.addPage(); y = 15; }
      doc.text(line, margin, y);
      y += 6;
    });
    doc.save('YieldX_Feasibility_Study.pdf');
  };

  const shareReport = () => {
    if (navigator.share && reportText) {
      navigator.share({ title: 'YieldX Feasibility Study', text: reportText.slice(0, 300) }).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm p-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <Award className="w-24 h-24 mx-auto text-yellow-400 mb-4" />
          </motion.div>
          <h2 className={`text-4xl font-bold mb-2 ${titleText}`}>
            تهانينا على إنجازك!
          </h2>
          <p className={`text-lg ${mutedText}`}>
            لقد أكملت {completedLevels} من {levels.length} مستوى
          </p>
          <div className={`mt-4 inline-block px-6 py-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-900/10'}`}>
            <p className={`text-2xl font-bold ${titleText}`}>{totalXP} XP</p>
          </div>
        </div>
      </Card>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`backdrop-blur-sm p-6 ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className={`text-sm ${titleText}`}>نسبة الإنجاز</p>
              <p className={`text-2xl font-bold ${titleText}`}>{Math.round(completionPercentage)}%</p>
            </div>
          </div>
        </Card>

        <Card className={`backdrop-blur-sm p-6 ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className={`text-sm ${titleText}`}>الأقسام المكتملة</p>
              <p className={`text-2xl font-bold ${titleText}`}>{completedLevels}/{levels.length}</p>
            </div>
          </div>
        </Card>

        <Card className={`backdrop-blur-sm p-6 ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className={`text-sm ${titleText}`}>إجمالي النقاط</p>
              <p className={`text-2xl font-bold ${titleText}`}>{totalXP}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Module Details */}
      <Card className={`backdrop-blur-sm p-6 ${cardBg}`}>
        <h3 className={`text-xl font-bold mb-4 ${titleText}`}>ملخص الأقسام</h3>
        <div className="space-y-4">
          {levels.map((level) => (
            <div key={level.levelId}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      level.completed
                        ? 'bg-green-500 text-white'
                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {level.completed ? '✓' : level.levelId}
                  </div>
                  <p className={titleText}>{level.title}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${mutedTextAlt}`}>
                    {level.xp} / {level.maxXp} XP
                  </p>
                </div>
              </div>
              {level.levelId < levels.length && (
                <Separator className={`mt-2 ${isDark ? 'bg-white/10' : 'bg-slate-900/10'}`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-[#4ECDC4] to-teal-600 hover:opacity-90 text-white"
          size="lg"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
          {language === 'ar' ? 'إنشاء دراسة الجدوى بالذكاء الاصطناعي' : 'Generate AI Feasibility Study'}
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={!reportText}
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
        </Button>

        <Button
          onClick={shareReport}
          variant="outline"
          className={isDark ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-slate-900/5 border-slate-900/10 hover:bg-slate-900/10 text-slate-900'}
          size="lg"
        >
          <Share2 className="w-5 h-5 mr-2" />
          مشاركة
        </Button>
      </div>

      {/* Key Insights */}
      {completionPercentage === 100 && (
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 p-6">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${titleText}`}>
            <Award className="w-6 h-6 text-yellow-400" />
            إنجاز متميز!
          </h3>
          <div className={`space-y-2 ${isDark ? 'text-green-100' : 'text-green-800'}`}>
            <p>✨ لقد أكملت جميع مراحل دراسة الجدوى بنجاح</p>
            <p>📊 حصلت على {totalXP} نقطة خبرة</p>
            <p>🎯 يمكنك الآن تحميل التقرير الشامل لمشروعك</p>
            <p>🚀 جاهز لبدء مشروعك الريادي!</p>
          </div>
        </Card>
      )}

      {/* Company Info Preview */}
      {moduleData['module-1'] && (
        <Card className={`p-6 ${cardBgFaint}`}>
          <h3 className={`text-lg font-bold mb-4 ${titleText}`}>معلومات المشروع</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${mutedTextAlt}`}>اسم الشركة</p>
              <p className={`font-semibold ${titleText}`}>
                {moduleData['module-1'].companyName || 'غير محدد'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${mutedTextAlt}`}>رأس المال</p>
              <p className={`font-semibold ${titleText}`}>
                {moduleData['module-1'].totalCapital
                  ? `${Number(moduleData['module-1'].totalCapital).toLocaleString()} ريال`
                  : 'غير محدد'}
              </p>
            </div>
          </div>
        </Card>
      )}
      {/* AI-Generated Feasibility Study Report */}
      {reportText && (
        <Card className={`p-6 border-[#4ECDC4]/30 ${isDark ? 'bg-white/5' : 'bg-slate-900/5'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${titleText}`}>
            <Sparkles className="w-5 h-5 text-[#4ECDC4]" />
            {language === 'ar' ? 'دراسة الجدوى المُولَّدة بالذكاء الاصطناعي' : 'AI-Generated Feasibility Study'}
          </h3>
          <pre className={`text-sm whitespace-pre-wrap leading-relaxed font-sans ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{reportText}</pre>
        </Card>
      )}
    </div>
  );
}
