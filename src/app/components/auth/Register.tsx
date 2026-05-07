import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, Users, GraduationCap, Eye, EyeOff, Building2 } from 'lucide-react';
import { useYieldX, UserRole } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';

interface RegisterProps {
  onSuccess: (email: string, password: string, role: UserRole) => void;
  onBackToLogin: () => void;
}

export function Register({ onSuccess, onBackToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    securityQuestion: '',
    securityAnswer: '',
    organizationName: '',
    organizationType: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const securityQuestions = [
    'ما هو اسم مدينتك الأصلية؟',
    'ما هو اسم مدرستك الابتدائية؟',
    'ما هو طعامك المفضل؟',
    'ما هو اسم حيوانك الأليف الأول؟',
    'ما هو لونك المفضل؟',
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('الرجاء إدخال الاسم الكامل');
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('الرجاء إدخال بريد إلكتروني صحيح');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return false;
    }

    if (!formData.securityQuestion) {
      toast.error('الرجاء اختيار سؤال الأمان');
      return false;
    }

    if (!formData.securityAnswer.trim()) {
      toast.error('الرجاء إدخال إجابة سؤال الأمان');
      return false;
    }

    if (formData.role === 'organization' && !formData.organizationName.trim()) {
      toast.error('الرجاء إدخال اسم المؤسسة');
      return false;
    }

    return true;
  };

  const { register } = useYieldX();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await register(formData.email, formData.password, formData.name, formData.role);
    if (!success) {
      toast.error('فشل إنشاء الحساب. يرجى التحقق من البريد الإلكتروني وكلمة المرور والمحاولة مرة أخرى.');
      return;
    }

    toast.success('تم إنشاء الحساب بنجاح! 🎉');
    setTimeout(() => {
      onSuccess(formData.email, formData.password, formData.role);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <Card className="bg-white/95 dark:bg-[#1B1B3A]/95 backdrop-blur-2xl border border-purple-200 dark:border-[#4ECDC4]/30 shadow-2xl shadow-purple-500/10 dark:shadow-[#4ECDC4]/20 p-8 rounded-3xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-[#4ECDC4]/20 dark:to-[#7FDBCA]/20 border border-purple-300 dark:border-[#4ECDC4]/30 mb-4">
            <UserPlus className="w-8 h-8 text-purple-600 dark:text-[#4ECDC4]" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">إنشاء حساب جديد</h2>
          <p className="text-purple-600 dark:text-[#7FDBCA]/80 text-sm">انضم إلى رحلة النجاح الريادي</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-slate-900 dark:text-white text-sm text-right block font-semibold">الاسم الكامل</label>
            <div className="relative group">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 dark:text-[#7FDBCA]/60 group-focus-within:text-purple-600 dark:group-focus-within:text-[#4ECDC4] transition-colors" />
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="pr-12 text-right bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 rounded-xl h-12 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20"
                placeholder="محمد أحمد"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-slate-900 dark:text-white text-sm text-right block font-semibold">البريد الإلكتروني</label>
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 dark:text-[#7FDBCA]/60 group-focus-within:text-purple-600 dark:group-focus-within:text-[#4ECDC4] transition-colors" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="pr-12 text-right bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 rounded-xl h-12 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-slate-900 dark:text-white text-sm mb-3 text-right block font-semibold">نوع الحساب</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={formData.role === 'student' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-4 h-auto rounded-2xl transition-all duration-300 ${
                  formData.role === 'student'
                    ? 'bg-gradient-to-br from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] text-white border-purple-600 dark:border-[#4ECDC4] shadow-lg shadow-purple-500/30 dark:shadow-[#4ECDC4]/30 scale-105'
                    : 'bg-purple-50/50 dark:bg-white/5 border-purple-300 dark:border-[#4ECDC4]/20 hover:bg-purple-100 dark:hover:bg-[#4ECDC4]/10 hover:border-purple-400 dark:hover:border-[#4ECDC4]/40 text-purple-700 dark:text-[#7FDBCA] hover:scale-105'
                }`}
                onClick={() => handleChange('role', 'student')}
              >
                <GraduationCap className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-bold">طالب</span>
                <span className="text-[10px] opacity-75 mt-0.5">Student</span>
              </Button>
              <Button
                type="button"
                variant={formData.role === 'lecturer' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-4 h-auto rounded-2xl transition-all duration-300 ${
                  formData.role === 'lecturer'
                    ? 'bg-gradient-to-br from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] text-white border-purple-600 dark:border-[#4ECDC4] shadow-lg shadow-purple-500/30 dark:shadow-[#4ECDC4]/30 scale-105'
                    : 'bg-purple-50/50 dark:bg-white/5 border-purple-300 dark:border-[#4ECDC4]/20 hover:bg-purple-100 dark:hover:bg-[#4ECDC4]/10 hover:border-purple-400 dark:hover:border-[#4ECDC4]/40 text-purple-700 dark:text-[#7FDBCA] hover:scale-105'
                }`}
                onClick={() => handleChange('role', 'lecturer')}
              >
                <Users className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-bold">مُدرّس</span>
                <span className="text-[10px] opacity-75 mt-0.5">Teacher</span>
              </Button>
              <Button
                type="button"
                variant={formData.role === 'organization' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-4 h-auto rounded-2xl transition-all duration-300 ${
                  formData.role === 'organization'
                    ? 'bg-gradient-to-br from-purple-700 to-indigo-600 text-white border-purple-700 shadow-lg shadow-purple-600/30 scale-105'
                    : 'bg-purple-50/50 dark:bg-white/5 border-purple-300 dark:border-[#4ECDC4]/20 hover:bg-purple-100 dark:hover:bg-[#4ECDC4]/10 hover:border-purple-400 dark:hover:border-[#4ECDC4]/40 text-purple-700 dark:text-[#7FDBCA] hover:scale-105'
                }`}
                onClick={() => handleChange('role', 'organization')}
              >
                <Building2 className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-bold">مؤسسة</span>
                <span className="text-[10px] opacity-75 mt-0.5">Org</span>
              </Button>
            </div>
          </div>

          {/* Organization-specific fields */}
          {formData.role === 'organization' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl text-xs text-purple-700 dark:text-purple-300 text-right">
                🏢 ستحصل على لوحة تحكم مؤسسية كاملة لإدارة المعلمين والطلاب
              </div>
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm text-right block font-semibold">اسم المؤسسة *</label>
                <div className="relative group">
                  <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 dark:text-[#7FDBCA]/60" />
                  <Input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleChange('organizationName', e.target.value)}
                    className="pr-12 text-right bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] rounded-xl h-12"
                    placeholder="جامعة / شركة / معهد..."
                    required={formData.role === 'organization'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm text-right block font-semibold">نوع المؤسسة</label>
                <select
                  value={formData.organizationType}
                  onChange={(e) => handleChange('organizationType', e.target.value)}
                  className="w-full pr-4 pl-4 text-right bg-purple-50/50 dark:bg-white/5 border border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white rounded-xl h-12 focus:outline-none focus:border-purple-500 dark:focus:border-[#4ECDC4]"
                  dir="rtl"
                >
                  <option value="">اختر نوع المؤسسة</option>
                  <option value="university">جامعة</option>
                  <option value="school">مدرسة</option>
                  <option value="institute">معهد تدريب</option>
                  <option value="company">شركة</option>
                  <option value="government">جهة حكومية</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <label className="text-slate-900 dark:text-white text-sm text-right block font-semibold">كلمة المرور</label>
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 dark:text-[#7FDBCA]/60 group-focus-within:text-purple-600 dark:group-focus-within:text-[#4ECDC4] transition-colors" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="pr-12 pl-12 text-right bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 rounded-xl h-12 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 dark:text-[#7FDBCA]/60 hover:text-purple-600 dark:hover:text-[#4ECDC4] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-slate-900 dark:text-white text-sm text-right block font-semibold">تأكيد كلمة المرور</label>
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 dark:text-[#7FDBCA]/60 group-focus-within:text-purple-600 dark:group-focus-within:text-[#4ECDC4] transition-colors" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="pr-12 pl-12 text-right bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 rounded-xl h-12 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 dark:text-[#7FDBCA]/60 hover:text-purple-600 dark:hover:text-[#4ECDC4] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Security Question */}
          <div className="space-y-2">
            <label className="text-slate-900 dark:text-white text-sm text-right block font-semibold">سؤال الأمان (لاستعادة كلمة المرور)</label>
            <select
              value={formData.securityQuestion}
              onChange={(e) => handleChange('securityQuestion', e.target.value)}
              className="w-full p-3 text-right bg-purple-50/50 dark:bg-white/5 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl text-slate-900 dark:text-white focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20 h-12"
              required
            >
              <option value="" className="bg-white dark:bg-[#1B1B3A]">اختر سؤالاً</option>
              {securityQuestions.map((q) => (
                <option key={q} value={q} className="bg-white dark:bg-[#1B1B3A]">
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Security Answer */}
          <div className="space-y-2">
            <label className="text-slate-900 dark:text-white text-sm text-right block font-semibold">إجابة سؤال الأمان</label>
            <Input
              type="text"
              value={formData.securityAnswer}
              onChange={(e) => handleChange('securityAnswer', e.target.value)}
              className="text-right bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 rounded-xl h-12 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20"
              placeholder="أدخل الإجابة"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] hover:from-purple-700 hover:to-cyan-700 dark:hover:from-[#5DD9C1] dark:hover:to-[#4ECDC4] text-white font-bold shadow-xl shadow-purple-500/30 dark:shadow-[#4ECDC4]/30 hover:shadow-2xl hover:shadow-purple-500/40 dark:hover:shadow-[#4ECDC4]/40 rounded-xl h-12 text-base transition-all duration-300 hover:scale-[1.02] mt-6"
          >
            إنشاء الحساب
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 text-slate-500 dark:text-white/50 bg-white dark:bg-[#1B1B3A]">أو</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onBackToLogin}
            className="w-full text-purple-700 dark:text-[#7FDBCA] hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5 border border-purple-300 dark:border-[#7FDBCA]/30 hover:border-purple-400 dark:hover:border-[#4ECDC4]/50 rounded-xl h-12 font-semibold transition-all duration-300"
          >
            لديك حساب؟ تسجيل الدخول
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}