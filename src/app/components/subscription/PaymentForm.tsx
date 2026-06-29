import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle, CheckCircle2, Mail, User, ClipboardList, Calendar, FileText } from 'lucide-react';
import type { SubscriptionTier } from '@/app/contexts/YieldXContext';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { supabase as sbClient } from '/utils/supabase/client';

interface PaymentFormProps {
  selectedPlan: SubscriptionTier;
  planPrice: number;
  planName: string;
  planNameAr: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function PaymentForm({
  selectedPlan,
  planPrice,
  planName,
  planNameAr,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const { user, language } = useYieldX();
  const isAr = language === 'ar';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialName = useMemo(() => user?.name || '', [user?.name]);
  const initialEmail = useMemo(() => user?.email || '', [user?.email]);

  const [formData, setFormData] = useState({
    full_name: initialName,
    email: initialEmail,
    note: '',
    requested_plan: selectedPlan,
  });

  const autoNotePlaceholder = isAr
    ? `مثال: دفعت عبر التحويل البنكي بتاريخ ${new Date().toLocaleDateString('ar-SA')} (Transaction Ref: XXX123)`
    : `Example: paid via bank transfer on ${new Date().toLocaleDateString('en-US')} (Transaction Ref: XXX123)`;

  const validate = () => {
    const next: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      next.full_name = isAr ? 'الاسم مطلوب' : 'Name is required';
    }
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      next.email = isAr ? 'البريد الإلكتروني غير صحيح' : 'Valid email is required';
    }
    if (!formData.note.trim() || formData.note.trim().length < 8) {
      next.note = isAr ? 'ملاحظة الدفع مطلوبة (يفضل ذكر رقم العملية/التاريخ)' : 'Payment note is required (include reference/date)';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await sbClient.from('upgrade_requests').insert({
        user_id: user.id,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        requested_plan: selectedPlan,
        note: formData.note.trim(),
        status: 'pending',
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrors({
        form: isAr ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.',
      });
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.15 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {isAr ? 'تم إرسال طلب الترقيـة' : 'Upgrade request submitted'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isAr ? 'سيتم اعتماد حسابك يدويًا خلال 24 ساعة.' : 'Your account will be manually approved within 24 hours.'}
        </p>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-[#4ECDC4] border-t-transparent rounded-full mx-auto"
        />
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl={isAr ? 'rtl' : 'ltr'}">
      {/* Order Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-[#1B1B3A]/50 dark:to-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl p-4">
        <h3 className="text-slate-900 dark:text-white font-semibold mb-3">{isAr ? 'ملخص الترقيـة' : 'Upgrade Summary'}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 dark:text-gray-400">{isAr ? 'الخطة' : 'Plan'}:</span>
          <span className="text-slate-900 dark:text-white font-semibold">{isAr ? planNameAr : planName}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 dark:text-gray-400">{isAr ? 'المدة' : 'Billing'}:</span>
          <span className="text-slate-900 dark:text-white">{isAr ? 'شهرياً' : 'Monthly'}</span>
        </div>
        <div className="border-t border-purple-200 dark:border-[#4ECDC4]/20 mt-3 pt-3 flex justify-between items-center">
          <span className="text-slate-900 dark:text-white font-bold">{isAr ? 'المجموع' : 'Total'}:</span>
          <span className="text-2xl font-bold text-[#4ECDC4]">{planPrice} ر.ع</span>
        </div>
      </div>

      {/* Manual Approval Info */}
      <div className="bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 rounded-lg p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#4ECDC4] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-900 dark:text-white text-sm font-semibold mb-1">
            {isAr ? 'ترقية يدويّة عبر تحويل بنكي' : 'Manual upgrade via bank transfer'}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
            {isAr ? (
              <>
                للترقية: قم بتحويل مبلغ الترقيـة عبر <span className="font-semibold">[طريقة الدفع - قابلة للتعديل]</span>، ثم سيتم اعتماد حسابك يدويًا خلال 24 ساعة.
              </>
            ) : (
              <>
                To upgrade, transfer payment via <span className="font-semibold">[payment method - placeholder]</span>, then your account will be manually approved within 24 hours.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Collect user details + payment note */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              {isAr ? 'الاسم' : 'Full name'}
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
              className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${errors.full_name ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'} rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
              placeholder={isAr ? 'اكتب اسمك' : 'Enter your name'}
            />
            {errors.full_name && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.full_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {isAr ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${errors.email ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'} rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
              placeholder={isAr ? 'example@email.com' : 'example@email.com'}
            />
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.email}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            {isAr ? 'ملاحظة الدفع / رقم العملية' : 'Payment note / transaction reference'}
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
            className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${errors.note ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'} rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors min-h-[110px]`}
            placeholder={autoNotePlaceholder}
          />
          {errors.note && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.note}
            </p>
          )}
        </div>

        {errors.form && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-500">{errors.form}</p>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 rounded-lg p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-[#4ECDC4] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-900 dark:text-white text-sm font-semibold mb-1">
            {isAr ? 'مراجعة يدوية — لا يوجد دفع لحظي' : 'Manual review — no instant payment'}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
            {isAr ? (
              <>لن يتم تفعيل الترقية فورًا. بعد إرسال الطلب، سيتم اعتماد حسابك يدويًا خلال 24 ساعة بعد التحقق من الملاحظة.</>
            ) : (
              <>Upgrades are not activated instantly. After submitting, your request will be manually reviewed within 24 hours.</>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-500/20 hover:bg-gray-300 dark:hover:bg-gray-500/30 border border-gray-300 dark:border-gray-500/30 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-[#4ECDC4]/50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              {isAr ? 'جارٍ الإرسال...' : 'Submitting...'}
            </span>
          ) : (
            isAr ? `إرسال طلب الترقيـة` : `Submit upgrade request`
          )}
        </button>
      </div>
    </form>
  );
}

