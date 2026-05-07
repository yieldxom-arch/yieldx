import React from 'react';
import CertificateTest from '@/app/CertificateTest';
import { UserGuideGenerator } from '@/app/components/UserGuideGenerator';
import { CertificateTemplateManager } from '@/app/components/CertificateTemplateManager';
import { BulkCertificateGenerator } from '@/app/components/BulkCertificateGenerator';

// Set to true to preview the certificate
const PREVIEW_CERTIFICATE = false;
// Set to true to show user guide generator
const SHOW_USER_GUIDE = false;
// Set to true to show certificate template manager
const SHOW_CERTIFICATE_MANAGER = false;

import { YieldXProvider, useYieldX } from '@/app/contexts/YieldXContext';
import { LoginContainer } from '@/app/components/auth/LoginContainer';
import { ProfessionalDashboard } from '@/app/components/dashboard/ProfessionalDashboard';
import { TeacherMainDashboard } from '@/app/components/dashboard/TeacherMainDashboard';
import { OrganizationDashboard } from '@/app/components/dashboard/OrganizationDashboard';
import { Toaster } from '@/app/components/notifications/Toaster';
import { WorkspaceManager } from '@/app/components/workspace/WorkspaceManager';
import { StudentWorkspaceView } from '@/app/components/workspace/StudentWorkspaceView';
import { TeacherDashboard } from '@/app/components/teacher/TeacherDashboard';
import { ChatBot } from '@/app/components/chatbot/ChatBot';
import { SUBSCRIPTION_PLANS } from '@/app/data/subscriptionData';
import { ShortsLibrary } from '@/app/components/video-library/ShortsLibrary';
import { Leaderboard } from '@/app/components/leaderboard/Leaderboard';
import { MessagingCenter } from '@/app/components/messaging/MessagingCenter';
import { ProfessionalConsultation } from '@/app/components/consultation/ProfessionalConsultation';
import { HomePage } from '@/app/components/landing/HomePage';
import { SupabaseTest } from '@/app/components/test/SupabaseTest';
import { SimpleLevelsTest } from '@/app/components/test/SimpleLevelsTest';
import { TestLanding } from '@/app/components/test/TestLanding';
import {
  ShareholderModule,
  CompetitorModule,
  AssetModule,
  EmployeeModule,
  OperationsModule,
  MarketModule,
  FinancialModule,
  SummaryModule,
  // NEW 7-LEVEL SYSTEM (0-7)
  ProjectTypeModule,
  IdentityOwnershipModule,
  LegalFrameworkModule,
  PhysicalResourcesModule,
  HumanResourcesModule,
  MarketStrategyModule,
  FinancingKPIsModule,
  BMCImplementationModule,
  SmartLocationModule,
} from '@/app/components/modules/AllModules';
import BusinessPlanWizard from '@/app/components/business-plan/BusinessPlanWizard';
// Revolutionary Features
import { CopilotBridge } from '@/app/components/ai-copilot/CopilotBridge';
import { FeaturesShowcase } from '@/app/components/demo/FeaturesShowcase';
import { ColonyPage } from '@/app/components/pages/ColonyPage';
import { WarpDrivePage } from '@/app/components/pages/WarpDrivePage';
import { MigrationButton } from '@/app/components/admin/MigrationButton';
import { BusinessResources } from '@/app/components/BusinessResources';
import { Certificate } from '@/app/components/Certificate';
import { SimpleCertificate } from '@/app/components/SimpleCertificate';
// Lazy-loaded for code-splitting — the 3D canvas renderer is heavy
const ProjectVisualization3DPage = React.lazy(() =>
  import('@/app/components/visualization/ProjectVisualization3D').then((m) => ({
    default: m.ProjectVisualization3DPage,
  })),
);

function ConnectivityBanner() {
  const { isOnline } = useYieldX();
  const [showBanner, setShowBanner] = React.useState(false);
  const [wasOffline, setWasOffline] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Just came back online — show "reconnected" briefly
      setShowBanner(true);
      const t = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-500 ${
        isOnline
          ? 'bg-green-500/90 text-white'
          : 'bg-orange-500/90 text-white'
      }`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-green-200' : 'bg-orange-200'} animate-pulse`} />
      {isOnline
        ? '🌐 متصل بالإنترنت — تمت مزامنة البيانات مع السحابة | Back online — data synced'
        : '📴 أنت غير متصل — يعمل في وضع عدم الاتصال | You\'re offline — working locally'}
      {isOnline && (
        <button onClick={() => setShowBanner(false)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
      )}
    </div>
  );
}

function AppContent() {
  const { currentView, user, language } = useYieldX();
  const currentSubscription = SUBSCRIPTION_PLANS.find(plan => plan.id === user?.subscriptionTier);
  const showChatBot = !!currentSubscription?.hasAIAssistant;

  // Show migration helper in console
  React.useEffect(() => {
    console.log('%c🔧 YieldX Migration Helper', 'font-size: 16px; font-weight: bold; color: #f59e0b;');
    console.log('%cIf you see "profiles_role_check" errors, run:', 'color: #92400e;');
    console.log('%crunOrganizationRoleMigration()', 'font-size: 14px; font-weight: bold; color: #059669; background: #f0fdf4; padding: 4px 8px;');
    console.log('%cOr click the yellow button in the bottom-right corner!', 'color: #92400e;');
  }, []);

  const renderView = () => {
    // If no user is logged in and view is not auth-related or dashboard (demo mode), show home page
    if (!user && currentView !== 'auth' && currentView !== 'auth-login' && currentView !== 'auth-register' && currentView !== 'dashboard') {
      return <HomePage />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'auth':
      case 'auth-login':
        return <LoginContainer initialView="login" />;
      case 'auth-register':
        return <LoginContainer initialView="register" />;
      case 'dashboard':
        // Show different dashboards based on user role
        if (user?.role === 'lecturer') return <TeacherMainDashboard />;
        if (user?.role === 'organization') return <OrganizationDashboard />;
        return <ProfessionalDashboard />;
      case 'workspaces':
        return user?.role === 'lecturer' ? <WorkspaceManager /> : <StudentWorkspaceView />;
      case 'teacher-dashboard':
        return <TeacherDashboard />;
      case 'video-library':
        return <ShortsLibrary />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'messaging':
        return <MessagingCenter />;
      case 'professional-consultation':
        return <ProfessionalConsultation />;
      case 'business-plan':
        return <BusinessPlanWizard />;
      // Revolutionary Features Views
      case 'features-showcase':
        return <FeaturesShowcase language={language} />;
      case 'colony':
        return <ColonyPage />;
      case 'warp-drive':
        return <WarpDrivePage />;
      // TEST: Supabase Connection
      case 'test-supabase':
        return <SupabaseTest />;
      // TEST: Simple Levels Connection
      case 'test-simple-levels':
        return <SimpleLevelsTest />;
      // TEST: Landing Page
      case 'test-landing':
        return <TestLanding />;
      // ==========================================
      // NEW 7-LEVEL SYSTEM (0-7) - Primary Routing
      // Following Omani Feasibility Study Standards
      // ==========================================
      // Level 0: Project Type Selection (Agricultural/Industrial/Commercial/Service)
      case 'module-0':
        return <ProjectTypeModule />;
      // Level 1: Identity & Ownership (Business details, shareholders)
      case 'module-1':
        return <IdentityOwnershipModule />;
      // Level 2: Legal Framework (Licenses, insurance, property)
      case 'module-2':
        return <LegalFrameworkModule />;
      // Level 3: Physical Resources (Fixed assets, raw materials)
      case 'module-3':
        return <PhysicalResourcesModule />;
      // Level 4: Human Resources (Employees, Omanization, salaries)
      case 'module-4':
        return <HumanResourcesModule />;
      // Level 5: Market & Strategy (Competitors, products, SWOT)
      case 'module-5':
        return <MarketStrategyModule />;
      // Smart Location Intelligence (after Level 5)
      case 'smart-location':
        return <SmartLocationModule />;
      // Level 6: Financing & Financial KPIs (Investment, loans, IRR, NPV, ROI, etc.)
      case 'module-6':
        return <FinancingKPIsModule />;
      // Level 7: Business Model Canvas & Oman 2040 Contribution
      case 'module-7':
        return <BMCImplementationModule />;
      case 'project-3d-view':
        return (
          <React.Suspense
            fallback={
              <div style={{ minHeight: '100vh', background: '#0F0F25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, border: '3px solid #4ECDC440', borderTop: '3px solid #4ECDC4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ color: '#4ECDC4', fontSize: '13px', opacity: 0.7 }}>
                    {language === 'ar' ? 'جارٍ تحميل العرض ثلاثي الأبعاد…' : 'Loading 3D view…'}
                  </span>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            }
          >
            <ProjectVisualization3DPage />
          </React.Suspense>
        );
      case 'business-resources':
        return <BusinessResources />;
      case 'certificate':
        return <SimpleCertificate />;
      case 'certificate-manager':
        return <CertificateTemplateManager />;
      case 'bulk-certificates':
        return <BulkCertificateGenerator />;
      // OLD SYSTEM - Kept for backwards compatibility (now mapped to module-9 through module-16)
      case 'module-9':
        return <ShareholderModule />;
      case 'module-10':
        return <CompetitorModule />;
      case 'module-11':
        return <AssetModule />;
      case 'module-12':
        return <EmployeeModule />;
      case 'module-13':
        return <OperationsModule />;
      case 'module-14':
        return <MarketModule />;
      case 'module-15':
        return <FinancialModule />;
      case 'module-16':
        return <SummaryModule />;
      default:
        if (user?.role === 'lecturer') return <TeacherMainDashboard />;
        if (user?.role === 'organization') return <OrganizationDashboard />;
        return <ProfessionalDashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderView()}
      {/* Show AI Copilot Bridge when logged in */}
      {user && (
        <CopilotBridge
          language={language}
          onMessageRead={(id) => console.log('Read message:', id)}
          onActionTaken={(msgId, actionId) => console.log('Action taken:', msgId, actionId)}
        />
      )}
      {showChatBot && <ChatBot />}
    </div>
  );
}

export default function App() {
  // Show certificate template manager
  if (SHOW_CERTIFICATE_MANAGER) {
    return <CertificateTemplateManager />;
  }

  // Show user guide generator
  if (SHOW_USER_GUIDE) {
    return <UserGuideGenerator />;
  }

  // Preview certificate
  if (PREVIEW_CERTIFICATE) {
    return <CertificateTest />;
  }

  return (
    <YieldXProvider>
      <div className="min-h-screen">
        <ConnectivityBanner />
        <AppContent />
        <Toaster />
        {/* Temporary migration button - remove after migration is complete */}
        <MigrationButton />
      </div>
    </YieldXProvider>
  );
}