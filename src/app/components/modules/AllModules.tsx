import React from 'react';
import { ModuleTemplate } from './ModuleTemplate';
import { DynamicShareholderModule } from './DynamicShareholderModule';
import { Level0ProjectType } from './Level0ProjectType';
import { Level1IdentityOwnership } from './Level1IdentityOwnership';
import { Level2LegalFramework } from './Level2LegalFramework';
import { Level3OperationalRequirements } from './Level3OperationalRequirements';
import { Level3PhysicalResources } from './Level3PhysicalResources';
import { Level4HumanResources } from './Level4HumanResources';
import { Level5MarketStrategy } from './Level5MarketStrategy';
import { Level6FinancingKPIs } from './Level6FinancingKPIs';
import { Level7BMCImplementation } from './Level7BMCImplementation';
import { SmartLocationAnalysis } from './SmartLocationAnalysis';

// FEASIBILITY STUDY JOURNEY MODULES (0-7)
export function ProjectTypeModule() {
  return <Level0ProjectType />;
}

export function MarketStrategyModule() {
  return <Level5MarketStrategy />;
}

export function LegalFrameworkModule() {
  return <Level2LegalFramework />;
}

export function OperationalRequirementsModule() {
  return <Level3OperationalRequirements />;
}

export function PhysicalResourcesModule() {
  return <Level3PhysicalResources />;
}

export function HumanResourcesModule() {
  return <Level4HumanResources />;
}

export function FinancingKPIsModule() {
  return <Level6FinancingKPIs />;
}

export function IdentityOwnershipModule() {
  return <Level1IdentityOwnership />;
}

export function BMCImplementationModule() {
  return <Level7BMCImplementation />;
}

export function SmartLocationModule() {
  return <SmartLocationAnalysis />;
}

// OLD SYSTEM (KEEP FOR BACKWARDS COMPATIBILITY)
export function ShareholderModule() {
  return <DynamicShareholderModule />;
}

export function CompetitorModule() {
  return (
    <ModuleTemplate
      moduleId={2}
      title="تحليل المنافسين"
      description="حدد منافسيك وحلل نقاط قوتهم وضعفهم"
      fields={[
        { id: 'competitor1', label: 'المنافس الأول', type: 'text', required: true, placeholder: 'مثال: شركة النجاح للتقنية', helpText: 'اختر أقرب منافس مباشر لك في السوق' },
        { id: 'competitor1Strength', label: 'نقاط القوة', type: 'textarea', required: true, placeholder: 'مثال: علامة تجارية قوية، خبرة طويلة، أسعار منافسة', helpText: 'حدد 3-5 نقاط قوة رئيسية' },
        { id: 'competitor1Weakness', label: 'نقاط الضعف', type: 'textarea', required: true, placeholder: 'مثال: خدمة عملاء ضعيفة، عدم وجود تطبيق جوال', helpText: 'ركز على النقاط التي يمكنك استغلالها' },
        { id: 'competitor2', label: 'المنافس الثاني', type: 'text', placeholder: 'اختياري - منافس آخر' },
        { id: 'competitor2Strength', label: 'نقاط القوة', type: 'textarea', placeholder: 'نقاط قوة المنافس الثاني' },
        { id: 'competitor2Weakness', label: 'نقاط الضعف', type: 'textarea', placeholder: 'نقاط ضعف المنافس الثاني' },
        { id: 'competitiveAdvantage', label: 'ميزتك التنافسية', type: 'textarea', required: true, placeholder: 'ما الذي يميزك عن المنافسين؟', helpText: 'اشرح لماذا سيختار العملاء منتجك/خدمتك' },
        { id: 'marketPosition', label: 'موقعك في السوق', type: 'textarea', placeholder: 'مثال: رائد في التقنية، الأقل سعراً، الأعلى جودة' },
      ]}
    />
  );
}

export function AssetModule() {
  return (
    <ModuleTemplate
      moduleId={3}
      title="إدارة الأصول"
      description="حدد الأصول الثابتة والمعدات المطلوبة لمشروعك"
      fields={[
        { id: 'equipment1', label: 'المعدات/الأصل الأول', type: 'text', required: true, placeholder: 'مثال: جهاز كمبيوتر، ماكينة تصنيع، طابعة', helpText: 'حدد أهم معدة أساسية للمشروع' },
        { id: 'equipment1Cost', label: 'التكلفة (ريال)', type: 'number', required: true, placeholder: 'مثال: 5000', recommendedRange: '1,000 - 50,000 حسب نوع المعدة' },
        { id: 'equipment1Qty', label: 'الكمية', type: 'number', required: true, placeholder: 'مثال: 2', recommendedRange: '1-10 للبدء' },
        { id: 'equipment2', label: 'المعدات/الأصل الثاني', type: 'text', placeholder: 'معدة إضافية (اختياري)' },
        { id: 'equipment2Cost', label: 'التكلفة (ريال)', type: 'number', placeholder: 'مثال: 3000' },
        { id: 'equipment2Qty', label: 'الكمية', type: 'number', placeholder: 'مثال: 1' },
        { id: 'furniture', label: 'الأثاث والتجهيزات', type: 'text', placeholder: 'مثال: مكاتب، كراسي، خزائن', helpText: 'اذكر الأثاث الأساسي للمكتب/المحل' },
        { id: 'furnitureCost', label: 'تكلفة الأثاث (ريال)', type: 'number', placeholder: 'مثال: 8000', recommendedRange: '5,000 - 20,000 للمشاريع الصغيرة' },
        { id: 'technology', label: 'التقنية والبرمجيات', type: 'text', placeholder: 'مثال: نظام نقاط البيع، برامج محاسبة' },
        { id: 'technologyCost', label: 'تكلفة التقنية (ريال)', type: 'number', placeholder: 'مثال: 4000', recommendedRange: '2,000 - 15,000' },
      ]}
    />
  );
}

export function EmployeeModule() {
  return (
    <ModuleTemplate
      moduleId={4}
      title="تخطيط الموظفين"
      description="خطط لاحتياجاتك من الموظفين العمانيين والوافدين"
      fields={[
        { id: 'omaniEmployee1', label: 'الموظف العماني - الوظيفة', type: 'text', required: true, placeholder: 'مثال: مدير مبيعات، محاسب، فني', helpText: 'حدد المسمى الوظيفي بدقة' },
        { id: 'omaniSalary1', label: 'الراتب الشهري (ريال)', type: 'number', required: true, placeholder: 'مثال: 500', recommendedRange: '325 - 1,500 حسب الوظيفة والخبرة', helpText: 'الحد الأدنى للأجور في عُمان 325 ريال' },
        { id: 'omaniCount1', label: 'العدد', type: 'number', required: true, placeholder: 'مثال: 2', recommendedRange: '1-5 للبدء' },
        { id: 'expatEmployee1', label: 'الموظف الوافد - الوظيفة', type: 'text', placeholder: 'مثال: عامل، سائق (اختياري)' },
        { id: 'expatSalary1', label: 'الراتب الشهري (ريال)', type: 'number', placeholder: 'مثال: 200', recommendedRange: '150 - 800 حسب الوظيفة' },
        { id: 'expatCount1', label: 'العدد', type: 'number', placeholder: 'مثال: 1' },
        { id: 'omanizationRate', label: 'نسبة التعمين %', type: 'number', required: true, placeholder: 'مثال: 80', recommendedRange: '35-100%', helpText: 'الحد الأدنى لنسبة التعمين في معظم القطاعات 35%' },
        { id: 'totalEmployees', label: 'إجمالي عدد الموظفين', type: 'number', required: true, placeholder: 'مثال: 5', recommendedRange: '2-10 للمشاريع الصغيرة', helpText: 'احسب مجموع الموظفين العمانيين والوافدين' },
        { id: 'benefits', label: 'المزايا الإضافية', type: 'textarea', placeholder: 'مثال: تأمين صحي، بدل مواصلات، حوافز' },
      ]}
    />
  );
}

export function OperationsModule() {
  return (
    <ModuleTemplate
      moduleId={5}
      title="المتطلبات القانونية والتراخيص"
      description="حدد التراخيص والموافقات والمتطلبات القانونية اللازمة لتأسيس مشروعك"
      fields={[
        { id: 'location', label: 'موقع المشروع', type: 'text', required: true, placeholder: 'مثال: مسقط - الموالح، صحار - صناعية', helpText: 'اختر موقعاً استراتيجياً قريباً من السوق المستهدف' },
        { id: 'rentCost', label: 'تكلفة الإيجار الشهرية (ريال)', type: 'number', required: true, placeholder: 'مثال: 800', recommendedRange: '300 - 3,000 حسب الموقع والمساحة', helpText: 'تأكد من مراعا تكاليف التأمين والصيانة' },
        { id: 'utilities', label: 'تكلفة المرافق الشهرية (ريال)', type: 'number', required: true, placeholder: 'مثال: 200', recommendedRange: '100 - 500 (كهرباء، ماء، إنترنت)', helpText: 'شامل الكهرباء والماء والإنترنت والهاتف' },
        { id: 'rawMaterials', label: 'المواد الخام/المستلزمات', type: 'textarea', placeholder: 'مثال: مواد تعبئة، مواد خام للإنتاج، لوازم مكتبية', helpText: 'حدد المواد الأساسية المطلوبة شهرياً' },
        { id: 'rawMaterialsCost', label: 'تكلفة المواد الشهرية (ريال)', type: 'number', placeholder: 'مثال: 1500', recommendedRange: '500 - 5,000 حسب نوع النشاط' },
        { id: 'licenses', label: 'التراخيص المطلوبة', type: 'textarea', required: true, placeholder: 'مثال: السجل التجاري، البلدية، وزارة الصحة', helpText: 'اذكر جميع التراخيص والموافقات الحكومية المطلوبة' },
        { id: 'licensesCost', label: 'تكلفة التراخيص (ريال)', type: 'number', placeholder: 'مثال: 500', recommendedRange: '200 - 2,000 (تكلفة لمرة واحدة أو سنوية)' },
        { id: 'operatingHours', label: 'ساعات العمل اليومية', type: 'text', placeholder: 'مثال: 8 ساعات، من 8 صباحاً - 5 مساءً', helpText: 'حدد أوقات العمل بوضوح' },
      ]}
    />
  );
}

export function MarketModule() {
  return (
    <ModuleTemplate
      moduleId={6}
      title="تحليل السوق"
      description="حلل السوق المستهدف وحجم الطلب"
      fields={[
        { id: 'targetMarket', label: 'السوق المستهدف', type: 'textarea', required: true, placeholder: 'مثال: سوق التجزئة في مسقط، قطاع المقاولات، السوق الإلكتروني', helpText: 'حدد السوق الجغرافي والقطاع المستهدف بوضوح' },
        { id: 'marketSize', label: 'حجم السوق التقديري', type: 'text', required: true, placeholder: 'مثال: 5 مليون ريال سنوياً، 10,000 عميل محتمل', helpText: 'قدّر حجم السوق بالقيمة المالية أو عدد العملاء' },
        { id: 'targetCustomers', label: 'العملاء المستهدفون', type: 'textarea', required: true, placeholder: 'مثال: الشباب 18-35 سنة، الشركات الصغيرة، العائلات', helpText: 'صف خصائص عملائك المثاليين (العمر، الدخل، الاهتمامات)' },
        { id: 'customerSegments', label: 'شرائح العملاء', type: 'textarea', placeholder: 'مثال: شريحة 1: الأفراد، شريحة 2: الشركات', helpText: 'قسّم العملاء إلى مجموعات حسب احتياجاتهم' },
        { id: 'marketTrends', label: 'اتجاهات السوق', type: 'textarea', placeholder: 'مثال: زيادة الطلب على التسوق الإلكتروني، التحول الرقمي', helpText: 'اذكر الاتجاهات الحالية التي تؤثر على سوقك' },
        { id: 'marketGrowth', label: 'نمو السوق المتوقع %', type: 'number', placeholder: 'مثال: 15', recommendedRange: '5-30% سنوياً', helpText: 'معدل النمو السنوي المتوقع للسوق' },
        { id: 'marketChallenges', label: 'التحديات السوقية', type: 'textarea', placeholder: 'مثال: منافسة شديدة، تغير أذواق العملاء، التكاليف المرتفعة' },
        { id: 'marketOpportunities', label: 'الفرص السوقية', type: 'textarea', placeholder: 'مثال: نقص في الخدمات المماثلة، دعم حكومي، سوق غير مستغل' },
      ]}
    />
  );
}

export function FinancialModule() {
  return (
    <ModuleTemplate
      moduleId={7}
      title="التخطيط المالي"
      description="خطط للإيرادات والتكاليف والربحية"
      fields={[
        { id: 'revenueStream1', label: 'مصدر الإيراد الأول', type: 'text', required: true, placeholder: 'مثال: مبيعات المنتجات، رسوم الخدمات، الاشتراكات', helpText: 'حدد المصدر الرئيسي للدخل' },
        { id: 'revenue1Monthly', label: 'الإيراد الشهري المتوقع (ريال)', type: 'number', required: true, placeholder: 'مثال: 15000', recommendedRange: '5,000 - 50,000 للبداية', helpText: 'توقع واقعي بناءً على دراسة السوق' },
        { id: 'revenueStream2', label: 'مصدر الإيراد الثاني', type: 'text', placeholder: 'مثال: خدمات إضافية، منتجات تكميلية (اختياري)' },
        { id: 'revenue2Monthly', label: 'الإيراد الشهري المتوقع (ريال)', type: 'number', placeholder: 'مثال: 5000' },
        { id: 'totalMonthlyRevenue', label: 'إجمالي الإيراد الشهري (ريال)', type: 'number', required: true, placeholder: 'مثال: 20000', helpText: 'مجموع جميع مصادر الإيراد الشهرية', recommendedRange: '10,000 - 100,000' },
        { id: 'totalMonthlyCost', label: 'إجمالي التكاليف الشهرية (ريال)', type: 'number', required: true, placeholder: 'مثال: 12000', helpText: 'شامل الرواتب، الإيجار، المواد، المرافق', recommendedRange: '5,000 - 80,000' },
        { id: 'breakEvenMonths', label: 'نقطة التعادل (بالأشهر)', type: 'number', placeholder: 'مثال: 18', recommendedRange: '6-24 شهر', helpText: 'الوقت المتوقع لتغطية التكاليف وبدء الربح' },
        { id: 'profitMargin', label: 'هامش الربح %', type: 'number', placeholder: 'مثال: 40', recommendedRange: '20-50%', helpText: 'نسبة الربح من الإيراد (الإيراد - التكاليف / الإيراد)' },
        { id: 'financialProjection', label: 'التوقعات المالية', type: 'textarea', placeholder: 'توقعات الأرباح والنمو للسنوات الثلاث القادمة', helpText: 'خطة مالية طويلة المدى' },
      ]}
    />
  );
}

export function SummaryModule() {
  return (
    <ModuleTemplate
      moduleId={8}
      title="الملخص التنفيذي"
      description="اكتب ملخصاً تنفيذياً شاملاً لمشروعك"
      fields={[
        { id: 'executiveSummary', label: 'الملخص التنفيذي', type: 'textarea', required: true, placeholder: 'اكتب ملخصاً شاملاً لفكرة المشروع وأهدافه' },
        { id: 'vision', label: 'الرؤية', type: 'textarea', required: true },
        { id: 'mission', label: 'الرسالة', type: 'textarea', required: true },
        { id: 'goals', label: 'الأهداف', type: 'textarea', required: true },
        { id: 'keySuccess', label: 'عوامل النجاح الرئيسية', type: 'textarea' },
        { id: 'risks', label: 'المخاطر المحتملة', type: 'textarea' },
        { id: 'mitigation', label: 'خطط التخفيف من المخاطر', type: 'textarea' },
        { id: 'recommendations', label: 'التوصيات', type: 'textarea' },
      ]}
    />
  );
}