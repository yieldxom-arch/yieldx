import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { LevelPreview } from './LevelPreview';

interface LevelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: {
    id: number;
    title: string;
    subtitle: string;
    icon: string;
    studentsCompleted: number;
    studentsInProgress: number;
    averageScore: number;
    pendingSubmissions: number;
    totalStudents: number;
    color: string;
  } | null;
}

export function LevelDetailModal({ isOpen, onClose, level }: LevelDetailModalProps) {
  const { language } = useYieldX();
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Translations
  const t = {
    close: language === 'ar' ? 'إغلاق' : 'Close',
    details: language === 'ar' ? 'تفاصيل' : 'Details',
    students: language === 'ar' ? 'الطلاب' : 'Students',
    completed: language === 'ar' ? 'مكتمل' : 'Completed',
    inProgress: language === 'ar' ? 'قيد العمل' : 'In Progress',
    pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
    averageScore: language === 'ar' ? 'متوسط الدرجة' : 'Average Score',
    noStudents: language === 'ar' ? 'لا يوجد طلاب في هذا المستوى بعد' : 'No students in this level yet',
    noStudentsDesc: language === 'ar' ? 'ستظهر معلومات الطلاب والتسليمات هنا بمجرد بدء العمل على هذا المستوى' : 'Student information and submissions will appear here once work begins on this level',
    previewLevel: language === 'ar' ? 'معاينة المستوى' : 'Preview Level',
    viewStudentView: language === 'ar' ? 'عرض ما يراه الطالب' : 'View Student View',
  };

  if (!level) return null;

  // Empty array for new teachers
  const students: Array<any> = [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-[#1B1B3A]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg`}>
              <span className="text-2xl">{level.icon}</span>
            </div>
            <div>
              <div>{level.title} - {t.details}</div>
              <p className="text-sm font-normal text-slate-600 dark:text-gray-400">
                {level.subtitle}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {level.studentsCompleted}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400">{t.completed}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {level.studentsInProgress}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400">{t.inProgress}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {level.pendingSubmissions}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400">{t.pending}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {level.averageScore}%
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400">{t.averageScore}</p>
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-auto p-6">
          {students.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <User className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-gray-600" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t.noStudents}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 max-w-md">
                  {t.noStudentsDesc}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Future student list will go here */}
            </div>
          )}
        </div>

        {/* Preview Level Button */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300 dark:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t.previewLevel}
          </Button>
        </div>
      </DialogContent>

      {/* Level Preview Modal */}
      <LevelPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        levelNumber={level.id}
      />
    </Dialog>
  );
}