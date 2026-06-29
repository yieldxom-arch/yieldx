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
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    question: 'ما هو YieldX؟',
    answer: 'YieldX هو منصة تعليمية متقدمة لدراسة جدوى الأعمال بنظام لعبي وثيم فضائي. يتضمن 8 مستويات (0-7) وفق معايير دراسة الجدوى العُمانية، تغطي جميع جوانب المشروع من اختيار النوع وحتى نموذج الأعمال الشامل.',
    keywords: ['يلدكس', 'yieldx', 'ما هو', 'منصة', 'تعريف', 'عن', 'شو', 'ايش', 'وش', 'المنصة', 'البرنامج', 'التطبيق', 'النظام']
  },
  {
    question: 'كيف أبدأ مستوى جديد؟',
    answer: 'لبدء مستوى جديد، اضغط على بطاقة المستوى في الخريطة الفضائية. إذا كان المستوى مفتوحاً، ستظهر لك التفاصيل والأهداف التعليمية. اضغط "ابدأ" للدخول إلى المستوى.',
    keywords: ['ابدأ', 'بدء', 'مستوى جديد', 'كيف', 'فتح مستوى', 'بداية', 'ابدا', 'البدء', 'فتح', 'افتح', 'شغل', 'كيفية', 'طريقة', 'خطوات']
  },
  {
    question: 'كيف أقوم بتسليم المهام؟',
    answer: 'في كل مستوى، ستجد زر "تسليم المهمة" بعد إكمال المحتوى. املأ جميع الحقول المطلوبة ثم اضغط على زر التسليم. يمكنك رفع ملفات PDF أو Word أو صور.',
    keywords: ['تسليم', 'مهمة', 'رفع', 'ملف', 'إرسال', 'submission', 'اسلم', 'سلم', 'مهام', 'واجب', 'واجبات', 'كيف اسلم', 'كيف ارفع', 'ارسل', 'رفع ملف']
  },
  {
    question: 'ما هي النقاط (XP) وكيف أحصل عليها؟',
    answer: 'النقاط (XP) هي نقاط الخبرة التي تكسبها عند إكمال المستويات. كل مستوى له نقاط محددة. تحصل على النقاط الكاملة عند التسليم في الموعد المحدد وبعد تقييم المدرس.',
    keywords: ['نقاط', 'xp', 'خبرة', 'احصل', 'كسب', 'points', 'النقاط', 'كيف احصل', 'اكسب', 'نقطة', 'experience', 'كم نقطة']
  },
  {
    question: 'كيف أتتبع تقدمي؟',
    answer: 'يمكنك تتبع تقدمك من لوحة المعلومات الرئيسية. ستجد إجمالي النقاط، المستويات المكتملة، والتقدم الإجمالي. كما يمكنك عرض التقرير الشامل من زر "عرض التقرير".',
    keywords: ['تتبع', 'تقدم', 'progress', 'نسبة', 'إنجاز', 'completion', 'تتبع تقدمي', 'شوف تقدمي', 'مستواي', 'وين وصلت', 'كم انجزت']
  },
  {
    question: 'ماذا تعني حالات التسليم المختلفة؟',
    answer: '• "غير مُبدأ": لم تبدأ العمل بعد\n• "قيد العمل": بدأت لكن لم تسلم\n• "مُسلّم": تم التسليم وينتظر التصحيح\n• "تم التصحيح": تم تقييم عملك من المدرس\n• "متأخر": تم التسليم بعد الموعد المحدد',
    keywords: ['حالة', 'تسليم', 'status', 'مُسلم', 'متأخر', 'قيد العمل', 'حالات', 'معنى', 'شو يعني', 'ايش معنى']
  },
  {
    question: 'كيف أغير اللغة أو السمة؟',
    answer: 'اضغط على زر الإعدادات (⚙️) في الشريط العلوي. يمكنك تغيير اللغة بين العربية والإنجليزية، وتبديل السمة بين الوضع المظلم والفاتح، واختيار عملتك المفضلة.',
    keywords: ['إعدادات', 'لغة', 'سمة', 'theme', 'settings', 'language', 'عربي', 'انجليزي', 'تغيير', 'غير', 'اللغة', 'السمة', 'مظلم', 'فاتح', 'dark', 'light']
  },
  {
    question: 'ما هي المشاريع (Projects) والمجموعات (Cohorts)؟',
    answer: 'المشاريع هي مساحات عمل منفصلة لكل مشروع تجاري. المجموعات هي مجموعات الطلاب المسجلين في دورة معينة. المدرسون يديرون المجموعات ويراقبون تقدم الطلاب.',
    keywords: ['مشروع', 'مجموعة', 'project', 'cohort', 'workspace', 'طلاب', 'مدرس', 'المشاريع', 'المجموعات', 'فريق', 'دورة']
  },
  {
    question: 'كيف يمكن للمدرس تقييم عملي؟',
    answer: 'عند تسليم المهمة، يصل إشعار للمدرس. سيقوم بمراجعة عملك وإعطائك درجة وملاحظات. ستجد التقييم في تفاصيل المستوى وستحصل على إشعار عند التصحيح.',
    keywords: ['تقييم', 'درجة', 'مدرس', 'grade', 'feedback', 'ملاحظات', 'تصحيح', 'المدرس', 'المعلم', 'الدرجة', 'كيف يقيم', 'التقييم']
  },
  {
    question: 'كيف أنضم إلى مجموعة دراسية؟',
    answer: 'يمكنك الانضمام بطريقتين:\n1. مسح رمز QR من المدرس باستخدام الكاميرا\n2. إدخال كود المجموعة يدوياً (6 أحرف)\nستجد خيار "الانضمام لمجموعة" في صفحة تسجيل الدخول.',
    keywords: ['انضم', 'مجموعة', 'qr', 'كود', 'join', 'cohort', 'دراسية', 'انضمام', 'الانضمام', 'ادخل', 'دخول', 'اشترك']
  },
  {
    question: 'ماذا يحتوي كل مستوى؟',
    answer: 'المستويات الثمانية (0-7) وفق معايير الجدوى العُمانية:\n0️⃣ اختيار نوع المشروع - زراعي/صناعي/تجاري/خدمي\n1️⃣ السوق والاستراتيجية - تحليل السوق وSWOT\n2️⃣ الإطار القانوني والتنظيمي - التراخيص والمتطلبات\n3️⃣ المتطلبات التشغيلية - الموقع والمرافق\n4️⃣ الموارد المادية والفنية - الأصول والمعدات والإهلاك\n5️⃣ الموارد البشرية والتنظيمية - التوظيف والتعمين\n6️⃣ التمويل والمؤشرات المالية - الخطة المالية وKPIs\n7️⃣ الهوية والملكية - معلومات المشروع والملاك',
    keywords: ['مستويات', 'محتوى', 'levels', 'modules', 'ماذا', 'يحتوي', 'أقسام', 'المستويات', 'شو فيه', 'ايش في', 'الاقسام']
  },
  {
    question: 'هل يمكنني تحميل تقرير تقدمي؟',
    answer: 'نعم! اضغط على زر "عرض التقرير" في الشريط العلوي. سيظهر لك تقرير شامل يحتوي على جميع تفاصيل تقدمك، الدرجات، والملاحظات. يمكنك طباعته أو حفظه كـ PDF.',
    keywords: ['تقرير', 'تحميل', 'pdf', 'report', 'طباعة', 'حفظ', 'export', 'التقرير', 'نزل', 'حمل', 'اطبع']
  },
  {
    question: 'ماذا لو فاتني موعد التسليم؟',
    answer: 'إذا فاتك الموعد، يمكنك التسليم لكن سيظهر كـ "متأخر". قد يؤثر على درجتك حسب سياسة المدرس. تواصل مع مدرسك لمعرفة إمكانية قبول التسليم المتأخر.',
    keywords: ['موعد', 'متأخر', 'deadline', 'late', 'فات', 'تأخرت', 'فاتني', 'تأخير', 'الموعد', 'انتهى الوقت']
  },
  {
    question: 'كيف أتواصل مع المدرس؟',
    answer: 'حالياً، التواصل يكون من خلال المجموعة الدراسية أو وسائل التواصل التي يحددها المدرس. في المستقبل، سيتم إضافة نظام مراسلة داخل المنصة.',
    keywords: ['تواصل', 'مدرس', 'رسالة', 'contact', 'message', 'معلم', 'اتواصل', 'راسل', 'المدرس', 'المعلم', 'كلم']
  },
  {
    question: 'هل البيانات محفوظة بشكل آمن؟',
    answer: 'نعم، بياناتك محفوظة في قاعدة بيانات Supabase المشفرة ومزامنة عبر أجهزتك. يمكنك أيضاً حفظ مشاريعك يدوياً من زر "حفظ المشروع" في الشريط العلوي.',
    keywords: ['بيانات', 'أمان', 'security', 'privacy', 'خصوصية', 'محفوظ', 'آمن', 'البيانات', 'الامان', 'حماية', 'خصوصيتي']
  },
  {
    question: 'ما هو المستوى 0 واختيار نوع المشروع؟',
    answer: 'المستوى 0 هو نقطة البداية حيث تختار نوع مشروعك:\n🌿 زراعي: محاصيل وري وأراضي\n🏭 صناعي: تصنيع ومعدات\n🛍️ تجاري: تجزئة ومخزون\n🛎️ خدمي: خدمات وتجربة عميل\n\nاختيارك يؤثر على محتوى وحقول جميع المستويات اللاحقة.',
    keywords: ['مستوى 0', 'نوع المشروع', 'زراعي', 'صناعي', 'تجاري', 'خدمي', 'اختيار', 'level 0', 'project type', 'القطاع']
  },
  {
    question: 'ما هو تحليل SWOT المعزز في المستوى 1؟',
    answer: 'المستوى 1 يتضمن تحليل SWOT متقدماً:\n💪 نقاط القوة\n⚠️ نقاط الضعف\n🚀 الفرص\n🎯 التهديدات\n\nبالإضافة إلى:\n• مقارنة السيناريوهات المتعددة\n• معايير أداء القطاع\n• مؤشرات KPI مخصصة لنوع مشروعك',
    keywords: ['swot', 'تحليل', 'نقاط القوة', 'نقاط الضعف', 'فرص', 'تهديدات', 'مستوى 1', 'level 1', 'السوق', 'استراتيجية']
  },
  {
    question: 'ما هو Business Model Canvas (BMC)؟',
    answer: 'نموذج الأعمال الشامل (BMC) محتوى إضافي بـ 9 مكونات:\n1. شرائح العملاء\n2. القيمة المقدمة\n3. قنوات التوزيع\n4. علاقات العملاء\n5. مصادر الإيراد\n6. الموارد الرئيسية\n7. الأنشطة الرئيسية\n8. الشراكات الرئيسية\n9. هيكل التكاليف\n\nكما يتضمن خطة التنفيذ وربط المشروع بأهداف رؤية عُمان 2040.',
    keywords: ['bmc', 'business model canvas', 'نموذج الأعمال', 'تنفيذ', 'رؤية 2040', 'عمان 2040', 'canvas']
  }
];

export function ChatBot() {
  const { user, levels, totalXP, currentView, language } = useYieldX();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً! 👋 أنا مساعد YieldX الذكي. كيف يمكنني مساعدتك اليوم؟',
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
        const suggestions = [
          `• 🎯 **المستوى التالي**: ${nextLevel.title}`,
          `• 📊 **النقاط المطلوبة**: ${nextLevel.maxXp} XP`,
          `• 🎓 **الهدف**: ${nextLevel.objective || 'إكمال المحتوى التعليمي'}`,
          nextLevel.deadline ? `• ⏰ **الموعد النهائي**: ${new Date(nextLevel.deadline).toLocaleDateString('ar-SA')}` : '',
          ``,
          `اضغط على بطاقة "${nextLevel.title}" في الخريطة الفضائية للبدء! 🚀`
        ];
        return suggestions.filter(s => s).join('\n');
      } else {
        const completedCount = levels.filter(l => l.completed).length;
        if (completedCount === levels.length) {
          return `تهانينا! 🎉 لقد أكملت جميع المستويات الثمانية!\n\n• ✅ **المستويات المكتملة**: ${completedCount}/${levels.length}\n• 🏆 **إجمالي النقاط**: ${totalXP} XP\n\nيمكنك الآن عرض التقرير الشامل أو مراجعة المستويات السابقة.`;
        } else {
          return `لم يتم فتح مستوى جديد بعد. أكمل المستوى الحالي أولاً! 💪\n\n• 📊 **تقدمك**: ${completedCount}/${levels.length} مستويات\n• 🌟 **نقاطك**: ${totalXP} XP`;
        }
      }
    }
    
    if (normalizedQuestion.includes('نقاطي') || normalizedQuestion.includes('my xp') || 
        normalizedQuestion.includes('تقدمي') || normalizedQuestion.includes('my progress')) {
      const completedCount = levels.filter(l => l.completed).length;
      const maxTotalXP = levels.reduce((sum, level) => sum + level.maxXp, 0);
      const progress = Math.round((totalXP / maxTotalXP) * 100);
      
      return `إليك ملخص تقدمك يا ${user?.name}! 📊\n\n` +
             `• 🌟 **إجمالي النقاط**: ${totalXP} / ${maxTotalXP} XP\n` +
             `• ✅ **المستويات المكتملة**: ${completedCount} / ${levels.length}\n` +
             `• 📈 **نسبة الإنجاز**: ${progress}%\n\n` +
             (completedCount < levels.length ? `استمر في العمل! أنت تقوم بعمل رائع! 💪🔥` : `أحسنت! أكملت جميع المستويات! 🎉✨`);
    }
    
    if (normalizedQuestion.includes('المتأخر') || normalizedQuestion.includes('late') || 
        normalizedQuestion.includes('التسليم المتأخر')) {
      const lateSubmissions = levels.filter(l => l.submissionStatus === 'late');
      if (lateSubmissions.length > 0) {
        return `لديك ${lateSubmissions.length} تسليم متأخر ⚠️:\n\n` +
               lateSubmissions.map(l => `• ${l.title}`).join('\n') + 
               `\n\nتواصل مع مدرسك بخصوص التسليمات المتأخرة.`;
      } else {
        return `رائع! ليس لديك أي تسليمات متأخرة. 🎉\n\nاستمر على هذا الأداء المتميز! ⭐`;
      }
    }
    
    if (normalizedQuestion.includes('الدرجات') || normalizedQuestion.includes('grades') || 
        normalizedQuestion.includes('التقييم')) {
      const gradedLevels = levels.filter(l => l.submissionStatus === 'graded' && l.grade);
      if (gradedLevels.length > 0) {
        const avgGrade = Math.round(gradedLevels.reduce((sum, l) => sum + (l.grade || 0), 0) / gradedLevels.length);
        return `📊 **ملخص الدرجات**:\n\n` +
               `• 📝 **المستويات المصححة**: ${gradedLevels.length}\n` +
               `• 🎯 **المتوسط**: ${avgGrade}%\n\n` +
               `**التفاصيل**:\n` +
               gradedLevels.map(l => `• ${l.title}: ${l.grade}%`).join('\n') +
               `\n\nأحسنت! استمر في التقدم! 🌟`;
      } else {
        return `لم يتم تصحيح أي مستوى بعد. 📝\n\nسيتم إشعارك عندما يقوم المدرس بتقييم تسليماتك.`;
      }
    }

    if (normalizedQuestion.includes('مساعدة') || normalizedQuestion.includes('help')) {
      return `كيف يمكنني مساعدتك؟ 🤝\n\n**يمكنني الإجابة عن**:\n` +
             `• ✅ ما هو المستوى التالي؟\n` +
             `• 📊 ما هو تقدمي؟\n` +
             `• 🎯 ما هي درجاتي؟\n` +
             `• ⏰ هل لدي تسليمات متأخرة؟\n` +
             `• 💡 أسئلة عامة عن المنصة\n\n` +
             `اختر سؤالاً من الأسئلة الشائعة أو اكتب سؤالك! 😊`;
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
      return faqScores[0].faq.answer;
    }

    // Default response with personalized suggestions
    const nextLevel = levels.find(l => l.unlocked && !l.completed);
    const suggestions = [
      'عذراً، لم أفهم سؤالك تماماً. 😅',
      '',
      '**يمكنك أن تسألني**:',
      '• "ما هو المستوى التالي؟" 🎯',
      '• "كم نقطة لدي؟" 📊',
      '• "ما هي درجاتي؟" 📝',
      '',
      nextLevel ? `💡 **اقتراح**: المستوى التالي و "${nextLevel.title}"` : '',
      '',
      'أو اختر سؤالاً من الأسئلة الشائعة! 👇'
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
    const faq = faqs.find(f => f.question === question);
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
        text: faq.answer,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const commonQuestions = [
    'ما هو YieldX؟',
    'كيف أبدأ مستوى جديد؟',
    'كيف أقوم بتسليم المهام؟',
    'ما هي النقاط (XP) وكيف أحصل عليها؟',
    'كيف أغير اللغة أو السمة؟'
  ];

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
                    <h3 className="text-white font-bold">مساعد YieldX</h3>
                    <p className="text-white/80 text-xs">متصل الآن</p>
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
                        {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
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
                      <span>أسئلة شائعة:</span>
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