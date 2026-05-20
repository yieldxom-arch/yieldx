# Certificate System Guide

YieldX now has a complete certificate generation system that supports custom templates from Canva or Figma!

## Features

### 1. Certificate Template Manager (Advanced)
**Access:** Set `SHOW_CERTIFICATE_MANAGER = true` in App.tsx or navigate to `'certificate-manager'` view

**Capabilities:**
- Upload custom certificate designs (PNG, JPG from Canva/Figma/any design tool)
- Visual drag-and-drop field editor
- Define dynamic text fields with precise positioning
- Customize font size, family, color, alignment, bold, italic for each field
- Real-time preview with test data
- Save templates for reuse
- Generate individual certificates with custom data

**How to Use:**
1. **Upload Template**: Click "Choose Image" and select your certificate design
2. **Add Fields**: Click "+ Add Field" to create dynamic text areas
3. **Position Fields**: Drag the blue field markers to position them on your template
4. **Edit Properties**: Click a field to edit its properties (label, font, size, color, etc.)
5. **Field Labels**: Use keywords like "Name", "Course", "Date", "Instructor" so the system knows what data to insert
6. **Test**: Fill in the preview data and click "Generate & Download Certificate"
7. **Save Template**: Click "Save Template" to reuse later

**Field Label Keywords:**
- "Name" or "Recipient" → Inserts recipient name
- "Course" → Inserts course name
- "Date" → Inserts completion date
- "Instructor" → Inserts instructor name

### 2. Bulk Certificate Generator (Simple)
**Access:** Navigate to `'bulk-certificates'` view

**Capabilities:**
- Generate certificates for multiple students at once
- CSV upload for batch processing
- Automatic download of all certificates
- Progress tracking

**How to Use:**
1. **Upload Template**: Upload your certificate background image
2. **Download Sample CSV**: Click "Download Sample CSV" to get the template
3. **Fill CSV**: Add student data following this format:
   ```csv
   Recipient Name,Course Name,Completion Date,Instructor Name
   Ahmed Al-Balushi,Business Feasibility Study,April 19 2026,Dr. Sarah
   Fatma Al-Hinai,Entrepreneurship,April 19 2026,Dr. Sarah
   ```
4. **Upload CSV**: Upload your completed CSV file
5. **Generate**: Click "Generate X Certificates" and all certificates will download automatically

**Note:** Bulk generator uses default text positions. For precise control, use the Template Manager.

## Integration with YieldX

### Automatic Certificate Generation
When a student completes all 7 levels, you can automatically generate their certificate:

```tsx
// In your completion handler
import { generateCertificate } from '@/lib/certificateGenerator';

const handleCompletion = async (student) => {
  await generateCertificate({
    recipientName: student.name,
    courseName: 'YieldX Business Planning',
    completionDate: new Date().toLocaleDateString(),
    instructorName: student.instructorName
  });
};
```

### Routes
Add these to your navigation:
- `certificate-manager` - Template editor and individual generation
- `bulk-certificates` - Bulk CSV-based generation
- `certificate` - Simple pre-designed certificate

## Tips for Best Results

### Designing in Canva/Figma:
1. **Use standard sizes**: 1200x850px (landscape) or 850x1100px (portrait)
2. **Leave space for text**: Design with blank areas where names/dates will go
3. **Export as PNG**: High quality, 300 DPI if possible
4. **Use readable fonts**: The system will overlay text, so ensure good contrast
5. **Test alignment**: Upload and test with sample data before bulk generation

### Text Positioning:
1. **Center-aligned fields**: Position at 50% X for centered names
2. **Font sizes**: 
   - Main name: 60-72px
   - Course name: 36-48px
   - Date/signatures: 24-32px
3. **Colors**: Use colors that contrast well with your template background
4. **Multiple lines**: For long text, reduce font size or use shorter descriptions

### Bulk Generation:
1. **CSV format**: Ensure no commas in names (use quotes if needed: "Al-Balushi, Ahmed")
2. **Date format**: Use consistent date format across all entries
3. **File names**: Keep names simple for clean file downloads
4. **Batch size**: Generate in batches of 50-100 for best performance

## Example Workflow

### For Lecturers:
1. Design certificate template in Canva with your institution branding
2. Export as PNG (1200x850px)
3. Upload to Certificate Template Manager
4. Position fields for student name, course, date, instructor
5. Save template as "YieldX_Certificate_2026"
6. At end of semester, export student completion data as CSV
7. Use Bulk Generator to create all certificates at once

### For Organizations:
1. Use organization-branded template with logo
2. Create different templates for different courses/programs
3. Save multiple templates in the manager
4. Generate certificates as employees complete training

## Current Status

✅ Template upload system
✅ Visual field editor with drag-and-drop
✅ Field property customization
✅ Individual certificate generation
✅ Bulk CSV-based generation
✅ Progress tracking
✅ Automatic downloads

## To Switch Back to Normal YieldX App

In `/src/app/App.tsx` line 6-9, set all flags to `false`:

```tsx
const PREVIEW_CERTIFICATE = false;
const SHOW_USER_GUIDE = false;
const SHOW_CERTIFICATE_MANAGER = false; // This is currently true
```

The certificate system will still be accessible via routing in your navigation.
