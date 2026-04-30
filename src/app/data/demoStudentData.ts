/**
 * Demo Student Sample Data
 * 
 * Pre-populated projects for demo.student@yieldx.com account only.
 * Simulates 2 weeks of active platform usage with realistic data.
 */

export const DEMO_STUDENT_PROJECTS = [
  // PROJECT 1: COMPLETED - "Organic Honey Farm" (Agricultural)
  {
    id: 'demo-project-1',
    name: 'Organic Honey Farm',
    type: 'agricultural',
    status: 'completed',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    completionPercentage: 100,
    
    // Level 0: Project Type
    level0: {
      projectType: 'agricultural',
      projectName: 'Organic Honey Farm',
      sector: 'Agricultural Production',
      description: 'Natural honey production using sustainable beekeeping practices in Oman',
    },
    
    // Level 1: Identity & Ownership
    level1: {
      businessName: 'Omani Pure Honey',
      projectIdea: 'Establish an organic honey production farm specializing in Sidr honey and other native varieties',
      productDescription: 'Premium organic honey products including raw honey, honeycomb, bee pollen, and royal jelly',
      projectStatus: 'new',
      location: 'Al Batinah North, Oman',
      owners: [
        {
          id: '1',
          name: 'Ahmed Al-Balushi',
          nationality: 'omani',
          age: '32',
          sharePercentage: '60',
          experience: 'intermediate',
        },
        {
          id: '2',
          name: 'Fatima Al-Hinai',
          nationality: 'omani',
          age: '28',
          sharePercentage: '40',
          experience: 'beginner',
        },
      ],
    },
    
    // Level 2: Technical Specifications
    level2: {
      landSize: '5',
      cropType: 'Beekeeping (Sidr Trees)',
      irrigationMethod: 'Natural (Rainfall)',
      seasonalCycles: '2 harvest seasons per year',
      productionCapacity: '2,000 kg per year',
      equipmentList: [
        { id: '1', name: 'Beehive Boxes (50 units)', cost: '5000', quantity: '50' },
        { id: '2', name: 'Honey Extraction Equipment', cost: '8000', quantity: '1' },
        { id: '3', name: 'Protective Gear & Tools', cost: '2000', quantity: '5' },
        { id: '4', name: 'Storage Tanks (Food Grade)', cost: '3000', quantity: '4' },
      ],
      qualityCertifications: 'Organic Certification, Oman Food Safety Standards',
    },
    
    // Level 3: Human Resources
    level3: {
      employees: [
        {
          id: '1',
          role: 'Master Beekeeper',
          count: '1',
          salary: '800',
          nationality: 'omani',
          qualifications: 'Certified Beekeeper with 10 years experience',
        },
        {
          id: '2',
          role: 'Farm Workers',
          count: '3',
          salary: '400',
          nationality: 'expat',
          qualifications: 'Basic agricultural training',
        },
        {
          id: '3',
          role: 'Sales & Marketing',
          count: '1',
          salary: '600',
          nationality: 'omani',
          qualifications: 'Business degree, marketing experience',
        },
      ],
      totalMonthlyWages: 3000,
      trainingPrograms: 'Beekeeping certification, Food safety training',
    },
    
    // Level 4: Assets & Equipment
    level4: {
      fixedAssets: [
        { id: '1', name: 'Land (5 hectares)', value: '50000', depreciation: '0' },
        { id: '2', name: 'Farm Building', value: '15000', depreciation: '5' },
        { id: '3', name: 'Beehives & Equipment', value: '18000', depreciation: '10' },
        { id: '4', name: 'Extraction & Storage Equipment', value: '11000', depreciation: '15' },
      ],
      totalAssets: 94000,
    },
    
    // Level 5: Market & Strategy
    level5: {
      swot: {
        strengths: [
          'High demand for organic Omani honey',
          'Premium product positioning',
          'Government support for agricultural projects',
          'Direct farm-to-consumer sales model',
        ],
        weaknesses: [
          'Seasonal income fluctuations',
          'Weather dependency',
          'Limited initial production capacity',
          'High startup costs',
        ],
        opportunities: [
          'Export to GCC countries',
          'Online sales platform',
          'Tourism and farm visits',
          'Organic certification premium pricing',
        ],
        threats: [
          'Competition from imported honey',
          'Climate change affecting bee populations',
          'Disease outbreaks in hives',
          'Market price volatility',
        ],
      },
      targetMarket: 'Health-conscious consumers, premium retailers, export markets',
      marketingStrategy: 'Organic branding, farmers markets, social media, direct sales',
      competitiveAdvantage: 'Certified organic, local Omani production, premium Sidr honey variety',
      pricingStrategy: 'Premium pricing (20-30% above market average)',
      profitMarginTarget: '35',
    },
    
    // Level 6: Financial Analysis
    level6: {
      initialInvestment: 94000,
      monthlyRevenue: 8500,
      monthlyCosts: 5500,
      monthlyProfit: 3000,
      breakEvenMonths: 26,
      roi: 38,
      financialKPIs: {
        grossProfitMargin: 35,
        netProfitMargin: 28,
        currentRatio: 1.8,
        debtToEquity: 0.4,
        returnOnAssets: 18,
      },
    },
    
    // Level 7: Business Model Canvas
    level7: {
      bmc: {
        keyPartners: [
          'Local beekeepers association',
          'Organic certification bodies',
          'Agricultural equipment suppliers',
        ],
        keyActivities: [
          'Beekeeping and hive management',
          'Honey harvesting and processing',
          'Quality control and packaging',
          'Marketing and sales',
        ],
        keyResources: [
          'Beehives and equipment',
          'Skilled beekeeper',
          'Land and facilities',
          'Organic certification',
        ],
        valuePropositions: [
          '100% organic certified honey',
          'Premium Omani Sidr variety',
          'Direct from farm freshness',
          'Sustainable production methods',
        ],
        customerRelationships: [
          'Direct personal service',
          'Farm visits and education',
          'Social media engagement',
          'Customer loyalty program',
        ],
        channels: [
          'Farmers markets',
          'Online store',
          'Premium retail partners',
          'Direct farm sales',
        ],
        customerSegments: [
          'Health-conscious families',
          'Premium food retailers',
          'Export distributors',
          'Organic product enthusiasts',
        ],
        costStructure: [
          'Employee salaries (OMR 3,000/month)',
          'Hive maintenance (OMR 800/month)',
          'Packaging and marketing (OMR 1,200/month)',
          'Utilities and operations (OMR 500/month)',
        ],
        revenueStreams: [
          'Raw honey sales (60% of revenue)',
          'Specialty products (25% of revenue)',
          'Farm tours and experiences (10% of revenue)',
          'Wholesale to retailers (5% of revenue)',
        ],
      },
      implementationPlan: 'Phase 1: Setup and certification (3 months), Phase 2: Initial production (6 months), Phase 3: Market expansion (12 months)',
      milestones: [
        'Obtain organic certification - Month 3',
        'First harvest - Month 6',
        'Break even point - Month 26',
        'Export market entry - Year 2',
      ],
    },
  },
  
  // PROJECT 2: IN PROGRESS - "TechCraft Workshop" (Industrial)
  {
    id: 'demo-project-2',
    name: 'TechCraft Workshop',
    type: 'industrial',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    completionPercentage: 50, // Only completed up to Level 4
    
    // Level 0: Project Type
    level0: {
      projectType: 'industrial',
      projectName: 'TechCraft Workshop',
      sector: 'Manufacturing & Production',
      description: 'Custom metal fabrication and CNC machining workshop for automotive and construction industries',
    },
    
    // Level 1: Identity & Ownership
    level1: {
      businessName: 'TechCraft Engineering Solutions',
      projectIdea: 'Establish a modern metal fabrication workshop with CNC capabilities to serve local industries',
      productDescription: 'Custom metal parts, precision machining, welding services, and industrial prototyping',
      projectStatus: 'new',
      location: 'Rusayl Industrial Estate, Muscat',
      owners: [
        {
          id: '1',
          name: 'Khalid Al-Rashdi',
          nationality: 'omani',
          age: '35',
          sharePercentage: '70',
          experience: 'expert',
        },
        {
          id: '2',
          name: 'Mohammed Al-Siyabi',
          nationality: 'omani',
          age: '30',
          sharePercentage: '30',
          experience: 'intermediate',
        },
      ],
    },
    
    // Level 2: Technical Specifications
    level2: {
      facilitySize: '800 square meters',
      productionCapacity: '500 units per month (mixed products)',
      machineryList: [
        { id: '1', name: 'CNC Milling Machine', cost: '45000', quantity: '2' },
        { id: '2', name: 'CNC Lathe', cost: '35000', quantity: '2' },
        { id: '3', name: 'Welding Equipment (TIG/MIG)', cost: '8000', quantity: '3' },
        { id: '4', name: 'Laser Cutting Machine', cost: '60000', quantity: '1' },
        { id: '5', name: 'Press Brake', cost: '25000', quantity: '1' },
      ],
      qualityCertifications: 'ISO 9001:2015, CE Marking for products',
      rawMaterials: 'Steel, Aluminum, Stainless Steel, Brass',
      safetyStandards: 'OSHA compliance, Fire safety systems, PPE requirements',
    },
    
    // Level 3: Human Resources
    level3: {
      employees: [
        {
          id: '1',
          role: 'Production Manager',
          count: '1',
          salary: '1200',
          nationality: 'omani',
          qualifications: 'Mechanical Engineering degree, 8 years experience',
        },
        {
          id: '2',
          role: 'CNC Operators',
          count: '4',
          salary: '800',
          nationality: 'omani',
          qualifications: 'Technical diploma, CNC certification',
        },
        {
          id: '3',
          role: 'Welders',
          count: '3',
          salary: '700',
          nationality: 'expat',
          qualifications: 'Certified welders (TIG/MIG)',
        },
        {
          id: '4',
          role: 'Quality Controller',
          count: '1',
          salary: '900',
          nationality: 'omani',
          qualifications: 'Quality management certification',
        },
      ],
      totalMonthlyWages: 8100,
      trainingPrograms: 'CNC programming, Advanced welding, Quality control systems',
    },
    
    // Level 4: Assets & Equipment
    level4: {
      fixedAssets: [
        { id: '1', name: 'Workshop Building (Lease)', value: '0', depreciation: '0' },
        { id: '2', name: 'CNC Machines', value: '160000', depreciation: '15' },
        { id: '3', name: 'Welding Equipment', value: '24000', depreciation: '20' },
        { id: '4', name: 'Hand Tools & Accessories', value: '5000', depreciation: '25' },
        { id: '5', name: 'Office Equipment', value: '3000', depreciation: '20' },
      ],
      totalAssets: 192000,
    },
    
    // Level 5: Not completed yet (in progress)
    level5: null,
    
    // Level 6: Not completed yet
    level6: null,
    
    // Level 7: Not completed yet
    level7: null,
  },
];

/**
 * Demo Student Progress Data
 * Shows realistic 2-week usage pattern
 */
export const DEMO_STUDENT_PROGRESS = {
  currentLevel: 5, // Currently working on Level 5
  totalXP: 1850,
  badges: [
    {
      id: 'first-project',
      name: 'First Steps',
      description: 'Completed your first project',
      icon: '🎯',
      earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'level-master',
      name: 'Level Master',
      description: 'Completed all 8 levels',
      icon: '🏆',
      earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'quick-learner',
      name: 'Quick Learner',
      description: 'Completed 4 levels in one day',
      icon: '⚡',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  achievements: [
    'Completed first business plan',
    'Earned 1,000+ XP',
    'Started second project',
  ],
  streak: {
    currentStreak: 7,
    longestStreak: 10,
    lastActiveDate: new Date().toISOString(),
  },
  levels: [
    { levelId: 0, xp: 250, maxXp: 250, completed: true, unlocked: true },
    { levelId: 1, xp: 250, maxXp: 250, completed: true, unlocked: true },
    { levelId: 2, xp: 250, maxXp: 250, completed: true, unlocked: true },
    { levelId: 3, xp: 250, maxXp: 250, completed: true, unlocked: true },
    { levelId: 4, xp: 250, maxXp: 250, completed: true, unlocked: true },
    { levelId: 5, xp: 150, maxXp: 250, completed: false, unlocked: true }, // Currently working on this
    { levelId: 6, xp: 0, maxXp: 300, completed: false, unlocked: true },
    { levelId: 7, xp: 0, maxXp: 400, completed: false, unlocked: true },
  ],
};

/**
 * Check if current user is demo student
 */
export const isDemoStudent = (email: string | undefined): boolean => {
  return email?.toLowerCase() === 'demo.student@yieldx.com';
};

/**
 * Get demo student data
 * Returns sample projects and progress ONLY for demo student account
 */
export const getDemoStudentData = (email: string | undefined) => {
  if (!isDemoStudent(email)) {
    return null;
  }
  
  return {
    projects: DEMO_STUDENT_PROJECTS,
    progress: DEMO_STUDENT_PROGRESS,
  };
};
