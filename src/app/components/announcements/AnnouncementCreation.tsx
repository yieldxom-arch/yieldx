import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Send, Users, Building2, Briefcase, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { toast } from 'sonner';

interface AnnouncementCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementCreation({ isOpen, onClose }: AnnouncementCreationProps) {
  const { user, language, createAnnouncement, cohorts } = useYieldX();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scope, setScope] = useState<'university' | 'class' | 'project'>('class');
  const [targetId, setTargetId] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  // Translations
  const t = {
    title: language === 'ar' ? 'إنشاء إعلان' : 'Create Announcement',
    subtitle: language === 'ar' ? 'إرسال إعلان للطلاب' : 'Send announcement to students',
    announcementTitle: language === 'ar' ? 'عنوان الإعلان' : 'Announcement Title',
    message: language === 'ar' ? 'الرسالة' : 'Message',
    scope: language === 'ar' ? 'نطاق الإعلان' : 'Announcement Scope',
    university: language === 'ar' ? 'الجامعة' : 'University',
    class: language === 'ar' ? 'الصف' : 'Class',
    project: language === 'ar' ? 'المشروع' : 'Project',
    selectTarget: language === 'ar' ? 'اختر الهدف' : 'Select Target',
    priority: language === 'ar' ? 'الأولوية' : 'Priority',
    normal: language === 'ar' ? 'عادي' : 'Normal',
    important: language === 'ar' ? 'مهم' : 'Important',
    urgent: language === 'ar' ? 'عاجل' : 'Urgent',
    send: language === 'ar' ? 'إرسال' : 'Send',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    fillAllFields: language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields',
    sent: language === 'ar' ? 'تم إرسال الإعلان بنجاح' : 'Announcement sent successfully',
    universityWide: language === 'ar' ? 'سيرى جميع مستخدمي الجامعة هذا الإعلان' : 'All university users will see this announcement',
    classWide: language === 'ar' ? 'سيرى طلاب الصف المحدد هذا الإعلان' : 'Students in the selected class will see this announcement',
    projectWide: language === 'ar' ? 'سيرى طلاب المشروع المحدد هذا الإعلان' : 'Students in the selected project will see this announcement',
    titlePlaceholder: language === 'ar' ? 'مثال: إعلان هام' : 'Example: Important Notice',
    messagePlaceholder: language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...',
  };

  const handleSend = () => {
    if (!title.trim() || !message.trim() || (scope !== 'university' && !targetId)) {
      toast.error(t.fillAllFields);
      return;
    }

    createAnnouncement({
      title,
      message,
      scope,
      targetId: scope === 'university' ? user?.universityId || '' : targetId,
      priority,
    });

    toast.success(t.sent);
    setTitle('');
    setMessage('');
    setTargetId('');
    setPriority('normal');
    onClose();
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30';
      case 'important':
        return 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30';
      default:
        return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
    }
  };

  const getScopeIcon = () => {
    switch (scope) {
      case 'university':
        return <Building2 className="w-4 h-4" />;
      case 'class':
        return <Users className="w-4 h-4" />;
      case 'project':
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getScopeDescription = () => {
    switch (scope) {
      case 'university':
        return t.universityWide;
      case 'class':
        return t.classWide;
      case 'project':
        return t.projectWide;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#1B1B3A]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            {t.title}
          </DialogTitle>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">
            {t.subtitle}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Announcement Title */}
          <div>
            <Label className="text-slate-900 dark:text-white">{t.announcementTitle}</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="mt-2"
            />
          </div>

          {/* Message */}
          <div>
            <Label className="text-slate-900 dark:text-white">{t.message}</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              className="mt-2 min-h-[120px]"
            />
          </div>

          {/* Scope Selection */}
          <div>
            <Label className="text-slate-900 dark:text-white">{t.scope}</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                type="button"
                variant={scope === 'university' ? 'default' : 'outline'}
                onClick={() => {
                  setScope('university');
                  setTargetId('');
                }}
                className="w-full"
              >
                <Building2 className="w-4 h-4 mr-2" />
                {t.university}
              </Button>
              <Button
                type="button"
                variant={scope === 'class' ? 'default' : 'outline'}
                onClick={() => {
                  setScope('class');
                  setTargetId('');
                }}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                {t.class}
              </Button>
              <Button
                type="button"
                variant={scope === 'project' ? 'default' : 'outline'}
                onClick={() => {
                  setScope('project');
                  setTargetId('');
                }}
                className="w-full"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                {t.project}
              </Button>
            </div>
          </div>

          {/* Scope Description */}
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {getScopeDescription()}
              </p>
            </div>
          </div>

          {/* Target Selection (for class/project) */}
          {scope !== 'university' && (
            <div>
              <Label className="text-slate-900 dark:text-white">
                {t.selectTarget}
              </Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t.selectTarget} />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Priority */}
          <div>
            <Label className="text-slate-900 dark:text-white">{t.priority}</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(['normal', 'important', 'urgent'] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant="outline"
                  onClick={() => setPriority(p)}
                  className={`${priority === p ? getPriorityColor(p) : ''}`}
                >
                  {p === 'normal' && t.normal}
                  {p === 'important' && t.important}
                  {p === 'urgent' && t.urgent}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button
              onClick={handleSend}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {t.send}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
