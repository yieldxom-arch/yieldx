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

const LEVEL_INFO: Record<number, { icon: string; ar: string; en: string }> = {
  0: { icon: '🎯', ar: 'اختيار نوع المشروع', en: 'Project Type Selection' },
  1: { icon: '🏛️', ar: 'الهوية والملكية', en: 'Identity & Ownership' },
  2: { icon: '⚖️', ar: 'الإطار القانوني والتنظيمي', en: 'Legal & Regulatory Framework' },
  3: { icon: '🏗️', ar: 'الموارد المادية والفنية', en: 'Physical & Technical Resources' },
  4: { icon: '👥', ar: 'الموارد البشرية والتنظيمية', en: 'Human & Organizational Resources' },
  5: { icon: '📊', ar: 'السوق والاستراتيجية', en: 'Market & Strategy' },
  6: { icon: '💰', ar: 'التمويل والمؤشرات المالية', en: 'Financing & Financial KPIs' },
  7: { icon: '🚀', ar: 'النموذج الشامل والتنفيذ', en: 'Full Model & Implementation' },
};

const PROJECT_TYPE_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  agricultural: { ar: 'زراعي', en: 'Agricultural', color: '#22c55e' },
  industrial:   { ar: 'صناعي', en: 'Industrial',   color: '#f97316' },
  commercial:   { ar: 'تجاري', en: 'Commercial',   color: '#3b82f6' },
  service:      { ar: 'خدمي',  en: 'Service',      color: '#a855f7' },
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' });
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

export function FeasibilityStudyExport({ project, onClose }: FeasibilityStudyExportProps) {
  const { language, moduleData } = useYieldX();
  const printRef = useRef<HTMLDivElement>(null);
  const isRTL = language === 'ar';

  const levels = project.levelsSnapshot || [];
  const snap = project.moduleDataSnapshot || {};
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
                  {isRTL ? 'آخر تعديل:' : 'Last Edited:'} {formatDate(project.lastEditedDate)}
                  &nbsp;•&nbsp;
                  {isRTL ? 'تاريخ الإنشاء:' : 'Created:'} {formatDate(project.createdAt)}
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
              {(l0.projectType || project.projectType) && (
                <SectionCard title={`${LEVEL_INFO[0].icon} ${isRTL ? LEVEL_INFO[0].ar : LEVEL_INFO[0].en}`} icon="🎯">
                  <KeyValue label={isRTL ? 'نوع المشروع' : 'Project Type'} value={typeInfo ? (isRTL ? typeInfo.ar : typeInfo.en) : project.projectType} />
                  <KeyValue label={isRTL ? 'وضع الدراسة' : 'Study Mode'} value={l0.studyMode} />
                  <KeyValue label={isRTL ? 'سنوات الإسقاط' : 'Projection Years'} value={l0.yearsProjection} />
                </SectionCard>
              )}

              {/* ── Level 1: Identity & Ownership ── */}
              {Object.keys(l1).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[1].icon} ${isRTL ? LEVEL_INFO[1].ar : LEVEL_INFO[1].en}`} icon="🏛️">
                  <KeyValue label={isRTL ? 'اسم المشروع' : 'Project Name'} value={l1.projectName} />
                  <KeyValue label={isRTL ? 'الشعار/الرؤية' : 'Slogan/Vision'} value={l1.slogan} />
                  <KeyValue label={isRTL ? 'العنوان' : 'Address'} value={l1.address} />
                  <KeyValue label={isRTL ? 'رأس المال الإجمالي' : 'Total Capital'} value={l1.totalCapital ? `${Number(l1.totalCapital).toLocaleString()} ريال` : undefined} />
                  <KeyValue label={isRTL ? 'عدد المساهمين' : 'Shareholders'} value={l1.shareholders?.length} />
                  {Array.isArray(l1.shareholders) && l1.shareholders.map((sh: any, i: number) => (
                    <div key={i} style={{ marginRight: '16px', marginBottom: '4px', fontSize: '12px', color: '#6366f1' }}>
                      • {sh.name} — {sh.percentage}% — {sh.capital ? `${Number(sh.capital).toLocaleString()} ريال` : ''}
                    </div>
                  ))}
                </SectionCard>
              )}

              {/* ── Level 2: Legal ── */}
              {Object.keys(l2).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[2].icon} ${isRTL ? LEVEL_INFO[2].ar : LEVEL_INFO[2].en}`} icon="⚖️">
                  <KeyValue label={isRTL ? 'الشكل القانوني' : 'Legal Form'} value={l2.legalForm} />
                  <KeyValue label={isRTL ? 'السجل التجاري' : 'Commercial Register'} value={l2.commercialRegister} />
                  <KeyValue label={isRTL ? 'رخصة البلدية' : 'Municipal License'} value={l2.municipalLicense} />
                  <KeyValue label={isRTL ? 'تأمين المنشأة' : 'Premises Insurance'} value={l2.premisesInsurance} />
                  <KeyValue label={isRTL ? 'تكلفة الإيجار/شهر' : 'Rent/Month'} value={l2.monthlyRent ? `${Number(l2.monthlyRent).toLocaleString()} ريال` : undefined} />
                  <KeyValue label={isRTL ? 'مساحة المنشأة' : 'Premises Area'} value={l2.premisesArea ? `${l2.premisesArea} م²` : undefined} />
                </SectionCard>
              )}

              {/* ── Level 3: Physical Resources ── */}
              {Object.keys(l3).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[3].icon} ${isRTL ? LEVEL_INFO[3].ar : LEVEL_INFO[3].en}`} icon="🏗️">
                  <KeyValue label={isRTL ? 'إجمالي الأصول الثابتة' : 'Total Fixed Assets'} value={l3.totalFixedAssets ? `${Number(l3.totalFixedAssets).toLocaleString()} ريال` : undefined} />
                  <KeyValue label={isRTL ? 'إجمالي المواد الخام' : 'Total Raw Materials'} value={l3.totalRawMaterials ? `${Number(l3.totalRawMaterials).toLocaleString()} ريال` : undefined} />
                  <KeyValue label={isRTL ? 'إجمالي الإهلاك السنوي' : 'Total Annual Depreciation'} value={l3.totalDepreciation ? `${Number(l3.totalDepreciation).toLocaleString()} ريال` : undefined} />
                  {Array.isArray(l3.fixedAssets) && l3.fixedAssets.slice(0, 5).map((a: any, i: number) => (
                    <div key={i} style={{ marginRight: '16px', marginBottom: '4px', fontSize: '12px', color: '#f97316' }}>
                      • {a.name} — {a.quantity} × {Number(a.unitCost || 0).toLocaleString()} ريال
                    </div>
                  ))}
                </SectionCard>
              )}

              {/* ── Level 4: Human Resources ── */}
              {Object.keys(l4).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[4].icon} ${isRTL ? LEVEL_INFO[4].ar : LEVEL_INFO[4].en}`} icon="👥">
                  <KeyValue label={isRTL ? 'إجمالي الرواتب الشهرية' : 'Total Monthly Salaries'} value={l4.totalMonthlySalaries ? `${Number(l4.totalMonthlySalaries).toLocaleString()} ريال` : undefined} />
                  <KeyValue label={isRTL ? 'إجمالي الرواتب السنوية' : 'Total Annual Salaries'} value={l4.totalAnnualSalaries ? `${Number(l4.totalAnnualSalaries).toLocaleString()} ريال` : undefined} />
                  <KeyValue label={isRTL ? 'عدد الموظفين' : 'Total Employees'} value={l4.employees?.length} />
                  {Array.isArray(l4.employees) && l4.employees.slice(0, 6).map((e: any, i: number) => (
                    <div key={i} style={{ marginRight: '16px', marginBottom: '4px', fontSize: '12px', color: '#8b5cf6' }}>
                      • {e.jobTitle} — {e.nationality === 'omani' ? (isRTL ? 'عُماني' : 'Omani') : (isRTL ? 'وافد' : 'Expat')} — {Number(e.salary || 0).toLocaleString()} ريال
                    </div>
                  ))}
                </SectionCard>
              )}

              {/* ── Level 5: Market & Strategy ── */}
              {Object.keys(l5).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[5].icon} ${isRTL ? LEVEL_INFO[5].ar : LEVEL_INFO[5].en}`} icon="📊">
                  <KeyValue label={isRTL ? 'السوق المستهدف' : 'Target Market'} value={l5.targetMarket} />
                  <KeyValue label={isRTL ? 'حجم السوق' : 'Market Size'} value={l5.marketSize} />
                  <KeyValue label={isRTL ? 'الميزة التنافسية' : 'Competitive Advantage'} value={l5.competitiveAdvantage} />
                  {l5.swot && (
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
                            {Array.isArray(l5.swot?.[q.key]) && l5.swot[q.key].map((pt: any, i: number) => (
                              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '2px' }}>• {pt.text || pt}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* ── Level 6: Finance ── */}
              {Object.keys(l6).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[6].icon} ${isRTL ? LEVEL_INFO[6].ar : LEVEL_INFO[6].en}`} icon="💰">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <KeyValue label={isRTL ? 'إجمالي الإيرادات السنوية' : 'Annual Revenue'} value={l6.annualRevenue ? `${Number(l6.annualRevenue).toLocaleString()} ريال` : undefined} />
                      <KeyValue label={isRTL ? 'إجمالي التكاليف السنوية' : 'Annual Costs'} value={l6.totalAnnualCosts ? `${Number(l6.totalAnnualCosts).toLocaleString()} ريال` : undefined} />
                      <KeyValue label={isRTL ? 'صافي الربح السنوي' : 'Net Profit'} value={l6.netProfit ? `${Number(l6.netProfit).toLocaleString()} ريال` : undefined} />
                    </div>
                    <div>
                      <KeyValue label="ROI" value={l6.roi ? `${l6.roi}%` : undefined} />
                      <KeyValue label="IRR" value={l6.irr ? `${l6.irr}%` : undefined} />
                      <KeyValue label="NPV" value={l6.npv ? `${Number(l6.npv).toLocaleString()} ريال` : undefined} />
                      <KeyValue label={isRTL ? 'فترة الاسترداد' : 'Payback Period'} value={l6.paybackPeriod ? `${l6.paybackPeriod} ${isRTL ? 'سنة' : 'yrs'}` : undefined} />
                      <KeyValue label={isRTL ? 'نقطة التعادل' : 'Break-even'} value={l6.breakEvenPoint} />
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── Level 7: BMC & Implementation ── */}
              {Object.keys(l7).length > 0 && (
                <SectionCard title={`${LEVEL_INFO[7].icon} ${isRTL ? LEVEL_INFO[7].ar : LEVEL_INFO[7].en}`} icon="🚀">
                  <KeyValue label={isRTL ? 'مساهمة رؤية عُمان 2040' : 'Oman Vision 2040'} value={l7.oman2040Contribution} />
                  <KeyValue label={isRTL ? 'الوظائف المباشرة' : 'Direct Jobs'} value={l7.directJobs} />
                  <KeyValue label={isRTL ? 'الوظائف غير المباشرة' : 'Indirect Jobs'} value={l7.indirectJobs} />
                  {l7.bmc && (
                    <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      {[
                        { key: 'valueProposition', label: isRTL ? 'القيمة المقدمة' : 'Value Proposition' },
                        { key: 'customerSegments', label: isRTL ? 'شرائح العملاء' : 'Customer Segments' },
                        { key: 'revenueStreams', label: isRTL ? 'مصادر الإيرادات' : 'Revenue Streams' },
                        { key: 'keyPartners', label: isRTL ? 'الشركاء الرئيسيون' : 'Key Partners' },
                        { key: 'keyActivities', label: isRTL ? 'الأنشطة الرئيسية' : 'Key Activities' },
                        { key: 'costStructure', label: isRTL ? 'هيكل التكاليف' : 'Cost Structure' },
                      ].map(b => (
                        <div key={b.key} style={{ padding: '10px', background: '#f5f3ff', borderRadius: '6px', border: '1px solid #c4b5fd' }}>
                          <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '11px', marginBottom: '4px' }}>{b.label}</div>
                          {Array.isArray(l7.bmc?.[b.key]) && l7.bmc[b.key].map((item: string, i: number) => (
                            <div key={i} style={{ fontSize: '11px', color: '#374151' }}>• {item}</div>
                          ))}
                        </div>
                      ))}
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
