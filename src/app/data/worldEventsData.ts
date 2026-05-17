import type { WorldEvent, EventBadge } from '@/app/types/worldEvents';

// ═══════════════════════════════════════════════════════════════════════════════
// SEED WORLD EVENTS — Initial dataset for the Live World Events engine
// Dates are relative to 2026-05-17 (platform launch reference)
// ═══════════════════════════════════════════════════════════════════════════════

const NOW = '2026-05-17T00:00:00.000Z';

export const SEED_WORLD_EVENTS: WorldEvent[] = [
  // ── ACTIVE EVENTS ──────────────────────────────────────────────────────────
  {
    id: 'evt-001',
    title: { ar: 'أزمة الطاقة العالمية 2026', en: 'Global Energy Crisis 2026' },
    category: 'energy_crisis',
    severity: 'high',
    description: {
      ar: 'ارتفعت أسعار النفط بنسبة 40% بسبب توترات جيوسياسية في منطقة الخليج. تأثر قطاع الطاقة والصناعة التحويلية بشكل حاد، مما يخلق فرصاً للطاقة المتجددة.',
      en: 'Oil prices surged 40% due to geopolitical tensions in the Gulf region. The energy and manufacturing sectors are sharply affected, creating opportunities for renewable energy startups.',
    },
    shortDescription: {
      ar: 'ارتفاع أسعار النفط 40% — تأثير على الطاقة والصناعة',
      en: 'Oil prices +40% — energy & manufacturing sectors impacted',
    },
    startDate: '2026-05-01T00:00:00.000Z',
    affectedSectors: ['energy', 'manufacturing', 'logistics', 'sustainability'],
    impactModifiers: {
      rewardMultiplier: 1.4,
      challengeDifficulty: 1.3,
      xpModifier: 50,
      costInflation: 1.4,
      marketVolatility: 0.75,
      rankingMomentum: 1.2,
    },
    status: 'active',
    chainedEventIds: ['evt-005'],
    iconEmoji: '⚡',
    badgeIds: ['badge-energy-survivor', 'badge-crisis-strategist'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'evt-002',
    title: { ar: 'طفرة الذكاء الاصطناعي التوليدي', en: 'Generative AI Breakthrough' },
    category: 'tech_breakthrough',
    severity: 'medium',
    description: {
      ar: 'كسر نموذج ذكاء اصطناعي جديد حواجز التكيف الحقيقي، مما يفتح فرصاً تجارية هائلة في قطاعات التقنية والرعاية الصحية والتعليم. الشركات الناشئة التي تتبنى هذه التكنولوجيا تنمو بسرعة.',
      en: 'A new AI model broke real adaptation barriers, opening massive business opportunities in tech, healthcare, and education. Startups adopting this technology are growing rapidly.',
    },
    shortDescription: {
      ar: 'نموذج AI جديد يفتح فرصاً استثمارية ضخمة في التقنية',
      en: 'New AI model unlocks massive investment opportunities in tech',
    },
    startDate: '2026-05-10T00:00:00.000Z',
    affectedSectors: ['technology', 'healthcare', 'retail'],
    impactModifiers: {
      rewardMultiplier: 1.6,
      challengeDifficulty: 0.9,
      xpModifier: 80,
      costInflation: 0.95,
      marketVolatility: 0.4,
      rankingMomentum: 1.5,
    },
    status: 'active',
    iconEmoji: '🤖',
    badgeIds: ['badge-ai-hunter', 'badge-innovation-leader'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'evt-003',
    title: { ar: 'موجة تضخم عالمية', en: 'Global Inflation Wave' },
    category: 'inflation',
    severity: 'high',
    description: {
      ar: 'ارتفع التضخم العالمي إلى 12% مما يرفع تكاليف التشغيل ويقلص القوة الشرائية. الشركات التي تملك استراتيجيات فعّالة لإدارة التكاليف ستتفوق على المنافسين.',
      en: 'Global inflation reached 12%, raising operational costs and shrinking purchasing power. Companies with strong cost-management strategies will outperform competitors.',
    },
    shortDescription: {
      ar: 'تضخم 12% — التكاليف ترتفع والقوة الشرائية تنخفض',
      en: 'Inflation at 12% — costs rise, purchasing power falls',
    },
    startDate: '2026-04-15T00:00:00.000Z',
    affectedSectors: ['retail', 'manufacturing', 'real_estate', 'finance'],
    impactModifiers: {
      rewardMultiplier: 0.85,
      challengeDifficulty: 1.4,
      xpModifier: -20,
      costInflation: 1.5,
      marketVolatility: 0.65,
      rankingMomentum: 0.9,
    },
    status: 'escalating',
    chainedEventIds: ['evt-006'],
    iconEmoji: '📈',
    badgeIds: ['badge-market-survivor', 'badge-economic-recovery'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'evt-004',
    title: { ar: 'هجوم إلكتروني على البنية التحتية', en: 'Critical Infrastructure Cyberattack' },
    category: 'cyberattack',
    severity: 'critical',
    description: {
      ar: 'اخترق مجموعة من القراصنة أنظمة بنية تحتية حيوية في 15 دولة، مما أثر على سلاسل التوريد الرقمية. الشركات المستثمرة في الأمن السيبراني تشهد طلباً غير مسبوق.',
      en: 'A hacker group breached critical infrastructure in 15 countries, disrupting digital supply chains. Companies investing in cybersecurity are seeing unprecedented demand.',
    },
    shortDescription: {
      ar: 'هجوم سيبراني يضرب 15 دولة — فرص وتهديدات',
      en: 'Cyberattack hits 15 nations — threats and opportunities emerge',
    },
    startDate: '2026-05-14T00:00:00.000Z',
    affectedSectors: ['technology', 'finance', 'logistics'],
    impactModifiers: {
      rewardMultiplier: 0.7,
      challengeDifficulty: 1.6,
      xpModifier: 100,
      costInflation: 1.2,
      marketVolatility: 0.9,
      rankingMomentum: 1.3,
    },
    status: 'active',
    iconEmoji: '🔐',
    badgeIds: ['badge-cyber-defender', 'badge-resilient-investor'],
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── UPCOMING EVENTS ────────────────────────────────────────────────────────
  {
    id: 'evt-005',
    title: { ar: 'قمة المناخ العالمية 2026', en: 'Global Climate Summit 2026' },
    category: 'government_regulation',
    severity: 'medium',
    description: {
      ar: 'تجتمع 120 دولة لوضع معايير بيئية جديدة صارمة. الشركات الملتزمة بمعايير الاستدامة ستحصل على ميزة تنافسية وحوافز حكومية.',
      en: '120 nations meet to enforce strict new environmental standards. Companies meeting sustainability benchmarks gain competitive advantage and government incentives.',
    },
    shortDescription: {
      ar: 'معايير بيئية جديدة — فرص الاستدامة تتوسع',
      en: 'New environmental standards — sustainability opportunities expand',
    },
    startDate: '2026-06-01T00:00:00.000Z',
    affectedSectors: ['sustainability', 'energy', 'manufacturing', 'agriculture'],
    impactModifiers: {
      rewardMultiplier: 1.3,
      challengeDifficulty: 1.1,
      xpModifier: 40,
      costInflation: 1.1,
      marketVolatility: 0.3,
      rankingMomentum: 1.2,
    },
    status: 'upcoming',
    iconEmoji: '🌍',
    badgeIds: ['badge-sustainability-defender'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'evt-006',
    title: { ar: 'انهيار سلسلة التوريد الآسيوية', en: 'Asian Supply Chain Collapse' },
    category: 'supply_chain',
    severity: 'high',
    description: {
      ar: 'اضطراب حاد في سلاسل التوريد الآسيوية بسبب الكوارث الطبيعية وضغوط التكلفة. ارتفع تأخر الشحن بنسبة 300% مما يؤثر على المنتجات الصناعية والالكترونيات.',
      en: 'Severe disruption to Asian supply chains from natural disasters and cost pressures. Shipping delays up 300%, hitting manufacturing and electronics products.',
    },
    shortDescription: {
      ar: 'تأخيرات شحن 300% — سلاسل التوريد تنهار',
      en: 'Shipping delays 300% — supply chains breaking down',
    },
    startDate: '2026-06-15T00:00:00.000Z',
    affectedSectors: ['manufacturing', 'logistics', 'retail', 'technology'],
    impactModifiers: {
      rewardMultiplier: 0.8,
      challengeDifficulty: 1.5,
      xpModifier: 60,
      costInflation: 1.35,
      marketVolatility: 0.8,
      rankingMomentum: 1.1,
    },
    status: 'upcoming',
    iconEmoji: '🚢',
    badgeIds: ['badge-crisis-strategist'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'evt-007',
    title: { ar: 'كارثة مناخية في جنوب آسيا', en: 'South Asian Climate Disaster' },
    category: 'climate_disaster',
    severity: 'critical',
    description: {
      ar: 'فيضانات غير مسبوقة تضرب جنوب آسيا مما يدمر البنية التحتية الزراعية. الأزمة الغذائية تُلقي بظلالها على الأسواق العالمية وتفتح فرصاً لتقنيات الزراعة المستدامة.',
      en: 'Unprecedented floods devastate South Asian agricultural infrastructure. Food crisis ripples into global markets, opening opportunities in sustainable farming technologies.',
    },
    shortDescription: {
      ar: 'فيضانات تدمر الزراعة — أزمة غذائية عالمية',
      en: 'Floods devastate agriculture — global food crisis looms',
    },
    startDate: '2026-07-01T00:00:00.000Z',
    affectedSectors: ['agriculture', 'sustainability', 'logistics'],
    impactModifiers: {
      rewardMultiplier: 1.2,
      challengeDifficulty: 1.7,
      xpModifier: 120,
      costInflation: 1.6,
      marketVolatility: 0.95,
      rankingMomentum: 1.4,
    },
    status: 'upcoming',
    iconEmoji: '🌊',
    badgeIds: ['badge-sustainability-defender', 'badge-crisis-strategist'],
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── RESOLVED EVENTS (Historical) ───────────────────────────────────────────
  {
    id: 'evt-008',
    title: { ar: 'أزمة شُح الرقائق الإلكترونية', en: 'Global Chip Shortage Crisis' },
    category: 'supply_chain',
    severity: 'high',
    description: {
      ar: 'نقص حاد في الرقائق الإلكترونية أثّر على صناعة التكنولوجيا والسيارات. أدى ذلك إلى ارتفاع تكاليف الإنتاج وتأخيرات في إطلاق المنتجات.',
      en: 'Critical chip shortage affected the tech and auto industries. Production costs rose and product launches were delayed across multiple sectors.',
    },
    shortDescription: {
      ar: 'نقص الرقائق يضرب التقنية والسيارات',
      en: 'Chip shortage hits tech and auto industries',
    },
    startDate: '2026-01-15T00:00:00.000Z',
    endDate: '2026-04-30T00:00:00.000Z',
    affectedSectors: ['technology', 'manufacturing'],
    impactModifiers: {
      rewardMultiplier: 0.75,
      challengeDifficulty: 1.35,
      xpModifier: 30,
      costInflation: 1.4,
      marketVolatility: 0.6,
      rankingMomentum: 0.95,
    },
    status: 'resolved',
    resolutionNote: {
      ar: 'استعادت سلاسل التوريد استقرارها. المستثمرون الذين حافظوا على مراكزهم خلال الأزمة حققوا مكاسب كبيرة.',
      en: 'Supply chains stabilized. Investors who held their positions through the crisis realized significant gains.',
    },
    iconEmoji: '🔲',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'evt-009',
    title: { ar: 'انهيار أسواق العملات الرقمية', en: 'Crypto Market Crash' },
    category: 'economic_recession',
    severity: 'medium',
    description: {
      ar: 'انخفضت أسعار العملات الرقمية بنسبة 65% في أسبوعين مما أثر على ثقة المستثمرين في الأصول الرقمية وأعاد التركيز على الاستثمارات التقليدية.',
      en: 'Crypto prices dropped 65% in two weeks, shaking investor confidence in digital assets and refocusing attention on traditional investments.',
    },
    shortDescription: {
      ar: 'هبوط 65% في العملات الرقمية — عودة للاستثمار التقليدي',
      en: 'Crypto drops 65% — investors return to traditional assets',
    },
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2026-03-15T00:00:00.000Z',
    affectedSectors: ['finance', 'technology'],
    impactModifiers: {
      rewardMultiplier: 0.9,
      challengeDifficulty: 1.2,
      xpModifier: -10,
      costInflation: 1.0,
      marketVolatility: 0.7,
      rankingMomentum: 0.85,
    },
    status: 'resolved',
    resolutionNote: {
      ar: 'تعافى السوق جزئياً. الطلاب الذين تنبؤوا بالانتعاش حققوا نقاطاً استراتيجية عالية.',
      en: 'Market partially recovered. Students who predicted the rebound earned high strategic scores.',
    },
    iconEmoji: '💰',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT BADGES
// ═══════════════════════════════════════════════════════════════════════════════

export const SEED_EVENT_BADGES: EventBadge[] = [
  {
    id: 'badge-crisis-strategist',
    title: { ar: 'استراتيجي الأزمات', en: 'Crisis Strategist' },
    description: { ar: 'أثبت قدرة استثنائية على صياغة استراتيجيات فعّالة خلال الأزمات العالمية', en: 'Demonstrated exceptional ability to craft effective strategies during global crises' },
    iconEmoji: '⚔️',
    tier: 'gold',
    unlockCondition: 'Maintain top-25% ranking during any critical-severity event',
    isSecret: false,
  },
  {
    id: 'badge-market-survivor',
    title: { ar: 'الناجي من السوق', en: 'Market Survivor' },
    description: { ar: 'تجاوز بنجاح ثلاثة اضطرابات سوقية متتالية دون خسارة ترتيب', en: 'Successfully weathered three consecutive market disruptions without losing rank' },
    iconEmoji: '🛡️',
    tier: 'silver',
    unlockCondition: 'Survive 3 consecutive market events without rank drop',
    isSecret: false,
  },
  {
    id: 'badge-economic-recovery',
    title: { ar: 'قائد التعافي الاقتصادي', en: 'Economic Recovery Leader' },
    description: { ar: 'قاد استراتيجية استثمارية ناجحة ساهمت في التعافي من الأزمة الاقتصادية', en: 'Led a successful investment strategy that contributed to economic recovery' },
    iconEmoji: '📊',
    tier: 'gold',
    unlockCondition: 'Grow portfolio value by 20%+ during an economic recession event',
    isSecret: false,
  },
  {
    id: 'badge-ai-hunter',
    title: { ar: 'صائد فرص الذكاء الاصطناعي', en: 'AI Opportunity Hunter' },
    description: { ar: 'كان أول من يستثمر في الفرص المتاحة خلال الطفرات التكنولوجية', en: 'Among the first to capitalize on opportunities during technology breakthroughs' },
    iconEmoji: '🤖',
    tier: 'platinum',
    unlockCondition: 'Achieve top-10 rank within 48h of a tech_breakthrough event',
    isSecret: false,
  },
  {
    id: 'badge-sustainability-defender',
    title: { ar: 'مدافع الاستدامة', en: 'Sustainability Defender' },
    description: { ar: 'اتخذ قرارات استراتيجية تُعزز الاستدامة البيئية والاجتماعية', en: 'Made strategic decisions that champion environmental and social sustainability' },
    iconEmoji: '🌱',
    tier: 'silver',
    unlockCondition: 'Choose sustainable strategies in 5 climate-related events',
    isSecret: false,
  },
  {
    id: 'badge-resilient-investor',
    title: { ar: 'المستثمر المرن', en: 'Resilient Investor' },
    description: { ar: 'حافظ على أداء ثابت عبر أنواع متعددة من الأزمات العالمية', en: 'Maintained consistent performance across multiple types of global crises' },
    iconEmoji: '💪',
    tier: 'gold',
    unlockCondition: 'Participate in events from 5 different categories',
    isSecret: false,
  },
  {
    id: 'badge-energy-survivor',
    title: { ar: 'الناجي من أزمة الطاقة', en: 'Energy Crisis Survivor' },
    description: { ar: 'تكيّف بنجاح مع أزمات الطاقة وحوّلها إلى فرص نمو', en: 'Successfully adapted to energy crises and turned them into growth opportunities' },
    iconEmoji: '⚡',
    tier: 'bronze',
    unlockCondition: 'Complete a project during any energy_crisis event',
    isSecret: false,
  },
  {
    id: 'badge-cyber-defender',
    title: { ar: 'المدافع السيبراني', en: 'Cyber Defender' },
    description: { ar: 'طوّر استراتيجيات لحماية الأصول الرقمية خلال الهجمات السيبرانية', en: 'Developed strategies to protect digital assets during cyberattack events' },
    iconEmoji: '🔐',
    tier: 'silver',
    unlockCondition: 'Maintain rank during a cyberattack event',
    isSecret: true,
  },
  {
    id: 'badge-innovation-leader',
    title: { ar: 'قائد الابتكار', en: 'Innovation Leader' },
    description: { ar: 'ريادة في تبني الابتكارات التقنية وتحويلها لميزة تنافسية', en: 'Pioneer in adopting technological innovations and converting them to competitive advantage' },
    iconEmoji: '🚀',
    tier: 'platinum',
    unlockCondition: 'Secret — achieved through exceptional innovation during multiple tech events',
    isSecret: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export const EVENT_CATEGORY_META: Record<string, { label: { ar: string; en: string }; color: string; emoji: string }> = {
  war:                  { label: { ar: 'نزاع جيوسياسي', en: 'Geopolitical Conflict' }, color: '#EF4444', emoji: '⚔️' },
  economic_recession:   { label: { ar: 'ركود اقتصادي', en: 'Economic Recession' }, color: '#F59E0B', emoji: '📉' },
  inflation:            { label: { ar: 'أزمة تضخم', en: 'Inflation Crisis' }, color: '#F97316', emoji: '📈' },
  oil_shock:            { label: { ar: 'صدمة نفطية', en: 'Oil Market Shock' }, color: '#6B7280', emoji: '🛢️' },
  climate_disaster:     { label: { ar: 'كارثة مناخية', en: 'Climate Disaster' }, color: '#10B981', emoji: '🌊' },
  cyberattack:          { label: { ar: 'هجوم إلكتروني', en: 'Cyberattack' }, color: '#8B5CF6', emoji: '🔐' },
  tech_breakthrough:    { label: { ar: 'طفرة تكنولوجية', en: 'Tech Breakthrough' }, color: '#4ECDC4', emoji: '🤖' },
  government_regulation:{ label: { ar: 'لوائح حكومية', en: 'Government Regulation' }, color: '#3B82F6', emoji: '🏛️' },
  supply_chain:         { label: { ar: 'انهيار سلسلة التوريد', en: 'Supply Chain Collapse' }, color: '#EC4899', emoji: '🚢' },
  energy_crisis:        { label: { ar: 'أزمة طاقة', en: 'Energy Crisis' }, color: '#FBBF24', emoji: '⚡' },
};

export const SECTOR_META: Record<string, { label: { ar: string; en: string }; emoji: string }> = {
  technology:    { label: { ar: 'التكنولوجيا', en: 'Technology' }, emoji: '💻' },
  energy:        { label: { ar: 'الطاقة', en: 'Energy' }, emoji: '⚡' },
  finance:       { label: { ar: 'المالية', en: 'Finance' }, emoji: '💰' },
  agriculture:   { label: { ar: 'الزراعة', en: 'Agriculture' }, emoji: '🌾' },
  manufacturing: { label: { ar: 'التصنيع', en: 'Manufacturing' }, emoji: '🏭' },
  healthcare:    { label: { ar: 'الرعاية الصحية', en: 'Healthcare' }, emoji: '🏥' },
  retail:        { label: { ar: 'التجزئة', en: 'Retail' }, emoji: '🛍️' },
  real_estate:   { label: { ar: 'العقارات', en: 'Real Estate' }, emoji: '🏠' },
  logistics:     { label: { ar: 'اللوجستيات', en: 'Logistics' }, emoji: '🚛' },
  sustainability:{ label: { ar: 'الاستدامة', en: 'Sustainability' }, emoji: '🌱' },
};

export const SEVERITY_META: Record<string, { label: { ar: string; en: string }; color: string; bg: string }> = {
  low:      { label: { ar: 'منخفض', en: 'Low' },      color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  medium:   { label: { ar: 'متوسط', en: 'Medium' },   color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  high:     { label: { ar: 'مرتفع', en: 'High' },     color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  critical: { label: { ar: 'حرج', en: 'Critical' },   color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
};

export const STATUS_META: Record<string, { label: { ar: string; en: string }; color: string }> = {
  upcoming:       { label: { ar: 'قادم', en: 'Upcoming' },           color: '#3B82F6' },
  active:         { label: { ar: 'نشط', en: 'Active' },              color: '#10B981' },
  escalating:     { label: { ar: 'متصاعد', en: 'Escalating' },       color: '#EF4444' },
  'de-escalating':{ label: { ar: 'يتراجع', en: 'De-escalating' },    color: '#F59E0B' },
  resolved:       { label: { ar: 'انتهى', en: 'Resolved' },          color: '#6B7280' },
};
