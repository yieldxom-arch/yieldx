import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Crown,
  Settings,
  LogOut,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Shield,
  RefreshCw,
  Mail,
  Phone,
  AlertTriangle,
  ChevronDown,
  Activity,
  BookOpen,
  Star,
} from 'lucide-react';
import { motion as m, AnimatePresence } from 'motion/react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { SubscriptionModal } from '@/app/components/subscription/SubscriptionModal';
import { SettingsModal } from '@/app/components/settings/SettingsModal';

// ── Removed all MOCK data – dashboard starts empty for every new account ──────

type OrgTab = 'overview' | 'teachers' | 'analytics' | 'subscription' | 'settings-tab';

export function OrganizationDashboard() {
  const { user, logout, language } = useYieldX();
  const [activeTab, setActiveTab] = useState<OrgTab>('overview');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  // Start with an empty teachers list – real data comes from backend later
  const [teachers, setTeachers] = useState<{
    id: string; name: string; email: string; subject: string;
    students: number; status: 'active' | 'pending' | 'inactive'; joinedAt: string;
  }[]>([]);

  const isAr = language === 'ar';
  const isSubscribed = user?.subscriptionTier === 'enterprise';
  const subscriptionExpired = user?.subscriptionEndDate
    ? new Date(user.subscriptionEndDate) < new Date()
    : false;

  const orgName = user?.organizationName || (isAr ? 'مؤسستي' : 'My Organization');

  const handleApproveTeacher = (id: string) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status: 'active' as const } : t));
  };

  const handleRemoveTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const handleInviteTeacher = () => {
    if (!newTeacherEmail.trim()) return;
    setTeachers(prev => [...prev, {
      id: `t${Date.now()}`,
      name: newTeacherEmail.split('@')[0],
      email: newTeacherEmail,
      subject: isAr ? 'قيد التحديد' : 'TBD',
      students: 0,
      status: 'pending' as const,
      joinedAt: new Date().toISOString().split('T')[0],
    }]);
    setNewTeacherEmail('');
    setShowAddTeacher(false);
  };

  const tabs: { id: OrgTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',     label: isAr ? 'نظرة عامة'    : 'Overview',     icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'teachers',    label: isAr ? 'المعلمون'      : 'Teachers',     icon: <Users className="w-4 h-4" /> },
    { id: 'analytics',   label: isAr ? 'التحليلات'     : 'Analytics',    icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'subscription',label: isAr ? 'الاشتراك'      : 'Subscription', icon: <Crown className="w-4 h-4" /> },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50 dark:from-[#0F0F25] dark:via-[#1B1B3A] dark:to-[#0F1535]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* ── Animated Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-20 border-b border-purple-200 dark:border-purple-500/20 bg-white/80 dark:bg-[#1B1B3A]/80 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo + Org Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">YieldX</h1>
                <p className="text-xs text-purple-600 dark:text-purple-300 leading-tight">{orgName}</p>
              </div>
            </div>
            {/* Role badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-bold">
              <Building2 className="w-3 h-3" />
              {isAr ? 'حساب مؤسسة' : 'Organization'}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Subscription status */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              isSubscribed && !subscriptionExpired
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
            }`}>
              {isSubscribed && !subscriptionExpired ? (
                <><CheckCircle className="w-3 h-3" /> {isAr ? 'اشتراك نشط' : 'Active'}</>
              ) : (
                <><AlertTriangle className="w-3 h-3" /> {isAr ? 'اشترك الآن' : 'Subscribe'}</>
              )}
            </div>
            <SettingsModal />
            <Button
              variant="outline"
              onClick={logout}
              size="sm"
              className="bg-red-500/10 border-red-400/40 hover:bg-red-500/20 text-red-500 dark:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-1" />
              {isAr ? 'خروج' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="container mx-auto px-6 pb-0">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-purple-600 dark:border-purple-400 text-purple-700 dark:text-purple-300'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Subscription Expired Banner ── */}
      {isSubscribed && subscriptionExpired && (
        <div className="bg-amber-500 text-white px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            {isAr ? 'انتهى اشتراكك – بعض الميزات الإدارية محدودة حتى التجديد' : 'Subscription expired – Admin features limited until renewal'}
          </div>
          <Button size="sm" className="bg-white text-amber-700 hover:bg-amber-50 text-xs font-bold" onClick={() => setShowSubscriptionModal(true)}>
            <RefreshCw className="w-3 h-3 mr-1" />
            {isAr ? 'تجديد الآن' : 'Renew Now'}
          </Button>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ════════════ OVERVIEW TAB ════════════ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              {/* Welcome */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isAr ? `مرحباً، ${orgName} 👋` : `Welcome, ${orgName} 👋`}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {isAr ? 'نظرة عامة على نشاط مؤسستك في YieldX' : 'Overview of your organization activity on YieldX'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: isAr ? 'إجمالي الطلاب' : 'Total Students', value: 0, icon: <GraduationCap className="w-6 h-6" />, color: 'from-[#4ECDC4] to-[#7FDBCA]', textColor: 'text-[#4ECDC4]' },
                  { label: isAr ? 'المعلمون النشطون' : 'Active Teachers', value: teachers.filter(t => t.status === 'active').length, icon: <Users className="w-6 h-6" />, color: 'from-purple-500 to-indigo-500', textColor: 'text-purple-500' },
                  { label: isAr ? 'مشاريع مكتملة' : 'Completed Projects', value: 0, icon: <CheckCircle className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-500' },
                  { label: isAr ? 'متوسط التقدم' : 'Avg Progress', value: '0%', icon: <TrendingUp className="w-6 h-6" />, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-500' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-100 dark:border-purple-500/20 p-5 backdrop-blur-sm hover:shadow-lg transition-all">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                        {stat.icon}
                      </div>
                      <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* System Hierarchy Visualization */}
              <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-100 dark:border-purple-500/20 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  {isAr ? 'هرمية النظام' : 'System Hierarchy'}
                </h3>
                <div className="flex flex-col items-center gap-2">
                  {/* Org */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg w-full max-w-xs text-center justify-center">
                    <Building2 className="w-5 h-5" />
                    <span className="font-bold">{orgName}</span>
                    <span className="text-xs opacity-75">{isAr ? '(أنت)' : '(You)'}</span>
                  </div>
                  <div className="flex gap-8 text-slate-400 text-lg">↓</div>
                  {/* Teachers row */}
                  <div className="flex flex-wrap justify-center gap-3 w-full max-w-lg">
                    {teachers.filter(t => t.status === 'active').length === 0 ? (
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 text-slate-400 dark:text-slate-500 px-6 py-2 rounded-xl text-sm">
                        <Users className="w-4 h-4" />
                        {isAr ? 'لا يوجد معلمون بعد' : 'No teachers yet'}
                      </div>
                    ) : (
                      <>
                        {teachers.filter(t => t.status === 'active').slice(0, 3).map(t => (
                          <div key={t.id} className="flex items-center gap-2 bg-[#4ECDC4]/10 dark:bg-[#4ECDC4]/10 border border-[#4ECDC4]/40 text-slate-700 dark:text-[#4ECDC4] px-4 py-2 rounded-xl text-sm font-medium">
                            <Users className="w-4 h-4" />
                            {t.name.split(' ').slice(0, 2).join(' ')}
                          </div>
                        ))}
                        {teachers.filter(t => t.status === 'active').length > 3 && (
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-xl text-sm">
                            +{teachers.filter(t => t.status === 'active').length - 3} {isAr ? 'آخرون' : 'more'}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-8 text-slate-400 text-lg">↓</div>
                  {/* Students */}
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-6 py-2 rounded-xl text-sm font-medium">
                    <GraduationCap className="w-4 h-4" />
                    0 {isAr ? 'طالب' : 'Students'}
                  </div>
                </div>

                {/* Empty state callout */}
                {teachers.length === 0 && (
                  <div className="mt-5 p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-dashed border-purple-300 dark:border-purple-500/30 text-center">
                    <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">
                      {isAr
                        ? '🚀 ابدأ بدعوة معلمين لبناء مؤسستك التعليمية'
                        : '🚀 Start by inviting teachers to build your educational organization'}
                    </p>
                  </div>
                )}
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab('teachers')} className="group p-5 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-500/40 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all text-center">
                  <Plus className="w-7 h-7 text-purple-400 group-hover:text-purple-600 mx-auto mb-2 transition-colors" />
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{isAr ? 'إضافة معلم' : 'Add Teacher'}</p>
                </button>
                <button onClick={() => setActiveTab('analytics')} className="group p-5 rounded-2xl border-2 border-dashed border-[#4ECDC4]/40 dark:border-[#4ECDC4]/30 hover:border-[#4ECDC4] hover:bg-[#4ECDC4]/5 transition-all text-center">
                  <BarChart3 className="w-7 h-7 text-[#4ECDC4]/60 group-hover:text-[#4ECDC4] mx-auto mb-2 transition-colors" />
                  <p className="text-sm font-semibold text-[#4ECDC4]">{isAr ? 'عرض التحليلات' : 'View Analytics'}</p>
                </button>
                <button onClick={() => setShowSubscriptionModal(true)} className="group p-5 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all text-center">
                  <Crown className="w-7 h-7 text-amber-400 group-hover:text-amber-600 mx-auto mb-2 transition-colors" />
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{isAr ? 'إدارة الاشتراك' : 'Manage Plan'}</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════ TEACHERS TAB ════════════ */}
          {activeTab === 'teachers' && (
            <motion.div key="teachers" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isAr ? 'إدارة المعلمين' : 'Teacher Management'}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr ? 'أضف وأدر المعلمين المرتبطين بمؤسستك' : 'Add and manage teachers linked to your organization'}</p>
                </div>
                <Button
                  onClick={() => setShowAddTeacher(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  {isAr ? 'دعوة معلم' : 'Invite Teacher'}
                </Button>
              </div>

              {/* Add Teacher Form */}
              <AnimatePresence>
                {showAddTeacher && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card className="bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 p-5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{isAr ? 'دعوة معلم جديد' : 'Invite New Teacher'}</h4>
                      <div className="flex gap-3 flex-wrap">
                        <input
                          type="email"
                          value={newTeacherEmail}
                          onChange={e => setNewTeacherEmail(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleInviteTeacher()}
                          placeholder={isAr ? 'أدخل البريد الإلكتروني للمعلم...' : 'Enter teacher email...'}
                          className="flex-1 min-w-48 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-500/40 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          dir={isAr ? 'rtl' : 'ltr'}
                        />
                        <Button onClick={handleInviteTeacher} className="bg-purple-600 hover:bg-purple-700 text-white">
                          {isAr ? 'إرسال دعوة' : 'Send Invite'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddTeacher(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Teachers List */}
              <div className="space-y-3">
                {teachers.map((teacher, i) => (
                  <motion.div key={teacher.id} initial={{ opacity: 0, x: isAr ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-100 dark:border-purple-500/20 p-4 backdrop-blur-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                            {teacher.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{teacher.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {teacher.email}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-300 mt-0.5">{teacher.subject}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {teacher.students} {isAr ? 'طالب' : 'students'}
                          </div>
                          {/* Status badge */}
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            teacher.status === 'active'   ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                            teacher.status === 'pending'  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                            'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                          }`}>
                            {teacher.status === 'active'  ? (isAr ? '✅ نشط'    : '✅ Active')   :
                             teacher.status === 'pending' ? (isAr ? '⏳ معلق'   : '⏳ Pending')  :
                                                            (isAr ? '⛔ غير نشط' : '⛔ Inactive')}
                          </span>
                          {/* Actions */}
                          <div className="flex gap-2">
                            {teacher.status === 'pending' && (
                              <Button size="sm" onClick={() => handleApproveTeacher(teacher.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs">
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                {isAr ? 'موافقة' : 'Approve'}
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleRemoveTeacher(teacher.id)} className="border-red-300 dark:border-red-500/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 px-3 text-xs">
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              {isAr ? 'إزالة' : 'Remove'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                {teachers.length === 0 && (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>{isAr ? 'لا يوجد معلمون مرتبطون بعد' : 'No teachers linked yet'}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════ ANALYTICS TAB ════════════ */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isAr ? 'تحليلات المؤسسة' : 'Organization Analytics'}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr ? 'مراقبة نشاط الطلاب والمعلمين' : 'Monitor student and teacher activity'}</p>
              </div>

              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: isAr ? 'طلاب نشطون' : 'Active Students', value: 0, sub: `/ 0 ${isAr ? 'إجمالي' : 'total'}`, color: 'text-[#4ECDC4]' },
                  { label: isAr ? 'نمو شهري' : 'Monthly Growth', value: '+0%', sub: isAr ? 'مقارنة بالشهر الماضي' : 'vs last month', color: 'text-emerald-500' },
                  { label: isAr ? 'متوسط التقدم' : 'Avg Progress', value: '0%', sub: isAr ? 'عبر جميع المستويات' : 'across all levels', color: 'text-purple-500' },
                  { label: isAr ? 'مشاريع مكتملة' : 'Completed', value: 0, sub: isAr ? 'مشروع دراسة جدوى' : 'feasibility projects', color: 'text-amber-500' },
                ].map((kpi, i) => (
                  <Card key={i} className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-100 dark:border-purple-500/20 p-5 backdrop-blur-sm">
                    <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-white mt-1">{kpi.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
                  </Card>
                ))}
              </div>

              {/* Level Completion – empty state */}
              <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-100 dark:border-purple-500/20 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  {isAr ? 'معدل اكتمال المستويات' : 'Level Completion Rate'}
                </h3>
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <BarChart3 className="w-14 h-14 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {isAr ? 'لا توجد بيانات بعد' : 'No data yet'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                    {isAr
                      ? 'ستظهر هنا إحصاءات اكتمال المستويات بمجرد بدء الطلاب في التعلم'
                      : 'Level completion statistics will appear here once students start learning'}
                  </p>
                </div>
              </Card>

              {/* Teacher Performance – empty state */}
              <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-100 dark:border-purple-500/20 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  {isAr ? 'أداء المعلمين' : 'Teacher Performance'}
                </h3>
                {teachers.filter(t => t.status === 'active').length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                    <Users className="w-14 h-14 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      {isAr ? 'لا يوجد معلمون نشطون' : 'No active teachers yet'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                      {isAr
                        ? 'أضف معلمين من تبويب "المعلمون" لعرض أدائهم هنا'
                        : 'Add teachers from the Teachers tab to see their performance here'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('teachers')}
                      className="mt-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isAr ? 'إضافة معلم الآن' : 'Add Teacher Now'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teachers.filter(t => t.status === 'active').map((t, i) => (
                      <div key={t.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{t.name}</span>
                            <span className="text-slate-400">{t.students} {isAr ? 'طالب' : 'students'}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full">
                            <div className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] rounded-full" style={{ width: `${Math.min((t.students / 60) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* ════════════ SUBSCRIPTION TAB ════════════ */}
          {activeTab === 'subscription' && (
            <motion.div key="subscription" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isAr ? 'إدارة الاشتراك' : 'Subscription Management'}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr ? 'خطة المؤسسات – اشتراك واحد شامل' : 'Organization Plan – one comprehensive subscription'}</p>
              </div>

              {/* Current Status Card */}
              <Card className={`p-6 border-2 ${
                isSubscribed && !subscriptionExpired
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40'
                  : 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40'
              }`}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    isSubscribed && !subscriptionExpired
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-br from-amber-500 to-orange-500'
                  }`}>
                    {isSubscribed && !subscriptionExpired
                      ? <CheckCircle className="w-7 h-7 text-white" />
                      : <AlertTriangle className="w-7 h-7 text-white" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-lg">
                      {isSubscribed && !subscriptionExpired
                        ? (isAr ? '✅ الاشتراك نشط' : '✅ Subscription Active')
                        : (isAr ? '⚠️ لا يوجد اشتراك نشط' : '⚠️ No Active Subscription')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {isSubscribed && !subscriptionExpired && user?.subscriptionEndDate
                        ? `${isAr ? 'تنتهي في:' : 'Expires:'} ${new Date(user.subscriptionEndDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}`
                        : (isAr ? 'اشترك للحصول على كامل صلاحيات إدارة المؤسسة' : 'Subscribe to unlock full organization management')}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowSubscriptionModal(true)}
                    className={`${
                      isSubscribed && !subscriptionExpired
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    } text-white font-bold shadow-lg`}
                  >
                    {isSubscribed && !subscriptionExpired
                      ? (isAr ? 'تجديد / تعديل' : 'Renew / Modify')
                      : (isAr ? 'اشترك الآن' : 'Subscribe Now')}
                  </Button>
                </div>
              </Card>

              {/* Features unlocked */}
              <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-100 dark:border-purple-500/20 p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">{isAr ? 'ما يشمله الاشتراك:' : 'What\'s included:'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    isAr ? 'إدارة معلمين غير محدودين' : 'Unlimited teacher management',
                    isAr ? 'حسابات طلاب غير محدودة' : 'Unlimited student accounts',
                    isAr ? 'لوحة تحليلات المؤسسة' : 'Organization analytics dashboard',
                    isAr ? 'لوحة التحكم الإدارية' : 'Administrative control panel',
                    isAr ? 'علامة تجارية مخصصة' : 'Custom branding & white-label',
                    isAr ? 'مدير حساب مخصص' : 'Dedicated account manager',
                    isAr ? 'دعم هاتف ودردشة 24/7' : '24/7 phone & chat support',
                    isAr ? 'أمان متقدم و SSO' : 'Advanced security & SSO',
                    isAr ? 'جلسات تدريب مخصصة' : 'Custom training sessions',
                    isAr ? 'ضمان SLA' : 'SLA guarantee',
                  ].map((feat, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${isSubscribed && !subscriptionExpired ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                      {isSubscribed && !subscriptionExpired
                        ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <Shield className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />}
                      {feat}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment info */}
              <Card className="bg-white/80 dark:bg-[#1B1B3A]/80 border-purple-100 dark:border-purple-500/20 p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{isAr ? 'إدارة الدفع' : 'Payment Management'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{isAr ? 'جميع المدفوعات آمنة ومشفرة' : 'All payments are secure & encrypted'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {isAr ? 'سجل المدفوعات' : 'Payment History'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5" />
                      {isAr ? 'تواصل مع الدعم' : 'Contact Support'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
}