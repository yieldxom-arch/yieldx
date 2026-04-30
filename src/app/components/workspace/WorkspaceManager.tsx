import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Folder, Users, User, Copy, Share2, QrCode, Link as LinkIcon, Check, AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { useYieldX, WorkspaceMode } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { ProjectGroupChat } from '@/app/components/chat/ProjectGroupChat';

export function WorkspaceManager() {
  const { user, workspaces, createWorkspace, updateWorkspace, setCurrentWorkspace, setCurrentView, generateQRCode, language, getProjectChat, getUnreadMessageCount, markChatAsRead } = useYieldX();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [selectedMode, setSelectedMode] = useState<WorkspaceMode>('individual');
  const [shareDialogWorkspace, setShareDialogWorkspace] = useState<string | null>(null);
  const [chatProjectId, setChatProjectId] = useState<string | null>(null);
  const [chatProjectName, setChatProjectName] = useState<string>('');

  // Translations
  const t = {
    backToDashboard: language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard',
    workspaceManager: language === 'ar' ? 'إدارة المشاريع' : 'Workspace Manager',
    manageDesc: language === 'ar' ? 'إدارة مشاريع الطلاب والمجموعات' : 'Manage student projects and groups',
    createProject: language === 'ar' ? 'إنشاء مشروع جديد' : 'Create New Project',
    myProjects: language === 'ar' ? 'مشاريعي' : 'My Projects',
    sharedWithMe: language === 'ar' ? 'مشارك معي' : 'Shared With Me',
    projectName: language === 'ar' ? 'اسم المشروع' : 'Project Name',
    description: language === 'ar' ? 'الوصف' : 'Description',
    workspaceMode: language === 'ar' ? 'نوع المشروع' : 'Workspace Mode',
    individual: language === 'ar' ? 'فردي' : 'Individual',
    group: language === 'ar' ? 'مجموعة' : 'Group',
    classroom: language === 'ar' ? 'صف دراسي' : 'Classroom',
    create: language === 'ar' ? 'إنشاء' : 'Create',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    classCode: language === 'ar' ? 'كود الصف' : 'Class Code',
    copyCode: language === 'ar' ? 'نسخ الكود' : 'Copy Code',
    copyLink: language === 'ar' ? 'نسخ الرابط' : 'Copy Link',
    share: language === 'ar' ? 'مشاركة' : 'Share',
    qrCode: language === 'ar' ? 'رمز QR' : 'QR Code',
    open: language === 'ar' ? 'فتح' : 'Open',
    generateTemplate: language === 'ar' ? 'إنشاء قالب' : 'Generate Template',
    noProjects: language === 'ar' ? 'لا توجد مشاريع بعد' : 'No projects yet',
    createFirst: language === 'ar' ? 'قم بإنشاء مشروعك الأول' : 'Create your first project',
    enterName: language === 'ar' ? 'الرجاء إدخال اسم المشروع' : 'Please enter project name',
    projectCreated: language === 'ar' ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully',
    templateCreated: language === 'ar' ? 'تم إنشاء القالب الأساسي' : 'Base template created',
    codeCopied: language === 'ar' ? 'تم نسخ الكود' : 'Code copied',
    linkCopied: language === 'ar' ? 'تم نسخ الرابط' : 'Link copied',
    optional: language === 'ar' ? 'اختياري' : 'optional',
    companyName: language === 'ar' ? 'اسم الشركة' : 'Company Name',
    shareholderName: language === 'ar' ? 'اسم المساهم' : 'Shareholder Name',
    competitor: language === 'ar' ? 'المنافس الأول' : 'First Competitor',
    competitiveAdvantage: language === 'ar' ? 'ميزتك التنافسية' : 'Your Competitive Advantage',
    equipment: language === 'ar' ? 'المعدات' : 'Equipment',
    job: language === 'ar' ? 'الوظيفة' : 'Job Title',
    location: language === 'ar' ? 'الموقع' : 'Location',
    targetMarket: language === 'ar' ? 'السوق المستهدف' : 'Target Market',
    executiveSummary: language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary',
  };

  const myWorkspaces = workspaces.filter((w) => w.createdBy === user?.id);
  const sharedWithMe = workspaces.filter((w) => w.forkedFrom && w.createdBy === user?.id);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      toast.error(t.enterName);
      return;
    }

    const workspace = createWorkspace(newWorkspaceName, newWorkspaceDescription, selectedMode);
    
    // Generate class code and QR code
    const classCode = generateQRCode();
    const qrCodeValue = `${window.location.origin}?workspace=${workspace.id}&code=${classCode}`;
    
    updateWorkspace(workspace.id, {
      classCode,
      qrCode: qrCodeValue,
      isTemplate: true,
      status: 'active',
    });

    toast.success(t.projectCreated);
    setIsCreateDialogOpen(false);
    setNewWorkspaceName('');
    setNewWorkspaceDescription('');
  };

  const handleGenerateTemplate = (workspaceId: string) => {
    // Auto-fill structure template (not answers)
    const templateData = {
      module1: { companyName: `[${t.companyName}]`, shareholderName1: `[${t.shareholderName}]`, totalCapital: 0 },
      module2: { competitor1: `[${t.competitor}]`, competitiveAdvantage: `[${t.competitiveAdvantage}]` },
      module3: { equipment1: `[${t.equipment}]`, equipment1Cost: 0 },
      module4: { omaniEmployee1: `[${t.job}]`, omaniSalary1: 0 },
      module5: { location: `[${t.location}]`, rentCost: 0 },
      module6: { targetMarket: `[${t.targetMarket}]` },
      module7: { initialInvestment: 0, monthlyRevenue: 0 },
      module8: { executiveSummary: `[${t.executiveSummary}]` },
    };

    updateWorkspace(workspaceId, { templateData });
    toast.success(t.templateCreated);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t.codeCopied);
  };

  const handleCopyLink = (workspaceId: string, code: string) => {
    const link = `${window.location.origin}?workspace=${workspaceId}&code=${code}`;
    navigator.clipboard.writeText(link);
    toast.success(t.linkCopied);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-[#0F0F25] dark:via-[#1B1B3A] dark:to-[#2A4A5A] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('teacher-main-dashboard')}
            className="mb-4 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToDashboard}
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {t.workspaceManager}
              </h1>
              <p className="text-slate-600 dark:text-gray-400">
                {t.manageDesc}
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.createProject}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-[#1B1B3A]" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-white">{t.createProject}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-900 dark:text-white">{t.projectName}</Label>
                    <Input
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder={t.projectName}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-900 dark:text-white">{t.description} ({t.optional})</Label>
                    <Textarea
                      value={newWorkspaceDescription}
                      onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                      placeholder={t.description}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-900 dark:text-white">{t.workspaceMode}</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        variant={selectedMode === 'individual' ? 'default' : 'outline'}
                        onClick={() => setSelectedMode('individual')}
                        className="w-full"
                      >
                        <User className="w-4 h-4 mr-2" />
                        {t.individual}
                      </Button>
                      <Button
                        variant={selectedMode === 'group' ? 'default' : 'outline'}
                        onClick={() => setSelectedMode('group')}
                        className="w-full"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {t.group}
                      </Button>
                      <Button
                        variant={selectedMode === 'classroom' ? 'default' : 'outline'}
                        onClick={() => setSelectedMode('classroom')}
                        className="w-full"
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        {t.classroom}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      {t.cancel}
                    </Button>
                    <Button onClick={handleCreateWorkspace} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      {t.create}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Workspaces Tabs */}
        <Tabs defaultValue="my-projects" className="w-full">
          <TabsList className="bg-white dark:bg-[#1B1B3A] mb-6">
            <TabsTrigger value="my-projects">{t.myProjects}</TabsTrigger>
            <TabsTrigger value="shared">{t.sharedWithMe}</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects">
            {myWorkspaces.length === 0 ? (
              <Card className="p-12 text-center border-dashed bg-white dark:bg-[#1B1B3A]">
                <Folder className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {t.noProjects}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 mb-4">
                  {t.createFirst}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.createProject}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myWorkspaces.map((workspace) => (
                  <Card key={workspace.id} className="p-6 hover:shadow-lg transition-shadow bg-white dark:bg-[#1B1B3A]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          {workspace.mode === 'individual' && <User className="w-6 h-6 text-white" />}
                          {workspace.mode === 'group' && <Users className="w-6 h-6 text-white" />}
                          {workspace.mode === 'classroom' && <Folder className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{workspace.name}</h3>
                          {workspace.description && (
                            <p className="text-xs text-slate-600 dark:text-gray-400">{workspace.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {workspace.classCode && (
                      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-gray-400 mb-1">{t.classCode}</p>
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
                            {workspace.classCode}
                          </code>
                          <Button size="sm" variant="ghost" onClick={() => handleCopyCode(workspace.classCode!)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={() => {
                          setCurrentWorkspace(workspace.id);
                          setCurrentView('workspace');
                        }}
                      >
                        {t.open}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setChatProjectId(workspace.id);
                          setChatProjectName(workspace.name);
                        }}
                        className="relative"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {getUnreadMessageCount(workspace.id, user?.id || '') > 0 && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                        )}
                      </Button>
                      {workspace.classCode && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShareDialogWorkspace(workspace.id)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <Dialog open={shareDialogWorkspace === workspace.id} onOpenChange={(open) => !open && setShareDialogWorkspace(null)}>
                      <DialogContent className="bg-white dark:bg-[#1B1B3A]" aria-describedby={undefined}>
                        <DialogHeader>
                          <DialogTitle className="text-slate-900 dark:text-white">{t.share}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="bg-white p-4 rounded-lg inline-block">
                              <QRCodeSVG value={workspace.qrCode || ''} size={200} />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-gray-400 mt-4">{t.qrCode}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleCopyCode(workspace.classCode!)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              {t.copyCode}
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleCopyLink(workspace.id, workspace.classCode!)}
                            >
                              <LinkIcon className="w-4 h-4 mr-2" />
                              {t.copyLink}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared">
            {sharedWithMe.length === 0 ? (
              <Card className="p-12 text-center border-dashed bg-white dark:bg-[#1B1B3A]">
                <Share2 className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {t.noProjects}
                </h3>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedWithMe.map((workspace) => (
                  <Card key={workspace.id} className="p-6 hover:shadow-lg transition-shadow bg-white dark:bg-[#1B1B3A]">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{workspace.name}</h3>
                    {workspace.description && (
                      <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">{workspace.description}</p>
                    )}
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => {
                        setCurrentWorkspace(workspace.id);
                        setCurrentView('workspace');
                      }}
                    >
                      {t.open}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Group Chat */}
      {chatProjectId && (
        <ProjectGroupChat
          projectId={chatProjectId}
          projectName={chatProjectName}
          isOpen={!!chatProjectId}
          onClose={() => {
            setChatProjectId(null);
            setChatProjectName('');
          }}
        />
      )}
    </div>
  );
}