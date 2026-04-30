import React from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Share2, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';

export function CompletionReport() {
  const { user, levels, moduleData, totalXP } = useYieldX();

  const completedLevels = levels.filter((l) => l.completed).length;
  const completionPercentage = (completedLevels / levels.length) * 100;

  const generatePDFPreview = () => {
    // This would generate actual PDF in production
    alert('سيتم تحميل تقرير PDF الكامل قريباً!');
  };

  const shareReport = () => {
    alert('سيتم إضافة خاصية المشاركة قريباً!');
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
          <h2 className="text-4xl font-bold text-white mb-2">
            تهانينا على إنجازك!
          </h2>
          <p className="text-purple-200 text-lg">
            لقد أكملت {completedLevels} من {levels.length} مستوى
          </p>
          <div className="mt-4 inline-block bg-white/10 px-6 py-3 rounded-full">
            <p className="text-white text-2xl font-bold">{totalXP} XP</p>
          </div>
        </div>
      </Card>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm">نسبة الإنجاز</p>
              <p className="text-2xl font-bold text-white">{Math.round(completionPercentage)}%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm">الأقسام المكتملة</p>
              <p className="text-2xl font-bold text-white">{completedLevels}/{levels.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm">إجمالي النقاط</p>
              <p className="text-2xl font-bold text-white">{totalXP}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Module Details */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-6">
        <h3 className="text-white text-xl font-bold mb-4">ملخص الأقسام</h3>
        <div className="space-y-4">
          {levels.map((level) => (
            <div key={level.levelId}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      level.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {level.completed ? '✓' : level.levelId}
                  </div>
                  <p className="text-white">{level.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-300 text-sm">
                    {level.xp} / {level.maxXp} XP
                  </p>
                </div>
              </div>
              {level.levelId < levels.length && (
                <Separator className="bg-white/10 mt-2" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={generatePDFPreview}
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          تحميل التقرير الكامل (PDF)
        </Button>
        
        <Button
          onClick={shareReport}
          variant="outline"
          className="bg-white/10 border-white/20 hover:bg-white/20"
          size="lg"
        >
          <Share2 className="w-5 h-5 mr-2" />
          مشاركة
        </Button>
      </div>

      {/* Key Insights */}
      {completionPercentage === 100 && (
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 p-6">
          <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            إنجاز متميز!
          </h3>
          <div className="space-y-2 text-green-100">
            <p>✨ لقد أكملت جميع مراحل دراسة الجدوى بنجاح</p>
            <p>📊 حصلت على {totalXP} نقطة خبرة</p>
            <p>🎯 يمكنك الآن تحميل التقرير الشامل لمشروعك</p>
            <p>🚀 جاهز لبدء مشروعك الريادي!</p>
          </div>
        </Card>
      )}

      {/* Company Info Preview */}
      {moduleData['module-1'] && (
        <Card className="bg-white/5 border-white/10 p-6">
          <h3 className="text-white text-lg font-bold mb-4">معلومات المشروع</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-purple-300 text-sm">اسم الشركة</p>
              <p className="text-white font-semibold">
                {moduleData['module-1'].companyName || 'غير محدد'}
              </p>
            </div>
            <div>
              <p className="text-purple-300 text-sm">رأس المال</p>
              <p className="text-white font-semibold">
                {moduleData['module-1'].totalCapital
                  ? `${Number(moduleData['module-1'].totalCapital).toLocaleString()} ريال`
                  : 'غير محدد'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
