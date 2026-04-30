/**
 * Demo Teacher Data
 * 
 * Pre-populated data for demo.teacher@yieldx.com account only.
 * Shows realistic platform usage for presentations.
 */

/**
 * Check if current user is demo teacher
 */
export const isDemoTeacher = (email: string | undefined): boolean => {
  return email?.toLowerCase() === 'demo.teacher@yieldx.com';
};

/**
 * Demo Teacher Statistics
 */
export const DEMO_TEACHER_STATS = {
  totalStudents: 127,
  activeClasses: 5,
  completedProjects: 89,
  pendingSubmissions: 23,
  averageGrade: 87.5,
  engagement: 94,
  totalAssignments: 156,
  gradedAssignments: 133,
};

/**
 * Demo Students for Leaderboard
 */
export const DEMO_STUDENTS = [
  {
    id: 'student-1',
    name: 'فاطمة المعمرية',
    nameEn: 'Fatima Al-Maamari',
    email: 'fatima.maamari@student.edu.om',
    avatar: '',
    totalXP: 2850,
    level: 7,
    completedProjects: 3,
    averageGrade: 95,
    streak: 15,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    badges: ['🏆', '⚡', '🎯', '📊'],
  },
  {
    id: 'student-2',
    name: 'أحمد الحبسي',
    nameEn: 'Ahmed Al-Habsi',
    email: 'ahmed.habsi@student.edu.om',
    avatar: '',
    totalXP: 2730,
    level: 7,
    completedProjects: 3,
    averageGrade: 92,
    streak: 12,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    badges: ['🏆', '⚡', '🎯'],
  },
  {
    id: 'student-3',
    name: 'سارة البلوشية',
    nameEn: 'Sara Al-Balushi',
    email: 'sara.balushi@student.edu.om',
    avatar: '',
    totalXP: 2680,
    level: 6,
    completedProjects: 2,
    averageGrade: 91,
    streak: 10,
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    badges: ['🏆', '⚡'],
  },
  {
    id: 'student-4',
    name: 'خالد الرواحي',
    nameEn: 'Khalid Al-Rawahi',
    email: 'khalid.rawahi@student.edu.om',
    avatar: '',
    totalXP: 2550,
    level: 6,
    completedProjects: 2,
    averageGrade: 89,
    streak: 8,
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    badges: ['🏆', '🎯'],
  },
  {
    id: 'student-5',
    name: 'مريم السيابية',
    nameEn: 'Maryam Al-Siyabi',
    email: 'maryam.siyabi@student.edu.om',
    avatar: '',
    totalXP: 2480,
    level: 6,
    completedProjects: 2,
    averageGrade: 88,
    streak: 7,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    badges: ['🏆'],
  },
  {
    id: 'student-6',
    name: 'محمد العبري',
    nameEn: 'Mohammed Al-Abri',
    email: 'mohammed.abri@student.edu.om',
    avatar: '',
    totalXP: 2350,
    level: 5,
    completedProjects: 2,
    averageGrade: 86,
    streak: 5,
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    badges: ['🎯'],
  },
  {
    id: 'student-7',
    name: 'نورة الهنائية',
    nameEn: 'Noora Al-Hinai',
    email: 'noora.hinai@student.edu.om',
    avatar: '',
    totalXP: 2280,
    level: 5,
    completedProjects: 1,
    averageGrade: 85,
    streak: 6,
    lastActive: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    badges: ['⚡'],
  },
  {
    id: 'student-8',
    name: 'يوسف الشحي',
    nameEn: 'Yousif Al-Shehhi',
    email: 'yousif.shehhi@student.edu.om',
    avatar: '',
    totalXP: 2150,
    level: 5,
    completedProjects: 1,
    averageGrade: 84,
    streak: 4,
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    badges: [],
  },
  {
    id: 'student-9',
    name: 'عائشة الكندية',
    nameEn: 'Aisha Al-Kindi',
    email: 'aisha.kindi@student.edu.om',
    avatar: '',
    totalXP: 2050,
    level: 5,
    completedProjects: 1,
    averageGrade: 82,
    streak: 3,
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    badges: [],
  },
  {
    id: 'student-10',
    name: 'سعيد المقبالي',
    nameEn: 'Saeed Al-Maqbali',
    email: 'saeed.maqbali@student.edu.om',
    avatar: '',
    totalXP: 1950,
    level: 4,
    completedProjects: 1,
    averageGrade: 81,
    streak: 2,
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    badges: [],
  },
];

/**
 * Demo Classes
 */
export const DEMO_CLASSES = [
  {
    id: 'class-1',
    name: 'ريادة الأعمال - المستوى المتقدم',
    nameEn: 'Entrepreneurship - Advanced Level',
    code: 'ENT401',
    students: 32,
    activeProjects: 28,
    completedProjects: 24,
    averageProgress: 78,
    semester: 'Fall 2025',
    schedule: 'Sun, Tue, Thu - 10:00 AM',
  },
  {
    id: 'class-2',
    name: 'دراسات الجدوى - المستوى المتوسط',
    nameEn: 'Feasibility Studies - Intermediate',
    code: 'FS301',
    students: 28,
    activeProjects: 25,
    completedProjects: 20,
    averageProgress: 72,
    semester: 'Fall 2025',
    schedule: 'Mon, Wed - 2:00 PM',
  },
  {
    id: 'class-3',
    name: 'إدارة المشاريع الصغيرة',
    nameEn: 'Small Business Management',
    code: 'SBM201',
    students: 35,
    activeProjects: 30,
    completedProjects: 28,
    averageProgress: 85,
    semester: 'Fall 2025',
    schedule: 'Sun, Thu - 8:30 AM',
  },
  {
    id: 'class-4',
    name: 'التخطيط المالي للشركات الناشئة',
    nameEn: 'Financial Planning for Startups',
    code: 'FIN302',
    students: 18,
    activeProjects: 15,
    completedProjects: 12,
    averageProgress: 68,
    semester: 'Fall 2025',
    schedule: 'Tue - 11:00 AM',
  },
  {
    id: 'class-5',
    name: 'الابتكار وتطوير الأعمال',
    nameEn: 'Innovation & Business Development',
    code: 'IBD402',
    students: 14,
    activeProjects: 12,
    completedProjects: 5,
    averageProgress: 55,
    semester: 'Fall 2025',
    schedule: 'Wed - 3:30 PM',
  },
];

/**
 * Demo Recent Activities
 */
export const DEMO_ACTIVITIES = [
  {
    id: 'activity-1',
    type: 'submission',
    student: 'فاطمة المعمرية',
    studentEn: 'Fatima Al-Maamari',
    action: 'قدمت',
    actionEn: 'submitted',
    target: 'Business Plan - Level 7',
    targetAr: 'خطة العمل - المستوى 7',
    class: 'ENT401',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
    status: 'pending',
  },
  {
    id: 'activity-2',
    type: 'completion',
    student: 'أحمد الحبسي',
    studentEn: 'Ahmed Al-Habsi',
    action: 'أكمل',
    actionEn: 'completed',
    target: 'Financial Analysis Module',
    targetAr: 'وحدة التحليل المالي',
    class: 'FS301',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'activity-3',
    type: 'submission',
    student: 'سارة البلوشية',
    studentEn: 'Sara Al-Balushi',
    action: 'قدمت',
    actionEn: 'submitted',
    target: 'SWOT Analysis - Level 5',
    targetAr: 'تحليل SWOT - المستوى 5',
    class: 'ENT401',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'graded',
    grade: 92,
  },
  {
    id: 'activity-4',
    type: 'question',
    student: 'خالد الرواحي',
    studentEn: 'Khalid Al-Rawahi',
    action: 'طرح سؤال في',
    actionEn: 'asked a question in',
    target: 'Project Discussion',
    targetAr: 'نقاش المشروع',
    class: 'SBM201',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'activity-5',
    type: 'achievement',
    student: 'مريم السيابية',
    studentEn: 'Maryam Al-Siyabi',
    action: 'حصلت على',
    actionEn: 'earned',
    target: 'Level Master Badge',
    targetAr: 'وسام إتمام المستوى',
    class: 'ENT401',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'activity-6',
    type: 'submission',
    student: 'محمد العبري',
    studentEn: 'Mohammed Al-Abri',
    action: 'قدم',
    actionEn: 'submitted',
    target: 'Market Research - Level 4',
    targetAr: 'بحث السوق - المستوى 4',
    class: 'FS301',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'activity-7',
    type: 'completion',
    student: 'نورة الهنائية',
    studentEn: 'Noora Al-Hinai',
    action: 'أكملت',
    actionEn: 'completed',
    target: 'Team Collaboration Task',
    targetAr: 'مهمة التعاون الجماعي',
    class: 'IBD402',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'activity-8',
    type: 'submission',
    student: 'يوسف الشحي',
    studentEn: 'Yousif Al-Shehhi',
    action: 'قدم',
    actionEn: 'submitted',
    target: 'Business Model Canvas',
    targetAr: 'نموذج العمل التجاري',
    class: 'SBM201',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'graded',
    grade: 88,
  },
];

/**
 * Demo Pending Submissions
 */
export const DEMO_SUBMISSIONS = [
  {
    id: 'sub-1',
    student: 'فاطمة المعمرية',
    studentEn: 'Fatima Al-Maamari',
    assignment: 'Business Plan - Level 7',
    assignmentAr: 'خطة العمل - المستوى 7',
    class: 'ENT401',
    submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'on-time',
    priority: 'high',
  },
  {
    id: 'sub-2',
    student: 'محمد العبري',
    studentEn: 'Mohammed Al-Abri',
    assignment: 'Market Research - Level 4',
    assignmentAr: 'بحث السوق - المستوى 4',
    class: 'FS301',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'on-time',
    priority: 'high',
  },
  {
    id: 'sub-3',
    student: 'خالد الرواحي',
    studentEn: 'Khalid Al-Rawahi',
    assignment: 'Financial Projections',
    assignmentAr: 'التوقعات المالية',
    class: 'FIN302',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'on-time',
    priority: 'medium',
  },
  {
    id: 'sub-4',
    student: 'عائشة الكندية',
    studentEn: 'Aisha Al-Kindi',
    assignment: 'SWOT Analysis',
    assignmentAr: 'تحليل SWOT',
    class: 'SBM201',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'late',
    priority: 'urgent',
  },
  {
    id: 'sub-5',
    student: 'سعيد المقبالي',
    studentEn: 'Saeed Al-Maqbali',
    assignment: 'Competitive Analysis',
    assignmentAr: 'تحليل المنافسين',
    class: 'IBD402',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'late',
    priority: 'urgent',
  },
];

/**
 * Demo Notifications
 */
export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'submission',
    title: 'New Submission',
    titleAr: 'تقديم جديد',
    message: 'Fatima Al-Maamari submitted Business Plan - Level 7',
    messageAr: 'قدمت فاطمة المعمرية خطة العمل - المستوى 7',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    icon: '📝',
  },
  {
    id: 'notif-2',
    type: 'question',
    title: 'Student Question',
    titleAr: 'سؤال طالب',
    message: 'Khalid Al-Rawahi asked a question in Project Discussion',
    messageAr: 'طرح خالد الرواحي سؤالاً في نقاش المشروع',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: 'medium',
    icon: '❓',
  },
  {
    id: 'notif-3',
    type: 'deadline',
    title: 'Upcoming Deadline',
    titleAr: 'موعد نهائي قادم',
    message: '5 submissions due in 2 days for ENT401',
    messageAr: '5 تقديمات مستحقة خلال يومين لـ ENT401',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    icon: '⏰',
  },
  {
    id: 'notif-4',
    type: 'achievement',
    title: 'Student Achievement',
    titleAr: 'إنجاز طالب',
    message: 'Maryam Al-Siyabi earned Level Master Badge',
    messageAr: 'حصلت مريم السيابية على وسام إتمام المستوى',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low',
    icon: '🏆',
  },
  {
    id: 'notif-5',
    type: 'late',
    title: 'Late Submission',
    titleAr: 'تقديم متأخر',
    message: '2 late submissions require grading',
    messageAr: 'تقديمان متأخران يحتاجان للتقييم',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'urgent',
    icon: '⚠️',
  },
];

/**
 * Demo Analytics Data
 */
export const DEMO_ANALYTICS = {
  // Weekly engagement
  weeklyEngagement: [
    { day: 'Sun', value: 92 },
    { day: 'Mon', value: 88 },
    { day: 'Tue', value: 95 },
    { day: 'Wed', value: 85 },
    { day: 'Thu', value: 94 },
    { day: 'Fri', value: 78 },
    { day: 'Sat', value: 65 },
  ],

  // Monthly submissions
  monthlySubmissions: [
    { month: 'Sep', submitted: 45, graded: 42 },
    { month: 'Oct', submitted: 52, graded: 48 },
    { month: 'Nov', submitted: 48, graded: 45 },
    { month: 'Dec', submitted: 59, graded: 51 },
  ],

  // Grade distribution
  gradeDistribution: [
    { range: '90-100', count: 42 },
    { range: '80-89', count: 35 },
    { range: '70-79', count: 28 },
    { range: '60-69', count: 12 },
    { range: '0-59', count: 5 },
  ],

  // Project completion by sector
  projectsBySector: [
    { sector: 'Commercial', count: 32 },
    { sector: 'Industrial', count: 24 },
    { sector: 'Agricultural', count: 18 },
    { sector: 'Service', count: 15 },
  ],

  // Level completion rates
  levelCompletion: [
    { level: 'Level 0', completed: 127, total: 127, percentage: 100 },
    { level: 'Level 1', completed: 124, total: 127, percentage: 98 },
    { level: 'Level 2', completed: 118, total: 127, percentage: 93 },
    { level: 'Level 3', completed: 112, total: 127, percentage: 88 },
    { level: 'Level 4', completed: 105, total: 127, percentage: 83 },
    { level: 'Level 5', completed: 98, total: 127, percentage: 77 },
    { level: 'Level 6', completed: 92, total: 127, percentage: 72 },
    { level: 'Level 7', completed: 89, total: 127, percentage: 70 },
  ],
};

/**
 * Get demo teacher data
 * Returns all demo data ONLY for demo teacher account
 */
export const getDemoTeacherData = (email: string | undefined) => {
  if (!isDemoTeacher(email)) {
    return null;
  }

  return {
    stats: DEMO_TEACHER_STATS,
    students: DEMO_STUDENTS,
    classes: DEMO_CLASSES,
    activities: DEMO_ACTIVITIES,
    submissions: DEMO_SUBMISSIONS,
    notifications: DEMO_NOTIFICATIONS,
    analytics: DEMO_ANALYTICS,
  };
};
