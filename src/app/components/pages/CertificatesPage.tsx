import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Award, Search } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { CertificateGallery } from '@/app/components/certificates/CertificateGallery';
import { BrandedSearchWithResults } from '@/app/components/ui/branded-search';

export function CertificatesPage({ onBack }: { onBack: () => void }) {
  const { language, levels, activeProject } = useYieldX();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Search through levels and projects
    const results: any[] = [];

    // Search levels
    levels.forEach((level) => {
      if (level.title.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: `level-${level.levelId}`,
          title: level.title,
          description: level.subtitle,
          type: language === 'ar' ? 'مستوى' : 'Level',
          icon: <Award className="w-4 h-4" />
        });
      }
    });

    // Search active project
    if (activeProject && activeProject.name.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: 'active-project',
        title: activeProject.name,
        description: language === 'ar' ? 'مشروعك النشط' : 'Your Active Project',
        type: language === 'ar' ? 'مشروع' : 'Project',
        icon: <Award className="w-4 h-4" />
      });
    }

    setSearchResults(results);
  };

  const handleResultClick = (id: string) => {
    console.log('Navigate to:', id);
    // Implement navigation logic here
  };

  const t = {
    ar: {
      certificates: 'الشهادات',
      backToDashboard: 'العودة إلى لوحة التحكم',
      earnCertificate: 'احصل على شهادتك',
      myCertificates: 'شهاداتي',
      search: 'ابحث في YieldX...',
    },
    en: {
      certificates: 'Certificates',
      backToDashboard: 'Back to Dashboard',
      earnCertificate: 'Earn Certificate',
      myCertificates: 'My Certificates',
      search: 'Search in YieldX...',
    }
  };

  const text = t[language];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {text.backToDashboard}
          </Button>

          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {text.certificates}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {language === 'ar' 
                  ? 'احصل على شهادات معتمدة لإنجازاتك'
                  : 'Earn certified credentials for your achievements'}
              </p>
            </div>

            {/* Branded Search */}
            <div className="w-full md:w-96">
              <BrandedSearchWithResults
                language={language}
                placeholder={text.search}
                onSearch={handleSearch}
                results={searchResults}
                onResultClick={handleResultClick}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="earn" className="w-full">
          <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="earn" className="data-[state=active]:bg-violet-100 dark:data-[state=active]:bg-violet-900/30">
              <Award className="w-4 h-4 mr-2" />
              {text.earnCertificate}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-violet-100 dark:data-[state=active]:bg-violet-900/30">
              <Search className="w-4 h-4 mr-2" />
              {text.myCertificates}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earn" className="mt-6">
            <CertificateSystem />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <CertificateGallery />
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            {language === 'ar' ? 'عن الشهادات' : 'About Certificates'}
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>
              {language === 'ar' 
                ? '• يتم فتح الشهادة عند إكمال 100% من المهام الأساسية المطلوبة'
                : '• Certificate unlocks at 100% completion of required core tasks'}
            </p>
            <p>
              {language === 'ar'
                ? '• شهادة الإتمام: تُمنح عند إكمال جميع المتطلبات'
                : '• Completion Certificate: Awarded upon finishing all requirements'}
            </p>
            <p>
              {language === 'ar'
                ? '• شهادة التميّز: تُمنح للأداء المتميز (90%+)'
                : '• Excellence Certificate: Awarded for outstanding performance (90%+)'}
            </p>
            <p>
              {language === 'ar'
                ? '• كل شهادة تحتوي على رقم تعريف فريد للتحقق من صحتها'
                : '• Each certificate includes a unique ID for authenticity verification'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
