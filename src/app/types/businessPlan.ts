// Business Plan Data Types

export interface ProjectInfo {
  projectName: string;
  legalName: string;
  establishmentDate?: string;
  commercialRegistration?: string;
  taxNumber?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  projectType: string;
  industry: string;
  legalForm: 'فردي' | 'شراكة' | 'شركة محدودة' | 'شركة مساهمة' | 'أخرى';
  description: string;
  vision: string;
  mission: string;
}

export interface Shareholder {
  id: string;
  name: string;
  nationality: string;
  idNumber: string;
  shares: number;
  sharePercentage: number;
  capitalContribution: number;
  role: string;
  phone?: string;
  email?: string;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Competitor {
  id: string;
  name: string;
  location: string;
  products: string;
  prices: string;
  strengths: string;
  weaknesses: string;
  marketShare?: string;
}

export interface MarketTrend {
  id: string;
  factor: string;
  impact: 'إيجابي' | 'سلبي' | 'محايد';
  description: string;
  opportunities: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  unitPrice: number;
  targetQuantityYear1: number;
  targetQuantityYear2: number;
  targetQuantityYear3: number;
}

export interface MarketingMix {
  product: {
    description: string;
    features: string[];
    quality: string;
    packaging: string;
  };
  price: {
    strategy: string;
    basePrice: number;
    discounts: string;
    paymentTerms: string;
  };
  place: {
    distributionChannels: string[];
    location: string;
    coverage: string;
  };
  promotion: {
    advertisingChannels: string[];
    budget: number;
    strategies: string[];
  };
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  monthlyQuantity: number;
  monthlyTotal: number;
  annualTotal: number;
  supplier?: string;
}

export interface Employee {
  id: string;
  position: string;
  count: number;
  monthlySalary: number;
  monthlyTotal: number;
  annualTotal: number;
  benefits?: number;
}

export interface RentDetail {
  id: string;
  type: 'مبنى' | 'معدات' | 'آلات';
  description: string;
  monthlyRent: number;
  annualRent: number;
  contractPeriod?: string;
}

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  category: 'أثاث' | 'معدات' | 'مركبات' | 'أجهزة';
  supplier?: string;
}

export interface OperatingExpense {
  id: string;
  category: string;
  description: string;
  monthlyAmount: number;
  annualAmount: number;
}

export interface PreOperatingExpense {
  id: string;
  item: string;
  amount: number;
  notes?: string;
}

export interface WorkingCapital {
  buildingRent3Months: number;
  equipmentRent3Months: number;
  salaries3Months: number;
  rawMaterials3Months: number;
  adminExpenses3Months: number;
  utilities3Months: number;
  marketing3Months: number;
  maintenance3Months: number;
  insurance3Months: number;
  workerInsurance3Months: number;
}

export interface RevenueProjection {
  productId: string;
  productName: string;
  year1: { quantity: number; price: number; revenue: number };
  year2: { quantity: number; price: number; revenue: number };
  year3: { quantity: number; price: number; revenue: number };
}

export interface CashFlowProjection {
  year: number;
  operatingActivities: {
    netIncome: number;
    depreciation: number;
    interest: number;
    workingCapitalChanges: number;
  };
  investingActivities: {
    furniture: number;
    equipment: number;
    vehicles: number;
    civilWork: number;
    preOpeningExpenses: number;
    workingCapital: number;
  };
  financingActivities: {
    equity: number;
    debt: number;
    principalRepayment: number;
  };
  netCashFlow: number;
}

export interface ImplementationTask {
  id: string;
  task: string;
  duration: number; // in days
  startDate?: string;
  endDate?: string;
  responsible?: string;
  status: 'لم يبدأ' | 'جاري' | 'مكتمل';
}

export interface DocumentChecklist {
  commercialRegistration: boolean;
  taxCertificate: boolean;
  municipalityLicense: boolean;
  civilDefenseLicense: boolean;
  healthLicense: boolean;
  environmentalApproval: boolean;
  laborLicense: boolean;
  socialInsurance: boolean;
  bankAccount: boolean;
  leaseContract: boolean;
  feasibilityStudy: boolean;
  [key: string]: boolean;
}

export interface CapacityUtilization {
  year: number;
  utilizationPercentage: number;
  targetSales: number;
  actualSales: number;
  purchases: number;
}

export interface BusinessPlan {
  id: string;
  userId: string;
  projectInfo: ProjectInfo;
  shareholders: Shareholder[];
  swotAnalysis: SWOTAnalysis;
  competitors: Competitor[];
  marketTrends: MarketTrend[];
  products: Product[];
  marketingMix: MarketingMix;
  rawMaterials: RawMaterial[];
  employees: Employee[];
  rentDetails: RentDetail[];
  equipment: Equipment[];
  operatingExpenses: OperatingExpense[];
  preOperatingExpenses: PreOperatingExpense[];
  workingCapital: WorkingCapital;
  revenueProjections: RevenueProjection[];
  cashFlowProjections: CashFlowProjection[];
  capacityUtilization: CapacityUtilization[];
  implementationTasks: ImplementationTask[];
  documentChecklist: DocumentChecklist;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'in-progress' | 'completed';
  completionPercentage: number;
}
