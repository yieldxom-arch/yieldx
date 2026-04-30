import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Check,
  Zap,
  Shield,
  Sparkles,
  X,
  Building2,
  ArrowLeft,
  GraduationCap,
  Users,
  ChevronRight,
  Star,
  Lock,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { SUBSCRIPTION_PLANS } from '@/app/data/subscriptionData';
import { PaymentForm } from './PaymentForm';
import type { SubscriptionTier } from '@/app/contexts/YieldXContext';

interface SubscriptionModalProps {
  onClose: () => void;
}

type ViewMode = 'audience' | 'student-plans' | 'org-plan' | 'payment';

export function SubscriptionModal({ onClose }: SubscriptionModalProps) {
  const { user, updateUser, language } = useYieldX();

  // If the user is an org, skip audience selection — go straight to org plan
  const initialView: ViewMode = user?.role === 'organization' ? 'org-plan' : 'audience';
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);

  const isAr = language === 'ar';
  const currentTier = user?.subscriptionTier || 'free';

  const studentPlans = SUBSCRIPTION_PLANS.filter(p => p.id === 'free' || p.id === 'premium');
  const orgPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'enterprise')!;
  const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === 'free') {
      updateUser({
        subscriptionTier: tier,
        subscriptionStartDate: new Date().toISOString(),
        subscriptionEndDate: '',
        maxProjects: 1,
      });
      onClose();
    } else {
      setSelectedPlan(tier);
      setViewMode('payment');
    }
  };

  const handlePaymentSuccess = () => {
    if (selectedPlan) {
      updateUser({
        subscriptionTier: selectedPlan,
        subscriptionStartDate: new Date().toISOString(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        maxProjects: selectedPlan === 'free' ? 1 : -1,
      });
      onClose();
    }
  };

  const handlePaymentCancel = () => {
    setSelectedPlan(null);
    setViewMode(viewMode === 'payment' ? 'student-plans' : 'audience');
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return <Sparkles className="w-7 h-7" />;
      case 'premium': return <Crown className="w-7 h-7" />;
      case 'enterprise': return <Building2 className="w-7 h-7" />;
    }
  };

  const getTierGradient = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return 'from-slate-500 to-slate-600';
      case 'premium': return 'from-[#4ECDC4] to-[#7FDBCA]';
      case 'enterprise': return 'from-purple-600 to-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="w-full h-full flex items-center justify-center overflow-y-auto py-8">
        <AnimatePresence mode="wait">

          {/* ── PAYMENT ── */}
          {viewMode === 'payment' && selectedPlanData ? (
            <motion.div
              key="payment"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-gradient-to-br dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] border border-purple-200 dark:border-[#4ECDC4]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="relative p-6 border-b border-purple-200 dark:border-[#4ECDC4]/20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-transparent dark:to-transparent">
                <button
                  onClick={handlePaymentCancel}
                  className="absolute left-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-100 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
                  {isAr ? 'إتمام الدفع' : 'Complete Payment'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center text-sm mt-1">
                  {isAr ? `خطة ${selectedPlanData.nameAr}` : `${selectedPlanData.name} Plan`}
                </p>
              </div>
              <div className="p-6">
                <PaymentForm
                  selectedPlan={selectedPlanData.id}
                  planPrice={selectedPlanData.price}
                  planName={selectedPlanData.name}
                  planNameAr={selectedPlanData.nameAr}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </div>
            </motion.div>

          ) : viewMode === 'audience' ? (
            /* ── AUDIENCE SELECTOR ── */
            <motion.div
              key="audience"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-gradient-to-br dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] border border-purple-200 dark:border-[#4ECDC4]/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-8 border-b border-purple-200 dark:border-[#4ECDC4]/20 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-transparent dark:to-transparent text-center">
                <button
                  onClick={onClose}
                  className="absolute left-5 top-5 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-100 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] rounded-2xl mb-4 shadow-lg"
                >
                  <Crown className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4ECDC4] via-[#7FDBCA] to-[#4ECDC4] bg-clip-text text-transparent mb-2">
                  {isAr ? 'خطط YieldX' : 'YieldX Plans'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {isAr ? 'اختر نوع حسابك للمتابعة' : 'Choose your account type to continue'}
                </p>
              </div>

              {/* Audience Cards */}
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Student Card */}
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => setViewMode('student-plans')}
                  className="group relative flex flex-col items-center text-center p-7 rounded-2xl border-2 border-[#4ECDC4]/40 dark:border-[#4ECDC4]/30 hover:border-[#4ECDC4] bg-gradient-to-br from-[#4ECDC4]/5 to-[#7FDBCA]/5 hover:from-[#4ECDC4]/15 hover:to-[#7FDBCA]/15 transition-all shadow-md hover:shadow-xl hover:shadow-[#4ECDC4]/20 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4ECDC4] to-[#7FDBCA] rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {isAr ? '👩‍🎓 الطلاب' : '👩‍🎓 Students'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {isAr ? 'خطتان: عادي ● برو' : 'Two plans: Normal ● Pro'}
                  </p>
                  <div className="flex items-center gap-1 text-[#4ECDC4] text-sm font-semibold">
                    {isAr ? 'عرض الخطط' : 'View Plans'}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  {(currentTier === 'free' || currentTier === 'premium') && (
                    <span className="absolute -top-3 right-3 bg-[#4ECDC4] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {isAr ? 'خطتك الحالية' : 'Your current'}
                    </span>
                  )}
                </motion.button>

                {/* Organization Card */}
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  onClick={() => setViewMode('org-plan')}
                  className="group relative flex flex-col items-center text-center p-7 rounded-2xl border-2 border-purple-400/40 dark:border-purple-500/30 hover:border-purple-500 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 hover:from-purple-500/15 hover:to-indigo-500/15 transition-all shadow-md hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {isAr ? '🏢 المؤسسات' : '🏢 Organizations'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {isAr ? 'خطة واحدة شاملة للمؤسسة' : 'One comprehensive plan'}
                  </p>
                  <div className="flex items-center gap-1 text-purple-500 text-sm font-semibold">
                    {isAr ? 'عرض الخطة' : 'View Plan'}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  {currentTier === 'enterprise' && (
                    <span className="absolute -top-3 right-3 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {isAr ? 'خطتك الحالية' : 'Your current'}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Security note */}
              <div className="px-8 pb-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Shield className="w-3.5 h-3.5 text-[#4ECDC4]" />
                <span>{isAr ? 'جميع المدفوعات آمنة ومشفرة' : 'All payments are secure and encrypted'}</span>
              </div>
            </motion.div>

          ) : viewMode === 'student-plans' ? (
            /* ── STUDENT PLANS ── */
            <motion.div
              key="student-plans"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-gradient-to-br dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] border border-purple-200 dark:border-[#4ECDC4]/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="relative p-7 border-b border-purple-200 dark:border-[#4ECDC4]/20 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-transparent dark:to-transparent text-center">
                <button
                  onClick={() => setViewMode('audience')}
                  className="absolute left-5 top-5 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-100 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={onClose}
                  className="absolute right-5 top-5 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-100 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#4ECDC4] to-[#7FDBCA] rounded-xl mb-3 shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isAr ? 'خطط الطلاب' : 'Student Plans'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {isAr ? 'اختر الخطة المناسبة لاحتياجاتك' : 'Choose the plan that suits your needs'}
                </p>
              </div>

              {/* Current plan banner */}
              {(currentTier === 'free' || currentTier === 'premium') && (
                <div className="mx-6 mt-5 p-3 bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#4ECDC4] rounded-lg flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {isAr ? 'خطتك الحالية:' : 'Current plan:'}
                      <span className="text-[#4ECDC4] mr-1">
                        {currentTier === 'free' ? (isAr ? ' عادي' : ' Normal') : (isAr ? ' برو' : ' Pro')}
                      </span>
                    </p>
                    {user?.subscriptionEndDate && currentTier !== 'free' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isAr ? 'تنتهي في:' : 'Expires:'} {new Date(user.subscriptionEndDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Plan Cards */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {studentPlans.map((plan, index) => {
                  const isCurrentPlan = plan.id === currentTier;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative bg-white dark:bg-[#1B1B3A]/60 border-2 rounded-2xl p-6 flex flex-col transition-all shadow-lg ${
                        plan.popular
                          ? 'border-[#4ECDC4] shadow-[#4ECDC4]/20 scale-[1.02]'
                          : isCurrentPlan
                          ? 'border-[#4ECDC4]/70 ring-2 ring-[#4ECDC4]/30'
                          : 'border-slate-200 dark:border-white/10 hover:border-[#4ECDC4]/50'
                      }`}
                    >
                      {/* Popular badge */}
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <div className="bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg whitespace-nowrap">
                            <Star className="w-3 h-3" fill="currentColor" />
                            {isAr ? 'الأكثر شعبية' : 'Most Popular'}
                          </div>
                        </div>
                      )}
                      {isCurrentPlan && !plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <div className="bg-[#4ECDC4] text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg whitespace-nowrap">
                            <Check className="w-3 h-3" />
                            {isAr ? 'خطتك الحالية' : 'Current Plan'}
                          </div>
                        </div>
                      )}

                      {/* Plan header */}
                      <div className="text-center mb-5">
                        <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getTierGradient(plan.id)} rounded-xl mb-3 shadow-md`}>
                          <div className="text-white">{getTierIcon(plan.id)}</div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {isAr ? plan.nameAr : plan.name}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                          <span className="text-gray-400 text-sm">{isAr ? plan.currencyAr : plan.currency}</span>
                          <span className="text-gray-400 text-sm">/ {isAr ? plan.billingPeriodAr : plan.billingPeriod}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {(isAr ? plan.featuresAr : plan.features).map((feat, fi) => (
                          <li key={fi} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                            <div className="w-4 h-4 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center mt-0.5 shrink-0">
                              <Check className="w-2.5 h-2.5 text-[#4ECDC4]" />
                            </div>
                            {feat}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <button
                        onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                        disabled={isCurrentPlan}
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                          isCurrentPlan
                            ? 'bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] text-white hover:shadow-lg hover:shadow-[#4ECDC4]/30 hover:scale-[1.02]'
                            : 'border-2 border-[#4ECDC4]/40 text-[#4ECDC4] hover:bg-[#4ECDC4]/10'
                        }`}
                      >
                        {isCurrentPlan
                          ? (isAr ? 'الخطة الحالية' : 'Current Plan')
                          : plan.id === 'free'
                          ? (isAr ? 'استخدام المجاني' : 'Use Free Plan')
                          : (isAr ? 'ترقية إلى برو ⚡' : 'Upgrade to Pro ⚡')}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5 text-[#4ECDC4]" />
                <span>{isAr ? 'جميع المدفوعات آمنة ومشفرة • إلغاء في أي وقت' : 'All payments secure & encrypted • Cancel anytime'}</span>
              </div>
            </motion.div>

          ) : viewMode === 'org-plan' ? (
            /* ── ORGANIZATION PLAN ── */
            <motion.div
              key="org-plan"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-gradient-to-br dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] border border-purple-300 dark:border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="relative p-7 border-b border-purple-200 dark:border-purple-500/20 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-500/5 dark:to-indigo-500/5 text-center">
                <button
                  onClick={() => setViewMode('audience')}
                  className="absolute left-5 top-5 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-100 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-purple-500/20 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={onClose}
                  className="absolute right-5 top-5 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-100 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-purple-500/20 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-3 shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isAr ? 'خطة المؤسسات' : 'Organization Plan'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {isAr ? 'خطة واحدة شاملة تفتح جميع ميزات الإدارة' : 'One comprehensive plan unlocking all management features'}
                </p>
              </div>

              {/* Org Plan Flow */}
              <div className="p-7">
                {/* Step-by-step flow */}
                <div className="mb-7">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    {isAr ? 'كيف يعمل اشتراك المؤسسة:' : 'How the Organization subscription works:'}
                  </p>
                  <div className="space-y-3">
                    {[
                      { step: '1', ar: 'تنشئ المؤسسة حسابها', en: 'Organization creates an account' },
                      { step: '2', ar: 'تشترك في الخطة الوحيدة المتاحة', en: 'Subscribes to the single available plan' },
                      { step: '3', ar: 'تتم عملية الدفع', en: 'Payment is completed' },
                      { step: '4', ar: 'يصبح الاشتراك نشطاً فوراً', en: 'Subscription becomes active immediately' },
                      { step: '5', ar: 'تحصل على إدارة المعلمين + التحليلات + لوحة التحكم', en: 'Access: Manage teachers + Analytics + Admin panel' },
                    ].map(item => (
                      <div key={item.step} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-white text-xs font-bold">{item.step}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{isAr ? item.ar : item.en}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Card */}
                <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 border-2 border-purple-400 dark:border-purple-500/50 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
                  {/* Single plan badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                      <Shield className="w-3 h-3" />
                      {isAr ? 'الخطة الوحيدة للمؤسسات' : 'Single Organization Plan'}
                    </div>
                  </div>

                  <div className="text-center mt-2 mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {isAr ? orgPlan.nameAr : orgPlan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-purple-700 dark:text-purple-300">{orgPlan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400">{isAr ? orgPlan.currencyAr : orgPlan.currency}</span>
                      <span className="text-gray-500 dark:text-gray-400">/ {isAr ? orgPlan.billingPeriodAr : orgPlan.billingPeriod}</span>
                    </div>
                  </div>

                  {/* Features grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                    {(isAr ? orgPlan.featuresAr : orgPlan.features).map((feat, fi) => (
                      <div key={fi} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Check className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        {feat}
                      </div>
                    ))}
                  </div>

                  {/* Expiry note */}
                  <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {isAr
                        ? 'عند انتهاء الاشتراك: يتم تقييد الوصول إلى ميزات المؤسسة حتى التجديد.'
                        : 'When subscription expires: Access to organization features is limited until renewal.'}
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => currentTier !== 'enterprise' && handleUpgrade('enterprise')}
                    disabled={currentTier === 'enterprise'}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                      currentTier === 'enterprise'
                        ? 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]'
                    }`}
                  >
                    {currentTier === 'enterprise'
                      ? (isAr ? 'مشترك حالياً ✓' : 'Currently Subscribed ✓')
                      : (isAr ? 'اشترك الآن للمؤسسة' : 'Subscribe for Organization')}
                  </button>
                </div>

                {/* Teacher note */}
                <div className="mt-5 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-start gap-2.5 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
                  <span>
                    {isAr
                      ? 'المعلمون: لا يحتاجون إلى اشتراك مستقل — يتم ربطهم تلقائياً تحت المؤسسة.'
                      : 'Teachers: Do not need a separate subscription — they are automatically linked under the Organization.'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 pb-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>{isAr ? 'جميع المدفوعات آمنة ومشفرة' : 'All payments are secure and encrypted'}</span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}