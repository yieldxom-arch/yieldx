import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Download,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Save,
  Filter,
  Search,
  FileText
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { toast } from 'sonner';

interface GradebookViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GradebookView({ isOpen, onClose }: GradebookViewProps) {
  const { language } = useYieldX();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Translations
  const t = {
    title: language === 'ar' ? 'السجل الأكاديمي' : 'Gradebook',
    search: language === 'ar' ? 'بحث عن طالب...' : 'Search for student...',
    export: language === 'ar' ? 'تصدير CSV' : 'Export CSV',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    studentName: language === 'ar' ? 'اسم الطالب' : 'Student Name',
    average: language === 'ar' ? 'المعدل' : 'Average',
    noStudents: language === 'ar' ? 'لا يوجد طلاب بعد' : 'No students yet',
    noStudentsDesc: language === 'ar' ? 'سيتم عرض درجات الطلاب هنا بمجرد انضمامهم للمشاريع' : 'Student grades will appear here once they join projects',
    level: language === 'ar' ? 'المستوى' : 'Level',
  };

  // Empty array for new teachers
  const students: Array<{
    id: string;
    name: string;
    email: string;
    level0: number;
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
    level6: number;
    level7: number;
  }> = [];

  const [grades, setGrades] = useState(students);

  const getCellColor = (score: number) => {
    if (score === 0) return 'bg-slate-100 dark:bg-slate-500/10 text-slate-400 dark:text-gray-500';
    if (score >= 90) return 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400';
    if (score >= 80) return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400';
  };

  const handleSaveGrade = (studentId: string, level: string) => {
    const score = parseInt(editValue);
    const errorMsg = language === 'ar' ? 'يرجى إدخال درجة صحيحة بين 0 و 100' : 'Please enter a valid grade between 0 and 100';
    const successMsg = language === 'ar' ? 'تم حفظ الدرجة بنجاح' : 'Grade saved successfully';
    
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error(errorMsg);
      return;
    }

    setGrades(prev =>
      prev.map(s =>
        s.id === studentId ? { ...s, [level]: score } : s
      )
    );
    setEditingCell(null);
    setEditValue('');
    toast.success(successMsg);
  };

  const exportToCSV = () => {
    const headers = language === 'ar' 
      ? ['الاسم', 'المستوى 0', 'المستوى 1', 'المستوى 2', 'المستوى 3', 'المستوى 4', 'المستوى 5', 'المستوى 6', 'المستوى 7', 'المعدل']
      : ['Name', 'Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Average'];
    
    const rows = grades.map(student => {
      const avg = Math.round(
        (student.level0 + student.level1 + student.level2 + student.level3 + student.level4 + student.level5 + student.level6 + student.level7) / 8
      );
      return [
        student.name,
        student.level0 || '-',
        student.level1 || '-',
        student.level2 || '-',
        student.level3 || '-',
        student.level4 || '-',
        student.level5 || '-',
        student.level6 || '-',
        student.level7 || '-',
        avg || '-'
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gradebook.csv';
    link.click();
    
    const successMsg = language === 'ar' ? 'تم تصدير السجل الأكاديمي بنجاح' : 'Gradebook exported successfully';
    toast.success(successMsg);
  };

  const filteredGrades = grades.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-[#1B1B3A]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 text-green-600 dark:text-green-400"
            disabled={grades.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {t.export}
          </Button>
        </div>

        {filteredGrades.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <FileText className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-gray-600" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t.noStudents}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 max-w-md">
                {t.noStudentsDesc}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-sm">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    {t.studentName}
                  </th>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(level => (
                    <th key={level} className="p-4 text-center text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                      {t.level} {level}
                    </th>
                  ))}
                  <th className="p-4 text-center text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    {t.average}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((student) => {
                  const avg = Math.round(
                    (student.level0 + student.level1 + student.level2 + student.level3 + 
                     student.level4 + student.level5 + student.level6 + student.level7) / 8
                  );
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      {(['level0', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7'] as const).map((level) => (
                        <td key={level} className="p-4 border-b border-slate-200 dark:border-slate-700">
                          {editingCell === `${student.id}-${level}` ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-20 text-center"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveGrade(student.id, level);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                              />
                              <Button size="icon" variant="ghost" onClick={() => handleSaveGrade(student.id, level)}>
                                <Save className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-semibold text-sm cursor-pointer min-w-[60px] ${getCellColor(student[level])}`}
                              onClick={() => {
                                setEditingCell(`${student.id}-${level}`);
                                setEditValue(student[level].toString());
                              }}
                            >
                              {student[level] || '-'}
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-center">
                        <Badge variant="outline" className={`font-bold ${getCellColor(avg)}`}>
                          {avg}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}