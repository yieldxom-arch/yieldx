import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Trophy, Download, Calendar, Hash, Star } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { generateCertificatePDF, type CertificateData } from '@/app/utils/certificateGenerator';

interface SavedCertificate extends CertificateData {
  userId: string;
  generatedAt: string;
}

export function CertificateGallery() {
  const { user, language } = useYieldX();
  const [certificates, setCertificates] = useState<SavedCertificate[]>([]);

  useEffect(() => {
    // Load certificates from localStorage
    const savedCertificates = JSON.parse(localStorage.getItem('yieldx_certificates') || '[]');
    const userCertificates = savedCertificates.filter(
      (cert: SavedCertificate) => cert.userId === user?.id
    );
    setCertificates(userCertificates);
  }, [user?.id]);

  const handleDownload = async (cert: CertificateData) => {
    await generateCertificatePDF(cert, language);
  };

  const t = {
    ar: {
      myCertificates: 'شهاداتي',
      noCertificatesYet: 'لا توجد شهادات بعد',
      earnYourFirst: 'أكمل جميع المستويات لكسب شهادتك الأولى!',
      downloadAgain: 'تنزيل مرة أخرى',
      generatedOn: 'تم الإنشاء في',
      excellence: 'تميّز',
      completion: 'إتمام'
    },
    en: {
      myCertificates: 'My Certificates',
      noCertificatesYet: 'No certificates yet',
      earnYourFirst: 'Complete all levels to earn your first certificate!',
      downloadAgain: 'Download Again',
      generatedOn: 'Generated on',
      excellence: 'Excellence',
      completion: 'Completion'
    }
  };

  const text = t[language];

  if (certificates.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
        >
          <Award className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          {text.noCertificatesYet}
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          {text.earnYourFirst}
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Trophy className="w-8 h-8 text-yellow-500" />
        {text.myCertificates}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.certificateId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 border-2 transition-all hover:shadow-xl ${
              cert.certificateType === 'excellence'
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-400 dark:border-blue-600'
            }`}>
              {/* Certificate Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  cert.certificateType === 'excellence'
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                }`}>
                  {cert.certificateType === 'excellence' ? (
                    <Trophy className="w-8 h-8 text-white" />
                  ) : (
                    <Award className="w-8 h-8 text-white" />
                  )}
                </div>

                <Badge className={
                  cert.certificateType === 'excellence'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-blue-500 text-white'
                }>
                  {cert.certificateType === 'excellence' ? (
                    <>
                      <Star className="w-3 h-3 mr-1" />
                      {text.excellence}
                    </>
                  ) : (
                    text.completion
                  )}
                </Badge>
              </div>

              {/* Certificate Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {cert.userName}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {cert.projectTitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{text.generatedOn} {cert.completionDate}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Hash className="w-4 h-4" />
                    <span className="font-mono text-xs">{cert.certificateId}</span>
                  </div>
                  <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
                    {cert.performanceScore}%
                  </Badge>
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={() => handleDownload(cert)}
                className={`w-full ${
                  cert.certificateType === 'excellence'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                {text.downloadAgain}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
