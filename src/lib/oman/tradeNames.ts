// ═══════════════════════════════════════════════════════════════════════════════
// Omani trade-name check
//
// What this file can and cannot do:
// - It screens a proposed name against the published rules for commercial names
//   (Ministerial Decision 124/2016) and against well-known brands.
// - It does NOT know whether a name is registered with the Ministry. Only the
//   Commercial Name Availability service on the Oman Business Platform (Invest
//   Easy, business.gov.om) gives that answer. The UI sends the user there and
//   records the result.
// ═══════════════════════════════════════════════════════════════════════════════

export type NameIssueLevel = 'not_allowed' | 'risky' | 'info';

export interface NameIssue {
  id: string;
  level: NameIssueLevel;
  en: string;
  ar: string;
  /** The word or brand that triggered the issue, if any. */
  match?: string;
}

export interface NameRulesResult {
  issues: NameIssue[];
  /** 'not_allowed' if any rule blocks the name, 'risky' if any warning, else 'ok'. */
  verdict: 'not_allowed' | 'risky' | 'ok';
  normalized: string;
}

export const TRADE_NAME_SOURCE = {
  decision: {
    en: 'Ministerial Decision 124/2016 on commercial names (Ministry of Commerce, Industry and Investment Promotion)',
    ar: 'القرار الوزاري رقم 124/2016 بشأن الأسماء التجارية (وزارة التجارة والصناعة وترويج الاستثمار)',
  },
  official: {
    en: 'Commercial Name Availability service, Oman Business Platform (Invest Easy)',
    ar: 'خدمة التحقق من توفر الاسم التجاري، منصة عُمان للأعمال (استثمر بسهولة)',
    url: 'https://www.business.gov.om',
    pathEn: 'Services → Start a business → Commercial Name Availability',
    pathAr: 'الخدمات ← بدء الأعمال ← التحقق من توفر الاسم التجاري',
  },
  checkedOn: '2026-10-31',
} as const;

/** The rules shown to the user, in the order of the decision's summary. */
export const TRADE_NAME_RULES: { id: string; en: string; ar: string; checked: 'auto' | 'partly' | 'manual' }[] = [
  {
    id: 'oman',
    en: 'No "Oman", "Omani" or its derivatives, except in joint stock companies (SAOG/SAOC).',
    ar: 'لا يُسمح بكلمة "عُمان" أو "عُماني" أو مشتقاتها إلا لشركات المساهمة.',
    checked: 'auto',
  },
  {
    id: 'meaning',
    en: 'No religious, political or military meaning.',
    ar: 'لا يحمل الاسم معنى دينياً أو سياسياً أو عسكرياً.',
    checked: 'partly',
  },
  {
    id: 'similar',
    en: 'Not the same as, or similar to, an existing local or international business.',
    ar: 'لا يطابق أو يشابه اسم منشأة محلية أو دولية قائمة.',
    checked: 'partly',
  },
  {
    id: 'proper',
    en: "A person's name only if it is the owner's or a partner's; no tribe's collective name with \"Al\" (آل).",
    ar: 'لا يُستخدم اسم علم إلا إذا كان اسم المالك أو الشريك، ولا الاسم الجامع لقبيلة مسبوقاً بـ"آل".',
    checked: 'partly',
  },
  {
    id: 'geo',
    en: "Must not misstate Oman's geographic divisions.",
    ar: 'لا يدل على تقسيم جغرافي غير صحيح للسلطنة.',
    checked: 'manual',
  },
];

// ─── Normalisation ─────────────────────────────────────────────────────────────

const AR_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Letters only: unify Arabic letter variants, drop diacritics, lowercase Latin. */
export function normalizeLetters(input: string): string {
  let s = (input || '').normalize('NFKC');
  s = s.replace(AR_DIACRITICS, '');
  s = s
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
  s = s.replace(/[٠-٩]/g, d => String(AR_DIGITS.indexOf(d)));
  s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
  s = s.replace(/[^\p{L}\p{N}\s]/gu, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

/** Words that describe the legal form or are generic; ignored when comparing names. */
const GENERIC_TOKENS = new Set([
  'llc', 'spc', 'saog', 'saoc', 'co', 'company', 'est', 'establishment', 'ltd', 'inc', 'trading', 'the',
  'شركه', 'مؤسسه', 'تجاره', 'للتجاره', 'ش', 'م', 'و',
]);

function stripArticle(token: string): string {
  // Arabic definite article: "القهوه" -> "قهوه". Keep short words intact.
  if (token.startsWith('ال') && token.length > 3) return token.slice(2);
  return token;
}

export interface NameKeys {
  /** Tokens after letter normalisation (article kept). */
  letters: string[];
  /** Tokens with article and generic words removed. */
  core: string[];
  /** Core tokens joined without spaces: the key used to compare names. */
  compact: string;
}

export function nameKeys(input: string): NameKeys {
  const letters = normalizeLetters(input).split(' ').filter(Boolean);
  const core = letters
    .filter(t => t !== 'al' && t !== 'el')
    .map(stripArticle)
    .filter(t => !GENERIC_TOKENS.has(t) && t.length > 0);
  return { letters, core, compact: core.join('') };
}

// ─── Similarity ────────────────────────────────────────────────────────────────

export function levenshtein(a: string, b: string): number {
  const A = Array.from(a);
  const B = Array.from(b);
  if (A.length === 0) return B.length;
  if (B.length === 0) return A.length;
  let prev = Array.from({ length: B.length + 1 }, (_, i) => i);
  for (let i = 1; i <= A.length; i++) {
    const cur = [i];
    for (let j = 1; j <= B.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[B.length];
}

/** 1 = identical, 0 = nothing in common. Compares the compact keys. */
export function nameSimilarity(a: string, b: string): number {
  const ka = nameKeys(a).compact;
  const kb = nameKeys(b).compact;
  if (!ka || !kb) return 0;
  if (ka === kb) return 1;
  const len = Math.max(Array.from(ka).length, Array.from(kb).length);
  return 1 - levenshtein(ka, kb) / len;
}

/** Same threshold the database uses: an edit distance of about one letter in six. */
export function isSimilarName(a: string, b: string): 'same' | 'similar' | null {
  const ka = nameKeys(a).compact;
  const kb = nameKeys(b).compact;
  if (!ka || !kb) return null;
  if (ka === kb) return 'same';
  const la = Array.from(ka).length;
  if (la < 4) return null;
  return levenshtein(ka, kb) <= Math.max(1, Math.floor(la / 6)) ? 'similar' : null;
}

// ─── Word lists ────────────────────────────────────────────────────────────────

/**
 * Words with a religious, political or military meaning (normalised forms).
 * STRICT words almost always mean the name is refused. SOFT words depend on
 * context (for example "سلطان" and "مسلم" are also common first names, and an
 * owner may use their own name), so they are shown as a risk.
 */
const STRICT_MEANING_WORDS: string[] = [
  'allah', 'islam', 'islamic', 'quran', 'koran', 'prophet', 'mosque', 'masjid', 'church', 'jihad',
  'army', 'military', 'navy', 'revolution',
  'الله', 'اسلام', 'اسلامي', 'اسلاميه', 'قران', 'نبي', 'رسول', 'مسجد', 'كنيسه', 'جهاد',
  'جيش', 'عسكري', 'عسكريه', 'حربي', 'سلاح', 'حزب', 'ثوره', 'ثوري',
];
const SOFT_MEANING_WORDS: string[] = [
  'muslim', 'holy', 'hajj', 'makkah', 'mecca', 'police', 'defence', 'defense', 'sultan', 'sultanate',
  'royal', 'government', 'ministry',
  'مسلم', 'مقدس', 'حج', 'مكه', 'شرطه', 'دفاع', 'سلطان', 'سلطاني', 'سلطانيه', 'سلطنه', 'ملكي', 'ملكيه',
  'حكومه', 'حكومي', 'وزاره',
];
const STRICT_SET = new Set(STRICT_MEANING_WORDS.map(w => normalizeLetters(w)));
const SOFT_SET = new Set(SOFT_MEANING_WORDS.map(w => normalizeLetters(w)));

/**
 * Well-known brands in Oman. Arabic forms are only listed when they are not
 * also ordinary Arabic words (so "كريم" and "نون" are left out).
 */
export const WELL_KNOWN_BRANDS: { en: string; ar?: string }[] = [
  { en: 'Omantel', ar: 'عمانتل' },
  { en: 'Ooredoo', ar: 'أوريدو' },
  { en: 'Vodafone', ar: 'فودافون' },
  { en: 'Bank Muscat', ar: 'بنك مسقط' },
  { en: 'Bank Dhofar', ar: 'بنك ظفار' },
  { en: 'Bank Nizwa', ar: 'بنك نزوى' },
  { en: 'Sohar International', ar: 'صحار الدولي' },
  { en: 'Oman Air', ar: 'الطيران العماني' },
  { en: 'Asyad', ar: 'أسياد' },
  { en: 'Lulu', ar: 'لولو' },
  { en: 'Nesto', ar: 'نستو' },
  { en: 'Al Meera', ar: 'الميرة' },
  { en: 'Carrefour', ar: 'كارفور' },
  { en: 'Starbucks', ar: 'ستاربكس' },
  { en: "McDonald's", ar: 'ماكدونالدز' },
  { en: 'KFC', ar: 'كنتاكي' },
  { en: 'Costa', ar: 'كوستا' },
  { en: 'Tim Hortons', ar: 'تيم هورتنز' },
  { en: 'Dunkin', ar: 'دانكن' },
  { en: 'Pizza Hut', ar: 'بيتزا هت' },
  { en: 'Burger King', ar: 'برجر كنج' },
  { en: 'Talabat' },
  { en: 'Apple', ar: 'أبل' },
  { en: 'Google', ar: 'جوجل' },
  { en: 'Amazon', ar: 'أمازون' },
  { en: 'Microsoft', ar: 'مايكروسوفت' },
  { en: 'Samsung', ar: 'سامسونج' },
  { en: 'Tesla', ar: 'تسلا' },
  { en: 'Nike', ar: 'نايكي' },
  { en: 'Adidas', ar: 'أديداس' },
  { en: 'Zara', ar: 'زارا' },
  { en: 'IKEA', ar: 'ايكيا' },
  { en: 'Toyota', ar: 'تويوتا' },
  { en: 'Shell' },
];

const BRAND_KEYS = WELL_KNOWN_BRANDS.flatMap(b =>
  [b.en, b.ar].filter(Boolean).map(form => ({ label: b.en, labelAr: b.ar || b.en, key: nameKeys(form as string).compact }))
).filter(b => b.key.length >= 3);

function findBrand(keys: NameKeys): { label: string; labelAr: string; how: 'same' | 'contains' | 'spelling' } | null {
  const tokens = keys.core;
  for (const b of BRAND_KEYS) {
    if (keys.compact === b.key) return { ...b, how: 'same' };
  }
  for (const b of BRAND_KEYS) {
    // Brand appears as consecutive words inside the name ("Starbucks Nizwa").
    for (let i = 0; i < tokens.length; i++) {
      let joined = '';
      for (let j = i; j < tokens.length && joined.length < b.key.length; j++) {
        joined += tokens[j];
        if (joined === b.key) return { ...b, how: 'contains' };
      }
    }
  }
  for (const b of BRAND_KEYS) {
    // Small spelling changes of longer brands ("Starbuks").
    const bl = Array.from(b.key).length;
    if (bl < 6) continue;
    const limit = Math.max(1, Math.floor(bl / 6));
    if (levenshtein(keys.compact, b.key) <= limit) return { ...b, how: 'spelling' };
    if (tokens.some(t => Array.from(t).length >= 5 && levenshtein(t, b.key) <= limit)) return { ...b, how: 'spelling' };
  }
  return null;
}

// ─── Rules check ───────────────────────────────────────────────────────────────

export function checkTradeName(name: string): NameRulesResult {
  const raw = (name || '').trim();
  const keys = nameKeys(raw);
  const issues: NameIssue[] = [];

  if (!raw) return { issues, verdict: 'ok', normalized: '' };

  const letterCount = Array.from(keys.letters.join('')).filter(ch => /\p{L}/u.test(ch)).length;
  if (letterCount < 2) {
    issues.push({
      id: 'short',
      level: 'risky',
      en: 'The name has almost no letters. A trade name needs words, not only numbers or symbols.',
      ar: 'الاسم يكاد يخلو من الحروف. الاسم التجاري يحتاج إلى كلمات وليس أرقاماً أو رموزاً فقط.',
    });
  }

  // Rule: Oman / Omani
  const omanWord = keys.letters.find(t => /^(ال)?عمان(ي|يه|يون|يين|ين|يات)?$/.test(t) || /^omani?(ya|yah|iya|iyah|ia)?$/.test(t));
  const omanPart = !omanWord && keys.letters.find(t => (/^(ال)?عمان/.test(t) && t.length > 4) || (t.startsWith('oman') && t.length > 4));
  if (omanWord) {
    issues.push({
      id: 'oman',
      level: 'not_allowed',
      match: omanWord,
      en: '"Oman" or "Omani" can only be used by joint stock companies (SAOG/SAOC). A new small business would be refused.',
      ar: 'كلمة "عُمان" أو "عُماني" مسموحة لشركات المساهمة فقط. سيُرفض الاسم لمشروع صغير جديد.',
    });
  } else if (omanPart) {
    issues.push({
      id: 'oman',
      level: 'risky',
      match: omanPart,
      en: 'The name contains "Oman" inside a word. The rules also cover derivatives of "Oman", so it may be refused.',
      ar: 'الاسم يحتوي على "عمان" داخل كلمة. القواعد تشمل مشتقات كلمة "عُمان"، لذلك قد يُرفض.',
    });
  }

  // Rule: religious, political or military meaning
  const strict = keys.letters.find(t => STRICT_SET.has(t) || STRICT_SET.has(stripArticle(t)));
  const soft = !strict && keys.letters.find(t => SOFT_SET.has(t) || SOFT_SET.has(stripArticle(t)));
  if (strict) {
    issues.push({
      id: 'meaning',
      level: 'not_allowed',
      match: strict,
      en: `"${strict}" has a religious, political or military meaning. Names like this are not allowed.`,
      ar: `كلمة "${strict}" تحمل معنى دينياً أو سياسياً أو عسكرياً. هذه الأسماء غير مسموحة.`,
    });
  } else if (soft) {
    issues.push({
      id: 'meaning',
      level: 'risky',
      match: soft,
      en: `"${soft}" can carry a religious, political or official meaning, so the name may be refused. If it is the owner's own name, that is usually accepted.`,
      ar: `كلمة "${soft}" قد تحمل معنى دينياً أو سياسياً أو رسمياً، لذلك قد يُرفض الاسم. إذا كانت اسم المالك نفسه فهذا مقبول عادةً.`,
    });
  }

  // Rule: similar to an existing business (well-known brands only)
  const brand = findBrand(keys);
  if (brand) {
    const same = brand.how === 'same';
    issues.push({
      id: 'similar',
      level: same ? 'not_allowed' : 'risky',
      match: brand.label,
      en: same
        ? `This is the name of the well-known brand "${brand.label}". Names of existing businesses are not allowed.`
        : brand.how === 'contains'
          ? `The name contains the well-known brand "${brand.label}". It may be refused, and the brand owner can object.`
          : `The name is spelled almost like the well-known brand "${brand.label}". It may be refused, and the brand owner can object.`,
      ar: same
        ? `هذا اسم العلامة المعروفة "${brand.labelAr}". لا يُسمح بأسماء المنشآت القائمة.`
        : brand.how === 'contains'
          ? `الاسم يحتوي على العلامة المعروفة "${brand.labelAr}". قد يُرفض، ويحق لصاحب العلامة الاعتراض.`
          : `الاسم مكتوب بشكل قريب جداً من العلامة المعروفة "${brand.labelAr}". قد يُرفض، ويحق لصاحب العلامة الاعتراض.`,
    });
  }

  // Rule: tribe's collective name with "آل"
  if (/(^|\s)آل\s+\S/.test(raw.normalize('NFC'))) {
    issues.push({
      id: 'proper',
      level: 'not_allowed',
      en: 'A tribe\'s or family\'s collective name with "آل" cannot be used as a trade name.',
      ar: 'لا يجوز استخدام الاسم الجامع لقبيلة أو عائلة مسبوقاً بـ"آل" اسماً تجارياً.',
    });
  }

  const verdict: NameRulesResult['verdict'] = issues.some(i => i.level === 'not_allowed')
    ? 'not_allowed'
    : issues.some(i => i.level === 'risky')
      ? 'risky'
      : 'ok';

  return { issues, verdict, normalized: keys.compact };
}

// ─── Naming tips (not rules) ───────────────────────────────────────────────────

export interface NamingTip {
  id: string;
  en: string;
  ar: string;
}

/** Simple, explainable tips. These are advice, not legal checks and not AI. */
export function namingTips(name: string): NamingTip[] {
  const raw = (name || '').trim();
  if (!raw) return [];
  const keys = nameKeys(raw);
  const tips: NamingTip[] = [];
  const words = keys.letters.length;
  const length = Array.from(raw).length;

  if (length > 30 || words > 5) {
    tips.push({
      id: 'long',
      en: 'Long names are hard to remember and to fit on a sign. Two or three words is usually enough.',
      ar: 'الأسماء الطويلة صعبة الحفظ وصعبة الكتابة على اللوحة. كلمتان أو ثلاث تكفي غالباً.',
    });
  }
  if (keys.core.length > 0 && keys.core.every(t => GENERIC_DESCRIPTIVE.has(t))) {
    tips.push({
      id: 'generic',
      en: 'The name only describes the activity ("coffee", "trading"). Many businesses use the same words, so a distinctive word helps people find you.',
      ar: 'الاسم يصف النشاط فقط (مثل "قهوة" أو "تجارة"). كثير من المحلات تستخدم الكلمات نفسها، والكلمة المميزة تساعد الناس على إيجادك.',
    });
  }
  if (/\d/.test(raw)) {
    tips.push({
      id: 'digits',
      en: 'Numbers in a name are often misheard or misspelled. Consider writing them as words.',
      ar: 'الأرقام في الاسم تُسمع وتُكتب بشكل خاطئ أحياناً. فكّر في كتابتها بالحروف.',
    });
  }
  const hasArabic = /[؀-ۿ]/.test(raw);
  const hasLatin = /[A-Za-z]/.test(raw);
  if (!hasArabic) {
    tips.push({
      id: 'arabic',
      en: 'Most customers and official papers in Oman use Arabic, so check how the name sounds and is written in Arabic.',
      ar: 'معظم الزبائن والأوراق الرسمية في عُمان بالعربية، فتأكد من نطق الاسم وكتابته بالعربية.',
    });
  } else if (!hasLatin) {
    tips.push({
      id: 'english',
      en: 'Decide how the name will be written in English, for your sign, social media and website.',
      ar: 'حدّد كيف سيُكتب الاسم بالإنجليزية للوحة ووسائل التواصل والموقع الإلكتروني.',
    });
  }
  return tips;
}

const GENERIC_DESCRIPTIVE = new Set(
  [
    'coffee', 'cafe', 'specialty', 'speciality', 'shop', 'store', 'market', 'restaurant', 'services', 'service', 'center', 'centre',
    'trading', 'general', 'kiosk', 'corner', 'food', 'foods', 'bakery', 'salon', 'workshop', 'garage',
    'قهوه', 'كافيه', 'مقهي', 'محل', 'متجر', 'سوق', 'مطعم', 'خدمات', 'مركز', 'عام', 'عامه', 'كشك', 'ركن',
    'زاويه', 'اغذيه', 'مخبز', 'صالون', 'ورشه', 'كراج', 'مختصه',
  ].map(w => stripArticle(normalizeLetters(w)))
);

// ─── Official check record ─────────────────────────────────────────────────────

export type OfficialNameStatus = 'not_checked' | 'available' | 'taken';

export interface NameCheckRecord {
  name: string;
  rules: NameRulesResult['verdict'];
  ruleIssues: string[];
  yieldx: { own: number; others: number | null; checkedAt: string };
  official: { status: OfficialNameStatus; date?: string; note?: string };
}
