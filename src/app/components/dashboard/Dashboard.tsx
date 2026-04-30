import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Trophy, Star, LogOut, QrCode, FileBarChart, Briefcase, Users as UsersIcon, Megaphone, Bell } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { EnhancedSpaceMap } from '@/app/components/space-map/EnhancedSpaceMap';
import { SettingsModal } from '@/app/components/settings/SettingsModal';
import { CompletionReport } from '@/app/components/reports/CompletionReport';
import { WelcomeTutorial } from '@/app/components/onboarding/WelcomeTutorial';
import { StudentAnnouncementsViewer } from '@/app/components/announcements/StudentAnnouncementsViewer';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';

export function Dashboard() {
  const { user, logout, levels, totalXP, generateQRCode, setCurrentView, announcements, unreadAnnouncementsCount, language } = useYieldX();
  const [qrCodeValue, setQrCodeValue] = React.useState('');
  const [announcementsOpen, setAnnouncementsOpen] = React.useState(false);
  
  // Get translations for current language
  const t = translations[language];
  
  const maxTotalXP = levels.reduce((sum, level) => sum + level.maxXp, 0);
  const completedLevels = levels.filter((l) => l.completed).length;
  const overallProgress = (totalXP / maxTotalXP) * 100;

  const handleGenerateQR = () => {
    const code = generateQRCode();
    setQrCodeValue(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Welcome Tutorial */}
      <WelcomeTutorial />
      
      {/* Animated Background Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Rocket className="w-8 h-8 text-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">YieldX</h1>
                <p className="text-sm text-purple-300">مرحباً، {user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentView('workspaces')}
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                {user?.role === 'lecturer' ? 'إدارة المشاريع' : 'مشاريعي'}
              </Button>

              {user?.role === 'lecturer' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 hover:bg-white/20"
                      onClick={handleGenerateQR}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      إنشاء QR
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-purple-500/50" aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle className="text-white">رمز QR للطلاب</DialogTitle>
                      <DialogDescription className="text-gray-400">يمكن للطلاب مسح هذا الرمز أو إدخال الكود للدخول</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 p-6">
                      {qrCodeValue && (
                        <>
                          <div className="bg-white p-4 rounded-lg">
                            <QRCodeSVG value={qrCodeValue} size={200} />
                          </div>
                          <p className="text-white text-center font-mono text-lg">{qrCodeValue}</p>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {completedLevels > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30"
                    >
                      <FileBarChart className="w-4 h-4 mr-2" />
                      عرض التقرير
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-purple-500/50 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white text-2xl">تقرير التقدم</DialogTitle>
                      <DialogDescription className="text-gray-400">عرض تفصيلي لإنجازاتك ونقاطك</DialogDescription>
                    </DialogHeader>
                    <CompletionReport />
                  </DialogContent>
                </Dialog>
              )}
              
              <SettingsModal />
              
              <Button
                variant="outline"
                onClick={logout}
                className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Teacher Control Panel Button (only for lecturers) */}
        {user?.role === 'lecturer' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card 
              className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 border-orange-500/30 backdrop-blur-sm p-6 cursor-pointer hover:border-orange-500/50 transition-all"
              onClick={() => setCurrentView('teacher-dashboard')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-full p-3">
                    <UsersIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">لوحة تحكم المدرس</h3>
                    <p className="text-orange-200 text-sm">إدارة الطلاب • التحكم في المستويات • مراجعة التسليمات</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                  فتح لوحة التحكم
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Announcements Section (for students only) */}
        {user?.role === 'student' && announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card 
              className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 border-orange-500/30 backdrop-blur-sm p-6 cursor-pointer hover:border-orange-500/50 transition-all"
              onClick={() => setAnnouncementsOpen(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-3 relative">
                    <Megaphone className="w-8 h-8 text-white" />
                    {unreadAnnouncementsCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{unreadAnnouncementsCount}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1 flex items-center gap-2">
                      الإعلانات الجديدة
                      {unreadAnnouncementsCount > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {unreadAnnouncementsCount} جديد
                        </Badge>
                      )}
                    </h3>
                    <p className="text-orange-200 text-sm">
                      {announcements.slice(0, 1).map(ann => ann.title).join(', ')}
                    </p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Bell className="w-4 h-4 ml-2" />
                  عرض الإعلانات
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Announcements Viewer Modal */}
        <StudentAnnouncementsViewer />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">{t.dashboard.totalXP}</p>
                  <p className="text-3xl font-bold text-white mt-1">{totalXP}</p>
                </div>
                <Star className="w-12 h-12 text-yellow-400" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">{t.dashboard.completedLevels}</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {completedLevels} / {levels.length}
                  </p>
                </div>
                <Trophy className="w-12 h-12 text-blue-400" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-2"
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm">{t.dashboard.overallProgress}</p>
                  <p className="text-white text-sm font-bold">{Math.round(overallProgress)}%</p>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-purple-300 text-xs mt-2">
                  {maxTotalXP - totalXP} {language === 'ar' ? 'نقطة متبقية للإنجاز الكامل' : 'points remaining to complete'}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Space Map */}
        <EnhancedSpaceMap />
      </div>
    </div>
  );
}