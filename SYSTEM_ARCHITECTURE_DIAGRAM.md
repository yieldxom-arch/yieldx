# 🎨 **YieldX System Architecture - Visual Diagrams**

## **Complete System Overview with Visual Representations**

---

## 📐 **1. OVERALL SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YieldX PLATFORM                              │
│                     Full-Stack Architecture                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼──────┐         ┌────────▼────────┐      ┌────────▼────────┐
│   FRONTEND   │         │     BACKEND     │      │   STORAGE       │
│   (React)    │◄───────►│   (Supabase)    │◄────►│  (Database)     │
└──────────────┘         └─────────────────┘      └─────────────────┘
     │                            │                         │
     │                            │                         │
┌────▼────────────┐    ┌─────────▼──────────┐   ┌─────────▼─────────┐
│  UI Components  │    │  Authentication    │   │  PostgreSQL DB    │
│  • Space Map    │    │  • JWT Tokens      │   │  • users          │
│  • 8 Levels     │    │  • bcrypt Hash     │   │  • profiles       │
│  • Dashboard    │    │  • RLS Policies    │   │  • progress       │
│  • Forms        │    │                    │   │  • module_data    │
└─────────────────┘    └────────────────────┘   └───────────────────┘
     │                            │                         │
┌────▼────────────┐    ┌─────────▼──────────┐   ┌─────────▼─────────┐
│  State Mgmt     │    │  API Layer         │   │  localStorage     │
│  • Context API  │    │  • REST API        │   │  • Offline Cache  │
│  • useState     │    │  • Real-time       │   │  • Auto-save      │
│  • useEffect    │    │  • Subscriptions   │   │  • Preferences    │
└─────────────────┘    └────────────────────┘   └───────────────────┘
     │                            │                         │
┌────▼────────────┐    ┌─────────▼──────────┐   ┌─────────▼─────────┐
│  AI Features    │    │  Security          │   │  Backup System    │
│  • Name Check   │    │  • HTTPS/TLS       │   │  • Auto Backups   │
│  • SWOT AI      │    │  • Row Security    │   │  • Point-in-time  │
│  • BMC Suggest  │    │  • Input Validate  │   │  • Recovery       │
└─────────────────┘    └────────────────────┘   └───────────────────┘
```

---

## 🔄 **2. USER AUTHENTICATION FLOW**

```
                    ┌──────────────────────────────┐
                    │   User Opens YieldX App      │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │   Check localStorage         │
                    │   for saved session          │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │   Session Found?             │
                    └──────────┬───────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
           ┌────▼────┐                 ┌──────▼──────┐
           │   YES   │                 │     NO      │
           └────┬────┘                 └──────┬──────┘
                │                             │
        ┌───────▼────────┐            ┌───────▼────────────┐
        │ Auto-Login     │            │ Show Login Screen  │
        │ • Load user    │            │ • Email input      │
        │ • Verify token │            │ • Password input   │
        │ • Fetch data   │            │ • Role selection   │
        └───────┬────────┘            └───────┬────────────┘
                │                             │
                │                     ┌───────▼────────────┐
                │                     │ User Submits       │
                │                     │ Credentials        │
                │                     └───────┬────────────┘
                │                             │
                │                  ┌──────────▼─────────────┐
                │                  │ Supabase Auth API      │
                │                  │ • Find user by email   │
                │                  │ • Compare password     │
                │                  │   (bcrypt.compare)     │
                │                  │ • Verify role          │
                │                  └──────────┬─────────────┘
                │                             │
                │                  ┌──────────▼─────────────┐
                │                  │ Password Match?        │
                │                  └──────────┬─────────────┘
                │                             │
                │              ┌──────────────┴──────────────┐
                │              │                             │
                │         ┌────▼────┐                 ┌──────▼──────┐
                │         │   YES   │                 │     NO      │
                │         └────┬────┘                 └──────┬──────┘
                │              │                             │
                │    ┌─────────▼────────────┐       ┌────────▼────────┐
                │    │ Generate JWT Token   │       │ Show Error      │
                │    │ • Create session     │       │ • Display demo  │
                │    │ • Save to storage    │       │   accounts      │
                │    └─────────┬────────────┘       │ • Retry option  │
                │              │                    └─────────────────┘
                └──────────────┴─────────────┐
                                             │
                                  ┌──────────▼───────────────┐
                                  │ Load User Dashboard      │
                                  │ • Fetch progress         │
                                  │ • Load modules           │
                                  │ • Set language/theme     │
                                  └──────────────────────────┘
```

---

## 💾 **3. DATA STORAGE HIERARCHY**

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA STORAGE LAYERS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LAYER 1: PERMANENT STORAGE (Supabase PostgreSQL)              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━              │
│  ┌──────────────┬──────────────┬──────────────────┐            │
│  │   users      │  profiles    │ student_progress │            │
│  ├──────────────┼──────────────┼──────────────────┤            │
│  │ • id (UUID)  │ • user_id    │ • user_id        │            │
│  │ • email      │ • full_name  │ • current_level  │            │
│  │ • password   │ • avatar_url │ • total_xp       │            │
│  │ • role       │ • bio        │ • badges_earned  │            │
│  │ • created_at │ • metadata   │ • achievements   │            │
│  └──────────────┴──────────────┴──────────────────┘            │
│                                                                 │
│  ┌──────────────┬──────────────┬──────────────────┐            │
│  │ module_data  │ project_type │   cohorts        │            │
│  ├──────────────┼──────────────┼──────────────────┤            │
│  │ • user_id    │ • user_id    │ • id             │            │
│  │ • level_id   │ • type       │ • teacher_id     │            │
│  │ • data (JSON)│ • name       │ • name           │            │
│  │ • updated_at │ • sector     │ • students[]     │            │
│  └──────────────┴──────────────┴──────────────────┘            │
│                                                                 │
│  LAYER 2: CACHE STORAGE (Browser localStorage)                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━              │
│  ┌────────────────────────────────────────────────┐            │
│  │ Key                    │ Value                 │            │
│  ├────────────────────────┼───────────────────────┤            │
│  │ yieldx_user            │ {id, email, role}     │            │
│  │ yieldx_moduleData      │ {level0: {...}, ...}  │            │
│  │ yieldx_levels          │ [{levelId, xp, ...}]  │            │
│  │ yieldx_theme           │ "dark" | "light"      │            │
│  │ yieldx_language        │ "ar" | "en"           │            │
│  │ yieldx_projectType     │ {type, name, sector}  │            │
│  └────────────────────────┴───────────────────────┘            │
│                                                                 │
│  LAYER 3: RUNTIME STATE (React Context/State)                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━              │
│  ┌────────────────────────────────────────────────┐            │
│  │ YieldXContext Provides:                        │            │
│  │ • user (current logged-in user)                │            │
│  │ • language (ar/en)                             │            │
│  │ • theme (dark/light)                           │            │
│  │ • currentView (which page to show)             │            │
│  │ • levels (progress array)                      │            │
│  │ • moduleData (form data)                       │            │
│  └────────────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 **4. AI SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────┐
│                   AI INTELLIGENCE SYSTEMS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AI SYSTEM 1: BUSINESS NAME INTELLIGENCE                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       │
│                                                                 │
│  User Types: "TechHub"                                          │
│       ↓                                                         │
│  ┌────────────────────────────────────────┐                    │
│  │  Layer 1: Platform Availability Check  │                    │
│  │  • Query: Does "TechHub" exist in DB?  │                    │
│  │  • Output: ✅ Available / ❌ Taken     │                    │
│  └────────────┬───────────────────────────┘                    │
│               ↓                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Layer 2: Global Awareness Analysis    │                    │
│  │  • Check: Geographic name?             │                    │
│  │  • Check: Famous brand pattern?        │                    │
│  │  • Check: Common generic word?         │                    │
│  │  • Output: Unique / Common / Similar   │                    │
│  └────────────┬───────────────────────────┘                    │
│               ↓                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Layer 3: Brand Score Calculator       │                    │
│  │  Algorithm:                            │                    │
│  │  • Length: 5-10 chars = +2.0           │                    │
│  │  • Vowel ratio: 30-50% = +1.5          │                    │
│  │  • Uniqueness check                    │                    │
│  │  • Pronounceability check              │                    │
│  │  • Penalties: special chars, numbers   │                    │
│  │  • Output: Score 1.0-10.0              │                    │
│  └────────────┬───────────────────────────┘                    │
│               ↓                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Layer 4: Feedback Generator           │                    │
│  │  If score >= 8.5:                      │                    │
│  │    EN: "Excellent name!"               │                    │
│  │    AR: "اسم ممتاز!"                    │                    │
│  │  If score < 5.5:                       │                    │
│  │    EN: "Weak: too generic"             │                    │
│  │    AR: "ضعيف: عام جداً"                │                    │
│  └────────────┬───────────────────────────┘                    │
│               ↓                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Layer 5: Smart Suggestions            │                    │
│  │  Suffix variants:                      │                    │
│  │    EN: TechHubLabs, TechHubPro, ...    │                    │
│  │    AR: تك هببرو، تك هببلس، ...         │                    │
│  │  Prefix variants:                      │                    │
│  │    EN: GetTechHub, TryTechHub, ...     │                    │
│  │    AR: احصل على تك هب، جرب تك هب       │                    │
│  └────────────┬───────────────────────────┘                    │
│               ↓                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Layer 6: Domain Suggestions           │                    │
│  │  • techhub.com                         │                    │
│  │  • gettechhub.com                      │                    │
│  │  • techhub.io                          │                    │
│  │  • techhub.om                          │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
│  AI SYSTEM 2: SECTOR-SPECIFIC INTELLIGENCE                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       │
│                                                                 │
│  User Selects: "Agricultural Project"                          │
│       ↓                                                         │
│  ┌────────────────────────────────────────┐                    │
│  │  Configuration Loader                  │                    │
│  │  Load: SECTOR_CONFIG['agricultural']   │                    │
│  └────────────┬───────────────────────────┘                    │
│               ↓                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Conditional Fields Injector           │                    │
│  │  Show fields:                          │                    │
│  │  • Land size (hectares)                │                    │
│  │  • Crop type (required)                │                    │
│  │  • Irrigation method                   │                    │
│  │  • Seasonal cycles                     │                    │
│  │  Hide fields:                          │                    │
│  │  • Production capacity (industrial)    │                    │
│  │  • Service hours (service sector)      │                    │
│  └────────────┬───────────────────────────┘                    │
│               ↓                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  SWOT Auto-Suggestions                 │                    │
│  │  Strengths:                            │                    │
│  │  • "Organic farming methods"           │                    │
│  │  • "Government subsidies available"    │                    │
│  │  Weaknesses:                           │                    │
│  │  • "Seasonal income fluctuations"      │                    │
│  │  • "Weather dependency"                │                    │
│  └────────────┬───────────────────────────┘                    │
│               ↓                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Industry Benchmarks                   │                    │
│  │  • Profit margin: 10-25% (typical 15%) │                    │
│  │  • Payback period: 2-5 years           │                    │
│  │  • Working capital: 20-30% of costs    │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌍 **5. BILINGUAL LANGUAGE SYSTEM**

```
┌─────────────────────────────────────────────────────────────────┐
│              LANGUAGE SWITCHING ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Clicks: 🇬🇧 English  →  🇦🇪 العربية                       │
│       ↓                                                         │
│  ┌──────────────────────────────────────┐                      │
│  │  YieldXContext Updates               │                      │
│  │  setLanguage('ar')                   │                      │
│  └──────────┬───────────────────────────┘                      │
│             ↓                                                   │
│  ┌──────────────────────────────────────┐                      │
│  │  Save to localStorage                │                      │
│  │  localStorage.setItem(               │                      │
│  │    'yieldx_language', 'ar'           │                      │
│  │  )                                   │                      │
│  └──────────┬───────────────────────────┘                      │
│             ↓                                                   │
│  ┌──────────────────────────────────────┐                      │
│  │  React Re-render Triggered           │                      │
│  │  All components receive:             │                      │
│  │  language = 'ar'                     │                      │
│  └──────────┬───────────────────────────┘                      │
│             ↓                                                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  Component Translation Objects Update                │       │
│  │                                                      │       │
│  │  const t = {                                         │       │
│  │    // Before (English):                             │       │
│  │    title: 'Dashboard'                               │       │
│  │    login: 'Login'                                   │       │
│  │    save: 'Save & Continue'                          │       │
│  │                                                      │       │
│  │    // After (Arabic):                               │       │
│  │    title: 'لوحة التحكم'                             │       │
│  │    login: 'تسجيل الدخول'                            │       │
│  │    save: 'حفظ والمتابعة'                            │       │
│  │  }                                                   │       │
│  └─────────┬───────────────────────────────────────────┘       │
│            ↓                                                    │
│  ┌──────────────────────────────────────┐                      │
│  │  RTL (Right-to-Left) Applied         │                      │
│  │  <div dir="rtl">                     │                      │
│  │    Text flows: ← right to left       │                      │
│  │    Alignment: text-right             │                      │
│  │  </div>                              │                      │
│  └──────────┬───────────────────────────┘                      │
│             ↓                                                   │
│  ┌──────────────────────────────────────┐                      │
│  │  AI System Switches Language         │                      │
│  │  • Name suggestions: Arabic suffixes │                      │
│  │  • Feedback: Arabic messages         │                      │
│  │  • SWOT: Arabic templates            │                      │
│  └──────────┬───────────────────────────┘                      │
│             ↓                                                   │
│  ┌──────────────────────────────────────┐                      │
│  │  UI Fully Rendered in Arabic         │                      │
│  │  • Labels: ✅ Arabic                 │                      │
│  │  • Forms: ✅ Arabic                  │                      │
│  │  • AI: ✅ Arabic                     │                      │
│  │  • Direction: ✅ RTL                 │                      │
│  │  Time: < 100ms (instant)             │                      │
│  └──────────────────────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💫 **6. USER JOURNEY FLOW**

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT USER JOURNEY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  START: User visits YieldX.com                                  │
│    ↓                                                            │
│  ┌────────────────────────────────┐                            │
│  │  Landing Page (HomePage)       │                            │
│  │  • "Get Started" button        │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Auth Choice Modal             │                            │
│  │  Options:                      │                            │
│  │  1. Login                      │                            │
│  │  2. Sign Up                    │                            │
│  │  3. Try Demo                   │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  User Selects: "Login"         │                            │
│  │  • Enter: demo.student@...     │                            │
│  │  • Password: demo123           │                            │
│  │  • Role: Student               │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Authentication Success        │                            │
│  │  • JWT token created           │                            │
│  │  • Session saved               │                            │
│  │  • Redirect to dashboard       │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Student Dashboard Loads       │                            │
│  │  Components:                   │                            │
│  │  • Space-themed background     │                            │
│  │  • Top nav (profile, language) │                            │
│  │  • XP bar & level indicator    │                            │
│  │  • Quick stats cards           │                            │
│  │  • "View Space Map" button     │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  User Clicks: "View Space Map" │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Space Map View                │                            │
│  │  • Animated galaxy background  │                            │
│  │  • 8 planets (Levels 0-7)      │                            │
│  │  • Orbital paths               │                            │
│  │  • Progress indicators         │                            │
│  │  • "Start" on Level 0          │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Level 0: Project Type         │                            │
│  │  User selects:                 │                            │
│  │  ○ Agricultural                │                            │
│  │  ● Industrial    ✓             │                            │
│  │  ○ Commercial                  │                            │
│  │  ○ Service                     │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  AI Configuration Loads        │                            │
│  │  • Industrial sector selected  │                            │
│  │  • Custom fields enabled       │                            │
│  │  • Validation rules set        │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Level 1: Identity & Ownership │                            │
│  │  Forms:                        │                            │
│  │  • Business Name [AI Check]    │                            │
│  │  • Project Idea                │                            │
│  │  • Product Description         │                            │
│  │  • Owners/Shareholders         │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  AI Name Checker Runs          │                            │
│  │  Input: "TechMetal Industries" │                            │
│  │  Output:                       │                            │
│  │  • Score: 7.8/10               │                            │
│  │  • Status: Unique              │                            │
│  │  • Suggestions shown           │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Auto-Save Active              │                            │
│  │  Every keystroke →             │                            │
│  │  localStorage updated          │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  User Clicks: "Save & Continue"│                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Validation & Save Process     │                            │
│  │  • Validate required fields ✓  │                            │
│  │  • Save to Supabase ✓          │                            │
│  │  • Award 150 XP ✓              │                            │
│  │  • Update progress ✓           │                            │
│  │  • Show success toast ✓        │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Return to Space Map           │                            │
│  │  Level 1 now shows: ✓ Complete │                            │
│  │  Level 2 now: 🔓 Unlocked      │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  Continue through Levels 2-7   │                            │
│  │  • Level 2: Technical Specs    │                            │
│  │  • Level 3: HR & Operations    │                            │
│  │  • Level 4: Assets & Equipment │                            │
│  │  • Level 5: Market & Strategy  │                            │
│  │  • Level 6: Financial KPIs     │                            │
│  │  • Level 7: BMC & Final Plan   │                            │
│  └──────────┬─────────────────────┘                            │
│             ↓                                                   │
│  ┌────────────────────────────────┐                            │
│  │  All Levels Complete! 🎉       │                            │
│  │  • Badge unlocked              │                            │
│  │  • Certificate generated       │                            │
│  │  • Business plan ready         │                            │
│  │  • Export as PDF available     │                            │
│  └────────────────────────────────┘                            │
│                                                                 │
│  END: Student successfully creates full business plan          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 **7. DATA SYNC ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────┐
│                  DATA SYNCHRONIZATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SCENARIO 1: User Types in Form Field                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                              │
│                                                                 │
│  User types: "My Business Name"                                │
│       ↓                                                         │
│  React State Updates (useState)                                │
│  setBusinessName("My Business Name")                           │
│       ↓                                                         │
│  useEffect Detects Change                                      │
│  [businessName] dependency triggers                            │
│       ↓                                                         │
│  Auto-Save Function Runs                                       │
│  updateModuleData('level1', {...})                             │
│       ↓                                                         │
│  localStorage.setItem(...)  ← INSTANT (< 5ms)                  │
│  • Key: yieldx_moduleData                                      │
│  • Value: {level1: {businessName: "..."}}                      │
│       ↓                                                         │
│  [DEFERRED] Supabase sync queued                               │
│  Waits for manual save or batch sync                           │
│                                                                 │
│  ─────────────────────────────────────────────────             │
│                                                                 │
│  SCENARIO 2: User Clicks "Save & Continue"                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       │
│                                                                 │
│  User clicks button                                            │
│       ↓                                                         │
│  Validate Form Data                                            │
│  if (missingFields) → Show errors                              │
│  if (allGood) → Continue ↓                                     │
│       ↓                                                         │
│  Save to localStorage (instant backup)                         │
│       ↓                                                         │
│  ┌──────────────────────────────────────┐                      │
│  │  Supabase API Call                   │                      │
│  │  await supabase                      │                      │
│  │    .from('module_data')              │                      │
│  │    .upsert({                         │                      │
│  │      user_id: user.id,               │                      │
│  │      level_id: 1,                    │                      │
│  │      data: moduleData                │                      │
│  │    })                                │                      │
│  └──────────┬───────────────────────────┘                      │
│             ↓                                                   │
│  Database Row Updated/Inserted                                 │
│  (~ 100-300ms network latency)                                 │
│             ↓                                                   │
│  Update Progress Table                                         │
│  • Increment XP: +150                                          │
│  • Mark level complete: true                                   │
│  • Check badge triggers                                        │
│             ↓                                                   │
│  Return Success Response                                       │
│  { success: true, xp: 150 }                                    │
│             ↓                                                   │
│  Show Success Toast                                            │
│  "✅ Saved successfully!"                                      │
│             ↓                                                   │
│  Redirect to Space Map                                         │
│                                                                 │
│  ─────────────────────────────────────────────────             │
│                                                                 │
│  SCENARIO 3: Cross-Device Sync                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       │
│                                                                 │
│  Device A (Laptop): User completes Level 1                     │
│       ↓                                                         │
│  Saves to Supabase → level1_data stored                        │
│       ↓                                                         │
│  Device B (Phone): User logs in                                │
│       ↓                                                         │
│  ┌──────────────────────────────────────┐                      │
│  │  Fetch Latest Data from Supabase     │                      │
│  │  WHERE user_id = current_user        │                      │
│  └──────────┬───────────────────────────┘                      │
│             ↓                                                   │
│  Receives: level1_data (from Laptop)                           │
│       ↓                                                         │
│  Updates localStorage on Phone                                 │
│       ↓                                                         │
│  User sees same progress ✓                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 **8. SECURITY ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LAYER 1: TRANSPORT LAYER SECURITY (TLS)                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
│  ┌────────────────────────────────────────────┐                │
│  │  https://yieldx.com                        │                │
│  │  ↓                                         │                │
│  │  TLS 1.3 Encryption                        │                │
│  │  • All data encrypted in transit           │                │
│  │  • No plain text passwords over network    │                │
│  │  • Certificate validated                   │                │
│  └────────────────────────────────────────────┘                │
│                                                                 │
│  LAYER 2: AUTHENTICATION SECURITY                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
│  ┌────────────────────────────────────────────┐                │
│  │  User Password: "demo123"                  │                │
│  │       ↓                                    │                │
│  │  bcrypt Hash (10 rounds)                   │                │
│  │  $2b$10$xyz...abc (stored in DB)           │                │
│  │       ↓                                    │                │
│  │  Login Attempt: "demo123"                  │                │
│  │       ↓                                    │                │
│  │  bcrypt.compare(input, stored_hash)        │                │
│  │       ↓                                    │                │
│  │  Match? → Generate JWT token              │                │
│  │  No match? → Reject login                 │                │
│  └────────────────────────────────────────────┘                │
│                                                                 │
│  LAYER 3: SESSION MANAGEMENT                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
│  ┌────────────────────────────────────────────┐                │
│  │  JWT Token Structure:                      │                │
│  │  {                                         │                │
│  │    header: { alg: "HS256", type: "JWT" }   │                │
│  │    payload: {                              │                │
│  │      user_id: "uuid-123",                  │                │
│  │      role: "student",                      │                │
│  │      exp: 1234567890 (24hr expiry)         │                │
│  │    }                                       │                │
│  │    signature: "signed_hash..."             │                │
│  │  }                                         │                │
│  │       ↓                                    │                │
│  │  Stored in: localStorage                   │                │
│  │  Validated: Every API request              │                │
│  └────────────────────────────────────────────┘                │
│                                                                 │
│  LAYER 4: DATABASE SECURITY (RLS)                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
│  ┌────────────────────────────────────────────┐                │
│  │  Row Level Security Policy:                │                │
│  │                                            │                │
│  │  CREATE POLICY "student_own_data"          │                │
│  │  ON student_progress                       │                │
│  │  FOR SELECT                                │                │
│  │  USING (auth.uid() = user_id);             │                │
│  │       ↓                                    │                │
│  │  Student A (ID: 111)                       │                │
│  │  SELECT * FROM student_progress            │                │
│  │  → Returns ONLY rows where user_id = 111  │                │
│  │       ↓                                    │                │
│  │  Cannot see Student B's data (ID: 222)     │                │
│  │  ✅ Data isolation enforced at DB level   │                │
│  └────────────────────────────────────────────┘                │
│                                                                 │
│  LAYER 5: INPUT VALIDATION                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
│  ┌────────────────────────────────────────────┐                │
│  │  Frontend Validation:                      │                │
│  │  • Email format check                      │                │
│  │  • Password strength requirements          │                │
│  │  • Required field checks                   │                │
│  │  • XSS prevention (React auto-escapes)     │                │
│  │       ↓                                    │                │
│  │  Backend Validation:                       │                │
│  │  • SQL injection prevention (parameterized)│                │
│  │  • Type checking (TypeScript + Supabase)   │                │
│  │  • Rate limiting                           │                │
│  └────────────────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 **CONCLUSION**

These diagrams provide a complete visual overview of the YieldX platform architecture. 

**Key Files:**
- Full Technical Details: `/TECHNICAL_ARCHITECTURE.md`
- Quick FAQ: `/TECHNICAL_FAQ.md`
- Demo Accounts: `/DEMO_ACCOUNTS.md`

---

**Last Updated:** February 16, 2026  
**Platform Version:** YieldX v3.0
