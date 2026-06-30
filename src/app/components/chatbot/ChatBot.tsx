import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, HelpCircle } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { sendChatMessage } from '@/app/services/chatbotService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

interface FAQ {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    question: 'ما هو YieldX؟',
    questionEn: 'What is YieldX?',
    answer: 'YieldX هو منصة تعليمية متقدمة لدراسة جدوى الأعمال بنظام لعبي وثيم فضائي. يتضمن 8 مستويات (0-7) وفق معايير دراسة الجدوى العُمانية، تغطي جميع جوانب المشروع من اختيار النوع وحتى نموذج الأعمال الشامل.',
    answerEn: "YieldX is an advanced educational platform for business feasibility studies, built around a gamified, space-themed experience. It includes 8 levels (0–7) aligned with Omani feasibility study standards, covering every aspect of your project from choosing its type to building a complete business model.",
    keywords: ['يلدكس', 'yieldx', 'ما هو', 'منصة', 'تعريف', 'عن', 'شو', 'ايش', 'وش', 'المنصة', 'البرنامج', 'التطبيق', 'النظام', 'what is', 'about', 'platform']
  },
  {
    question: 'كيف أبدأ مستوى جديد؟',
    questionEn: 'How do I start a new level?',
    answer: 'لبدء مستوى جديد، اضغط على بطاقة المستوى في الخريطة الفضائية. إذا كان المستوى مفتوحاً، ستظهر لك التفاصيل والأهداف التعليمية. اضغط "ابدأ" للدخول إلى المستوى.',
    answerEn: 'To start a new level, click its card on the Space Map. If the level is unlocked, you\'ll see its details and learning objectives. Click "Start" to enter the level.',
    keywords: ['ابدأ', 'بدء', 'مستوى جديد', 'كيف', 'فتح مستوى', 'بداية', 'ابدا', 'البدء', 'فتح', 'افتح', 'شغل', 'كيفية', 'طريقة', 'خطوات', 'start', 'new level', 'how to start', 'begin']
  },
  {
    question: 'كيف أقوم بتسليم المهام؟',
    questionEn: 'How do I submit assignments?',
    answer: 'في كل مستوى، ستجد زر "تسليم المهمة" بعد إكمال المحتوى. املأ جميع الحقول المطلوبة ثم اضغط على زر التسليم. يمكنك رفع ملفات PDF أو Word أو صور.',
    answerEn: 'In each level, you\'ll find a "Submit Assignment" button once you\'ve completed the content. Fill in all required fields, then click submit. You can upload PDF, Word, or image files.',
    keywords: ['تسليم', 'مهمة', 'رفع', 'ملف', 'إرسال', 'submission', 'اسلم', 'سلم', 'مهام', 'واجب', 'واجبات', 'كيف اسلم', 'كيف ارفع', 'ارسل', 'رفع ملف', 'submit', 'assignment', 'upload', 'how to submit']
  },
  {
    question: 'ما هي النقاط (XP) وكيف أحصل عليها؟',
    questionEn: 'What are XP points and how do I earn them?',
    answer: 'النقاط (XP) هي نقاط الخبرة التي تكسبها عند إكمال المستويات. كل مستوى له نقاط محددة. تحصل على النقاط الكاملة عند التسليم في الموعد المحدد وبعد تقييم المدرس.',
    answerEn: 'XP (experience points) are points you earn by completing levels. Each level has a set amount of XP. You receive the full amount when you submit on time and after your teacher grades your work.',
    keywords: ['نقاط', 'xp', 'خبرة', 'احصل', 'كسب', 'points', 'النقاط', 'كيف احصل', 'اكسب', 'نقطة', 'experience', 'كم نقطة', 'earn xp', 'how to earn']
  },
  {
    question: 'كيف أتتبع تقدمي؟',
    questionEn: 'How do I track my progress?',
    answer: 'يمكنك تتبع تقدمك من لوحة المعلومات الرئيسية. ستجد إجمالي النقاط، المستويات المكتملة، والتقدم الإجمالي. كما يمكنك عرض التقرير الشامل من زر "عرض التقرير".',
    answerEn: 'You can track your progress from the main dashboard. You\'ll find your total XP, completed levels, and overall progress there. You can also view a full report using the "View Report" button.',
    keywords: ['تتبع', 'تقدم', 'progress', 'نسبة', 'إنجاز', 'completion', 'تتبع تقدمي', 'شوف تقدمي', 'مستواي', 'وين وصلت', 'كم انجزت', 'track progress', 'my progress']
  },
  {
    question: 'ماذا تعني حالات التسليم المختلفة؟',
    questionEn: 'What do the different submission statuses mean?',
    answer: '• "غير مُبدأ": لم تبدأ العمل بعد\n• "قيد العمل": بدأت لكن لم تسلم\n• "مُسلّم": تم التسليم وينتظر التصحيح\n• "تم التصحيح": تم تقييم عملك من المدرس\n• "متأخر": تم التسليم بعد الموعد المحدد',
    answerEn: '• "Not Started": you haven\'t begun working yet\n• "In Progress": you\'ve started but haven\'t submitted\n• "Submitted": submitted and awaiting grading\n• "Graded": your teacher has reviewed and graded your work\n• "Late": submitted after the deadline',
    keywords: ['حالة', 'تسليم', 'status', 'مُسلم', 'متأخر', 'قيد العمل', 'حالات', 'معنى', 'شو يعني', 'ايش معنى', 'submission status', 'what does it mean']
  },
  {
    question: 'كيف أغير اللغة أو السمة؟',
    questionEn: 'How do I change the language or theme?',
    answer: 'اضغط على زر الإعدادات (⚙️) في الشريط العلوي. يمكنك تغيير اللغة بين العربية والإنجليزية، وتبديل السمة بين الوضع المظلم والفاتح، واختيار عملتك المفضلة.',
    answerEn: 'Click the settings button (⚙️) in the top bar. There you can switch the language between Arabic and English, toggle between dark and light mode, and choose your preferred currency.',
    keywords: ['إعدادات', 'لغة', 'سمة', 'theme', 'settings', 'language', 'عربي', 'انجليزي', 'تغيير', 'غير', 'اللغة', 'السمة', 'مظلم', 'فاتح', 'dark', 'light', 'change language']
  },
  {
    question: 'ما هي المشاريع (Projects) والمجموعات (Cohorts)؟',
    questionEn: 'What are Projects and Cohorts?',
    answer: 'المشاريع هي مساحات عمل منفصلة لكل مشروع تجاري. المجموعات هي مجموعات الطلاب المسجلين في دورة معينة. المدرسون يديرون المجموعات ويراقبون تقدم الطلاب.',
    answerEn: 'Projects are separate workspaces, one for each business project. Cohorts are groups of students enrolled in a particular course. Teachers manage cohorts and monitor student progress.',
    keywords: ['مشروع', 'مجموعة', 'project', 'cohort', 'workspace', 'طلاب', 'مدرس', 'المشاريع', 'المجموعات', 'فريق', 'دورة', 'projects', 'cohorts']
  },
  {
    question: 'كيف يمكن للمدرس تقييم عملي؟',
    questionEn: 'How does my teacher grade my work?',
    answer: 'عند تسليم المهمة، يصل إشعار للمدرس. سيقوم بمراجعة عملك وإعطائك درجة وملاحظات. ستجد التقييم في تفاصيل المستوى وستحصل على إشعار عند التصحيح.',
    answerEn: 'When you submit an assignment, your teacher gets notified. They\'ll review your work and give you a grade and feedback. You\'ll find the grading in the level details, and you\'ll be notified once it\'s graded.',
    keywords: ['تقييم', 'درجة', 'مدرس', 'grade', 'feedback', 'ملاحظات', 'تصحيح', 'المدرس', 'المعلم', 'الدرجة', 'كيف يقيم', 'التقييم', 'how does grading work', 'teacher grade']
  },
  {
    question: 'كيف أنضم إلى مجموعة دراسية؟',
    questionEn: 'How do I join a study cohort?',
    answer: 'يمكنك الانضمام بطريقتين:\n1. مسح رمز QR من المدرس باستخدام الكاميرا\n2. إدخال كود المجموعة يدوياً (6 أحرف)\nستجد خيار "الانضمام لمجموعة" في صفحة تسجيل الدخول.',
    answerEn: 'You can join in two ways:\n1. Scan the QR code from your teacher using your camera\n2. Manually enter the cohort code (6 characters)\nYou\'ll find the "Join a Cohort" option on the login page.',
    keywords: ['انضم', 'مجموعة', 'qr', 'كود', 'join', 'cohort', 'دراسية', 'انضمام', 'الانضمام', 'ادخل', 'دخول', 'اشترك', 'join cohort', 'cohort code']
  },
  {
    question: 'ماذا يحتوي كل مستوى؟',
    questionEn: 'What does each level cover?',
    answer: 'المستويات الثمانية (0-7) وفق معايير الجدوى العُمانية:\n0️⃣ اختيار نوع المشروع - زراعي/صناعي/تجاري/خدمي\n1️⃣ الهوية والملكية - اسم المشروع والملاك وهيكل الملكية\n2️⃣ الإطار القانوني والتنظيمي - التراخيص والمتطلبات\n3️⃣ المتطلبات التشغيلية - الموقع والمرافق\n4️⃣ الموارد المادية والفنية - الأصول والمعدات والإهلاك\n5️⃣ الموارد البشرية والتنظيمية - التوظيف والتعمين\n6️⃣ التمويل والمؤشرات المالية - الخطة المالية وKPIs\n7️⃣ السوق والاستراتيجية - تحليل المنافسين وSWOT',
    answerEn: 'The eight levels (0–7), aligned with Omani feasibility study standards:\n0️⃣ Project Type Selection – Agricultural/Industrial/Commercial/Service\n1️⃣ Identity & Ownership – business name, owners, share distribution\n2️⃣ Legal Framework – licenses and requirements\n3️⃣ Operational Requirements – location and facilities\n4️⃣ Physical Resources – assets, equipment, and depreciation\n5️⃣ Human Resources – hiring and Omanization\n6️⃣ Financing & Financial KPIs – financial plan and KPIs\n7️⃣ Market & Strategy – competitor analysis and SWOT',
    keywords: ['مستويات', 'محتوى', 'levels', 'modules', 'ماذا', 'يحتوي', 'أقسام', 'المستويات', 'شو فيه', 'ايش في', 'الاقسام', 'what does each level', 'level content']
  },
  {
    question: 'هل يمكنني تحميل تقرير تقدمي؟',
    questionEn: 'Can I download a report of my progress?',
    answer: 'نعم! اضغط على زر "عرض التقرير" في الشريط العلوي. سيظهر لك تقرير شامل يحتوي على جميع تفاصيل تقدمك، الدرجات، والملاحظات. يمكنك طباعته أو حفظه كـ PDF.',
    answerEn: 'Yes! Click the "View Report" button in the top bar. A comprehensive report will appear with all your progress details, grades, and feedback. You can print it or save it as a PDF.',
    keywords: ['تقرير', 'تحميل', 'pdf', 'report', 'طباعة', 'حفظ', 'export', 'التقرير', 'نزل', 'حمل', 'اطبع', 'download report', 'progress report']
  },
  {
    question: 'ماذا لو فاتني موعد التسليم؟',
    questionEn: 'What if I miss a submission deadline?',
    answer: 'إذا فاتك الموعد، يمكنك التسليم لكن سيظهر كـ "متأخر". قد يؤثر على درجتك حسب سياسة المدرس. تواصل مع مدرسك لمعرفة إمكانية قبول التسليم المتأخر.',
    answerEn: 'If you miss the deadline, you can still submit, but it will be marked as "Late." This may affect your grade depending on your teacher\'s policy. Reach out to your teacher to ask whether late submissions can be accepted.',
    keywords: ['موعد', 'متأخر', 'deadline', 'late', 'فات', 'تأخرت', 'فاتني', 'تأخير', 'الموعد', 'انتهى الوقت', 'miss deadline', 'missed deadline']
  },
  {
    question: 'كيف أتواصل مع المدرس؟',
    questionEn: 'How do I contact my teacher?',
    answer: 'حالياً، التواصل يكون من خلال المجموعة الدراسية أو وسائل التواصل التي يحددها المدرس. في المستقبل، سيتم إضافة نظام مراسلة داخل المنصة.',
    answerEn: 'Right now, communication happens through your study cohort or whatever contact method your teacher sets up. An in-platform messaging system is coming in the future.',
    keywords: ['تواصل', 'مدرس', 'رسالة', 'contact', 'message', 'معلم', 'اتواصل', 'راسل', 'المدرس', 'المعلم', 'كلم', 'contact teacher']
  },
  {
    question: 'هل البيانات محفوظة بشكل آمن؟',
    questionEn: 'Is my data stored securely?',
    answer: 'نعم، بياناتك محفوظة في قاعدة بيانات Supabase المشفرة ومزامنة عبر أجهزتك. يمكنك أيضاً حفظ مشاريعك يدوياً من زر "حفظ المشروع" في الشريط العلوي.',
    answerEn: 'Yes, your data is stored in an encrypted Supabase database and synced across your devices. You can also manually save your projects using the "Save Project" button in the top bar.',
    keywords: ['بيانات', 'أمان', 'security', 'privacy', 'خصوصية', 'محفوظ', 'آمن', 'البيانات', 'الامان', 'حماية', 'خصوصيتي', 'data security', 'is it safe']
  },
  {
    question: 'ما هو المستوى 0 واختيار نوع المشروع؟',
    questionEn: 'What is Level 0 and project type selection?',
    answer: 'المستوى 0 هو نقطة البداية حيث تختار نوع مشروعك:\n🌿 زراعي: محاصيل وري وأراضي\n🏭 صناعي: تصنيع ومعدات\n🛍️ تجاري: تجزئة ومخزون\n🛎️ خدمي: خدمات وتجربة عميل\n\nاختيارك يؤثر على محتوى وحقول جميع المستويات اللاحقة.',
    answerEn: 'Level 0 is the starting point, where you choose your project type:\n🌿 Agricultural: crops, irrigation, and land\n🏭 Industrial: manufacturing and equipment\n🛍️ Commercial: retail and inventory\n🛎️ Service: services and customer experience\n\nYour choice shapes the content and fields of every level that follows.',
    keywords: ['مستوى 0', 'نوع المشروع', 'زراعي', 'صناعي', 'تجاري', 'خدمي', 'اختيار', 'level 0', 'project type', 'القطاع', 'sector']
  },
  {
    question: 'ما هو تحليل SWOT المعزز في المستوى 7؟',
    questionEn: 'What is the enhanced SWOT analysis in Level 7?',
    answer: 'المستوى 7 يتضمن تحليل SWOT متقدماً:\n💪 نقاط القوة\n⚠️ نقاط الضعف\n🚀 الفرص\n🎯 التهديدات\n\nبالإضافة إلى:\n• مقارنة السيناريوهات المتعددة\n• معايير أداء القطاع\n• مؤشرات KPI مخصصة لنوع مشروعك',
    answerEn: 'Level 7 includes an advanced SWOT analysis:\n💪 Strengths\n⚠️ Weaknesses\n🚀 Opportunities\n🎯 Threats\n\nPlus:\n• Multi-scenario comparison\n• Sector performance benchmarks\n• KPI indicators tailored to your project type',
    keywords: ['swot', 'تحليل', 'نقاط القوة', 'نقاط الضعف', 'فرص', 'تهديدات', 'مستوى 7', 'level 7', 'السوق', 'استراتيجية', 'strategy', 'market']
  },
  {
    question: 'ما هو Business Model Canvas (BMC)؟',
    questionEn: 'What is the Business Model Canvas (BMC)?',
    answer: 'نموذج الأعمال الشامل (BMC) محتوى إضافي بـ 9 مكونات:\n1. شرائح العملاء\n2. القيمة المقدمة\n3. قنوات التوزيع\n4. علاقات العملاء\n5. مصادر الإيراد\n6. الموارد الرئيسية\n7. الأنشطة الرئيسية\n8. الشراكات الرئيسية\n9. هيكل التكاليف\n\nكما يتضمن خطة التنفيذ وربط المشروع بأهداف رؤية عُمان 2040.',
    answerEn: 'The Business Model Canvas (BMC) is bonus content with 9 building blocks:\n1. Customer Segments\n2. Value Proposition\n3. Channels\n4. Customer Relationships\n5. Revenue Streams\n6. Key Resources\n7. Key Activities\n8. Key Partnerships\n9. Cost Structure\n\nIt also includes an implementation plan and ties your project to Oman Vision 2040 goals.',
    keywords: ['bmc', 'business model canvas', 'نموذج الأعمال', 'تنفيذ', 'رؤية 2040', 'عمان 2040', 'canvas']
  }
];

const GREETING_AR = 'مرحباً! 👋 أنا مساعد YieldX الذكي. كيف يمكنني مساعدتك اليوم؟';
const GREETING_EN = "Hi there! 👋 I'm the YieldX assistant. How can I help you today?";

export function ChatBot() {
  const { user, levels, totalXP, currentView, language } = useYieldX();
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: isAr ? GREETING_AR : GREETING_EN,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Re-localize the greeting if the user switches language before sending any message
  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === '1'
        ? [{ ...prev[0], text: isAr ? GREETING_AR : GREETING_EN }]
        : prev
    );
  }, [isAr]);

  // Allow other parts of the app (e.g. the dashboard's "Your AI Tools" banner) to open the chatbot
  useEffect(() => {
    const handleOpenRequest = () => setIsOpen(true);
    window.addEventListener('yieldx:open-chatbot', handleOpenRequest);
    return () => window.removeEventListener('yieldx:open-chatbot', handleOpenRequest);
  }, []);

  // Smart text normalization for better Arabic matching
  const normalizeArabicText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      // Remove diacritics (tashkeel)
      .replace(/[\u064B-\u065F\u0670]/g, '')
      // Normalize alef variations
      .replace(/[آأإ]/g, 'ا')
      // Normalize taa marbuta
      .replace(/ة/g, 'ه')
      // Normalize yaa
      .replace(/ى/g, 'ي')
      // Remove extra spaces
      .replace(/\s+/g, ' ');
  };

  // Calculate match score for FAQ
  const calculateFAQScore = (question: string, faq: FAQ): number => {
    const normalizedQuestion = normalizeArabicText(question);
    let score = 0;

    // Check keyword matches
    for (const keyword of faq.keywords) {
      const normalizedKeyword = normalizeArabicText(keyword);
      
      // Exact match (highest score)
      if (normalizedQuestion === normalizedKeyword) {
        score += 100;
      }
      // Contains full keyword
      else if (normalizedQuestion.includes(normalizedKeyword)) {
        score += 50;
      }
      // Keyword contains question part
      else if (normalizedKeyword.includes(normalizedQuestion) && normalizedQuestion.length > 2) {
        score += 30;
      }
      // Partial word match
      else {
        const questionWords = normalizedQuestion.split(' ');
        const keywordWords = normalizedKeyword.split(' ');
        
        for (const qWord of questionWords) {
          if (qWord.length > 2) { // Skip very short words
            for (const kWord of keywordWords) {
              if (kWord.includes(qWord) || qWord.includes(kWord)) {
                score += 10;
              }
            }
          }
        }
      }
    }

    return score;
  };

  const findAnswer = (question: string): string => {
    const normalizedQuestion = question.toLowerCase().trim();

    // Context-aware responses using real user data
    if (normalizedQuestion.includes('التالي') || normalizedQuestion.includes('next') ||
        normalizedQuestion.includes('المستوى القادم') || normalizedQuestion.includes('بعد')) {
      const nextLevel = levels.find(l => l.unlocked && !l.completed);
      if (nextLevel) {
        const suggestions = isAr ? [
          `• 🎯 **المستوى التالي**: ${nextLevel.title}`,
          `• 📊 **النقاط المطلوبة**: ${nextLevel.maxXp} XP`,
          `• 🎓 **الهدف**: ${nextLevel.objective || 'إكمال المحتوى التعليمي'}`,
          nextLevel.deadline ? `• ⏰ **الموعد النهائي**: ${new Date(nextLevel.deadline).toLocaleDateString('ar-SA')}` : '',
          ``,
          `اضغط على بطاقة "${nextLevel.title}" في الخريطة الفضائية للبدء! 🚀`
        ] : [
          `• 🎯 **Next Level**: ${nextLevel.title}`,
          `• 📊 **XP Required**: ${nextLevel.maxXp} XP`,
          `• 🎓 **Objective**: ${nextLevel.objective || 'Complete the educational content'}`,
          nextLevel.deadline ? `• ⏰ **Deadline**: ${new Date(nextLevel.deadline).toLocaleDateString('en-US')}` : '',
          ``,
          `Click the "${nextLevel.title}" card on the Space Map to get started! 🚀`
        ];
        return suggestions.filter(s => s).join('\n');
      } else {
        const completedCount = levels.filter(l => l.completed).length;
        if (completedCount === levels.length) {
          return isAr
            ? `تهانينا! 🎉 لقد أكملت جميع المستويات الثمانية!\n\n• ✅ **المستويات المكتملة**: ${completedCount}/${levels.length}\n• 🏆 **إجمالي النقاط**: ${totalXP} XP\n\nيمكنك الآن عرض التقرير الشامل أو مراجعة المستويات السابقة.`
            : `Congratulations! 🎉 You've completed all eight levels!\n\n• ✅ **Levels Completed**: ${completedCount}/${levels.length}\n• 🏆 **Total XP**: ${totalXP} XP\n\nYou can now view your full report or review previous levels.`;
        } else {
          return isAr
            ? `لم يتم فتح مستوى جديد بعد. أكمل المستوى الحالي أولاً! 💪\n\n• 📊 **تقدمك**: ${completedCount}/${levels.length} مستويات\n• 🌟 **نقاطك**: ${totalXP} XP`
            : `No new level has been unlocked yet. Complete your current level first! 💪\n\n• 📊 **Your Progress**: ${completedCount}/${levels.length} levels\n• 🌟 **Your XP**: ${totalXP} XP`;
        }
      }
    }

    if (normalizedQuestion.includes('نقاطي') || normalizedQuestion.includes('my xp') ||
        normalizedQuestion.includes('تقدمي') || normalizedQuestion.includes('my progress')) {
      const completedCount = levels.filter(l => l.completed).length;
      const maxTotalXP = levels.reduce((sum, level) => sum + level.maxXp, 0);
      const progress = Math.round((totalXP / maxTotalXP) * 100);

      return isAr
        ? `إليك ملخص تقدمك يا ${user?.name}! 📊\n\n` +
          `• 🌟 **إجمالي النقاط**: ${totalXP} / ${maxTotalXP} XP\n` +
          `• ✅ **المستويات المكتملة**: ${completedCount} / ${levels.length}\n` +
          `• 📈 **نسبة الإنجاز**: ${progress}%\n\n` +
          (completedCount < levels.length ? `استمر في العمل! أنت تقوم بعمل رائع! 💪🔥` : `أحسنت! أكملت جميع المستويات! 🎉✨`)
        : `Here's a summary of your progress, ${user?.name}! 📊\n\n` +
          `• 🌟 **Total XP**: ${totalXP} / ${maxTotalXP} XP\n` +
          `• ✅ **Levels Completed**: ${completedCount} / ${levels.length}\n` +
          `• 📈 **Completion Rate**: ${progress}%\n\n` +
          (completedCount < levels.length ? `Keep going! You're doing great work! 💪🔥` : `Well done! You've completed every level! 🎉✨`);
    }

    if (normalizedQuestion.includes('المتأخر') || normalizedQuestion.includes('late') ||
        normalizedQuestion.includes('التسليم المتأخر')) {
      const lateSubmissions = levels.filter(l => l.submissionStatus === 'late');
      if (lateSubmissions.length > 0) {
        return isAr
          ? `لديك ${lateSubmissions.length} تسليم متأخر ⚠️:\n\n` +
            lateSubmissions.map(l => `• ${l.title}`).join('\n') +
            `\n\nتواصل مع مدرسك بخصوص التسليمات المتأخرة.`
          : `You have ${lateSubmissions.length} late submission${lateSubmissions.length > 1 ? 's' : ''} ⚠️:\n\n` +
            lateSubmissions.map(l => `• ${l.title}`).join('\n') +
            `\n\nReach out to your teacher about your late submissions.`;
      } else {
        return isAr
          ? `رائع! ليس لديك أي تسليمات متأخرة. 🎉\n\nاستمر على هذا الأداء المتميز! ⭐`
          : `Great news! You don't have any late submissions. 🎉\n\nKeep up the excellent work! ⭐`;
      }
    }

    if (normalizedQuestion.includes('الدرجات') || normalizedQuestion.includes('grades') ||
        normalizedQuestion.includes('التقييم')) {
      const gradedLevels = levels.filter(l => l.submissionStatus === 'graded' && l.grade);
      if (gradedLevels.length > 0) {
        const avgGrade = Math.round(gradedLevels.reduce((sum, l) => sum + (l.grade || 0), 0) / gradedLevels.length);
        return isAr
          ? `📊 **ملخص الدرجات**:\n\n` +
            `• 📝 **المستويات المصححة**: ${gradedLevels.length}\n` +
            `• 🎯 **المتوسط**: ${avgGrade}%\n\n` +
            `**التفاصيل**:\n` +
            gradedLevels.map(l => `• ${l.title}: ${l.grade}%`).join('\n') +
            `\n\nأحسنت! استمر في التقدم! 🌟`
          : `📊 **Grades Summary**:\n\n` +
            `• 📝 **Levels Graded**: ${gradedLevels.length}\n` +
            `• 🎯 **Average**: ${avgGrade}%\n\n` +
            `**Details**:\n` +
            gradedLevels.map(l => `• ${l.title}: ${l.grade}%`).join('\n') +
            `\n\nWell done! Keep up the progress! 🌟`;
      } else {
        return isAr
          ? `لم يتم تصحيح أي مستوى بعد. 📝\n\nسيتم إشعارك عندما يقوم المدرس بتقييم تسليماتك.`
          : `No level has been graded yet. 📝\n\nYou'll be notified once your teacher grades your submissions.`;
      }
    }

    if (normalizedQuestion.includes('مساعدة') || normalizedQuestion.includes('help')) {
      return isAr
        ? `كيف يمكنني مساعدتك؟ 🤝\n\n**يمكنني الإجابة عن**:\n` +
          `• ✅ ما هو المستوى التالي؟\n` +
          `• 📊 ما هو تقدمي؟\n` +
          `• 🎯 ما هي درجاتي؟\n` +
          `• ⏰ هل لدي تسليمات متأخرة؟\n` +
          `• 💡 أسئلة عامة عن المنصة\n\n` +
          `اختر سؤالاً من الأسئلة الشائعة أو اكتب سؤالك! 😊`
        : `How can I help you? 🤝\n\n**I can answer questions about**:\n` +
          `• ✅ What's my next level?\n` +
          `• 📊 What's my progress?\n` +
          `• 🎯 What are my grades?\n` +
          `• ⏰ Do I have any late submissions?\n` +
          `• 💡 General questions about the platform\n\n` +
          `Pick a question from the FAQ or type your own! 😊`;
    }

    // Find matching FAQ using smart scoring system
    const faqScores = faqs.map(faq => ({
      faq,
      score: calculateFAQScore(question, faq)
    }));

    // Sort by score (highest first)
    faqScores.sort((a, b) => b.score - a.score);

    // If best match has a good score (threshold: 20), return it
    if (faqScores[0].score >= 20) {
      return isAr ? faqScores[0].faq.answer : faqScores[0].faq.answerEn;
    }

    // Default response with personalized suggestions
    const nextLevel = levels.find(l => l.unlocked && !l.completed);
    const suggestions = isAr ? [
      'عذراً، لم أفهم سؤالك تماماً. 😅',
      '',
      '**يمكنك أن تسألني**:',
      '• "ما هو المستوى التالي؟" 🎯',
      '• "كم نقطة لدي؟" 📊',
      '• "ما هي درجاتي؟" 📝',
      '',
      nextLevel ? `💡 **اقتراح**: المستوى التالي هو "${nextLevel.title}"` : '',
      '',
      'أو اختر سؤالاً من الأسئلة الشائعة! 👇'
    ] : [
      "Sorry, I didn't quite understand your question. 😅",
      '',
      '**You can ask me things like**:',
      '• "What is my next level?" 🎯',
      '• "How many points do I have?" 📊',
      '• "What are my grades?" 📝',
      '',
      nextLevel ? `💡 **Suggestion**: Your next level is "${nextLevel.title}"` : '',
      '',
      'Or pick a question from the FAQ below! 👇'
    ];

    return suggestions.filter(s => s !== undefined).join('\n');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await sendChatMessage({
        userMessage: currentInput,
        history: conversationHistory,
        language,
        userName: user?.name ?? undefined,
        userRole: user?.role === 'lecturer' ? 'teacher' : user?.role === 'organization' || user?.role === 'admin' ? 'organization' : 'student'
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ ChatBot send message error:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'ar'
          ? 'حدث خطأ غير متوقع. حاول مرة أخرى لاحقاً.'
          : 'An unexpected error occurred. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    const faq = faqs.find(f => (isAr ? f.question : f.questionEn) === question);
    if (!faq) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: isAr ? faq.answer : faq.answerEn,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const commonQuestions = (isAr
    ? faqs.slice(0, 5).map(f => f.question)
    : faqs.slice(0, 5).map(f => f.questionEn));

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] hover:from-[#5DD9C1] hover:to-[#4ECDC4] shadow-2xl shadow-[#4ECDC4]/50 hover:shadow-[#4ECDC4]/70 transition-all"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <MessageCircle className="w-8 h-8 text-white" />
              </motion.div>
            </Button>
            
            {/* Notification Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] flex flex-col"
          >
            <Card className="flex flex-col h-full bg-white dark:bg-slate-900 border-purple-300 dark:border-[#4ECDC4]/30 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#4ECDC4]" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{isAr ? 'مساعد YieldX' : 'YieldX Assistant'}</h3>
                    <p className="text-white/80 text-xs">{isAr ? 'متصل الآن' : 'Online now'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-[#4ECDC4] rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-[#5DD9C1] rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-[#7FDBCA] rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Questions */}
                {messages.length <= 1 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs mb-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>{isAr ? 'أسئلة شائعة:' : 'Common questions:'}</span>
                    </div>
                    {commonQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleQuickQuestion(question)}
                        className="w-full text-right bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {question}
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] hover:from-[#5DD9C1] hover:to-[#4ECDC4] disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}