import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Users, GraduationCap, Rocket, Globe, Building2 } from 'lucide-react';
import type { UserRole } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';

type Language = 'ar' | 'en';

interface LoginProps {
  onLogin: (email: string, password: string, role: UserRole) => void;
  onRegister: () => void;
  onForgotPassword: () => void;
}

export function Login({ onLogin, onRegister, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [language, setLanguage] = useState<Language>('ar');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, selectedRole);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = {
    ar: {
      welcomeBack: 'مرحباً بعودتك',
      tagline: 'ابدأ رحلتك نحو النجاح الريادي',
      selectAccount: 'اختر نوع الحساب',
      student: 'طالب',
      teacher: 'مُدرّس',
      organization: 'مؤسسة',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      startJourney: 'ابدأ الرحلة',
      or: 'أو',
      noAccount: 'ليس لديك حساب؟ إنشاء حساب جديد',
      needHelp: 'هل تحتاج مساعدة في تسجيل الدخول؟',
      contactSupport: 'تواصل مع فريق الدعم للحصول على المساعدة'
    },
    en: {
      welcomeBack: 'Welcome Back',
      tagline: 'Start your entrepreneurial journey',
      selectAccount: 'Select Account Type',
      student: 'Student',
      teacher: 'Teacher',
      organization: 'Organization',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      startJourney: 'Start Journey',
      or: 'OR',
      noAccount: 'Don\'t have an account? Sign up',
      needHelp: 'Need help logging in?',
      contactSupport: 'Contact support team for assistance'
    }
  };

  const isRTL = language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <Card className="bg-white/95 dark:bg-[#1B1B3A]/95 backdrop-blur-2xl border border-purple-200 dark:border-[#4ECDC4]/30 shadow-2xl shadow-purple-500/10 dark:shadow-[#4ECDC4]/20 p-8 rounded-3xl relative">
        {/* Language Toggle Button */}
        <motion.button
          onClick={toggleLanguage}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-[#4ECDC4]/20 dark:to-[#7FDBCA]/20 hover:from-purple-200 hover:to-cyan-200 dark:hover:from-[#4ECDC4]/30 dark:hover:to-[#7FDBCA]/30 border border-purple-300 dark:border-[#4ECDC4]/30 rounded-xl transition-all duration-300 group shadow-md hover:shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Globe className="w-4 h-4 text-purple-600 dark:text-[#4ECDC4] group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold text-purple-700 dark:text-[#4ECDC4]">
            {language === 'ar' ? 'EN' : 'AR'}
          </span>
        </motion.button>

        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          key={language}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-[#4ECDC4]/20 dark:to-[#7FDBCA]/20 border border-purple-300 dark:border-[#4ECDC4]/30 mb-4">
            <Rocket className="w-8 h-8 text-purple-600 dark:text-[#4ECDC4]" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t[language].welcomeBack}</h2>
          <p className="text-purple-600 dark:text-[#7FDBCA]/80 text-sm">{t[language].tagline}</p>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Role Selection */}
          <div>
            <label className={`text-slate-900 dark:text-white text-sm mb-3 block font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
              {t[language].selectAccount}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={selectedRole === 'student' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-4 h-auto rounded-2xl transition-all duration-300 ${
                  selectedRole === 'student'
                    ? 'bg-gradient-to-br from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] hover:from-purple-700 hover:to-cyan-700 dark:hover:from-[#5DD9C1] dark:hover:to-[#4ECDC4] text-white border-purple-600 dark:border-[#4ECDC4] shadow-lg shadow-purple-500/30 dark:shadow-[#4ECDC4]/30 scale-105'
                    : 'bg-purple-50/50 dark:bg-white/5 border-purple-300 dark:border-[#4ECDC4]/20 hover:bg-purple-100 dark:hover:bg-[#4ECDC4]/10 hover:border-purple-400 dark:hover:border-[#4ECDC4]/40 text-purple-700 dark:text-[#7FDBCA] hover:scale-105'
                }`}
                onClick={() => setSelectedRole('student')}
              >
                <GraduationCap className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-bold">{t[language].student}</span>
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'lecturer' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-4 h-auto rounded-2xl transition-all duration-300 ${
                  selectedRole === 'lecturer'
                    ? 'bg-gradient-to-br from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] hover:from-purple-700 hover:to-cyan-700 dark:hover:from-[#5DD9C1] dark:hover:to-[#4ECDC4] text-white border-purple-600 dark:border-[#4ECDC4] shadow-lg shadow-purple-500/30 dark:shadow-[#4ECDC4]/30 scale-105'
                    : 'bg-purple-50/50 dark:bg-white/5 border-purple-300 dark:border-[#4ECDC4]/20 hover:bg-purple-100 dark:hover:bg-[#4ECDC4]/10 hover:border-purple-400 dark:hover:border-[#4ECDC4]/40 text-purple-700 dark:text-[#7FDBCA] hover:scale-105'
                }`}
                onClick={() => setSelectedRole('lecturer')}
              >
                <Users className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-bold">{t[language].teacher}</span>
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'organization' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-4 h-auto rounded-2xl transition-all duration-300 ${
                  selectedRole === 'organization'
                    ? 'bg-gradient-to-br from-purple-700 to-indigo-600 text-white border-purple-700 shadow-lg shadow-purple-500/30 scale-105'
                    : 'bg-purple-50/50 dark:bg-white/5 border-purple-300 dark:border-[#4ECDC4]/20 hover:bg-purple-100 dark:hover:bg-[#4ECDC4]/10 hover:border-purple-400 dark:hover:border-[#4ECDC4]/40 text-purple-700 dark:text-[#7FDBCA] hover:scale-105'
                }`}
                onClick={() => setSelectedRole('organization')}
              >
                <Building2 className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-bold">{t[language].organization}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-slate-900 dark:text-white text-sm font-semibold block ${isRTL ? 'text-right' : 'text-left'}`}>
              {t[language].email}
            </label>
            <div className="relative group">
              <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 dark:text-[#7FDBCA]/60 group-focus-within:text-purple-600 dark:group-focus-within:text-[#4ECDC4] transition-colors`} />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'} bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 rounded-xl h-12 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20`}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-slate-900 dark:text-white text-sm font-semibold block ${isRTL ? 'text-right' : 'text-left'}`}>
              {t[language].password}
            </label>
            <div className="relative group">
              <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 dark:text-[#7FDBCA]/60 group-focus-within:text-purple-600 dark:group-focus-within:text-[#4ECDC4] transition-colors`} />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'} bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 rounded-xl h-12 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onForgotPassword}
            className="w-full text-center text-purple-600 dark:text-[#7FDBCA] hover:text-purple-700 dark:hover:text-[#4ECDC4] text-sm p-0 h-auto font-semibold hover:underline transition-all"
          >
            <div className="flex flex-col gap-0.5">
              <span>{t[language].forgotPassword}</span>
            </div>
          </Button>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] hover:from-purple-700 hover:to-cyan-700 dark:hover:from-[#5DD9C1] dark:hover:to-[#4ECDC4] text-white font-bold shadow-xl shadow-purple-500/30 dark:shadow-[#4ECDC4]/30 hover:shadow-2xl hover:shadow-purple-500/40 dark:hover:shadow-[#4ECDC4]/40 rounded-xl h-14 text-base transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-base">{t[language].startJourney}</span>
            </div>
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 text-slate-500 dark:text-white/50 bg-white dark:bg-[#1B1B3A]">{t[language].or}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onRegister}
            className="w-full text-purple-700 dark:text-[#7FDBCA] hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5 border border-purple-300 dark:border-[#7FDBCA]/30 hover:border-purple-400 dark:hover:border-[#4ECDC4]/50 rounded-xl h-14 font-semibold transition-all duration-300"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">{t[language].noAccount}</span>
            </div>
          </Button>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-[#4ECDC4]/5 dark:to-[#7FDBCA]/5 border border-blue-200 dark:border-[#4ECDC4]/20 rounded-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-[#4ECDC4] dark:to-[#7FDBCA] rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-2">
                  {t[language].needHelp}
                </h4>
                <p className="text-slate-600 dark:text-gray-400 text-xs mb-3">
                  {t[language].contactSupport}
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:support@yieldx.com"
                    className="flex items-center gap-2 text-sm text-purple-600 dark:text-[#4ECDC4] hover:text-purple-700 dark:hover:text-[#7FDBCA] transition-colors group"
                  >
                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">support@yieldx.com</span>
                  </a>
                  <a
                    href="tel:+96812345678"
                    className="flex items-center gap-2 text-sm text-purple-600 dark:text-[#4ECDC4] hover:text-purple-700 dark:hover:text-[#7FDBCA] transition-colors group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-semibold">+968 1234 5678</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  );
}