# YieldX Certificate System - Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

### Add Certificate Button to Dashboard

```tsx
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { Award } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/app/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>
      <Award className="w-4 h-4 mr-2" />
      {language === 'ar' ? 'الشهادات' : 'Certificates'}
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <CertificateSystem />
  </DialogContent>
</Dialog>
```

### Add Branded Search

```tsx
import { BrandedSearch } from '@/app/components/ui/branded-search';

<BrandedSearch
  language={language}
  placeholder={language === 'ar' ? 'ابحث...' : 'Search...'}
  onSearch={(query) => handleSearch(query)}
/>
```

---

## 📦 Import Paths

```tsx
// Certificate System
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { CertificateGallery } from '@/app/components/certificates/CertificateGallery';
import { CertificatesPage } from '@/app/components/pages/CertificatesPage';

// Utilities
import {
  generateCertificatePDF,
  generateCertificateId,
  calculatePerformanceScore,
  shouldReceiveExcellenceCertificate,
  shouldShowProgressCheckpoint
} from '@/app/utils/certificateGenerator';

// Branded Search
import { BrandedSearch, BrandedSearchWithResults } from '@/app/components/ui/branded-search';
```

---

## 🎯 Key Functions

### Generate Certificate

```tsx
const certificateData = {
  userName: 'Ahmed Al-Balushi',
  projectTitle: 'متجر إلكتروني',
  completionDate: new Date().toLocaleDateString('ar-SA'),
  performanceScore: 95,
  certificateId: generateCertificateId(),
  certificateType: 'excellence'
};

await generateCertificatePDF(certificateData, 'ar');
```

### Calculate Performance

```tsx
const score = calculatePerformanceScore(
  completionPercentage,  // 0-100
  totalXP,              // Current XP
  maxTotalXP            // Maximum possible XP
);
```

### Check Certificate Eligibility

```tsx
const isExcellence = shouldReceiveExcellenceCertificate(performanceScore);
// Returns true if score >= 90

const showCheckpoint = shouldShowProgressCheckpoint(completionPercentage);
// Returns true if 80 <= percentage < 100
```

---

## 🎨 Certificate Types

### Completion Certificate
- **Unlocked**: 100% of required tasks
- **Color**: Blue/Cyan
- **Icon**: Award
- **Requirements**: Complete all required fields

### Excellence Certificate
- **Unlocked**: 100% completion + 90%+ performance
- **Color**: Gold/Orange
- **Icon**: Trophy
- **Badge**: Gold star

---

## 📊 Progress Calculation

### Completion Percentage
```
Completion = (Completed Required Fields / Total Required Fields) × 100
```

### Performance Score
```
Performance = (Completion × 60%) + (XP Ratio × 30%) + (Time Bonus × 10%)
```

### Certificate Eligibility
```
Completion Certificate: Completion === 100%
Excellence Certificate: Completion === 100% AND Performance >= 90%
```

---

## 🔍 Search Integration

### Basic Search

```tsx
const handleSearch = (query: string) => {
  // Your search logic
  console.log('Searching for:', query);
};

<BrandedSearch onSearch={handleSearch} language="ar" />
```

### Search with Results

```tsx
const results = [
  {
    id: 'item-1',
    title: 'Result Title',
    description: 'Result description',
    type: 'Category',
    icon: <Star className="w-4 h-4" />
  }
];

<BrandedSearchWithResults
  results={results}
  onSearch={handleSearch}
  onResultClick={(id) => navigate(id)}
  language="ar"
/>
```

---

## 🌐 Translations

### Arabic (ar)

```tsx
t.certificates.certificateSystem     // نظام الشهادات
t.certificates.excellenceCertificate // شهادة تميّز
t.certificates.completionCertificate // شهادة إتمام
t.certificates.downloadCertificate   // تنزيل الشهادة
t.certificates.generateCertificate   // إنشاء الشهادة
```

### English (en)

```tsx
t.certificates.certificateSystem     // Certificate System
t.certificates.excellenceCertificate // Excellence Certificate
t.certificates.completionCertificate // Completion Certificate
t.certificates.downloadCertificate   // Download Certificate
t.certificates.generateCertificate   // Generate Certificate
```

---

## 💾 Data Storage

### Certificate Object

```tsx
interface SavedCertificate {
  userName: string;
  projectTitle: string;
  completionDate: string;
  performanceScore: number;
  certificateId: string;
  certificateType: 'completion' | 'excellence';
  userId: string;
  generatedAt: string;
}
```

### Local Storage

```tsx
// Save
const certificates = JSON.parse(localStorage.getItem('yieldx_certificates') || '[]');
certificates.push(newCertificate);
localStorage.setItem('yieldx_certificates', JSON.stringify(certificates));

// Load
const userCertificates = certificates.filter(c => c.userId === currentUserId);
```

---

## 🎭 Component Props

### CertificateSystem
- **No props required** (uses YieldXContext)

### CertificateGallery
- **No props required** (uses YieldXContext)

### CertificatesPage
```tsx
interface CertificatesPageProps {
  onBack: () => void;
}
```

### BrandedSearch
```tsx
interface BrandedSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  language?: 'ar' | 'en';
  className?: string;
  showBrand?: boolean; // default: true
}
```

### BrandedSearchWithResults
```tsx
interface BrandedSearchWithResultsProps extends BrandedSearchProps {
  results?: Array<{
    id: string;
    title: string;
    description?: string;
    type?: string;
    icon?: React.ReactNode;
  }>;
  onResultClick?: (id: string) => void;
  isLoading?: boolean;
}
```

---

## 🎨 Styling Classes

### Certificate Cards

```tsx
// Excellence Certificate
className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400"

// Completion Certificate
className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-400"

// Locked State
className="bg-slate-100 dark:bg-slate-800 border-slate-300"
```

### Progress States

```tsx
// Ready (100%)
className="bg-green-500 text-white"

// Checkpoint (80-99%)
className="bg-yellow-500 text-white"

// In Progress (<80%)
className="bg-violet-500 text-white"
```

---

## ⚡ Performance Tips

```tsx
// Memoize expensive calculations
const performanceScore = useMemo(() => 
  calculatePerformanceScore(completion, xp, maxXP),
  [completion, xp, maxXP]
);

// Debounce search
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);

// Lazy load certificate page
const CertificatesPage = lazy(() => 
  import('@/app/components/pages/CertificatesPage')
);
```

---

## 🐛 Common Issues & Fixes

### Certificate Won't Unlock
```tsx
// Check: Are all required fields completed?
const missingFields = requiredFields.filter(field => !moduleData[field]);
console.log('Missing:', missingFields);
```

### PDF Download Fails
```tsx
// Check: Is jsPDF installed?
npm install jspdf @types/jspdf

// Check: Browser console for errors
```

### Search Not Working
```tsx
// Check: Is onSearch prop provided?
<BrandedSearch onSearch={handleSearch} /> // ✅ Correct
<BrandedSearch /> // ❌ No search handler
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile
<div className="flex flex-col md:flex-row">

// Tablet
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Desktop
<div className="max-w-7xl mx-auto">
```

---

## 🔗 Useful Links

- **Main Docs**: [CERTIFICATE_SYSTEM_README.md](./CERTIFICATE_SYSTEM_README.md)
- **Integration**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Demo**: `/src/app/components/demo/CertificateSystemDemo.tsx`

---

## 📞 Quick Help

### Getting Started
1. Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Copy code from this quick reference
3. Test with demo component
4. Customize as needed

### Troubleshooting
1. Check console for errors
2. Verify all imports
3. Ensure jsPDF is installed
4. Test completion calculation

### Customization
1. Edit colors in `certificateGenerator.ts`
2. Update translations in `translations.ts`
3. Modify component styles
4. Add custom fields

---

**Last Updated**: April 3, 2026  
**Version**: 1.0.0  
**License**: YieldX Platform © 2026
