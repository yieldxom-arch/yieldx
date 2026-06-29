import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ArrowLeft, Home, GraduationCap, Users, Globe, Building2 } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import type { UserRole } from '@/app/contexts/YieldXContext';
import { SpaceCharacter } from './SpaceCharacter';
import { ForgotPassword } from './ForgotPassword';
// OFFLINE MODE: auth is handled entirely by YieldXContext via localStorage

export function AnimatedLoginForm() {
  const { language, setLanguage, translations, setCurrentView, login, register } = useYieldX();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'fullName' | 'confirmPassword' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = translations.auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validation
    if (!email || !email.includes('@')) {
      setError(language === 'ar' ? '❌ البريد الإلكتروني غير صحيح' : '❌ Invalid email format');
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 3) {
      setError(language === 'ar' ? '❌ كلمة المرور يجب أن تكون 3 أحرف على الأقل' : '❌ Password must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError(language === 'ar' ? 'الرجاء إدخال الاسم الكامل' : 'Please enter your full name');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
    }
    
    if (mode === 'signup') {
      // ── Use server-side registration to bypass email confirmation ────
      const signupSuccess = await register(email, password, fullName, selectedRole);
      
      if (!signupSuccess) {
        setError(language === 'ar'
          ? '❌ فشل التسجيل. قد يكون البريد الإلكتروني مستخدماً بالفعل.'
          : '❌ Registration failed. Email may already be in use.');
        setIsLoading(false);
        return;
      }

      // Registration successful - user is already logged in and redirected to dashboard
      console.log('✅ Registration successful! Redirecting to dashboard...');
      setSuccess(true);
      setIsLoading(false);
      // The register function already set user context and redirected to dashboard
      return;
    }
    
    // ── LOGIN ─────────────────────────────────────────────────────────────────
    const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
      let timeoutId: any;
      const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Login timed out after ${ms}ms`)), ms);
      });
      try {
        return await Promise.race([promise, timeoutPromise]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    try {
      console.log('[TIMING] before withTimeout(login(...))', performance.now());
      const loginSuccess = await withTimeout(login(email, password, selectedRole), 60000);
      console.log('[TIMING] withTimeout resolved', performance.now(), loginSuccess);

      if (!loginSuccess) {
      setError(language === 'ar' 
        ? '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة.\nالرجاء التحقق من بياناتك أو إنشاء حساب جديد.' 
        : '❌ Incorrect email or password.\nPlease check your credentials or create a new account.');
      setSuccess(false);
      setIsLoading(false);
      return;
    }

    // Show success message briefly then redirect
    console.log('✅ Login successful (Online)!');
    setSuccess(true);
    setIsLoading(false);
    
    // The login function already sets currentView to 'dashboard'
    // Just wait a moment for the success animation
    await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err: any) {
      console.error('❌ Login error/timeout:', err);
      setError(language === 'ar'
        ? '❌ تعذر تسجيل الدخول.\nيرجى المحاولة مرة أخرى.'
        : '❌ Login failed or timed out.\nPlease try again.');
      setSuccess(false);
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1B] via-[#1A1A2E] to-[#0A0A1B] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Back to Home Button */}
      <motion.button
        onClick={() => setCurrentView('home')}
        className="fixed top-6 left-6 z-50 group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#4ECDC4]/50 hover:bg-white/10 text-white/80 hover:text-white transition-all shadow-lg hover:shadow-[#4ECDC4]/20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-sm">
          {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
        </span>
      </motion.button>

      {/* Language Toggle */}
      <motion.div
        className="fixed top-6 right-6 z-50 flex items-center gap-2 p-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            language === 'en'
              ? 'bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          EN
        </motion.button>
        <motion.button
          onClick={() => setLanguage('ar')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            language === 'ar'
              ? 'bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ع
        </motion.button>
      </motion.div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(78, 205, 196, 0.1), transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(93, 217, 193, 0.1), transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#4ECDC4]/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Show Forgot Password component if mode is 'forgot-password' */}
      {mode === 'forgot-password' ? (
        <div className="relative w-full max-w-md">
          <ForgotPassword onBackToLogin={() => setMode('login')} />
        </div>
      ) : (
        <>
          {/* Login Card */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] rounded-3xl blur-xl opacity-20" />

            {/* Card Content */}
            <div className="relative bg-[#1A1A2E]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Top Accent Bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#4ECDC4] via-[#5DD9C1] to-[#7FDBCA]" />

              <div className="p-8 md:p-10">
                {/* Space Character */}
                <SpaceCharacter 
                  focusedField={focusedField}
                  showPassword={showPassword}
                  isTyping={email.length > 0 || password.length > 0}
                  success={success}
                />

                {/* Welcome Text */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {mode === 'signup' 
                      ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')
                      : (language === 'ar' ? 'مرحباً بعودتك!' : 'Welcome Back!')
                    }
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base">
                    {mode === 'signup'
                      ? (language === 'ar' ? 'ابدأ رحلتك الآن' : 'Start your journey today')
                      : (language === 'ar' ? 'قم بتسجيل الدخول للمتابعة' : 'Sign in to continue your journey')
                    }
                  </p>
                </motion.div>

                {/* Login Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* Full Name Input (Signup Only) - FIRST FIELD */}
                  {mode === 'signup' && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Mail className={`w-5 h-5 transition-colors ${
                            focusedField === 'fullName' ? 'text-[#4ECDC4]' : 'text-gray-500'
                          }`} />
                        </div>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#4ECDC4] focus:bg-white/10 transition-all outline-none"
                          placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                          required
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-[#4ECDC4]/5 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: focusedField === 'fullName' ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Mail className={`w-5 h-5 transition-colors ${
                          focusedField === 'email' ? 'text-[#4ECDC4]' : 'text-gray-500'
                        }`} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#4ECDC4] focus:bg-white/10 transition-all outline-none"
                        placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                        required
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-[#4ECDC4]/5 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: focusedField === 'email' ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className={`w-5 h-5 transition-colors ${
                          focusedField === 'password' ? 'text-[#4ECDC4]' : 'text-gray-500'
                        }`} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-14 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#4ECDC4] focus:bg-white/10 transition-all outline-none"
                        placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4ECDC4] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-[#4ECDC4]/5 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: focusedField === 'password' ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Confirm Password Input (Signup Only) */}
                  {mode === 'signup' && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Lock className={`w-5 h-5 transition-colors ${
                            focusedField === 'confirmPassword' ? 'text-[#4ECDC4]' : 'text-gray-500'
                          }`} />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-12 pr-14 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#4ECDC4] focus:bg-white/10 transition-all outline-none"
                          placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm your password'}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4ECDC4] transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-[#4ECDC4]/5 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: focusedField === 'confirmPassword' ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Role Selection - SIGNUP ONLY (login reads role from profile automatically) */}
                  {mode === 'signup' && (<div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Student */}
                      <motion.button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all font-semibold text-xs ${
                          selectedRole === 'student'
                            ? 'border-[#4ECDC4] bg-[#4ECDC4]/15 text-[#4ECDC4] shadow-lg shadow-[#4ECDC4]/20'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:text-gray-200'
                        }`}
                      >
                        <GraduationCap className="w-5 h-5" />
                        <span>{language === 'ar' ? 'طالب' : 'Student'}</span>
                      </motion.button>

                      {/* Teacher */}
                      <motion.button
                        type="button"
                        onClick={() => setSelectedRole('lecturer')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all font-semibold text-xs ${
                          selectedRole === 'lecturer'
                            ? 'border-[#4ECDC4] bg-[#4ECDC4]/15 text-[#4ECDC4] shadow-lg shadow-[#4ECDC4]/20'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:text-gray-200'
                        }`}
                      >
                        <Users className="w-5 h-5" />
                        <span>{language === 'ar' ? 'مُدرّس' : 'Teacher'}</span>
                      </motion.button>

                      {/* Organization */}
                      <motion.button
                        type="button"
                        onClick={() => setSelectedRole('organization')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all font-semibold text-xs ${
                          selectedRole === 'organization'
                            ? 'border-purple-400 bg-purple-500/15 text-purple-300 shadow-lg shadow-purple-500/20'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:text-gray-200'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                        <span>{language === 'ar' ? 'مؤسسة' : 'Org'}</span>
                      </motion.button>
                    </div>
                  </div>)}

                  {/* Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-2 border-white/10 bg-white/5 checked:bg-[#4ECDC4] checked:border-[#4ECDC4] transition-all"
                      />
                      <span className="group-hover:text-gray-300 transition-colors">
                        {language === 'ar' ? 'تذكرني' : 'Remember me'}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-[#4ECDC4] hover:text-[#5DD9C1] transition-colors font-medium"
                      onClick={() => setMode('forgot-password')}
                    >
                      {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </button>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
                      >
                        <div className="text-red-400 text-sm text-center font-medium whitespace-pre-line">
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success Message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm"
                      >
                        <p className="text-green-400 text-sm text-center font-medium">
                          {mode === 'signup'
                            ? (language === 'ar' ? '✅ تم إنشاء الحساب بنجاح! جاري التحويل للوحة التحكم...' : '✅ Account created successfully! Redirecting to dashboard...')
                            : (language === 'ar' ? '✅ تم تسجيل ال��خول بنجاح! جاري التحويل...' : '✅ Login successful! Redirecting...')
                          }
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full py-4 rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white font-bold text-lg shadow-lg shadow-[#4ECDC4]/30 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: isLoading ? ['-100%', '200%'] : '-100%',
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: isLoading ? Infinity : 0,
                        ease: 'linear',
                      }}
                    />

                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          <span>
                            {mode === 'signup'
                              ? (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...')
                              : (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...')
                            }
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            {mode === 'signup'
                              ? (language === 'ar' ? 'إنشاء حساب' : 'Create Account')
                              : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                            }
                          </span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative px-4 bg-[#1A1A2E] text-sm text-gray-500">
                      {language === 'ar' ? 'أو' : 'OR'}
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'Google', icon: '🌐' },
                      { name: 'GitHub', icon: '💻' },
                    ].map((provider, i) => (
                      <motion.button
                        key={provider.name}
                        type="button"
                        onClick={() => alert(`Social login with ${provider.name} coming soon! This feature requires OAuth configuration.`)}
                        className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium transition-all flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <span className="text-xl">{provider.icon}</span>
                        <span className="text-sm">{provider.name}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Sign Up Link */}
                  <p className="text-center text-sm text-gray-400 mt-6">
                    {mode === 'login'
                      ? (language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?")
                      : (language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?')
                    }{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login');
                        setError('');
                      }}
                      className="text-[#4ECDC4] hover:text-[#5DD9C1] font-semibold transition-colors"
                    >
                      {mode === 'login'
                        ? (language === 'ar' ? 'إنشاء حساب' : 'Sign up')
                        : (language === 'ar' ? 'تسجيل الدخول' : 'Sign in')
                      }
                    </button>
                  </p>
                </motion.form>
              </div>
            </div>

            {/* Bottom Sparkles */}
            <motion.div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-[#4ECDC4]" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
}

// Yeti Character Component
function YetiCharacter({ 
  focusedField, 
  showPassword,
  isTyping,
  success
}: { 
  focusedField: 'email' | 'password' | 'fullName' | 'confirmPassword' | null;
  showPassword: boolean;
  isTyping: boolean;
  success: boolean;
}) {
  const shouldCoverEyes = focusedField === 'password' && !showPassword;
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Random blinking
  React.useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7 && !shouldCoverEyes) {
        blink();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [shouldCoverEyes]);

  // Track mouse movement
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setMousePosition({
          x: e.clientX - centerX,
          y: e.clientY - centerY,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate pupil position based on mouse
  const getPupilPosition = (eyeCenterX: number, eyeCenterY: number, maxDistance: number = 4) => {
    if (focusedField === 'email') {
      // When email focused, look down
      return { x: eyeCenterX, y: eyeCenterY + 3 };
    }

    if (!containerRef.current) return { x: eyeCenterX, y: eyeCenterY };

    // Calculate angle to mouse
    const angle = Math.atan2(mousePosition.y, mousePosition.x);
    const distance = Math.min(
      Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2) / 100,
      1
    );

    // Move pupils within the eye boundary
    const offsetX = Math.cos(angle) * maxDistance * distance;
    const offsetY = Math.sin(angle) * maxDistance * distance;

    return {
      x: eyeCenterX + offsetX,
      y: eyeCenterY + offsetY,
    };
  };

  // Calculate head tilt based on mouse position
  const getHeadTilt = () => {
    if (focusedField || success) return 0;
    const maxTilt = 5;
    const tilt = (mousePosition.x / 200) * maxTilt;
    return Math.max(-maxTilt, Math.min(maxTilt, tilt));
  };

  const leftPupilPos = getPupilPosition(72, 92);
  const rightPupilPos = getPupilPosition(128, 92);
  const headTilt = getHeadTilt();

  return (
    <motion.div
      ref={containerRef}
      className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: success ? [1, 1.2, 1] : 1, 
        rotate: success ? [0, 10, -10, 10, 0] : 0,
        y: success ? 0 : [0, -5, 0],
      }}
      transition={{
        scale: { duration: 0.8 },
        rotate: success ? { duration: 0.6, ease: 'easeInOut' } : { duration: 0 },
        y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4ECDC4]/20 to-[#5DD9C1]/20 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Character Container */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white to-gray-100 shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/20">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ transform: 'scale(1.3)' }}
        >
          {/* Yeti Face Base */}
          <defs>
            <radialGradient id="faceGradient">
              <stop offset="0%" stopColor="#F0F8FF" />
              <stop offset="100%" stopColor="#E0F2F7" />
            </radialGradient>
            <radialGradient id="cheekGradient">
              <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFB6C1" stopOpacity="0" />
            </radialGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Main Face */}
          <circle cx="100" cy="100" r="80" fill="url(#faceGradient)" />
          
          {/* Face Shadow/Depth */}
          <ellipse cx="100" cy="120" rx="65" ry="50" fill="#D6EBF0" opacity="0.3" />
          
          {/* Fur Texture - More scattered */}
          <g opacity="0.08">
            {[...Array(25)].map((_, i) => (
              <circle
                key={i}
                cx={50 + Math.random() * 100}
                cy={50 + Math.random() * 100}
                r={2 + Math.random() * 2}
                fill="#4ECDC4"
              />
            ))}
          </g>

          {/* Ears - Larger and more detailed */}
          <motion.g
            animate={{
              rotate: focusedField === 'email' ? -3 : 0,
            }}
            style={{ transformOrigin: '50px 70px' }}
          >
            <ellipse cx="45" cy="75" rx="20" ry="28" fill="#D6EBF0" />
            <ellipse cx="45" cy="75" rx="20" ry="28" fill="url(#faceGradient)" opacity="0.5" />
            <ellipse cx="45" cy="78" rx="12" ry="18" fill="#FFE5E8" opacity="0.6" />
          </motion.g>
          
          <motion.g
            animate={{
              rotate: focusedField === 'email' ? 3 : 0,
            }}
            style={{ transformOrigin: '155px 70px' }}
          >
            <ellipse cx="155" cy="75" rx="20" ry="28" fill="#D6EBF0" />
            <ellipse cx="155" cy="75" rx="20" ry="28" fill="url(#faceGradient)" opacity="0.5" />
            <ellipse cx="155" cy="78" rx="12" ry="18" fill="#FFE5E8" opacity="0.6" />
          </motion.g>

          {/* Eyebrows - Expressive */}
          <AnimatePresence mode="wait">
            {!shouldCoverEyes && (
              <motion.g
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <motion.path
                  d="M 62 78 Q 72 75, 82 77"
                  stroke="#2C3E50"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  animate={{
                    d: focusedField === 'email' 
                      ? "M 62 76 Q 72 73, 82 75"
                      : "M 62 78 Q 72 75, 82 77"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.path
                  d="M 118 77 Q 128 75, 138 78"
                  stroke="#2C3E50"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  animate={{
                    d: focusedField === 'email'
                      ? "M 118 75 Q 128 73, 138 76"
                      : "M 118 77 Q 128 75, 138 78"
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Eyes */}
          <AnimatePresence mode="wait">
            {!shouldCoverEyes ? (
              <motion.g
                key="eyes-open"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Eye sockets - subtle shadow */}
                <ellipse cx="72" cy="92" rx="16" ry="18" fill="#D6EBF0" opacity="0.4" />
                <ellipse cx="128" cy="92" rx="16" ry="18" fill="#D6EBF0" opacity="0.4" />
                
                {/* Eye whites */}
                <ellipse cx="72" cy="92" rx="13" ry="16" fill="white" filter="url(#softGlow)" />
                <ellipse cx="128" cy="92" rx="13" ry="16" fill="white" filter="url(#softGlow)" />
                
                {/* Iris */}
                <motion.circle
                  cx="72"
                  cy="92"
                  r="8"
                  fill="#4ECDC4"
                  animate={{
                    cx: focusedField === 'email' ? 72 : 72,
                    cy: focusedField === 'email' ? 95 : 92,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  cx="128"
                  cy="92"
                  r="8"
                  fill="#4ECDC4"
                  animate={{
                    cx: focusedField === 'email' ? 128 : 128,
                    cy: focusedField === 'email' ? 95 : 92,
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Pupils */}
                <motion.circle
                  cx={leftPupilPos.x}
                  cy={leftPupilPos.y}
                  r="5"
                  fill="#2C3E50"
                  animate={{
                    cx: focusedField === 'email' ? 72 : leftPupilPos.x,
                    cy: focusedField === 'email' ? 95 : leftPupilPos.y,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  cx={rightPupilPos.x}
                  cy={rightPupilPos.y}
                  r="5"
                  fill="#2C3E50"
                  animate={{
                    cx: focusedField === 'email' ? 128 : rightPupilPos.x,
                    cy: focusedField === 'email' ? 95 : rightPupilPos.y,
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Eye shine - multiple highlights */}
                <motion.circle 
                  cx="75" 
                  cy="89" 
                  r="3" 
                  fill="white" 
                  opacity="0.9"
                  animate={{
                    cy: focusedField === 'email' ? 92 : 89,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle 
                  cx="131" 
                  cy="89" 
                  r="3" 
                  fill="white" 
                  opacity="0.9"
                  animate={{
                    cy: focusedField === 'email' ? 92 : 89,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle 
                  cx="70" 
                  cy="94" 
                  r="1.5" 
                  fill="white" 
                  opacity="0.6"
                  animate={{
                    cy: focusedField === 'email' ? 97 : 94,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle 
                  cx="126" 
                  cy="94" 
                  r="1.5" 
                  fill="white" 
                  opacity="0.6"
                  animate={{
                    cy: focusedField === 'email' ? 97 : 94,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Eyelids - subtle detail */}
                <path
                  d="M 59 86 Q 72 83, 85 86"
                  stroke="#C5DCE3"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <path
                  d="M 115 86 Q 128 83, 141 86"
                  stroke="#C5DCE3"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </motion.g>
            ) : (
              <motion.g
                key="eyes-closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Closed eyes - happy arcs */}
                <motion.path
                  d="M 60 90 Q 72 84, 84 90"
                  stroke="#2C3E50"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.path
                  d="M 116 90 Q 128 84, 140 90"
                  stroke="#2C3E50"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Eyelash details */}
                <path d="M 62 88 L 59 85" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 72 85 L 72 81" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 82 88 L 85 85" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 118 88 L 115 85" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 128 85 L 128 81" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 138 88 L 141 85" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Hands - Cover eyes when password focused */}
          <AnimatePresence>
            {shouldCoverEyes && (
              <>
                {/* Left hand */}
                <motion.g
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  {/* Palm */}
                  <ellipse cx="75" cy="90" rx="18" ry="22" fill="#D6EBF0" />
                  
                  {/* Fingers */}
                  <motion.rect
                    x="62"
                    y="72"
                    width="6"
                    height="16"
                    rx="3"
                    fill="#C5DCE3"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                    style={{ transformOrigin: '65px 88px' }}
                  />
                  <motion.rect
                    x="70"
                    y="68"
                    width="6"
                    height="18"
                    rx="3"
                    fill="#C5DCE3"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                    style={{ transformOrigin: '73px 86px' }}
                  />
                  <motion.rect
                    x="78"
                    y="70"
                    width="6"
                    height="17"
                    rx="3"
                    fill="#C5DCE3"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    style={{ transformOrigin: '81px 87px' }}
                  />
                  <motion.rect
                    x="86"
                    y="74"
                    width="5"
                    height="14"
                    rx="2.5"
                    fill="#C5DCE3"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
                    style={{ transformOrigin: '88.5px 88px' }}
                  />
                  
                  {/* Palm details */}
                  <ellipse cx="72" cy="92" rx="4" ry="3" fill="#B8D5DD" opacity="0.5" />
                  <ellipse cx="78" cy="94" rx="3" ry="2" fill="#B8D5DD" opacity="0.4" />
                </motion.g>

                {/* Right hand */}
                <motion.g
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  {/* Palm */}
                  <ellipse cx="125" cy="90" rx="18" ry="22" fill="#D6EBF0" />
                  
                  {/* Fingers */}
                  <motion.rect
                    x="108"
                    y="74"
                    width="5"
                    height="14"
                    rx="2.5"
                    fill="#C5DCE3"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
                    style={{ transformOrigin: '110.5px 88px' }}
                  />
                  <motion.rect
                    x="116"
                    y="70"
                    width="6"
                    height="17"
                    rx="3"
                    fill="#C5DCE3"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    style={{ transformOrigin: '119px 87px' }}
                  />
                  <motion.rect
                    x="124"
                    y="68"
                    width="6"
                    height="18"
                    rx="3"
                    fill="#C5DCE3"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                    style={{ transformOrigin: '127px 86px' }}
                  />
                  <motion.rect
                    x="132"
                    y="72"
                    width="6"
                    height="16"
                    rx="3"
                    fill="#C5DCE3"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                    style={{ transformOrigin: '135px 88px' }}
                  />
                  
                  {/* Palm details */}
                  <ellipse cx="128" cy="92" rx="4" ry="3" fill="#B8D5DD" opacity="0.5" />
                  <ellipse cx="122" cy="94" rx="3" ry="2" fill="#B8D5DD" opacity="0.4" />
                </motion.g>
              </>
            )}
          </AnimatePresence>

          {/* Nose - More 3D and cute */}
          <motion.g
            animate={{
              scale: focusedField ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: focusedField ? Infinity : 0,
            }}
            style={{ transformOrigin: '100px 115px' }}
          >
            <ellipse cx="100" cy="115" rx="10" ry="12" fill="#5DD9C1" opacity="0.3" />
            <ellipse cx="100" cy="114" rx="9" ry="10" fill="#4ECDC4" />
            <ellipse cx="98" cy="112" rx="3" ry="3.5" fill="#3DBDB5" opacity="0.6" />
            <circle cx="102" cy="111" r="2.5" fill="white" opacity="0.7" />
            {/* Nostrils */}
            <ellipse cx="97" cy="116" rx="1.5" ry="2" fill="#2C3E50" opacity="0.4" />
            <ellipse cx="103" cy="116" rx="1.5" ry="2" fill="#2C3E50" opacity="0.4" />
          </motion.g>

          {/* Mouth - More expressive */}
          <motion.g>
            <motion.path
              d={shouldCoverEyes 
                ? "M 78 135 Q 100 130, 122 135" 
                : "M 78 135 Q 100 145, 122 135"
              }
              stroke="#2C3E50"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              animate={{
                d: shouldCoverEyes 
                  ? "M 78 135 Q 100 130, 122 135" 
                  : "M 78 135 Q 100 145, 122 135",
              }}
              transition={{ duration: 0.3 }}
            />
            {/* Smile dimples */}
            {!shouldCoverEyes && (
              <>
                <circle cx="76" cy="132" r="2" fill="#FFB6C1" opacity="0.3" />
                <circle cx="124" cy="132" r="2" fill="#FFB6C1" opacity="0.3" />
              </>
            )}
          </motion.g>

          {/* Blush - More prominent and cute */}
          <motion.ellipse
            cx="55"
            cy="108"
            rx="12"
            ry="8"
            fill="url(#cheekGradient)"
            initial={{ opacity: 0.5, rx: 12 }}
            animate={{
              opacity: focusedField ? 0.8 : 0.5,
              rx: focusedField ? 14 : 12,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.ellipse
            cx="145"
            cy="108"
            rx="12"
            ry="8"
            fill="url(#cheekGradient)"
            initial={{ opacity: 0.5, rx: 12 }}
            animate={{
              opacity: focusedField ? 0.8 : 0.5,
              rx: focusedField ? 14 : 12,
            }}
            transition={{ duration: 0.3 }}
          />
        </svg>
      </div>

      {/* Floating Hearts when typing */}
      <AnimatePresence>
        {isTyping && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-0 left-1/2"
                initial={{ opacity: 0, y: 0, x: -10 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: -50,
                  x: -10 + (i - 1) * 20,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              >
                <Sparkles className="w-4 h-4 text-[#4ECDC4]" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}