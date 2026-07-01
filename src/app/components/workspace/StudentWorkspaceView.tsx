import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy, Lock, Eye, CheckCircle, AlertTriangle, Users, ArrowLeft, MessageSquare,
  Camera, Upload, X, Sparkles, FolderOpen, Clock, Play, Trash2, Filter,
  Search, SortAsc, Star, Rocket, QrCode, PlusCircle, BookOpen, TrendingUp,
  ChevronRight, BarChart3, Calendar, Target, Layers, Save, RefreshCw, Zap,
  FileText, Download
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import { isDemoCode, getDemoProjectTemplate, createDemoFork, DEMO_PROJECT_CODE } from '@/app/data/demoProjectCode';
import type { SavedProject } from '@/app/contexts/YieldXContext';
import { FeasibilityStudyExport } from '@/app/components/reports/FeasibilityStudyExport';
import { NewStudyModal } from './NewStudyModal';

// ─── Helper ────────────────────────────────────────────────────────────────────
function formatDate(iso: string, language: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return iso.slice(0, 10); }
}

function getLevelLabel(level: number, language: string): string {
  const labels: Record<number, { ar: string; en: string }> = {
    0: { ar: 'المستوى 0 – نوع المشروع', en: 'Level 0 – Project Type' },
    1: { ar: 'المستوى 1 – الهوية والملكية', en: 'Level 1 – Identity & Ownership' },
    2: { ar: 'المستوى 2 – الإطار القانوني', en: 'Level 2 – Legal Framework' },
    3: { ar: 'المستوى 3 – الموارد المادية', en: 'Level 3 – Physical Resources' },
    4: { ar: 'المستوى 4 – الموارد البشرية', en: 'Level 4 – Human Resources' },
    5: { ar: 'المستوى 5 – السوق والاستراتيجية', en: 'Level 5 – Market & Strategy' },
    6: { ar: 'المستوى 6 – التمويل والمؤشرات', en: 'Level 6 – Finance & KPIs' },
    7: { ar: 'المستوى 7 – النموذج الشامل', en: 'Level 7 – Full Implementation' },
  };
  return labels[level]?.[language === 'ar' ? 'ar' : 'en'] ?? (language === 'ar' ? `المستوى ${level}` : `Level ${level}`);
}

function getProjectTypeLabel(type: string | undefined, language: string): string {
  if (!type) return '';
  const map: Record<string, { ar: string; en: string }> = {
    agricultural: { ar: 'زراعي', en: 'Agricultural' },
    industrial:   { ar: 'صناعي', en: 'Industrial' },
    commercial:   { ar: 'تجاري', en: 'Commercial' },
    service:      { ar: 'خدمي', en: 'Service' },
  };
  return map[type]?.[language === 'ar' ? 'ar' : 'en'] ?? type;
}

function getSourceLabel(source: SavedProject['source'], language: string): string {
  const map: Record<string, { ar: string; en: string }> = {
    manual: { ar: 'يدوي', en: 'Manual' },
    qr:     { ar: 'رمز QR', en: 'QR Code' },
    code:   { ar: 'كود', en: 'Code' },
  };
  return map[source]?.[language === 'ar' ? 'ar' : 'en'] ?? source;
}

const PROJECT_TYPE_COLORS: Record<string, string> = {
  agricultural: 'from-green-500 to-emerald-500',
  industrial:   'from-orange-500 to-amber-500',
  commercial:   'from-blue-500 to-cyan-500',
  service:      'from-purple-500 to-pink-500',
};

const LEVEL_PROGRESS = (level: number) => Math.min(100, Math.round((level / 7) * 100));

// ─── Main Component ─────────────────────────────────────────────────────────────
export function StudentWorkspaceView() {
  const {
    user, language, translations, savedProjects, deleteSavedProject, loadSavedProject,
    setCurrentView, workspaces, currentWorkspace, setCurrentWorkspace,
    getWorkspaceByCode, forkWorkspace, createWorkspace, updateWorkspace,
    saveProject,
    getProjectChat, getUnreadMessageCount, markChatAsRead,
  } = useYieldX();

  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [exportProject, setExportProject] = useState<SavedProject | null>(null);
  const [showNewStudyModal, setShowNewStudyModal] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRTL = language === 'ar';

  // ── Filter & sort ────────────────────────────────────────────────────────────
  const filtered = savedProjects
    .filter(p => p.userId === user?.id)
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p =>
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastEditedDate).getTime() - new Date(a.lastEditedDate).getTime());

  const inProgressCount = savedProjects.filter(p => p.userId === user?.id && p.status === 'in-progress').length;
  const completedCount  = savedProjects.filter(p => p.userId === user?.id && p.status === 'completed').length;

  // ── QR Scanner ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (scannerRef.current && scannerActive) scannerRef.current.stop().catch(() => {}); };
  }, [scannerActive]);

  useEffect(() => {
    if (!isJoinDialogOpen && scannerRef.current && scannerActive) {
      scannerRef.current.stop().catch(() => {});
      setScannerActive(false); setIsScanning(false);
    }
  }, [isJoinDialogOpen, scannerActive]);

  const startCameraScanner = async () => {
    try {
      setIsScanning(true);
      const scanner = new Html5Qrcode('qr-reader-ws');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => { handleQRCodeScan(decoded); },
        () => {}
      );
      setScannerActive(true);
    } catch {
      toast.error(language === 'ar' ? 'لا يمكن الوصول إلى الكاميرا' : 'Cannot access camera');
      setIsScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current && scannerActive) {
      try { await scannerRef.current.stop(); } catch {}
      setScannerActive(false); setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const scanner = new Html5Qrcode('qr-reader-file-ws');
      const result = await scanner.scanFile(file, false);
      handleQRCodeScan(result);
    } catch {
      toast.error(language === 'ar' ? 'لا يمكن قراءة الكود من هذه الصورة' : 'Cannot read QR from image');
    }
  };

  const handleQRCodeScan = (code: string) => {
    setJoinCode(code.toUpperCase()); stopCameraScanner();
    toast.success(language === 'ar' ? 'تم مسح الكود بنجاح!' : 'Code scanned successfully!');
  };

  const handleJoinWorkspace = () => {
    if (!joinCode.trim()) {
      toast.error(language === 'ar' ? 'الرجاء إدخال كود الصف' : 'Please enter class code');
      return;
    }
    if (isDemoCode(joinCode)) {
      const demoTemplate = getDemoProjectTemplate(user?.id || '', user?.name || '');
      const templateWorkspace = createWorkspace(demoTemplate.name, demoTemplate.description, demoTemplate.mode);
      updateWorkspace(templateWorkspace.id, {
        createdBy: 'demo-teacher-id', createdByName: 'Dr. Amira Al-Balushi',
        isTemplate: true, classCode: DEMO_PROJECT_CODE,
        templateData: demoTemplate.templateData, status: 'active',
      });
      const forked = forkWorkspace(templateWorkspace.id);
      if (forked) {
        updateWorkspace(forked.id, {
          ...forked, mode: 'team',
          teams: [{ id: 'team-1', name: 'Project Team', members: [
            { id: user?.id || '', name: user?.name || '', email: user?.email || '', role: 'Team Leader', avatar: '' },
            { id: 'member-2', name: 'Sara Al-Habsi', email: 'sara@edu.om', role: 'Business Analyst', avatar: '' },
            { id: 'member-3', name: 'Hassan Al-Amri', email: 'hassan@edu.om', role: 'Financial Planner', avatar: '' },
          ]}],
        } as any);
        setIsJoinDialogOpen(false); setJoinCode('');
        toast.success(language === 'ar' ? 'تم إنشاء المشروع بنجاح!' : 'Project created successfully!');
      }
      return;
    }
    const workspace = getWorkspaceByCode(joinCode);
    if (!workspace || !workspace.isTemplate) {
      toast.error(language === 'ar' ? 'الكود غير صحيح' : 'Invalid code');
      return;
    }
    const forked = forkWorkspace(workspace.id);
    if (forked) {
      saveProject(forked.name, 'code');
      setIsJoinDialogOpen(false); setJoinCode('');
      toast.success(language === 'ar' ? 'تم العثور على المشروع' : 'Project found');
    }
  };

  const handleContinueProject = (project: SavedProject) => {
    loadSavedProject(project.id);
    setCurrentView('dashboard');
    toast.success(
      language === 'ar'
        ? `تم تحميل المشروع: ${project.name}`
        : `Project loaded: ${project.name}`
    );
  };

  const handleDeleteProject = (id: string) => {
    deleteSavedProject(id);
    setConfirmDeleteId(null);
    toast.success(language === 'ar' ? 'تم حذف المشروع' : 'Project deleted');
  };

  // ── Stars Background ─────────────────────────────────────────────────────────
  const stars = React.useMemo(
    () => Array.from({ length: 60 }, (_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100,
      dur: 2 + Math.random() * 3, delay: Math.random() * 2,
    })),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-[#0A0A1A] dark:via-[#12122A] dark:to-[#1A1040] relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map(s => (
          <motion.div key={s.id} className="absolute w-0.5 h-0.5 bg-indigo-400 dark:bg-white rounded-full"
            style={{ left: `${s.left}%`, top: `${s.top}%` }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* Glow Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 border-b border-indigo-200/60 dark:border-white/10 bg-white/80 dark:bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
              className="bg-white/70 dark:bg-white/10 border-indigo-200 dark:border-white/20 hover:bg-indigo-50 dark:hover:bg-white/20 text-slate-700 dark:text-white"
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              <span className={isRTL ? 'mr-2' : 'ml-2'}>{language === 'ar' ? 'رجوع' : 'Back'}</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {language === 'ar' ? 'مساحة العمل' : 'Workspace'}
              </h1>
              <p className="text-sm text-indigo-600 dark:text-indigo-300">
                {language === 'ar' ? 'جميع مشاريعك في مكان واحد' : 'All your projects in one place'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowNewStudyModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {language === 'ar' ? 'دراسة جديدة' : 'New Study'}
            </Button>
            <Button
              onClick={() => setIsJoinDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg gap-2"
            >
              <QrCode className="w-4 h-4" />
              {language === 'ar' ? 'انضمام بكود' : 'Join by Code'}
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: language === 'ar' ? 'إجمالي المشاريع' : 'Total Projects',
              value: savedProjects.filter(p => p.userId === user?.id).length,
              icon: <Layers className="w-5 h-5" />,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-500/20',
            },
            {
              label: language === 'ar' ? 'قيد التنفيذ' : 'In Progress',
              value: inProgressCount,
              icon: <Zap className="w-5 h-5" />,
              color: 'text-amber-600 dark:text-amber-400',
              bg: 'bg-amber-50 dark:bg-amber-500/20',
            },
            {
              label: language === 'ar' ? 'مكتملة' : 'Completed',
              value: completedCount,
              icon: <CheckCircle className="w-5 h-5" />,
              color: 'text-emerald-600 dark:text-emerald-400',
              bg: 'bg-emerald-50 dark:bg-emerald-500/20',
            },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-sm p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Filter + Search Bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          {/* Filter tabs */}
          <div className="flex gap-2 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-1 backdrop-blur-sm">
            {([
              { key: 'all', label: language === 'ar' ? 'الكل' : 'All' },
              { key: 'in-progress', label: language === 'ar' ? 'قيد التنفيذ' : 'In Progress' },
              { key: 'completed', label: language === 'ar' ? 'مكتملة' : 'Completed' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث عن مشروع...' : 'Search projects...'}
              className={`w-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>
        </div>

        {/* ── Project Cards Grid ── */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 backdrop-blur-sm p-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center">
                  <Rocket className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {savedProjects.filter(p => p.userId === user?.id).length === 0
                    ? (language === 'ar' ? 'لا توجد مشاريع محفوظة بعد' : 'No saved projects yet')
                    : (language === 'ar' ? 'لا توجد مشاريع مطابقة' : 'No matching projects')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  {language === 'ar'
                    ? 'ابدأ مشروعاً جديداً من لوحة التحكم واضغط على "حفظ المشروع" لتظهر هنا'
                    : 'Start a new project from the dashboard and press "Save Project" to see it here'}
                </p>
                <div className="flex gap-3 mt-2">
                  <Button
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className={isRTL ? 'mr-2' : 'ml-2'}>
                      {language === 'ar' ? 'ابدأ مشروعاً جديداً' : 'Start New Project'}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsJoinDialogOpen(true)}
                    className="border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className={isRTL ? 'mr-2' : 'ml-2'}>
                      {language === 'ar' ? 'انضمام بكود' : 'Join by Code'}
                    </span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <ProjectCard
                    project={project}
                    language={language}
                    isRTL={isRTL}
                    onContinue={handleContinueProject}
                    onDelete={(id) => setConfirmDeleteId(id)}
                    onExport={(p) => setExportProject(p)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-red-200 dark:border-red-500/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              {language === 'ar' ? 'حذف المشروع' : 'Delete Project'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {language === 'ar'
                ? 'هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this project? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => confirmDeleteId && handleDeleteProject(confirmDeleteId)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {language === 'ar' ? 'نعم، احذف' : 'Yes, Delete'}
            </Button>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="flex-1">
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Export Study ── */}
      {exportProject && (
        <FeasibilityStudyExport
          project={exportProject}
          onClose={() => setExportProject(null)}
        />
      )}

      {/* ── New Study Modal ── */}
      {showNewStudyModal && (
        <NewStudyModal onClose={() => setShowNewStudyModal(false)} />
      )}

      {/* ── Join by Code Dialog ── */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white text-xl">
              {language === 'ar' ? 'الانضمام إلى مشروع' : 'Join a Project'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-indigo-300">
              {language === 'ar'
                ? 'اختر طريقة الانضمام: إدخال يدوي، مسح QR بالكاميرا، أو رفع صورة'
                : 'Choose how to join: manual entry, camera scan, or image upload'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="manual" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="manual" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                <Copy className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'يدوي' : 'Manual'}
              </TabsTrigger>
              <TabsTrigger value="camera" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Camera className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'كاميرا' : 'Camera'}
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                <Upload className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'رفع صورة' : 'Upload'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <Input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder={language === 'ar' ? 'أدخل الكود هنا...' : 'Enter code here...'}
                className="bg-slate-50 dark:bg-slate-800 border-indigo-300 dark:border-indigo-500/30 text-center font-mono text-lg py-6"
              />
              <Button
                onClick={handleJoinWorkspace}
                disabled={!joinCode.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 py-6 text-lg"
              >
                {language === 'ar' ? 'انضمام' : 'Join'}
              </Button>
            </TabsContent>

            <TabsContent value="camera" className="space-y-4 mt-4">
              <div id="qr-reader-ws" className={`${isScanning ? 'block' : 'hidden'} w-full rounded-lg overflow-hidden border-2 border-blue-500`} />
              <div id="qr-reader-file-ws" className="hidden" />
              {!isScanning ? (
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-blue-500/30 p-8 text-center space-y-4">
                  <Camera className="w-16 h-16 text-blue-400 mx-auto" />
                  <Button onClick={startCameraScanner} className="bg-gradient-to-r from-blue-500 to-cyan-500 py-6 w-full text-lg">
                    <Camera className="w-5 h-5 mr-2" />
                    {language === 'ar' ? 'تشغيل الكاميرا' : 'Start Camera'}
                  </Button>
                </Card>
              ) : (
                <Button onClick={stopCameraScanner} variant="outline" className="w-full bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-300">
                  <X className="w-5 h-5 mr-2" />
                  {language === 'ar' ? 'إيقاف الكاميرا' : 'Stop Camera'}
                </Button>
              )}
              {joinCode && (
                <Card className="bg-green-50 dark:bg-green-500/10 border-green-500/30 p-4 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="font-mono text-lg text-slate-900 dark:text-white">{joinCode}</p>
                  <Button onClick={handleJoinWorkspace} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                    {language === 'ar' ? 'انضمام الآن' : 'Join Now'}
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <Card className="bg-slate-50 dark:bg-slate-800/50 border-cyan-500/30 p-8 text-center space-y-4">
                <Upload className="w-16 h-16 text-cyan-400 mx-auto" />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-cyan-500 to-blue-500 py-6 w-full text-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  {language === 'ar' ? 'اختيار صورة' : 'Choose Image'}
                </Button>
              </Card>
              {joinCode && (
                <Card className="bg-green-50 dark:bg-green-500/10 border-green-500/30 p-4 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="font-mono text-lg text-slate-900 dark:text-white">{joinCode}</p>
                  <Button onClick={handleJoinWorkspace} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                    {language === 'ar' ? 'انضمام الآن' : 'Join Now'}
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Project Card ───────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: SavedProject;
  language: string;
  isRTL: boolean;
  onContinue: (p: SavedProject) => void;
  onDelete: (id: string) => void;
  onExport: (p: SavedProject) => void;
}

function ProjectCard({ project, language, isRTL, onContinue, onDelete, onExport }: ProjectCardProps) {
  const progressPct = LEVEL_PROGRESS(project.currentLevel);
  const typeColor = PROJECT_TYPE_COLORS[project.projectType ?? ''] ?? 'from-indigo-500 to-purple-500';
  const isCompleted = project.status === 'completed';

  return (
    <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all shadow-sm hover:shadow-md h-full flex flex-col">
      {/* Top Gradient Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${typeColor} w-full`} />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug truncate mb-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
              }`}>
                {isCompleted ? <CheckCircle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {isCompleted
                  ? (language === 'ar' ? 'مكتمل' : 'Completed')
                  : (language === 'ar' ? 'قيد التنفيذ' : 'In Progress')}
              </span>

              {/* Source badge */}
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                {project.source === 'qr' ? <QrCode className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                {getSourceLabel(project.source, language)}
              </span>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={() => onDelete(project.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2">
          <InfoPill
            icon={<Target className="w-3.5 h-3.5" />}
            label={language === 'ar' ? 'المستوى الحالي' : 'Current Level'}
            value={getLevelLabel(project.currentLevel, language)}
            colorClass="text-indigo-600 dark:text-indigo-400"
          />
          {project.projectType && (
            <InfoPill
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              label={language === 'ar' ? 'نوع المشروع' : 'Project Type'}
              value={getProjectTypeLabel(project.projectType, language)}
              colorClass="text-purple-600 dark:text-purple-400"
            />
          )}
          <InfoPill
            icon={<Calendar className="w-3.5 h-3.5" />}
            label={language === 'ar' ? 'آخر تعديل' : 'Last Edited'}
            value={formatDate(project.lastEditedDate, language)}
            colorClass="text-slate-600 dark:text-slate-400"
          />
          <InfoPill
            icon={<Clock className="w-3.5 h-3.5" />}
            label={language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
            value={formatDate(project.createdAt, language)}
            colorClass="text-slate-600 dark:text-slate-400"
          />
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'التقدم الإجمالي' : 'Overall Progress'}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${typeColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>{language === 'ar' ? `المستوى ${project.currentLevel} من 7` : `Level ${project.currentLevel} of 7`}</span>
            {isCompleted && <span className="text-emerald-500">{language === 'ar' ? '✓ مكتمل' : '✓ Done'}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col gap-2">
          <Button
            onClick={() => onContinue(project)}
            className={`w-full bg-gradient-to-r ${typeColor} hover:opacity-90 text-white font-medium flex items-center justify-center gap-2 shadow-sm`}
          >
            {isCompleted ? (
              <>
                <Eye className="w-4 h-4" />
                {language === 'ar' ? 'عرض المشروع' : 'View Project'}
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {language === 'ar' ? 'متابعة المشروع' : 'Continue Project'}
                <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onExport(project)}
            className="w-full border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 gap-2 text-sm"
          >
            <FileText className="w-4 h-4" />
            {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function InfoPill({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: string; colorClass: string }) {
  return (
    <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2.5 border border-slate-100 dark:border-white/5">
      <div className={`flex items-center gap-1 mb-0.5 ${colorClass}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-tight line-clamp-2">{value}</p>
    </div>
  );
}
