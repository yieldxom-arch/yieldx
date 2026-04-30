import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useYieldX, UserRole } from '@/app/contexts/YieldXContext';
import { AnimatedLoginForm } from './AnimatedLoginForm';
import { Login } from './Login';
import { Register } from './Register';
import { ForgotPassword } from './ForgotPassword';
import { toast } from 'sonner';

type AuthView = 'login' | 'register' | 'forgot-password';

interface LoginContainerProps {
  initialView?: AuthView;
}

export function LoginContainer({ initialView = 'login' }: LoginContainerProps = {}) {
  const { login } = useYieldX();
  const [view, setView] = useState<AuthView>(initialView);
  const [useAnimatedForm, setUseAnimatedForm] = useState(true);

  const handleLoginAttempt = (email: string, password: string, role: UserRole) => {
    const success = login(email, password, role);
    
    if (!success) {
      // Show error toast with demo credentials
      toast.error('⚠️ فشل تسجيل الدخول / Login Failed', {
        description: (
          <div className="space-y-2 text-sm">
            <p className="font-semibold">📧 حسابات متاحة / Available Accounts:</p>
            <div className="space-y-1 text-xs bg-slate-900/50 p-2 rounded">
              <div>👨‍🎓 Student: demo.student@yieldx.com / demo123</div>
              <div>👨‍🏫 Teacher: demo.teacher@yieldx.com / demo123</div>
              <div>🔧 Admin: admin@yieldx.com / admin123</div>
              <div className="border-t border-slate-700 pt-1 mt-1">
                <div>👨‍🎓 alhashmisaid23@gmail.com / password123</div>
                <div>👨‍🎓 alhashmisaid21@gmail.com / password123</div>
              </div>
            </div>
            <p className="text-xs text-amber-400">⚠️ تأكد من اختيار الدور الصحيح / Ensure correct role is selected</p>
          </div>
        ),
        duration: 10000,
      });
    }
  };

  const handleRegisterSuccess = () => {
    setView('login');
    toast.success('تم إنشاء الحساب بنجاح!', {
      description: 'يمكنك الآن تسجيل الدخول',
    });
  };

  // Always use animated form (with robot design)
  return <AnimatedLoginForm />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-[#0F0F25] dark:via-[#1B1B3A] dark:to-[#2A4A5A] relative overflow-hidden">
      {/* Background Effects - Only visible in dark mode */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 -right-32 w-96 h-96 bg-[#4ECDC4]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -left-32 w-96 h-96 bg-[#7FDBCA]/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Floating Stars */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#4ECDC4] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo - Always visible */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <motion.div
              className="relative inline-block mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] blur-3xl opacity-30 rounded-full"></div>
              
              <motion.h1 
                className="relative text-8xl font-black bg-gradient-to-br from-[#4ECDC4] via-[#5DD9C1] to-[#7FDBCA] bg-clip-text text-transparent"
                style={{
                  textShadow: '0 0 80px rgba(78, 205, 196, 0.5)',
                  letterSpacing: '-0.02em'
                }}
                animate={{
                  textShadow: [
                    '0 0 80px rgba(78, 205, 196, 0.5)',
                    '0 0 100px rgba(78, 205, 196, 0.7)',
                    '0 0 80px rgba(78, 205, 196, 0.5)',
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                YieldX
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-[#7FDBCA] text-xl font-semibold tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              رحلتك إلى النجاح الريادي
            </motion.p>
            
            {/* Decorative line */}
            <motion.div 
              className="h-1 w-32 mx-auto mt-4 rounded-full bg-gradient-to-r from-transparent via-[#4ECDC4] to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            ></motion.div>
          </motion.div>

          {/* Auth Views */}
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <Login
                key="login"
                onLogin={handleLoginAttempt}
                onRegister={() => setView('register')}
                onForgotPassword={() => setView('forgot-password')}
              />
            )}

            {view === 'register' && (
              <Register
                key="register"
                onSuccess={handleRegisterSuccess}
                onBackToLogin={() => setView('login')}
              />
            )}

            {view === 'forgot-password' && (
              <ForgotPassword
                key="forgot-password"
                onBackToLogin={() => setView('login')}
              />
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.p 
            className="text-center text-white/40 text-sm mt-8 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            منصة YieldX لدراسات الجدوى التفصيلية
          </motion.p>
        </div>
      </div>
    </div>
  );
}