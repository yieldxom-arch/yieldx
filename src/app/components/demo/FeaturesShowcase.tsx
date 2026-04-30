import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Brain, 
  TrendingUp, 
  Award,
  Zap,
  ChevronRight,
  Star,
  DollarSign,
  Globe
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  color: string;
  highlights: string[];
  highlightsAr: string[];
}

const revolutionaryFeatures: Feature[] = [
  {
    id: 'colony',
    icon: <Rocket className="w-8 h-8" />,
    title: 'Space Colony Simulation',
    titleAr: 'محاكاة المستعمرة الفضائية',
    description: 'Build and manage your business as an interstellar colony. Watch it grow with every completed module!',
    descriptionAr: 'ابنِ وأدر عملك كمستعمرة بين النجوم. شاهدها تنمو مع كل وحدة مكتملة!',
    color: '#4ECDC4',
    highlights: [
      '⚡ Energy, 💰 Credits, 👥 Population resources',
      '🌠 Cosmic events = Market conditions',
      '🏗️ Visual colony growth',
      '📊 Real-time production tracking'
    ],
    highlightsAr: [
      'موارد: ⚡ الطاقة، 💰 الاعتمادات، 👥 السكان',
      'أحداث كونية 🌠 = ظروف السوق',
      'نمو المستعمرة المرئي 🏗️',
      'تتبع الإنتاج في الوقت الفعلي 📊'
    ],
  },
  {
    id: 'ai-copilot',
    icon: <Brain className="w-8 h-8" />,
    title: 'AI Business Officers',
    titleAr: 'مسؤولو الأعمال بالذكاء الاصطناعي',
    description: 'Meet Atlas (CFO), Nova (CMO), and Orion (CEO) - Your AI team with unique personalities!',
    descriptionAr: 'تعرف على أطلس ونوفا وأوريون - فريق الذكاء الاصطناعي بشخصيات فريدة!',
    color: '#FF6B9D',
    highlights: [
      '💰 CFO: Cash flow & financial health',
      '📈 CMO: Marketing & competitor analysis',
      '👔 CEO: Strategic decisions & direction',
      '🤖 Each with unique personality & voice'
    ],
    highlightsAr: [
      'المدير المالي 💰: التدفق النقدي والصحة المالية',
      'مدير التسويق 📈: التسويق وتحليل المنافسين',
      'الرئيس التنفيذي 👔: القرارات والاتجاه الاستراتيجي',
      'كل منهم بشخصية وصوت فريد 🤖'
    ],
  },
  {
    id: 'market-engine',
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Market Reality Engine',
    titleAr: 'محرك واقع السوق',
    description: 'Live market data affects your simulation. Compete with AI opponents and collaborate during crises!',
    descriptionAr: 'بيانات السوق المباشرة تؤثر على المحاكاة. تنافس مع خصوم الذكاء الاصطناعي!',
    color: '#7F5AF0',
    highlights: [
      '📊 Real market data integration',
      '🤖 Adaptive competitor AI',
      '🌍 Global economic events',
      '🤝 Player collaboration challenges'
    ],
    highlightsAr: [
      'تكامل بيانات السوق الحقيقية 📊',
      'ذكاء اصطناعي منافس قابل للتكيف 🤖',
      'أحداث اقتصادية عالمية 🌍',
      'تحديات تعاون اللاعبين 🤝'
    ],
  },
  {
    id: 'nft-certificates',
    icon: <Award className="w-8 h-8" />,
    title: 'Blockchain NFT Certificates',
    titleAr: 'شهادات NFT بتقنية البلوكتشين',
    description: 'Mint your completed business plans as verifiable NFTs. Share with investors and universities!',
    descriptionAr: 'اسكّ خططك التجارية المكتملة كـ NFTs قابلة للتحقق. شاركها مع المستثمرين!',
    color: '#FFD700',
    highlights: [
      '🎨 6 rarity tiers (Bronze → Cosmic)',
      '🔗 Blockchain verified credentials',
      '📱 QR code verification',
      '💎 Tradeable achievements'
    ],
    highlightsAr: [
      '6 مستويات نادرة 🎨 (برونزي → كوزمي)',
      'بيانات اعتماد محققة بالبلوكتشين 🔗',
      'تحقق برمز QR 📱',
      'إنجازات قابلة للتداول 💎'
    ],
  },
  {
    id: 'warp-drive',
    icon: <Star className="w-8 h-8" />,
    title: 'Warp Drive Learning Paths',
    titleAr: 'مسارات التعلم بمحرك الالتواء',
    description: 'Non-linear progression through 7 galaxies. Wormholes, asteroid belts, and black hole challenges!',
    descriptionAr: 'تقدم غير خطي عبر 7 مجرات. ثقوب دودية، أحزمة كويكبات، وتحديات ثقوب سوداء!',
    color: '#5DD9C1',
    highlights: [
      '🌌 7 business sector galaxies',
      '🌀 Wormholes for accelerated learning',
      '☄️ Micro-course asteroid belts',
      '⚫ Extreme black hole challenges'
    ],
    highlightsAr: [
      '7 مجرات لقطاعات الأعمال 🌌',
      'ثقوب دودية للتعلم المتسارع 🌀',
      'أحزمة كويكبات للدورات الصغيرة ☄️',
      'تحديات الثقوب السوداء الشديدة ⚫'
    ],
  },
];

interface FeaturesShowcaseProps {
  language: 'en' | 'ar';
}

export function FeaturesShowcase({ language }: FeaturesShowcaseProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature>(revolutionaryFeatures[0]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const { setCurrentView } = useYieldX();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1B] via-[#1A1A2E] to-[#0A0A1B] py-20 px-6">
      {/* Header */}
      <motion.div
        className="max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-block mb-4"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Zap className="w-16 h-16 text-[#4ECDC4] mx-auto" />
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          {language === 'ar' ? 'ميزات ثورية' : 'Revolutionary Features'}
        </h1>
        
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          {language === 'ar'
            ? 'اكتشف الجيل التالي من تعليم ريادة الأعمال مع تقنيات رائدة'
            : 'Discover the next generation of entrepreneurship education with groundbreaking technologies'
          }
        </p>

        {/* Version Badge */}
        <motion.div
          className="inline-block mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white font-bold text-lg"
          animate={{
            boxShadow: [
              '0 0 20px rgba(78, 205, 196, 0.3)',
              '0 0 40px rgba(78, 205, 196, 0.6)',
              '0 0 20px rgba(78, 205, 196, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          YieldX V2.0
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature List */}
          <div className="space-y-4">
            {revolutionaryFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                className={`
                  relative cursor-pointer rounded-2xl border-2 transition-all
                  ${expandedIndex === index
                    ? 'bg-white/10 backdrop-blur-xl border-white/30'
                    : 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20'
                  }
                `}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setExpandedIndex(expandedIndex === index ? null : index);
                  setSelectedFeature(feature);
                }}
              >
                {/* Glow Effect */}
                {expandedIndex === index && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl blur-xl"
                    style={{ backgroundColor: `${feature.color}40` }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="relative z-10 p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                      >
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {language === 'ar' ? feature.titleAr : feature.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {language === 'ar' ? feature.descriptionAr : feature.description}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedIndex === index ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </motion.div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-white/10">
                          <h4 className="text-white font-semibold mb-3">
                            {language === 'ar' ? 'النقاط البارزة' : 'Highlights'}
                          </h4>
                          <ul className="space-y-2">
                            {(language === 'ar' ? feature.highlightsAr : feature.highlights).map((highlight, idx) => (
                              <motion.li
                                key={idx}
                                className="text-gray-300 text-sm flex items-start gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <span className="text-[#4ECDC4] mt-0.5">▸</span>
                                <span>{highlight}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Visualization */}
          <motion.div
            className="relative rounded-3xl border-2 border-white/20 bg-white/5 backdrop-blur-xl overflow-hidden"
            layout
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFeature.id}
                className="p-8 h-full min-h-[600px] flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Large Icon */}
                <motion.div
                  className="w-32 h-32 rounded-3xl flex items-center justify-center mb-8"
                  style={{ backgroundColor: `${selectedFeature.color}20`, color: selectedFeature.color }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {React.cloneElement(selectedFeature.icon as React.ReactElement, {
                    className: 'w-16 h-16',
                  })}
                </motion.div>

                {/* Title */}
                <h2 className="text-4xl font-bold text-white text-center mb-4">
                  {language === 'ar' ? selectedFeature.titleAr : selectedFeature.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-300 text-center mb-8 max-w-md">
                  {language === 'ar' ? selectedFeature.descriptionAr : selectedFeature.description}
                </p>

                {/* Feature Stats */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  {selectedFeature.highlights.slice(0, 4).map((highlight, idx) => (
                    <motion.div
                      key={idx}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <p className="text-gray-300 text-sm text-center">
                        {language === 'ar' ? selectedFeature.highlightsAr[idx] : highlight}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ backgroundColor: selectedFeature.color, opacity: 0.3 }}
                      animate={{
                        x: [Math.random() * 400, Math.random() * 400],
                        y: [Math.random() * 600, Math.random() * 600],
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        className="max-w-4xl mx-auto mt-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-3xl font-bold text-white mb-6">
          {language === 'ar' ? 'جاهز لبدء رحلتك؟' : 'Ready to Start Your Journey?'}
        </h3>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
        >
          {language === 'ar' ? 'ابدأ الآن' : 'Get Started Now'}
        </button>
      </motion.div>
    </div>
  );
}