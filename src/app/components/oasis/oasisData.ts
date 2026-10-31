// The study journey as a living Nizwa valley. Levels keep their real names;
// each finished level changes something in the valley, and the panel lists
// what the level gives the user.

export type SpotKey = 'spring' | 'shop' | 'fort' | 'road' | 'workshop' | 'village' | 'gardens' | 'souq' | 'tower';

export interface ValleyLevel {
  levelId: number; // -1 = the full study
  spot: SpotKey;
  /** Height of the marker above the ground at that spot. */
  markerY: number;
  change: { en: string; ar: string };
  features: { en: string; ar: string }[];
}

export const VALLEY_LEVELS: ValleyLevel[] = [
  {
    levelId: 0,
    spot: 'spring',
    markerY: 2.2,
    change: { en: 'The spring opens and water starts to flow down the falaj.', ar: 'تتفجر العين ويبدأ الماء بالجريان في الفلج.' },
    features: [
      { en: 'Choose your sector', ar: 'اختيار قطاع المشروع' },
      { en: 'Try a complete example study', ar: 'تجربة دراسة جدوى كاملة جاهزة' },
    ],
  },
  {
    levelId: 1,
    spot: 'shop',
    markerY: 3.2,
    change: { en: 'Your shop opens in the old quarter, with your business name on the sign.', ar: 'يُفتتح محلك في الحارة القديمة، واسم مشروعك على اللوحة.' },
    features: [
      { en: 'Omani trade-name check (rules + Invest Easy)', ar: 'فحص الاسم التجاري العُماني (القواعد + استثمر بسهولة)' },
      { en: 'Owners and shares', ar: 'الملاك ونسب الملكية' },
    ],
  },
  {
    levelId: 2,
    spot: 'fort',
    markerY: 4.6,
    change: { en: 'The fort gate opens and the flag rises: you are licensed and protected.', ar: 'تُفتح بوابة الحصن ويرتفع العلم: أصبحت مرخصاً ومحمياً.' },
    features: [
      { en: 'Licences and the authorities that issue them', ar: 'التراخيص والجهات المصدرة لها' },
      { en: 'Lease contracts and their costs', ar: 'عقود الإيجار وتكاليفها' },
    ],
  },
  {
    levelId: 3,
    spot: 'road',
    markerY: 2.2,
    change: { en: 'The road is paved and the street lamps come on.', ar: 'يُرصف الطريق وتُضاء أعمدة الإنارة.' },
    features: [
      { en: 'Location and rent', ar: 'الموقع والإيجار' },
      { en: 'Utilities and operating hours', ar: 'المرافق وساعات العمل' },
    ],
  },
  {
    levelId: 4,
    spot: 'workshop',
    markerY: 3.0,
    change: { en: 'Your workshop is built and trucks deliver the equipment.', ar: 'تُبنى ورشتك وتصل الشاحنات بالمعدات.' },
    features: [
      { en: 'Equipment and assets', ar: 'المعدات والأصول' },
      { en: 'Raw materials and depreciation', ar: 'المواد الخام والإهلاك' },
    ],
  },
  {
    levelId: 5,
    spot: 'village',
    markerY: 3.2,
    change: { en: 'People fill the lanes: your team is in place.', ar: 'تمتلئ السكك بالناس: فريقك جاهز.' },
    features: [
      { en: 'Omanization rate', ar: 'نسبة التعمين' },
      { en: 'Salaries and social protection (14.5%)', ar: 'الرواتب والحماية الاجتماعية (14.5%)' },
    ],
  },
  {
    levelId: 6,
    spot: 'gardens',
    markerY: 3.4,
    change: { en: 'The palm gardens turn green and heavy with dates: your money is working.', ar: 'تخضرّ بساتين النخيل وتثمر بالتمر: أموالك تعمل.' },
    features: [
      { en: 'Profit, NPV, IRR and payback', ar: 'الربح وصافي القيمة الحالية والعائد وفترة الاسترداد' },
      { en: 'Risk simulation: 8,000 possible futures', ar: 'محاكاة المخاطر: 8,000 مستقبل محتمل' },
      { en: 'Omani calendar: Ramadan, Eid, Khareef', ar: 'التقويم العُماني: رمضان والعيد والخريف' },
      { en: 'VAT, tax and financing survival test', ar: 'ضريبة القيمة المضافة والدخل واختبار النجاة المالية' },
      { en: 'National impact score', ar: 'مؤشر الأثر الوطني' },
    ],
  },
  {
    levelId: 7,
    spot: 'souq',
    markerY: 2.6,
    change: { en: 'The souq is busy with customers and cars.', ar: 'يزدحم السوق بالزبائن والسيارات.' },
    features: [
      { en: 'Competitors and SWOT', ar: 'المنافسون وتحليل SWOT' },
      { en: 'Products, prices and revenue', ar: 'المنتجات والأسعار والإيرادات' },
    ],
  },
  {
    levelId: -1,
    spot: 'tower',
    markerY: 2.6,
    change: { en: 'Night falls, the valley lights up and fireworks rise over the fort: your full study is ready.', ar: 'يحل الليل وتُضاء الوادي وتنطلق الألعاب النارية فوق الحصن: دراستك الكاملة جاهزة.' },
    features: [
      { en: 'Full feasibility report (Arabic / English)', ar: 'تقرير دراسة الجدوى الكامل (عربي / إنجليزي)' },
      { en: 'Certificate', ar: 'الشهادة' },
    ],
  },
];
