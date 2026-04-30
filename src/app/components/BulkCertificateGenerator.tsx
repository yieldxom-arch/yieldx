import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Users, AlertCircle } from 'lucide-react';

interface StudentData {
  recipientName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
}

export function BulkCertificateGenerator() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Handle CSV upload
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const data: StudentData[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim());
        data.push({
          recipientName: values[0] || '',
          courseName: values[1] || 'Business Feasibility Study',
          completionDate: values[2] || new Date().toLocaleDateString(),
          instructorName: values[3] || 'Dr. Sarah Al-Harthi'
        });
      }

      setStudents(data);
    };
    reader.readAsText(file);
  };

  // Handle template upload
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTemplateImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generate all certificates
  const generateAllCertificates = async () => {
    if (!templateImage || students.length === 0) return;

    setIsGenerating(true);
    setProgress(0);

    for (let i = 0; i < students.length; i++) {
      await generateSingleCertificate(students[i], i);
      setProgress(((i + 1) / students.length) * 100);

      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsGenerating(false);
    alert(`Successfully generated ${students.length} certificates!`);
  };

  // Generate single certificate
  const generateSingleCertificate = (student: StudentData, index: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!canvasRef.current || !templateImage) {
        resolve();
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw template
        ctx.drawImage(img, 0, 0);

        // Draw student name (centered, approximate position)
        ctx.font = 'bold 72px Arial';
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText(student.recipientName, canvas.width / 2, canvas.height * 0.45);

        // Draw course name
        ctx.font = '36px Arial';
        ctx.fillStyle = '#334155';
        ctx.fillText(student.courseName, canvas.width / 2, canvas.height * 0.60);

        // Draw date (bottom left)
        ctx.font = '28px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(student.completionDate, canvas.width * 0.15, canvas.height * 0.85);

        // Draw instructor (bottom right)
        ctx.textAlign = 'right';
        ctx.fillText(student.instructorName, canvas.width * 0.85, canvas.height * 0.85);

        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `Certificate_${student.recipientName.replace(/\s+/g, '_')}_${index + 1}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
          resolve();
        });
      };
      img.src = templateImage;
    });
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const csvContent = `Recipient Name,Course Name,Completion Date,Instructor Name
Ahmed Al-Balushi,Business Feasibility Study Mastery,April 19 2026,Dr. Sarah Al-Harthi
Fatma Al-Hinai,Entrepreneurship Fundamentals,April 19 2026,Dr. Sarah Al-Harthi
Mohammed Al-Rashdi,Financial Analysis & Planning,April 19 2026,Dr. Sarah Al-Harthi`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'certificate_template.csv';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-900 to-purple-700 rounded-full mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl mb-2 bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">
              Bulk Certificate Generator
            </h1>
            <p className="text-slate-600">
              Generate personalized certificates for multiple students automatically
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-900 mb-2">How to use:</h3>
                <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                  <li>Upload your certificate template image (PNG/JPG from Canva or Figma)</li>
                  <li>Download the sample CSV file and fill it with student data</li>
                  <li>Upload your completed CSV file</li>
                  <li>Click "Generate All Certificates" to create and download all certificates</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Step 1: Upload Template */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleTemplateUpload}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg mb-2">Step 1: Upload Template</h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload your certificate design
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-6 py-2 rounded-lg transition-all ${
                  templateImage
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {templateImage ? '✓ Template Uploaded' : 'Choose Template'}
              </button>
              {templateImage && (
                <img
                  src={templateImage}
                  alt="Template preview"
                  className="mt-4 max-w-full h-32 object-contain mx-auto border rounded"
                />
              )}
            </div>

            {/* Step 2: Upload CSV */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg mb-2">Step 2: Upload Student Data</h3>
              <p className="text-sm text-slate-600 mb-4">
                CSV file with student information
              </p>
              <div className="space-y-2">
                <button
                  onClick={downloadSampleCSV}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all mr-2"
                >
                  Download Sample CSV
                </button>
                <button
                  onClick={() => csvInputRef.current?.click()}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    students.length > 0
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {students.length > 0 ? `✓ ${students.length} Students Loaded` : 'Upload CSV'}
                </button>
              </div>
            </div>
          </div>

          {/* Student List Preview */}
          {students.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg mb-3">Students ({students.length})</h3>
              <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-slate-300">
                    <tr>
                      <th className="pb-2">#</th>
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Course</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Instructor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className="border-b border-slate-200">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{student.recipientName}</td>
                        <td className="py-2">{student.courseName}</td>
                        <td className="py-2">{student.completionDate}</td>
                        <td className="py-2">{student.instructorName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {templateImage && students.length > 0 && (
            <div className="text-center">
              <button
                onClick={generateAllCertificates}
                disabled={isGenerating}
                className={`px-8 py-4 rounded-lg text-lg transition-all flex items-center justify-center gap-3 mx-auto ${
                  isGenerating
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:from-blue-800 hover:to-purple-600 shadow-lg'
                }`}
              >
                <Download className="w-6 h-6" />
                {isGenerating
                  ? `Generating... ${Math.round(progress)}%`
                  : `Generate ${students.length} Certificates`}
              </button>

              {isGenerating && (
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-900 to-purple-700 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              Note: For advanced positioning control, use the Certificate Template Manager.
              <br />
              This bulk generator uses default text positions on your template.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
