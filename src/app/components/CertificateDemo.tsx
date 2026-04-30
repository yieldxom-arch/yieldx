import React, { useState, useRef } from 'react';
import { Certificate } from './Certificate';
import { Download } from 'lucide-react';

export function CertificateDemo() {
  const [recipientName, setRecipientName] = useState('Ahmed Al-Balushi');
  const [courseName, setCourseName] = useState('Business Feasibility Study Mastery');
  const [completionDate, setCompletionDate] = useState('April 18, 2026');
  const [instructorName, setInstructorName] = useState('Dr. Sarah Al-Harthi');
  const [showPreview, setShowPreview] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);

  console.log('CertificateDemo rendering', { recipientName, showPreview });

  const handleDownload = async () => {
    alert('To enable downloads, run: pnpm add html2canvas\n\nThen uncomment the download logic in CertificateDemo.tsx');

    // Uncomment this after installing html2canvas:
    /*
    if (typeof window !== 'undefined') {
      const html2canvas = (await import('html2canvas')).default;
      const element = certificateRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#f8fafc',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `certificate-${recipientName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    */
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-3">Certificate Generator</h1>
          <p className="text-slate-400">Create professional course completion certificates</p>
        </div>

        {/* Controls Panel */}
        <div className="bg-slate-900 rounded-lg p-8 mb-8 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Enter recipient name"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Enter course name"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Completion Date</label>
              <input
                type="text"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g., April 18, 2026"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Instructor Name</label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Enter instructor name"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>

            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-gradient-to-r from-blue-900 to-purple-700 text-white rounded-lg hover:from-blue-800 hover:to-purple-600 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PNG
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        {showPreview && (
          <div ref={certificateRef}>
            <Certificate
              recipientName={recipientName}
              courseName={courseName}
              completionDate={completionDate}
              instructorName={instructorName}
            />
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-12 bg-slate-900 rounded-lg p-8 border border-slate-800">
          <h2 className="text-2xl text-white mb-4">Integration Instructions</h2>
          <div className="text-slate-400 space-y-4">
            <p>To use the certificate component in your YieldX platform:</p>

            <div className="bg-slate-950 rounded p-4 font-mono text-sm overflow-x-auto">
              <code className="text-emerald-400">
                {`import { Certificate } from '@/app/components/Certificate';

// Use with custom data
<Certificate
  recipientName="Student Name"
  courseName="Course Title"
  completionDate="Date"
  instructorName="Instructor Name"
/>`}
              </code>
            </div>

            <p className="pt-4">The certificate features:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Professional landscape layout optimized for PDF/PNG export</li>
              <li>Dark blue to purple gradient accents matching your brand</li>
              <li>Elegant corner decorations and verification seal</li>
              <li>Smooth entrance animations using Motion</li>
              <li>Fully customizable text fields</li>
              <li>Responsive design that maintains aspect ratio</li>
            </ul>

            <p className="pt-4">To enable downloads, install html2canvas:</p>
            <div className="bg-slate-950 rounded p-4 font-mono text-sm">
              <code className="text-blue-400">pnpm add html2canvas</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
