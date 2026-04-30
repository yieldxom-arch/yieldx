import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  MessageCircle,
  Send,
  CreditCard,
  CheckCircle2,
  Star,
  Award,
  Briefcase,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';

interface Professional {
  id: string;
  name: string;
  nameAr: string;
  expertise: string;
  expertiseAr: string;
  rating: number;
  reviewsCount: number;
  responseTime: string;
  responseTimeAr: string;
  pricePerMessage: number;
  verified: boolean;
  consultations: number;
  bio: string;
  bioAr: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'professional';
  content: string;
  timestamp: string;
  paid: boolean;
}

const PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Dr. Ahmed Al-Saidi',
    nameAr: 'د. أحمد السعيدي',
    expertise: 'Business Strategy',
    expertiseAr: 'استراتيجية الأعمال',
    rating: 4.9,
    reviewsCount: 156,
    responseTime: 'Less than 2 hours',
    responseTimeAr: 'أقل من ساعتين',
    pricePerMessage: 5,
    verified: true,
    consultations: 450,
    bio: 'Business strategy expert with over 15 years of experience in helping startups',
    bioAr: 'خبير في استراتيجية الأعمال وتطوير الشركات الناشئة مع أكثر من 15 عاماً من الخبرة',
  },
  {
    id: '2',
    name: 'Sara Al-Hinai',
    nameAr: 'سارة الهنائية',
    expertise: 'Financial Planning',
    expertiseAr: 'التخطيط المالي',
    rating: 4.8,
    reviewsCount: 203,
    responseTime: 'Less than 3 hours',
    responseTimeAr: 'أقل من 3 ساعات',
    pricePerMessage: 4,
    verified: true,
    consultations: 520,
    bio: 'Certified financial consultant specializing in financial planning for SMEs',
    bioAr: 'مستشارة مالية معتمدة متخصصة في التخطيط المالي للشركات الصغيرة والمتوسطة',
  },
  {
    id: '3',
    name: 'Mohammed Al-Balushi',
    nameAr: 'محمد البلوشي',
    expertise: 'Marketing',
    expertiseAr: 'التسويق',
    rating: 4.7,
    reviewsCount: 189,
    responseTime: 'Less than 4 hours',
    responseTimeAr: 'أقل من 4 ساعات',
    pricePerMessage: 4,
    verified: false,
    consultations: 380,
    bio: 'Marketing expert with focus on social media marketing and community building',
    bioAr: 'خبير تسويق رقمي مع تركيز على التسويق عبر وسائل التواصل الاجتماعي',
  },
];

export function ProfessionalConsultation() {
  const { setCurrentView, language } = useYieldX();
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [freeMessagesLeft, setFreeMessagesLeft] = useState(3);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Get translations
  const t = translations[language];
  const isRTL = language === 'ar';

  const handleSendMessage = (paid: boolean) => {
    if (!message.trim() || !selectedProfessional) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      paid,
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage('');

    if (!paid) {
      setFreeMessagesLeft(freeMessagesLeft - 1);
    }

    // Simulate professional response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'professional',
        content: isRTL 
          ? `شكراً لسؤالك! سأساعدك في ${selectedProfessional.expertiseAr}. يمكنني تقديم النصيحة التالية...`
          : `Thank you for your question! I'll help you with ${selectedProfessional.expertise}. Here's my advice...`,
        timestamp: new Date().toISOString(),
        paid: false,
      };
      setChatMessages((prev) => [...prev, response]);
    }, 2000);
  };

  const handlePayAndSend = () => {
    setShowPaymentModal(false);
    handleSendMessage(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => {
          if (selectedProfessional) {
            setSelectedProfessional(null);
          } else {
            setCurrentView('dashboard');
          }
        }}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-50 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 hover:border-[#4ECDC4] text-gray-700 dark:text-gray-300 rounded-lg transition-all shadow-sm hover:shadow-md group"
      >
        {isRTL ? (
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        ) : (
          <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        )}
        <span className="font-semibold">
          {selectedProfessional ? t.consultation.backToList : t.consultation.backToDashboard}
        </span>
      </motion.button>

      {!selectedProfessional ? (
        <>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                {t.consultation.title}
              </h1>
            </div>
            <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'mr-16' : 'ml-16'}`}>
              {t.consultation.subtitle}
            </p>
          </motion.div>

          {/* Free Trial Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-500/30 rounded-xl shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.consultation.freeTrial}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isRTL ? `لديك ${freeMessagesLeft} ${t.consultation.freeMessagesLeft}` : `You have ${freeMessagesLeft} ${t.consultation.freeMessagesLeft}`}
                  </p>
                </div>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-3xl font-bold text-green-500">{freeMessagesLeft}/3</p>
              </div>
            </div>
          </motion.div>

          {/* Professionals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROFESSIONALS.map((professional, index) => (
              <motion.div
                key={professional.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl p-6 hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => setSelectedProfessional(professional)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {(isRTL ? professional.nameAr : professional.name).charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {isRTL ? professional.nameAr : professional.name}
                        {professional.verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                      </h3>
                      <p className="text-sm text-[#4ECDC4]">
                        {isRTL ? professional.expertiseAr : professional.expertise}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {isRTL ? professional.bioAr : professional.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    <span className="text-slate-900 dark:text-white font-semibold">{professional.rating}</span>
                    <span className="text-gray-500 dark:text-gray-400">({professional.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{professional.consultations} {t.consultation.consultations}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{isRTL ? professional.responseTimeAr : professional.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#4ECDC4]">
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {isRTL 
                        ? `${professional.pricePerMessage} ر.ع / رسالة`
                        : `${professional.pricePerMessage} OMR / ${t.consultation.perMessage}`
                      }
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full py-3 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white rounded-lg font-semibold shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {t.consultation.startConversation}
                </button>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        /* Chat Interface */
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl p-6 mb-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {(isRTL ? selectedProfessional.nameAr : selectedProfessional.name).charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {isRTL ? selectedProfessional.nameAr : selectedProfessional.name}
                    {selectedProfessional.verified && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                  </h2>
                  <p className="text-[#4ECDC4]">
                    {isRTL ? selectedProfessional.expertiseAr : selectedProfessional.expertise}
                  </p>
                </div>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {isRTL 
                      ? `يرد خلال ${selectedProfessional.responseTimeAr}`
                      : `${t.consultation.responds} ${selectedProfessional.responseTime}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedProfessional.rating}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Free Messages Counter */}
          {freeMessagesLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {isRTL 
                    ? `لديك ${freeMessagesLeft} رسائل مجانية متبقية`
                    : `You have ${freeMessagesLeft} ${t.consultation.freeMessagesLeft}`
                  }
                </span>
              </div>
            </motion.div>
          )}

          {/* Chat Messages */}
          <div className="bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl p-6 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto shadow-lg">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL 
                    ? `ابدأ المحادثة مع ${selectedProfessional.nameAr}`
                    : `${t.consultation.startChatWith} ${selectedProfessional.name}`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-xl ${
                        msg.sender === 'user'
                          ? 'bg-gray-100 dark:bg-gray-800 text-slate-900 dark:text-white'
                          : 'bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] text-white'
                      }`}
                    >
                      <p className="mb-1">{msg.content}</p>
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.paid && <CreditCard className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl p-4 shadow-lg">
            <div className="flex gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.consultation.typeQuestion}
                rows={3}
                className="flex-1 bg-white dark:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors resize-none"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <button
                onClick={() => {
                  if (freeMessagesLeft > 0) {
                    handleSendMessage(false);
                  } else {
                    setShowPaymentModal(true);
                  }
                }}
                disabled={!message.trim()}
                className="px-6 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {freeMessagesLeft > 0 
                  ? t.consultation.sendFree 
                  : (isRTL 
                    ? `إرسال (${selectedProfessional.pricePerMessage} ر.ع)` 
                    : `${t.consultation.send} (${selectedProfessional.pricePerMessage} OMR)`
                  )
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/30 rounded-2xl max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {t.consultation.paymentTitle}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.consultation.paymentDesc}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-[#4ECDC4]/10 to-[#7FDBCA]/10 border border-[#4ECDC4]/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{t.consultation.messageCost}:</span>
                    <span className="text-2xl font-bold text-[#4ECDC4]">
                      {selectedProfessional?.pricePerMessage} {isRTL ? 'ر.ع' : 'OMR'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                  >
                    {t.consultation.cancel}
                  </button>
                  <button
                    onClick={handlePayAndSend}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {t.consultation.payAndSend}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
