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

// ─── Certificate PDF ───────────────────────────────────────────────────────────
// jsPDF's built-in fonts have no Arabic letters, so Arabic text came out as
// garbage (e.g. "þ°"). The certificate is now drawn on a canvas, where the
// browser shapes Arabic correctly, and that picture is placed in the PDF.

const CERT_W = 3508; // A4 landscape at 300 dpi
const CERT_H = 2480;
const MM = CERT_W / 297; // pixels per millimetre
const pt = (size: number) => size * 0.3528 * MM; // jsPDF point size -> pixels
const FALLBACK_FONTS = 'Tahoma, "Segoe UI", "Geeza Pro", "Noto Naskh Arabic", Arial, sans-serif';
const CERT_FONT = 'YieldXCertificate';

async function loadCertificateFont(): Promise<string> {
  try {
    const fonts = (document as any).fonts as FontFaceSet | undefined;
    if (!fonts || typeof FontFace === 'undefined') return FALLBACK_FONTS;
    const loaded = Array.from(fonts as any as Iterable<FontFace>).some(f => f.family.replace(/"/g, '') === CERT_FONT);
    if (!loaded) {
      const faces = await Promise.all([
        new FontFace(CERT_FONT, 'url(/fonts/Cairo-Regular.ttf)', { weight: '400' }).load(),
        new FontFace(CERT_FONT, 'url(/fonts/Cairo-Bold.ttf)', { weight: '700' }).load(),
      ]);
      faces.forEach(f => fonts.add(f));
    }
    return `${CERT_FONT}, ${FALLBACK_FONTS}`;
  } catch {
    return FALLBACK_FONTS; // the system font still shows Arabic correctly
  }
}

const hasArabic = (s: string) => /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(s);

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Generate and download certificate PDF
 */
export async function generateCertificatePDF(data: CertificateData, language: 'ar' | 'en' = 'ar'): Promise<void> {
  const family = await loadCertificateFont();
  const canvas = document.createElement('canvas');
  canvas.width = CERT_W;
  canvas.height = CERT_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');

  const isAr = language === 'ar';
  const W = CERT_W;
  const H = CERT_H;

  // Background, borders and corners (same design as before)
  ctx.fillStyle = 'rgb(15,15,37)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgb(126,219,202)';
  ctx.lineWidth = 2 * MM;
  ctx.strokeRect(10 * MM, 10 * MM, W - 20 * MM, H - 20 * MM);
  ctx.strokeStyle = 'rgb(78,205,196)';
  ctx.lineWidth = 1 * MM;
  ctx.strokeRect(12 * MM, 12 * MM, W - 24 * MM, H - 24 * MM);
  ctx.fillStyle = 'rgb(126,219,202)';
  for (const [x, y] of [[15, 15], [297 - 15, 15], [15, 210 - 15], [297 - 15, 210 - 15]]) {
    ctx.beginPath();
    ctx.arc(x * MM, y * MM, 3 * MM, 0, Math.PI * 2);
    ctx.fill();
  }

  // Centered text at a baseline (in mm), shrinking long lines to fit.
  const maxWidth = W - 40 * MM;
  const text = (value: string, yMm: number, sizePt: number, color: string, weight: 400 | 700 = 400) => {
    let px = pt(sizePt);
    ctx.font = `${weight} ${px}px ${family}`;
    while (ctx.measureText(value).width > maxWidth && px > pt(6)) {
      px *= 0.94;
      ctx.font = `${weight} ${px}px ${family}`;
    }
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    (ctx as any).direction = hasArabic(value) ? 'rtl' : 'ltr';
    ctx.fillText(value, W / 2, yMm * MM);
  };

  text('YieldX', 35, 32, 'rgb(126,219,202)', 700);

  const title = data.certificateType === 'excellence'
    ? (isAr ? 'شهادة تميّز' : 'Certificate of Excellence')
    : (isAr ? 'شهادة إتمام' : 'Certificate of Completion');
  text(title, 55, 28, '#ffffff', 700);

  text(isAr ? 'منصة تعليمية لدراسات الجدوى' : 'Gamified Business Feasibility Study Platform', 65, 12, 'rgb(168,230,207)');
  text(isAr ? 'تُمنح هذه الشهادة إلى' : 'This certificate is proudly awarded to', 80, 14, 'rgb(200,200,200)');
  text(data.userName || '', 95, 26, 'rgb(78,205,196)', 700);
  text(isAr ? 'لإكمال دراسة الجدوى الشاملة بنجاح لمشروع' : 'for successfully completing a comprehensive feasibility study for', 110, 12, 'rgb(200,200,200)');
  text(data.projectTitle || '', 122, 18, '#ffffff', 700);
  text(isAr ? `بدرجة إنجاز: \u2066${data.performanceScore}%\u2069` : `Performance Score: ${data.performanceScore}%`, 140, 16, 'rgb(126,219,202)', 700);

  if (data.certificateType === 'excellence') {
    ctx.fillStyle = 'rgb(255,215,0)';
    ctx.beginPath();
    ctx.arc(W / 2, 155 * MM, 8 * MM, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgb(15,15,37)';
    drawStar(ctx, W / 2, 155 * MM, 4.6 * MM, 2 * MM);
  }

  text(`${isAr ? 'تاريخ الإكمال:' : 'Completion Date:'} ${data.completionDate}`, 170, 11, 'rgb(168,230,207)');
  text(`${isAr ? 'رقم الشهادة:' : 'Certificate ID:'} ⁦${data.certificateId}⁩`, 180, 9, 'rgb(150,150,150)');
  text(
    isAr ? 'يمكن التحقق من صحة هذه الشهادة عبر منصة YieldX الرسمية' : 'This certificate can be verified through the official YieldX platform',
    210 - 15,
    8,
    'rgb(120,120,120)'
  );

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);
  doc.setProperties({ title: title, subject: data.projectTitle || '', creator: 'YieldX' });
  doc.save(`YieldX_Certificate_${data.certificateId}.pdf`);
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
