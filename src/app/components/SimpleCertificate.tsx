import React from 'react';

export function SimpleCertificate() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="bg-white p-16 rounded-lg shadow-2xl max-w-4xl w-full">
        <h1 className="text-5xl text-center mb-8 bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">
          CERTIFICATE OF COMPLETION
        </h1>

        <div className="w-32 h-1 bg-gradient-to-r from-blue-900 to-purple-700 mx-auto mb-8" />

        <p className="text-center text-slate-600 text-lg mb-6">
          This is to certify that
        </p>

        <h2 className="text-4xl text-center mb-6 text-slate-900 border-b-2 border-blue-900 pb-3 inline-block w-full">
          Ahmed Al-Balushi
        </h2>

        <p className="text-center text-slate-600 text-lg mb-4">
          has successfully completed the course
        </p>

        <h3 className="text-2xl text-center mb-12 text-slate-800">
          Business Feasibility Study Mastery
        </h3>

        <div className="flex justify-between mt-16">
          <div className="text-center">
            <div className="text-lg mb-2">April 18, 2026</div>
            <div className="h-px w-48 bg-slate-400 mb-1" />
            <div className="text-sm text-slate-500">DATE</div>
          </div>

          <div className="text-center">
            <div className="text-2xl mb-2 italic">Dr. Sarah Al-Harthi</div>
            <div className="h-px w-48 bg-slate-400 mb-1" />
            <div className="text-sm text-slate-500">INSTRUCTOR</div>
          </div>
        </div>
      </div>
    </div>
  );
}
