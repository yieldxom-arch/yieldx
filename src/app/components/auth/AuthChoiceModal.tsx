import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, PlayCircle, Sparkles } from 'lucide-react';

interface AuthChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onTryDemo: () => void;
  language: 'en' | 'ar';
}

export function AuthChoiceModal({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  onTryDemo,
  language
}: AuthChoiceModalProps) {
  const isRTL = language === 'ar';

  const translations = {
    en: {
      title: 'Get Started with YieldX',
      subtitle: 'Choose how you want to begin your journey',
      login: 'Log In',
      loginDesc: 'Already have an account? Sign in to continue',
      signup: 'Create Account',
      signupDesc: 'New to YieldX? Create an account to unlock all features',
      demo: 'Try Demo',
      demoDesc: 'Explore Level 1 without signing up',
      demoNote: 'Preview mode — progress not saved'
    },
    ar: {
      title: 'ابدأ مع YieldX',
      subtitle: 'اختر كيف تريد أن تبدأ رحلتك',
      login: 'تسجيل الدخول',
      loginDesc: 'لديك حساب بالفعل؟ سجل الدخول للمتابعة',
      signup: 'إنشاء حساب',
      signupDesc: 'جديد على YieldX؟ أنشئ حساباً لفتح جميع الميزات',
      demo: 'جرب العرض التجريبي',
      demoDesc: 'استكشف المستوى 1 بدون تسجيل',
      demoNote: 'وضع المعاينة — لن يتم حفظ التقدم'
    }
  };

  const t = translations[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-gradient-to-br from-[#1B1B3A] to-[#0F0F25] border border-[#4ECDC4]/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-[#4ECDC4]/20 bg-gradient-to-r from-[#4ECDC4]/10 to-[#5DD9C1]/10">
              <button
                onClick={onClose}
                className={`absolute top-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] mb-4 shadow-lg shadow-[#4ECDC4]/30"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {t.title}
                </h2>
                <p className="text-gray-300 text-sm">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="p-6 space-y-3">
              {/* PRIMARY: Create Account (Most Prominent) */}
              <motion.button
                onClick={onSignup}
                className="w-full p-8 rounded-xl bg-gradient-to-br from-[#4ECDC4]/20 to-[#5DD9C1]/20 border-2 border-[#4ECDC4]/50 hover:border-[#4ECDC4]/70 hover:bg-[#4ECDC4]/25 transition-all group text-start shadow-xl shadow-[#4ECDC4]/20"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] flex items-center justify-center flex-shrink-0 shadow-xl shadow-[#4ECDC4]/40 group-hover:shadow-[#4ECDC4]/60 transition-shadow">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      {t.signup}
                      <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white text-[10px] font-bold shadow-lg">
                        {language === 'ar' ? 'موصى به' : 'RECOMMENDED'}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {t.signupDesc}
                    </p>
                  </div>
                </div>
              </motion.button>

              {/* SECONDARY: Try Demo (Moderate Prominence) */}
              <motion.button
                onClick={onTryDemo}
                className="w-full p-5 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all group text-start"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-purple-500/30 transition-shadow">
                    <PlayCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-1.5">
                      {t.demo}
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                      {t.demoDesc}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                      <span className="text-xs text-purple-300 font-medium">
                        {t.demoNote}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* TERTIARY: Log In (Least Prominent) */}
              <motion.button
                onClick={onLogin}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group text-start"
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-gray-600/20 transition-shadow">
                    <LogIn className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-1">
                      {t.login}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {t.loginDesc}
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center">
                {language === 'ar' 
                  ? '✨ ابدأ اليوم واحصل على وصول فوري إلى جميع الميزات'
                  : '✨ Start today and get instant access to all features'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}