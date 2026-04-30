# YieldX Certificate System & Branded Search - Integration Guide

## Quick Start Integration

This guide shows you how to integrate the certificate system and branded search into your existing YieldX dashboard.

---

## Step 1: Add Certificate Button to Dashboard

### Option A: Add to ProfessionalDashboard.tsx

Add the certificate system next to the completion report:

```tsx
// 1. Add import at the top
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { Award } from 'lucide-react';

// 2. In your dashboard render, add this after the CompletionReport dialog:

<Dialog>
  <DialogTrigger asChild>
    <Button
      variant="outline"
      className="bg-violet-100 dark:bg-violet-900/20 border-violet-300 dark:border-violet-600 hover:bg-violet-200 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300"
    >
      <Award className="w-4 h-4 mr-2" />
      {language === 'ar' ? 'الشهادات' : 'Certificates'}
    </Button>
  </DialogTrigger>
  <DialogContent className="bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-slate-900 dark:text-white text-2xl font-bold">
        {t.certificates.certificateSystem}
      </DialogTitle>
      <DialogDescription className="text-slate-600 dark:text-slate-300">
        {language === 'ar' 
          ? 'احصل على شهادات معتمدة لإنجازاتك'
          : 'Earn certified credentials for your achievements'}
      </DialogDescription>
    </DialogHeader>
    <CertificateSystem />
  </DialogContent>
</Dialog>
```

### Option B: Add to Dashboard.tsx (Classic Dashboard)

```tsx
// 1. Add imports
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { Award } from 'lucide-react';

// 2. In your top actions row (next to leaderboard, video library, etc):

<Dialog>
  <DialogTrigger asChild>
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 p-6 cursor-pointer hover:shadow-lg transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm mb-1">
              {language === 'ar' ? 'الشهادات' : 'Certificates'}
            </p>
            <h3 className="text-2xl font-bold text-white">
              {/* Show number of earned certificates */}
              <Award className="w-6 h-6" />
            </h3>
          </div>
          <Trophy className="w-12 h-12 text-yellow-400" />
        </div>
      </Card>
    </motion.div>
  </DialogTrigger>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <CertificateSystem />
  </DialogContent>
</Dialog>
```

---

## Step 2: Add Branded Search to Header

### Integration in Dashboard Header

```tsx
// 1. Add import
import { BrandedSearchWithResults } from '@/app/components/ui/branded-search';

// 2. Add state for search
const [searchResults, setSearchResults] = React.useState<any[]>([]);

// 3. Create search handler
const handleSearch = (query: string) => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  const results: any[] = [];

  // Search through levels
  levels.forEach((level) => {
    if (level.title.toLowerCase().includes(query.toLowerCase()) ||
        level.subtitle.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: `level-${level.levelId}`,
        title: level.title,
        description: level.subtitle,
        type: language === 'ar' ? 'مستوى' : 'Level',
        icon: <Star className="w-4 h-4" />
      });
    }
  });

  // Search through saved projects
  savedProjects.forEach((project) => {
    if (project.name.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        id: `project-${project.id}`,
        title: project.name,
        description: language === 'ar' ? 'مشروع محفوظ' : 'Saved Project',
        type: language === 'ar' ? 'مشروع' : 'Project',
        icon: <Briefcase className="w-4 h-4" />
      });
    }
  });

  setSearchResults(results);
};

// 4. Handle result click
const handleResultClick = (id: string) => {
  if (id.startsWith('level-')) {
    const levelId = parseInt(id.replace('level-', ''));
    // Navigate to level or open level dialog
    console.log('Navigate to level:', levelId);
  } else if (id.startsWith('project-')) {
    const projectId = id.replace('project-', '');
    // Load project
    console.log('Load project:', projectId);
  }
};

// 5. Add to your header/top section
<div className="mb-6">
  <BrandedSearchWithResults
    language={language}
    placeholder={language === 'ar' ? 'ابحث في YieldX...' : 'Search in YieldX...'}
    onSearch={handleSearch}
    results={searchResults}
    onResultClick={handleResultClick}
    className="max-w-2xl mx-auto"
  />
</div>
```

---

## Step 3: Add Certificate Progress Indicator

### Show progress toward certificate on dashboard

```tsx
// Add this widget to your dashboard stats section

import { calculatePerformanceScore, shouldShowProgressCheckpoint } from '@/app/utils/certificateGenerator';

function CertificateProgressWidget() {
  const { levels, totalXP, language } = useYieldX();
  
  const maxTotalXP = levels.reduce((sum, level) => sum + level.maxXp, 0);
  const completedLevels = levels.filter((l) => l.completed).length;
  const completionPercentage = levels.length > 0 ? (completedLevels / levels.length) * 100 : 0;
  const performanceScore = calculatePerformanceScore(completionPercentage, totalXP, maxTotalXP);
  const showCheckpoint = shouldShowProgressCheckpoint(completionPercentage);

  return (
    <Card className={`p-4 transition-all ${
      completionPercentage === 100
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-400 dark:border-green-600'
        : showCheckpoint
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {language === 'ar' ? 'تقدم الشهادة' : 'Certificate Progress'}
        </span>
        {completionPercentage === 100 ? (
          <Trophy className="w-5 h-5 text-yellow-500" />
        ) : (
          <Award className="w-5 h-5 text-violet-500" />
        )}
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>{language === 'ar' ? 'الإكمال' : 'Completion'}</span>
            <span className="font-bold">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>{language === 'ar' ? 'الأداء' : 'Performance'}</span>
            <span className="font-bold">{performanceScore}%</span>
          </div>
          <Progress value={performanceScore} className="h-2" />
        </div>
      </div>

      {completionPercentage === 100 && (
        <div className="mt-3 text-xs text-green-700 dark:text-green-300 font-semibold flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {language === 'ar' ? 'جاهز للشهادة!' : 'Ready for Certificate!'}
        </div>
      )}

      {showCheckpoint && (
        <div className="mt-3 text-xs text-yellow-700 dark:text-yellow-300 font-semibold">
          {language === 'ar' 
            ? `🎯 أنت قريب! ${Math.round(100 - completionPercentage)}% متبقي`
            : `🎯 Almost there! ${Math.round(100 - completionPercentage)}% remaining`}
        </div>
      )}
    </Card>
  );
}
```

---

## Step 4: Create Dedicated Certificates Page

### Add route or state to show full certificates page

```tsx
// In your main App.tsx or routing component

import { CertificatesPage } from '@/app/components/pages/CertificatesPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'certificates'>('dashboard');

  return (
    <>
      {currentPage === 'dashboard' && (
        <ProfessionalDashboard 
          onNavigateToCertificates={() => setCurrentPage('certificates')}
        />
      )}
      
      {currentPage === 'certificates' && (
        <CertificatesPage 
          onBack={() => setCurrentPage('dashboard')}
        />
      )}
    </>
  );
}
```

---

## Step 5: Customize Certificate Appearance

### Edit certificate colors and branding

```tsx
// In /src/app/utils/certificateGenerator.ts

// Change background color
doc.setFillColor(15, 15, 37); // Change these RGB values

// Change border colors
doc.setDrawColor(126, 219, 202); // Primary border
doc.setDrawColor(78, 205, 196); // Secondary border

// Change text colors
doc.setTextColor(126, 219, 202); // Main title
doc.setTextColor(255, 255, 255); // Body text
doc.setTextColor(168, 230, 207); // Subtitle

// Update YieldX branding text
doc.text('YieldX', pageWidth / 2, 35, { align: 'center' });
// Change to your organization name
```

---

## Step 6: Testing the Integration

### Test checklist:

1. **Certificate Unlocking**
   - [ ] Complete all required fields in modules
   - [ ] Verify completion percentage shows 100%
   - [ ] Confirm certificate button becomes enabled
   
2. **Certificate Generation**
   - [ ] Enter user name
   - [ ] Click generate button
   - [ ] Verify PDF downloads
   - [ ] Check PDF content and formatting
   
3. **Certificate Types**
   - [ ] Get 100% completion, <90% performance → Completion Certificate
   - [ ] Get 100% completion, ≥90% performance → Excellence Certificate
   
4. **Progress Checkpoint**
   - [ ] Reach 80-90% completion
   - [ ] Verify checkpoint dialog appears
   - [ ] Dismiss and verify it doesn't reappear
   
5. **Certificate Gallery**
   - [ ] Generate multiple certificates
   - [ ] View in gallery
   - [ ] Re-download previous certificates
   
6. **Branded Search**
   - [ ] Type search query
   - [ ] Verify results appear
   - [ ] Click result and verify navigation
   - [ ] Test with Arabic and English

---

## Common Integration Patterns

### Pattern 1: Dashboard Card

```tsx
<Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {t.certificates.certificateSystem}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {language === 'ar' ? 'احصل على شهادتك' : 'Earn your certificate'}
      </p>
    </div>
    <Trophy className="w-8 h-8 text-yellow-500" />
  </div>
  
  <CertificateProgressWidget />
  
  <Dialog>
    <DialogTrigger asChild>
      <Button className="w-full mt-4">
        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-4xl">
      <CertificateSystem />
    </DialogContent>
  </Dialog>
</Card>
```

### Pattern 2: Quick Action Button

```tsx
<div className="flex gap-2">
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        <Award className="w-4 h-4 mr-2" />
        {completionPercentage === 100 
          ? (language === 'ar' ? 'احصل على الشهادة' : 'Get Certificate')
          : (language === 'ar' ? 'تقدم الشهادة' : 'Certificate Progress')}
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-4xl">
      <CertificateSystem />
    </DialogContent>
  </Dialog>
</div>
```

### Pattern 3: Navigation Menu Item

```tsx
<nav>
  <button 
    onClick={() => setCurrentPage('certificates')}
    className="flex items-center gap-2 px-4 py-2 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded-lg"
  >
    <Award className="w-5 h-5" />
    <span>{t.certificates.certificateSystem}</span>
    {completionPercentage === 100 && (
      <Badge className="bg-green-500">
        {language === 'ar' ? 'جاهز' : 'Ready'}
      </Badge>
    )}
  </button>
</nav>
```

---

## Advanced Features

### Feature 1: Email Certificate

```tsx
// Add email functionality (requires backend)
const emailCertificate = async (certificateData: CertificateData) => {
  const response = await fetch('/api/email-certificate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...certificateData,
      recipientEmail: user.email
    })
  });
  
  if (response.ok) {
    alert(language === 'ar' 
      ? 'تم إرسال الشهادة إلى بريدك الإلكتروني'
      : 'Certificate sent to your email');
  }
};
```

### Feature 2: Share on Social Media

```tsx
const shareOnLinkedIn = (certificateData: CertificateData) => {
  const text = `I just earned a ${certificateData.certificateType} certificate from YieldX with a ${certificateData.performanceScore}% performance score!`;
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};
```

### Feature 3: Certificate Verification Page

```tsx
// Create /verify/[certificateId] page
function CertificateVerification({ certificateId }: { certificateId: string }) {
  const [certificate, setCertificate] = useState<SavedCertificate | null>(null);
  
  useEffect(() => {
    // Verify certificate by ID
    const allCertificates = JSON.parse(localStorage.getItem('yieldx_certificates') || '[]');
    const found = allCertificates.find((c: SavedCertificate) => c.certificateId === certificateId);
    setCertificate(found);
  }, [certificateId]);
  
  if (!certificate) {
    return <div>Certificate not found or invalid</div>;
  }
  
  return (
    <div>
      <h1>Certificate Verified ✓</h1>
      <p>Issued to: {certificate.userName}</p>
      <p>Project: {certificate.projectTitle}</p>
      <p>Date: {certificate.completionDate}</p>
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Certificate won't unlock at 100%

**Cause**: Optional fields being counted as required

**Fix**: Review your module field definitions. Ensure only truly required fields have `required: true`

```tsx
// Correct
{ id: 'companyName', label: 'Company Name', type: 'text', required: true }
{ id: 'note', label: 'Notes', type: 'textarea' } // Optional, no required flag

// Incorrect
{ id: 'note', label: 'Notes', type: 'textarea', required: true } // Should be optional
```

### Issue: Search not finding results

**Cause**: Search logic not matching your data structure

**Fix**: Update search handler to match your data:

```tsx
const handleSearch = (query: string) => {
  const lowerQuery = query.toLowerCase();
  
  // Add more fields to search
  const results = levels.filter(level => 
    level.title.toLowerCase().includes(lowerQuery) ||
    level.subtitle.toLowerCase().includes(lowerQuery) ||
    level.description?.toLowerCase().includes(lowerQuery) // Add more fields
  );
  
  setSearchResults(results);
};
```

---

## Performance Tips

1. **Lazy Load Certificate Component**: Use React.lazy() for certificate page
2. **Debounce Search**: Add debounce to search input (300ms recommended)
3. **Cache Search Results**: Store recent searches in state
4. **Optimize PDF Generation**: Generate on demand, not on page load
5. **Use Memo**: Memoize certificate calculations

```tsx
const performanceScore = React.useMemo(() => 
  calculatePerformanceScore(completionPercentage, totalXP, maxTotalXP),
  [completionPercentage, totalXP, maxTotalXP]
);
```

---

## Next Steps

1. Test all integration points
2. Customize certificate design to match your branding
3. Add analytics tracking for certificate generation
4. Consider adding server-side certificate storage
5. Implement certificate verification API
6. Add social sharing features

---

## Support

For questions or issues:
- Review the [CERTIFICATE_SYSTEM_README.md](./CERTIFICATE_SYSTEM_README.md)
- Check code comments in implementation files
- Test with demo data first

Happy integrating! 🎉
