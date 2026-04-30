import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, CheckCircle, Lock, Eye, AlertTriangle, Upload, Save, Send } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface CapstonePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
}

export function CapstonePreviewModal({ isOpen, onClose, language }: CapstonePreviewModalProps) {
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  const t = {
    title: language === 'ar' ? 'معاينة المشروع النهائي (وضع المُدرّس)' : 'Final Project Preview (Teacher Mode)',
    teacherPreview: language === 'ar' ? 'معاينة المُدرّس - التعديل معطل' : 'Teacher Preview – Student editing disabled',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    sections: language === 'ar' ? 'أقسام المشروع' : 'Project Sections',
    studentCapabilities: language === 'ar' ? 'ما الذي يستطيع الطلاب فعله' : 'What students can do here',
    teacherCapabilities: language === 'ar' ? 'ما الذي يستطيع المُدرّس فعله' : 'What teacher can do',
    description: language === 'ar' ? 'الوصف' : 'Description',
    viewSection: language === 'ar' ? 'عرض القسم' : 'View Section',
    backToSections: language === 'ar' ? 'العودة إلى الأقسام' : 'Back to Sections',
  };

  // Capstone Project Sections
  const capstoneections = [
    {
      id: 1,
      title: language === 'ar' ? 'معلومات المشروع الأساسية' : 'Basic Project Information',
      description: language === 'ar' 
        ? 'معلومات أساسية عن المشروع: الاسم، الوصف، الصناعة، الموقع، نوع النشاط'
        : 'Basic information about the project: name, description, industry, location, business type',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      questions: [
        language === 'ar' ? 'ما اسم مشروعك؟' : 'What is your project name?',
        language === 'ar' ? 'وصف المشروع (3-5 جمل)' : 'Project description (3-5 sentences)',
        language === 'ar' ? 'ما القطاع أو الصناعة؟' : 'What sector or industry?',
        language === 'ar' ? 'ما الموقع المستهدف؟' : 'What is the target location?',
      ]
    },
    {
      id: 2,
      title: language === 'ar' ? 'تحليل SWOT' : 'SWOT Analysis',
      description: language === 'ar'
        ? 'تحليل نقاط القوة والضعف والفرص والتهديدات للمشروع'
        : 'Analysis of strengths, weaknesses, opportunities, and threats for the project',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      questions: [
        language === 'ar' ? 'نقاط القوة (3-5 نقاط)' : 'Strengths (3-5 points)',
        language === 'ar' ? 'نقاط الضعف (3-5 نقاط)' : 'Weaknesses (3-5 points)',
        language === 'ar' ? 'الفرص المتاحة (3-5 فرص)' : 'Opportunities (3-5 opportunities)',
        language === 'ar' ? 'التهديدات المحتملة (3-5 تهديدات)' : 'Threats (3-5 threats)',
      ]
    },
    {
      id: 3,
      title: language === 'ar' ? 'تحليل السوق المستهدف' : 'Target Market Analysis',
      description: language === 'ar'
        ? 'فهم السوق المستهدف، حجم السوق، وسلوك العملاء'
        : 'Understanding target market, market size, and customer behavior',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      questions: [
        language === 'ar' ? 'من هم العملاء المستهدفون؟' : 'Who are the target customers?',
        language === 'ar' ? 'ما حجم السوق المتوقع؟' : 'What is the expected market size?',
        language === 'ar' ? 'ما حاجة السوق التي تلبيها؟' : 'What market need do you address?',
        language === 'ar' ? 'كيف يتم الوصول إلى العملاء؟' : 'How will customers be reached?',
      ]
    },
    {
      id: 4,
      title: language === 'ar' ? 'خطة التسويق والمبيعات' : 'Marketing & Sales Plan',
      description: language === 'ar'
        ? 'استراتيجية التسويق، قنوات البيع، والتسعير'
        : 'Marketing strategy, sales channels, and pricing',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-yellow-500 to-amber-500',
      questions: [
        language === 'ar' ? 'ما استراتيجية التسويق؟' : 'What is the marketing strategy?',
        language === 'ar' ? 'ما قنوات البيع المخططة؟' : 'What are the planned sales channels?',
        language === 'ar' ? 'ما سياسة التسعير؟' : 'What is the pricing policy?',
        language === 'ar' ? 'ما الميزانية التسويقية؟' : 'What is the marketing budget?',
      ]
    },
    {
      id: 5,
      title: language === 'ar' ? 'خطة العمليات' : 'Operations Plan',
      description: language === 'ar'
        ? 'عمليات الإنتاج/الخدمة، الموردين، والعمليات اليومية'
        : 'Production/service operations, suppliers, and daily operations',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-red-500 to-orange-500',
      questions: [
        language === 'ar' ? 'كيف سيتم تقديم المنتج/الخدمة؟' : 'How will the product/service be delivered?',
        language === 'ar' ? 'من هم الموردون الرئيسيون؟' : 'Who are the key suppliers?',
        language === 'ar' ? 'ما المتطلبات التشغيلية؟' : 'What are the operational requirements?',
        language === 'ar' ? 'ما معايير الجودة؟' : 'What are the quality standards?',
      ]
    },
    {
      id: 6,
      title: language === 'ar' ? 'التوقعات المالية' : 'Financial Projections',
      description: language === 'ar'
        ? 'التكاليف المتوقعة، الإيرادات، التدفقات النقدية، والربحية'
        : 'Expected costs, revenues, cash flows, and profitability',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-indigo-500 to-violet-500',
      questions: [
        language === 'ar' ? 'ما التكلفة الاستثمارية الأولية؟' : 'What is the initial investment cost?',
        language === 'ar' ? 'ما الإيرادات المتوقعة (سنة 1-3)؟' : 'What are the expected revenues (years 1-3)?',
        language === 'ar' ? 'متى سيتم الوصول لنقطة التعادل؟' : 'When will break-even be reached?',
        language === 'ar' ? 'ما مصادر التمويل؟' : 'What are the funding sources?',
      ]
    },
    {
      id: 7,
      title: language === 'ar' ? 'تقييم المخاطر' : 'Risk Assessment',
      description: language === 'ar'
        ? 'تحديد المخاطر المحتملة وخطط التعامل معها'
        : 'Identifying potential risks and mitigation plans',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'from-teal-500 to-cyan-500',
      questions: [
        language === 'ar' ? 'ما المخاطر المالية المحتملة؟' : 'What are the potential financial risks?',
        language === 'ar' ? 'ما المخاطر التشغيلية؟' : 'What are the operational risks?',
        language === 'ar' ? 'ما المخاطر التنافسية؟' : 'What are the competitive risks?',
        language === 'ar' ? 'ما خطط التخفيف من المخاطر؟' : 'What are the risk mitigation plans?',
      ]
    },
    {
      id: 8,
      title: language === 'ar' ? 'الملخص التنفيذي والخطة التنفيذية' : 'Executive Summary & Implementation Plan',
      description: language === 'ar'
        ? 'ملخص شامل للمشروع مع الجدول الزمني التنفيذي'
        : 'Comprehensive project summary with implementation timeline',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-500',
      questions: [
        language === 'ar' ? 'ملخص المشروع (صفحة واحدة)' : 'Project summary (one page)',
        language === 'ar' ? 'ما المراحل الرئيسية للتنفيذ؟' : 'What are the key implementation phases?',
        language === 'ar' ? 'ما الجدول الزمني المتوقع؟' : 'What is the expected timeline?',
        language === 'ar' ? 'ما مؤشرات النجاح الرئيسية؟' : 'What are the key success indicators?',
      ]
    },
  ];

  const studentCapabilities = [
    { icon: <FileText className="w-4 h-4" />, text: language === 'ar' ? 'ملء نماذج منظمة' : 'Fill structured forms' },
    { icon: <Upload className="w-4 h-4" />, text: language === 'ar' ? 'تحميل المستندات (PDF/Excel)' : 'Upload documents (PDF/Excel)' },
    { icon: <Save className="w-4 h-4" />, text: language === 'ar' ? 'حفظ المسودات' : 'Save drafts' },
    { icon: <Send className="w-4 h-4" />, text: language === 'ar' ? 'تسليم دراسة الجدوى النهائية' : 'Submit final feasibility study' },
  ];

  const teacherCapabilities = [
    { icon: <Eye className="w-4 h-4" />, text: language === 'ar' ? 'مراجعة التسليمات' : 'Review submissions' },
    { icon: <CheckCircle className="w-4 h-4" />, text: language === 'ar' ? 'قبول / رفض' : 'Accept / reject' },
    { icon: <FileText className="w-4 h-4" />, text: language === 'ar' ? 'ترك ملاحظات' : 'Leave feedback' },
    { icon: <Lock className="w-4 h-4" />, text: language === 'ar' ? 'قفل / فتح إعادة التسليم' : 'Lock / unlock resubmission' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 z-50 overflow-hidden"
          >
            <Card className="h-full bg-white dark:bg-[#1B1B3A] border-2 border-purple-300 dark:border-[#4ECDC4]/30 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-6 flex items-center justify-between border-b border-amber-600">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Lock className="w-3 h-3 mr-1" />
                    {t.teacherPreview}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedSection === null ? (
                  <>
                    {/* Student & Teacher Capabilities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Student Capabilities */}
                      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30 p-5">
                        <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          👩‍🎓 {t.studentCapabilities}
                        </h3>
                        <ul className="space-y-3">
                          {studentCapabilities.map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-blue-600 dark:text-blue-300">
                              <span className="mt-0.5">{item.icon}</span>
                              <span className="text-sm">{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>

                      {/* Teacher Capabilities */}
                      <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-500/30 p-5">
                        <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          👨‍🏫 {t.teacherCapabilities}
                        </h3>
                        <ul className="space-y-3">
                          {teacherCapabilities.map((item, index) => (
                            <li key={index} className="flex items-start gap-3 text-purple-600 dark:text-purple-300">
                              <span className="mt-0.5">{item.icon}</span>
                              <span className="text-sm">{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>

                    {/* Project Sections List */}
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        {t.sections}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {capstoneections.map((section, index) => (
                          <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card
                              className="p-5 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group border-2 border-slate-200 dark:border-slate-700"
                              onClick={() => setSelectedSection(section.id)}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                                  {section.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                      {section.title}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      {section.id}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2">
                                    {section.description}
                                  </p>
                                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-[#4ECDC4]">
                                    <Eye className="w-3 h-3" />
                                    <span>{t.viewSection}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Section Detail View */}
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSection(null)}
                      className="mb-6"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t.backToSections}
                    </Button>

                    {(() => {
                      const section = capstoneections.find(s => s.id === selectedSection);
                      if (!section) return null;

                      return (
                        <div>
                          {/* Section Header */}
                          <Card className={`bg-gradient-to-r ${section.color} p-6 mb-6 text-white`}>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                                {section.icon}
                              </div>
                              <div>
                                <Badge className="bg-white/20 text-white mb-2">
                                  {language === 'ar' ? `القسم ${section.id}` : `Section ${section.id}`}
                                </Badge>
                                <h3 className="text-2xl font-bold">{section.title}</h3>
                              </div>
                            </div>
                            <p className="text-white/90">{section.description}</p>
                          </Card>

                          {/* Questions/Tasks */}
                          <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                              {language === 'ar' ? 'الأسئلة والمهام المطلوبة' : 'Required Questions & Tasks'}
                            </h4>
                            <div className="space-y-4">
                              {section.questions.map((question, index) => (
                                <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-0.5">
                                      {index + 1}
                                    </Badge>
                                    <div className="flex-1">
                                      <p className="font-medium text-slate-900 dark:text-white mb-2">
                                        {question}
                                      </p>
                                      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3 text-sm text-slate-500 dark:text-gray-400 italic">
                                        {language === 'ar' ? '[الطالب سيقوم بالإجابة هنا]' : '[Student will answer here]'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>

                          {/* Preview Note */}
                          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30 p-4 mt-6">
                            <div className="flex items-start gap-3">
                              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
                                  {language === 'ar' 
                                    ? 'هذه معاينة للمُدرّس فقط. الطلاب سيستطيعون التعديل والحفظ والتسليم.'
                                    : 'This is a teacher preview only. Students will be able to edit, save, and submit.'}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-purple-200 dark:border-[#4ECDC4]/30 p-4 bg-slate-50 dark:bg-[#0F0F25]">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-gray-400">
                    {language === 'ar' 
                      ? '8 أقسام شاملة | معاينة للمُدرّس فقط'
                      : '8 Comprehensive Sections | Teacher Preview Only'}
                  </div>
                  <Button onClick={onClose} variant="outline">
                    {t.close}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
