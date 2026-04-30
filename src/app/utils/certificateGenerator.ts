import { jsPDF } from 'jspdf';

export interface CertificateData {
  userName: string;
  projectTitle: string;
  completionDate: string;
  performanceScore: number;
  certificateId: string;
  certificateType: 'completion' | 'excellence';
}

/**
 * Generate a unique certificate ID
 */
export function generateCertificateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `YX-${timestamp}-${random}`;
}

/**
 * Generate and download certificate PDF
 */
export async function generateCertificatePDF(data: CertificateData, language: 'ar' | 'en' = 'ar'): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient simulation with rectangles
  doc.setFillColor(15, 15, 37); // Dark blue background
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Add decorative border
  doc.setDrawColor(126, 219, 202); // #7EDBCA
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  doc.setDrawColor(78, 205, 196); // #4ECDC4
  doc.setLineWidth(1);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Add decorative corners
  doc.setFillColor(126, 219, 202);
  // Top left
  doc.circle(15, 15, 3, 'F');
  // Top right
  doc.circle(pageWidth - 15, 15, 3, 'F');
  // Bottom left
  doc.circle(15, pageHeight - 15, 3, 'F');
  // Bottom right
  doc.circle(pageWidth - 15, pageHeight - 15, 3, 'F');

  // YieldX Logo/Header
  doc.setFontSize(32);
  doc.setTextColor(126, 219, 202);
  doc.text('YieldX', pageWidth / 2, 35, { align: 'center' });

  // Certificate Title
  const title = data.certificateType === 'excellence' 
    ? (language === 'ar' ? 'شهادة تميّز' : 'Certificate of Excellence')
    : (language === 'ar' ? 'شهادة إتمام' : 'Certificate of Completion');
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth / 2, 55, { align: 'center' });

  // Subtitle
  const subtitle = language === 'ar' 
    ? 'منصة دراسة الجدوى التعليمية المُتحَوّلة'
    : 'Gamified Business Feasibility Study Platform';
  
  doc.setFontSize(12);
  doc.setTextColor(168, 230, 207);
  doc.text(subtitle, pageWidth / 2, 65, { align: 'center' });

  // Achievement text
  const achievementText = language === 'ar'
    ? 'هذه الشهادة تُمنح لـ'
    : 'This certificate is proudly awarded to';
  
  doc.setFontSize(14);
  doc.setTextColor(200, 200, 200);
  doc.text(achievementText, pageWidth / 2, 80, { align: 'center' });

  // User Name
  doc.setFontSize(26);
  doc.setTextColor(78, 205, 196);
  doc.text(data.userName, pageWidth / 2, 95, { align: 'center' });

  // Recognition text
  const recognitionText = language === 'ar'
    ? 'لإكماله بنجاح دراسة الجدوى الشاملة لمشروع'
    : 'for successfully completing a comprehensive feasibility study for';
  
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  doc.text(recognitionText, pageWidth / 2, 110, { align: 'center' });

  // Project Title
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(data.projectTitle, pageWidth / 2, 122, { align: 'center' });

  // Performance Score
  doc.setFontSize(16);
  doc.setTextColor(126, 219, 202);
  const scoreText = language === 'ar'
    ? `بدرجة إنجاز: ${data.performanceScore}%`
    : `Performance Score: ${data.performanceScore}%`;
  doc.text(scoreText, pageWidth / 2, 140, { align: 'center' });

  // Excellence badge if applicable
  if (data.certificateType === 'excellence') {
    doc.setFillColor(255, 215, 0); // Gold
    doc.circle(pageWidth / 2, 155, 8, 'F');
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 37);
    doc.text('★', pageWidth / 2, 157, { align: 'center' });
  }

  // Date
  doc.setFontSize(11);
  doc.setTextColor(168, 230, 207);
  const dateLabel = language === 'ar' ? 'تاريخ الإكمال:' : 'Completion Date:';
  doc.text(`${dateLabel} ${data.completionDate}`, pageWidth / 2, 170, { align: 'center' });

  // Certificate ID
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  const idLabel = language === 'ar' ? 'رقم الشهادة:' : 'Certificate ID:';
  doc.text(`${idLabel} ${data.certificateId}`, pageWidth / 2, 180, { align: 'center' });

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const footerNote = language === 'ar'
    ? 'يمكن التحقق من صحة هذه الشهادة عبر منصة YieldX الرسمية'
    : 'This certificate can be verified through the official YieldX platform';
  doc.text(footerNote, pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Download the PDF
  const fileName = `YieldX_Certificate_${data.certificateId}.pdf`;
  doc.save(fileName);
}

/**
 * Calculate completion percentage based on required fields
 * This function should be used across all modules to determine true completion
 */
export function calculateCompletionPercentage(moduleData: Record<string, any>, requiredFields: string[][]): number {
  if (requiredFields.length === 0) return 0;

  let totalRequiredFields = 0;
  let completedRequiredFields = 0;

  requiredFields.forEach((fields, moduleIndex) => {
    const moduleKey = `module-${moduleIndex + 1}`;
    const data = moduleData[moduleKey] || {};
    
    fields.forEach(fieldId => {
      totalRequiredFields++;
      const value = data[fieldId];
      if (value !== undefined && value !== null && value !== '') {
        completedRequiredFields++;
      }
    });
  });

  return totalRequiredFields > 0 ? (completedRequiredFields / totalRequiredFields) * 100 : 0;
}

/**
 * Calculate performance score (can be different from completion)
 * This includes quality metrics, time taken, etc.
 */
export function calculatePerformanceScore(
  completionPercentage: number,
  totalXP: number,
  maxTotalXP: number,
  completionTime?: number, // in days
  targetTime?: number // in days
): number {
  // Base score from completion
  let score = completionPercentage * 0.6; // 60% weight

  // XP achievement
  const xpPercentage = maxTotalXP > 0 ? (totalXP / maxTotalXP) * 100 : 0;
  score += xpPercentage * 0.3; // 30% weight

  // Time bonus/penalty (if provided)
  if (completionTime && targetTime) {
    const timeRatio = completionTime / targetTime;
    if (timeRatio <= 1) {
      // Completed early or on time - bonus
      score += 10 * (1 - timeRatio); // Up to 10% bonus
    } else {
      // Completed late - small penalty
      score -= Math.min(10, (timeRatio - 1) * 5); // Up to 10% penalty
    }
  } else {
    // No time data - give average bonus
    score += 5; // 5% bonus
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Check if user should receive Excellence certificate
 */
export function shouldReceiveExcellenceCertificate(performanceScore: number): boolean {
  return performanceScore >= 90;
}

/**
 * Check if progress checkpoint should be shown (80-90%)
 */
export function shouldShowProgressCheckpoint(completionPercentage: number): boolean {
  return completionPercentage >= 80 && completionPercentage < 100;
}
