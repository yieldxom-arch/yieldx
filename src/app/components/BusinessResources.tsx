import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, CheckCircle2, Package, Wrench, Megaphone, Calculator,
  Users, Code2, Palette, ExternalLink, Sparkles, Building2, ShieldCheck,
  Clock, Handshake, Globe, Zap, BadgeCheck, Search, ChevronRight,
  Star, MapPin, TrendingUp, Cpu, Lightbulb, Camera, Truck,
  FlaskConical, UtensilsCrossed, Hammer, Trophy, BarChart3,
  FileText, ArrowRight, Rocket, Info,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';

// ─── DATA TYPES ───────────────────────────────────────────────────────────────
interface SupplierCard {
  id: string; name: string; nameAr: string;
  category: string; categoryAr: string;
  description: string; descriptionAr: string;
  location: string; locationAr: string;
  rating: number; verified: boolean; tags: string[];
  icon: React.ReactNode; accentColor: string;
  badge?: string; badgeAr?: string;
}
interface ServiceCard {
  id: string; title: string; titleAr: string;
  description: string; descriptionAr: string;
  icon: React.ReactNode; accentColor: string;
  experts: number; priceRange: string; priceRangeAr: string; tags: string[];
}
interface PartnerCard {
  id: string; name: string; nameAr: string;
  type: string; typeAr: string;
  description: string; descriptionAr: string;
  icon: React.ReactNode; accentColor: string;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SUPPLIERS: SupplierCard[] = [
  { id:'s1', name:'Muscat Equipment Hub', nameAr:'مركز معدات مسقط', category:'Machinery & Tools', categoryAr:'الآلات والأدوات', description:'Industrial machinery, commercial equipment, and precision tools for startups and growing SMEs across Oman.', descriptionAr:'آلات صناعية ومعدات تجارية وأدوات دقيقة للشركات الناشئة والمتنامية في عمان.', location:'Muscat, Oman', locationAr:'مسقط، عمان', rating:4.8, verified:true, tags:['Industrial','Tools','SME'], icon:<Wrench className="w-5 h-5"/>, accentColor:'#6366f1', badge:'Top Rated', badgeAr:'الأعلى تقييماً' },
  { id:'s2', name:'Gulf Raw Materials Co.', nameAr:'شركة الخليج للمواد الخام', category:'Raw Materials', categoryAr:'المواد الخام', description:'Wholesale ingredients, manufacturing components, and bulk raw materials at competitive Omani market prices.', descriptionAr:'مكونات بالجملة ومستلزمات التصنيع والمواد الخام السائبة بأسعار تنافسية.', location:'Sohar, Oman', locationAr:'صحار، عمان', rating:4.6, verified:true, tags:['Wholesale','Manufacturing','Bulk'], icon:<FlaskConical className="w-5 h-5"/>, accentColor:'#10b981' },
  { id:'s3', name:'TechSource Arabia', nameAr:'تك سورس أرابيا', category:'Technology & Electronics', categoryAr:'التقنية والإلكترونيات', description:'POS systems, servers, networking gear, and complete tech infrastructure for modern businesses.', descriptionAr:'أنظمة نقاط البيع والخوادم ومعدات الشبكات والبنية التحتية التقنية الكاملة.', location:'Muscat, Oman', locationAr:'مسقط، عمان', rating:4.9, verified:true, tags:['POS','Servers','Network'], icon:<Cpu className="w-5 h-5"/>, accentColor:'#3b82f6', badge:'Partner', badgeAr:'شريك رسمي' },
  { id:'s4', name:'Al Jazeera Furnishings', nameAr:'مفروشات الجزيرة', category:'Furniture & Interiors', categoryAr:'الأثاث والديكور', description:'Commercial furniture, retail display fixtures, and turnkey interior fit-out for all business types.', descriptionAr:'أثاث تجاري وعدادات عرض بالتجزئة وتجهيز داخلي متكامل لجميع أنواع الأعمال.', location:'Muscat, Oman', locationAr:'مسقط، عمان', rating:4.5, verified:false, tags:['Furniture','Fit-out','Retail'], icon:<Package className="w-5 h-5"/>, accentColor:'#f59e0b' },
  { id:'s5', name:'Oman Food Supply Chain', nameAr:'سلسلة الإمداد الغذائي عمان', category:'Food & Beverage', categoryAr:'الأغذية والمشروبات', description:'Full supply chain for restaurants, cafés, and catering businesses. HACCP certified and cold-chain equipped.', descriptionAr:'سلسلة إمداد كاملة للمطاعم والمقاهي وشركات التموين. معتمد HACCP ومجهز بالتبريد.', location:'Muscat, Oman', locationAr:'مسقط، عمان', rating:4.7, verified:true, tags:['HACCP','Cold Chain','Catering'], icon:<UtensilsCrossed className="w-5 h-5"/>, accentColor:'#ef4444', badge:'Certified', badgeAr:'معتمد' },
  { id:'s6', name:'GreenBuild Oman', nameAr:'جرين بيلد عمان', category:'Construction & Renovation', categoryAr:'البناء والتجديد', description:'Construction materials, commercial renovations, and fit-out contracting for business spaces.', descriptionAr:'مواد بناء وتجديد تجاري ومقاولات تجهيز للمساحات التجارية.', location:'Muscat, Oman', locationAr:'مسقط، عمان', rating:4.4, verified:true, tags:['Construction','Renovation','Commercial'], icon:<Hammer className="w-5 h-5"/>, accentColor:'#8b5cf6' },
];

const SERVICES: ServiceCard[] = [
  { id:'sv1', title:'Social Media Marketing', titleAr:'التسويق عبر وسائل التواصل', description:'Expert marketers who grow your brand on Instagram, TikTok, X, and Snapchat with data-driven strategies.', descriptionAr:'خبراء تسويق ينمّون علامتك على إنستغرام وتيك توك وإكس وسناب شات باستراتيجيات مدعومة بالبيانات.', icon:<Megaphone className="w-6 h-6"/>, accentColor:'#ec4899', experts:124, priceRange:'50–300 OMR/mo', priceRangeAr:'50–300 ر.ع/شهر', tags:['Instagram','TikTok','Content'] },
  { id:'sv2', title:'Accounting & Finance', titleAr:'المحاسبة والإدارة المالية', description:'Certified Omani accountants for bookkeeping, VAT returns, payroll processing, and financial reporting.', descriptionAr:'محاسبون عمانيون معتمدون لمسك الدفاتر وإقرارات ضريبة القيمة المضافة وكشوف الرواتب.', icon:<Calculator className="w-6 h-6"/>, accentColor:'#10b981', experts:89, priceRange:'80–500 OMR/mo', priceRangeAr:'80–500 ر.ع/شهر', tags:['VAT','Bookkeeping','Payroll'] },
  { id:'sv3', title:'Business Consulting', titleAr:'الاستشارات التجارية', description:'Seasoned advisors who guide strategy, operations, licensing pathways, and sustainable growth plans.', descriptionAr:'مستشارون متمرسون يرشدون الاستراتيجية والعمليات ومسارات الترخيص وخطط النمو المستدام.', icon:<Lightbulb className="w-6 h-6"/>, accentColor:'#f59e0b', experts:56, priceRange:'100–800 OMR', priceRangeAr:'100–800 ر.ع', tags:['Strategy','Licensing','Growth'] },
  { id:'sv4', title:'Software & App Development', titleAr:'تطوير البرمجيات والتطبيقات', description:'Build your website, mobile app, POS system, or custom business software with vetted, experienced developers.', descriptionAr:'بناء موقعك وتطبيقك ونظام نقاط البيع أو البرمجيات التجارية المخصصة مع مطورين معتمدين.', icon:<Code2 className="w-6 h-6"/>, accentColor:'#6366f1', experts:203, priceRange:'200–2000 OMR', priceRangeAr:'200–2000 ر.ع', tags:['Web','Mobile','POS Systems'] },
  { id:'sv5', title:'Branding & Design', titleAr:'الهوية التجارية والتصميم', description:'Logo design, full brand identity, product packaging, and visual assets that make your business unforgettable.', descriptionAr:'تصميم الشعار والهوية التجارية الكاملة والتغليف والأصول البصرية التي تجعل عملك لا يُنسى.', icon:<Palette className="w-6 h-6"/>, accentColor:'#8b5cf6', experts:178, priceRange:'150–1500 OMR', priceRangeAr:'150–1500 ر.ع', tags:['Logo','Identity','Packaging'] },
  { id:'sv6', title:'Photography & Content', titleAr:'التصوير وإنتاج المحتوى', description:'Professional product and commercial photography, video production, and creative content for all platforms.', descriptionAr:'تصوير احترافي للمنتجات والأعمال التجارية وإنتاج الفيديو والمحتوى الإبداعي لجميع المنصات.', icon:<Camera className="w-6 h-6"/>, accentColor:'#0ea5e9', experts:95, priceRange:'100–600 OMR', priceRangeAr:'100–600 ر.ع', tags:['Photo','Video','Social Media'] },
];

const FUTURE_PARTNERS: PartnerCard[] = [
  { id:'p1', name:'Oman Development Bank', nameAr:'بنك التنمية العُماني', type:'SME Financing & Loans', typeAr:'تمويل المؤسسات الصغيرة', description:'Direct access to ODB loan programs, startup grants, and government-backed SME financing.', descriptionAr:'وصول مباشر لبرامج قروض بنك التنمية ومنح الشركات الناشئة والتمويل الحكومي.', icon:<Building2 className="w-5 h-5"/>, accentColor:'#10b981' },
  { id:'p2', name:'Ministry of Commerce', nameAr:'وزارة التجارة والصناعة', type:'Licensing & Compliance', typeAr:'التراخيص والامتثال', description:'Streamlined commercial registration, licensing guidance, and regulatory compliance support.', descriptionAr:'تسجيل تجاري مبسّط وإرشادات الترخيص ودعم الامتثال التنظيمي.', icon:<ShieldCheck className="w-5 h-5"/>, accentColor:'#6366f1' },
  { id:'p3', name:'Riyada Authority', nameAr:'هيئة ريادة الأعمال', type:'Grants & Incubation', typeAr:'المنح والحضانة', description:'Riyada incubators, entrepreneurship programs, grants, and SME development initiatives.', descriptionAr:'حاضنات ريادة وبرامج ريادة الأعمال والمنح ومبادرات تطوير المؤسسات الصغيرة.', icon:<TrendingUp className="w-5 h-5"/>, accentColor:'#f59e0b' },
  { id:'p4', name:'Logistics & Delivery', nameAr:'اللوجستيات والتوصيل', type:'Supply Chain & Shipping', typeAr:'سلاسل الإمداد والشحن', description:'Integrated last-mile delivery, warehousing, and regional shipping partners for your products.', descriptionAr:'توصيل المرحلة الأخيرة والتخزين وشركاء الشحن الإقليمي لمنتجاتك.', icon:<Truck className="w-5 h-5"/>, accentColor:'#0ea5e9' },
  { id:'p5', name:'Tech Hub Oman', nameAr:'تك هب عُمان', type:'Tech Incubator & Workspace', typeAr:'الحاضنة التقنية ومساحة العمل', description:'Coworking spaces, startup mentorship, and access to the thriving Omani tech ecosystem.', descriptionAr:'مساحات عمل مشتركة وإرشاد الشركات الناشئة والوصول إلى المنظومة التقنية العُمانية.', icon:<Cpu className="w-5 h-5"/>, accentColor:'#8b5cf6' },
  { id:'p6', name:'Angel Investors Network', nameAr:'شبكة المستثمرين الملاك', type:'Investment & Venture Capital', typeAr:'الاستثمار ورأس المال الجريء', description:'Connect with Omani angel investors and regional VCs actively seeking high-potential startups.', descriptionAr:'التواصل مع المستثمرين الملاك العُمانيين وصناديق رأس المال الجريء الباحثة عن الشركات الواعدة.', icon:<Handshake className="w-5 h-5"/>, accentColor:'#ec4899' },
];

// ─── STAR ROW ─────────────────────────────────────────────────────────────────
function StarRow({ rating, isDark }: { rating: number; isDark: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : isDark ? 'text-white/10' : 'text-slate-200'}`} />
      ))}
      <span className={`text-[11px] ml-1.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{rating}</span>
    </div>
  );
}

// ─── TAG CHIP ─────────────────────────────────────────────────────────────────
function Tag({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium tracking-wide ${
      isDark
        ? 'bg-white/[0.05] border-white/[0.07] text-white/35'
        : 'bg-slate-100 border-slate-200 text-slate-500'
    }`}>
      {label}
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function BusinessResources() {
  const { language, setCurrentView, theme, moduleData, projectTypeData, levels, totalXP } = useYieldX();
  const isRTL = language === 'ar';
  const isDark = theme !== 'light';

  const [activeTab, setActiveTab] = useState<'suppliers' | 'services' | 'partners'>('suppliers');
  const [search, setSearch] = useState('');

  const businessName = moduleData['level1']?.businessName || (isRTL ? 'مشروعك' : 'Your Business');
  const completedLevels = levels.filter(l => l.completed).length;
  const studyProgress = Math.round((completedLevels / levels.length) * 100);

  // ── Theme token shortcuts ──────────────────────────────────────────────────
  const t = {
    // page bg
    pageBg:       isDark ? 'bg-[#07070f]'        : 'bg-slate-50',
    // header / sticky bars
    headerBg:     isDark ? 'bg-[#07070f]/80 border-white/[0.06]'  : 'bg-white/90 border-slate-200',
    tabBarBg:     isDark ? 'bg-[#07070f]/90 border-white/[0.05]'  : 'bg-white/95 border-slate-200',
    // text
    textPrimary:  isDark ? 'text-white'          : 'text-slate-900',
    textSecondary:isDark ? 'text-white/45'       : 'text-slate-500',
    textMuted:    isDark ? 'text-white/25'       : 'text-slate-400',
    textBack:     isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900',
    textBreadcrumb: isDark ? 'text-white/20'     : 'text-slate-300',
    textBreadcrumb2: isDark ? 'text-white/40'    : 'text-slate-500',
    // cards
    cardBg:       isDark ? 'bg-white/[0.025] border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.05]' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg',
    cardBgPlain:  isDark ? 'bg-white/[0.025] border-white/[0.07]' : 'bg-white border-slate-200',
    // study card parts
    studyCardBg:  isDark ? 'bg-white/[0.03] border-white/[0.08]'   : 'bg-white border-slate-200 shadow-sm',
    studyHeaderBg:isDark ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-white/[0.06]' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-slate-200',
    studyKpiBg:   isDark ? 'bg-white/[0.03] border-white/[0.05]'   : 'bg-slate-50 border-slate-200',
    studyCtaBg:   isDark ? 'text-white/50 border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] hover:text-white/80' : 'text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-800',
    studyProgressBg: isDark ? 'bg-white/[0.06]' : 'bg-slate-200',
    // tabs
    tabsWrap:     isDark ? 'bg-white/[0.04] border-white/[0.06]'   : 'bg-slate-100 border-slate-200',
    tabInactive:  isDark ? 'text-white/35 hover:text-white/65 hover:bg-white/[0.05]' : 'text-slate-500 hover:text-slate-700 hover:bg-white',
    tabCount:     isDark ? 'bg-white/[0.07] text-white/30'         : 'bg-slate-200 text-slate-400',
    tabCountActive: 'bg-white/20 text-white',
    // search
    searchBg:     isDark ? 'bg-white/[0.04] border-white/[0.07] text-white placeholder-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06]' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400',
    searchIcon:   isDark ? 'text-white/25'  : 'text-slate-400',
    // divider
    dividerLine:  isDark ? 'via-white/[0.08]' : 'via-slate-200',
    dividerBadge: isDark ? 'text-white/25 border-white/[0.07] bg-white/[0.03]' : 'text-slate-400 border-slate-200 bg-white',
    // section heading
    sectionDesc:  isDark ? 'text-white/35'  : 'text-slate-500',
    // info note
    noteBg:       isDark ? 'border-indigo-500/15 bg-indigo-500/[0.05]' : 'border-indigo-200 bg-indigo-50',
    noteTitle:    isDark ? 'text-indigo-300' : 'text-indigo-700',
    noteText:     isDark ? 'text-indigo-300/55' : 'text-indigo-600/70',
    // card text
    cardTitle:    isDark ? 'text-white'      : 'text-slate-900',
    cardCat:      isDark ? 'text-white/35'   : 'text-slate-500',
    cardDesc:     isDark ? 'text-white/40'   : 'text-slate-500',
    cardMeta:     isDark ? 'text-white/25'   : 'text-slate-400',
    cardStat:     isDark ? 'text-white/35'   : 'text-slate-500',
    cardDivider:  isDark ? 'bg-white/10'     : 'bg-slate-200',
    // pill completion
    completionPill: isDark ? 'border-emerald-500/25 bg-emerald-500/[0.08]' : 'border-emerald-500/30 bg-emerald-50',
    completionText: isDark ? 'text-emerald-300' : 'text-emerald-700',
    // header status pill
    statusPill:   isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-300',
    statusDot:    isDark ? 'bg-emerald-400' : 'bg-emerald-500',
    // bottom CTA
    ctaWrap:      isDark ? 'border-white/[0.07] bg-gradient-to-br from-indigo-600/[0.10] via-violet-600/[0.06] to-transparent' : 'border-slate-200 bg-gradient-to-br from-indigo-50 via-violet-50/60 to-slate-50',
    ctaTopLine:   isDark ? 'from-transparent via-indigo-400/40 to-transparent' : 'from-transparent via-indigo-300/60 to-transparent',
    ctaSecBtn:    isDark ? 'text-white/50 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/80' : 'text-slate-500 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-800',
    // vision card
    visionBg:     isDark ? 'border-white/[0.08] bg-gradient-to-br from-indigo-500/[0.08] via-violet-500/[0.05] to-transparent' : 'border-slate-200 bg-gradient-to-br from-indigo-50 via-violet-50/50 to-slate-50',
    visionTopLine:isDark ? 'from-transparent via-indigo-400/50 to-transparent' : 'from-transparent via-indigo-300/60 to-transparent',
    visionTitle:  isDark ? 'text-white'     : 'text-slate-900',
    visionDesc:   isDark ? 'text-white/45'  : 'text-slate-500',
    visionStatBg: isDark ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-white border-slate-200',
    visionStatLabel: isDark ? 'text-white/35' : 'text-slate-500',
    visionIcon:   isDark ? 'bg-gradient-to-br from-indigo-500/25 to-violet-500/15 border-indigo-500/25' : 'bg-gradient-to-br from-indigo-100 to-violet-100 border-indigo-200',
    // partner card
    partnerBg:    isDark ? 'border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md',
    partnerName:  isDark ? 'text-white'     : 'text-slate-900',
    partnerType:  isDark ? 'text-white/30'  : 'text-slate-400',
    partnerDesc:  isDark ? 'text-white/35'  : 'text-slate-500',
    partnerNotify:isDark ? 'text-white/20 hover:text-white/50' : 'text-slate-300 hover:text-slate-600',
    // ambient glows (only visible in dark)
    glowOpacity:  isDark ? '' : 'hidden',
    // footer
    footerBg:     isDark ? 'border-white/[0.05]' : 'border-slate-200',
    footerText:   isDark ? 'text-white/25'   : 'text-slate-400',
    footerMuted:  isDark ? 'text-white/15'   : 'text-slate-300',
    footerSec:    isDark ? 'text-white/20'   : 'text-slate-400',
  };

  const tabs = [
    { id:'suppliers', label:'Equipment & Suppliers', labelAr:'المعدات والموردون', icon:<Package className="w-4 h-4"/>, count:SUPPLIERS.length },
    { id:'services',  label:'Professional Services',  labelAr:'الخدمات المهنية',    icon:<Users className="w-4 h-4"/>,   count:SERVICES.length },
    { id:'partners',  label:'Future Partnerships',    labelAr:'الشراكات المستقبلية',icon:<Handshake className="w-4 h-4"/>, count:FUTURE_PARTNERS.length },
  ] as const;

  const lq = search.toLowerCase();
  const filteredSuppliers = SUPPLIERS.filter(s => !search || (s.name+s.nameAr+s.category+s.categoryAr+s.description).toLowerCase().includes(lq));
  const filteredServices  = SERVICES.filter(s  => !search || (s.title+s.titleAr+s.description).toLowerCase().includes(lq));
  const filteredPartners  = FUTURE_PARTNERS.filter(p => !search || (p.name+p.nameAr+p.type).toLowerCase().includes(lq));

  return (
    <div className={`min-h-screen ${t.pageBg} overflow-x-hidden transition-colors duration-300`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── AMBIENT BG (dark only) ── */}
      <div className={`fixed inset-0 pointer-events-none ${isDark ? '' : 'hidden'}`}>
        <img src="https://images.unsplash.com/photo-1771448233778-6191ff960f55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjBzcGFjZSUyMGdhbGF4eSUyMG5lYnVsYSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcyODAyMjA4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="" className="w-full h-full object-cover opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070f]/70 via-transparent to-[#07070f]" />
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.07] blur-[130px]" />
        <div className="absolute top-[30%] right-[5%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[120px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-600/[0.04] blur-[100px]" />
      </div>

      {/* ── LIGHT BG DECORATION ── */}
      {!isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-indigo-100/60 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-100/50 to-transparent blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] rounded-full bg-indigo-50/80 blur-3xl" />
        </div>
      )}

      <div className="relative z-10">

        {/* ══ HEADER ══ */}
        <header className={`sticky top-0 z-50 border-b backdrop-blur-2xl ${t.headerBg}`}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
            <button onClick={() => setCurrentView('space-map')}
              className={`flex items-center gap-2 text-sm transition-colors group ${t.textBack}`}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:block">{isRTL ? 'العودة إلى اللوحة' : 'Back to Dashboard'}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold text-base tracking-tight ${t.textPrimary}`}>YieldX</span>
              <span className={`hidden sm:block text-sm ${t.textBreadcrumb}`}>/</span>
              <span className={`hidden sm:block text-sm ${t.textBreadcrumb2}`}>{isRTL ? 'موارد الأعمال' : 'Business Resources'}</span>
            </div>

            <div className={`hidden sm:flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-full ${t.statusPill}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${t.statusDot}`} />
              {isRTL ? 'دراسة الجدوى مكتملة' : 'Feasibility Study Complete'}
            </div>
          </div>
        </header>

        {/* ══ HERO ══ */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-12">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">

            {/* Left */}
            <div>
              <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
                className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-6 ${t.completionPill}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className={`text-xs font-semibold tracking-wide uppercase ${t.completionText}`}>
                  {isRTL ? 'الخطوة التالية بعد دراسة الجدوى' : 'Next Step After Your Feasibility Study'}
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
                className="text-4xl sm:text-5xl font-black leading-[1.1] mb-4">
                <span className={t.textPrimary}>{isRTL ? 'موارد' : 'Business'}</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                  {isRTL ? 'وشركاء الأعمال' : 'Resources & Partners'}
                </span>
              </motion.h1>

              <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
                className={`text-base leading-relaxed max-w-xl mb-8 ${t.textSecondary}`}>
                {isRTL
                  ? `لقد أكملت دراسة الجدوى لـ "${businessName}" بنجاح. الآن اكتشف الموارد والشركاء الذين يمكنهم مساعدتك على إطلاق مشروعك على أرض الواقع.`
                  : `Your feasibility study for "${businessName}" is complete. Now explore the resources and partners that can help you actually launch your business.`}
              </motion.p>

              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
                className="flex flex-wrap gap-2">
                {[
                  { icon:<Package className="w-3.5 h-3.5"/>, label:isRTL?'موردو المعدات':'Equipment Suppliers', color:'#6366f1', tab:'suppliers' },
                  { icon:<Users className="w-3.5 h-3.5"/>,   label:isRTL?'الخبراء المهنيون':'Professional Experts', color:'#10b981', tab:'services' },
                  { icon:<Handshake className="w-3.5 h-3.5"/>,label:isRTL?'شراكات مستقبلية':'Future Partnerships', color:'#f59e0b', tab:'partners' },
                ].map((chip,i)=>(
                  <button key={i} onClick={()=>setActiveTab(chip.tab as any)}
                    className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl border font-medium transition-all"
                    style={{ borderColor:`${chip.color}35`, backgroundColor:`${chip.color}12`, color:chip.color }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor=`${chip.color}22`;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor=`${chip.color}12`;}}>
                    {chip.icon} {chip.label}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Right: Study Summary Card */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}>
              <div className={`relative rounded-2xl border overflow-hidden ${t.studyCardBg}`}>
                <div className={`border-b px-5 py-4 flex items-center gap-3 ${t.studyHeaderBg}`}>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${t.textPrimary}`}>{isRTL?'ملخص دراسة الجدوى':'Feasibility Study Summary'}</p>
                    <p className={`text-xs ${t.textMuted}`}>{isRTL?'مكتمل ومحفوظ':'Completed & saved'}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {isRTL?'مكتمل':'Done'}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className={t.textMuted}>{isRTL?'اكتمال المستويات':'Level Completion'}</span>
                      <span className={`font-semibold ${t.textPrimary}`}>{completedLevels}/{levels.length} {isRTL?'مستويات':'levels'}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${t.studyProgressBg}`}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${studyProgress}%` }} transition={{ delay:0.5, duration:1, ease:'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                    </div>
                    <p className={`text-xs mt-1 ${t.textMuted}`}>{studyProgress}% {isRTL?'منجز':'complete'}</p>
                  </div>

                  {/* KPI grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label:isRTL?'نقاط الخبرة':'XP Earned',    value:`${totalXP} XP`, color:'#6366f1', icon:<Star className="w-3.5 h-3.5"/> },
                      { label:isRTL?'اسم المشروع':'Project',       value:businessName,    color:'#10b981', icon:<Rocket className="w-3.5 h-3.5"/> },
                      { label:isRTL?'القطاع':'Sector',             value:projectTypeData?.type?(projectTypeData.type[0].toUpperCase()+projectTypeData.type.slice(1)):'—', color:'#f59e0b', icon:<BarChart3 className="w-3.5 h-3.5"/> },
                      { label:isRTL?'الموقع':'Location',           value:moduleData['level1']?.location||'—', color:'#0ea5e9', icon:<MapPin className="w-3.5 h-3.5"/> },
                    ].map((kpi,i)=>(
                      <div key={i} className={`p-3 rounded-xl border ${t.studyKpiBg}`}>
                        <div className="flex items-center gap-1.5 mb-1" style={{ color:kpi.color }}>{kpi.icon}
                          <span className={`text-[10px] font-medium ${t.textMuted}`}>{kpi.label}</span>
                        </div>
                        <p className={`text-xs font-bold truncate ${t.textPrimary}`}>{kpi.value}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={()=>setCurrentView('space-map')}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${t.studyCtaBg}`}>
                    <FileText className="w-3.5 h-3.5" />
                    {isRTL?'مراجعة دراسة الجدوى':'Review Feasibility Study'}
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL?'rotate-180':''}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ DIVIDER ══ */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-10">
          <div className="flex items-center gap-4">
            <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${t.dividerLine} to-transparent`} />
            <div className={`flex items-center gap-2 text-xs border px-4 py-1.5 rounded-full whitespace-nowrap ${t.dividerBadge}`}>
              <Sparkles className="w-3 h-3 text-indigo-500" />
              {isRTL?'موارد ما بعد دراسة الجدوى':'Post-Study Resources'}
            </div>
            <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${t.dividerLine} to-transparent`} />
          </div>
        </div>

        {/* ══ TAB BAR ══ */}
        <div className={`sticky top-14 z-40 border-b backdrop-blur-2xl ${t.tabBarBg}`}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className={`flex items-center gap-1 p-1 rounded-2xl border flex-shrink-0 ${t.tabsWrap}`}>
              {tabs.map(tab=>(
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeTab===tab.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : t.tabInactive
                  }`}>
                  {tab.icon}
                  <span className="hidden md:block">{isRTL?tab.labelAr:tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab===tab.id?t.tabCountActive:t.tabCount}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative flex-1 w-full sm:w-auto">
              <Search className={`absolute ${isRTL?'right-3':'left-3'} top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${t.searchIcon}`} />
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder={isRTL?'ابحث في الموارد...':'Search resources...'}
                className={`w-full h-9 ${isRTL?'pr-9 pl-4':'pl-9 pr-4'} rounded-xl border text-sm outline-none transition-all ${t.searchBg}`} />
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <AnimatePresence mode="wait">

            {/* ── TAB 1: SUPPLIERS ── */}
            {activeTab==='suppliers' && (
              <motion.div key="suppliers" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.25 }}>

                <div className="flex items-start gap-4 mb-8">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark?'bg-indigo-500/15 border-indigo-500/25 border':'bg-indigo-100 border border-indigo-200'}`}>
                    <Package className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold mb-0.5 ${t.textPrimary}`}>{isRTL?'المعدات والموردون':'Equipment & Suppliers'}</h2>
                    <p className={`text-sm ${t.sectionDesc}`}>{isRTL?'موردون موثوقون للأدوات والمواد والمعدات التي يحتاجها مشروعك':'Trusted suppliers for the tools, materials, and equipment your business needs to operate'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                  {filteredSuppliers.map((s,i)=>(
                    <motion.div key={s.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                      className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${t.cardBg}`}>
                      {/* Accent top line on hover */}
                      <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background:`linear-gradient(90deg,transparent,${s.accentColor}80,transparent)` }} />

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                            style={{ backgroundColor:`${s.accentColor}15`, border:`1.5px solid ${s.accentColor}30`, color:s.accentColor }}>
                            {s.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <p className={`text-sm font-bold leading-tight truncate ${t.cardTitle}`}>{isRTL?s.nameAr:s.name}</p>
                              {s.verified && <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color:s.accentColor }} />}
                            </div>
                            <p className={`text-[11px] truncate ${t.cardCat}`}>{isRTL?s.categoryAr:s.category}</p>
                            {s.badge && (
                              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                style={{ backgroundColor:`${s.accentColor}18`, color:s.accentColor }}>
                                {isRTL?s.badgeAr:s.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className={`text-xs leading-relaxed mb-4 line-clamp-2 flex-1 ${t.cardDesc}`}>
                          {isRTL?s.descriptionAr:s.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <StarRow rating={s.rating} isDark={isDark} />
                          <div className={`flex items-center gap-1 text-[11px] ${t.cardMeta}`}>
                            <MapPin className="w-3 h-3" />
                            {isRTL?s.locationAr:s.location}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {s.tags.map(tg=><Tag key={tg} label={tg} isDark={isDark}/>)}
                        </div>

                        <button
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                          style={{ backgroundColor:`${s.accentColor}12`, color:s.accentColor, border:`1px solid ${s.accentColor}28` }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor=`${s.accentColor}25`;}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor=`${s.accentColor}12`;}}>
                          <ExternalLink className="w-3.5 h-3.5" />
                          {isRTL?'عرض المورد':'View Supplier'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Info note */}
                <div className={`flex items-start gap-3 p-5 rounded-2xl border ${t.noteBg}`}>
                  <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-semibold mb-0.5 ${t.noteTitle}`}>{isRTL?'تكامل الموردين':'Supplier Integrations'}</p>
                    <p className={`text-xs leading-relaxed ${t.noteText}`}>
                      {isRTL
                        ? 'ستُضاف عمليات تكامل الموردين تدريجياً من خلال شراكات موثّقة. ستظهر الموردون المعتمدون مباشرةً داخل المنصة بمجرد اكتمال عمليات التحقق والاتفاقيات الرسمية.'
                        : 'Supplier integrations will be added progressively through verified partnerships. Approved suppliers will appear directly inside the platform once verification and formal agreements are complete.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB 2: SERVICES ── */}
            {activeTab==='services' && (
              <motion.div key="services" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.25 }}>

                <div className="flex items-start gap-4 mb-8">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark?'bg-emerald-500/15 border-emerald-500/25 border':'bg-emerald-100 border border-emerald-200'}`}>
                    <Users className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold mb-0.5 ${t.textPrimary}`}>{isRTL?'الخدمات المهنية':'Professional Services'}</h2>
                    <p className={`text-sm ${t.sectionDesc}`}>{isRTL?'خبراء مستقلون ووكالات معتمدة تساعدك في إطلاق مشروعك وإدارته':'Vetted freelancers and agencies to help you launch, grow, and manage your business'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredServices.map((sv,i)=>(
                    <motion.div key={sv.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                      className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${isDark?'border-white/[0.07] hover:border-white/[0.14]':'border-slate-200 hover:border-slate-300 hover:shadow-lg'}`}>
                      {/* gradient bg */}
                      <div className={`absolute inset-0 transition-opacity duration-300 ${isDark?'opacity-60 group-hover:opacity-100':'opacity-40 group-hover:opacity-70'}`}
                        style={{ background:`radial-gradient(ellipse at 10% 0%,${sv.accentColor}${isDark?'10':'08'} 0%,transparent 60%)` }} />
                      <div className={`absolute inset-0 ${isDark?'bg-white/[0.025]':'bg-white'}`} />
                      <div className="absolute top-0 inset-x-0 h-[1.5px]"
                        style={{ background:`linear-gradient(90deg,transparent,${sv.accentColor}50,transparent)` }} />

                      <div className="relative p-6 flex-1 flex flex-col">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1"
                          style={{ backgroundColor:`${sv.accentColor}15`, border:`1.5px solid ${sv.accentColor}30`, color:sv.accentColor }}>
                          {sv.icon}
                        </div>

                        <h3 className={`text-base font-bold mb-2 leading-snug ${t.cardTitle}`}>{isRTL?sv.titleAr:sv.title}</h3>

                        <p className={`text-xs leading-relaxed mb-5 line-clamp-2 flex-1 ${t.cardDesc}`}>{isRTL?sv.descriptionAr:sv.description}</p>

                        <div className="flex items-center gap-4 mb-4 text-xs">
                          <div className={`flex items-center gap-1.5 ${t.cardStat}`}>
                            <Users className="w-3 h-3" />
                            <span>{sv.experts} {isRTL?'خبير متاح':'experts'}</span>
                          </div>
                          <div className={`w-px h-3 ${t.cardDivider}`} />
                          <div className="flex items-center gap-1.5 font-semibold" style={{ color:sv.accentColor }}>
                            <TrendingUp className="w-3 h-3" />
                            <span>{isRTL?sv.priceRangeAr:sv.priceRange}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {sv.tags.map(tg=><Tag key={tg} label={tg} isDark={isDark}/>)}
                        </div>

                        <button
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                          style={{ background:`linear-gradient(135deg,${sv.accentColor}20 0%,${sv.accentColor}10 100%)`, color:sv.accentColor, border:`1px solid ${sv.accentColor}30` }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`linear-gradient(135deg,${sv.accentColor}35 0%,${sv.accentColor}20 100%)`;}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=`linear-gradient(135deg,${sv.accentColor}20 0%,${sv.accentColor}10 100%)`;}}>
                          <Globe className="w-3.5 h-3.5" />
                          {isRTL?'ابحث عن خبراء':'Find Experts'}
                          <ChevronRight className={`w-3.5 h-3.5 ${isRTL?'rotate-180':''} transition-transform group-hover:translate-x-0.5`} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── TAB 3: FUTURE PARTNERSHIPS ── */}
            {activeTab==='partners' && (
              <motion.div key="partners" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.25 }}>

                <div className="flex items-start gap-4 mb-8">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark?'bg-amber-500/15 border-amber-500/25 border':'bg-amber-100 border border-amber-200'}`}>
                    <Handshake className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold mb-0.5 ${t.textPrimary}`}>{isRTL?'الشراكات المستقبلية':'Future Partnerships'}</h2>
                    <p className={`text-sm ${t.sectionDesc}`}>{isRTL?'يبني YieldX منظومة متكاملة من الشركاء الاستراتيجيين لدعم رائد الأعمال في كل مرحلة':'YieldX is building a complete ecosystem of strategic partners to support entrepreneurs at every stage'}</p>
                  </div>
                </div>

                {/* Vision block */}
                <div className={`relative rounded-2xl border overflow-hidden mb-8 ${t.visionBg}`}>
                  <img src="https://images.unsplash.com/photo-1758520144667-3041caeff3c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwdGVhbSUyMG9mZmljZSUyMGxhcHRvcCUyMGRhcmslMjBuaWdodHxlbnwxfHx8fDE3NzI4MDIyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="" className={`absolute inset-0 w-full h-full object-cover ${isDark?'opacity-[0.06]':'opacity-[0.04]'}`} />
                  <div className={`absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r ${t.visionTopLine}`} />

                  <div className="relative p-8 sm:p-10">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border ${t.visionIcon}`}>
                        <Sparkles className="w-8 h-8 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <h3 className={`text-lg font-bold ${t.visionTitle}`}>{isRTL?'نظرة مستقبلية: منظومة YieldX':'Vision: The YieldX Ecosystem'}</h3>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/25 uppercase tracking-wide">
                            {isRTL?'قريباً':'Coming Soon'}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed mb-5 max-w-2xl ${t.visionDesc}`}>
                          {isRTL
                            ? 'يسعى YieldX إلى بناء شبكة متكاملة من الشركاء الاستراتيجيين — بنوك وجهات حكومية ومستثمرين ومزودي خدمات — ليتمكن رواد الأعمال من الوصول بسهولة إلى كل ما يحتاجونه لإطلاق مشاريعهم، كل ذلك من داخل منصة YieldX مباشرةً.'
                            : 'YieldX aims to build an integrated network of strategic partners — banks, government entities, investors, and service providers — so entrepreneurs can easily access everything they need to launch their business, all directly within the YieldX platform.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { label:isRTL?'شركاء مؤسسيون':'Institutional Partners', value:'6+',  color:'#6366f1' },
                            { label:isRTL?'مزودو خدمات':'Service Providers',       value:'20+', color:'#10b981' },
                            { label:isRTL?'المستهدف 2025':'Target 2025',             value:'50+', color:'#f59e0b' },
                          ].map((stat,i)=>(
                            <div key={i} className={`p-3 rounded-xl border text-center ${t.visionStatBg}`}>
                              <p className="text-xl font-black mb-0.5" style={{ color:stat.color }}>{stat.value}</p>
                              <p className={`text-[11px] ${t.visionStatLabel}`}>{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partner cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPartners.map((p,i)=>(
                    <motion.div key={p.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                      className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${t.partnerBg}`}>
                      <div className="absolute top-0 inset-x-0 h-[1.5px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background:`linear-gradient(90deg,transparent,${p.accentColor}60,transparent)` }} />

                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor:`${p.accentColor}12`, border:`1.5px solid ${p.accentColor}28`, color:p.accentColor }}>
                          {p.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-bold leading-snug ${t.partnerName}`}>{isRTL?p.nameAr:p.name}</p>
                          <p className={`text-[11px] mt-0.5 ${t.partnerType}`}>{isRTL?p.typeAr:p.type}</p>
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${t.partnerDesc}`}>{isRTL?p.descriptionAr:p.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                          style={{ borderColor:`${p.accentColor}25`, backgroundColor:`${p.accentColor}10`, color:p.accentColor }}>
                          <Clock className="w-3 h-3" />
                          {isRTL?'قريباً':'Coming Soon'}
                        </div>
                        <button className={`flex items-center gap-1 text-xs transition-colors ${t.partnerNotify}`}>
                          {isRTL?'إشعار عند الإطلاق':'Notify me'}
                          <ChevronRight className={`w-3 h-3 ${isRTL?'rotate-180':''}`} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ══ BOTTOM CTA ══ */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-16 pt-4">
          <div className={`relative rounded-3xl overflow-hidden border ${t.ctaWrap}`}>
            <div className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r ${t.ctaTopLine}`} />
            <div className="relative px-8 sm:px-14 py-10 flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark?'bg-gradient-to-br from-indigo-500/25 to-violet-500/15 border border-indigo-500/20':'bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200'}`}>
                <Rocket className="w-7 h-7 text-indigo-500" />
              </div>
              <div className="flex-1 text-center sm:text-start">
                <h3 className={`text-xl font-bold mb-1 ${t.textPrimary}`}>
                  {isRTL?'جاهز لإطلاق مشروعك؟':'Ready to launch your business?'}
                </h3>
                <p className={`text-sm leading-relaxed ${t.textSecondary}`}>
                  {isRTL
                    ? 'دراستك الجدوى جاهزة. الآن حان وقت التنفيذ. تواصل مع الخبراء والموردين المناسبين وابدأ رحلتك الريادية بثقة.'
                    : "Your feasibility study is ready. Now it's time to execute. Connect with the right experts and suppliers to launch with confidence."}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={()=>setCurrentView('space-map')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${t.ctaSecBtn}`}>
                  <ArrowLeft className={`w-4 h-4 ${isRTL?'rotate-180':''}`} />
                  {isRTL?'اللوحة الرئيسية':'Dashboard'}
                </button>
                <button onClick={()=>setActiveTab('suppliers')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                  <Sparkles className="w-4 h-4" />
                  {isRTL?'ابدأ الاستكشاف':'Start Exploring'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <div className={`border-t max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between flex-wrap gap-3 ${t.footerBg}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className={`text-sm font-medium ${t.footerText}`}>YieldX</span>
          </div>
          <p className={`text-xs ${t.footerMuted}`}>
            {isRTL?'© 2025 YieldX — منصة دراسة الجدوى الذكية للريادة العُمانية':'© 2025 YieldX — AI Feasibility Platform for Omani Entrepreneurs'}
          </p>
          <div className={`flex items-center gap-1.5 text-[11px] ${t.footerSec}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {isRTL?'بيانات آمنة ومشفرة':'Secure & Encrypted'}
          </div>
        </div>

      </div>
    </div>
  );
}
