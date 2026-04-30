import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, Trash2, Download, Edit2, Save, X } from 'lucide-react';

interface TextField {
  id: string;
  label: string;
  x: number; // percentage
  y: number; // percentage
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
}

interface CertificateTemplate {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  fields: TextField[];
}

export function CertificateTemplateManager() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<CertificateTemplate | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 1200, height: 850 });
  const [editingField, setEditingField] = useState<TextField | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({
    recipientName: 'Ahmed Al-Balushi',
    courseName: 'Business Feasibility Study Mastery',
    completionDate: 'April 19, 2026',
    instructorName: 'Dr. Sarah Al-Harthi'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get preview text for a field
  const getFieldPreviewText = (field: TextField): string => {
    const labelLower = field.label.toLowerCase();
    if (labelLower.includes('name') || labelLower.includes('recipient') || labelLower.includes('student')) {
      return previewData.recipientName;
    } else if (labelLower.includes('date') || labelLower.includes('completion')) {
      return previewData.completionDate;
    } else if (labelLower.includes('course')) {
      return previewData.courseName;
    } else if (labelLower.includes('instructor') || labelLower.includes('teacher')) {
      return previewData.instructorName;
    }
    return `[${field.label}]`;
  };

  // Quick setup: Add all standard fields at once
  const quickSetupFields = () => {
    if (!currentTemplate) return;

    const standardFields: TextField[] = [
      {
        id: Date.now().toString() + '-1',
        label: 'Recipient Name',
        x: 50,
        y: 45,
        fontSize: 64,
        fontFamily: 'Arial',
        color: '#1e3a8a',
        align: 'center',
        bold: true,
        italic: false
      },
      {
        id: Date.now().toString() + '-2',
        label: 'Completion Date',
        x: 25,
        y: 85,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#334155',
        align: 'left',
        bold: false,
        italic: false
      },
      {
        id: Date.now().toString() + '-3',
        label: 'Course Name',
        x: 50,
        y: 62,
        fontSize: 36,
        fontFamily: 'Arial',
        color: '#475569',
        align: 'center',
        bold: false,
        italic: false
      },
      {
        id: Date.now().toString() + '-4',
        label: 'Instructor Name',
        x: 75,
        y: 85,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#334155',
        align: 'right',
        bold: false,
        italic: true
      }
    ];

    setCurrentTemplate({
      ...currentTemplate,
      fields: standardFields
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width || 1200;
        const height = img.height || 850;

        setUploadedImage(event.target?.result as string);
        setImageDimensions({ width, height });

        // Create new template
        const newTemplate: CertificateTemplate = {
          id: Date.now().toString(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: event.target?.result as string,
          width,
          height,
          fields: []
        };
        setCurrentTemplate(newTemplate);
      };
      img.onerror = () => {
        alert('Failed to load image. Please try a different file.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add new text field
  const addTextField = () => {
    if (!currentTemplate) return;

    const fieldNumber = currentTemplate.fields.length + 1;

    // Set smart defaults based on field number
    let defaultLabel = `Field ${fieldNumber}`;
    let defaultY = 50;
    let defaultFontSize = 48;
    let defaultBold = false;

    if (fieldNumber === 1) {
      defaultLabel = 'Recipient Name';
      defaultY = 45; // Upper-middle position for name
      defaultFontSize = 64;
      defaultBold = true;
    } else if (fieldNumber === 2) {
      defaultLabel = 'Completion Date';
      defaultY = 85; // Bottom position for date
      defaultFontSize = 28;
      defaultBold = false;
    } else if (fieldNumber === 3) {
      defaultLabel = 'Course Name';
      defaultY = 60; // Middle-lower for course
      defaultFontSize = 36;
      defaultBold = false;
    } else if (fieldNumber === 4) {
      defaultLabel = 'Instructor Name';
      defaultY = 85; // Bottom right for instructor
      defaultFontSize = 28;
      defaultBold = false;
    }

    const newField: TextField = {
      id: Date.now().toString(),
      label: defaultLabel,
      x: 50,
      y: defaultY,
      fontSize: defaultFontSize,
      fontFamily: 'Arial',
      color: '#000000',
      align: 'center',
      bold: defaultBold,
      italic: false
    };

    setCurrentTemplate({
      ...currentTemplate,
      fields: [...currentTemplate.fields, newField]
    });
    setEditingField(newField);
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<TextField>) => {
    if (!currentTemplate) return;

    // Validate numeric values to prevent NaN
    const validatedUpdates = { ...updates };
    if ('x' in validatedUpdates && (isNaN(validatedUpdates.x!) || !isFinite(validatedUpdates.x!))) {
      validatedUpdates.x = 50;
    }
    if ('y' in validatedUpdates && (isNaN(validatedUpdates.y!) || !isFinite(validatedUpdates.y!))) {
      validatedUpdates.y = 50;
    }
    if ('fontSize' in validatedUpdates && (isNaN(validatedUpdates.fontSize!) || !isFinite(validatedUpdates.fontSize!))) {
      validatedUpdates.fontSize = 48;
    }

    setCurrentTemplate({
      ...currentTemplate,
      fields: currentTemplate.fields.map(f =>
        f.id === fieldId ? { ...f, ...validatedUpdates } : f
      )
    });

    if (editingField?.id === fieldId) {
      setEditingField({ ...editingField, ...validatedUpdates });
    }
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      fields: currentTemplate.fields.filter(f => f.id !== fieldId)
    });

    if (editingField?.id === fieldId) {
      setEditingField(null);
    }
  };

  // Handle field drag
  const handleFieldDrag = (e: React.MouseEvent, fieldId: string) => {
    if (!currentTemplate || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Ensure values are valid numbers
    if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
      updateField(fieldId, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      });
    }
  };

  // Save template
  const saveTemplate = () => {
    if (!currentTemplate) return;

    const existingIndex = templates.findIndex(t => t.id === currentTemplate.id);
    if (existingIndex >= 0) {
      setTemplates(templates.map(t => t.id === currentTemplate.id ? currentTemplate : t));
    } else {
      setTemplates([...templates, currentTemplate]);
    }

    alert('Template saved successfully!');
  };

  // Generate certificate with data
  const generateCertificate = async (data: typeof previewData) => {
    if (!currentTemplate || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to template size
    canvas.width = currentTemplate.width;
    canvas.height = currentTemplate.height;

    // Load and draw template image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      // Draw text fields
      currentTemplate.fields.forEach(field => {
        const x = (field.x / 100) * canvas.width;
        const y = (field.y / 100) * canvas.height;

        ctx.font = `${field.italic ? 'italic ' : ''}${field.bold ? 'bold ' : ''}${field.fontSize}px ${field.fontFamily}`;
        ctx.fillStyle = field.color;
        ctx.textAlign = field.align;

        // Map field labels to data
        let text = '';
        const labelLower = field.label.toLowerCase();

        if (labelLower.includes('name') || labelLower.includes('recipient') || labelLower.includes('student')) {
          text = data.recipientName;
        } else if (labelLower.includes('date') || labelLower.includes('completion')) {
          text = data.completionDate;
        } else if (labelLower.includes('course')) {
          text = data.courseName;
        } else if (labelLower.includes('instructor') || labelLower.includes('teacher')) {
          text = data.instructorName;
        } else {
          text = `[${field.label}]`;
        }

        ctx.fillText(text, x, y);
      });

      // Download
      const link = document.createElement('a');
      link.download = `Certificate_${data.recipientName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = currentTemplate.imageUrl;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">Certificate Template Manager</h1>
          <p className="text-slate-400">Upload your Canva/Figma design and define dynamic fields</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Template Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            {!uploadedImage && (
              <div className="bg-slate-900 rounded-lg p-12 border-2 border-dashed border-slate-700 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">Upload Certificate Template</h3>
                <p className="text-slate-400 mb-6">
                  Upload your certificate design from Canva, Figma, or any image editor
                  <br />
                  Supported formats: PNG, JPG, JPEG
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-900 to-purple-700 text-white rounded-lg hover:from-blue-800 hover:to-purple-600 transition-all"
                >
                  Choose Image
                </button>
              </div>
            )}

            {/* Template Canvas */}
            {uploadedImage && currentTemplate && (
              <div className="bg-slate-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl text-white">Template: {currentTemplate.name}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Change
                    </button>
                    {currentTemplate.fields.length === 0 && (
                      <button
                        onClick={quickSetupFields}
                        className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                      >
                        ⚡ Quick Setup
                      </button>
                    )}
                    <button
                      onClick={addTextField}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </button>
                    <button
                      onClick={saveTemplate}
                      className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>

                {/* Image with draggable fields */}
                <div className="relative inline-block">
                  <img
                    ref={imageRef}
                    src={uploadedImage}
                    alt="Certificate template"
                    className="max-w-full h-auto rounded border border-slate-700"
                  />

                  {/* Render draggable field markers */}
                  {currentTemplate.fields.map(field => (
                    <div
                      key={field.id}
                      className={`absolute cursor-move ${
                        editingField?.id === field.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseDown={() => setIsDragging(field.id)}
                      onMouseMove={(e) => {
                        if (isDragging === field.id) {
                          handleFieldDrag(e, field.id);
                        }
                      }}
                      onMouseUp={() => setIsDragging(null)}
                      onClick={() => setEditingField(field)}
                    >
                      <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm whitespace-nowrap shadow-lg">
                        <div className="text-xs opacity-75">{field.label}</div>
                        <div className="font-medium">{getFieldPreviewText(field)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-800 rounded p-3 mt-4">
                  <p className="text-slate-300 text-sm mb-2">
                    <strong>Quick Start:</strong> Click "⚡ Quick Setup" to auto-create all 4 fields, or use "+ Add Field" to add them one by one.
                  </p>
                  <p className="text-slate-400 text-xs">
                    • Drag blue markers to position fields
                    • Click a field to edit font, size, color, alignment
                    • Field 1 = Student Name | Field 2 = Date
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Field Properties */}
          <div className="space-y-6">
            {/* Field List */}
            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="text-lg text-white mb-4">Text Fields ({currentTemplate?.fields.length || 0})</h3>

              {currentTemplate && currentTemplate.fields.length > 0 ? (
                <div className="space-y-2">
                  {currentTemplate.fields.map(field => (
                    <div
                      key={field.id}
                      className={`p-3 rounded cursor-pointer transition-colors flex items-center justify-between ${
                        editingField?.id === field.id
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      onClick={() => setEditingField(field)}
                    >
                      <span>{field.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteField(field.id);
                        }}
                        className="p-1 hover:bg-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No fields yet. Click "Add Field" to start.</p>
              )}
            </div>

            {/* Field Editor */}
            {editingField && (
              <div className="bg-slate-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-white">Edit Field</h3>
                  <button
                    onClick={() => setEditingField(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Field Label</label>
                    <input
                      type="text"
                      value={editingField.label}
                      onChange={(e) => updateField(editingField.id, { label: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Recipient Name"
                    />
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-500">Auto-mapping keywords:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-blue-400">• "Name" or "Recipient"</div>
                        <div className="text-slate-500">→ Student name</div>
                        <div className="text-blue-400">• "Date" or "Completion"</div>
                        <div className="text-slate-500">→ Date completed</div>
                        <div className="text-blue-400">• "Course"</div>
                        <div className="text-slate-500">→ Course name</div>
                        <div className="text-blue-400">• "Instructor"</div>
                        <div className="text-slate-500">→ Instructor name</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Font Size</label>
                      <input
                        type="number"
                        value={editingField.fontSize || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          updateField(editingField.id, { fontSize: isNaN(value) ? 48 : value });
                        }}
                        className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                        min="8"
                        max="200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Color</label>
                      <input
                        type="color"
                        value={editingField.color}
                        onChange={(e) => updateField(editingField.id, { color: e.target.value })}
                        className="w-full h-10 bg-slate-800 rounded border border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Font Family</label>
                    <select
                      value={editingField.fontFamily}
                      onChange={(e) => updateField(editingField.id, { fontFamily: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Courier New">Courier New</option>
                      <option value="cursive">Cursive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Alignment</label>
                    <select
                      value={editingField.align}
                      onChange={(e) => updateField(editingField.id, { align: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingField.bold}
                        onChange={(e) => updateField(editingField.id, { bold: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Bold</span>
                    </label>

                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingField.italic}
                        onChange={(e) => updateField(editingField.id, { italic: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Italic</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Section */}
            {currentTemplate && currentTemplate.fields.length > 0 && (
              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="text-lg text-white mb-4">Test Certificate</h3>

                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={previewData.recipientName}
                    onChange={(e) => setPreviewData({ ...previewData, recipientName: e.target.value })}
                    placeholder="Recipient Name"
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={previewData.courseName}
                    onChange={(e) => setPreviewData({ ...previewData, courseName: e.target.value })}
                    placeholder="Course Name"
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={previewData.completionDate}
                    onChange={(e) => setPreviewData({ ...previewData, completionDate: e.target.value })}
                    placeholder="Completion Date"
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={previewData.instructorName}
                    onChange={(e) => setPreviewData({ ...previewData, instructorName: e.target.value })}
                    placeholder="Instructor Name"
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={() => generateCertificate(previewData)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-900 to-purple-700 text-white rounded-lg hover:from-blue-800 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Generate & Download Certificate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
