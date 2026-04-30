// Blockchain NFT Certificate Types

export interface NFTCertificate {
  id: string;
  tokenId: string; // Blockchain token ID
  contractAddress: string;
  ownerAddress: string;
  userId: string;
  businessPlanId: string;
  
  // Certificate Data
  title: string;
  titleAr: string;
  studentName: string;
  teacherName: string;
  institution: string;
  completionDate: number;
  issueDate: number;
  
  // Performance Metrics
  grade: number; // 0-100
  totalScore: number;
  simulationResults: SimulationResult;
  teacherNotes: string;
  
  // Rarity & Tier
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'cosmic';
  tier: number; // 1-5
  rarityScore: number; // 0-1000
  
  // Metadata
  metadata: NFTMetadata;
  ipfsHash: string; // IPFS storage hash
  
  // Verification
  blockchainNetwork: 'ethereum' | 'polygon' | 'binance' | 'testnet';
  transactionHash: string;
  verified: boolean;
  verificationTimestamp: number;
  
  // Sharing & Display
  publicUrl: string;
  shareableLink: string;
  qrCode: string;
  displayImage: string; // Generated certificate image
  
  // Special Features
  traits: NFTTrait[];
  achievements: string[]; // Achievement IDs included
  specialBadges: string[];
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  externalUrl: string;
  attributes: NFTAttribute[];
  properties: {
    category: string;
    businessType: string;
    completionPercentage: number;
    colonyLevel: number;
    totalModulesCompleted: number;
    aiCopilotRatings: {
      CFO: number;
      CMO: number;
      CEO: number;
    };
  };
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
  maxValue?: number;
}

export interface NFTTrait {
  id: string;
  category: 'performance' | 'achievement' | 'special' | 'visual';
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  color: string;
}

export interface SimulationResult {
  finalScore: number;
  profitability: number;
  marketShare: number;
  sustainability: number;
  innovation: number;
  riskManagement: number;
  colonySize: number;
  resourcesGenerated: {
    energy: number;
    credits: number;
    population: number;
  };
  eventsHandled: number;
  decisionsCorrect: number;
  decisionsTotal: number;
}

export interface RarityCalculation {
  baseScore: number;
  gradeBonus: number;
  completionBonus: number;
  simulationBonus: number;
  achievementBonus: number;
  specialBonus: number;
  totalScore: number;
  rarity: NFTCertificate['rarity'];
}

export interface MintRequest {
  userId: string;
  businessPlanId: string;
  walletAddress: string;
  network: 'ethereum' | 'polygon' | 'binance' | 'testnet';
  metadata: NFTMetadata;
}

export interface MintResponse {
  success: boolean;
  certificateId: string;
  tokenId: string;
  transactionHash: string;
  contractAddress: string;
  error?: string;
}

// Marketplace Types (for future trading/showcasing)
export interface NFTMarketplaceListing {
  certificateId: string;
  sellerId: string;
  price: number;
  currency: 'OMR' | 'ETH' | 'MATIC';
  listed: boolean;
  listedAt: number;
  views: number;
  likes: number;
}

export interface NFTShowcase {
  userId: string;
  displayedCertificates: string[]; // Certificate IDs
  layout: 'grid' | 'carousel' | 'timeline';
  public: boolean;
  customUrl: string;
}

// Investor/University Verification
export interface VerificationRequest {
  certificateId: string;
  requesterEmail: string;
  requesterName: string;
  requesterOrganization: string;
  purpose: string;
  requestedAt: number;
}

export interface VerificationResponse {
  valid: boolean;
  certificate: Partial<NFTCertificate>;
  verificationCode: string;
  verifiedAt: number;
  blockchainConfirmed: boolean;
}
