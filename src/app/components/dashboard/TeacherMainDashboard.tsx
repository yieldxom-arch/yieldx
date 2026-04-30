import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { SettingsModal } from '@/app/components/settings/SettingsModal';
import { NotificationsCenter } from '@/app/components/notifications/NotificationsCenter';
import { BadgesAndAchievements } from '@/app/components/achievements/BadgesAndAchievements';
import { AutoSaveIndicator } from '@/app/components/autosave/AutoSaveIndicator';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { AnnouncementCreation } from '@/app/components/announcements/AnnouncementCreation';
import { EnhancedSpaceMap } from '@/app/components/space-map/EnhancedSpaceMap';
import {
  LevelDetailModal,
  GradebookView,
  AnalyticsDashboard,
  AnnouncementSystem
} from '@/app/components/teacher';
import { CapstonePreviewModal } from '@/app/components/teacher/CapstonePreviewModal';
import { getDemoTeacherData, isDemoTeacher } from '@/app/data/demoTeacherData';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  PlayCircle, 
  Crown, 
  UserCheck,
  LogOut,
  Table,
  BarChart3,
  Megaphone,
  Briefcase,
  Clock,
  TrendingUp,
  BarChart2,
  CheckCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  Award,
  BookOpen,
  Unlock
} from 'lucide-react';

export function TeacherMainDashboard() {
  const { user, logout, setCurrentView, cohorts, levels, language } = useYieldX();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [levelDetailOpen, setLevelDetailOpen] = useState(false);
  const [gradebookOpen, setGradebookOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [capstonePreviewOpen, setCapstonePreviewOpen] = useState(false);

  // Translations
  const t = {
    welcome: language === 'ar' ? 'مرحباً' : 'Welcome',
    teacher: language === 'ar' ? '👨‍🏫 مُدرّس' : '👨‍🏫 Teacher',
    logout: language === 'ar' ? 'خروج' : 'Logout',
    mainDashboard: language === 'ar' ? 'لوحة التحكم الرئيسية' : 'Main Dashboard',
    dashboardDesc: language === 'ar' ? 'مرحباً بك في لوحة التحكم الخاصة بالمُدرّس - إدارة شاملة للطلاب والمشاريع' : 'Welcome to the Teacher Dashboard - Comprehensive student and project management',
    gradebook: language === 'ar' ? 'السجل الأكاديمي' : 'Gradebook',
    analytics: language === 'ar' ? 'التحليلات' : 'Analytics',
    announcements: language === 'ar' ? 'الإعلانات' : 'Announcements',
    totalStudents: language === 'ar' ? 'طالب نشط' : 'Active Students',
    total: language === 'ar' ? 'إجمالي' : 'Total',
    activeProjects: language === 'ar' ? 'مشروع/مجموعة' : 'Project/Group',
    active: language === 'ar' ? 'نشط' : 'Active',
    pendingReview: language === 'ar' ? 'تسليم للمراجعة' : 'Pending Review',
    pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
    averageProgress: language === 'ar' ? 'نسبة الإنجاز' : 'Average Progress',
    average: language === 'ar' ? 'متوسط' : 'Average',
    levelsOverview: language === 'ar' ? 'نظام المستويات الجديد (0-7)' : 'New Level System (0-7)',
    trackProgress: language === 'ar' ? 'تتبع تقدم الطلاب عبر جميع مستويات البرنامج' : 'Track student progress across all program levels',
    detailedDashboard: language === 'ar' ? 'لوحة التحكم التفصيلية' : 'Detailed Dashboard',
    level: language === 'ar' ? 'المستوى' : 'Level',
    completed: language === 'ar' ? 'مكتمل' : 'Completed',
    inProgress: language === 'ar' ? 'قيد العمل' : 'In Progress',
    student: language === 'ar' ? 'طالب' : 'Student',
    averageScore: language === 'ar' ? 'متوسط الدرجة' : 'Average Score',
    viewDetails: language === 'ar' ? 'عرض التفاصيل' : 'View Details',
    recentActivity: language === 'ar' ? 'النشاطات الأخيرة' : 'Recent Activity',
    viewAll: language === 'ar' ? 'عرض الكل' : 'View All',
    quickLinks: language === 'ar' ? 'روابط سريعة' : 'Quick Links',
    noActivity: language === 'ar' ? 'لا توجد نشاطات حتى الآن' : 'No activity yet',
    capstoneTitle: language === 'ar' ? 'المشروع النهائي - دراسة الجدوى الشاملة' : 'Capstone Project - Comprehensive Feasibility Study',
    capstoneDesc: language === 'ar' ? 'تتبع تقدم الطلاب في المشروع النهائي' : 'Track student progress on the capstone project',
    studentsUnlocked: language === 'ar' ? 'طالب فتح القفل' : 'Students Unlocked',
    studentsWorking: language === 'ar' ? 'قيد العمل' : 'Currently Working',
    studentsSubmitted: language === 'ar' ? 'تم التسليم' : 'Submitted',
    unlockRequirement: language === 'ar' ? 'يتطلب إكمال 6 من 8 مستويات (0-7)' : 'Requires completing 6 out of 8 levels (0-7)',
    sections: language === 'ar' ? 'أقسام' : 'Sections',
    capstoneFeatures: language === 'ar' ? 'محتوى المشروع النهائي' : 'Capstone Content',
    levelTitles: {
      0: language === 'ar' ? 'المستوى 0: اختيار نوع المشروع' : 'Level 0: Project Type Selection',
      1: language === 'ar' ? 'المستوى 1: الهوية والملكية' : 'Level 1: Identity & Ownership',
      2: language === 'ar' ? 'المستوى 2: الإطار القانوني والتنظيمي' : 'Level 2: Legal & Regulatory Framework',
      3: language === 'ar' ? 'المستوى 3: الموارد المادية والفنية' : 'Level 3: Physical & Technical Resources',
      4: language === 'ar' ? 'المستوى 4: الموارد البشرية والتنظيمية' : 'Level 4: Human Resources & Organizational',
      5: language === 'ar' ? 'المستوى 5: السوق والاستراتيجية' : 'Level 5: Market & Strategy',
      6: language === 'ar' ? 'المستوى 6: التمويل والمؤشرات المالية' : 'Level 6: Financing & Financial Indicators',
      7: language === 'ar' ? 'المستوى 7: النموذج الشامل والتنفيذ' : 'Level 7: Comprehensive Model & Implementation',
    },
    levelSubtitles: {
      0: language === 'ar' ? 'تحديد نوع المشروع (زراعي، صناعي، تجاري، خدمي)' : 'Identify project type (agricultural, industrial, commercial, service)',
      1: language === 'ar' ? 'تحديد تفاصيل المشروع الأساسية وهيكل الملكية' : 'Define basic project details and ownership structure',
      2: language === 'ar' ? 'استكمال المتطلبات القانونية والتراخيص اللازمة' : 'Complete legal requirements and necessary licenses',
      3: language === 'ar' ? 'حساب الأصول الثابتة والمواد الخام والإهلاك' : 'Calculate fixed assets, raw materials and depreciation',
      4: language === 'ar' ? 'بناء الهيكل الوظيفي وحساب تكاليف الموارد البشرية' : 'Build organizational structure and calculate HR costs',
      5: language === 'ar' ? 'تحليل المنافسين وتحديد المنتجات وإجراء تحليل SWOT متطور' : 'Analyze competitors, define products and conduct advanced SWOT analysis',
      6: language === 'ar' ? 'إعداد الخطة المالية والمؤشرات المالية الرئيسية (5-10 سنوات)' : 'Prepare financial plan and key financial indicators (5-10 years)',
      7: language === 'ar' ? 'إكمال Business Model Canvas والجدول الزمني والمساهمة في رؤية عُمان 2040' : 'Complete Business Model Canvas, timeline and contribution to Oman Vision 2040',
    },
    manageProjects: language === 'ar' ? 'إدارة المشاريع والطلاب' : 'Manage Projects & Students',
    messages: language === 'ar' ? 'الرسائل والتبليغات' : 'Messages & Reports',
    videoLibrary: language === 'ar' ? 'مكتبة الفيديوهات' : 'Video Library',
    leaderboard: language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard',
    consultations: language === 'ar' ? 'الاستشارات المهنية' : 'Professional Consultations',
  };

  // Check if demo teacher and get demo data
  const demoData = getDemoTeacherData(user?.email);
  const isDemo = isDemoTeacher(user?.email);

  // Real statistics - starts empty for new teachers OR use demo data
  const stats = isDemo && demoData ? {
    totalStudents: demoData.stats.totalStudents,
    activeCohorts: demoData.stats.activeClasses,
    pendingSubmissions: demoData.stats.pendingSubmissions,
    averageProgress: demoData.stats.engagement,
    recentMessages: 0,
    upcomingDeadlines: 0
  } : {
    totalStudents: 0,
    activeCohorts: cohorts.length,
    pendingSubmissions: 0,
    averageProgress: 0,
    recentMessages: 0,
    upcomingDeadlines: 0
  };

  // Real level data - empty for new teachers
  const levelData = [
    {
      id: 0,
      title: t.levelTitles[0],
      subtitle: t.levelSubtitles[0],
      icon: '🌟',
      studentsCompleted: 0,
      studentsInProgress: 0,
      averageScore: 0,
      pendingSubmissions: 0,
      totalStudents: 0,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/30',
    },
    {
      id: 1,
      title: t.levelTitles[1],
      subtitle: t.levelSubtitles[1],
      icon: '🏢',
      studentsCompleted: 0,
      studentsInProgress: 0,
      averageScore: 0,
      pendingSubmissions: 0,
      totalStudents: 0,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/30',
    },
    {
      id: 2,
      title: t.levelTitles[2],
      subtitle: t.levelSubtitles[2],
      icon: '⚖️',
      studentsCompleted: 0,
      studentsInProgress: 0,
      averageScore: 0,
      pendingSubmissions: 0,
      totalStudents: 0,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/30',
    },
    {
      id: 3,
      title: t.levelTitles[3],
      subtitle: t.levelSubtitles[3],
      icon: '📦',
      studentsCompleted: 0,
      studentsInProgress: 0,
      averageScore: 0,
      pendingSubmissions: 0,
      totalStudents: 0,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      borderColor: 'border-green-200 dark:border-green-500/30',
    },
    {
      id: 4,
      title: t.levelTitles[4],
      subtitle: t.levelSubtitles[4],
      icon: '👥',
      studentsCompleted: 0,
      studentsInProgress: 0,
      averageScore: 0,
      pendingSubmissions: 0,
      totalStudents: 0,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
      borderColor: 'border-orange-200 dark:border-orange-500/30',
    },
    {
      id: 5,
      title: t.levelTitles[5],
      subtitle: t.levelSubtitles[5],
      icon: '🎯',
      studentsCompleted: 0,
      studentsInProgress: 0,
      averageScore: 0,
      pendingSubmissions: 0,
      totalStudents: 0,
      color: 'from-pink-500 to-purple-500',
      bgColor: 'bg-pink-50 dark:bg-pink-500/10',
      borderColor: 'border-pink-200 dark:border-pink-500/30',
    },
    {
      id: 6,
      title: t.levelTitles[6],
      subtitle: t.levelSubtitles[6],
      icon: '💰',
      studentsCompleted: 0,
      studentsInProgress: 0,
      averageScore: 0,
      pendingSubmissions: 0,
      totalStudents: 0,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
      borderColor: 'border-cyan-200 dark:border-cyan-500/30',
    },
    {
      id: 7,
      title: t.levelTitles[7],
      subtitle: t.levelSubtitles[7],
      icon: '📊',
      studentsCompleted: 0,
      studentsInProgress: 0,
      averageScore: 0,
      pendingSubmissions: 0,
      totalStudents: 0,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      borderColor: 'border-indigo-200 dark:border-indigo-500/30',
    },
  ];

  // Recent activity - empty for new teachers
  const recentActivity: Array<{ id: number; student: string; action: string; time: string; type: string }> = [];

  const quickActions = [
    {
      icon: Users,
      title: t.manageProjects,
      description: language === 'ar' ? 'عرض وإدارة جميع الطلاب والمشاريع' : 'View and manage all students and projects',
      action: () => setCurrentView('workspaces'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: FileText,
      title: t.detailedDashboard,
      description: language === 'ar' ? 'تقييم التسليمات وإدارة المستويات' : 'Assess submissions and manage levels',
      action: () => setCurrentView('teacher-dashboard'),
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/30',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: MessageSquare,
      title: t.messages,
      description: language === 'ar' ? 'التواصل مع الطلاب وعرض التقارير' : 'Communicate with students and view reports',
      action: () => setCurrentView('messaging'),
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      borderColor: 'border-green-200 dark:border-green-500/30',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: PlayCircle,
      title: t.videoLibrary,
      description: language === 'ar' ? 'إدارة المحتوى التعليمي' : 'Manage educational content',
      action: () => setCurrentView('video-library'),
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      borderColor: 'border-red-200 dark:border-red-500/30',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      icon: Crown,
      title: t.leaderboard,
      description: language === 'ar' ? 'عرض تصنيف الطلاب' : 'View student rankings',
      action: () => setCurrentView('leaderboard'),
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
      borderColor: 'border-yellow-200 dark:border-yellow-500/30',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      icon: UserCheck,
      title: t.consultations,
      description: language === 'ar' ? 'إدارة الاستشارات والخبراء' : 'Manage consultations and experts',
      action: () => setCurrentView('professional-consultation'),
      color: 'from-indigo-500 to-violet-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      borderColor: 'border-indigo-200 dark:border-indigo-500/30',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-[#0F0F25] dark:via-[#1B1B3A] dark:to-[#2A4A5A] relative overflow-hidden">
      {/* Auto-save Indicator */}
      <AutoSaveIndicator />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(78, 205, 196, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '-10%',
            right: '-10%',
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
        
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(127, 219, 202, 0.15) 0%, transparent 70%)',
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
                <p className="text-purple-600 dark:text-[#7FDBCA] text-sm">{t.welcome}</p>
                <p className="text-slate-900 dark:text-white font-semibold">{user?.name}</p>
              </div>

              {/* Role Badge */}
              <div className="bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-[#4ECDC4]/20 dark:to-[#7FDBCA]/20 px-4 py-2 rounded-lg border border-purple-300 dark:border-[#4ECDC4]/30">
                <p className="text-purple-700 dark:text-[#4ECDC4] text-sm font-medium">
                  {t.teacher}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationsCenter />
              <BadgesAndAchievements />
              <SettingsModal />
              
              <Button
                variant="outline"
                onClick={logout}
                className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {t.mainDashboard}
              </h2>
              <p className="text-slate-600 dark:text-gray-400">
                {t.dashboardDesc}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setGradebookOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Table className="w-4 h-4 ml-2" />
                {t.gradebook}
              </Button>
              <Button
                onClick={() => setAnalyticsOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                <BarChart3 className="w-4 h-4 ml-2" />
                {t.analytics}
              </Button>
              <Button
                onClick={() => setAnnouncementOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Megaphone className="w-4 h-4 ml-2" />
                {t.announcements}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-[#1B1B3A]/80 border-purple-200 dark:border-[#4ECDC4]/30 p-6 hover:shadow-xl hover:shadow-purple-200/50 dark:hover:shadow-[#4ECDC4]/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30">
                  {t.total}
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.totalStudents}</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">{t.totalStudents}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-[#1B1B3A]/80 border-purple-200 dark:border-[#4ECDC4]/30 p-6 hover:shadow-xl hover:shadow-purple-200/50 dark:hover:shadow-[#4ECDC4]/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30">
                  {t.active}
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.activeCohorts}</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">{t.activeProjects}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white dark:bg-[#1B1B3A]/80 border-purple-200 dark:border-[#4ECDC4]/30 p-6 hover:shadow-xl hover:shadow-purple-200/50 dark:hover:shadow-[#4ECDC4]/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30">
                  {t.pending}
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.pendingSubmissions}</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">{t.pendingReview}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-[#1B1B3A]/80 border-purple-200 dark:border-[#4ECDC4]/30 p-6 hover:shadow-xl hover:shadow-purple-200/50 dark:hover:shadow-[#4ECDC4]/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30">
                  {t.average}
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.averageProgress}%</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">{t.averageProgress}</p>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.levelsOverview}</h3>
              <p className="text-slate-600 dark:text-gray-400">{t.trackProgress}</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setCurrentView('teacher-dashboard')}
              className="bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20"
            >
              <BarChart2 className="w-4 h-4 ml-2" />
              {t.detailedDashboard}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levelData.map((level, index) => {
              const completionRate = level.totalStudents > 0 ? (level.studentsCompleted / level.totalStudents) * 100 : 0;
              
              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="h-full"
                >
                  <Card
                    className={`${level.bgColor} border ${level.borderColor} p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.03] transition-all group relative overflow-hidden h-full flex flex-col`}
                    onClick={() => {
                      setSelectedLevel(level.id);
                      setLevelDetailOpen(true);
                    }}
                  >
                    {/* Background Gradient Accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${level.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
                    
                    {/* Level Icon & Number */}
                    <div className="relative flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${level.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all flex-shrink-0`}>
                        <span className="text-3xl">{level.icon}</span>
                      </div>
                      <Badge variant="outline" className="bg-white/50 dark:bg-white/10 font-bold text-lg px-3 py-1">
                        {level.id}
                      </Badge>
                    </div>

                    {/* Level Title */}
                    <div className="mb-4 min-h-[80px]">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-2">
                        {level.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2">
                        {level.subtitle}
                      </p>
                    </div>

                    {/* Progress Stats */}
                    <div className="space-y-3 mb-4 flex-grow">
                      {/* Completion Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {t.completed}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {level.studentsCompleted}/{level.totalStudents}
                          </span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                      </div>

                      {/* In Progress */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.inProgress}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {level.studentsInProgress} {t.student}
                        </span>
                      </div>

                      {/* Pending Submissions */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-gray-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {t.pending}
                        </span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {level.pendingSubmissions}
                        </span>
                      </div>
                    </div>

                    {/* Average Score */}
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-gray-400">{t.averageScore}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            level.averageScore >= 80 ? 'bg-green-500' :
                            level.averageScore >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-bold text-lg text-slate-900 dark:text-white">
                            {level.averageScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-[#4ECDC4] group-hover:gap-3 transition-all">
                      <Eye className="w-4 h-4" />
                      <span>{t.viewDetails}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Capstone Project: Comprehensive Feasibility Study */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.capstoneTitle}</h3>
              <p className="text-slate-600 dark:text-gray-400">{t.capstoneDesc}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCapstonePreviewOpen(true)}
              className="bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-600/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20"
            >
              <BookOpen className="w-4 h-4 ml-2" />
              {t.capstoneFeatures}
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 border-2 border-amber-400 dark:border-amber-500/50 p-8 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <Award className="w-24 h-24 text-amber-500" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-10">
              <FileText className="w-32 h-32 text-orange-500" />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-4 inline-block shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                      {language === 'ar' ? 'دراسة الجدوى الشاملة (المشروع النهائي)' : 'Comprehensive Feasibility Study (Capstone)'}
                    </h4>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                      <Award className="w-3 h-3 mr-1" />
                      {language === 'ar' ? 'نهائي' : 'Final'}
                    </Badge>
                  </div>
                  <p className="text-amber-800 dark:text-amber-200 text-sm mt-1">
                    {t.unlockRequirement}
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white/60 dark:bg-slate-900/40 border-amber-300 dark:border-amber-600/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                        {t.studentsUnlocked}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      {language === 'ar' ? 'فتح القفل' : 'Unlocked'}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">0</div>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                    {language === 'ar' ? 'من إجمالي الطلاب' : 'out of total students'}
                  </p>
                </Card>

                <Card className="bg-white/60 dark:bg-slate-900/40 border-amber-300 dark:border-amber-600/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                        {t.studentsWorking}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      {language === 'ar' ? 'نشط' : 'Active'}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">0</div>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                    {language === 'ar' ? 'يعملون على المشروع' : 'working on project'}
                  </p>
                </Card>

                <Card className="bg-white/60 dark:bg-slate-900/40 border-amber-300 dark:border-amber-600/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                        {t.studentsSubmitted}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300">
                      {language === 'ar' ? 'مكتمل' : 'Complete'}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">0</div>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                    {language === 'ar' ? 'تسليمات كاملة' : 'complete submissions'}
                  </p>
                </Card>
              </div>

              {/* Capstone Content Preview */}
              <div className="bg-white/60 dark:bg-slate-900/40 border border-amber-300 dark:border-amber-600/30 rounded-xl p-6">
                <h5 className="font-bold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t.capstoneFeatures}
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'معلومات المشروع' : 'Project Info'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تحليل SWOT' : 'SWOT Analysis'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'خطة التسويق' : 'Marketing Plan'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'التوقعات المالية' : 'Financials'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'خطة العمليات' : 'Operations'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تقييم المخاطر' : 'Risk Assessment'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'الخطة التنفيذية' : 'Implementation'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-200 text-xs px-3 py-1">
                    {language === 'ar' ? '8 أقسام شاملة' : '8 Comprehensive Sections'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="bg-white dark:bg-[#1B1B3A]/80 border-purple-200 dark:border-[#4ECDC4]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.recentActivity}</h3>
              <Button variant="outline" size="sm" className="text-purple-600 dark:text-[#4ECDC4] border-purple-300 dark:border-[#4ECDC4]/30">
                {t.viewAll}
              </Button>
            </div>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-gray-600" />
              <p className="text-slate-500 dark:text-gray-500">{t.noActivity}</p>
            </div>
          </Card>
        </motion.div>

        {/* Quick Access Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t.quickLinks}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.05 }}
              >
                <Card
                  className={`${action.bgColor} border ${action.borderColor} p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all group text-center`}
                  onClick={action.action}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`font-bold text-sm ${action.textColor}`}>
                    {action.title}
                  </h4>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Level Detail Modal */}
      <LevelDetailModal
        isOpen={levelDetailOpen}
        onClose={() => setLevelDetailOpen(false)}
        level={levelData.find(l => l.id === selectedLevel) || null}
      />

      {/* Gradebook View */}
      <GradebookView
        isOpen={gradebookOpen}
        onClose={() => setGradebookOpen(false)}
      />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />

      {/* NEW: Structured Announcement Creation */}
      <AnnouncementCreation
        isOpen={announcementOpen}
        onClose={() => setAnnouncementOpen(false)}
      />

      {/* Capstone Preview Modal */}
      <CapstonePreviewModal
        isOpen={capstonePreviewOpen}
        onClose={() => setCapstonePreviewOpen(false)}
        language={language}
      />
    </div>
  );
}