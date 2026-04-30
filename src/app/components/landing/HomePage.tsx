import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { 
  Rocket, Target, Users, Award, BookOpen, BarChart3, Zap, Globe, 
  ArrowRight, ChevronRight, Sparkles, TrendingUp, Shield, CheckCircle2, 
  Star, Clock, Brain, Lightbulb, Trophy, PlayCircle, ArrowDown, Check,
  Briefcase, DollarSign, LineChart, PieChart, Mail, Instagram
} from 'lucide-react';
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { BackgroundGradientAnimation } from "@/app/components/ui/background-gradient-animation";
import { AuthChoiceModal } from "@/app/components/auth/AuthChoiceModal";

// Reusable Scroll Animation Component
function ScrollReveal({ 
  children, 
  delay = 0,
  direction = 'up'
}: { 
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-100px",
    amount: 0.3
  });

  const directions = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        x: 0 
      } : { 
        opacity: 0, 
        ...directions[direction]
      }}
      transition={{
        duration: 0.7,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}

// Floating Badge Component
function FloatingBadge({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
    >
      <motion.div
        animate={{ 
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface Particle {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export function HomePage() {
  const { language, setLanguage, setCurrentView, translations } = useYieldX();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [languageSwitchParticles, setLanguageSwitchParticles] = useState<Particle[]>([]);
  const [isLanguageHovered, setIsLanguageHovered] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const particleIdRef = useRef(0);
  const languageParticleIdRef = useRef(0);
  const t = translations.home;

  const { scrollYProgress } = useScroll();
  
  // Mouse tracking for particle trail
  useEffect(() => {
    let lastTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastTime > 50) {
        const newParticle: Particle = {
          id: particleIdRef.current++,
          x: e.clientX,
          y: e.clientY,
          timestamp: currentTime,
        };
        
        setParticles(prev => [...prev, newParticle].slice(-12));
        lastTime = currentTime;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const cleanupInterval = setInterval(() => {
      const currentTime = Date.now();
      setParticles(prev => prev.filter(p => currentTime - p.timestamp < 800));
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(cleanupInterval);
    };
  }, []);

  // Language switch particle trail
  useEffect(() => {
    let lastTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastTime > 50 && isLanguageHovered) {
        const newParticle: Particle = {
          id: languageParticleIdRef.current++,
          x: e.clientX,
          y: e.clientY,
          timestamp: currentTime,
        };
        
        setLanguageSwitchParticles(prev => [...prev, newParticle].slice(-12));
        lastTime = currentTime;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const cleanupInterval = setInterval(() => {
      const currentTime = Date.now();
      setLanguageSwitchParticles(prev => prev.filter(p => currentTime - p.timestamp < 800));
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(cleanupInterval);
    };
  }, [isLanguageHovered]);

  const features = [
    {
      icon: Brain,
      title: language === 'ar' ? 'تعلم تفاعلي بالذكاء الاصطناعي' : 'AI-Powered Interactive Learning',
      desc: language === 'ar' ? 'نظام تعليمي ذكي مع 8 مستويات تفاعلية، روبوت محادثة بالذكاء الاصطناعي، ومكتبة فيديو شاملة' : 'Smart learning system with 8 interactive levels, AI chatbot, and comprehensive video library',
      color: '#4ECDC4',
      gradient: 'from-[#4ECDC4] to-[#5DD9C1]'
    },
    {
      icon: Target,
      title: language === 'ar' ? 'تخطيط أعمال شامل' : 'Comprehensive Business Planning',
      desc: language === 'ar' ? 'أدوات متكاملة لدراسة الجدوى، التحليل المالي، وأبحاث السوق' : 'Complete tools for feasibility studies, financial analysis, and market research',
      color: '#5DD9C1',
      gradient: 'from-[#5DD9C1] to-[#7FDBCA]'
    },
    {
      icon: Users,
      title: language === 'ar' ? 'عمل جماعي متقدم' : 'Advanced Collaboration',
      desc: language === 'ar' ? 'مساحات عمل جماعية، رسائل فورية، ولوحات قيادة للمعلمين' : 'Team workspaces, real-time messaging, and teacher dashboards',
      color: '#7FDBCA',
      gradient: 'from-[#7FDBCA] to-[#A8E6CF]'
    },
    {
      icon: Award,
      title: language === 'ar' ? 'إرشاد من الخبراء' : 'Expert Guidance',
      desc: language === 'ar' ? 'استشارات مهنية، مركز رسائل، ودعم 24/7' : 'Professional consultations, messaging center, and 24/7 support',
      color: '#A8E6CF',
      gradient: 'from-[#A8E6CF] to-[#B8F3D8]'
    },
  ];

  const stats = [
    { 
      value: '12,000+', 
      label: language === 'ar' ? 'طالب نشط' : 'Active Students', 
      icon: Users,
      color: '#4ECDC4'
    },
    { 
      value: '8,500+', 
      label: language === 'ar' ? 'مشروع مكتمل' : 'Completed Projects', 
      icon: Target,
      color: '#5DD9C1'
    },
    { 
      value: '95%', 
      label: language === 'ar' ? 'معدل النجاح' : 'Success Rate', 
      icon: TrendingUp,
      color: '#7FDBCA'
    },
    { 
      value: '24/7', 
      label: language === 'ar' ? 'دعم متواصل' : 'Support Available', 
      icon: Clock,
      color: '#A8E6CF'
    },
  ];

  const steps = [
    { 
      icon: BookOpen, 
      title: language === 'ar' ? 'تسجيل وإنشاء مشروع' : 'Sign Up & Create Project',
      desc: language === 'ar' ? 'ابدأ رحلتك بإنشاء حساب وإعداد أول مشروع لك' : 'Start your journey by creating an account and setting up your first project',
      number: '01' 
    },
    { 
      icon: Target, 
      title: language === 'ar' ? 'التعلم التفاعلي' : 'Interactive Learning',
      desc: language === 'ar' ? 'أكمل 8 مستويات مع دروس تفاعلية وتحديات' : 'Complete 8 levels with interactive lessons and challenges',
      number: '02' 
    },
    { 
      icon: Lightbulb, 
      title: language === 'ar' ? 'بناء خطة عملك' : 'Build Your Business Plan',
      desc: language === 'ar' ? 'استخدم أدواتنا المتقدمة لإنشاء دراسة جدوى شاملة' : 'Use our advanced tools to create a comprehensive feasibility study',
      number: '03' 
    },
    { 
      icon: Trophy, 
      title: language === 'ar' ? 'إطلاق واستشارة' : 'Launch & Consult',
      desc: language === 'ar' ? 'احصل على إرشادات الخبراء وأطلق مشروعك بثقة' : 'Get expert guidance and launch your project with confidence',
      number: '04' 
    },
  ];

  const pricingPlans = [
    {
      name: language === 'ar' ? 'أساسي' : 'Basic',
      price: language === 'ar' ? 'مجاناً' : 'Free',
      description: language === 'ar' ? 'للمبتدئين' : 'For beginners',
      features: [
        language === 'ar' ? 'الوصول إلى 3 مستويات' : 'Access to 3 levels',
        language === 'ar' ? 'مشروع واحد' : '1 project',
        language === 'ar' ? 'دعم المجتمع' : 'Community support',
        language === 'ar' ? 'أدوات أساسية' : 'Basic tools'
      ],
      color: '#6B7280',
      popular: false
    },
    {
      name: language === 'ar' ? 'احترافي' : 'Professional',
      price: language === 'ar' ? '19 ر.ع./شهر' : '19 OMR/mo',
      description: language === 'ar' ? 'الأكثر شيوعاً' : 'Most popular',
      features: [
        language === 'ar' ? 'الوصول إلى جميع المستويات' : 'All levels access',
        language === 'ar' ? 'مشاريع غير محدودة' : 'Unlimited projects',
        language === 'ar' ? 'روبوت محادثة بالذكاء الاصطناعي' : 'AI chatbot',
        language === 'ar' ? 'مكتبة الفيديو' : 'Video library',
        language === 'ar' ? 'دعم ذي أولوية' : 'Priority support'
      ],
      color: '#4ECDC4',
      popular: true
    },
    {
      name: language === 'ar' ? 'مؤسسة' : 'Organization',
      price: language === 'ar' ? '200 ر.ع./شهر' : '200 OMR/mo',
      description: language === 'ar' ? 'للمؤسسات والجهات التعليمية' : 'For organizations & institutions',
      features: [
        language === 'ar' ? 'كل شيء في الخطة الاحترافية' : 'Everything in Pro',
        language === 'ar' ? 'لوحة تحكم المعلم' : 'Teacher dashboard',
        language === 'ar' ? 'مساحات عمل جماعية' : 'Team workspaces',
        language === 'ar' ? 'تحليلات متقدمة' : 'Advanced analytics',
        language === 'ar' ? 'مدير حساب مخصص' : 'Dedicated account manager'
      ],
      color: '#A8E6CF',
      popular: false
    }
  ];

  const testimonials = [
    {
      name: language === 'ar' ? 'سارة أحمد' : 'Sarah Ahmed',
      role: language === 'ar' ? 'طالبة، جامعة القدس' : 'Student, Al-Quds University',
      content: language === 'ar' 
        ? 'YieldX ساعدني على تحويل فكرتي إلى خطة عمل كاملة. النظام التفاعلي جعل التعلم ممتعاً وسهلاً!'
        : 'YieldX helped me transform my idea into a complete business plan. The interactive system made learning fun and easy!',
      rating: 5,
      avatar: '👩‍🎓'
    },
    {
      name: language === 'ar' ? 'محمد خالد' : 'Mohammed Khaled',
      role: language === 'ar' ? 'رائد أعمال' : 'Entrepreneur',
      content: language === 'ar'
        ? 'الأدوات المتقدمة والإرشاد من الخبراء كانت لا تقدر بثمن. أطلقت مشروعي بثقة كاملة.'
        : 'The advanced tools and expert guidance were invaluable. I launched my project with complete confidence.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: language === 'ar' ? 'ليلى حسن' : 'Layla Hassan',
      role: language === 'ar' ? 'معلمة، كلية الإدارة' : 'Teacher, Business College',
      content: language === 'ar'
        ? 'لوحة تحكم المعلم ومساحات العمل الجماعية جعلت من السهل إدارة صفوفي وتتبع تقدم الطلاب.'
        : 'The teacher dashboard and team workspaces made it easy to manage my classes and track student progress.',
      rating: 5,
      avatar: '👩‍🏫'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A1B] text-white overflow-hidden">
      {/* Mouse Trail Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: particle.x,
                top: particle.y,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 0.9, 0],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
              }}
            >
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: '24px',
                  height: '24px',
                  background: 'radial-gradient(circle, rgba(78, 205, 196, 1) 0%, rgba(78, 205, 196, 0.8) 30%, rgba(93, 217, 193, 0.4) 60%, transparent 100%)',
                  filter: 'blur(6px)',
                  boxShadow: '0 0 15px rgba(78, 205, 196, 0.6)',
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="backdrop-blur-xl bg-[#0A0A1B]/80 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] flex items-center justify-center shadow-lg shadow-[#4ECDC4]/30">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                YieldX
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {[
                { label: language === 'ar' ? 'المميزات' : 'Features', href: '#features' },
                { label: language === 'ar' ? 'كيف يعمل' : 'How it Works', href: '#how-it-works' },
                { label: language === 'ar' ? 'الأسعار' : 'Pricing', href: '#pricing' },
                { label: language === 'ar' ? 'آراء العملاء' : 'Testimonials', href: '#testimonials' },
              ].map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Creative Language Switcher */}
              <div className="hidden md:block relative group">
                <motion.div
                  className="relative"
                  onHoverStart={() => setIsLanguageHovered(true)}
                  onHoverEnd={() => setIsLanguageHovered(false)}
                >
                  {/* Rotating Globe Container */}
                  <motion.button
                    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                    className="relative px-5 py-2.5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-[#4ECDC4]/50 shadow-lg hover:shadow-[#4ECDC4]/20 transition-all overflow-hidden"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Animated Background Gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#4ECDC4]/0 via-[#4ECDC4]/10 to-[#4ECDC4]/0"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-3">
                      {/* Spinning Globe Icon */}
                      <motion.div
                        animate={{ 
                          rotate: isLanguageHovered ? 360 : 0,
                          scale: isLanguageHovered ? 1.1 : 1
                        }}
                        transition={{ 
                          duration: 0.6,
                          type: 'spring',
                          stiffness: 200
                        }}
                      >
                        <Globe className="w-5 h-5 text-[#4ECDC4]" />
                      </motion.div>
                      
                      {/* Language Text with Morph Animation */}
                      <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={language}
                            initial={{ opacity: 0, y: 10, rotateX: 90 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, y: -10, rotateX: -90 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm font-bold text-white"
                          >
                            {language === 'en' ? 'English' : 'العربية'}
                          </motion.span>
                        </AnimatePresence>
                        
                        {/* Animated Chevron */}
                        <motion.div
                          animate={{ 
                            rotate: isLanguageHovered ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronRight className="w-4 h-4 text-white/60" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Tooltip with both languages */}
                  <AnimatePresence>
                    {isLanguageHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50"
                      >
                        <div className="px-4 py-3 rounded-xl bg-[#0A0A1B]/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                          <div className="flex items-center gap-3 whitespace-nowrap">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                                language === 'en'
                                  ? 'bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white shadow-lg'
                                  : 'bg-white/5 text-white/70 hover:bg-white/10'
                              }`}
                              onClick={() => setLanguage('en')}
                            >
                              <span className="text-xs font-semibold">🇬🇧 English</span>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                                language === 'ar'
                                  ? 'bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white shadow-lg'
                                  : 'bg-white/5 text-white/70 hover:bg-white/10'
                              }`}
                              onClick={() => setLanguage('ar')}
                            >
                              <span className="text-xs font-semibold">🇸🇦 العربية</span>
                            </motion.div>
                          </div>
                          {/* Triangle pointer */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A0A1B]/95 border-l border-t border-white/20 rotate-45" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Particle Burst Effect on Click */}
                  <AnimatePresence>
                    {languageSwitchParticles.map((particle) => (
                      <motion.div
                        key={particle.id}
                        className="absolute pointer-events-none"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        initial={{ 
                          scale: 0, 
                          opacity: 1,
                          x: 0,
                          y: 0
                        }}
                        animate={{
                          scale: [0, 1.5, 0],
                          opacity: [1, 0.5, 0],
                          x: [0, (Math.random() - 0.5) * 100],
                          y: [0, (Math.random() - 0.5) * 100],
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          duration: 0.8,
                          ease: 'easeOut',
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.button
                onClick={() => setCurrentView('auth-login')}
                className="px-6 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.login}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
        <BackgroundGradientAnimation
          gradientBackgroundStart="rgb(10, 10, 27)"
          gradientBackgroundEnd="rgb(26, 26, 46)"
          firstColor="78, 205, 196"
          secondColor="93, 217, 193"
          thirdColor="127, 219, 202"
          fourthColor="168, 230, 207"
          fifthColor="93, 217, 193"
          pointerColor="78, 205, 196"
          size="40%"
          blendingValue="hard-light"
          containerClassName="absolute inset-0 opacity-40"
          className="absolute inset-0"
          interactive={true}
        />
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <FloatingBadge delay={0.2}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 mb-8">
                <Star className="w-4 h-4 text-[#4ECDC4] fill-[#4ECDC4]" />
                <span className="text-sm font-semibold text-[#4ECDC4]">
                  {language === 'ar' ? '#1 منصة دراسة الجدوى في المنطقة' : '#1 Business Feasibility Platform'}
                </span>
              </div>
            </FloatingBadge>

            {/* Main Heading */}
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-white">
                {language === 'ar' ? 'حوّل فكرتك إلى' : 'Transform Your Idea'}
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#4ECDC4] via-[#5DD9C1] to-[#7FDBCA] bg-clip-text text-transparent">
                {language === 'ar' ? 'مشروع ناجح' : 'Into Success'}
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {language === 'ar'
                ? 'منصة متكاملة لدراسة جدوى المشاريع مع نظام تعليمي تفاعلي، متابعة من الخبراء، وأدوات تحليل متقدمة لضمان نجاح مشروعك.'
                : 'Complete business feasibility platform with interactive learning, expert guidance, and advanced analytics to ensure your project success.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex items-center justify-center gap-4 flex-wrap mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white font-semibold flex items-center gap-2 shadow-xl shadow-[#4ECDC4]/30"
                whileHover={{ scale: 1.05, y: -3, boxShadow: '0 25px 50px rgba(78, 205, 196, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{t.startChallenge}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                className="group px-8 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayCircle className="w-5 h-5" />
                <span>{language === 'ar' ? 'شاهد الفيديو' : 'Watch Demo'}</span>
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex items-center justify-center gap-8 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] border-2 border-[#0A0A1B] flex items-center justify-center text-xs font-bold shadow-lg"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">12,000+</p>
                  <p className="text-xs text-gray-500">{language === 'ar' ? 'طالب نشط' : 'Active Students'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-[#4ECDC4] fill-[#4ECDC4]" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-white">4.9/5</p>
                <p className="text-xs text-gray-500">(2,340 {language === 'ar' ? 'تقييم' : 'reviews'})</p>
              </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowDown className="w-6 h-6 text-gray-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center hover:border-[#4ECDC4]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all"
                  whileHover={{ 
                    y: -8, 
                    scale: 1.05
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                  </div>
                  <motion.h3 
                    className="text-3xl md:text-4xl font-bold text-white mb-2"
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.1, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 text-[#4ECDC4]" />
                <span className="text-sm font-semibold text-[#4ECDC4]">
                  {language === 'ar' ? 'المميزات' : 'Features'}
                </span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {language === 'ar' ? 'كل ما تحتاجه للنجاح' : 'Everything You Need to Succeed'}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {language === 'ar' 
                  ? 'منصة شاملة مع أدوات متقدمة لتحويل فكرتك إلى مشروع ناجح'
                  : 'A comprehensive platform with advanced tools to transform your idea into a successful project'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                <motion.div
                  className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#4ECDC4]/40 transition-all"
                  style={{ 
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                    style={{ boxShadow: `0 10px 30px ${feature.color}40` }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#4ECDC4] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Lightbulb className="w-4 h-4 text-[#4ECDC4]" />
                <span className="text-sm font-semibold text-[#4ECDC4]">
                  {language === 'ar' ? 'كيف يعمل' : 'How It Works'}
                </span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {language === 'ar' ? 'ابدأ في 4 خطوات بسيطة' : 'Get Started in 4 Simple Steps'}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {language === 'ar'
                  ? 'رحلة واضحة من الفكرة إلى الإطلاق'
                  : 'A clear journey from idea to launch'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.15} direction="up">
                <motion.div
                  className="relative group"
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Connecting Line (desktop only) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#4ECDC4]/50 to-transparent -z-10" />
                  )}

                  <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all h-full">
                    {/* Number Badge */}
                    <div className="text-6xl font-bold text-[#4ECDC4]/20 mb-4">
                      {step.number}
                    </div>

                    <div 
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] flex items-center justify-center mb-5 shadow-lg shadow-[#4ECDC4]/30 group-hover:scale-110 transition-transform"
                    >
                      <step.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <DollarSign className="w-4 h-4 text-[#4ECDC4]" />
                <span className="text-sm font-semibold text-[#4ECDC4]">
                  {language === 'ar' ? 'الأسعار' : 'Pricing'}
                </span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {language === 'ar' ? 'اختر الخطة المناسبة لك' : 'Choose Your Perfect Plan'}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {language === 'ar'
                  ? 'خطط مرنة تناسب جميع الاحتياجات'
                  : 'Flexible plans to suit every need'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction="up">
                <CardContainer className="inter-var">
                  <CardBody className={`relative backdrop-blur-sm border transition-all h-full ${
                    plan.popular
                      ? 'bg-gradient-to-br from-[#4ECDC4]/10 to-[#5DD9C1]/10 border-[#4ECDC4]/30 dark:hover:shadow-2xl dark:hover:shadow-[#4ECDC4]/20'
                      : 'bg-white/5 border-white/10 dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]'
                  } w-auto rounded-2xl p-8`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white text-xs font-bold shadow-lg">
                          {language === 'ar' ? 'الأكثر شيوعاً' : 'MOST POPULAR'}
                        </div>
                      </div>
                    )}

                    <CardItem translateZ="50" className="text-center mb-8 w-full">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
                      <div className="text-4xl font-bold text-white mb-2">{plan.price}</div>
                    </CardItem>

                    <CardItem translateZ="60" as="ul" className="space-y-4 mb-8 w-full">
                      {plan.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-[#4ECDC4] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </CardItem>

                    <CardItem translateZ={20} as="div" className="w-full">
                      <motion.button
                        onClick={() => setShowAuthModal(true)}
                        className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                          plan.popular
                            ? 'bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white shadow-lg shadow-[#4ECDC4]/30'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                      </motion.button>
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="w-4 h-4 text-[#4ECDC4] fill-[#4ECDC4]" />
                <span className="text-sm font-semibold text-[#4ECDC4]">
                  {language === 'ar' ? 'آراء العملاء' : 'Testimonials'}
                </span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {language === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Users Say'}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {language === 'ar'
                  ? 'قصص نجاح حقيقية من مستخدمينا'
                  : 'Real success stories from our users'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction="up">
                <motion.div
                  className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, idx) => (
                      <Star key={idx} className="w-5 h-5 text-[#4ECDC4] fill-[#4ECDC4]" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <motion.div
              className="relative p-12 rounded-3xl overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

              {/* Content */}
              <div className="relative text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block mb-6"
                >
                  <Rocket className="w-16 h-16 text-white" />
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {language === 'ar' ? 'هل أنت مستعد لبدء رحلتك؟' : 'Ready to Start Your Journey?'}
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  {language === 'ar'
                    ? 'انضم إلى آلاف الطلاب ورواد الأعمال الذين حولوا أفكارهم إلى مشاريع ناجحة'
                    : 'Join thousands of students and entrepreneurs who transformed their ideas into successful projects'}
                </p>

                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  className="px-10 py-4 rounded-xl bg-white text-[#4ECDC4] font-bold text-lg shadow-2xl flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.1, y: -3, boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{language === 'ar' ? 'ابدأ مجاناً' : 'Start Free Today'}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {language === 'ar' 
                  ? 'منصة متكاملة لدراسة جدوى المشاريع مع نظام تعليمي تفاعلي وأدوات تحليل متقدمة.'
                  : 'Complete business feasibility platform with interactive learning and advanced analytics tools.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
              </h3>
              <div className="flex flex-col gap-3">
                <a href="#features" className="text-sm text-gray-400 hover:text-[#4ECDC4] transition-colors">
                  {language === 'ar' ? 'المميزات' : 'Features'}
                </a>
                <a href="#pricing" className="text-sm text-gray-400 hover:text-[#4ECDC4] transition-colors">
                  {language === 'ar' ? 'الأسعار' : 'Pricing'}
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-[#4ECDC4] transition-colors">
                  {language === 'ar' ? 'الشروط' : 'Terms'}
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-[#4ECDC4] transition-colors">
                  {language === 'ar' ? 'الخصوصية' : 'Privacy'}
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </h3>
              <div className="flex flex-col gap-3">
                <a 
                  href="mailto:yieldxom@gmail.com"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4ECDC4] transition-colors group"
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>yieldxom@gmail.com</span>
                </a>
                <a 
                  href="https://instagram.com/yieldx_platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4ECDC4] transition-colors group"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>@yieldx_platform</span>
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                {language === 'ar' 
                  ? 'لديك استفسار أو تحتاج إلى مساعدة؟ تواصل معنا عبر البريد الإلكتروني أو إنستغرام'
                  : 'Have a question or need help? Reach out via email or Instagram'}
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 YieldX. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {language === 'ar' ? 'صنع بـ' : 'Made with'}
              </span>
              <span className="text-[#4ECDC4]">♥</span>
              <span className="text-xs text-gray-500">
                {language === 'ar' ? 'في سلطنة عُمان' : 'in Oman'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Choice Modal */}
      <AuthChoiceModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setShowAuthModal(false);
          setCurrentView('auth-login');
        }}
        onSignup={() => {
          setShowAuthModal(false);
          setCurrentView('auth-register');
        }}
        onTryDemo={() => {
          setShowAuthModal(false);
          // Demo mode: User can preview Level 1 without logging in
          // Progress will not be saved
          setCurrentView('dashboard');
        }}
        language={language}
      />
    </div>
  );
}