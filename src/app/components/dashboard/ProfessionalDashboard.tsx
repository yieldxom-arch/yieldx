import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, LogOut, QrCode, FileBarChart, Briefcase, Users as UsersIcon, TrendingUp, FileText, PlayCircle, Crown, MessageSquare, UserCheck, Rocket, Save, FolderOpen, CheckCircle, Edit3, Download, Award } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { EnhancedSpaceMap } from '@/app/components/space-map/EnhancedSpaceMap';
import { WorldEventsDashboardWidget } from '@/app/components/world-events/WorldEventsDashboardWidget';
import { SettingsModal } from '@/app/components/settings/SettingsModal';
import { CompletionReport } from '@/app/components/reports/CompletionReport';
import { WelcomeTutorial } from '@/app/components/onboarding/WelcomeTutorial';
import { NotificationsCenter } from '@/app/components/notifications/NotificationsCenter';
import { BadgesAndAchievements } from '@/app/components/achievements/BadgesAndAchievements';
import { StreaksWidget } from '@/app/components/streaks/StreaksWidget';
import { AutoSaveIndicator } from '@/app/components/autosave/AutoSaveIndicator';
import { SubscriptionModal } from '@/app/components/subscription/SubscriptionModal';
import { StudentAnnouncementsViewer } from '@/app/components/announcements/StudentAnnouncementsViewer';
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { BrandedSearchWithResults } from '@/app/components/ui/branded-search';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/app/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { FeasibilityStudyExport } from '@/app/components/reports/FeasibilityStudyExport';
import type { SavedProject } from '@/app/contexts/YieldXContext';

export function ProfessionalDashboard() {
  const { user, logout, levels, totalXP, generateQRCode, setCurrentView, language,
    saveProject, savedProjects, activeSavedProjectId } = useYieldX();
  const [qrCodeValue, setQrCodeValue] = React.useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [projectNameInput, setProjectNameInput] = React.useState('');
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [exportProject, setExportProject] = React.useState<SavedProject | null>(null);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  // ── Project Name Validation ──────────────────────────────────────────────────
  const RESERVED_NAMES = [
    'yieldx', 'yield x', 'yieldx platform', 'admin', 'administrator',
    'system', 'root', 'superuser', 'test', 'demo', 'default', 'template',
    'null', 'undefined', 'support', 'help', 'info', 'contact', 'official',
    'platform', 'app', 'application', 'service',
  ];

  type NameStatus = 'idle' | 'available' | 'taken' | 'reserved' | 'empty';

  const checkNameStatus = React.useCallback((name: string): NameStatus => {
    const trimmed = name.trim();
    if (!trimmed) return 'empty';
    const lower = trimmed.toLowerCase();
    if (RESERVED_NAMES.some(r => lower === r || lower.startsWith('yieldx'))) return 'reserved';
    // Duplicate check — exclude the active project itself (it's being renamed, not duplicating)
    const isDuplicate = savedProjects.some(
      p => p.userId === user?.id &&
           p.name.trim().toLowerCase() === lower &&
           p.id !== activeSavedProjectId
    );
    if (isDuplicate) return 'taken';
    return 'available';
  }, [savedProjects, user?.id, activeSavedProjectId]);

  const nameStatus = React.useMemo(
    () => checkNameStatus(projectNameInput),
    [projectNameInput, checkNameStatus]
  );

  const nameStatusConfig = {
    idle:      { color: '', icon: '', text: '' },
    empty:     { color: '', icon: '', text: '' },
    available: {
      color: 'text-emerald-600 dark:text-emerald-400',
      icon: '✓',
      text: language === 'ar' ? 'الاسم متاح' : 'Name available',
    },
    taken: {
      color: 'text-red-500 dark:text-red-400',
      icon: '✕',
      text: language === 'ar' ? 'الاسم مستخدم بالفعل' : 'Name already taken',
    },
    reserved: {
      color: 'text-amber-600 dark:text-amber-400',
      icon: '⚠',
      text: language === 'ar' ? 'هذا الاسم محجوز ولا يمكن استخدامه' : 'This name is reserved and cannot be used',
    },
  };
  
  // Get translations for current language
  const t = translations[language];
  
  const maxTotalXP = levels.reduce((sum, level) => sum + level.maxXp, 0);
  const completedLevels = levels.filter((l) => l.completed).length;
  const overallProgress = (totalXP / maxTotalXP) * 100;

  // Pre-fill project name from existing active project
  const activeProject = savedProjects.find(p => p.id === activeSavedProjectId);

  const handleGenerateQR = () => {
    const code = generateQRCode();
    setQrCodeValue(code);
  };

  const handleOpenSaveDialog = () => {
    setProjectNameInput(activeProject?.name || '');
    setSaveSuccess(false);
    setShowSaveDialog(true);
  };

  const handleSaveProject = () => {
    const trimmed = projectNameInput.trim();
    if (!trimmed) return;
    if (nameStatus === 'taken' || nameStatus === 'reserved') return;
    saveProject(trimmed, 'manual');
    setSaveSuccess(true);
    setTimeout(() => { setShowSaveDialog(false); setSaveSuccess(false); }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-[#0F0F25] dark:via-[#1B1B3A] dark:to-[#2A4A5A] relative overflow-hidden">
      {/* Welcome Tutorial */}
      <WelcomeTutorial />
      
      {/* Auto-save Indicator */}
      <AutoSaveIndicator />
      
      {/* Animated Background with Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Teal Orb */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(78, 205, 196, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Cyan Orb */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(127, 219, 202, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(60px)',
            bottom: '-10%',
            left: '-10%',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-purple-200 dark:border-[#4ECDC4]/20 bg-white/80 dark:bg-[#1B1B3A]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4ECDC4] via-[#5DD9C1] to-[#7FDBCA] bg-clip-text text-transparent">
                  YieldX
                </h1>
              </motion.div>
              
              {/* User Info */}
              <div className="border-r border-purple-300 dark:border-[#4ECDC4]/30 pr-6">
                <p className="text-purple-600 dark:text-[#7FDBCA] text-sm">{t.common.hello}</p>
                <p className="text-slate-900 dark:text-white font-semibold">{user?.name}</p>
              </div>

              {/* Role Badge */}
              <div className="bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-[#4ECDC4]/20 dark:to-[#7FDBCA]/20 px-4 py-2 rounded-lg border border-purple-300 dark:border-[#4ECDC4]/30">
                <p className="text-purple-700 dark:text-[#4ECDC4] text-sm font-medium">
                  {user?.role === 'lecturer' ? t.roles.lecturer : t.roles.student}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* NEW: Notifications Center */}
              <NotificationsCenter />
              
              {/* NEW: Badges & Achievements */}
              <BadgesAndAchievements />
              
              {/* NEW: Student Announcements */}
              {user?.role === 'student' && <StudentAnnouncementsViewer />}
              
              {/* Save Project Button - only for students */}
              {user?.role === 'student' && (
                <>
                  {/* Auto-save indicator — inline next to save button */}
                  <AutoSaveIndicator inline />

                  <Button
                    variant="outline"
                    onClick={handleOpenSaveDialog}
                    className="bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/60 text-emerald-600 dark:text-emerald-400 relative"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'حفظ المشروع' : 'Save Project'}
                    {activeProject && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </Button>
                  {activeProject && (
                    <Button
                      variant="outline"
                      onClick={() => setExportProject(activeProject)}
                      className="bg-indigo-500/10 border-indigo-500/40 hover:bg-indigo-500/20 hover:border-indigo-500/60 text-indigo-600 dark:text-indigo-400"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                    </Button>
                  )}
                </>
              )}

              <Button
                variant="outline"
                onClick={() => setCurrentView('workspaces')}
                className="bg-[#4ECDC4]/10 border-[#4ECDC4]/40 hover:bg-[#4ECDC4]/20 hover:border-[#4ECDC4]/60 text-[#4ECDC4]"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                {t.dashboard.workspace}
              </Button>

              {user?.role === 'lecturer' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleGenerateQR}
                      className="bg-[#7FDBCA]/10 border-[#7FDBCA]/40 hover:bg-[#7FDBCA]/20 hover:border-[#7FDBCA]/60 text-[#7FDBCA]"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'QR للطلاب' : 'Student QR'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-[#1B1B3A] border-violet-200 dark:border-[#4ECDC4]/50">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 dark:text-white">{language === 'ar' ? 'رمز QR للطلاب' : 'Student QR Code'}</DialogTitle>
                      <DialogDescription className="text-sm text-slate-500 dark:text-gray-400">
                        {language === 'ar' ? 'يمكنك استخدام هذا الرمز للطلاب للدخول إلى النظام.' : 'Students can use this code to access the system.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 p-6">
                      {qrCodeValue && (
                        <>
                          <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <QRCodeSVG value={qrCodeValue} size={200} />
                          </div>
                          <p className="text-slate-900 dark:text-white text-center font-mono text-lg">{qrCodeValue}</p>
                          <p className="text-[#0d9488] dark:text-[#7FDBCA] text-sm text-center">
                            {language === 'ar' ? 'يمكن للطلاب مسح هذا الرمز أو إدخال الكود للدخول' : 'Students can scan this code or enter it to log in'}
                          </p>
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
                      className="bg-[#A8E6CF]/10 border-[#A8E6CF]/40 hover:bg-[#A8E6CF]/20 hover:border-[#A8E6CF]/60 text-[#A8E6CF]"
                    >
                      <FileBarChart className="w-4 h-4 mr-2" />
                      {t.reports.completionReport}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-[#1B1B3A] border-violet-200 dark:border-violet-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 dark:text-white text-2xl font-bold">{t.reports.completionReport}</DialogTitle>
                      <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                        {language === 'ar' ? 'عرض تفصيلي لإنجازاتك ونقاطك' : 'Detailed view of your achievements and points'}
                      </DialogDescription>
                    </DialogHeader>
                    <CompletionReport />
                  </DialogContent>
                </Dialog>
              )}
              
              {/* NEW: Certificates Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-violet-500/10 border-violet-500/40 hover:bg-violet-500/20 hover:border-violet-500/60 text-violet-600 dark:text-violet-400"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {t.certificates.certificateSystem}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white text-2xl font-bold">
                      {t.certificates.certificateSystem}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-300">
                      {language === 'ar' 
                        ? 'احصل على شهادات معتمدة لإنجازاتك'
                        : 'Earn certified credentials for your achievements'}
                    </DialogDescription>
                  </DialogHeader>
                  <CertificateSystem />
                </DialogContent>
              </Dialog>
              
              <SettingsModal />
              
              <Button
                variant="outline"
                onClick={logout}
                className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.common.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Teacher Control Panel Button (only for lecturers) */}
        {user?.role === 'lecturer' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card 
              className="bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-[#4ECDC4]/10 dark:via-[#5DD9C1]/10 dark:to-[#7FDBCA]/10 border-purple-200 dark:border-[#4ECDC4]/30 backdrop-blur-sm p-8 cursor-pointer hover:border-purple-400 dark:hover:border-[#4ECDC4]/50 transition-all group shadow-lg shadow-purple-200/50 dark:shadow-[#4ECDC4]/5"
              onClick={() => setCurrentView('teacher-dashboard')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <motion.div 
                    className="bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] rounded-2xl p-4 shadow-lg shadow-[#4ECDC4]/30"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <UsersIcon className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white text-2xl font-bold mb-1">لوحة تحكم المدرس</h3>
                    <p className="text-purple-600 dark:text-[#7FDBCA] text-sm">إدارة الطلاب • التحكم في المستويات • مراجعة التسليمات</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] hover:from-[#5DD9C1] hover:to-[#4ECDC4] text-white font-semibold px-8 py-6 text-base shadow-lg shadow-[#4ECDC4]/30 group-hover:shadow-xl group-hover:shadow-[#4ECDC4]/40 transition-all">
                  فتح لوحة التحكم
                  <TrendingUp className="w-5 h-5 mr-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Active Project / New Study Banner (students only) ── */}
        {user?.role === 'student' && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {activeProject ? (
              /* ── Active project context banner — actions are in the top nav ── */
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border-emerald-200 dark:border-emerald-500/30 px-4 py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {language === 'ar' ? 'المشروع النشط:' : 'Active Project:'}
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{activeProject.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      activeProject.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}>
                      {activeProject.status === 'completed'
                        ? (language === 'ar' ? '✅ مكتمل' : '✅ Completed')
                        : (language === 'ar' ? '⚡ قيد التنفيذ' : '⚡ In Progress')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 ms-auto hidden sm:block">
                    {language === 'ar'
                      ? 'استخدم أزرار الحفظ والتصدير أعلاه للتحكم في المشروع'
                      : 'Use the Save & Export buttons above to manage your project'}
                  </p>
                </div>
              </Card>
            ) : (
              /* ── No active project — pure informational hint, no duplicate buttons ── */
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border-indigo-200 dark:border-indigo-500/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Rocket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {language === 'ar' ? 'لا يوجد مشروع نشط حالياً' : 'No active project yet'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'ar'
                        ? 'أكمل المستويات ثم احفظ مشروعك باستخدام زر "حفظ المشروع" أعلاه'
                        : 'Complete levels then save your project using the "Save Project" button above'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-200 dark:border-[#4ECDC4]/30 backdrop-blur-md p-6 hover:border-purple-400 dark:hover:border-[#4ECDC4]/50 transition-all shadow-lg hover:shadow-purple-300/50 dark:hover:shadow-[#4ECDC4]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-[#7FDBCA] text-sm mb-1">{t.dashboard.totalXP}</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{totalXP}</p>
                  <p className="text-[#4ECDC4] text-xs mt-1">{language === 'ar' ? 'XP مكتسبة' : 'XP Earned'}</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Star className="w-14 h-14 text-[#4ECDC4]" />
                </motion.div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-cyan-200 dark:border-[#5DD9C1]/30 backdrop-blur-md p-6 hover:border-cyan-400 dark:hover:border-[#5DD9C1]/50 transition-all shadow-lg hover:shadow-cyan-300/50 dark:hover:shadow-[#5DD9C1]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-[#7FDBCA] text-sm mb-1">{t.dashboard.completedLevels}</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">
                    {completedLevels}<span className="text-2xl text-purple-500 dark:text-[#7FDBCA]">/{levels.length}</span>
                  </p>
                  <p className="text-[#5DD9C1] text-xs mt-1">{language === 'ar' ? 'مستوى' : 'level'}</p>
                </div>
                <Trophy className="w-14 h-14 text-[#5DD9C1]" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-2"
          >
            <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-cyan-200 dark:border-[#7FDBCA]/30 backdrop-blur-md p-6 hover:border-cyan-300 dark:hover:border-[#7FDBCA]/50 transition-all shadow-lg hover:shadow-cyan-200/50 dark:hover:shadow-[#7FDBCA]/20">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-slate-900 dark:text-white font-semibold text-lg">{t.dashboard.overallProgress}</p>
                    <p className="text-purple-600 dark:text-[#7FDBCA] text-xs">{language === 'ar' ? 'نحو الإنجاز الكامل' : 'Towards complete achievement'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-[#4ECDC4]">{Math.round(overallProgress)}%</p>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-4 bg-slate-200 dark:bg-[#0F0F25] shadow-inner" />
                <p className="text-green-600 dark:text-[#A8E6CF] text-sm mt-3 text-center">
                  {maxTotalXP - totalXP} {language === 'ar' ? 'نقطة متبقية • استمر في التقدم! 🚀' : 'points remaining • Keep going! 🚀'}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Space Map — the core level journey, primary focus right after stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <EnhancedSpaceMap />
        </motion.div>

        {/* ── Secondary widgets — explore more, lower visual priority ── */}
        <div className="flex items-center gap-3 mt-10 mb-6">
          <h2 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wide whitespace-nowrap">
            {language === 'ar' ? 'استكشف المزيد' : 'Explore More'}
          </h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>

        {/* NEW: Daily Streaks + Live World Events Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StreaksWidget />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <WorldEventsDashboardWidget />
          </motion.div>
        </div>

        {/* NEW: Video Library & Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Video Library Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card 
              className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-[#4ECDC4]/10 dark:to-[#7FDBCA]/10 border-purple-200 dark:border-[#4ECDC4]/30 backdrop-blur-sm p-6 cursor-pointer hover:border-purple-400 dark:hover:border-[#4ECDC4]/50 transition-all group shadow-lg"
              onClick={() => setCurrentView('video-library')}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="bg-gradient-to-br from-[#4ECDC4] to-[#7FDBCA] rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlayCircle className="w-8 h-8 text-white" />
                </motion.div>
                <div className="bg-[#4ECDC4]/20 px-3 py-1 rounded-full">
                  <p className="text-[#4ECDC4] text-xs font-bold">{language === 'ar' ? '50+ فيديو' : '50+ videos'}</p>
                </div>
              </div>
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">{language === 'ar' ? 'مكتبة الفيديوهات التعليمية' : 'Educational Video Library'}</h3>
              <p className="text-purple-600 dark:text-[#7FDBCA] text-sm mb-4">{language === 'ar' ? 'تعلم من خبراء الأعمال بفيديوهات عالية الجودة' : 'Learn from business experts with high-quality videos'}</p>
              <Button className="w-full bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white font-semibold shadow-lg group-hover:shadow-xl transition-all">
                {t.dashboard.browseLibrary}
              </Button>
            </Card>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card 
              className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-purple-500/10 dark:to-pink-500/10 border-amber-200 dark:border-purple-500/30 backdrop-blur-sm p-6 cursor-pointer hover:border-amber-400 dark:hover:border-purple-500/50 transition-all group shadow-lg"
              onClick={() => setShowSubscriptionModal(true)}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-purple-500 dark:to-pink-500 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  transition={{ duration: 0.2 }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                >
                  <Crown className="w-8 h-8 text-white" />
                </motion.div>
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 dark:from-purple-500 dark:to-pink-500 px-3 py-1 rounded-full">
                  <p className="text-white text-xs font-bold">
                    {user?.subscriptionTier === 'free' && (language === 'ar' ? 'عادي' : 'Normal')}
                    {user?.subscriptionTier === 'premium' && (language === 'ar' ? 'برو' : 'Pro')}
                    {user?.subscriptionTier === 'enterprise' && (language === 'ar' ? 'مؤسسات' : 'Organization')}
                  </p>
                </div>
              </div>
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">{t.dashboard.subscriptionManagement}</h3>
              <p className="text-amber-700 dark:text-purple-300 text-sm mb-4">
                {user?.subscriptionTier === 'free' 
                  ? (language === 'ar' ? 'ترقية خطتك للحصول على مزايا حصرية' : 'Upgrade your plan to get exclusive benefits')
                  : (language === 'ar' ? 'إدارة اشتراكك والميزات' : 'Manage your subscription and features')
                }
              </p>
              <Button className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 dark:from-purple-500 dark:to-pink-500 hover:from-yellow-500 hover:to-amber-400 dark:hover:from-pink-500 dark:hover:to-purple-500 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all">
                {user?.subscriptionTier === 'free' ? t.dashboard.upgradeNow : t.dashboard.manageSubscription}
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* NEW FEATURES: Leaderboard, Messaging, Professional Consultation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Leaderboard Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card 
              className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 border-yellow-200 dark:border-yellow-500/30 backdrop-blur-sm p-6 cursor-pointer hover:border-yellow-400 dark:hover:border-yellow-500/50 transition-all group shadow-lg"
              onClick={() => setCurrentView('leaderboard')}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
                <div className="bg-yellow-400/20 px-3 py-1 rounded-full">
                  <p className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">{language === 'ar' ? 'المركز #15' : 'Rank #15'}</p>
                </div>
              </div>
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">{t.leaderboard.title}</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">{language === 'ar' ? 'تنافس مع الطلاب من جامعتك والعالم' : 'Compete with students from your university and the world'}</p>
              <Button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all">
                {t.dashboard.viewRanking}
              </Button>
            </Card>
          </motion.div>

          {/* Messaging Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-200 dark:border-blue-500/30 backdrop-blur-sm p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 transition-all group shadow-lg"
              onClick={() => setCurrentView('messaging')}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageSquare className="w-8 h-8 text-white" />
                </motion.div>
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  3
                </div>
              </div>
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">{language === 'ar' ? 'الرسائل والبلاغات' : 'Messages & Reports'}</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">{language === 'ar' ? 'تواصل ع المعلم وأبلغ عن المشاكل' : 'Connect with your teacher and report issues'}</p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all">
                {t.dashboard.openMessages}
              </Button>
            </Card>
          </motion.div>

          {/* Professional Consultation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card 
              className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-rose-500/10 border-pink-200 dark:border-pink-500/30 backdrop-blur-sm p-6 cursor-pointer hover:border-pink-400 dark:hover:border-pink-500/50 transition-all group shadow-lg"
              onClick={() => setCurrentView('professional-consultation')}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-3 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserCheck className="w-8 h-8 text-white" />
                </motion.div>
                <div className="bg-green-500/20 px-3 py-1 rounded-full">
                  <p className="text-green-600 dark:text-green-400 text-xs font-bold">{language === 'ar' ? '3 مجانية' : '3 free'}</p>
                </div>
              </div>
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">{language === 'ar' ? 'استشارات احترافي' : 'Professional Consultations'}</h3>
              <p className="text-pink-700 dark:text-pink-300 text-sm mb-4">{language === 'ar' ? 'احصل على مشورة من خبراء معتمدين' : 'Get advice from certified experts'}</p>
              <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all">
                {t.dashboard.browseExperts}
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Business Resources CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <div
            onClick={() => setCurrentView('business-resources')}
            className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 via-violet-500/8 to-purple-500/10 p-6 cursor-pointer group hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base">
                    {language === 'ar' ? 'موارد وشركاء الأعمال' : 'Business Resources & Partners'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 font-medium whitespace-nowrap">
                    {language === 'ar' ? 'جديد' : 'New'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                  {language === 'ar'
                    ? 'موردون، خبراء، وشركاء لمساعدتك على إطلاق مشروعك بناءً على دراسة جدواك'
                    : 'Suppliers, experts, and partners to help you launch — matched to your feasibility study'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0">
                <span className="text-sm font-medium hidden sm:block">{language === 'ar' ? 'استكشف' : 'Explore'}</span>
                <svg className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}

      {/* ── Export Feasibility Study ── */}
      {exportProject && (
        <FeasibilityStudyExport
          project={exportProject}
          onClose={() => setExportProject(null)}
        />
      )}

      {/* ── Save Project Dialog ── */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-[#1B1B3A] border border-emerald-200 dark:border-emerald-500/40 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border-b border-emerald-200 dark:border-emerald-500/30 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Save className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? 'حفظ المشروع' : 'Save Project'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-emerald-300">
                    {activeProject
                      ? (language === 'ar' ? 'تحديث المشروع المحفوظ' : 'Update saved project')
                      : (language === 'ar' ? 'سيظهر المشروع في مساحة العمل' : 'Project will appear in Workspace')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {saveSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved Successfully!'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    {language === 'ar'
                      ? 'يمكنك العثور على مشروعك في مساحة العمل'
                      : 'You can find your project in the Workspace'}
                  </p>
                </motion.div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {language === 'ar' ? 'اسم المشروع' : 'Project Name'}
                    </label>
                    <div className="relative">
                      <Edit3 className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                      <input
                        autoFocus
                        value={projectNameInput}
                        onChange={e => setProjectNameInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveProject()}
                        placeholder={language === 'ar' ? 'أدخل اسم المشروع...' : 'Enter project name...'}
                        className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${language === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'}`}
                      />
                    </div>
                    <p className={`text-xs ${nameStatusConfig[nameStatus].color} mt-1`}>
                      {nameStatusConfig[nameStatus].icon} {nameStatusConfig[nameStatus].text}
                    </p>
                  </div>

                  {/* Current progress info */}
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/10">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {language === 'ar' ? 'سيتم حفظ:' : 'Will be saved:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                        {language === 'ar' ? `${completedLevels}/${levels.length} مستويات مكتملة` : `${completedLevels}/${levels.length} levels completed`}
                      </span>
                      <span className="text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                        {totalXP} XP
                      </span>
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                        {language === 'ar' ? 'جميع البيانات' : 'All data'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveProject}
                      disabled={!projectNameInput.trim() || nameStatus !== 'available'}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveDialog(false)}
                      className="flex-1"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}