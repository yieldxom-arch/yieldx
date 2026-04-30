/**
 * Demo Project Code System
 * 
 * Predefined demo code "DEMO2024" that works without needing a teacher account.
 * For presentation purposes only - creates instant sample project.
 */

export const DEMO_PROJECT_CODE = 'DEMO2024';

/**
 * Demo Project Template
 * Pre-filled project that opens when demo code is entered
 */
export const DEMO_PROJECT_TEMPLATE = {
  id: 'demo-template-2024',
  name: 'Smart Cafe Startup',
  description: 'Modern coffee shop with technology integration and sustainable practices',
  mode: 'individual' as const,
  isTemplate: true,
  classCode: DEMO_PROJECT_CODE,
  status: 'active' as const,
  
  // Pre-filled template data for instant project creation
  templateData: {
    // Level 0: Project Type
    level0: {
      projectType: 'commercial',
      projectName: 'Smart Cafe Startup',
      sector: 'Food & Beverage - Commercial',
      description: 'A modern coffee shop combining specialty coffee, healthy food options, and smart ordering technology',
    },
    
    // Level 1: Identity & Ownership
    level1: {
      businessName: 'Brew & Bytes Cafe',
      projectIdea: 'Create a tech-savvy cafe offering premium coffee, healthy meals, and seamless digital ordering experience',
      productDescription: 'Specialty coffee drinks, fresh pastries, healthy breakfast and lunch options, smoothies, and artisanal teas with mobile app ordering and loyalty rewards',
      projectStatus: 'new',
      location: 'MQ - Muscat, Al Khuwair',
      owners: [
        {
          id: '1',
          name: 'Sara Al-Habsi',
          nationality: 'omani',
          age: '27',
          sharePercentage: '55',
          experience: 'intermediate',
        },
        {
          id: '2',
          name: 'Hassan Al-Amri',
          nationality: 'omani',
          age: '29',
          sharePercentage: '45',
          experience: 'intermediate',
        },
      ],
    },
    
    // Level 2: Technical Specifications (Commercial)
    level2: {
      facilitySize: '120 square meters',
      seatingCapacity: '35 customers',
      equipmentList: [
        { id: '1', name: 'Professional Espresso Machine', cost: '12000', quantity: '1' },
        { id: '2', name: 'Coffee Grinders (Commercial)', cost: '3000', quantity: '2' },
        { id: '3', name: 'Refrigerators & Display Cases', cost: '5000', quantity: '3' },
        { id: '4', name: 'POS System & Tablets', cost: '2500', quantity: '1' },
        { id: '5', name: 'Furniture (Tables, Chairs)', cost: '8000', quantity: '35' },
        { id: '6', name: 'Kitchen Equipment', cost: '4500', quantity: '1' },
      ],
      technology: 'Mobile ordering app, Digital menu boards, Self-service kiosks, Loyalty program system',
      interiorDesign: 'Modern minimalist with wooden accents, natural lighting, cozy seating areas, and WiFi workspace zones',
    },
    
    // Level 3: Human Resources
    level3: {
      employees: [
        {
          id: '1',
          role: 'Cafe Manager',
          count: '1',
          salary: '900',
          nationality: 'omani',
          qualifications: 'Hospitality management degree, 3 years experience',
        },
        {
          id: '2',
          role: 'Head Barista',
          count: '1',
          salary: '700',
          nationality: 'omani',
          qualifications: 'SCA certified barista, 5 years experience',
        },
        {
          id: '3',
          role: 'Baristas',
          count: '2',
          salary: '500',
          nationality: 'omani',
          qualifications: 'Barista training, customer service skills',
        },
        {
          id: '4',
          role: 'Kitchen Staff',
          count: '2',
          salary: '450',
          nationality: 'expat',
          qualifications: 'Food preparation experience',
        },
        {
          id: '5',
          role: 'Cashier/Server',
          count: '2',
          salary: '400',
          nationality: 'omani',
          qualifications: 'Customer service experience',
        },
      ],
      totalMonthlyWages: 5300,
      trainingPrograms: 'Barista certification, Food safety & hygiene, Customer service excellence, POS system training',
    },
    
    // Level 4: Assets & Equipment
    level4: {
      fixedAssets: [
        { id: '1', name: 'Leasehold Improvements', value: '25000', depreciation: '10' },
        { id: '2', name: 'Coffee & Kitchen Equipment', value: '27000', depreciation: '20' },
        { id: '3', name: 'Furniture & Fixtures', value: '8000', depreciation: '15' },
        { id: '4', name: 'POS & Technology Systems', value: '2500', depreciation: '25' },
        { id: '5', name: 'Initial Inventory & Supplies', value: '3500', depreciation: '100' },
      ],
      totalAssets: 66000,
    },
    
    // Partial data to show "in progress" state
    // Levels 5-7 intentionally left empty for demo presentation
  },
};

/**
 * Check if entered code is the demo code
 */
export const isDemoCode = (code: string): boolean => {
  return code.toUpperCase().trim() === DEMO_PROJECT_CODE;
};

/**
 * Get demo project template
 * Returns template with user-specific data
 */
export const getDemoProjectTemplate = (userId: string, userName: string) => {
  return {
    ...DEMO_PROJECT_TEMPLATE,
    createdBy: 'demo-teacher',
    createdByName: 'YieldX Demo Instructor',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Created 7 days ago
    qrCode: `https://yieldx.com?code=${DEMO_PROJECT_CODE}`,
  };
};

/**
 * Create forked demo project for student
 * Returns a personalized copy for the student to work on
 */
export const createDemoFork = (userId: string, userName: string) => {
  const template = getDemoProjectTemplate(userId, userName);
  
  return {
    id: `demo-fork-${userId}-${Date.now()}`,
    name: template.name,
    description: template.description,
    mode: 'team' as const, // Changed to team mode to show members
    createdBy: userId,
    createdByName: userName,
    classCode: '',
    qrCode: '',
    templateData: template.templateData,
    teams: [
      {
        id: 'team-1',
        name: 'Project Team',
        members: [
          {
            id: userId,
            name: userName,
            email: '',
            role: 'Team Leader',
            avatar: '',
          },
          {
            id: 'member-2',
            name: 'Sara Al-Habsi',
            email: 'sara.alhabsi@student.edu.om',
            role: 'Business Analyst',
            avatar: '',
          },
          {
            id: 'member-3',
            name: 'Hassan Al-Amri',
            email: 'hassan.alamri@student.edu.om',
            role: 'Financial Planner',
            avatar: '',
          },
        ],
      },
    ],
    forkedFrom: template.id,
    isTemplate: false,
    createdAt: new Date().toISOString(),
    status: 'active' as const,
  };
};

/**
 * Get demo project details for presentation
 */
export const getDemoProjectInfo = () => {
  return {
    code: DEMO_PROJECT_CODE,
    projectName: DEMO_PROJECT_TEMPLATE.name,
    description: DEMO_PROJECT_TEMPLATE.description,
    sector: DEMO_PROJECT_TEMPLATE.templateData.level0.projectType,
    businessName: DEMO_PROJECT_TEMPLATE.templateData.level1.businessName,
    levelsCompleted: 4, // Levels 0-4 pre-filled
    levelsTotal: 8,
    estimatedCompletion: '50%',
    features: [
      'Pre-filled business identity',
      'Owner information included',
      'Equipment list ready',
      'Financial structure started',
      'Ready to continue from Level 5',
    ],
  };
};