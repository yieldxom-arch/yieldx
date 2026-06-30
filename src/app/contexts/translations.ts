// Comprehensive translation system for YieldX platform

export type Language = 'ar' | 'en';

export interface Translations {
  // Common
  common: {
    welcome: string;
    hello: string;
    student: string;
    teacher: string;
    logout: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    submit: string;
    back: string;
    next: string;
    finish: string;
    close: string;
    search: string;
    filter: string;
    viewAll: string;
    noData: string;
  };

  // Home Page
  home: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroSubtitle: string;
    startChallenge: string;
    freeTrial: string;
    login: string;
    learnMore: string;
    whyChoose: string;
    gamifiedLearning: string;
    gamifiedLearningDesc: string;
    comprehensivePlan: string;
    comprehensivePlanDesc: string;
    expertGuidance: string;
    expertGuidanceDesc: string;
    collaborativeWork: string;
    collaborativeWorkDesc: string;
    features: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
    howItWorks: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    getStarted: string;
    footer: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    yourProgress: string;
    overallProgress: string;
    completedLevels: string;
    activeProjects: string;
    totalXP: string;
    currentStreak: string;
    days: string;
    daysRemaining: string;
    daysGoal: string;
    leaderboard: string;
    videoLibrary: string;
    messaging: string;
    consultation: string;
    announcements: string;
    unread: string;
    viewMap: string;
    generateQR: string;
    completionReport: string;
    workspace: string;
    subscription: string;
    // NEW: Additional dashboard text
    videoLibraryTitle: string;
    videoLibraryDesc: string;
    browseLibrary: string;
    subscriptionManagement: string;
    upgradeNow: string;
    manageSubscription: string;
    upgradeYourPlan: string;
    manageYourSubscription: string;
    leaderboardTitle: string;
    leaderboardDesc: string;
    viewRanking: string;
    messagingTitle: string;
    messagingDesc: string;
    openMessages: string;
    consultationTitle: string;
    consultationDesc: string;
    browseExperts: string;
    videosCount: string;
    rankPosition: string;
    freeSessions: string;
    educationalPath: string;
    completeBySchedule: string;
  };

  // Levels (Space Map)
  levels: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
    level6: string;
    level7: string;
    level8: string;
    level0Title: string;
    level1Title: string;
    level2Title: string;
    level3Title: string;
    level4Title: string;
    level5Title: string;
    level6Title: string;
    level7Title: string;
    level8Title: string;
    level1Subtitle: string;
    level2Subtitle: string;
    level3Subtitle: string;
    level4Subtitle: string;
    level5Subtitle: string;
    level6Subtitle: string;
    level7Subtitle: string;
    level8Subtitle: string;
    locked: string;
    unlocked: string;
    completed: string;
    inProgress: string;
    notStarted: string;
    viewDetails: string;
    startLevel: string;
    // NEW: Additional level card translations
    requiresPreviousLevel: string;
    previewContent: string;
    progress: string;
    deadline: string;
    previewMode: string;
    previewModeDesc: string;
    learningObjective: string;
    deliverable: string;
    points: string;
    attempts: string;
    deadlineLabel: string;
    teacherFeedback: string;
    grade: string;
    viewFullGrade: string;
    viewSubmission: string;
    continueWorking: string;
    startLevelFull: string;
    levelOf: string; // "Level X of 8"
    // Status translations
    statusNotStarted: string;
    statusInProgress: string;
    statusSubmitted: string;
    statusGraded: string;
    statusLate: string;
    viewGrading: string;
    continue: string;
    start: string;
    objective: string;
    deliverableTitle: string;
    pointsLabel: string;
    attemptsLabel: string;
    deadlineTitle: string;
    teacherFeedbackTitle: string;
    gradeLabel: string;
    viewFullGrading: string;
    continueWork: string;
    previewModeTitle: string;
    previewModeDesc2: string;
    willUnlockOn: string;
    // Capstone translations
    capstoneTitle: string;
    capstoneName: string;
    capstoneFullTitle: string;
    capstoneDescUnlocked: string;
    capstoneDescLocked: string;
    completedLevels: string;
    sections: string;
    sectionsCount: string;
    finalProjectBadge: string;
    capstoneDesc: string;
    capstoneLocked: string;
    completedLevelsLabel: string;
    progressLabel: string;
    sectionsLabel: string;
    sectionsNumber: string;
    lockedCompleteAdditional: string;
    unlockTip: string;
    startComprehensiveStudy: string;
    helperText: string;
    eachLevelDesc: string;
    completedLevelsStat: string;
    levelOfEight: string;
    deadlineText: string;
    featureProjectInfo: string;
    featureSWOT: string;
    featureMarketAnalysis: string;
    featureFinancialPlanning: string;
    featureFinancialTables: string;
    featureExcelExport: string;
    featureAutoCalculations: string;
    featureProfessionalTemplates: string;
    startCapstone: string;
    lockedCompleteMore: string;
    unlockHint: string;
    // Level objectives and deliverables
    level0Objective: string;
    level0Deliverable: string;
    level1Objective: string;
    level1Deliverable: string;
    level2Objective: string;
    level2Deliverable: string;
    level3Objective: string;
    level3Deliverable: string;
    level4Objective: string;
    level4Deliverable: string;
    level5Objective: string;
    level5Deliverable: string;
    level6Objective: string;
    level6Deliverable: string;
    level7Objective: string;
    level7Deliverable: string;
    level8Objective: string;
    level8Deliverable: string;
  };

  // Settings
  settings: {
    title: string;
    profile: string;
    appearance: string;
    language: string;
    currency: string;
    notifications: string;
    privacy: string;
    apiKeys: string;
    theme: string;
    darkMode: string;
    lightMode: string;
    autoMode: string;
    reducedMotion: string;
    autoSave: string;
    profileVisibility: string;
    public: string;
    private: string;
    editProfile: string;
    saveChanges: string;
    profileCompletion: string;
    languageChanged: string;
    themeChanged: string;
    // NEW: Additional settings translations
    appSettings: string;
    notificationsDesc: string;
    autoSaveDesc: string;
    dataManagement: string;
    exportData: string;
    clearData: string;
    aiSettings: string;
    openAIKey: string;
    openAIKeyDesc: string;
    testKey: string;
    keyNote: string;
    keyReady: string;
    keyTesting: string;
    keyValid: string;
    keyInvalid: string;
    appVersion: string;
    platformDesc: string;
    // Accessibility settings
    accessibilitySettings: string;
    reducedMotionDesc: string;
    editPersonalInfo: string;
  };

  // Subscription
  subscription: {
    title: string;
    currentPlan: string;
    upgradePlan: string;
    basicTier: string;
    proPlan: string;
    enterprisePlan: string;
    monthly: string;
    yearly: string;
    subscribe: string;
    features: string;
    billing: string;
    paymentMethod: string;
  };

  // Announcements
  announcements: {
    title: string;
    noAnnouncements: string;
    markAsRead: string;
    markAllAsRead: string;
    urgent: string;
    important: string;
    general: string;
    from: string;
    viewAll: string;
  };

  // Workspace
  workspace: {
    title: string;
    createWorkspace: string;
    individual: string;
    team: string;
    joinWorkspace: string;
    shareCode: string;
    members: string;
    chat: string;
    files: string;
    myWorkspaces: string;
    availableTemplates: string;
    noWorkspaces: string;
    noTemplates: string;
    createFirst: string;
    forkTemplate: string;
    openWorkspace: string;
    viewChat: string;
    unreadMessages: string;
    enterJoinCode: string;
    scanQRCode: string;
    uploadQRImage: string;
    joinWithCode: string;
    cameraStarted: string;
    cameraStopped: string;
    cameraError: string;
    qrScannedSuccess: string;
    invalidQRCode: string;
    workspaceJoined: string;
    alreadyJoined: string;
    backToWorkspaces: string;
    projectChat: string;
  };

  // Reports
  reports: {
    completionReport: string;
    downloadReport: string;
    shareReport: string;
    overallCompletion: string;
    levelDetails: string;
    strengths: string;
    improvements: string;
  };

  // Certificates
  certificates: {
    certificateSystem: string;
    yourProgress: string;
    completion: string;
    performance: string;
    unlockCertificate: string;
    certificateLocked: string;
    certificateUnlocked: string;
    completionRequired: string;
    generateCertificate: string;
    downloadCertificate: string;
    enterName: string;
    namePlaceholder: string;
    certificateType: string;
    completionCertificate: string;
    excellenceCertificate: string;
    excellenceDesc: string;
    completionDesc: string;
    checkpointTitle: string;
    checkpointDesc: string;
    remainingSteps: string;
    keepGoing: string;
    closeCheckpoint: string;
    projectName: string;
    completionDate: string;
    certificateId: string;
    generating: string;
    levelsCompleted: string;
    totalPoints: string;
    achievementUnlocked: string;
    readyToGenerate: string;
    viewCertificates: string;
    noCertificatesYet: string;
    earnYourFirst: string;
  };

  // Notifications
  notifications: {
    title: string;
    noNotifications: string;
    markAsRead: string;
    clearAll: string;
    achievement: string;
    badge: string;
    badgesAndAchievements: string;
    deadline: string;
    feedback: string;
    system: string;
  };

  // Leaderboard
  leaderboard: {
    title: 'لوحة المتصدرين',
    global: 'عالمي',
    country: 'الدولة',
    university: 'الجامعة',
    class: 'الصف',
    rank: 'الترتيب',
    totalXP: 'إجمال النقاط',
    levelsCompleted: 'المستويات المكتملة',
    badges: 'الأوسمة',
    you: 'أنت',
    backToDashboard: 'رجوع إلى لوحة التحكم الرئيسية',
    competeWithBest: 'افوق أفضل الطلاب',
    yourCurrentRank: 'ترتيبك الحالي',
    level: 'مستوى',
    points: 'نقاط',
    completedModules: 'وحدات تدريبية مكتملة',
    user: 'مستخدم',
    modules: 'وحدات تدريبية',
    noData: 'لا توجد بيانات',
    noUsersFound: 'لم يتم العثور على أي مستخدمين',
    viewGlobalRanking: 'عرض الترتيب العالمي',
    backShortcut: 'رجوع',
    switchShortcut: 'تبديل',
    oman: 'سلطنة عمان',
    myUniversity: 'جامعتي',
    myClass: 'صفي',
    badgesCount: 'عدد الأوسمة',
  };

  // Chatbot
  chatbot: {
    title: string;
    askQuestion: string;
    typeMessage: string;
    send: string;
    quickActions: string;
    close: string;
  };

  // Business Plan Wizard
  businessPlan: {
    projectInfo: string;
    shareholders: string;
    competitors: string;
    assets: string;
    pricing: string;
    revenue: string;
    expenses: string;
    financial: string;
    implementation: string;
    downloadExcel: string;
    progress: string;
  };

  // Roles
  roles: {
    student: string;
    lecturer: string;
    admin: string;
  };

  // Time
  time: {
    now: string;
    today: string;
    yesterday: string;
    daysAgo: string;
    hoursAgo: string;
    minutesAgo: string;
    justNow: string;
  };

  // Video Library
  videoLibrary: {
    title: string;
    subtitle: string;
    backToDashboard: string;
    searchPlaceholder: string;
    allCategories: string;
    freePlan: string;
    premiumPlan: string;
    enterprisePlan: string;
    freePlanDesc: string;
    premiumPlanDesc: string;
    enterprisePlanDesc: string;
    upgradeNow: string;
    new: string;
    completed: string;
    minutes: string;
    views: string;
    premium: string;
    enterprise: string;
    level: string;
    noResults: string;
    resetSearch: string;
    instructor: string;
    close: string;
    videos: Record<string, string>;
  };

  // Professional Consultation
  consultation: {
    title: string;
    subtitle: string;
    backToDashboard: string;
    backToList: string;
    freeTrial: string;
    freeMessagesLeft: string;
    messagesRemaining: string;
    startConversation: string;
    consultations: string;
    responseTime: string;
    perMessage: string;
    verified: string;
    responds: string;
    sendFree: string;
    send: string;
    typeQuestion: string;
    noMessages: string;
    startChatWith: string;
    paymentTitle: string;
    paymentDesc: string;
    messageCost: string;
    cancel: string;
    payAndSend: string;
  };

  // Messaging & Reports Center
  messaging: {
    title: string;
    subtitle: string;
    backToDashboard: string;
    newMessage: string;
    searchPlaceholder: string;
    allMessages: string;
    general: string;
    help: string;
    report: string;
    noMessages: string;
    teacherReply: string;
    pending: string;
    replied: string;
    sent: string;
    newMessageTitle: string;
    messageType: string;
    subject: string;
    subjectRequired: string;
    message: string;
    messageRequired: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    cancel: string;
    send: string;
  };

  // Auth
  auth: {
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    role: string;
    student: string;
    teacher: string;
    forgotPassword: string;
    rememberMe: string;
    welcomeBack: string;
    createAccount: string;
    orContinueWith: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    // Error messages
    emailNotFound: string;
    incorrectPassword: string;
    loginFailed: string;
  };

  // 3D Project Visualization
  visualization3D: {
    title: string;
    subtitle: string;
    backToDashboard: string;
    openViewer: string;
    fullProjectView: string;
    orbit: string;
    zoom: string;
    reset: string;
    autoRotate: string;
    pause: string;
    play: string;
    share: string;
    download: string;
    shareLink: string;
    embedCode: string;
    downloadPng: string;
    levelDetails: string;
    progress: string;
    xp: string;
    grade: string;
    statusDone: string;
    statusInProgress: string;
    statusAvailable: string;
    statusLocked: string;
    hint: string;
    noWebGLNotice: string;
  };
}

export const translations: Record<Language, Translations> = {
  ar: {
    common: {
      welcome: 'مرحباً',
      hello: 'مرحباً',
      student: 'طالب',
      teacher: 'مُدرّس',
      logout: 'تسجيل الخروج',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      warning: 'تحذير',
      info: 'معلومات',
      submit: 'إرسال',
      back: 'رجوع',
      next: 'التالي',
      finish: 'إنهاء',
      close: 'إغلاق',
      search: 'بحث',
      filter: 'تصفية',
      viewAll: 'عرض الكل',
      noData: 'لا توجد بيانات',
    },
    home: {
      title: 'YieldX',
      subtitle: 'منصة دراسة الجدوى الممتعة',
      heroTitle: 'ابدأ رحلة النجاح',
      heroSubtitle: 'منصة تعليمية متكاملة لدراسة جدوى المشاريع',
      startChallenge: 'ابدأ التحدي',
      freeTrial: 'تجربة مجانية',
      login: 'تسجيل الدخول',
      learnMore: 'اكتشف المزيد',
      whyChoose: 'لماذا تختار YieldX؟',
      gamifiedLearning: 'تعلّم ممتع وتفاعلي',
      gamifiedLearningDesc: 'نظام مستويات ممتع مع نقاط وإنجازات تجعل تعلم دراسة الجدوى أكثر متعة وتحفيزاً',
      comprehensivePlan: 'خطة عمل شاملة',
      comprehensivePlanDesc: 'غطِّ جميع جوانب دراسة الجدوى من المساهمين إلى التخطيط المالي بشكل احترافي',
      expertGuidance: 'إرشاد من الخبراء',
      expertGuidanceDesc: 'احصل على دعم ومتابعة من خبراء ومدرسين متخصصين طوال رحلتك التعليمية',
      collaborativeWork: 'عمل جماعي متقدم',
      collaborativeWorkDesc: 'تعاون مع فريق في مساحات عمل مشتركة مع أدوات تواصل وإدارة احترافية',
      features: 'المميزات',
      feature1Title: '8 مستويات تعليمية',
      feature1Desc: 'رحلة تعليمية منظمة تغطي جميع جوانب دراسة الجدوى',
      feature2Title: 'نظام نقاط وإنجازات',
      feature2Desc: 'تتبع تقدمك واحصل على مكافآت عند إكمال المستويات',
      feature3Title: 'تعاون فريقي',
      feature3Desc: 'اعمل مع فريقك وشارك الأفكار في الوقت الفعلي',
      feature4Title: 'تحليلات متقدمة',
      feature4Desc: 'احصل على رؤى وتقارير تفصيلية عن أدائك',
      howItWorks: 'كيف يعمل؟',
      step1Title: 'سجّل وابدأ',
      step1Desc: 'أنشئ حسابك واختر مسارك التعليمي',
      step2Title: 'أكمل المستويات',
      step2Desc: 'تقدم عبر 8 مستويات تعليمية ممتعة',
      step3Title: 'اكسب النقاط',
      step3Desc: 'احصل على نقاط وشارات عند إكمال المهام',
      step4Title: 'حقق النجاح',
      step4Desc: 'أكمل دراسة جدوى احترافية لمشروعك',
      getStarted: 'ابدأ الآن',
      footer: '© 2026 YieldX. جميع الحقوق محفوظة.',
    },
    dashboard: {
      title: 'لوحة التحكم الرئيسية',
      yourProgress: 'تقدمك',
      overallProgress: 'نسبة الإنجاز',
      completedLevels: 'مستويات مكتملة',
      activeProjects: 'المشاريع النشطة',
      totalXP: 'إجمالي النقاط',
      currentStreak: 'سلسلة الإنجازات',
      days: 'أيام',
      daysRemaining: 'أيام متبقية للوصول إلى',
      daysGoal: 'يوم',
      leaderboard: 'لوحة المتصدرين',
      videoLibrary: 'مكتبة الفيديو',
      messaging: 'المراسلات',
      consultation: 'الاستشارات',
      announcements: 'الإعلانات',
      unread: 'غير مقروء',
      viewMap: 'عرض الخريطة',
      generateQR: 'إنشاء رمز QR',
      completionReport: 'تقرير الإنجاز',
      workspace: 'مساحة العمل',
      subscription: 'الاشتراكات',
      // NEW: Additional dashboard text
      videoLibraryTitle: 'مكتبة الفيديو',
      videoLibraryDesc: 'اكتشف مجموعة واسعة من الفيديوهات التعليمية',
      browseLibrary: 'تصفح المكتبة',
      subscriptionManagement: 'إدارة الاشتراكات',
      upgradeNow: 'قم بالترقية الآن',
      manageSubscription: 'إدارة الاشتراك',
      upgradeYourPlan: 'ترقية خطةك',
      manageYourSubscription: 'إدارة اشتراكك',
      leaderboardTitle: 'لوحة المتصدرين',
      leaderboardDesc: 'قارن نفسك مع الطلاب الآخرين',
      viewRanking: 'عرض الترتيب',
      messagingTitle: 'المراسلات',
      messagingDesc: 'تواصل التواصل مع زملائك والمعلمين',
      openMessages: 'فتح الرسائل',
      consultationTitle: 'الاستشارات',
      consultationDesc: 'احصل على استشارات من خبراء في مجالك',
      browseExperts: 'تصفح الخبراء',
      videosCount: 'عدد الفيديوهات',
      rankPosition: 'موضعك في الترتيب',
      freeSessions: 'جلسات مجانية',
      educationalPath: 'رحلة دراسة الجدوى',
      completeBySchedule: 'أكمل ٨ مستويات للحصول على دراسة جدوى كاملة لمشروعك',
    },
    levels: {
      level0: 'المستوى 0',
      level1: 'المستوى 1',
      level2: 'المستوى 2',
      level3: 'المستوى 3',
      level4: 'المستوى 4',
      level5: 'المستوى 5',
      level6: 'المستوى 6',
      level7: 'المستوى 7',
      level8: 'المستوى 8',
      level0Title: 'اختيار نوع المشروع',
      level1Title: 'السوق والاستراتيجية',
      level2Title: 'الإطار القانوني والتنظيمي',
      level3Title: 'المتطلبات التشغيلية',
      level4Title: 'الموارد المادية والفنية',
      level5Title: 'الموارد البشرية والتنظيمية',
      level6Title: 'التمويل والمؤشرات المالية',
      level7Title: 'الهوية والملكية',
      level8Title: 'الملخص التنفيذي',
      level1Subtitle: 'مقدمة في دراسة الجدوى',
      level2Subtitle: 'تحليل السوق',
      level3Subtitle: 'تحليل SWOT',
      level4Subtitle: 'إدارة الأصول',
      level5Subtitle: 'التسعير',
      level6Subtitle: 'الإيرادات والمصروفات',
      level7Subtitle: 'التخطيط المالي',
      level8Subtitle: 'تنفيذ المشروع',
      locked: 'مقفل',
      unlocked: 'مفتوح',
      completed: 'مكتمل',
      inProgress: 'قيد التنفيذ',
      notStarted: 'لم يبدأ',
      viewDetails: 'عرض التفاصيل',
      startLevel: 'ابدأ المستوى',
      // NEW: Additional level card translations
      requiresPreviousLevel: 'يتطلب المستوى السابق',
      previewContent: 'معاينة المحتوى',
      progress: 'التقدم',
      deadline: 'موعد النهائي',
      previewMode: 'الوضع المعاين',
      previewModeDesc: 'يمكنك معاينة المحتوى دون البدء في المستوى',
      learningObjective: 'هف التعلم',
      deliverable: 'المنتج النهائي',
      points: 'نقاط',
      attempts: 'محاولات',
      deadlineLabel: 'موعد النهائي',
      teacherFeedback: 'تعليقات المعلم',
      grade: 'الدرجة',
      viewFullGrade: 'عرض الدرجة الكاملة',
      viewSubmission: 'عرض التسليم',
      continueWorking: 'استمر في العمل',
      startLevelFull: 'ابدأ المستوى بالكامل',
      levelOf: 'مستوى %d من 8',
      // Status translations
      statusNotStarted: 'غير مُبدأ',
      statusInProgress: 'قيد العمل',
      statusSubmitted: 'مُسلّم',
      statusGraded: 'تم التصحيح',
      statusLate: 'متأخر',
      viewGrading: 'عرض التقييم',
      continue: 'متابعة',
      start: 'ابدأ',
      objective: 'الهدف التعليمي',
      deliverableTitle: 'المطلوب تسليمه',
      pointsLabel: 'النقاط',
      attemptsLabel: 'المحاولات',
      deadlineTitle: 'الموعد النهائي',
      teacherFeedbackTitle: 'ملاحظات المدرس',
      gradeLabel: 'الدرجة',
      viewFullGrading: 'عرض التقييم الكامل',
      continueWork: 'متابعة العمل',
      previewModeTitle: '👁️ وضع المعاينة',
      previewModeDesc2: 'هذا المستوى مقفل حالياً. يمكنك معاينة المحتوى فقط.',
      willUnlockOn: 'سيُفتح بتاريخ:',
      // Capstone translations
      capstoneTitle: 'مشروع التخرج',
      capstoneName: 'مشروع التخرج',
      capstoneFullTitle: 'دراسة الجدوى الشاملة',
      capstoneDescUnlocked: 'مشروع التخرج مفتوح للعمل عليه',
      capstoneDescLocked: 'مشروع التخرج مقفل، اكمل مستوياتك للوصول إليه',
      completedLevels: 'مستويات مكتملة',
      sections: 'الأقسام',
      sectionsCount: 'عدد الأقسام',
      finalProjectBadge: 'المشروع النهائي - CAPSTONE',
      capstoneDesc: 'استخدم كل ما تعلمته لإنشاء دراسة جدوى كاملة واحترافية لمشروعك مع 8 أقسام شاملة وجداول مالية متقدمة',
      capstoneLocked: 'قم بإكمال 6 مستويات على الأقل لفتح المشروع النهائي',
      completedLevelsLabel: 'المستويات المكتملة',
      progressLabel: 'التقدم',
      sectionsLabel: 'الأقسام',
      sectionsNumber: '8 أقسام',
      lockedCompleteAdditional: 'مقفل - أكمل %d مستويات إضافية',
      unlockTip: '💡 نصيحة: أكمل مستوى واحد إضافي لكل يوم للوصول إلى المشروع النهائي',
      startComprehensiveStudy: 'ابدأ دراسة الجدوى الشاملة',
      helperText: 'تابع نقاطك ومواعيد التسليم لكل مستوى للحصول على أفضل تقييم',
      eachLevelDesc: 'كل مستوى يحتوي على هدف تعليمي واضح ومهمة للتسليم',
      completedLevelsStat: 'المستويات المكتملة',
      levelOfEight: 'المستوى %d من 8',
      deadlineText: 'الموعد:',
      featureProjectInfo: 'معلومات المشروع',
      featureSWOT: 'تحليل SWOT',
      featureMarketAnalysis: 'تحليل السوق',
      featureFinancialPlanning: 'التخطيط المالي',
      featureFinancialTables: 'جداول المالية',
      featureExcelExport: 'تصدير إلى Excel',
      featureAutoCalculations: 'حسابات آلية',
      featureProfessionalTemplates: 'قوالب محترفة',
      startCapstone: 'ابدأ مشروع التخرج',
      lockedCompleteMore: 'مقفل، اكمل المزيد من المستويات للوصول إليه',
      unlockHint: 'احصل على مشروع التخرج من خلال إكمال مستوياتك!',
      // Level objectives and deliverables
      level0Objective: 'تحديد نوع المشروع (زراعي، صناعي، تجاري، خدمي)',
      level0Deliverable: 'اختيار نوع المشروع وفهم متطلباته',
      level1Objective: 'تحليل المنافسين وتحديد المنتجات وإجراء تحليل SWOT متطور',
      level1Deliverable: 'تحليل المنافسين + المنتجات + تحليل SWOT (حتى 9 نقاط لكل قسم)',
      level2Objective: 'استكمال المتطلبات القانونية والتراخيص اللازمة',
      level2Deliverable: 'قائمة التراخيص والتأمينات وعقود الإيجار',
      level3Objective: 'تحديد الموقع والمرافق والمواد الخام والاحتياجات اليومية للتشغيل',
      level3Deliverable: 'قائمة المتطلبات التشغيلية مع التكاليف الشهرية',
      level4Objective: 'حساب الأصول الثابتة والمواد الخام والإهلاك',
      level4Deliverable: 'جدول الأصول والمواد مع التكاليف والإهلاك',
      level5Objective: 'بناء الهيكل الوظيفي وحساب تكاليف الموارد البشرية',
      level5Deliverable: 'الهيكل الوظيفي والرواتب والتأمينات',
      level6Objective: 'إعداد الخطة المالية والمؤشرات المالية الرئيسية (5-10 سنوات)',
      level6Deliverable: 'قائمة الدخل والمؤشرات المالية (IRR, NPV, ROI, نقطة التعادل)',
      level7Objective: 'تحديد تفاصيل المشروع الأساسية وهيكل الملكية',
      level7Deliverable: 'معلومات المشروع والملاك مع توزيع النسب',
      level8Objective: 'كتابة ملخص تنفيذي شامل لدراسة الجدوى',
      level8Deliverable: 'الملخص التنفيذي النهائي (صفحة واحدة)',
    },
    settings: {
      title: 'الإعدادات',
      profile: 'الملف الشخصي',
      appearance: 'المظهر',
      language: 'اللغة',
      currency: 'العملة',
      notifications: 'الإشعارات',
      privacy: 'الخصوصية',
      apiKeys: 'مفاتيح API',
      theme: 'السمة',
      darkMode: 'الوضع الداكن',
      lightMode: 'الوضع الفاتح',
      autoMode: 'تلقائي',
      reducedMotion: 'تقليل الحركة',
      autoSave: 'الحفظ التلقائي',
      profileVisibility: 'ظهور الملف الشخصي',
      public: 'عام',
      private: 'خاص',
      editProfile: 'تعديل الملف الشخصي',
      saveChanges: 'حفظ التغييرات',
      profileCompletion: 'اكتمال الملف الشخصي',
      languageChanged: 'تم تغيير اللغة إلى العربية',
      themeChanged: 'تم تغيير السمة',
      // NEW: Additional settings translations
      appSettings: 'إعدادات التطبيق',
      notificationsDesc: 'تلقي إشعارات حول التقدم والإنجازات',
      autoSaveDesc: 'حفظ التقدم تلقائياً أثناء العمل',
      dataManagement: 'إدارة البيانات',
      exportData: 'تصدير البيانات (نسخة احتياطية)',
      clearData: 'حذف جميع البيانات',
      aiSettings: 'إعدادات الذكاء الاصطناعي',
      openAIKey: 'مفتاح OpenAI API',
      openAIKeyDesc: 'أدخل مفتاح "sk-" الخاص بك لتفعيل المساعد الذكي',
      testKey: 'اختبار المفتاح',
      keyNote: 'ملاحظة: يتم حفظ المفتاح محلياً في متصفحك. يمكنك الحصول على مفتاح API من',
      keyReady: 'جاهز للاختبار',
      keyTesting: 'جاري الاختبار...',
      keyValid: 'المفتاح صحيح',
      keyInvalid: 'المفتاح غير صحيح',
      appVersion: 'الإصدار',
      platformDesc: 'منصة دراسات الجدوى التفصيلية',
      // Accessibility settings
      accessibilitySettings: 'إعدادات الوصول',
      reducedMotionDesc: 'تقليل الحركة في الرسوم المتحركة والرسوم المتحركة الأخرى',
      editPersonalInfo: 'تحرير معلوماتي الشخصية',
    },
    subscription: {
      title: 'الاشتراكات',
      currentPlan: 'الخطة الحالية',
      upgradePlan: 'ترقية الخطة',
      basicTier: 'الخطة الأساسية',
      proPlan: 'الخطة الاحترافية',
      enterprisePlan: 'خطة المؤسسات',
      monthly: 'شهري',
      yearly: 'سنوي',
      subscribe: 'اشترك الآن',
      features: 'المميزات',
      billing: 'الفواتير',
      paymentMethod: 'طريقة الدفع',
    },
    announcements: {
      title: 'الإعلانات',
      noAnnouncements: 'لا توجد إعلانات',
      markAsRead: 'وضع علامة كمقروء',
      markAllAsRead: 'وضع علامة على الكل كمقروء',
      urgent: 'عاجل',
      important: 'مهم',
      general: 'عام',
      from: 'من',
      viewAll: 'عرض الكل',
    },
    workspace: {
      title: 'مساحة العمل',
      createWorkspace: 'إنشاء مساحة عمل',
      individual: 'فردي',
      team: 'فريق',
      joinWorkspace: 'الانضمام لمساحة عمل',
      shareCode: 'مشاركة الرمز',
      members: 'الأعضاء',
      chat: 'المحادثة',
      files: 'الملفات',
      myWorkspaces: 'مساحات العمل الخاصة بي',
      availableTemplates: 'القوالب المتاحة',
      noWorkspaces: 'لا توجد مساحات عمل متاحة',
      noTemplates: 'لا توجد قوالب متاحة',
      createFirst: 'إنشاء أول مساحة عمل',
      forkTemplate: 'استنساخ القالب',
      openWorkspace: 'فتح مساحة العمل',
      viewChat: 'عرض المحادثات',
      unreadMessages: 'رسائل غير مقروءة',
      enterJoinCode: 'أدخل رمز الانضمام',
      scanQRCode: 'مسح رمز QR',
      uploadQRImage: 'تحميل صورة رمز QR',
      joinWithCode: 'انضم باستخدام الرمز',
      cameraStarted: 'بدأ الكاميرا',
      cameraStopped: 'توقفت الكاميرا',
      cameraError: 'خطأ في الكاميرا',
      qrScannedSuccess: 'مسح رمز QR ناجح',
      invalidQRCode: 'رمز QR غير صالح',
      workspaceJoined: 'انضمت إلى مساحة العمل بنجاح',
      alreadyJoined: 'لقد انضمت إلى هذه المساحة بالفعل',
      backToWorkspaces: 'رجوع إلى مساحات العمل',
      projectChat: 'محادثة المشروع',
    },
    reports: {
      completionReport: 'تقرير الإنجاز',
      downloadReport: 'تنزيل التقرير',
      shareReport: 'مشاركة التقرير',
      overallCompletion: 'الإنجاز الكلي',
      levelDetails: 'تفاصيل المستويات',
      strengths: 'نقاط القوة',
      improvements: 'مجالات التحسين',
    },
    certificates: {
      certificateSystem: 'نظام الشهادات',
      yourProgress: 'تقدمك',
      completion: 'الإكمال',
      performance: 'الأداء',
      unlockCertificate: 'فتح الشهادة',
      certificateLocked: 'الشهادة مقفلة',
      certificateUnlocked: 'الشهادة مفتوحة',
      completionRequired: 'الإكمال مطلوب',
      generateCertificate: 'إنشاء الشهادة',
      downloadCertificate: 'تنزيل الشهادة',
      enterName: 'أدخل اسمك',
      namePlaceholder: 'اسمك كام؟',
      certificateType: 'نوع الشهادة',
      completionCertificate: 'شهادة الإكمال',
      excellenceCertificate: 'شهادة التميز',
      excellenceDesc: 'شهادة تتميز فيها أدائك في دراسة الجدوى',
      completionDesc: 'شهادة تؤكد إكمالك لدراسة الجدوى',
      checkpointTitle: 'نقطة التحقق',
      checkpointDesc: 'تحقق من إكمالك للمستويات السابقة للحصول على الشهادة',
      remainingSteps: 'خطوات متبقية',
      keepGoing: 'استمر في العمل',
      closeCheckpoint: 'إغلاق نقطة التحقق',
      projectName: 'اسم المشروع',
      completionDate: 'تاريخ الإكمال',
      certificateId: 'رقم الشهادة',
      generating: 'جاري إنشاء الشهادة...',
      levelsCompleted: 'مستويات مكتملة',
      totalPoints: 'إجمالي النقاط',
      achievementUnlocked: 'إنجاز جديد مفتوح',
      readyToGenerate: 'مستعد لإنشاء الشهادة',
      viewCertificates: 'عرض الشهادات',
      noCertificatesYet: 'لا توجد شهادات بعد',
      earnYourFirst: 'كسب شهادتك الأولى!',
    },
    notifications: {
      title: 'الإشعارات',
      noNotifications: 'لا توجد إشعارات',
      markAsRead: 'وضع علامة كمقروء',
      clearAll: 'مسح الكل',
      achievement: 'إنجاز',
      badge: 'وسام',
      badgesAndAchievements: 'الأوسمة والإنجازات',
      deadline: 'موعد نهائي',
      feedback: 'ملاحظات',
      system: 'نظام',
    },
    leaderboard: {
      title: 'لوحة المتصدرين',
      global: 'عالمي',
      country: 'الدولة',
      university: 'الجامعة',
      class: 'الصف',
      rank: 'الترتيب',
      totalXP: 'إجمال النقاط',
      levelsCompleted: 'المستويات المكتملة',
      badges: 'الأوسمة',
      you: 'أنت',
      backToDashboard: 'رجوع إلى لوحة التحكم الرئيسية',
      competeWithBest: 'افوق أفضل الطلاب',
      yourCurrentRank: 'ترتيبك الحالي',
      level: 'مستوى',
      points: 'نقاط',
      completedModules: 'وحدات تدريبية مكتملة',
      user: 'مستخدم',
      modules: 'وحدات تدريبية',
      noData: 'لا توجد بيانات',
      noUsersFound: 'لم يتم العثور على أي مستخدمين',
      viewGlobalRanking: 'عرض الترتيب العالمي',
      backShortcut: 'رجوع',
      switchShortcut: 'تبديل',
      oman: 'سلطنة عمان',
      myUniversity: 'جامعتي',
      myClass: 'صفي',
      badgesCount: 'عدد الأوسمة',
    },
    chatbot: {
      title: 'المساعد الذكي',
      askQuestion: 'اسأل سؤال',
      typeMessage: 'اكتب رسالتك هنا...',
      send: 'إرسال',
      quickActions: 'إجراءات سريعة',
      close: 'إغلاق',
    },
    businessPlan: {
      projectInfo: 'معلومات المشروع',
      shareholders: 'معلومات المساهمين',
      competitors: 'تحليل المنافسين',
      assets: 'إدارة الأصول',
      pricing: 'التسعير',
      revenue: 'الإيرادات',
      expenses: 'المصروفات',
      financial: 'التخطيط المالي',
      implementation: 'التنفيذ',
      downloadExcel: 'تنزيل Excel',
      progress: 'التقدم',
    },
    roles: {
      student: '🎓 طالب',
      lecturer: '👨‍🏫 مُدرّس',
      admin: '⚙️ مدير',
    },
    time: {
      now: 'الآن',
      today: 'اليوم',
      yesterday: 'أمس',
      daysAgo: 'منذ %d أيام',
      hoursAgo: 'منذ %d ساعات',
      minutesAgo: 'منذ %d دقائق',
      justNow: 'للتو',
    },
    videoLibrary: {
      title: 'مكتبة الفيديو',
      subtitle: 'اكتشف مجموعة واسعة من الفيديوهات التعليمية',
      backToDashboard: 'رجوع إلى لوحة التحكم الرئيسية',
      searchPlaceholder: 'ابحث عن فيديو...',
      allCategories: 'جميع الفئات',
      freePlan: 'خطة مجانية',
      premiumPlan: 'خطة فائقة',
      enterprisePlan: 'خطة المؤسسات',
      freePlanDesc: 'الوصول إلى مجموعة محدودة من الفيديوهات التعليمية',
      premiumPlanDesc: 'الوصول إلى مجموعة واسعة من الفيديوهات التعليمية',
      enterprisePlanDesc: 'الوصول إلى مجموعة كاملة من الفيديوهات التعليمية',
      upgradeNow: 'قم بالترقية الآن',
      new: 'جديد',
      completed: 'مكتمل',
      minutes: 'دقائق',
      views: 'مشاهدات',
      premium: 'فائق',
      enterprise: 'مؤسسة',
      level: 'مستوى',
      noResults: 'لا توجد نتائج',
      resetSearch: 'إعادة البحث',
      instructor: 'المدرب',
      close: 'إغلاق',
      videos: {
        'VHib1fXVEhA': 'ليش لازم تبدأ بدراسة الجدوى؟',
        '-qq-hrT0ETo': 'كم تستغرق دراسة الجدوى؟',
        '2y6zifyxcMU': 'هل كل مشروع يحتاج دراسة جدوى؟',
        'kPtYe7HUwe4': 'الفرق بين التخطيط العادي ودراسة الجدوى؟',
        'nb72b1dPCU8': 'كم تكلفة دراسة الجدوى؟',
        '0lyOPBoYvvQ': 'أنواع المنافسين',
        'Sq0Gud80w6k': 'نفس المستوى؟',
        'mG4X6xli9wo': 'مشروعك ماشي على الحظ!',
        'Cckrsqtjz1M': 'ليس خطأك لكنها مسؤوليتك',
        'nunwgrmfsxo': 'تبغى تتوسى؟! انتبه تضر بسمعتك',
        'yBg5bAuFq9s': 'هل الخطأ خطاك؟',
        'LE4GQGtR3Y0': 'العمل الإحصائي الخليجي',
      },
    },
    consultation: {
      title: 'الاستشارات المهنية',
      subtitle: 'احصل على استشارات من الخبراء في مجالك',
      backToDashboard: 'رجوع إلى لوحة التحكم الرئيسية',
      backToList: 'رجوع إلى قائمة الاستشارات',
      freeTrial: 'تجربة مجانية',
      freeMessagesLeft: 'رسائل مجانية متبقية',
      messagesRemaining: 'رسائل متبقية',
      startConversation: 'بدء المحادثة',
      consultations: 'الاستشارات',
      responseTime: 'وقت الاستجابة',
      perMessage: 'لكل رسالة',
      verified: 'مؤكد',
      responds: 'يجب أن يستجيب',
      sendFree: 'إرسال رسائل مجانية',
      send: 'إرسال',
      typeQuestion: 'اكتب سؤالك هنا...',
      noMessages: 'لا توجد رسائل متبقية',
      startChatWith: 'بدء المحادثة مع',
      paymentTitle: 'معلومات الدفع',
      paymentDesc: 'يرجى الدفع لاستمرار المحادثة',
      messageCost: 'تكلفة الرسالة',
      cancel: 'إلغاء',
      payAndSend: 'دفع وإرسال',
    },
    messaging: {
      title: 'مركز الرسائل والتقارير',
      subtitle: 'تواصل التواصل مع المعلم أو تقديم شكوى',
      backToDashboard: 'رجوع إلى لوحة التحكم الرئيسية',
      newMessage: 'رسالة جديدة',
      searchPlaceholder: 'ابحث في رسائلك...',
      allMessages: 'جميع الرسائل',
      general: 'عام',
      help: 'طلب مساعدة',
      report: 'شكوى',
      noMessages: 'لا توجد رسائل',
      teacherReply: 'رد المعلم',
      pending: 'قيد الانتظار',
      replied: 'تم الرد',
      sent: 'مرسل',
      newMessageTitle: 'رسالة جديدة',
      messageType: 'نوع الرسالة',
      subject: 'الموضوع',
      subjectRequired: 'الموضوع *',
      message: 'الرسالة',
      messageRequired: 'الرسالة *',
      subjectPlaceholder: 'اكتب موضوع الرسالة...',
      messagePlaceholder: 'اكتب رسالتك هنا...',
      cancel: 'إلغاء',
      send: 'إرسال',
    },
    auth: {
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      fullName: 'الاسم الكامل',
      role: 'الدور',
      student: 'طالب',
      teacher: 'مُدرّس',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      welcomeBack: 'مرحبًا بك مرة أخرى',
      createAccount: 'إنشاء حساب جديد',
      orContinueWith: 'أو استمر مع',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      // Error messages
      emailNotFound: 'لم يتم العثور على البريد الإلكتروني',
      incorrectPassword: 'كلمة المرور غير صحيحة',
      loginFailed: 'فشل تسجيل الدخول',
    },
    visualization3D: {
      title: 'عرض المشروع ثلاثي الأبعاد',
      subtitle: 'استكشف مشروعك بشكل تفاعلي ثلاثي الأبعاد',
      backToDashboard: 'رجوع إلى لوحة التحكم',
      openViewer: 'عرض ثلاثي الأبعاد',
      fullProjectView: 'عرض المشروع الكامل',
      orbit: 'تدوير',
      zoom: 'تكبير/تصغير',
      reset: 'إعادة الضبط',
      autoRotate: 'تدوير تلقائي',
      pause: 'إيقاف',
      play: 'تشغيل',
      share: 'مشاركة',
      download: 'تحميل',
      shareLink: 'رابط المشاركة',
      embedCode: 'كود التضمين',
      downloadPng: 'تحميل صورة PNG',
      levelDetails: 'تفاصيل المستوى',
      progress: 'التقدم',
      xp: 'النقاط',
      grade: 'الدرجة',
      statusDone: 'مكتمل',
      statusInProgress: 'قيد التنفيذ',
      statusAvailable: 'متاح',
      statusLocked: 'مغلق',
      hint: 'اسحب للتدوير • عجلة التمرير للتكبير • انقر على عقدة للتفاصيل',
      noWebGLNotice: 'وضع بديل — WebGL غير مدعوم في هذا الجهاز',
    },
  },
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello',
      student: 'Student',
      teacher: 'Teacher',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      viewAll: 'View All',
      noData: 'No data available',
    },
    home: {
      title: 'Welcome to YieldX',
      subtitle: 'Start your educational journey today!',
      heroTitle: 'Learn and grow with YieldX',
      heroSubtitle: 'A comprehensive and reliable educational program',
      startChallenge: 'Start Challenge',
      freeTrial: 'Free Trial',
      login: 'Login',
      learnMore: 'Learn More',
      whyChoose: 'Why Choose YieldX?',
      gamifiedLearning: 'Gamified Learning',
      gamifiedLearningDesc: 'Learn through engaging and interactive educational games',
      comprehensivePlan: 'Comprehensive Plan',
      comprehensivePlanDesc: 'A comprehensive educational plan covering all aspects',
      expertGuidance: 'Expert Guidance',
      expertGuidanceDesc: 'Get guidance from experts in your field',
      collaborativeWork: 'Collaborative Work',
      collaborativeWorkDesc: 'Work with peers on educational projects',
      features: 'Features',
      feature1Title: 'Advanced Learning',
      feature1Desc: 'Learn through the latest educational technologies',
      feature2Title: 'Continuous Assessments',
      feature2Desc: 'Continuous assessments to measure your progress',
      feature3Title: 'Excellent Technical Support',
      feature3Desc: 'Technical support available 24/7',
      feature4Title: 'High-Quality Educational Materials',
      feature4Desc: 'High-quality and reliable educational materials',
      howItWorks: 'How Does YieldX Work?',
      step1Title: 'Create an Account',
      step1Desc: 'Create a new account in YieldX',
      step2Title: 'Choose a Level',
      step2Desc: 'Choose the level that suits you',
      step3Title: 'Start Learning',
      step3Desc: 'Start learning through educational games',
      step4Title: 'Measure Progress',
      step4Desc: 'Measure your progress through continuous assessments',
      getStarted: 'Get Started Now',
      footer: 'All rights reserved to YieldX © 2023',
    },
    dashboard: {
      title: 'Main Dashboard',
      yourProgress: 'Your Progress',
      overallProgress: 'Overall Progress',
      completedLevels: 'Completed Levels',
      activeProjects: 'Active Projects',
      totalXP: 'Total XP',
      currentStreak: 'Current Streak',
      days: 'days',
      daysRemaining: 'days remaining to reach',
      daysGoal: 'day',
      leaderboard: 'Leaderboard',
      videoLibrary: 'Video Library',
      messaging: 'Messaging',
      consultation: 'Consultation',
      announcements: 'Announcements',
      unread: 'unread',
      viewMap: 'View Map',
      generateQR: 'Generate QR',
      completionReport: 'Completion Report',
      workspace: 'Workspace',
      subscription: 'Subscription',
      // NEW: Additional dashboard text
      videoLibraryTitle: 'Video Library',
      videoLibraryDesc: 'Explore a wide range of educational videos',
      browseLibrary: 'Browse Library',
      subscriptionManagement: 'Subscription Management',
      upgradeNow: 'Upgrade Now',
      manageSubscription: 'Manage Subscription',
      upgradeYourPlan: 'Upgrade Your Plan',
      manageYourSubscription: 'Manage Your Subscription',
      leaderboardTitle: 'Leaderboard',
      leaderboardDesc: 'Compare yourself with other students',
      viewRanking: 'View Ranking',
      messagingTitle: 'Messaging',
      messagingDesc: 'Continue communicating with your peers and teachers',
      openMessages: 'Open Messages',
      consultationTitle: 'Consultation',
      consultationDesc: 'Get consultations from experts in your field',
      browseExperts: 'Browse Experts',
      videosCount: 'Number of Videos',
      rankPosition: 'Rank Position',
      freeSessions: 'Free Sessions',
      educationalPath: 'The Feasibility Study Journey',
      completeBySchedule: 'Complete 8 levels to get a full feasibility study for your project',
    },
    levels: {
      level0: 'Level 0',
      level1: 'Level 1',
      level2: 'Level 2',
      level3: 'Level 3',
      level4: 'Level 4',
      level5: 'Level 5',
      level6: 'Level 6',
      level7: 'Level 7',
      level8: 'Level 8',
      level0Title: 'Project Type Selection',
      level1Title: 'Market & Strategy',
      level2Title: 'Legal Framework',
      level3Title: 'Operational Requirements',
      level4Title: 'Physical Resources',
      level5Title: 'Human Resources',
      level6Title: 'Financing & Financial KPIs',
      level7Title: 'Identity & Ownership',
      level8Title: 'Executive Summary',
      level1Subtitle: 'Introduction to Feasibility Study',
      level2Subtitle: 'Market Analysis',
      level3Subtitle: 'SWOT Analysis',
      level4Subtitle: 'Asset Management',
      level5Subtitle: 'Pricing',
      level6Subtitle: 'Revenue and Expenses',
      level7Subtitle: 'Financial Planning',
      level8Subtitle: 'Project Implementation',
      locked: 'Locked',
      unlocked: 'Unlocked',
      completed: 'Completed',
      inProgress: 'In Progress',
      notStarted: 'Not Started',
      viewDetails: 'View Details',
      startLevel: 'Start Level',
      // NEW: Additional level card translations
      requiresPreviousLevel: 'Requires previous level',
      previewContent: 'Preview content',
      progress: 'Progress',
      deadline: 'Deadline',
      previewMode: 'Preview mode',
      previewModeDesc: 'You can preview the content without starting the level',
      learningObjective: 'Learning objective',
      deliverable: 'Deliverable',
      points: 'Points',
      attempts: 'Attempts',
      deadlineLabel: 'Deadline',
      teacherFeedback: 'Teacher feedback',
      grade: 'Grade',
      viewFullGrade: 'View full grade',
      viewSubmission: 'View submission',
      continueWorking: 'Continue working',
      startLevelFull: 'Start level fully',
      levelOf: 'Level %d of 8',
      // Status translations
      statusNotStarted: 'Not Started',
      statusInProgress: 'In Progress',
      statusSubmitted: 'Submitted',
      statusGraded: 'Graded',
      statusLate: 'Late',
      viewGrading: 'View Grading',
      continue: 'Continue',
      start: 'Start',
      objective: 'Learning Objective',
      deliverableTitle: 'Deliverable',
      pointsLabel: 'Points',
      attemptsLabel: 'Attempts',
      deadlineTitle: 'Deadline',
      teacherFeedbackTitle: 'Teacher Feedback',
      gradeLabel: 'Grade',
      viewFullGrading: 'View Full Grading',
      continueWork: 'Continue Work',
      previewModeTitle: 'Preview Mode',
      previewModeDesc2: 'This level is currently locked. You can only preview the content.',
      willUnlockOn: 'Will unlock on:',
      // Capstone translations
      capstoneTitle: 'Capstone Project',
      capstoneName: 'Capstone Project',
      capstoneFullTitle: 'Comprehensive Feasibility Study',
      capstoneDescUnlocked: 'Capstone project is unlocked for working on it',
      capstoneDescLocked: 'Capstone project is locked, complete more levels to reach it',
      completedLevels: 'Completed levels',
      sections: 'Sections',
      sectionsCount: 'Number of sections',
      finalProjectBadge: 'Final Project - CAPSTONE',
      capstoneDesc: 'Use everything you have learned to create a comprehensive and professional feasibility study for your project with 8 comprehensive sections and advanced financial tables',
      capstoneLocked: 'Complete at least 6 levels to unlock the final project',
      completedLevelsLabel: 'Completed Levels',
      progressLabel: 'Progress',
      sectionsLabel: 'Sections',
      sectionsNumber: '8 Sections',
      lockedCompleteAdditional: 'Locked - Complete %d additional levels',
      unlockTip: '💡 Tip: Complete one additional level per day to reach the final project',
      startComprehensiveStudy: 'Start Comprehensive Feasibility Study',
      helperText: 'Track your points and submission deadlines for each level to get the best evaluation',
      eachLevelDesc: 'Each level contains a clear learning objective and a submission task',
      completedLevelsStat: 'Completed Levels',
      levelOfEight: 'Level %d of 8',
      deadlineText: 'Deadline:',
      featureProjectInfo: 'Project Information',
      featureSWOT: 'SWOT Analysis',
      featureMarketAnalysis: 'Market Analysis',
      featureFinancialPlanning: 'Financial Planning',
      featureFinancialTables: 'Financial Tables',
      featureExcelExport: 'Excel Export',
      featureAutoCalculations: 'Auto Calculations',
      featureProfessionalTemplates: 'Professional Templates',
      startCapstone: 'Start Capstone Project',
      lockedCompleteMore: 'Locked, complete more levels to reach it',
      unlockHint: 'Unlock the capstone project by completing your levels!',
      // Level objectives and deliverables
      level0Objective: 'Choose the project type (agricultural, industrial, commercial, or service)',
      level0Deliverable: 'Selected project type with an understanding of its requirements',
      level1Objective: 'Analyze competitors, define products, and conduct an advanced SWOT analysis',
      level1Deliverable: 'Competitor analysis + products + SWOT analysis (up to 9 points per section)',
      level2Objective: 'Complete the necessary legal requirements and licenses',
      level2Deliverable: 'List of licenses, insurance policies, and lease contracts',
      level3Objective: 'Determine the location, facilities, raw materials, and daily operational needs',
      level3Deliverable: 'List of operational requirements with monthly costs',
      level4Objective: 'Calculate fixed assets, raw materials, and depreciation',
      level4Deliverable: 'Table of assets and materials with costs and depreciation',
      level5Objective: 'Build the organizational structure and calculate human resource costs',
      level5Deliverable: 'Organizational structure with salaries and insurance',
      level6Objective: 'Prepare the financial plan and key financial indicators (5-10 years)',
      level6Deliverable: 'Income statement and financial indicators (IRR, NPV, ROI, break-even point)',
      level7Objective: 'Define core project details and ownership structure',
      level7Deliverable: 'Project and owner information with share distribution',
      level8Objective: 'Write a comprehensive executive summary for the feasibility study',
      level8Deliverable: 'Final executive summary (one page)',
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      appearance: 'Appearance',
      language: 'Language',
      currency: 'Currency',
      notifications: 'Notifications',
      privacy: 'Privacy',
      apiKeys: 'API Keys',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      autoMode: 'Auto',
      reducedMotion: 'Reduced Motion',
      autoSave: 'Auto Save',
      profileVisibility: 'Profile Visibility',
      public: 'Public',
      private: 'Private',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      profileCompletion: 'Profile Completion',
      languageChanged: 'Language changed to English',
      themeChanged: 'Theme changed',
      // NEW: Additional settings translations
      appSettings: 'Application Settings',
      notificationsDesc: 'Receive notifications about progress and achievements',
      autoSaveDesc: 'Automatically save progress while working',
      dataManagement: 'Data Management',
      exportData: 'Export Data (Backup)',
      clearData: 'Clear All Data',
      aiSettings: 'AI Settings',
      openAIKey: 'OpenAI API Key',
      openAIKeyDesc: 'Enter your "sk-" key to activate the AI assistant',
      testKey: 'Test Key',
      keyNote: 'Note: The key is saved locally in your browser. You can get an API key from',
      keyReady: 'Ready to test',
      keyTesting: 'Testing...',
      keyValid: 'Key is valid',
      keyInvalid: 'Key is invalid',
      appVersion: 'Version',
      platformDesc: 'Comprehensive Feasibility Study Platform',
      // Accessibility settings
      accessibilitySettings: 'Accessibility Settings',
      reducedMotionDesc: 'Reduce motion in animations and other moving elements',
      editPersonalInfo: 'Edit Personal Information',
    },
    subscription: {
      title: 'Subscription',
      currentPlan: 'Current Plan',
      upgradePlan: 'Upgrade Plan',
      basicTier: 'Basic Plan',
      proPlan: 'Pro Plan',
      enterprisePlan: 'Enterprise Plan',
      monthly: 'Monthly',
      yearly: 'Yearly',
      subscribe: 'Subscribe Now',
      features: 'Features',
      billing: 'Billing',
      paymentMethod: 'Payment Method',
    },
    announcements: {
      title: 'Announcements',
      noAnnouncements: 'No announcements',
      markAsRead: 'Mark as read',
      markAllAsRead: 'Mark all as read',
      urgent: 'Urgent',
      important: 'Important',
      general: 'General',
      from: 'From',
      viewAll: 'View All',
    },
    workspace: {
      title: 'Workspace',
      createWorkspace: 'Create Workspace',
      individual: 'Individual',
      team: 'Team',
      joinWorkspace: 'Join Workspace',
      shareCode: 'Share Code',
      members: 'Members',
      chat: 'Chat',
      files: 'Files',
      myWorkspaces: 'My Workspaces',
      availableTemplates: 'Available Templates',
      noWorkspaces: 'No Workspaces Available',
      noTemplates: 'No Templates Available',
      createFirst: 'Create Your First Workspace',
      forkTemplate: 'Fork Template',
      openWorkspace: 'Open Workspace',
      viewChat: 'View Chat',
      unreadMessages: 'Unread Messages',
      enterJoinCode: 'Enter Join Code',
      scanQRCode: 'Scan QR Code',
      uploadQRImage: 'Upload QR Image',
      joinWithCode: 'Join with Code',
      cameraStarted: 'Camera Started',
      cameraStopped: 'Camera Stopped',
      cameraError: 'Camera Error',
      qrScannedSuccess: 'QR Code Scanned Successfully',
      invalidQRCode: 'Invalid QR Code',
      workspaceJoined: 'Workspace Joined Successfully',
      alreadyJoined: 'Already Joined This Workspace',
      backToWorkspaces: 'Back to Workspaces',
      projectChat: 'Project Chat',
    },
    reports: {
      completionReport: 'Completion Report',
      downloadReport: 'Download Report',
      shareReport: 'Share Report',
      overallCompletion: 'Overall Completion',
      levelDetails: 'Level Details',
      strengths: 'Strengths',
      improvements: 'Areas for Improvement',
    },
    certificates: {
      certificateSystem: 'Certificate System',
      yourProgress: 'Your Progress',
      completion: 'Completion',
      performance: 'Performance',
      unlockCertificate: 'Unlock Certificate',
      certificateLocked: 'Certificate Locked',
      certificateUnlocked: 'Certificate Unlocked',
      completionRequired: 'Completion Required',
      generateCertificate: 'Generate Certificate',
      downloadCertificate: 'Download Certificate',
      enterName: 'Enter Your Name',
      namePlaceholder: 'Your Name',
      certificateType: 'Certificate Type',
      completionCertificate: 'Completion Certificate',
      excellenceCertificate: 'Excellence Certificate',
      excellenceDesc: 'Certificate of Excellence in Feasibility Study',
      completionDesc: 'Certificate of Completion for Feasibility Study',
      checkpointTitle: 'Checkpoint',
      checkpointDesc: 'Verify your completion of previous levels to unlock the certificate',
      remainingSteps: 'Remaining Steps',
      keepGoing: 'Keep Going',
      closeCheckpoint: 'Close Checkpoint',
      projectName: 'Project Name',
      completionDate: 'Completion Date',
      certificateId: 'Certificate ID',
      generating: 'Generating Certificate...',
      levelsCompleted: 'Levels Completed',
      totalPoints: 'Total Points',
      achievementUnlocked: 'Achievement Unlocked',
      readyToGenerate: 'Ready to Generate Certificate',
      viewCertificates: 'View Certificates',
      noCertificatesYet: 'No Certificates Yet',
      earnYourFirst: 'Earn Your First Certificate!',
    },
    notifications: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      markAsRead: 'Mark as read',
      clearAll: 'Clear All',
      achievement: 'Achievement',
      badge: 'Badge',
      badgesAndAchievements: 'Badges and Achievements',
      deadline: 'Deadline',
      feedback: 'Feedback',
      system: 'System',
    },
    leaderboard: {
      title: 'Leaderboard',
      global: 'Global',
      country: 'Country',
      university: 'University',
      class: 'Class',
      rank: 'Rank',
      totalXP: 'Total XP',
      levelsCompleted: 'Levels Completed',
      badges: 'Badges',
      you: 'You',
      backToDashboard: 'Back to Dashboard',
      competeWithBest: 'Compete with the Best',
      yourCurrentRank: 'Your Current Rank',
      level: 'Level',
      points: 'Points',
      completedModules: 'Completed Modules',
      user: 'User',
      modules: 'Modules',
      noData: 'No Data Available',
      noUsersFound: 'No Users Found',
      viewGlobalRanking: 'View Global Ranking',
      backShortcut: 'Back',
      switchShortcut: 'Switch',
      oman: 'Oman',
      myUniversity: 'My University',
      myClass: 'My Class',
      badgesCount: 'Badges Count',
    },
    chatbot: {
      title: 'AI Assistant',
      askQuestion: 'Ask a question',
      typeMessage: 'Type your message here...',
      send: 'Send',
      quickActions: 'Quick Actions',
      close: 'Close',
    },
    businessPlan: {
      projectInfo: 'Project Information',
      shareholders: 'Shareholder Information',
      competitors: 'Competitor Analysis',
      assets: 'Asset Management',
      pricing: 'Pricing',
      revenue: 'Revenue',
      expenses: 'Expenses',
      financial: 'Financial Planning',
      implementation: 'Implementation',
      downloadExcel: 'Download Excel',
      progress: 'Progress',
    },
    roles: {
      student: '🎓 Student',
      lecturer: '👨‍🏫 Teacher',
      admin: '⚙️ Admin',
    },
    time: {
      now: 'Now',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '%d days ago',
      hoursAgo: '%d hours ago',
      minutesAgo: '%d minutes ago',
      justNow: 'Just now',
    },
    videoLibrary: {
      title: 'Video Library',
      subtitle: 'Explore a wide range of educational videos',
      backToDashboard: 'Back to Main Dashboard',
      searchPlaceholder: 'Search for a video...',
      allCategories: 'All Categories',
      freePlan: 'Free Plan',
      premiumPlan: 'Premium Plan',
      enterprisePlan: 'Enterprise Plan',
      freePlanDesc: 'Access a limited set of educational videos',
      premiumPlanDesc: 'Access a wide range of educational videos',
      enterprisePlanDesc: 'Access a full set of educational videos',
      upgradeNow: 'Upgrade Now',
      new: 'New',
      completed: 'Completed',
      minutes: 'Minutes',
      views: 'Views',
      premium: 'Premium',
      enterprise: 'Enterprise',
      level: 'Level',
      noResults: 'No results found',
      resetSearch: 'Reset Search',
      instructor: 'Instructor',
      close: 'Close',
      videos: {
        'VHib1fXVEhA': 'Why should you start with a feasibility study?',
        '-qq-hrT0ETo': 'How long does a feasibility study take?',
        '2y6zifyxcMU': 'Does every project need a feasibility study?',
        'kPtYe7HUwe4': 'What is the difference between regular planning and a feasibility study?',
        'nb72b1dPCU8': 'How much does a feasibility study cost?',
        '0lyOPBoYvvQ': 'Types of competitors',
        'Sq0Gud80w6k': 'Same level?',
        'mG4X6xli9wo': 'Is your project running on luck?',
        'Cckrsqtjz1M': 'Not your fault, but it’s your responsibility',
        'nunwgrmfsxo': 'Want to boast? Be careful, it can harm your reputation',
        'yBg5bAuFq9s': 'Is the mistake yours?',
        'LE4GQGtR3Y0': 'Gulf statistical work',
      },
    },
    consultation: {
      title: 'Professional Consultation',
      subtitle: 'Connect with certified experts to help you with your project',
      backToDashboard: 'Back to Dashboard',
      backToList: 'Back to Consultants List',
      freeTrial: 'Free Trial',
      freeMessagesLeft: 'free messages remaining',
      messagesRemaining: 'messages remaining',
      startConversation: 'Start Conversation',
      consultations: 'consultations',
      responseTime: 'Response time',
      perMessage: 'message',
      verified: 'Verified',
      responds: 'Responds within',
      sendFree: 'Send Free',
      send: 'Send',
      typeQuestion: 'Type your question here...',
      noMessages: 'No messages yet',
      startChatWith: 'Start chat with',
      paymentTitle: 'Payment for Consultation',
      paymentDesc: 'You have used all your free messages',
      messageCost: 'Message cost',
      cancel: 'Cancel',
      payAndSend: 'Pay and Send',
    },
    messaging: {
      title: 'Messaging & Reports Center',
      subtitle: 'Communicate with teacher or report an issue',
      backToDashboard: 'Back to Dashboard',
      newMessage: 'New Message',
      searchPlaceholder: 'Search in your messages...',
      allMessages: 'All Messages',
      general: 'General',
      help: 'Help Request',
      report: 'Report',
      noMessages: 'No messages',
      teacherReply: 'Teacher Reply',
      pending: 'Pending',
      replied: 'Replied',
      sent: 'Sent',
      newMessageTitle: 'New Message',
      messageType: 'Message Type',
      subject: 'Subject',
      subjectRequired: 'Subject *',
      message: 'Message',
      messageRequired: 'Message *',
      subjectPlaceholder: 'Write message subject...',
      messagePlaceholder: 'Write your message here...',
      cancel: 'Cancel',
      send: 'Send',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      role: 'Role',
      student: 'Student',
      teacher: 'Teacher',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
      orContinueWith: 'Or continue with',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      // Error messages
      emailNotFound: 'Email not found',
      incorrectPassword: 'Incorrect password',
      loginFailed: 'Login failed',
    },
    visualization3D: {
      title: '3D Project Visualization',
      subtitle: 'Explore your project interactively in 3D',
      backToDashboard: 'Back to Dashboard',
      openViewer: '3D View',
      fullProjectView: 'Full Project View',
      orbit: 'Orbit',
      zoom: 'Zoom',
      reset: 'Reset View',
      autoRotate: 'Auto-Rotate',
      pause: 'Pause',
      play: 'Play',
      share: 'Share',
      download: 'Download',
      shareLink: 'Share link',
      embedCode: 'Embed code',
      downloadPng: 'Download PNG snapshot',
      levelDetails: 'Level Details',
      progress: 'Progress',
      xp: 'XP',
      grade: 'Grade',
      statusDone: 'Done',
      statusInProgress: 'In Progress',
      statusAvailable: 'Available',
      statusLocked: 'Locked',
      hint: 'Drag to orbit • Scroll to zoom • Click a node for details',
      noWebGLNotice: 'Fallback mode — WebGL not supported on this device',
    },
  },
};

// Helper function to get translation
export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// Hook for using translations
export function useTranslations(lang: Language) {
  return {
    t: (key: string) => getTranslation(lang, key),
    translations: translations[lang],
  };
}