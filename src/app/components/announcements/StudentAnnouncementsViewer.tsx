import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Check, Building2, Users, Briefcase, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

export function StudentAnnouncementsViewer() {
  const { announcements, markAnnouncementRead, user, language } = useYieldX();
  const [isOpen, setIsOpen] = useState(false);

  // Filter announcements visible to this student
  const visibleAnnouncements = announcements.filter((announcement) => {
    if (announcement.scope === 'university') {
      return announcement.targetId === user?.universityId;
    } else if (announcement.scope === 'class') {
      return announcement.targetId === user?.classId;
    } else if (announcement.scope === 'project') {
      return user?.projectIds?.includes(announcement.targetId ?? '');
    }
    // Also show simple announcements (targetAudience-based)
    if (announcement.targetAudience) return true;
    return false;
  });

  const unreadCount = visibleAnnouncements.filter(
    (a) => !(a.readBy ?? []).includes(user?.id || '') && !a.read
  ).length;

  // Translations
  const t = {
    announcements: language === 'ar' ? 'الإعلانات' : 'Announcements',
    new: language === 'ar' ? 'جديد' : 'new',
    markAsRead: language === 'ar' ? 'تحديد كمقروء' : 'Mark as read',
    noAnnouncements: language === 'ar' ? 'لا توجد إعلانات' : 'No announcements',
    noAnnouncementsDesc: language === 'ar' ? 'ستظهر هنا الإعلانات من المدرسين' : 'Announcements from teachers will appear here',
    university: language === 'ar' ? 'الجامعة' : 'University',
    class: language === 'ar' ? 'الصف' : 'Class',
    project: language === 'ar' ? 'المشروع' : 'Project',
    from: language === 'ar' ? 'من' : 'from',
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

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'university':
        return <Building2 className="w-4 h-4" />;
      case 'class':
        return <Users className="w-4 h-4" />;
      case 'project':
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case 'university':
        return t.university;
      case 'class':
        return t.class;
      case 'project':
        return t.project;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative bg-white/10 border-white/20 hover:bg-white/20 text-white"
        >
          <Megaphone className="w-4 h-4" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-white dark:bg-[#1B1B3A] border-purple-200 dark:border-[#4ECDC4]/50 max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white text-2xl flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#4ECDC4]" />
            {t.announcements}
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount} {t.new}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          <AnimatePresence mode="popLayout">
            {visibleAnnouncements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <Megaphone className="w-16 h-16 text-slate-400 dark:text-gray-400 mb-4" />
                <p className="text-slate-600 dark:text-gray-200 text-lg">{t.noAnnouncements}</p>
                <p className="text-slate-500 dark:text-gray-300 text-sm mt-2">{t.noAnnouncementsDesc}</p>
              </motion.div>
            ) : (
              visibleAnnouncements
                .slice()
                .reverse()
                .map((announcement) => {
                  const isRead = (announcement.readBy ?? []).includes(user?.id || '') || !!announcement.read;
                  
                  return (
                    <motion.div
                      key={announcement.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <Card
                        className={`p-4 transition-all ${
                          isRead
                            ? 'bg-slate-50 dark:bg-[#0F0F25]/50 border-slate-200 dark:border-gray-700 opacity-70'
                            : 'bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-[#4ECDC4]/10 dark:to-[#7FDBCA]/10 border-cyan-200 dark:border-[#4ECDC4]/30 shadow-lg'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${getPriorityColor(announcement.priority ?? 'normal')}`}>
                                {getPriorityIcon(announcement.priority ?? 'normal')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-slate-900 dark:text-white">{announcement.title}</h4>
                                  {!isRead && (
                                    <span className="w-2 h-2 bg-[#4ECDC4] rounded-full flex-shrink-0"></span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-gray-300">
                                  {(announcement.authorName || announcement.from) && (
                                    <span>{t.from} {announcement.authorName ?? announcement.from}</span>
                                  )}
                                  {announcement.scope && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        {getScopeIcon(announcement.scope)}
                                        <span>{getScopeLabel(announcement.scope)}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {announcement.priority && (
                              <Badge className={getPriorityColor(announcement.priority)}>
                                {announcement.priority === 'urgent' && (language === 'ar' ? 'عاجل' : 'Urgent')}
                                {announcement.priority === 'important' && (language === 'ar' ? 'مهم' : 'Important')}
                                {announcement.priority === 'normal' && (language === 'ar' ? 'عادي' : 'Normal')}
                              </Badge>
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-slate-700 dark:text-gray-300 text-sm pl-12">
                            {announcement.message ?? announcement.content}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pl-12">
                            <p className="text-teal-600 dark:text-[#7FDBCA] text-xs">
                              {new Date(announcement.timestamp).toLocaleString(
                                language === 'ar' ? 'ar-SA' : 'en-US'
                              )}
                            </p>
                            {!isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAnnouncementRead(announcement.id, user?.id || '')}
                                className="text-[#4ECDC4] hover:text-[#4ECDC4] hover:bg-[#4ECDC4]/10 h-7 px-2"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                {t.markAsRead}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}