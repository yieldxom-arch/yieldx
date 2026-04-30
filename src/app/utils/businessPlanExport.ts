import * as XLSX from 'xlsx';
import { BusinessPlan } from '@/app/types/businessPlan';
import { toast } from 'sonner';

export const exportBusinessPlanToExcel = (plan: BusinessPlan) => {
  try {
    const workbook = XLSX.utils.book_new();

    // 1. Project Information Sheet
    const projectInfoData = [
      ['معلومات المشروع', ''],
      ['اسم المشروع', plan.projectInfo?.projectName || ''],
      ['الاسم القانوني', plan.projectInfo?.legalName || ''],
      ['الشكل القانوني', plan.projectInfo?.legalForm || ''],
      ['نوع المشروع', plan.projectInfo?.projectType || ''],
      ['القطاع', plan.projectInfo?.industry || ''],
      ['الهاتف', plan.projectInfo?.phone || ''],
      ['البريد الإلكتروني', plan.projectInfo?.email || ''],
      ['العنوان', plan.projectInfo?.address || ''],
      ['', ''],
      ['الرؤية', plan.projectInfo?.vision || ''],
      ['الرسالة', plan.projectInfo?.mission || ''],
      ['الوصف', plan.projectInfo?.description || ''],
    ];
    const projectSheet = XLSX.utils.aoa_to_sheet(projectInfoData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'معلومات المشروع');

    // 2. Shareholders Sheet
    if (plan.shareholders && plan.shareholders.length > 0) {
      const shareholdersData = plan.shareholders.map((s) => ({
        'الاسم': s.name,
        'الجنسية': s.nationality,
        'رقم الهوية': s.idNumber,
        'عدد الأسهم': s.shares,
        'نسبة المساهمة': `${s.sharePercentage.toFixed(2)}%`,
        'المساهمة المالية': s.capitalContribution,
        'الدور': s.role,
        'الهاتف': s.phone || '',
        'البريد': s.email || '',
      }));
      const shareholdersSheet = XLSX.utils.json_to_sheet(shareholdersData);
      XLSX.utils.book_append_sheet(workbook, shareholdersSheet, 'المساهمون');
    }

    // 3. SWOT Analysis Sheet
    if (plan.swotAnalysis) {
      const swotData = [
        ['تحليل SWOT', '', '', ''],
        ['', '', '', ''],
        ['نقاط القوة (Strengths)', 'نقاط الضعف (Weaknesses)', 'الفرص (Opportunities)', 'التهديدات (Threats)'],
      ];
      
      const maxLength = Math.max(
        plan.swotAnalysis.strengths?.length || 0,
        plan.swotAnalysis.weaknesses?.length || 0,
        plan.swotAnalysis.opportunities?.length || 0,
        plan.swotAnalysis.threats?.length || 0
      );
      
      for (let i = 0; i < maxLength; i++) {
        swotData.push([
          plan.swotAnalysis.strengths[i] || '',
          plan.swotAnalysis.weaknesses[i] || '',
          plan.swotAnalysis.opportunities[i] || '',
          plan.swotAnalysis.threats[i] || '',
        ]);
      }
      
      const swotSheet = XLSX.utils.aoa_to_sheet(swotData);
      XLSX.utils.book_append_sheet(workbook, swotSheet, 'تحليل SWOT');
    }

    // 4. Competitors Sheet
    if (plan.competitors && plan.competitors.length > 0) {
      const competitorsData = plan.competitors.map((c) => ({
        'اسم المنافس': c.name,
        'الموقع': c.location,
        'المنتجات/الخدمات': c.products,
        'الأسعار': c.prices,
        'نقاط القوة': c.strengths,
        'نقاط الضعف': c.weaknesses,
        'حصة السوق': c.marketShare || '',
      }));
      const competitorsSheet = XLSX.utils.json_to_sheet(competitorsData);
      XLSX.utils.book_append_sheet(workbook, competitorsSheet, 'تحليل المنافسين');
    }

    // 5. Market Trends Sheet
    if (plan.marketTrends && plan.marketTrends.length > 0) {
      const trendsData = plan.marketTrends.map((t) => ({
        'العامل/الاتجاه': t.factor,
        'التأثير': t.impact,
        'الوصف': t.description,
        'الفرص': t.opportunities,
      }));
      const trendsSheet = XLSX.utils.json_to_sheet(trendsData);
      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'اتجاهات السوق');
    }

    // 6. Products Sheet
    if (plan.products && plan.products.length > 0) {
      const productsData = plan.products.map((p) => ({
        'المنتج': p.name,
        'الفئة': p.category,
        'الوحدة': p.unit,
        'سعر الوحدة': p.unitPrice,
        'الكمية - السنة 1': p.targetQuantityYear1,
        'الإيراد - السنة 1': p.targetQuantityYear1 * p.unitPrice,
        'الكمية - السنة 2': p.targetQuantityYear2,
        'الإيراد - السنة 2': p.targetQuantityYear2 * p.unitPrice,
        'الكمية - السنة 3': p.targetQuantityYear3,
        'الإيراد - السنة 3': p.targetQuantityYear3 * p.unitPrice,
      }));
      const productsSheet = XLSX.utils.json_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'المنتجات والخدمات');
    }

    // 7. Marketing Mix Sheet
    if (plan.marketingMix) {
      const marketingData = [
        ['المزيج التسويقي (4Ps)', ''],
        ['', ''],
        ['المنتج (Product)', ''],
        ['الوصف', plan.marketingMix.product?.description || ''],
        ['الجودة', plan.marketingMix.product?.quality || ''],
        ['التغليف', plan.marketingMix.product?.packaging || ''],
        ['', ''],
        ['السعر (Price)', ''],
        ['استراتيجية التسعير', plan.marketingMix.price?.strategy || ''],
        ['السعر الأساسي', plan.marketingMix.price?.basePrice || 0],
        ['الخصومات', plan.marketingMix.price?.discounts || ''],
        ['شروط الدفع', plan.marketingMix.price?.paymentTerms || ''],
        ['', ''],
        ['المكان (Place)', ''],
        ['الموقع', plan.marketingMix.place?.location || ''],
        ['التغطية', plan.marketingMix.place?.coverage || ''],
        ['', ''],
        ['الترويج (Promotion)', ''],
        ['الميزانية', plan.marketingMix.promotion?.budget || 0],
      ];
      const marketingSheet = XLSX.utils.aoa_to_sheet(marketingData);
      XLSX.utils.book_append_sheet(workbook, marketingSheet, 'المزيج التسويقي');
    }

    // 8. Working Capital Sheet
    if (plan.workingCapital) {
      const capitalData = [
        ['رأس المال العامل (3 أشهر)', ''],
        ['البيان', 'المبلغ (ريال)'],
        ['إيجار المباني', plan.workingCapital.buildingRent3Months || 0],
        ['إيجار المعدات', plan.workingCapital.equipmentRent3Months || 0],
        ['الرواتب', plan.workingCapital.salaries3Months || 0],
        ['المواد الخام', plan.workingCapital.rawMaterials3Months || 0],
        ['المصاريف الإدارية', plan.workingCapital.adminExpenses3Months || 0],
        ['المرافق', plan.workingCapital.utilities3Months || 0],
        ['التسويق', plan.workingCapital.marketing3Months || 0],
        ['الصيانة', plan.workingCapital.maintenance3Months || 0],
        ['التأمين', plan.workingCapital.insurance3Months || 0],
        ['تأمين العمال', plan.workingCapital.workerInsurance3Months || 0],
        ['', ''],
        [
          'الإجمالي',
          Object.values(plan.workingCapital).reduce((sum, val) => sum + (val || 0), 0),
        ],
      ];
      const capitalSheet = XLSX.utils.aoa_to_sheet(capitalData);
      XLSX.utils.book_append_sheet(workbook, capitalSheet, 'رأس المال العامل');
    }

    // 9. Implementation Timeline
    if (plan.implementationTasks && plan.implementationTasks.length > 0) {
      const tasksData = plan.implementationTasks.map((t) => ({
        'المهمة': t.task,
        'المدة (أيام)': t.duration,
        'الحالة': t.status,
        'المسؤول': t.responsible || '',
      }));
      const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
      XLSX.utils.book_append_sheet(workbook, tasksSheet, 'خطة التنفيذ');
    }

    // 10. Document Checklist
    if (plan.documentChecklist) {
      const checklistData = Object.entries(plan.documentChecklist).map(([key, value]) => ({
        'المستند': key,
        'الحالة': value ? 'مكتمل ✓' : 'غير مكتمل',
      }));
      const checklistSheet = XLSX.utils.json_to_sheet(checklistData);
      XLSX.utils.book_append_sheet(workbook, checklistSheet, 'قائمة المتطلبات');
    }

    // Export the file
    const filename = `${plan.projectInfo?.projectName || 'business-plan'}-${
      new Date().toISOString().split('T')[0]
    }.xlsx`;
    
    XLSX.writeFile(workbook, filename);

    toast.success('تم تصدير دراسة الجدوى', {
      description: 'تم حفظ الملف بنجاح',
    });

    return true;
  } catch (error) {
    console.error('Error exporting business plan:', error);
    toast.error('فشل تصدير دراسة الجدوى', {
      description: 'حدث خطأ أثناء تصدير البيانات',
    });
    return false;
  }
};
