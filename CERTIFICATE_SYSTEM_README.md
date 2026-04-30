# YieldX Certificate System Documentation

## Overview

The YieldX Certificate System is a comprehensive, gamified achievement recognition system designed to motivate users and provide credible certification for completing business feasibility studies. The system includes both **Completion Certificates** and **Excellence Certificates** with full bilingual support (Arabic/English).

---

## Features

### ✅ Core Features

1. **Two Certificate Types**
   - **Completion Certificate**: Awarded when user completes 100% of required tasks
   - **Excellence Certificate**: Awarded for exceptional performance (90%+ score)

2. **Smart Progress Tracking**
   - Tracks completion percentage based on required fields only
   - Separate performance score calculation
   - Optional tasks don't block progress

3. **Progress Checkpoint**
   - Motivational message appears at 80-90% completion
   - Encourages users to complete remaining steps
   - Shows exact percentage and steps remaining

4. **PDF Generation**
   - Professional, branded certificate design
   - Includes user name, project title, completion date
   - Unique certificate ID for authenticity
   - Performance score displayed
   - Excellence badge for high performers

5. **Certificate Gallery**
   - View all earned certificates
   - Re-download previously generated certificates
   - Beautiful card-based UI with color coding

6. **Branded Search**
   - Platform-wide search with YieldX branding
   - Search results with categorization
   - Real-time filtering
   - Reinforces brand identity

---

## File Structure

```
/src/app/
├── utils/
│   └── certificateGenerator.ts          # Core certificate generation logic
├── components/
│   ├── certificates/
│   │   ├── CertificateSystem.tsx        # Main certificate UI component
│   │   └── CertificateGallery.tsx       # Certificate gallery/history
│   ├── pages/
│   │   └── CertificatesPage.tsx         # Full certificates page with tabs
│   └── ui/
│       └── branded-search.tsx           # Branded search component
└── contexts/
    └── translations.ts                   # Updated with certificate translations
```

---

## Installation & Setup

### 1. Dependencies

The certificate system uses the following packages (already installed):

```json
{
  "jspdf": "^4.2.1",
  "@types/jspdf": "^2.0.0"
}
```

### 2. Import Components

```tsx
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { CertificateGallery } from '@/app/components/certificates/CertificateGallery';
import { CertificatesPage } from '@/app/components/pages/CertificatesPage';
import { BrandedSearch } from '@/app/components/ui/branded-search';
```

---

## Usage Examples

### Basic Certificate System

```tsx
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';

function Dashboard() {
  return (
    <div>
      <h1>My Dashboard</h1>
      <CertificateSystem />
    </div>
  );
}
```

### Certificate Gallery

```tsx
import { CertificateGallery } from '@/app/components/certificates/CertificateGallery';

function ProfilePage() {
  return (
    <div>
      <h2>My Achievements</h2>
      <CertificateGallery />
    </div>
  );
}
```

### Full Certificates Page with Search

```tsx
import { CertificatesPage } from '@/app/components/pages/CertificatesPage';

function App() {
  const [showCertificates, setShowCertificates] = useState(false);

  return (
    <>
      {showCertificates ? (
        <CertificatesPage onBack={() => setShowCertificates(false)} />
      ) : (
        <MainDashboard />
      )}
    </>
  );
}
```

### Branded Search Component

```tsx
import { BrandedSearch } from '@/app/components/ui/branded-search';

function Header() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  return (
    <BrandedSearch
      onSearch={handleSearch}
      placeholder="Search in YieldX..."
      language="ar"
      showBrand={true}
    />
  );
}
```

### Branded Search with Results

```tsx
import { BrandedSearchWithResults } from '@/app/components/ui/branded-search';

function SearchableHeader() {
  const [results, setResults] = useState([]);

  const handleSearch = (query: string) => {
    // Your search logic here
    const searchResults = performSearch(query);
    setResults(searchResults);
  };

  return (
    <BrandedSearchWithResults
      onSearch={handleSearch}
      results={results}
      onResultClick={(id) => navigate(id)}
      language="ar"
    />
  );
}
```

---

## API Reference

### CertificateSystem Component

**Props:** None (uses YieldX context)

**Features:**
- Displays current progress
- Shows completion and performance percentages
- Certificate type preview
- Generate certificate button (disabled until 100%)
- Progress checkpoint dialog at 80-90%

### CertificateGallery Component

**Props:** None (uses YieldX context)

**Features:**
- Lists all user's earned certificates
- Certificate cards with details
- Re-download functionality
- Color-coded by certificate type

### BrandedSearch Component

**Props:**
```tsx
interface BrandedSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  language?: 'ar' | 'en';
  className?: string;
  showBrand?: boolean;
}
```

### BrandedSearchWithResults Component

**Props:**
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

## Certificate Generation Functions

### `generateCertificatePDF(data, language)`

Generates and downloads a certificate PDF.

```tsx
import { generateCertificatePDF, generateCertificateId } from '@/app/utils/certificateGenerator';

const certificateData = {
  userName: 'Ahmed Al-Balushi',
  projectTitle: 'متجر إلكتروني',
  completionDate: '4 أبريل 2026',
  performanceScore: 95,
  certificateId: generateCertificateId(),
  certificateType: 'excellence'
};

await generateCertificatePDF(certificateData, 'ar');
```

### `calculatePerformanceScore(completionPercentage, totalXP, maxTotalXP, completionTime?, targetTime?)`

Calculates performance score based on multiple factors.

```tsx
const score = calculatePerformanceScore(
  100,        // completion percentage
  850,        // total XP earned
  1000,       // maximum possible XP
  30,         // days taken (optional)
  45          // target days (optional)
);
// Returns: 92 (calculated score)
```

### `shouldReceiveExcellenceCertificate(performanceScore)`

Determines if user qualifies for Excellence certificate.

```tsx
const isExcellence = shouldReceiveExcellenceCertificate(95);
// Returns: true (score >= 90)
```

### `shouldShowProgressCheckpoint(completionPercentage)`

Determines if progress checkpoint should be displayed.

```tsx
const showCheckpoint = shouldShowProgressCheckpoint(85);
// Returns: true (80 <= percentage < 100)
```

---

## Certificate Design

### Certificate Template

The certificate PDF includes:

1. **Header**
   - YieldX logo/branding
   - Certificate title (Completion/Excellence)
   - Platform subtitle

2. **Body**
   - Recipient name (large, centered)
   - Project title
   - Performance score
   - Excellence badge (if applicable)

3. **Footer**
   - Completion date
   - Unique certificate ID
   - Verification note

### Color Scheme

- **Excellence Certificate**: Gold/Orange gradient
- **Completion Certificate**: Blue/Cyan gradient
- **Background**: Dark blue (#0F0F25)
- **Accents**: Teal (#7EDBCA, #4ECDC4)

---

## Progress Tracking Logic

### Completion Percentage

Completion is calculated based on **required fields only**:

```tsx
const requiredFields = [
  // Module 1 required fields
  ['companyName', 'totalCapital', 'businessType'],
  // Module 2 required fields
  ['competitor1', 'competitor1Strength', 'competitiveAdvantage'],
  // ... etc for all modules
];

const completion = calculateCompletionPercentage(moduleData, requiredFields);
```

### Performance Score

Performance is calculated from:
- **60%** - Completion percentage
- **30%** - XP achievement ratio
- **10%** - Time bonus/penalty (if tracked)

### Certificate Unlocking

```
Completion Certificate: 100% of required tasks
Excellence Certificate: 100% completion + 90%+ performance score
```

---

## Localization

The certificate system is fully bilingual:

### Arabic (ar)

```tsx
certificates: {
  certificateSystem: 'نظام الشهادات',
  excellenceCertificate: 'شهادة تميّز',
  completionCertificate: 'شهادة إتمام',
  checkpointTitle: '🎯 أنت قريب جداً!',
  // ... more translations
}
```

### English (en)

```tsx
certificates: {
  certificateSystem: 'Certificate System',
  excellenceCertificate: 'Excellence Certificate',
  completionCertificate: 'Completion Certificate',
  checkpointTitle: '🎯 You\'re Almost There!',
  // ... more translations
}
```

---

## Storage & Persistence

### Certificate Storage

Certificates are saved to localStorage:

```tsx
const savedCertificates = JSON.parse(localStorage.getItem('yieldx_certificates') || '[]');
```

### Certificate Object Structure

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

---

## Integration with Dashboard

### Adding Certificate Button to Dashboard

```tsx
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { Dialog, DialogContent, DialogTrigger } from '@/app/components/ui/dialog';

function Dashboard() {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Award className="w-4 h-4 mr-2" />
            View Certificates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <CertificateSystem />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Customization

### Custom Certificate Design

To customize the PDF design, edit `/src/app/utils/certificateGenerator.ts`:

```tsx
export async function generateCertificatePDF(data: CertificateData, language: 'ar' | 'en') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Customize colors
  doc.setFillColor(15, 15, 37); // Background
  doc.setDrawColor(126, 219, 202); // Border
  
  // Customize fonts
  doc.setFontSize(32);
  doc.setTextColor(126, 219, 202);
  
  // Add your custom design elements
  // ...
}
```

### Custom Branding

Edit the branded search component:

```tsx
// In /src/app/components/ui/branded-search.tsx
<div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
  <Sparkles className="w-3 h-3" />
  YieldX  {/* Change this to your brand */}
</div>
```

---

## Best Practices

### 1. Progress Tracking

- Define required fields clearly for each module
- Don't count optional fields toward completion
- Update progress in real-time

### 2. User Experience

- Show progress checkpoint at 80-90% to motivate
- Clearly distinguish between completion and performance
- Provide instant PDF download

### 3. Certificate Security

- Use unique certificate IDs
- Store generation timestamp
- Consider server-side verification in production

### 4. Performance

- Generate PDFs client-side to reduce server load
- Cache certificate data in localStorage
- Lazy-load certificate images

---

## Troubleshooting

### Certificate Not Unlocking

**Issue**: Certificate remains locked at 100%

**Solution**: Ensure all required fields are properly marked in your module definitions:

```tsx
{ id: 'fieldName', required: true }
```

### PDF Download Fails

**Issue**: PDF doesn't download

**Solution**: Check browser console for errors. Ensure jsPDF is properly installed:

```bash
npm install jspdf @types/jspdf
```

### Arabic Text Not Displaying

**Issue**: Arabic text appears as boxes/question marks

**Solution**: The certificate system uses Unicode which supports Arabic by default. Ensure your jsPDF version supports Unicode text.

---

## Future Enhancements

Potential improvements for the certificate system:

1. **Blockchain Verification**: Store certificate hashes on blockchain for immutable verification
2. **Digital Signatures**: Add cryptographic signatures to certificates
3. **Share to LinkedIn**: Direct integration to share certificates on LinkedIn
4. **Certificate Templates**: Multiple certificate design templates
5. **Instructor Signatures**: Add instructor digital signatures
6. **QR Code Verification**: Embed QR codes linking to verification page
7. **Certificate Analytics**: Track which certificates users earn most
8. **Custom Branding**: Allow organizations to customize certificate design

---

## Support

For issues or questions about the certificate system:

1. Check this documentation
2. Review the code comments in implementation files
3. Test with demo data
4. Ensure all dependencies are installed

---

## License

This certificate system is part of the YieldX platform.

© 2026 YieldX. All rights reserved.
