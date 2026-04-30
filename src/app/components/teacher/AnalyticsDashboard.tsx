import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Award,
  Clock,
  BarChart3,
  Target,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { useYieldX } from '@/app/contexts/YieldXContext';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsDashboard({ isOpen, onClose }: AnalyticsDashboardProps) {
  const { language } = useYieldX();

  // Translations
  const t = {
    title: language === 'ar' ? 'لوحة التحليلات المتقدمة' : 'Advanced Analytics Dashboard',
    subtitle: language === 'ar' ? 'رؤى شاملة حول أداء الطلاب واتجاهات التعلم' : 'Comprehensive insights on student performance and learning trends',
    noData: language === 'ar' ? 'لا توجد بيانات تحليلية بعد' : 'No analytics data yet',
    noDataDesc: language === 'ar' ? 'ستظهر التحليلات والإحصائيات هنا بمجرد بدء الطلاب في إكمال المستويات' : 'Analytics and statistics will appear here once students start completing levels',
    close: language === 'ar' ? 'إغلاق' : 'Close',
  };

  // Empty arrays for new teachers
  const levelComparison: Array<any> = [];
  const atRiskStudents: Array<any> = [];
  const trendData: Array<any> = [];
  const timeAnalytics: Array<any> = [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-7xl max-h-[90vh] overflow-hidden bg-white dark:bg-[#1B1B3A] border-purple-200 dark:border-[#4ECDC4]/30 p-0"
        aria-describedby={undefined}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-bold text-white mb-1">
                  📈 {t.title}
                </DialogTitle>
                <p className="text-white/80 text-sm">
                  {t.subtitle}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {levelComparison.length === 0 && atRiskStudents.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <BarChart3 className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-gray-600" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t.noData}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 max-w-md">
                  {t.noDataDesc}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Future analytics content will go here */}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
