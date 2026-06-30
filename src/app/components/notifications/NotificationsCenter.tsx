import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, Award, Trophy, Calendar, MessageSquare, Zap, Flame } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

export function NotificationsCenter() {
  const { notifications, markNotificationRead, clearAllNotifications, unreadCount, language, theme } = useYieldX();
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';

  // Translations
  const t = {
    notifications: language === 'ar' ? 'الإشعارات' : 'Notifications',
    new: language === 'ar' ? 'جديد' : 'new',
    deleteAll: language === 'ar' ? 'حذف الكل' : 'Delete All',
    noNotifications: language === 'ar' ? 'لا توجد إشعارات' : 'No notifications',
    noNotificationsDesc: language === 'ar' ? 'ستظهر هنا جميع التحديثات والإنجازات' : 'All updates and achievements will appear here',
    markAsRead: language === 'ar' ? 'تحديد كمقروء' : 'Mark as read',
    now: language === 'ar' ? 'الآن' : 'now',
    minutesAgo: language === 'ar' ? 'منذ' : 'ago',
    minutes: language === 'ar' ? 'دقيقة' : 'minutes',
    minute: language === 'ar' ? 'دقيقة' : 'minute',
    hoursAgo: language === 'ar' ? 'منذ' : 'ago',
    hours: language === 'ar' ? 'ساعة' : 'hours',
    hour: language === 'ar' ? 'ساعة' : 'hour',
    daysAgo: language === 'ar' ? 'منذ' : 'ago',
    days: language === 'ar' ? 'يوم' : 'days',
    day: language === 'ar' ? 'يوم' : 'day',
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'badge':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'deadline':
        return <Calendar className="w-5 h-5 text-red-500" />;
      case 'feedback':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'peer-review':
        return <Zap className="w-5 h-5 text-cyan-500" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.now;
    
    if (language === 'ar') {
      if (minutes < 60) return `${t.minutesAgo} ${minutes} ${t.minute}`;
      if (hours < 24) return `${t.hoursAgo} ${hours} ${t.hour}`;
      return `${t.daysAgo} ${days} ${t.day}`;
    } else {
      if (minutes < 60) return `${minutes} ${minutes === 1 ? t.minute : t.minutes} ${t.minutesAgo}`;
      if (hours < 24) return `${hours} ${hours === 1 ? t.hour : t.hours} ${t.hoursAgo}`;
      return `${days} ${days === 1 ? t.day : t.days} ${t.daysAgo}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={isDark
            ? 'relative bg-white/10 border-white/20 hover:bg-white/20 text-white'
            : 'relative bg-slate-900/5 border-slate-900/10 hover:bg-slate-900/10 text-slate-700'}
        >
          <Bell className="w-4 h-4" />
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
        className={`border-[#4ECDC4]/50 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col ${isDark ? 'bg-[#1B1B3A]' : 'bg-white'}`}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={`text-2xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Bell className="w-6 h-6 text-[#4ECDC4]" />
              {t.notifications}
              {unreadCount > 0 && (
                <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount} {t.new}
                </span>
              )}
            </DialogTitle>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t.deleteAll}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Bell className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-600' : 'text-slate-300'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t.noNotifications}</p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{t.noNotificationsDesc}</p>
              </motion.div>
            ) : (
              notifications
                .slice()
                .reverse()
                .map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all ${
                        notification.read
                          ? isDark
                            ? 'bg-[#0F0F25]/50 border-gray-700 opacity-70'
                            : 'bg-slate-900/5 border-slate-200 opacity-70'
                          : 'bg-gradient-to-r from-[#4ECDC4]/10 to-[#7FDBCA]/10 border-[#4ECDC4]/30 shadow-lg shadow-[#4ECDC4]/10'
                      } hover:border-[#4ECDC4]/50`}
                      onClick={() => !notification.read && markNotificationRead(notification.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {language === 'ar' ? notification.titleAr : notification.titleEn}
                            </h4>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-[#4ECDC4] rounded-full mt-1.5"></span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                            {language === 'ar' ? notification.messageAr : notification.messageEn}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[#0d9488] dark:text-[#7FDBCA] text-xs">{formatTimestamp(notification.timestamp)}</p>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationRead(notification.id);
                                }}
                                className="text-[#4ECDC4] hover:text-[#4ECDC4] hover:bg-[#4ECDC4]/10 h-6 px-2"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                {t.markAsRead}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
