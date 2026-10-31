// The Omani oasis journey: one place per level, joined by a falaj.
// Each place says what comes alive there and which YieldX features the
// level gives the user, so the map doubles as a "what you unlock" guide.

export interface OasisStation {
  levelId: number; // -1 = final castle (the full study)
  place: { en: string; ar: string };
  alive: { en: string; ar: string };
  features: { en: string; ar: string }[];
  /** Platform colour (top) and side colour. */
  color: string;
  side: string;
  /** Position on the diorama (x, z). */
  pos: [number, number];
}

export const OASIS_STATIONS: OasisStation[] = [
  {
    levelId: 0,
    place: { en: 'The spring', ar: 'العين' },
    alive: { en: 'Water starts to flow into the falaj.', ar: 'يبدأ الماء بالجريان في الفلج.' },
    features: [
      { en: 'Choose your sector', ar: 'اختيار قطاع المشروع' },
      { en: 'Try a complete example study', ar: 'تجربة دراسة جدوى كاملة جاهزة' },
    ],
    color: '#7cc4c9',
    side: '#4d8f94',
    pos: [-7.2, -4.2],
  },
  {
    levelId: 1,
    place: { en: 'Your house', ar: 'البيت' },
    alive: { en: 'Your house goes up with your business name on the door.', ar: 'يُبنى بيتك واسم مشروعك على الباب.' },
    features: [
      { en: 'Omani trade-name check (rules + Invest Easy)', ar: 'فحص الاسم التجاري العُماني (القواعد + استثمر بسهولة)' },
      { en: 'Owners and shares', ar: 'الملاك ونسب الملكية' },
    ],
    color: '#e3b778',
    side: '#b0864c',
    pos: [-3.4, -5.6],
  },
  {
    levelId: 2,
    place: { en: 'The fort', ar: 'الحصن' },
    alive: { en: 'The fort protects you: licences and contracts in place.', ar: 'الحصن يحميك: التراخيص والعقود جاهزة.' },
    features: [
      { en: 'Licences and the authorities that issue them', ar: 'التراخيص والجهات المصدرة لها' },
      { en: 'Lease contracts and their costs', ar: 'عقود الإيجار وتكاليفها' },
    ],
    color: '#d9a066',
    side: '#a8743f',
    pos: [0.6, -4.4],
  },
  {
    levelId: 3,
    place: { en: 'The workshop', ar: 'الورشة' },
    alive: { en: 'Lights, water and power reach your workshop.', ar: 'تصل الكهرباء والماء والإنارة إلى ورشتك.' },
    features: [
      { en: 'Location and rent', ar: 'الموقع والإيجار' },
      { en: 'Utilities and operating hours', ar: 'المرافق وساعات العمل' },
    ],
    color: '#c9a27a',
    side: '#94704c',
    pos: [4.4, -2.6],
  },
  {
    levelId: 4,
    place: { en: 'The storehouse', ar: 'المخزن' },
    alive: { en: 'Equipment and stock arrive by caravan.', ar: 'تصل المعدات والبضائع مع القافلة.' },
    features: [
      { en: 'Equipment and assets', ar: 'المعدات والأصول' },
      { en: 'Raw materials and depreciation', ar: 'المواد الخام والإهلاك' },
    ],
    color: '#b8956a',
    side: '#86663f',
    pos: [6.8, 0.8],
  },
  {
    levelId: 5,
    place: { en: 'The majlis', ar: 'المجلس' },
    alive: { en: 'Your team gathers in the majlis.', ar: 'يجتمع فريقك في المجلس.' },
    features: [
      { en: 'Omanization rate', ar: 'نسبة التعمين' },
      { en: 'Salaries and social protection (14.5%)', ar: 'الرواتب والحماية الاجتماعية (14.5%)' },
    ],
    color: '#a7c27a',
    side: '#748f4c',
    pos: [3.6, 3.6],
  },
  {
    levelId: 6,
    place: { en: 'The palm grove', ar: 'بستان النخيل' },
    alive: { en: 'The palms grow heavy with dates: your money is working.', ar: 'تثمر النخيل بالتمر: أموالك تعمل.' },
    features: [
      { en: 'Profit, NPV, IRR and payback', ar: 'الربح وصافي القيمة الحالية والعائد وفترة الاسترداد' },
      { en: 'Risk simulation: 8,000 possible futures', ar: 'محاكاة المخاطر: 8,000 مستقبل محتمل' },
      { en: 'Omani calendar: Ramadan, Eid, Khareef', ar: 'التقويم العُماني: رمضان والعيد والخريف' },
      { en: 'VAT, tax and financing survival test', ar: 'ضريبة القيمة المضافة والدخل واختبار النجاة المالية' },
      { en: 'National impact score', ar: 'مؤشر الأثر الوطني' },
    ],
    color: '#6fae6a',
    side: '#467e43',
    pos: [-0.6, 5.0],
  },
  {
    levelId: 7,
    place: { en: 'The souq', ar: 'السوق' },
    alive: { en: 'The souq fills with customers.', ar: 'يمتلئ السوق بالزبائن.' },
    features: [
      { en: 'Competitors and SWOT', ar: 'المنافسون وتحليل SWOT' },
      { en: 'Products, prices and revenue', ar: 'المنتجات والأسعار والإيرادات' },
    ],
    color: '#e08f62',
    side: '#ad6239',
    pos: [-4.8, 3.4],
  },
  {
    levelId: -1,
    place: { en: 'The castle', ar: 'القلعة' },
    alive: { en: 'The castle lights up: your full feasibility study is ready.', ar: 'تُضاء القلعة: دراسة الجدوى الكاملة جاهزة.' },
    features: [
      { en: 'Full feasibility report (Arabic / English)', ar: 'تقرير دراسة الجدوى الكامل (عربي / إنجليزي)' },
      { en: 'Certificate', ar: 'الشهادة' },
    ],
    color: '#d6b48a',
    side: '#a3825a',
    pos: [-6.6, 0],
  },
];
