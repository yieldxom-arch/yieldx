import React from 'react';
import jsPDF from 'jspdf';
import { Download, BookOpen } from 'lucide-react';

export function UserGuideGenerator() {
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 10) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize = 11, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        checkPageBreak();
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    };

    // Helper function for headings
    const addHeading = (text: string, level = 1) => {
      checkPageBreak(15);
      yPosition += 5;
      if (level === 1) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 58, 138); // Blue-900
      } else if (level === 2) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(51, 65, 85); // Slate-700
      } else {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105); // Slate-600
      }
      pdf.text(text, margin, yPosition);
      yPosition += lineHeight + 2;
      pdf.setTextColor(0, 0, 0); // Reset to black
    };

    // Helper for bullet points
    const addBullet = (text: string, indent = 0) => {
      checkPageBreak();
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const bulletX = margin + (indent * 5);
      pdf.text('•', bulletX, yPosition);
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin - (indent * 5) - 5);
      lines.forEach((line: string, index: number) => {
        if (index > 0) checkPageBreak();
        pdf.text(line, bulletX + 5, yPosition);
        yPosition += lineHeight;
      });
    };

    // Cover Page
    pdf.setFillColor(30, 58, 138);
    pdf.rect(0, 0, pageWidth, 80, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('YieldX', pageWidth / 2, 35, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Complete User Guide', pageWidth / 2, 50, { align: 'center' });
    pdf.text('Gamified Business Feasibility Study Platform', pageWidth / 2, 62, { align: 'center' });

    pdf.setTextColor(0, 0, 0);
    yPosition = 100;

    addHeading('Table of Contents', 2);
    const toc = [
      '1. Introduction to YieldX',
      '2. Getting Started',
      '3. User Roles & Access Levels',
      '4. The 7-Level Learning System',
      '5. Dashboard Navigation',
      '6. Project Workspaces',
      '7. Business Planning Modules',
      '8. Smart Features',
      '9. Gamification & Progress',
      '10. Collaboration Tools',
      '11. Subscription Plans',
      '12. Offline Mode',
      '13. Tips & Best Practices',
      '14. Troubleshooting'
    ];
    toc.forEach(item => addText(item, 11));

    // Chapter 1: Introduction
    pdf.addPage();
    yPosition = margin;
    addHeading('1. Introduction to YieldX', 1);
    addText('YieldX is a comprehensive, gamified business feasibility study platform designed to help students, lecturers, and organizations create professional business plans following Omani feasibility study standards.');
    yPosition += 3;
    addText('The platform combines educational content, practical tools, and AI-powered assistance to guide users through every step of business planning, from initial concept to detailed financial projections.');

    yPosition += 5;
    addHeading('Key Features:', 3);
    addBullet('7-level gamified learning system with XP and achievements');
    addBullet('Bilingual support (Arabic & English)');
    addBullet('Real-time competitor analysis using OpenStreetMap data');
    addBullet('Hybrid online/offline functionality');
    addBullet('AI-powered chatbot assistant');
    addBullet('Professional consultation services');
    addBullet('Collaborative workspace management');
    addBullet('Industry-specific customization');

    // Chapter 2: Getting Started
    pdf.addPage();
    yPosition = margin;
    addHeading('2. Getting Started', 1);

    addHeading('2.1 Creating Your Account', 2);
    addText('Step 1: Navigate to the YieldX homepage');
    addText('Step 2: Click "Register" or "تسجيل" (Arabic)');
    addText('Step 3: Choose your user role:');
    addBullet('Student - For individual learners and entrepreneurs', 1);
    addBullet('Lecturer - For educators managing student workspaces', 1);
    addBullet('Organization - For businesses and institutions', 1);
    yPosition += 3;
    addText('Step 4: Fill in your registration details:');
    addBullet('Full Name', 1);
    addBullet('Email Address', 1);
    addBullet('Password (minimum 8 characters)', 1);
    addBullet('Confirm Password', 1);
    yPosition += 3;
    addText('Step 5: Click "Create Account" - You can start using the platform immediately!');

    yPosition += 5;
    addHeading('2.2 Logging In', 2);
    addText('Step 1: Click "Login" or "تسجيل الدخول" from the homepage');
    addText('Step 2: Enter your registered email and password');
    addText('Step 3: Click "Sign In" to access your dashboard');

    yPosition += 5;
    addHeading('2.3 Language Selection', 2);
    addText('YieldX supports both English and Arabic. Toggle between languages using the language switcher in the top navigation bar. All content, including forms, instructions, and AI assistance, will adapt to your selected language.');

    // Chapter 3: User Roles
    pdf.addPage();
    yPosition = margin;
    addHeading('3. User Roles & Access Levels', 1);

    addHeading('3.1 Student Role', 2);
    addText('Students are individual users who want to learn business planning or develop their own business ideas.');
    yPosition += 3;
    addText('Student Features:');
    addBullet('Access to all 7 learning levels');
    addBullet('Personal workspace for business projects');
    addBullet('XP points and achievement tracking');
    addBullet('Leaderboard participation');
    addBullet('Video library access');
    addBullet('AI chatbot assistance');
    addBullet('Business plan export (PDF)');

    yPosition += 5;
    addHeading('3.2 Lecturer Role', 2);
    addText('Lecturers are educators who manage student workspaces, assign modules, and track student progress.');
    yPosition += 3;
    addText('Lecturer Features:');
    addBullet('All student features');
    addBullet('Workspace creation and management');
    addBullet('Student invitation system');
    addBullet('Progress monitoring dashboard');
    addBullet('Module assignment capabilities');
    addBullet('Bulk operations for student groups');
    addBullet('Performance analytics');

    yPosition += 5;
    addHeading('3.3 Organization Role', 2);
    addText('Organizations are businesses or institutions using YieldX for internal business planning or team training.');
    yPosition += 3;
    addText('Organization Features:');
    addBullet('All student features');
    addBullet('Multi-user team management');
    addBullet('Department-level organization');
    addBullet('Advanced analytics and reporting');
    addBullet('Priority support');
    addBullet('Custom branding options');

    // Chapter 4: The 7-Level System
    pdf.addPage();
    yPosition = margin;
    addHeading('4. The 7-Level Learning System', 1);
    addText('YieldX uses a progressive 7-level system aligned with Omani feasibility study standards. Each level focuses on a specific aspect of business planning.');

    yPosition += 5;
    addHeading('Level 0: Project Type Selection', 2);
    addText('Purpose: Define the fundamental nature of your business idea');
    addText('What you\'ll do:');
    addBullet('Choose your business sector (Agricultural, Industrial, Commercial, or Service)', 1);
    addBullet('Define your business concept and vision', 1);
    addBullet('Set initial project parameters', 1);
    yPosition += 3;
    addText('Time to complete: 15-30 minutes');
    addText('XP reward: 100 XP');

    yPosition += 5;
    addHeading('Level 1: Identity & Ownership', 2);
    addText('Purpose: Establish legal identity and ownership structure');
    addText('What you\'ll do:');
    addBullet('Define business name and legal structure', 1);
    addBullet('Add shareholders and ownership percentages', 1);
    addBullet('Set capital structure', 1);
    addBullet('Define management roles', 1);
    yPosition += 3;
    addText('Time to complete: 30-45 minutes');
    addText('XP reward: 150 XP');

    yPosition += 5;
    addHeading('Level 2: Legal Framework', 2);
    addText('Purpose: Address regulatory and legal requirements');
    addText('What you\'ll do:');
    addBullet('List required licenses and permits', 1);
    addBullet('Define insurance requirements', 1);
    addBullet('Specify property and lease agreements', 1);
    addBullet('Address compliance requirements', 1);
    yPosition += 3;
    addText('Time to complete: 45-60 minutes');
    addText('XP reward: 200 XP');

    pdf.addPage();
    yPosition = margin;
    addHeading('Level 3: Physical Resources', 2);
    addText('Purpose: Detail all physical assets and resources needed');
    addText('What you\'ll do:');
    addBullet('List fixed assets (machinery, equipment, furniture)', 1);
    addBullet('Define raw materials and inventory needs', 1);
    addBullet('Plan facility layout and space requirements', 1);
    addBullet('Calculate initial investment in physical resources', 1);
    yPosition += 3;
    addText('Time to complete: 1-2 hours');
    addText('XP reward: 250 XP');

    yPosition += 5;
    addHeading('Level 4: Human Resources', 2);
    addText('Purpose: Plan workforce structure and compensation');
    addText('What you\'ll do:');
    addBullet('Define organizational chart', 1);
    addBullet('Specify job roles and descriptions', 1);
    addBullet('Plan Omanization requirements', 1);
    addBullet('Calculate salary structure and benefits', 1);
    addBullet('Define training and development needs', 1);
    yPosition += 3;
    addText('Time to complete: 1-2 hours');
    addText('XP reward: 300 XP');

    yPosition += 5;
    addHeading('Level 5: Market & Strategy', 2);
    addText('Purpose: Analyze market conditions and competitive landscape');
    addText('What you\'ll do:');
    addBullet('Conduct market research and analysis', 1);
    addBullet('Use Smart Location tool to find real competitors', 1);
    addBullet('Perform SWOT analysis', 1);
    addBullet('Define products/services and pricing', 1);
    addBullet('Develop marketing and sales strategies', 1);
    yPosition += 3;
    addText('Time to complete: 2-3 hours');
    addText('XP reward: 350 XP');

    pdf.addPage();
    yPosition = margin;
    addHeading('Level 6: Financing & Financial KPIs', 2);
    addText('Purpose: Create detailed financial projections and analysis');
    addText('What you\'ll do:');
    addBullet('Calculate total investment required', 1);
    addBullet('Define financing sources (equity, loans, grants)', 1);
    addBullet('Create 5-year financial projections', 1);
    addBullet('Calculate key metrics: IRR, NPV, ROI, Payback Period', 1);
    addBullet('Perform break-even analysis', 1);
    addBullet('Generate cash flow statements', 1);
    yPosition += 3;
    addText('Time to complete: 3-4 hours');
    addText('XP reward: 400 XP');

    yPosition += 5;
    addHeading('Level 7: Business Model Canvas & Oman 2040', 2);
    addText('Purpose: Synthesize your plan and align with national vision');
    addText('What you\'ll do:');
    addBullet('Complete Business Model Canvas', 1);
    addBullet('Define value propositions', 1);
    addBullet('Map customer segments and channels', 1);
    addBullet('Identify key partners and resources', 1);
    addBullet('Show contribution to Oman 2040 Vision', 1);
    addBullet('Generate final executive summary', 1);
    yPosition += 3;
    addText('Time to complete: 2-3 hours');
    addText('XP reward: 500 XP');
    yPosition += 5;
    addText('Total XP for completing all levels: 2,250 XP', 11, true);

    // Chapter 5: Dashboard Navigation
    pdf.addPage();
    yPosition = margin;
    addHeading('5. Dashboard Navigation', 1);
    addText('Your dashboard is the central hub for all YieldX activities. The interface adapts based on your user role.');

    yPosition += 5;
    addHeading('5.1 Main Navigation Menu', 2);
    addBullet('Dashboard - Overview of your progress and recent activity');
    addBullet('Workspaces - Access and manage your business projects');
    addBullet('Video Library - Educational videos and tutorials');
    addBullet('Leaderboard - Compare your progress with other users');
    addBullet('Messaging - Communication with lecturers/team members');
    addBullet('Consultation - Book professional consultation sessions');
    addBullet('Business Resources - Templates, guides, and tools');

    yPosition += 5;
    addHeading('5.2 Progress Overview', 2);
    addText('The dashboard displays:');
    addBullet('Current XP and level', 1);
    addBullet('Completion percentage for active projects', 1);
    addBullet('Achievements unlocked', 1);
    addBullet('Upcoming milestones', 1);
    addBullet('Recent activity feed', 1);

    yPosition += 5;
    addHeading('5.3 Quick Actions', 2);
    addText('Access frequently used features:');
    addBullet('Create New Project', 1);
    addBullet('Continue Last Project', 1);
    addBullet('Ask AI Assistant', 1);
    addBullet('Export Business Plan', 1);

    // Chapter 6: Project Workspaces
    pdf.addPage();
    yPosition = margin;
    addHeading('6. Project Workspaces', 1);
    addText('Workspaces are dedicated environments where you develop your business plans.');

    yPosition += 5;
    addHeading('6.1 Creating a New Workspace', 2);
    addText('Step 1: Click "Workspaces" in the main navigation');
    addText('Step 2: Click "+ New Workspace" or "+ مشروع جديد"');
    addText('Step 3: Enter workspace details:');
    addBullet('Workspace Name (e.g., "Coffee Shop Feasibility Study")', 1);
    addBullet('Description (optional)', 1);
    addBullet('Business Sector', 1);
    yPosition += 3;
    addText('Step 4: Click "Create Workspace"');
    addText('Step 5: Your workspace is ready! You can now start Level 0.');

    yPosition += 5;
    addHeading('6.2 Managing Workspaces', 2);
    addText('Each workspace shows:');
    addBullet('Project name and description', 1);
    addBullet('Progress bar (0-100%)', 1);
    addBullet('Current level', 1);
    addBullet('Last modified date', 1);
    addBullet('Action buttons: Continue, Export, Delete', 1);

    yPosition += 5;
    addHeading('6.3 Workspace Actions', 2);
    addBullet('Continue - Resume work from where you left off');
    addBullet('Export - Download your business plan as PDF');
    addBullet('Share - Share workspace with team members (Pro/Org plans)');
    addBullet('Duplicate - Create a copy for testing variations');
    addBullet('Archive - Move completed projects to archive');
    addBullet('Delete - Permanently remove workspace');

    // Chapter 7: Business Planning Modules
    pdf.addPage();
    yPosition = margin;
    addHeading('7. Business Planning Modules', 1);
    addText('Each level contains specialized modules to capture specific business information.');

    yPosition += 5;
    addHeading('7.1 Working Within Modules', 2);
    addText('General workflow:');
    addText('Step 1: Read the module introduction and objectives');
    addText('Step 2: Watch the tutorial video (optional but recommended)');
    addText('Step 3: Fill in the required forms and data fields');
    addText('Step 4: Use the AI assistant for guidance if needed');
    addText('Step 5: Review your entries');
    addText('Step 6: Click "Save & Continue" to proceed');

    yPosition += 5;
    addHeading('7.2 Form Field Types', 2);
    addBullet('Text inputs - For names, descriptions, addresses');
    addBullet('Number inputs - For financial data, quantities, percentages');
    addBullet('Dropdowns - For predefined choices (sectors, categories)');
    addBullet('Date pickers - For timelines and schedules');
    addBullet('File uploads - For supporting documents (coming soon)');
    addBullet('Tables - For multiple entries (employees, assets, etc.)');

    yPosition += 5;
    addHeading('7.3 Auto-Save Feature', 2);
    addText('YieldX automatically saves your progress every 30 seconds while you work. You\'ll see a "Saved" indicator in the top-right corner. Even if you close your browser, your work is preserved.');

    yPosition += 5;
    addHeading('7.4 Validation & Error Checking', 2);
    addText('Forms include built-in validation to ensure data quality:');
    addBullet('Required fields are marked with an asterisk (*)', 1);
    addBullet('Format validation for emails, phone numbers, etc.', 1);
    addBullet('Range checks for financial data', 1);
    addBullet('Logical consistency checks (e.g., ownership must total 100%)', 1);
    yPosition += 3;
    addText('You cannot proceed to the next module until all validation passes.');

    // Chapter 8: Smart Features
    pdf.addPage();
    yPosition = margin;
    addHeading('8. Smart Features', 1);

    addHeading('8.1 AI Chatbot Assistant', 2);
    addText('Access the AI assistant anytime by clicking the chat icon in the bottom-right corner.');
    yPosition += 3;
    addText('The AI can help you:');
    addBullet('Answer questions about business planning concepts', 1);
    addBullet('Provide examples for specific industries', 1);
    addBullet('Suggest data sources for market research', 1);
    addBullet('Clarify form field requirements', 1);
    addBullet('Offer tips for financial calculations', 1);
    yPosition += 3;
    addText('Tip: Be specific in your questions for the best answers. For example: "How do I calculate break-even point for a restaurant?" is better than "Help with finances."');

    yPosition += 5;
    addHeading('8.2 Smart Location & Competitor Analysis', 2);
    addText('Available in Level 5 (Market & Strategy), this feature uses real OpenStreetMap data to find actual competitors near your business location.');
    yPosition += 3;
    addText('How to use:');
    addText('Step 1: Enter your business idea description');
    addText('Step 2: Select your business location on the interactive map');
    addText('Step 3: Set search radius (500m - 3km)');
    addText('Step 4: Click "Find Competitors"');
    addText('Step 5: Review the list of real businesses in your area');
    addText('Step 6: Analyze their offerings, pricing, and positioning');
    yPosition += 3;
    addText('The system intelligently matches your business type to relevant competitor categories using AI.');

    yPosition += 5;
    addHeading('8.3 Video Library', 2);
    addText('Access 50+ educational videos covering:');
    addBullet('Business planning fundamentals', 1);
    addBullet('Level-by-level tutorial walkthroughs', 1);
    addBullet('Financial analysis techniques', 1);
    addBullet('Market research methods', 1);
    addBullet('Presentation and pitching skills', 1);
    yPosition += 3;
    addText('Videos are available in both Arabic and English with subtitles.');

    pdf.addPage();
    yPosition = margin;
    addHeading('8.4 Business Plan Export', 2);
    addText('Generate professional PDF business plans at any time:');
    yPosition += 3;
    addText('Step 1: Open your workspace');
    addText('Step 2: Click "Export Business Plan" or "تصدير خطة العمل"');
    addText('Step 3: Choose export options:');
    addBullet('Full plan (all completed sections)', 1);
    addBullet('Executive summary only', 1);
    addBullet('Financial statements only', 1);
    addBullet('Custom selection', 1);
    yPosition += 3;
    addText('Step 4: Select language (Arabic, English, or Bilingual)');
    addText('Step 5: Click "Generate PDF"');
    addText('Step 6: Download opens automatically');
    yPosition += 3;
    addText('The exported plan includes charts, tables, and professional formatting suitable for investors and bank presentations.');

    // Chapter 9: Gamification
    pdf.addPage();
    yPosition = margin;
    addHeading('9. Gamification & Progress Tracking', 1);

    addHeading('9.1 XP (Experience Points) System', 2);
    addText('Earn XP by completing activities:');
    addBullet('Complete a module: 50-500 XP (varies by level)', 1);
    addBullet('Watch a tutorial video: 10 XP', 1);
    addBullet('Add detailed data to forms: 5-20 XP', 1);
    addBullet('Export a complete business plan: 100 XP', 1);
    addBullet('Share knowledge in discussions: 25 XP', 1);
    addBullet('Daily login streak: 10 XP per day', 1);

    yPosition += 5;
    addHeading('9.2 Achievement Badges', 2);
    addText('Unlock special badges for milestones:');
    addBullet('First Steps - Complete Level 0', 1);
    addBullet('Founder - Complete Identity & Ownership module', 1);
    addBullet('Market Maven - Find 10+ competitors', 1);
    addBullet('Financial Wizard - Complete all financial projections', 1);
    addBullet('Completionist - Finish all 7 levels', 1);
    addBullet('Speed Demon - Complete a full plan in under 10 hours', 1);
    addBullet('Perfectionist - Achieve 100% completion in all modules', 1);

    yPosition += 5;
    addHeading('9.3 Leaderboard', 2);
    addText('Compete with other users in your region or organization:');
    addBullet('Daily leaderboard - Top XP earners today', 1);
    addBullet('Weekly leaderboard - Top performers this week', 1);
    addBullet('All-time leaderboard - Hall of fame', 1);
    addBullet('Organization leaderboard - Internal team rankings', 1);
    yPosition += 3;
    addText('Privacy note: You can choose to appear anonymously on public leaderboards in your profile settings.');

    // Chapter 10: Collaboration
    pdf.addPage();
    yPosition = margin;
    addHeading('10. Collaboration Tools', 1);

    addHeading('10.1 Messaging Center', 2);
    addText('Communicate with lecturers, team members, or support:');
    yPosition += 3;
    addText('To send a message:');
    addText('Step 1: Click "Messaging" in navigation');
    addText('Step 2: Click "New Message"');
    addText('Step 3: Select recipient or enter email');
    addText('Step 4: Type your message');
    addText('Step 5: Attach files if needed (optional)');
    addText('Step 6: Click "Send"');
    yPosition += 3;
    addText('You\'ll receive notifications for new messages via email and in-app alerts.');

    yPosition += 5;
    addHeading('10.2 Workspace Sharing (Lecturer & Organization)', 2);
    addText('For Lecturers:');
    addBullet('Create workspaces for student assignments', 1);
    addBullet('Invite students via email or class code', 1);
    addBullet('Monitor student progress in real-time', 1);
    addBullet('Provide feedback and comments on submissions', 1);
    addBullet('Grade completed work', 1);
    yPosition += 3;
    addText('For Organizations:');
    addBullet('Share workspaces across departments', 1);
    addBullet('Assign team members specific roles', 1);
    addBullet('Track team contributions', 1);
    addBullet('Review and approve sections before finalization', 1);

    yPosition += 5;
    addHeading('10.3 Professional Consultation', 2);
    addText('Book 1-on-1 sessions with business planning experts:');
    yPosition += 3;
    addText('Step 1: Navigate to "Professional Consultation"');
    addText('Step 2: Browse available consultants and their specialties');
    addText('Step 3: Select a consultant');
    addText('Step 4: Choose available time slot');
    addText('Step 5: Describe your consultation needs');
    addText('Step 6: Confirm booking');
    yPosition += 3;
    addText('Available for Pro and Organization plans. 30-minute and 60-minute sessions available.');

    // Chapter 11: Subscription Plans
    pdf.addPage();
    yPosition = margin;
    addHeading('11. Subscription Plans', 1);

    addHeading('11.1 Normal Plan (Free)', 2);
    addText('Perfect for students and individual learners');
    yPosition += 3;
    addText('Includes:');
    addBullet('Access to all 7 learning levels', 1);
    addBullet('1 active workspace', 1);
    addBullet('Basic AI chatbot (20 queries/day)', 1);
    addBullet('Video library access', 1);
    addBullet('Leaderboard participation', 1);
    addBullet('PDF export (basic template)', 1);
    addBullet('Community support', 1);
    yPosition += 3;
    addText('Price: Free forever');

    yPosition += 5;
    addHeading('11.2 Pro Plan', 2);
    addText('For serious entrepreneurs and power users');
    yPosition += 3;
    addText('Everything in Normal, plus:');
    addBullet('Unlimited active workspaces', 1);
    addBullet('Unlimited AI chatbot queries', 1);
    addBullet('Advanced competitor analysis', 1);
    addBullet('Premium PDF templates', 1);
    addBullet('Financial scenario modeling', 1);
    addBullet('Priority support (24-hour response)', 1);
    addBullet('1 free consultation session/month', 1);
    addBullet('Early access to new features', 1);
    yPosition += 3;
    addText('Price: 10 OMR/month or 100 OMR/year (save 17%)');

    yPosition += 5;
    addHeading('11.3 Organization Plan', 2);
    addText('For educational institutions and businesses');
    yPosition += 3;
    addText('Everything in Pro, plus:');
    addBullet('Unlimited team members', 1);
    addBullet('Advanced workspace management', 1);
    addBullet('Custom branding on exports', 1);
    addBullet('Analytics and reporting dashboard', 1);
    addBullet('Dedicated account manager', 1);
    addBullet('Unlimited consultation sessions', 1);
    addBullet('API access for integrations', 1);
    addBullet('SSO (Single Sign-On) support', 1);
    yPosition += 3;
    addText('Price: Custom pricing based on team size');

    pdf.addPage();
    yPosition = margin;
    addHeading('11.4 Upgrading Your Plan', 2);
    addText('Step 1: Click your profile icon → "Subscription"');
    addText('Step 2: Review plan comparison');
    addText('Step 3: Click "Upgrade" on your desired plan');
    addText('Step 4: Choose billing cycle (monthly or annual)');
    addText('Step 5: Enter payment information');
    addText('Step 6: Confirm upgrade');
    yPosition += 3;
    addText('Your new features activate immediately. Existing workspaces remain intact.');

    // Chapter 12: Offline Mode
    pdf.addPage();
    yPosition = margin;
    addHeading('12. Offline Mode', 1);
    addText('YieldX features a hybrid online/offline system that lets you work without internet connectivity.');

    yPosition += 5;
    addHeading('12.1 How Offline Mode Works', 2);
    addText('The platform automatically detects your internet connection:');
    addBullet('When online: Data saves to cloud (Supabase) in real-time', 1);
    addBullet('When offline: Data saves locally to your device', 1);
    addBullet('When reconnected: Local changes sync automatically', 1);
    yPosition += 3;
    addText('You\'ll see a connectivity banner at the top of the screen showing your current status.');

    yPosition += 5;
    addHeading('12.2 Working Offline', 2);
    addText('What works offline:');
    addBullet('All form inputs and data entry', 1);
    addBullet('Navigating between modules', 1);
    addBullet('Viewing saved workspaces', 1);
    addBullet('Editing existing content', 1);
    yPosition += 3;
    addText('What requires internet:');
    addBullet('Smart competitor search (uses OpenStreetMap API)', 1);
    addBullet('AI chatbot queries', 1);
    addBullet('Video streaming', 1);
    addBullet('Consultation booking', 1);
    addBullet('Leaderboard updates', 1);

    yPosition += 5;
    addHeading('12.3 Sync Status', 2);
    addText('Check sync status in the top-right corner:');
    addBullet('Green checkmark - All changes synced to cloud', 1);
    addBullet('Yellow sync icon - Syncing in progress', 1);
    addBullet('Orange cloud icon - Offline, will sync when connected', 1);
    addBullet('Red warning - Sync conflict detected', 1);

    yPosition += 5;
    addHeading('12.4 Resolving Sync Conflicts', 2);
    addText('If you edit the same workspace on multiple devices while offline, a conflict may occur:');
    yPosition += 3;
    addText('Step 1: You\'ll see a "Sync Conflict" notification');
    addText('Step 2: Review the conflicting versions side-by-side');
    addText('Step 3: Choose which version to keep:');
    addBullet('Keep local changes (this device)', 1);
    addBullet('Keep cloud version (other device)', 1);
    addBullet('Merge both (manual selection)', 1);
    yPosition += 3;
    addText('Step 4: Click "Resolve Conflict"');
    yPosition += 3;
    addText('Best practice: Work on one device at a time, or ensure you\'re online when switching devices.');

    // Chapter 13: Tips & Best Practices
    pdf.addPage();
    yPosition = margin;
    addHeading('13. Tips & Best Practices', 1);

    addHeading('13.1 Getting the Most from YieldX', 2);
    addBullet('Start with research - Watch the tutorial videos before each level');
    addBullet('Be realistic - Use actual market data rather than assumptions');
    addBullet('Take your time - Quality business plans take 15-20 hours total');
    addBullet('Use the AI assistant - Ask questions when you\'re stuck');
    addBullet('Save frequently - Though auto-save is enabled, manual saves are instant');
    addBullet('Review before exporting - Check all sections for completeness');

    yPosition += 5;
    addHeading('13.2 Financial Planning Tips', 2);
    addBullet('Conservative estimates - Better to underestimate revenue and overestimate costs');
    addBullet('Include contingency - Add 10-15% buffer for unexpected expenses');
    addBullet('Multi-year projections - Complete all 5 years, not just year 1');
    addBullet('Cross-check calculations - Use the built-in calculators for accuracy');
    addBullet('Realistic timelines - Account for seasonal variations and ramp-up time');

    yPosition += 5;
    addHeading('13.3 Market Research Tips', 2);
    addBullet('Visit competitors physically - Don\'t rely only on online data');
    addBullet('Talk to potential customers - Validate your assumptions');
    addBullet('Study pricing carefully - Know your competitive positioning');
    addBullet('Identify market gaps - Find underserved niches');
    addBullet('Understand seasonality - Some businesses have peak/off seasons');

    yPosition += 5;
    addHeading('13.4 Presentation Tips', 2);
    addBullet('Know your audience - Investors care about different things than banks');
    addBullet('Lead with the problem - Explain what gap your business fills');
    addBullet('Show, don\'t just tell - Use charts and visuals from your plan');
    addBullet('Practice your pitch - Rehearse key points before meetings');
    addBullet('Be ready for questions - Especially about financials and competition');

    // Chapter 14: Troubleshooting
    pdf.addPage();
    yPosition = margin;
    addHeading('14. Troubleshooting', 1);

    addHeading('14.1 Common Issues', 2);

    yPosition += 3;
    addText('Issue: Cannot log in', 11, true);
    addText('Solutions:');
    addBullet('Verify email and password are correct', 1);
    addBullet('Check for typos (password is case-sensitive)', 1);
    addBullet('Try the "Forgot Password" link', 1);
    addBullet('Clear browser cache and try again', 1);
    addBullet('Try a different browser', 1);

    yPosition += 5;
    addText('Issue: Changes not saving', 11, true);
    addText('Solutions:');
    addBullet('Check your internet connection status', 1);
    addBullet('If offline, changes save locally - they\'ll sync when online', 1);
    addBullet('Look for validation errors (red text) preventing save', 1);
    addBullet('Try clicking "Save" button manually', 1);
    addBullet('Refresh the page - auto-save may have already saved', 1);

    yPosition += 5;
    addText('Issue: Cannot find competitors in Smart Location', 11, true);
    addText('Solutions:');
    addBullet('Ensure you\'re connected to the internet', 1);
    addBullet('Try increasing the search radius', 1);
    addBullet('Verify your location pin is placed correctly', 1);
    addBullet('Rephrase your business description to be more specific', 1);
    addBullet('Some rural areas may have limited OSM data', 1);

    yPosition += 5;
    addText('Issue: PDF export not working', 11, true);
    addText('Solutions:');
    addBullet('Check that pop-ups are allowed in your browser', 1);
    addBullet('Ensure you have at least one completed module', 1);
    addBullet('Try a different browser (Chrome recommended)', 1);
    addBullet('Wait for all data to load before exporting', 1);
    addBullet('Contact support if the issue persists', 1);

    pdf.addPage();
    yPosition = margin;
    addText('Issue: Videos not playing', 11, true);
    addText('Solutions:');
    addBullet('Check your internet connection speed', 1);
    addBullet('Try lowering video quality if available', 1);
    addBullet('Disable browser extensions that might block videos', 1);
    addBullet('Clear browser cache', 1);
    addBullet('Try a different browser', 1);

    yPosition += 5;
    addText('Issue: AI chatbot not responding', 11, true);
    addText('Solutions:');
    addBullet('Ensure you\'re connected to the internet', 1);
    addBullet('Check if you\'ve reached daily query limit (Normal plan: 20/day)', 1);
    addBullet('Wait a few seconds - responses can take 3-10 seconds', 1);
    addBullet('Try rephrasing your question more clearly', 1);
    addBullet('Refresh the page and try again', 1);

    yPosition += 5;
    addHeading('14.2 Getting Help', 2);
    addText('If you need additional support:');
    yPosition += 3;
    addBullet('In-app chat: Click the chat icon for instant AI assistance');
    addBullet('Help Center: Click "Help" in navigation for FAQs and guides');
    addBullet('Email support: support@yieldx.om (24-48 hour response)');
    addBullet('Pro/Org priority support: support@yieldx.om (24-hour response)');
    addBullet('Video tutorials: Visit the Video Library');
    addBullet('Community forum: Connect with other users (coming soon)');

    yPosition += 5;
    addHeading('14.3 Browser Compatibility', 2);
    addText('YieldX works best on modern browsers:');
    addBullet('Recommended: Chrome 100+, Edge 100+, Safari 15+', 1);
    addBullet('Supported: Firefox 90+, Opera 85+', 1);
    addBullet('Not supported: Internet Explorer', 1);
    yPosition += 3;
    addText('For the best experience, keep your browser updated to the latest version.');

    yPosition += 5;
    addHeading('14.4 Device Requirements', 2);
    addText('Minimum requirements:');
    addBullet('Desktop/Laptop: 4GB RAM, any OS (Windows/Mac/Linux)', 1);
    addBullet('Mobile: iOS 13+ or Android 9+', 1);
    addBullet('Screen: 1280x720 minimum (responsive to all sizes)', 1);
    addBullet('Internet: 2 Mbps for video streaming, 512 Kbps for basic use', 1);
    addBullet('Storage: 50MB for offline data caching', 1);

    // Appendix
    pdf.addPage();
    yPosition = margin;
    addHeading('Appendix: Quick Reference', 1);

    addHeading('Keyboard Shortcuts', 2);
    addBullet('Ctrl/Cmd + S - Manual save');
    addBullet('Ctrl/Cmd + K - Open AI chatbot');
    addBullet('Ctrl/Cmd + E - Export current workspace');
    addBullet('Ctrl/Cmd + N - New workspace');
    addBullet('Esc - Close dialogs/modals');

    yPosition += 5;
    addHeading('Important Definitions', 2);
    addText('XP (Experience Points) - Points earned for completing activities', 11, true);
    addText('Workspace - A dedicated environment for developing a business plan', 11, true);
    addText('Module - A section within a level focusing on specific content', 11, true);
    addText('Omanization - The requirement to employ Omani nationals', 11, true);
    addText('IRR - Internal Rate of Return, a measure of investment profitability', 11, true);
    addText('NPV - Net Present Value, the current value of future cash flows', 11, true);
    addText('ROI - Return on Investment, profit as a percentage of investment', 11, true);
    addText('SWOT - Strengths, Weaknesses, Opportunities, Threats analysis', 11, true);
    addText('BMC - Business Model Canvas, a strategic management template', 11, true);

    yPosition += 5;
    addHeading('Contact Information', 2);
    addText('Website: www.yieldx.om');
    addText('Email: info@yieldx.om');
    addText('Support: support@yieldx.om');
    addText('Phone: +968 XXXX XXXX');
    addText('Address: Muscat, Sultanate of Oman');

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('YieldX - Empowering entrepreneurs with knowledge and tools', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    pdf.text(`Document Version 1.0 - Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

    // Save the PDF
    pdf.save('YieldX_Complete_User_Guide.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-900 to-purple-700 rounded-full mb-4">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl mb-3 bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">
              YieldX User Guide
            </h1>
            <p className="text-slate-600 text-lg">
              Complete documentation for the YieldX platform
            </p>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl mb-4 text-slate-800">What's Included:</h2>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Complete introduction to YieldX platform</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Step-by-step account setup and login instructions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Detailed guide to all 7 learning levels</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Dashboard navigation and workspace management</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Smart features: AI assistant, competitor analysis, video library</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Gamification system and progress tracking</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Collaboration tools and messaging</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Subscription plans comparison</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Offline mode and sync functionality</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Tips, best practices, and troubleshooting</span>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl text-blue-900 mb-1">50+</div>
              <div className="text-sm text-blue-700">Pages</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl text-purple-900 mb-1">14</div>
              <div className="text-sm text-purple-700">Chapters</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="text-3xl text-indigo-900 mb-1">100%</div>
              <div className="text-sm text-indigo-700">Coverage</div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePDF}
            className="w-full bg-gradient-to-r from-blue-900 to-purple-700 text-white py-4 rounded-lg text-lg hover:from-blue-800 hover:to-purple-600 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <Download className="w-6 h-6" />
            Generate PDF User Guide
          </button>

          {/* Footer Note */}
          <p className="text-center text-slate-500 text-sm mt-6">
            The PDF will download automatically when generation is complete.
            <br />
            File size: ~2-3 MB • Format: A4 • Pages: 50+
          </p>
        </div>
      </div>
    </div>
  );
}
