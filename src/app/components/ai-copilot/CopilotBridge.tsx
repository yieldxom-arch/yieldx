import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  MessageSquare,
  X
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { generateCFOInsights, generateCMOInsights, generateCEOInsights } from '@/lib/copilot-ai';
import type { 
  AICopilotRole, 
  AICopilotPersonality, 
  AICopilotMessage
} from '@/app/types/ai-copilot';

interface CopilotBridgeProps {
  language: 'en' | 'ar';
  onMessageRead: (messageId: string) => void;
  onActionTaken: (messageId: string, actionId: string) => void;
}

// AI Copilot Personalities
const copilotPersonalities: Record<AICopilotRole, AICopilotPersonality> = {
  CFO: {
    role: 'CFO',
    name: 'Atlas',
    nameAr: 'أطلس',
    avatar: '💰',
    color: '#4ECDC4',
    personality: {
      tone: 'analytical',
      traits: ['detail-oriented', 'risk-averse', 'data-driven', 'precise'],
    },
    specialization: ['Financial Planning', 'Cash Flow', 'Risk Assessment', 'Budget Optimization'],
    catchphrases: {
      greeting: { en: 'Numbers tell the truth. Let\'s analyze.', ar: 'الأرقام تقول الحقيقة. لنحلل.' },
      success: { en: 'Excellent financial health detected!', ar: 'صحة مالية ممتازة!' },
      warning: { en: 'Warning: Cash flow anomaly detected.', ar: 'تحذير: اكتشاف شذوذ في التدفق النقدي.' },
      thinking: { en: 'Calculating optimal strategy...', ar: 'حساب الاستراتيجية المثلى...' },
    },
  },
  CMO: {
    role: 'CMO',
    name: 'Nova',
    nameAr: 'نوفا',
    avatar: '🚀',
    color: '#FF6B9D',
    personality: {
      tone: 'creative',
      traits: ['innovative', 'bold', 'trend-focused', 'customer-centric'],
    },
    specialization: ['Marketing Strategy', 'Brand Building', 'Customer Acquisition', 'Market Analysis'],
    catchphrases: {
      greeting: { en: 'Ready to dominate the market!', ar: 'مستعد للسيطرة على السوق!' },
      success: { en: 'Brilliant campaign performance!', ar: 'أداء حملة رائع!' },
      warning: { en: 'Competitor activity detected!', ar: 'تم اكتشاف نشاط منافس!' },
      thinking: { en: 'Identifying market opportunities...', ar: 'تحديد فرص السوق...' },
    },
  },
  CEO: {
    role: 'CEO',
    name: 'Orion',
    nameAr: 'أوريون',
    avatar: '👔',
    color: '#7F5AF0',
    personality: {
      tone: 'strategic',
      traits: ['visionary', 'decisive', 'balanced', 'leadership-focused'],
    },
    specialization: ['Strategic Planning', 'Decision Making', 'Growth Strategy', 'Overall Direction'],
    catchphrases: {
      greeting: { en: 'Let\'s chart the course to success.', ar: 'لنرسم طريق النجاح.' },
      success: { en: 'Strategic objectives aligned perfectly!', ar: 'الأهداف الاستراتيجية متوافقة تماماً!' },
      warning: { en: 'Critical decision required.', ar: 'قرار حاسم مطلوب.' },
      thinking: { en: 'Evaluating strategic options...', ar: 'تقييم الخيارات الاستراتيجية...' },
    },
  },
};

const createFallbackMessages = (language: 'en' | 'ar'): AICopilotMessage[] => [
  {
    id: 'cfo-empty',
    copilotRole: 'CFO',
    type: 'question',
    priority: 'low',
    title: language === 'ar' ? 'أكمل المستوى 0 أولاً' : 'Complete Level 0 first',
    titleAr: 'أكمل المستوى 0 أولاً',
    content: language === 'ar'
      ? 'يرجى إنهاء اختيار نوع المشروع في المستوى 0 حتى أتمكن من تحليل احتياجاتك المالية والترخيص.'
      : 'Please finish the project type selection in Level 0 so I can analyze your financials and licensing needs.',
    contentAr: language === 'ar'
      ? 'يرجى إنهاء اختيار نوع المشروع في المستوى 0 حتى أتمكن من تحليل احتياجاتك المالية والترخيص.'
      : 'Please finish the project type selection in Level 0 so I can analyze your financials and licensing needs.',
    timestamp: Date.now(),
    read: false,
    actionable: false,
  },
  {
    id: 'cmo-empty',
    copilotRole: 'CMO',
    type: 'question',
    priority: 'low',
    title: language === 'ar' ? 'اختر نوع المشروع أولاً' : 'Choose your project type first',
    titleAr: 'اختر نوع المشروع أولاً',
    content: language === 'ar'
      ? 'أكمل المستوى 0 حتى أتمكن من تقديم اقتراحات التسويق واستراتيجية السوق الخاصة بك.'
      : 'Complete Level 0 so I can provide market positioning, competitor insight, and customer strategy.',
    contentAr: language === 'ar'
      ? 'أكمل المستوى 0 حتى أتمكن من تقديم اقتراحات التسويق واستراتيجية السوق الخاصة بك.'
      : 'Complete Level 0 so I can provide market positioning, competitor insight, and customer strategy.',
    timestamp: Date.now(),
    read: false,
    actionable: false,
  },
  {
    id: 'ceo-empty',
    copilotRole: 'CEO',
    type: 'question',
    priority: 'low',
    title: language === 'ar' ? 'ابدأ بالمستوى 0' : 'Start with Level 0',
    titleAr: 'ابدأ بالمستوى 0',
    content: language === 'ar'
      ? 'أكمل الإعداد الأولي للمشروع في المستوى 0 قبل أن أتمكن من تقديم نظرة استراتيجية.'
      : 'Finish the initial project setup in Level 0 before I can give you a strategic overview.',
    contentAr: language === 'ar'
      ? 'أكمل الإعداد الأولي للمشروع في المستوى 0 قبل أن أتمكن من تقديم نظرة استراتيجية.'
      : 'Finish the initial project setup in Level 0 before I can give you a strategic overview.',
    timestamp: Date.now(),
    read: false,
    actionable: false,
  },
];

const getCopilotRateLimitError = (language: 'en' | 'ar') =>
  language === 'ar'
    ? 'لقد تجاوزنا حد التحديث. حاول مرة أخرى بعد 10 ثوانٍ.'
    : 'You have reached the refresh limit. Please try again in 10 seconds.';

export function CopilotBridge({ language, onMessageRead, onActionTaken }: CopilotBridgeProps) {
  const { moduleData, projectTypeData, studyModeData, enhancedSWOT, financialKPIs, bmcData, oman2040 } = useYieldX();
  const [selectedCopilot, setSelectedCopilot] = useState<AICopilotRole | null>('CFO');
  const [messages, setMessages] = useState<AICopilotMessage[]>([]);
  const [showBridge, setShowBridge] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState<Record<AICopilotRole, boolean>>({ CFO: false, CMO: false, CEO: false });
  const [errorRoles, setErrorRoles] = useState<Record<AICopilotRole, string | null>>({ CFO: null, CMO: null, CEO: null });
  const [cachedProjectKey, setCachedProjectKey] = useState<string>('');
  const lastGeneratedAt = useRef<number>(0);

  const projectData = useMemo(
    () => ({ projectTypeData, studyModeData, enhancedSWOT, financialKPIs, bmcData, oman2040, moduleData }),
    [projectTypeData, studyModeData, enhancedSWOT, financialKPIs, bmcData, oman2040, moduleData]
  );

  const currentProjectKey = useMemo(() => {
    try {
      return JSON.stringify(projectData);
    } catch {
      return String(projectData);
    }
  }, [projectData]);

  const hasProjectData = Boolean(projectTypeData || Object.keys(moduleData).length > 0);

  const setRoleLoading = (role: AICopilotRole, value: boolean) => {
    setLoadingRoles((prev) => ({ ...prev, [role]: value }));
  };

  const setRoleError = (role: AICopilotRole, message: string | null) => {
    setErrorRoles((prev) => ({ ...prev, [role]: message }));
  };

  const mergeRoleMessages = (role: AICopilotRole, roleMessages: AICopilotMessage[]) => {
    setMessages((prev) => [
      ...prev.filter((message) => message.copilotRole !== role),
      ...roleMessages,
    ]);
  };

  const getFallbackForRole = (role: AICopilotRole) => createFallbackMessages(language).filter((message) => message.copilotRole === role);

  const fetchRoleInsights = async (role: AICopilotRole) => {
    if (Date.now() - lastGeneratedAt.current < 10000) {
      throw new Error('rate_limit');
    }

    setRoleLoading(role, true);
    setRoleError(role, null);

    try {
      const roleMessages = hasProjectData
        ? await (role === 'CFO'
          ? generateCFOInsights(projectData, language)
          : role === 'CMO'
            ? generateCMOInsights(projectData, language)
            : generateCEOInsights(projectData, language))
        : getFallbackForRole(role);

      mergeRoleMessages(role, roleMessages);
      setCachedProjectKey(currentProjectKey);
      lastGeneratedAt.current = Date.now();
    } catch (error) {
      const isRateLimited = error instanceof Error && error.message === 'rate_limit';
      const errorMessage = isRateLimited
        ? getCopilotRateLimitError(language)
        : language === 'ar'
          ? 'تعذر الحصول على رؤى الذكاء الاصطناعي الآن. حاول مرة أخرى لاحقاً.'
          : 'Unable to fetch AI insights right now. Please try again later.';
      setRoleError(role, errorMessage);
      console.error('CopilotBridge error:', error);
    } finally {
      setRoleLoading(role, false);
    }
  };

  const fetchAllInsights = async () => {
    if (!hasProjectData && cachedProjectKey === currentProjectKey && messages.length > 0) {
      return;
    }

    if (Date.now() - lastGeneratedAt.current < 10000 && cachedProjectKey === currentProjectKey) {
      return;
    }

    await Promise.allSettled((['CFO', 'CMO', 'CEO'] as AICopilotRole[]).map((role) => fetchRoleInsights(role)));
  };

  useEffect(() => {
    const handleInsightsGenerated = (event: Event) => {
      const customEvent = event as CustomEvent<{ role: AICopilotRole; messages: AICopilotMessage[] }>; 
      if (!customEvent?.detail?.role || !customEvent?.detail?.messages) return;
      mergeRoleMessages(customEvent.detail.role, customEvent.detail.messages);
      setRoleError(customEvent.detail.role, null);
      setCachedProjectKey(currentProjectKey);
      lastGeneratedAt.current = Date.now();
    };

    const handleInsightsError = (event: Event) => {
      const customEvent = event as CustomEvent<{ role: AICopilotRole; error: string }>; 
      if (!customEvent?.detail?.role) return;
      setRoleError(customEvent.detail.role, customEvent.detail.error || (language === 'ar' ? 'حدث خطأ في الذكاء الاصطناعي' : 'AI copilot error occurred'));
    };

    window.addEventListener('yieldx:copilot-insights-generated', handleInsightsGenerated as EventListener);
    window.addEventListener('yieldx:copilot-insights-error', handleInsightsError as EventListener);

    return () => {
      window.removeEventListener('yieldx:copilot-insights-generated', handleInsightsGenerated as EventListener);
      window.removeEventListener('yieldx:copilot-insights-error', handleInsightsError as EventListener);
    };
  }, [currentProjectKey, language]);

  useEffect(() => {
    if (!showBridge) return;
    if (!selectedCopilot) setSelectedCopilot('CFO');
    if (currentProjectKey !== cachedProjectKey || messages.length === 0) {
      void fetchAllInsights();
    }
  }, [showBridge, currentProjectKey]);

  const getCopilotIcon = (role: AICopilotRole) => {
    switch (role) {
      case 'CFO':
        return <DollarSign className="w-6 h-6" />;
      case 'CMO':
        return <TrendingUp className="w-6 h-6" />;
      case 'CEO':
        return <Users className="w-6 h-6" />;
    }
  };

  const getMessageIcon = (type: AICopilotMessage['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'suggestion':
        return <Zap className="w-5 h-5 text-blue-400" />;
      case 'insight':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'celebration':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: AICopilotMessage['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10';
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <>
      {/* Floating Bridge Access Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] shadow-2xl flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowBridge(!showBridge)}
        animate={{
          boxShadow: unreadCount > 0 
            ? ['0 0 20px #4ECDC4', '0 0 40px #4ECDC4', '0 0 20px #4ECDC4']
            : '0 10px 30px rgba(78, 205, 196, 0.3)',
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity },
        }}
      >
        <Brain className="w-8 h-8 text-white" />
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* AI Copilot Bridge Panel */}
      <AnimatePresence>
        {showBridge && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBridge(false)}
          >
            <motion.div
              className="relative w-full max-w-6xl h-[80vh] bg-gradient-to-br from-[#1A1A2E] to-[#0A0A1B] rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative z-10 px-8 py-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {language === 'ar' ? 'جسر الطيارين الآليين' : 'AI Copilot Bridge'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {language === 'ar' 
                        ? 'فريق الذكاء الاصطناعي الخاص بك على استعداد لمساعدتك' 
                        : 'Your AI team ready to assist'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBridge(false)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="flex h-[calc(100%-88px)]">
                {/* Copilot Selection Sidebar */}
                <div className="w-80 border-r border-white/10 bg-white/5 p-6 overflow-y-auto">
                  <h3 className="text-white font-semibold mb-4">
                    {language === 'ar' ? 'اختر مستشاراً' : 'Select Copilot'}
                  </h3>
                  
                  <div className="space-y-3">
                    {(Object.keys(copilotPersonalities) as AICopilotRole[]).map((role) => {
                      const copilot = copilotPersonalities[role];
                      const roleMessages = messages.filter(m => m.copilotRole === role);
                      const unreadRoleMessages = roleMessages.filter(m => !m.read).length;

                      return (
                        <motion.button
                          key={role}
                          className={`
                            w-full p-4 rounded-xl border-2 transition-all text-left
                            ${selectedCopilot === role
                              ? 'border-[#4ECDC4] bg-[#4ECDC4]/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCopilot(role)}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                              style={{ backgroundColor: `${copilot.color}20` }}
                            >
                              {copilot.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-white font-bold">
                                  {language === 'ar' ? copilot.nameAr : copilot.name}
                                </h4>
                                {unreadRoleMessages > 0 && (
                                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                                    {unreadRoleMessages}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs mb-2">
                                {role}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {copilot.personality.traits.slice(0, 2).map((trait) => (
                                  <span 
                                    key={trait}
                                    className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-xs"
                                  >
                                    {trait}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                  {selectedCopilot ? (
                    <>
                      {/* Copilot Header */}
                      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${copilotPersonalities[selectedCopilot].color}20` }}
                          >
                            {copilotPersonalities[selectedCopilot].avatar}
                          </div>
                          <div>
                            <h3 className="text-white font-bold">
                              {language === 'ar' 
                                ? copilotPersonalities[selectedCopilot].nameAr
                                : copilotPersonalities[selectedCopilot].name
                              }
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {language === 'ar'
                                ? copilotPersonalities[selectedCopilot].catchphrases.greeting.ar
                                : copilotPersonalities[selectedCopilot].catchphrases.greeting.en
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Messages List */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {errorRoles[selectedCopilot] && (
                          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100 text-sm">
                            {errorRoles[selectedCopilot]}
                          </div>
                        )}
                        {loadingRoles[selectedCopilot] && (
                          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-100 text-sm">
                            {language === 'ar'
                              ? copilotPersonalities[selectedCopilot].catchphrases.thinking.ar
                              : copilotPersonalities[selectedCopilot].catchphrases.thinking.en
                            }
                          </div>
                        )}
                        {messages
                          .filter(m => m.copilotRole === selectedCopilot)
                          .map((message) => (
                            <motion.div
                              key={message.id}
                              className={`
                                p-4 rounded-xl border-2 ${getPriorityColor(message.priority)}
                                backdrop-blur-sm transition-all
                                ${!message.read ? 'ring-2 ring-white/20' : ''}
                              `}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {getMessageIcon(message.type)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-bold mb-1">
                                    {language === 'ar' ? message.titleAr : message.title}
                                  </h4>
                                  <p className="text-gray-300 text-sm mb-3">
                                    {language === 'ar' ? message.contentAr : message.content}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                    <span>•</span>
                                    <span className="capitalize">{message.priority} priority</span>
                                  </div>
                                  {message.actions && message.actions.length > 0 && (
                                    <div className="mt-3 flex gap-2">
                                      {message.actions.map((action) => (
                                        <button
                                          key={action.id}
                                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
                                          onClick={() => {
                                            onActionTaken(message.id, action.id);
                                            action.callback();
                                          }}
                                        >
                                          {language === 'ar' ? action.labelAr : action.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">
                          {language === 'ar'
                            ? 'اختر مستشار ذكاء اصطناعي للبدء'
                            : 'Select an AI Copilot to begin'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
