import React, { useRef } from 'react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import type { SavedProject } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { X, Printer, Download, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeasibilityStudyExportProps {
  project: SavedProject;
  onClose: () => void;
}

// Must match the journey routing (module-0 … module-7) and moduleData keys (level0 … level7).
const LEVEL_INFO: Record<number, { icon: string; ar: string; en: string }> = {
  0: { icon: '🎯', ar: 'اختيار نوع المشروع', en: 'Project Type Selection' },
  1: { icon: '🏛️', ar: 'الهوية والملكية', en: 'Identity & Ownership' },
  2: { icon: '⚖️', ar: 'الإطار القانوني والتنظيمي', en: 'Legal & Regulatory Framework' },
  3: { icon: '⚙️', ar: 'المتطلبات التشغيلية', en: 'Operational Requirements' },
  4: { icon: '🏗️', ar: 'الموارد المادية والفنية', en: 'Physical & Technical Resources' },
  5: { icon: '👥', ar: 'الموارد البشرية والتنظيمية', en: 'Human & Organizational Resources' },
  6: { icon: '💰', ar: 'التمويل والمؤشرات المالية', en: 'Financing & Financial KPIs' },
  7: { icon: '📊', ar: 'السوق والاستراتيجية', en: 'Market & Strategy' },
};

const PROJECT_TYPE_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  agricultural: { ar: 'زراعي', en: 'Agricultural', color: '#22c55e' },
  industrial:   { ar: 'صناعي', en: 'Industrial',   color: '#f97316' },
  commercial:   { ar: 'تجاري', en: 'Commercial',   color: '#3b82f6' },
  service:      { ar: 'خدمي',  en: 'Service',      color: '#a855f7' },
};

function formatDate(iso: string, lang: string = 'ar'): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return iso.slice(0, 10); }
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px', breakInside: 'avoid' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '12px 20px',
        borderRadius: '8px 8px 0 0',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <h3 style={{ color: '#e0e7ff', fontSize: '16px', fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      <div style={{
        background: '#fafafa',
        border: '1px solid #e0e7ff',
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        padding: '16px 20px',
      }}>
        {children}
      </div>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
      <span style={{ color: '#6366f1', fontWeight: 700, minWidth: '160px', fontSize: '13px' }}>{label}:</span>
      <span style={{ color: '#374151', fontSize: '13px', flex: 1 }}>{value}</span>
    </div>
  );
}

function MiniTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  if (rows.length === 0) return null;
  const cell: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', textAlign: 'start' };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0 12px' }}>
      <thead>
        <tr>{headers.map((h, i) => <th key={i} style={{ ...cell, color: '#6366f1', fontWeight: 700, background: '#eef2ff' }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ ...cell, color: '#374151' }}>{c}</td>)}</tr>)}
      </tbody>
    </table>
  );
}

const toNum = (v: any) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export function FeasibilityStudyExport({ project, onClose }: FeasibilityStudyExportProps) {
  const { language, moduleData, activeSavedProjectId } = useYieldX();
  const printRef = useRef<HTMLDivElement>(null);
  const isRTL = language === 'ar';
  // Omani rial: show baisa (up to 3 decimals) for small amounts such as unit prices.
  const money = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: Math.abs(n) < 100 ? 3 : 0 })} ${isRTL ? 'ر.ع' : 'OMR'}`;

  const levels = project.levelsSnapshot || [];
  // The active project's latest data lives in context; saved snapshots can be older.
  const snap = (project.id === activeSavedProjectId ? moduleData : project.moduleDataSnapshot) || {};
  const typeInfo = PROJECT_TYPE_LABELS[project.projectType || ''];
  const completedCount = levels.filter(l => l.completed).length;
  const totalXP = levels.reduce((s, l) => s + (l.xp || 0), 0);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}">
      <head>
        <meta charset="UTF-8">
        <title>YieldX – ${project.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&family=Inter:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: '${isRTL ? 'Noto Sans Arabic' : 'Inter'}', sans-serif; background: white; color: #1f2937; direction: ${isRTL ? 'rtl' : 'ltr'}; font-size: 13px; line-height: 1.6; }
          @media print { .no-print { display: none !important; } @page { margin: 15mm; size: A4; } }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 600);
  };

  // Extract level-specific data from snapshot
  const l0 = snap['level0'] || {};
  const l1 = snap['level1'] || {};
  const l2 = snap['level2'] || {};
  const l3 = snap['level3'] || {};
  const l4 = snap['level4'] || {};
  const l5 = snap['level5'] || {};
  const l6 = snap['level6'] || {};
  const l7 = snap['level7'] || {};

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isRTL ? 'تصدير دراسة الجدوى' : 'Export Feasibility Study'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{project.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2"
              >
                <Printer className="w-4 h-4" />
                {isRTL ? 'طباعة / تنزيل PDF' : 'Print / Download PDF'}
              </Button>
              <Button variant="outline" onClick={onClose} size="icon" className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable Report Preview */}
          <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-800 p-6">
            <div ref={printRef}>
              {/* ── Cover Page ── */}
              <div style={{
                background: 'linear-gradient(135deg, #0f0f25 0%, #1b1b3a 50%, #2d2b6b 100%)',
                padding: '48px 40px',
                borderRadius: '12px',
                marginBottom: '32px',
                textAlign: 'center',
                color: 'white',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '4px', color: '#4ecdc4', marginBottom: '8px' }}>
                  YieldX
                </div>
                <div style={{ fontSize: '13px', color: '#7fdbca', marginBottom: '32px' }}>
                  {isRTL ? 'منصة دراسة الجدوى التفاعلية' : 'Interactive Feasibility Study Platform'}
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  padding: '28px 32px',
                  display: 'inline-block',
                  minWidth: '400px',
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>{project.name}</div>
                  {typeInfo && (
                    <div style={{
                      display: 'inline-block',
                      background: typeInfo.color + '33',
                      border: `1px solid ${typeInfo.color}80`,
                      borderRadius: '20px',
                      padding: '4px 16px',
                      color: typeInfo.color,
                      fontWeight: 700,
                      fontSize: '14px',
                      marginBottom: '20px',
                    }}>
                      {isRTL ? typeInfo.ar : typeInfo.en}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '8px' }}>
                    {[
                      { label: isRTL ? 'إجمالي XP' : 'Total XP', value: totalXP.toString(), color: '#4ecdc4' },
                      { label: isRTL ? 'المستويات المكتملة' : 'Completed Levels', value: `${completedCount}/8`, color: '#7fdbca' },
                      { label: isRTL ? 'الحالة' : 'Status', value: project.status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') : (isRTL ? 'قيد التنفيذ' : 'In Progress'), color: project.status === 'completed' ? '#4ade80' : '#fbbf24' },
                    ].map((stat, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: '24px', fontSize: '12px', color: '#6b7280' }}>
                  {isRTL ? 'آخر تعديل:' : 'Last Edited:'} {formatDate(project.lastEditedDate, language)}
                  &nbsp;•&nbsp;
                  {isRTL ? 'تاريخ الإنشاء:' : 'Created:'} {formatDate(project.createdAt, language)}
                </div>
              </div>

              {/* ── Progress Summary ── */}
              <SectionCard title={isRTL ? 'ملخص التقدم' : 'Progress Summary'} icon="📈">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {levels.map(l => {
                    const info = LEVEL_INFO[l.levelId];
                    return (
                      <div key={l.levelId} style={{
                        padding: '12px',
                        background: l.completed ? '#f0fdf4' : '#fefce8',
                        border: `1px solid ${l.completed ? '#86efac' : '#fde68a'}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{info?.icon}</div>
                        <div style={{ fontSize: '11px', color: '#374151', fontWeight: 600, marginBottom: '4px' }}>
                          {isRTL ? info?.ar : info?.en}
                        </div>
                        <div style={{ fontSize: '12px', color: l.completed ? '#16a34a' : '#92400e' }}>
                          {l.completed ? (isRTL ? '✅ مكتمل' : '✅ Done') : `${l.xp}/${l.maxXp} XP`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* ── Level 0: Project Type ── */}
              {project.projectType && (
                <SectionCard title={`${LEVEL_INFO[0].icon} ${isRTL ? LEVEL_INFO[0].ar : LEVEL_INFO[0].en}`} icon="🎯">
                  <KeyValue label={isRTL ? 'نوع المشروع' : 'Project Type'} value={typeInfo ? (isRTL ? typeInfo.ar : typeInfo.en) : project.projectType} />
                  <KeyValue label={isRTL ? 'وضع الدراسة' : 'Study Mode'} value={project.studyModeData?.mode} />
                </SectionCard>
              )}

              {/* ── Level 1: Identity & Ownership ── */}
              {Object.keys(l1).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[1].icon} ${isRTL ? LEVEL_INFO[1].ar : LEVEL_INFO[1].en}`} icon="🏛️">
                  <KeyValue label={isRTL ? 'اسم المشروع' : 'Business Name'} value={l1.businessName} />
                  <KeyValue label={isRTL ? 'فكرة المشروع' : 'Project Idea'} value={l1.projectIdea} />
                  <KeyValue label={isRTL ? 'وصف المنتج/الخدمة' : 'Product / Service'} value={l1.productDescription} />
                  <KeyValue label={isRTL ? 'حالة المشروع' : 'Project Status'} value={l1.projectStatus === 'expansion' ? (isRTL ? 'توسعة' : 'Expansion') : l1.projectStatus ? (isRTL ? 'مشروع جديد' : 'New project') : undefined} />
                  <KeyValue label={isRTL ? 'الموقع' : 'Location'} value={l1.location} />
                  <MiniTable
                    headers={[isRTL ? 'المالك' : 'Owner', isRTL ? 'الجنسية' : 'Nationality', isRTL ? 'نسبة الملكية' : 'Share']}
                    rows={(Array.isArray(l1.owners) ? l1.owners : []).filter((o: any) => o?.name).map((o: any) => [
                      o.name,
                      o.nationality === 'omani' ? (isRTL ? 'عُماني' : 'Omani') : (isRTL ? 'وافد' : 'Expat'),
                      `${toNum(o.sharePercentage)}%`,
                    ])}
                  />
                </SectionCard>
              )}

              {/* ── Level 2: Legal ── */}
              {Object.keys(l2).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[2].icon} ${isRTL ? LEVEL_INFO[2].ar : LEVEL_INFO[2].en}`} icon="⚖️">
                  <MiniTable
                    headers={[isRTL ? 'الترخيص' : 'Licence', isRTL ? 'الجهة' : 'Authority', isRTL ? 'الحالة' : 'Status', isRTL ? 'التكلفة' : 'Cost']}
                    rows={(Array.isArray(l2.licenses) ? l2.licenses : []).filter((x: any) => x?.name).map((x: any) => [x.name, x.authority || '—', x.status || '—', money(toNum(x.cost))])}
                  />
                  <KeyValue label={isRTL ? 'إجمالي تكلفة التراخيص' : 'Total licence cost'} value={Array.isArray(l2.licenses) ? money(l2.licenses.reduce((t: number, x: any) => t + toNum(x.cost), 0)) : undefined} />
                  <MiniTable
                    headers={[isRTL ? 'العقار' : 'Premises', isRTL ? 'المساحة' : 'Area', isRTL ? 'إيجار/تملك' : 'Rent/Own', isRTL ? 'الإيجار الشهري' : 'Monthly rent', isRTL ? 'المدة' : 'Duration']}
                    rows={(Array.isArray(l2.leaseContracts) ? l2.leaseContracts : []).filter((x: any) => x?.propertyType || x?.monthlyRent).map((x: any) => [
                      x.propertyType || '—', x.area ? `${x.area} m²` : '—', x.leaseOrOwn === 'own' ? (isRTL ? 'تملك' : 'Own') : (isRTL ? 'إيجار' : 'Rent'), money(toNum(x.monthlyRent)), x.duration || '—',
                    ])}
                  />
                </SectionCard>
              )}

              {/* ── Level 3: Operational Requirements ── */}
              {Object.keys(l3).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[3].icon} ${isRTL ? LEVEL_INFO[3].ar : LEVEL_INFO[3].en}`} icon="⚙️">
                  <KeyValue label={isRTL ? 'الموقع' : 'Location'} value={l3.location} />
                  <KeyValue label={isRTL ? 'ساعات العمل' : 'Operating hours'} value={l3.operatingHours} />
                  <KeyValue label={isRTL ? 'الإيجار الشهري' : 'Monthly rent'} value={l3.rentCost ? money(toNum(l3.rentCost)) : undefined} />
                  <KeyValue label={isRTL ? 'المرافق الشهرية' : 'Monthly utilities'} value={l3.utilities ? money(toNum(l3.utilities)) : undefined} />
                  <KeyValue label={isRTL ? 'المواد والمستلزمات' : 'Materials & supplies'} value={l3.rawMaterials} />
                  <KeyValue label={isRTL ? 'تكلفة المواد الشهرية' : 'Monthly materials cost'} value={l3.rawMaterialsCost ? money(toNum(l3.rawMaterialsCost)) : undefined} />
                </SectionCard>
              )}

              {/* ── Level 4: Physical Resources ── */}
              {Object.keys(l4).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[4].icon} ${isRTL ? LEVEL_INFO[4].ar : LEVEL_INFO[4].en}`} icon="🏗️">
                  <KeyValue label={isRTL ? 'إجمالي الأصول الثابتة' : 'Total fixed assets'} value={l4.totalFixedAssetsCost ? money(toNum(l4.totalFixedAssetsCost)) : undefined} />
                  <KeyValue label={isRTL ? 'المواد الخام شهرياً' : 'Raw materials per month'} value={l4.totalMonthlyRawMaterialCost ? money(toNum(l4.totalMonthlyRawMaterialCost)) : undefined} />
                  <KeyValue label={isRTL ? 'الإهلاك السنوي' : 'Annual depreciation'} value={l4.totalAnnualDepreciation ? money(toNum(l4.totalAnnualDepreciation)) : undefined} />
                  <MiniTable
                    headers={[isRTL ? 'الأصل' : 'Asset', isRTL ? 'الكمية' : 'Qty', isRTL ? 'سعر الوحدة' : 'Unit price', isRTL ? 'الإجمالي' : 'Total', isRTL ? 'شراء/إيجار' : 'Buy/Lease']}
                    rows={(Array.isArray(l4.fixedAssets) ? l4.fixedAssets : []).filter((a: any) => a?.name).map((a: any) => [
                      a.name, toNum(a.quantity), money(toNum(a.unitPrice)), money(toNum(a.quantity) * toNum(a.unitPrice)), a.acquisitionMethod === 'lease' ? (isRTL ? 'إيجار' : 'Lease') : (isRTL ? 'شراء' : 'Purchase'),
                    ])}
                  />
                  <MiniTable
                    headers={[isRTL ? 'المادة' : 'Material', isRTL ? 'الكمية الشهرية' : 'Monthly qty', isRTL ? 'سعر الوحدة' : 'Unit price', isRTL ? 'التكلفة الشهرية' : 'Monthly cost']}
                    rows={(Array.isArray(l4.rawMaterials) ? l4.rawMaterials : []).filter((m: any) => m?.name).map((m: any) => [
                      m.name, `${toNum(m.monthlyQuantity)} ${m.unit || ''}`, money(toNum(m.unitPrice)), money(toNum(m.monthlyQuantity) * toNum(m.unitPrice)),
                    ])}
                  />
                </SectionCard>
              )}

              {/* ── Level 5: Human Resources ── */}
              {Object.keys(l5).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[5].icon} ${isRTL ? LEVEL_INFO[5].ar : LEVEL_INFO[5].en}`} icon="👥">
                  <KeyValue label={isRTL ? 'عدد الموظفين' : 'Total employees'} value={l5.totalEmployees} />
                  <KeyValue label={isRTL ? 'نسبة التعمين' : 'Omanization rate'} value={l5.omanizationRate !== undefined ? `${Math.round(toNum(l5.omanizationRate))}%` : undefined} />
                  <KeyValue label={isRTL ? 'الرواتب الشهرية' : 'Monthly salaries'} value={l5.totalMonthlySalaries ? money(toNum(l5.totalMonthlySalaries)) : undefined} />
                  <KeyValue label={isRTL ? 'تكلفة الموارد البشرية السنوية' : 'Annual HR cost'} value={l5.totalAnnualHRCost ? money(toNum(l5.totalAnnualHRCost)) : undefined} />
                  <MiniTable
                    headers={[isRTL ? 'الوظيفة' : 'Position', isRTL ? 'العدد' : 'Count', isRTL ? 'الجنسية' : 'Nationality', isRTL ? 'الراتب الشهري' : 'Monthly salary']}
                    rows={(Array.isArray(l5.employees) ? l5.employees : []).filter((e: any) => e?.position).map((e: any) => [
                      e.position, toNum(e.count), e.nationality === 'omani' ? (isRTL ? 'عُماني' : 'Omani') : (isRTL ? 'وافد' : 'Expat'), money(toNum(e.monthlySalary)),
                    ])}
                  />
                </SectionCard>
              )}

              {/* ── Level 6: Finance ── */}
              {Object.keys(l6).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[6].icon} ${isRTL ? LEVEL_INFO[6].ar : LEVEL_INFO[6].en}`} icon="💰">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <KeyValue label={isRTL ? 'إجمالي الاستثمار' : 'Total investment'} value={l6.totalInvestment ? money(toNum(l6.totalInvestment)) : undefined} />
                      <KeyValue label={isRTL ? 'رأس المال الخاص' : 'Equity'} value={l6.equityAmount ? money(toNum(l6.equityAmount)) : undefined} />
                      <KeyValue label={isRTL ? 'القرض' : 'Loan'} value={l6.loanAmount ? money(toNum(l6.loanAmount)) : undefined} />
                      <KeyValue label={isRTL ? 'الإيرادات الشهرية' : 'Monthly revenue'} value={l6.monthlyRevenue ? money(toNum(l6.monthlyRevenue)) : undefined} />
                    </div>
                    <div>
                      <KeyValue label="IRR" value={l6.kpis?.irr !== undefined ? `${toNum(l6.kpis.irr).toFixed(1)}%` : undefined} />
                      <KeyValue label={isRTL ? 'صافي القيمة الحالية (10%)' : 'NPV (10%)'} value={l6.kpis?.npv !== undefined ? money(toNum(l6.kpis.npv)) : undefined} />
                      <KeyValue label="ROI" value={l6.kpis?.roi !== undefined ? `${toNum(l6.kpis.roi).toFixed(1)}%` : undefined} />
                      <KeyValue label={isRTL ? 'فترة الاسترداد' : 'Payback period'} value={l6.kpis?.paybackPeriod !== undefined ? `${toNum(l6.kpis.paybackPeriod).toFixed(1)} ${isRTL ? 'سنة' : 'yrs'}` : undefined} />
                      <KeyValue label={isRTL ? 'نقطة التعادل' : 'Break-even'} value={l6.kpis?.breakEvenUnits ? `${Math.ceil(toNum(l6.kpis.breakEvenUnits)).toLocaleString('en-US')} ${isRTL ? 'وحدة/شهر' : 'units/month'}` : undefined} />
                    </div>
                  </div>
                  <MiniTable
                    headers={[isRTL ? 'السنة' : 'Year', isRTL ? 'الإيرادات' : 'Revenue', isRTL ? 'التكاليف التشغيلية' : 'Operating costs', isRTL ? 'صافي الربح' : 'Net profit']}
                    rows={(Array.isArray(l6.projections) ? l6.projections : []).map((p: any) => [p.year, money(toNum(p.revenue)), money(toNum(p.costs)), money(toNum(p.profit))])}
                  />
                  {l6.scenario && (
                    <div style={{ marginTop: '8px', padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '12px', color: '#1e3a8a' }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                        {isRTL ? `محاكاة المخاطر (${toNum(l6.scenario.iterations).toLocaleString('en-US')} سيناريو)` : `Risk simulation (${toNum(l6.scenario.iterations).toLocaleString('en-US')} scenarios)`}
                      </div>
                      <div>
                        {isRTL
                          ? `احتمال تحقيق ربح: ${Math.round(toNum(l6.scenario.pProfit) * 100)}% · النتيجة المرجحة: ${money(toNum(l6.scenario.netP50))} · سيناريو سيئ (1 من 10): ${money(toNum(l6.scenario.netP10))} · الخطة: ${money(toNum(l6.scenario.planNet))}`
                          : `Chance of profit: ${Math.round(toNum(l6.scenario.pProfit) * 100)}% · Likely result: ${money(toNum(l6.scenario.netP50))} · 1-in-10 bad case: ${money(toNum(l6.scenario.netP10))} · Plan: ${money(toNum(l6.scenario.planNet))}`}
                      </div>
                      <div>
                        {isRTL ? `أكثر افتراض مؤثر: ${l6.scenario.topDriverAr}` : `Most sensitive assumption: ${l6.scenario.topDriver}`}
                      </div>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* ── Level 7: Market & Strategy ── */}
              {Object.keys(l7).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[7].icon} ${isRTL ? LEVEL_INFO[7].ar : LEVEL_INFO[7].en}`} icon="📊">
                  <MiniTable
                    headers={[isRTL ? 'المنتج/الخدمة' : 'Product / service', isRTL ? 'السعر' : 'Price', isRTL ? 'الكمية الشهرية' : 'Monthly qty', isRTL ? 'هامش الربح' : 'Margin', isRTL ? 'الإيراد الشهري' : 'Monthly revenue']}
                    rows={(Array.isArray(l7.products) ? l7.products : []).filter((p: any) => p?.name).map((p: any) => [
                      p.name, money(toNum(p.price)), toNum(p.monthlyQuantity), `${toNum(p.profitMargin)}%`, money(toNum(p.price) * toNum(p.monthlyQuantity)),
                    ])}
                  />
                  <KeyValue label={isRTL ? 'إجمالي الإيرادات الشهرية' : 'Total monthly revenue'} value={l7.totalMonthlyRevenue ? money(toNum(l7.totalMonthlyRevenue)) : undefined} />
                  <MiniTable
                    headers={[isRTL ? 'المنافس' : 'Competitor', isRTL ? 'نقاط القوة' : 'Strengths', isRTL ? 'نقاط الضعف' : 'Weaknesses']}
                    rows={(Array.isArray(l7.competitors) ? l7.competitors : []).filter((c: any) => c?.name).map((c: any) => [c.name, c.strengths || '—', c.weaknesses || '—'])}
                  />
                  {l7.swot && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#374151', marginBottom: '8px', fontSize: '13px' }}>
                        {isRTL ? 'تحليل SWOT:' : 'SWOT Analysis:'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          { key: 'strengths', label: isRTL ? 'نقاط القوة' : 'Strengths', color: '#16a34a' },
                          { key: 'weaknesses', label: isRTL ? 'نقاط الضعف' : 'Weaknesses', color: '#dc2626' },
                          { key: 'opportunities', label: isRTL ? 'الفرص' : 'Opportunities', color: '#2563eb' },
                          { key: 'threats', label: isRTL ? 'التهديدات' : 'Threats', color: '#d97706' },
                        ].map(q => (
                          <div key={q.key} style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px', border: `1px solid ${q.color}40` }}>
                            <div style={{ fontWeight: 700, color: q.color, fontSize: '12px', marginBottom: '4px' }}>{q.label}</div>
                            {Array.isArray(l7.swot?.[q.key]) && l7.swot[q.key].filter((pt: any) => (pt?.text ?? pt)).map((pt: any, i: number) => (
                              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '2px' }}>• {pt?.text ?? pt}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* ── Footer ── */}
              <div style={{
                textAlign: 'center',
                padding: '24px',
                borderTop: '1px solid #e5e7eb',
                color: '#9ca3af',
                fontSize: '12px',
                marginTop: '16px',
              }}>
                <div style={{ fontWeight: 700, color: '#6366f1', marginBottom: '4px' }}>YieldX Platform</div>
                <div>{isRTL ? 'منصة دراسة الجدوى التفاعلية — رؤية عُمان 2040' : 'Interactive Feasibility Study Platform — Oman Vision 2040'}</div>
                <div style={{ marginTop: '4px' }}>{isRTL ? 'تاريخ التصدير:' : 'Export Date:'} {new Date().toLocaleDateString(isRTL ? 'ar-OM' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
