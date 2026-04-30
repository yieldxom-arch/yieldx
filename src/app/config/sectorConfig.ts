/**
 * Sector-Specific Configuration System
 * 
 * Defines conditional fields, validation rules, AI suggestions, and benchmarks
 * based on the project type selected in Level 0.
 */

import { ProjectType } from '@/app/contexts/YieldXContext';

// ========== SECTOR-SPECIFIC CONFIGURATION ==========

export interface SectorConfig {
  name: {
    ar: string;
    en: string;
  };
  icon: string;
  color: string;
  
  // Level 1: Identity & Ownership
  level1?: {
    additionalFields?: Array<{
      id: string;
      labelAr: string;
      labelEn: string;
      type: 'text' | 'number' | 'select' | 'textarea';
      required: boolean;
      options?: string[];
    }>;
  };
  
  // Level 2: Legal Framework
  level2: {
    mandatoryLicenses: Array<{
      nameAr: string;
      nameEn: string;
      typicalCost: number;
      authorityAr: string;
      authorityEn: string;
    }>;
    omanizationRate: {
      minimum: number; // Percentage
      recommended: number;
    };
  };
  
  // Level 3: Physical Resources
  level3: {
    showRawMaterials: boolean;
    recommendedAssetTypes: string[];
    typicalInvestmentRange: {
      min: number;
      max: number;
    };
  };
  
  // Level 4: Human Resources
  level4: {
    commonPositions: Array<{
      titleAr: string;
      titleEn: string;
      typicalSalary: number;
      nationalityPreference: 'omani' | 'expat' | 'either';
    }>;
    omanizationRequirement: number; // Different by sector
  };
  
  // Level 5: Market & Strategy
  level5: {
    swotSuggestions: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    typicalProfitMargin: {
      min: number;
      max: number;
    };
    marketFocus: 'B2B' | 'B2C' | 'Both';
  };
  
  // Level 6: Financing & KPIs
  level6: {
    benchmarkKPIs: {
      irr: { min: number; good: number; excellent: number };
      roi: { min: number; good: number; excellent: number };
      profitMargin: { min: number; good: number; excellent: number };
    };
    typicalDebtToEquity: number;
    revenueGrowthExpectation: {
      conservative: number;
      moderate: number;
      aggressive: number;
    };
  };
  
  // Level 7: BMC & Oman 2040
  level7: {
    bmcSuggestions: {
      keyPartners: string[];
      keyActivities: string[];
      keyResources: string[];
      valueProposition: string[];
      channels: string[];
    };
    indirectJobMultiplier: number; // For calculating indirect jobs
    oman2040Pillars: string[]; // Which pillars this sector supports
  };
}

// ========== SECTOR CONFIGURATIONS ==========

export const sectorConfigs: Record<ProjectType, SectorConfig> = {
  // 🌾 AGRICULTURAL SECTOR
  agricultural: {
    name: {
      ar: 'زراعي',
      en: 'Agricultural'
    },
    icon: '🌾',
    color: 'from-green-500 to-emerald-500',
    
    level2: {
      mandatoryLicenses: [
        {
          nameAr: 'ترخيص الزراعة',
          nameEn: 'Agricultural License',
          typicalCost: 200,
          authorityAr: 'وزارة الثروة الزراعية والسمكية وموارد المياه',
          authorityEn: 'Ministry of Agriculture, Fisheries and Water Resources'
        },
        {
          nameAr: 'شهادة صحية للمنتجات الزراعية',
          nameEn: 'Health Certificate for Agricultural Products',
          typicalCost: 150,
          authorityAr: 'وزارة الصحة',
          authorityEn: 'Ministry of Health'
        },
        {
          nameAr: 'ترخيص استخدام المياه',
          nameEn: 'Water Usage Permit',
          typicalCost: 100,
          authorityAr: 'وزارة الثروة الزراعية',
          authorityEn: 'Ministry of Agriculture'
        }
      ],
      omanizationRate: {
        minimum: 30,
        recommended: 50
      }
    },
    
    level3: {
      showRawMaterials: true,
      recommendedAssetTypes: ['أراضي زراعية', 'نظام ري', 'معدات زراعية', 'مخازن', 'مركبات نقل'],
      typicalInvestmentRange: {
        min: 15000,
        max: 50000
      }
    },
    
    level4: {
      commonPositions: [
        { titleAr: 'مدير المزرعة', titleEn: 'Farm Manager', typicalSalary: 800, nationalityPreference: 'omani' },
        { titleAr: 'مهندس زراعي', titleEn: 'Agricultural Engineer', typicalSalary: 700, nationalityPreference: 'omani' },
        { titleAr: 'عامل زراعي', titleEn: 'Farm Worker', typicalSalary: 350, nationalityPreference: 'either' },
        { titleAr: 'فني ري', titleEn: 'Irrigation Technician', typicalSalary: 450, nationalityPreference: 'either' }
      ],
      omanizationRequirement: 30
    },
    
    level5: {
      swotSuggestions: {
        strengths: [
          'أراضي خصبة ومناخ مناسب',
          'دعم حكومي للقطاع الزراعي',
          'إنتاج محلي يقلل التكاليف'
        ],
        weaknesses: [
          'اعتماد كبير على المياه',
          'تقلبات موسمية في الإنتاج',
          'منافسة من المستورد'
        ],
        opportunities: [
          'زيادة الطلب على المنتجات العضوية',
          'توسع السوق المحلي',
          'إمكانية التصدير لدول الخليج'
        ],
        threats: [
          'التغيرات المناخية',
          'ارتفاع تكلفة المياه',
          'المنتجات المستوردة الرخيصة'
        ]
      },
      typicalProfitMargin: {
        min: 20,
        max: 40
      },
      marketFocus: 'Both'
    },
    
    level6: {
      benchmarkKPIs: {
        irr: { min: 12, good: 18, excellent: 25 },
        roi: { min: 50, good: 80, excellent: 120 },
        profitMargin: { min: 20, good: 30, excellent: 40 }
      },
      typicalDebtToEquity: 0.8,
      revenueGrowthExpectation: {
        conservative: 5,
        moderate: 12,
        aggressive: 20
      }
    },
    
    level7: {
      bmcSuggestions: {
        keyPartners: ['موردو البذور والأسمدة', 'شركات النقل والتوزيع', 'محلات السوبرماركت'],
        keyActivities: ['الزراعة والحصاد', 'إدارة الري', 'التعبئة والتغليف', 'التسويق'],
        keyResources: ['الأراضي الزراعية', 'نظام الري', 'المعدات الزراعية', 'العمالة الماهرة'],
        valueProposition: ['منتجات طازجة ومحلية', 'جودة عالية', 'خالية من المواد الكيماوية الضارة'],
        channels: ['الأسواق المحلية', 'محلات السوبرماركت', 'المبيعات المباشرة', 'منصات إلكترونية']
      },
      indirectJobMultiplier: 2.0,
      oman2040Pillars: ['الأمن الغذائي', 'التنويع الاقتصادي', 'الاستدامة البيئية']
    }
  },

  // 🏭 INDUSTRIAL SECTOR
  industrial: {
    name: {
      ar: 'صناعي',
      en: 'Industrial'
    },
    icon: '🏭',
    color: 'from-blue-500 to-indigo-500',
    
    level2: {
      mandatoryLicenses: [
        {
          nameAr: 'الترخيص الصناعي',
          nameEn: 'Industrial License',
          typicalCost: 500,
          authorityAr: 'وزارة التجارة والصناعة',
          authorityEn: 'Ministry of Commerce and Industry'
        },
        {
          nameAr: 'الموافقة البيئية',
          nameEn: 'Environmental Approval',
          typicalCost: 800,
          authorityAr: 'هيئة البيئة',
          authorityEn: 'Environment Authority'
        },
        {
          nameAr: 'شهادة الدفاع المدني',
          nameEn: 'Civil Defense Certificate',
          typicalCost: 300,
          authorityAr: 'شرطة عمان السلطانية - الدفاع المدني',
          authorityEn: 'Royal Oman Police - Civil Defense'
        },
        {
          nameAr: 'ترخيص السلامة المهنية',
          nameEn: 'Occupational Safety License',
          typicalCost: 250,
          authorityAr: 'وزارة العمل',
          authorityEn: 'Ministry of Labour'
        }
      ],
      omanizationRate: {
        minimum: 35,
        recommended: 50
      }
    },
    
    level3: {
      showRawMaterials: true,
      recommendedAssetTypes: ['آلات إنتاج', 'معدات صناعية', 'مولدات كهربائية', 'أنظمة أمان', 'مخازن'],
      typicalInvestmentRange: {
        min: 50000,
        max: 200000
      }
    },
    
    level4: {
      commonPositions: [
        { titleAr: 'مدير الإنتاج', titleEn: 'Production Manager', typicalSalary: 1200, nationalityPreference: 'omani' },
        { titleAr: 'مهندس صناعي', titleEn: 'Industrial Engineer', typicalSalary: 900, nationalityPreference: 'omani' },
        { titleAr: 'فني صيانة', titleEn: 'Maintenance Technician', typicalSalary: 600, nationalityPreference: 'either' },
        { titleAr: 'عامل إنتاج', titleEn: 'Production Worker', typicalSalary: 400, nationalityPreference: 'either' },
        { titleAr: 'مراقب جودة', titleEn: 'Quality Controller', typicalSalary: 700, nationalityPreference: 'omani' }
      ],
      omanizationRequirement: 35
    },
    
    level5: {
      swotSuggestions: {
        strengths: [
          'معدات حديثة وكفاءة إنتاجية عالية',
          'موقع استراتيجي قرب الموانئ',
          'معايير جودة عالمية'
        ],
        weaknesses: [
          'تكاليف تشغيل مرتفعة',
          'حاجة لعمالة متخصصة',
          'صيانة دورية مكلفة'
        ],
        opportunities: [
          'نمو الطلب المحلي على المنتجات الصناعية',
          'إمكانية التصدير للمنطقة',
          'دعم حكومي للصناعات الوطنية'
        ],
        threats: [
          'المنافسة من المصانع الكبرى',
          'تقلبات أسعار المواد الخام',
          'المنتجات المستوردة الرخيصة'
        ]
      },
      typicalProfitMargin: {
        min: 15,
        max: 35
      },
      marketFocus: 'B2B'
    },
    
    level6: {
      benchmarkKPIs: {
        irr: { min: 15, good: 22, excellent: 30 },
        roi: { min: 60, good: 100, excellent: 150 },
        profitMargin: { min: 15, good: 25, excellent: 35 }
      },
      typicalDebtToEquity: 1.2,
      revenueGrowthExpectation: {
        conservative: 8,
        moderate: 15,
        aggressive: 25
      }
    },
    
    level7: {
      bmcSuggestions: {
        keyPartners: ['موردو المواد الخام', 'شركات الشحن', 'الموزعون الصناعيون', 'البنوك'],
        keyActivities: ['التصنيع', 'مراقبة الجودة', 'الصيانة', 'إدارة المخزون'],
        keyResources: ['المعدات الصناعية', 'المصنع', 'العمالة الفنية', 'التراخيص'],
        valueProposition: ['منتجات صناعية عالية الجودة', 'أسعار تنافسية', 'توريد منتظم'],
        channels: ['الموزعون الصناعيون', 'المبيعات المباشرة للشركات', 'المعارض الصناعية']
      },
      indirectJobMultiplier: 2.5,
      oman2040Pillars: ['التصنيع والتنويع الصناعي', 'نمو القطاع الخاص', 'التصدير']
    }
  },

  // 🛒 COMMERCIAL SECTOR
  commercial: {
    name: {
      ar: 'تجاري',
      en: 'Commercial'
    },
    icon: '🛒',
    color: 'from-purple-500 to-pink-500',
    
    level2: {
      mandatoryLicenses: [
        {
          nameAr: 'السجل التجاري',
          nameEn: 'Commercial Registration',
          typicalCost: 150,
          authorityAr: 'وزارة التجارة والصناعة',
          authorityEn: 'Ministry of Commerce and Industry'
        },
        {
          nameAr: 'رخصة البلدية',
          nameEn: 'Municipality License',
          typicalCost: 200,
          authorityAr: 'بلدية مسقط',
          authorityEn: 'Muscat Municipality'
        },
        {
          nameAr: 'شهادة الدفاع المدني',
          nameEn: 'Civil Defense Certificate',
          typicalCost: 150,
          authorityAr: 'شرطة عمان السلطانية',
          authorityEn: 'Royal Oman Police'
        }
      ],
      omanizationRate: {
        minimum: 35,
        recommended: 45
      }
    },
    
    level3: {
      showRawMaterials: false,
      recommendedAssetTypes: ['أثاث المحل', 'أرفف العرض', 'نظام نقاط البيع', 'كاميرات مراقبة', 'مكيفات'],
      typicalInvestmentRange: {
        min: 10000,
        max: 50000
      }
    },
    
    level4: {
      commonPositions: [
        { titleAr: 'مدير المحل', titleEn: 'Store Manager', typicalSalary: 900, nationalityPreference: 'omani' },
        { titleAr: 'موظف مبيعات', titleEn: 'Sales Associate', typicalSalary: 450, nationalityPreference: 'omani' },
        { titleAr: 'أمين صندوق', titleEn: 'Cashier', typicalSalary: 400, nationalityPreference: 'omani' },
        { titleAr: 'موظف مخزن', titleEn: 'Stock Clerk', typicalSalary: 350, nationalityPreference: 'either' }
      ],
      omanizationRequirement: 35
    },
    
    level5: {
      swotSuggestions: {
        strengths: [
          'موقع تجاري مميز',
          'علاقات قوية مع الموردين',
          'تنوع المنتجات'
        ],
        weaknesses: [
          'منافسة شديدة من المحلات الكبرى',
          'هامش ربح محدود',
          'اعتماد على الموقع'
        ],
        opportunities: [
          'نمو القوة الشرائية',
          'التوسع في التجارة الإلكترونية',
          'خدمات التوصيل'
        ],
        threats: [
          'المتاجر الإلكترونية',
          'المولات التجارية الكبرى',
          'تقلبات الأسعار'
        ]
      },
      typicalProfitMargin: {
        min: 25,
        max: 50
      },
      marketFocus: 'B2C'
    },
    
    level6: {
      benchmarkKPIs: {
        irr: { min: 18, good: 25, excellent: 35 },
        roi: { min: 70, good: 110, excellent: 160 },
        profitMargin: { min: 25, good: 35, excellent: 50 }
      },
      typicalDebtToEquity: 0.6,
      revenueGrowthExpectation: {
        conservative: 10,
        moderate: 18,
        aggressive: 30
      }
    },
    
    level7: {
      bmcSuggestions: {
        keyPartners: ['الموردون', 'شركات التوصيل', 'البنوك (نقاط البيع)'],
        keyActivities: ['البيع بالتجزئة', 'إدارة المخزون', 'خدمة العملاء', 'التسويق'],
        keyResources: ['الموقع التجاري', 'المخزون', 'الموظفون', 'نظام نقاط البيع'],
        valueProposition: ['منتجات متنوعة', 'أسعار تنافسية', 'خدمة عملاء ممتازة', 'توصيل سريع'],
        channels: ['المحل الفعلي', 'منصة إلكترونية', 'وسائل التواصل الاجتماعي', 'التطبيق']
      },
      indirectJobMultiplier: 1.5,
      oman2040Pillars: ['دعم المؤسسات الصغيرة والمتوسطة', 'النشاط التجاري', 'التوظيف']
    }
  },

  // 💼 SERVICE SECTOR
  service: {
    name: {
      ar: 'خدمي',
      en: 'Service'
    },
    icon: '💼',
    color: 'from-teal-500 to-cyan-500',
    
    level2: {
      mandatoryLicenses: [
        {
          nameAr: 'ترخيص مزاولة المهنة',
          nameEn: 'Professional Practice License',
          typicalCost: 200,
          authorityAr: 'وزارة التجارة والصناعة',
          authorityEn: 'Ministry of Commerce and Industry'
        },
        {
          nameAr: 'رخصة البلدية',
          nameEn: 'Municipality License',
          typicalCost: 150,
          authorityAr: 'بلدية مسقط',
          authorityEn: 'Muscat Municipality'
        },
        {
          nameAr: 'شهادة الدفاع المدني',
          nameEn: 'Civil Defense Certificate',
          typicalCost: 120,
          authorityAr: 'شرطة عمان السلطانية',
          authorityEn: 'Royal Oman Police'
        }
      ],
      omanizationRate: {
        minimum: 40,
        recommended: 60
      }
    },
    
    level3: {
      showRawMaterials: false,
      recommendedAssetTypes: ['أثاث مكتبي', 'أجهزة كمبيوتر', 'برامج متخصصة', 'أنظمة اتصالات', 'مركبات'],
      typicalInvestmentRange: {
        min: 5000,
        max: 30000
      }
    },
    
    level4: {
      commonPositions: [
        { titleAr: 'مدير العمليات', titleEn: 'Operations Manager', typicalSalary: 1000, nationalityPreference: 'omani' },
        { titleAr: 'أخصائي خدمات', titleEn: 'Service Specialist', typicalSalary: 700, nationalityPreference: 'omani' },
        { titleAr: 'موظف استقبال', titleEn: 'Receptionist', typicalSalary: 450, nationalityPreference: 'omani' },
        { titleAr: 'فني دعم', titleEn: 'Support Technician', typicalSalary: 550, nationalityPreference: 'either' }
      ],
      omanizationRequirement: 40
    },
    
    level5: {
      swotSuggestions: {
        strengths: [
          'خبرة متخصصة في المجال',
          'تكاليف تشغيل منخفضة',
          'مرونة في تقديم الخدمة'
        ],
        weaknesses: [
          'اعتماد كبير على الموظفين الرئيسيين',
          'صعوبة التوسع السريع',
          'منافسة من المكاتب الكبرى'
        ],
        opportunities: [
          'زيادة الطلب على الخدمات المتخصصة',
          'التحول الرقمي',
          'خدمات عن بُعد'
        ],
        threats: [
          'التقنيات الجديدة قد تغير السوق',
          'المنافسة من الشركات العالمية',
          'التغيرات التنظيمية'
        ]
      },
      typicalProfitMargin: {
        min: 30,
        max: 60
      },
      marketFocus: 'Both'
    },
    
    level6: {
      benchmarkKPIs: {
        irr: { min: 20, good: 30, excellent: 45 },
        roi: { min: 80, good: 130, excellent: 200 },
        profitMargin: { min: 30, good: 45, excellent: 60 }
      },
      typicalDebtToEquity: 0.4,
      revenueGrowthExpectation: {
        conservative: 12,
        moderate: 20,
        aggressive: 35
      }
    },
    
    level7: {
      bmcSuggestions: {
        keyPartners: ['موردو التقنية', 'شركات استشارية', 'جهات حكومية'],
        keyActivities: ['تقديم الخدمات', 'الاستشارات', 'التدريب', 'الدعم الفني'],
        keyResources: ['الخبرة البشرية', 'البرامج المتخصصة', 'الشهادات المهنية', 'قاعدة العملاء'],
        valueProposition: ['خدمات متخصصة عالية الجودة', 'حلول مخصصة', 'دعم مستمر', 'أسعار تنافسية'],
        channels: ['الموقع الإلكتروني', 'المبيعات المباشرة', 'الشراكات', 'التسويق الرقمي']
      },
      indirectJobMultiplier: 1.2,
      oman2040Pillars: ['التحول الرقمي', 'اقتصاد المعرفة', 'الخدمات المتخصصة']
    }
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get sector configuration based on project type
 */
export function getSectorConfig(projectType: ProjectType | null): SectorConfig | null {
  if (!projectType) return null;
  return sectorConfigs[projectType];
}

/**
 * Get recommended Omanization rate for a sector
 */
export function getOmanizationRequirement(projectType: ProjectType | null): number {
  const config = getSectorConfig(projectType);
  return config?.level2.omanizationRate.minimum || 35;
}

/**
 * Get mandatory licenses for a sector
 */
export function getMandatoryLicenses(projectType: ProjectType | null, language: 'ar' | 'en') {
  const config = getSectorConfig(projectType);
  if (!config) return [];
  
  return config.level2.mandatoryLicenses.map(license => ({
    name: language === 'ar' ? license.nameAr : license.nameEn,
    authority: language === 'ar' ? license.authorityAr : license.authorityEn,
    cost: license.typicalCost
  }));
}

/**
 * Check if raw materials section should be shown
 */
export function shouldShowRawMaterials(projectType: ProjectType | null): boolean {
  const config = getSectorConfig(projectType);
  return config?.level3.showRawMaterials || false;
}

/**
 * Get SWOT suggestions for a sector
 */
export function getSWOTSuggestions(projectType: ProjectType | null) {
  const config = getSectorConfig(projectType);
  return config?.level5.swotSuggestions || null;
}

/**
 * Get typical profit margin range for a sector
 */
export function getTypicalProfitMargin(projectType: ProjectType | null) {
  const config = getSectorConfig(projectType);
  return config?.level5.typicalProfitMargin || { min: 20, max: 40 };
}

/**
 * Get benchmark KPIs for a sector
 */
export function getBenchmarkKPIs(projectType: ProjectType | null) {
  const config = getSectorConfig(projectType);
  return config?.level6.benchmarkKPIs || null;
}

/**
 * Get BMC suggestions for a sector
 */
export function getBMCSuggestions(projectType: ProjectType | null, language: 'ar' | 'en') {
  const config = getSectorConfig(projectType);
  return config?.level7.bmcSuggestions || null;
}

/**
 * Get indirect job multiplier for a sector
 */
export function getIndirectJobMultiplier(projectType: ProjectType | null): number {
  const config = getSectorConfig(projectType);
  return config?.level7.indirectJobMultiplier || 1.5;
}

/**
 * Validate Omanization compliance for a sector
 */
export function validateOmanizationCompliance(
  projectType: ProjectType | null,
  omanizationRate: number
): {
  isCompliant: boolean;
  minimum: number;
  gap?: number;
} {
  const minimum = getOmanizationRequirement(projectType);
  const isCompliant = omanizationRate >= minimum;
  
  return {
    isCompliant,
    minimum,
    gap: isCompliant ? undefined : minimum - omanizationRate
  };
}

/**
 * Get sector name
 */
export function getSectorName(projectType: ProjectType | null, language: 'ar' | 'en'): string {
  const config = getSectorConfig(projectType);
  if (!config) return '';
  return language === 'ar' ? config.name.ar : config.name.en;
}

/**
 * Get common positions for a sector
 */
export function getCommonPositions(projectType: ProjectType | null, language: 'ar' | 'en') {
  const config = getSectorConfig(projectType);
  if (!config) return [];
  
  return config.level4.commonPositions.map(pos => ({
    title: language === 'ar' ? pos.titleAr : pos.titleEn,
    salary: pos.typicalSalary,
    nationality: pos.nationalityPreference
  }));
}
