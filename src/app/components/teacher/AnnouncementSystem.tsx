import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Megaphone,
  Send,
  Users,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { toast } from 'sonner';

interface AnnouncementSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementSystem({ isOpen, onClose }: AnnouncementSystemProps) {
  const { language } = useYieldX();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  // Translations
  const t = {
    title: language === 'ar' ? 'نظام الإعلانات' : 'Announcement System',
    subtitle: language === 'ar' ? 'إرسال إعلانات ورسائل للطلاب' : 'Send announcements and messages to students',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    announcementTitle: language === 'ar' ? 'عنوان الإعلان' : 'Announcement Title',
    message: language === 'ar' ? 'الرسالة' : 'Message',
    priority: language === 'ar' ? 'الأولوية' : 'Priority',
    normal: language === 'ar' ? 'عادي' : 'Normal',
    important: language === 'ar' ? 'مهم' : 'Important',
    urgent: language === 'ar' ? 'عاجل' : 'Urgent',
    send: language === 'ar' ? 'إرسال' : 'Send',
    recentAnnouncements: language === 'ar' ? 'الإعلانات الأخيرة' : 'Recent Announcements',
    noAnnouncements: language === 'ar' ? 'لا توجد إعلانات بعد' : 'No announcements yet',
    noAnnouncementsDesc: language === 'ar' ? 'استخدم النموذج أعلاه لإرسال إعلانات للطلاب' : 'Use the form above to send announcements to students',
    titlePlaceholder: language === 'ar' ? 'مثال: إعلان هام' : 'Example: Important Notice',
    messagePlaceholder: language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...',
    fillFields: language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields',
    sent: language === 'ar' ? 'تم إرسال الإعلان بنجاح' : 'Announcement sent successfully',
  };

  // Empty array for new teachers
  const announcements: Array<{
    id: string;
    title: string;
    message: string;
    priority: 'normal' | 'important' | 'urgent';
    date: string;
  }> = [];

  const [announcementsList, setAnnouncementsList] = useState(announcements);

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error(t.fillFields);
      return;
    }

    const newAnnouncement = {
      id: Date.now().toString(),
      title,
      message,
      priority,
      date: new Date().toISOString(),
    };

    setAnnouncementsList(prev => [newAnnouncement, ...prev]);
    setTitle('');
    setMessage('');
    setPriority('normal');
    toast.success(t.sent);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30';
      case 'important':
        return 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30';
      default:
        return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'important':
        return <Info className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-[#1B1B3A]" aria-describedby={undefined}>
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

        <div className="flex-1 overflow-auto space-y-6 p-6">
          {/* Announcement Form */}
          <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  {t.announcementTitle}
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  {t.message}
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  className="w-full min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  {t.priority}
                </label>
                <div className="flex gap-3">
                  {(['normal', 'important', 'urgent'] as const).map((p) => (
                    <Button
                      key={p}
                      variant="outline"
                      onClick={() => setPriority(p)}
                      className={`flex-1 ${priority === p ? getPriorityColor(p) : ''}`}
                    >
                      {p === 'normal' && t.normal}
                      {p === 'important' && t.important}
                      {p === 'urgent' && t.urgent}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSend}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {t.send}
              </Button>
            </div>
          </Card>

          {/* Recent Announcements */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t.recentAnnouncements}
            </h3>

            {announcementsList.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-gray-600" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {t.noAnnouncements}
                </h4>
                <p className="text-slate-500 dark:text-gray-400">
                  {t.noAnnouncementsDesc}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {announcementsList.map((announcement) => (
                  <Card key={announcement.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getPriorityColor(announcement.priority)}`}>
                        {getPriorityIcon(announcement.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {announcement.title}
                          </h4>
                          <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                            {announcement.priority === 'normal' && t.normal}
                            {announcement.priority === 'important' && t.important}
                            {announcement.priority === 'urgent' && t.urgent}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 text-sm mb-2">
                          {announcement.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">
                          {new Date(announcement.date).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}