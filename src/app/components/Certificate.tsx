import React from 'react';
import { motion } from 'motion/react';

interface CertificateProps {
  recipientName?: string;
  courseName?: string;
  completionDate?: string;
  instructorName?: string;
}

export function Certificate({
  recipientName = "Ahmed Al-Balushi",
  courseName = "Business Feasibility Study Mastery",
  completionDate = "April 18, 2026",
  instructorName = "Dr. Sarah Al-Harthi"
}: CertificateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[1200px] aspect-[1200/850] bg-white shadow-2xl"
      >
        {/* Corner Accents - Top Left */}
        <svg className="absolute top-0 left-0 w-32 h-32" viewBox="0 0 128 128">
          <defs>
            <linearGradient id="gradient-tl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path d="M 0 0 L 96 0 L 0 96 Z" fill="url(#gradient-tl)" opacity="0.1" />
          <path d="M 0 0 L 64 0 L 0 64 Z" fill="none" stroke="url(#gradient-tl)" strokeWidth="1.5" />
        </svg>

        {/* Corner Accents - Top Right */}
        <svg className="absolute top-0 right-0 w-32 h-32" viewBox="0 0 128 128">
          <path d="M 128 0 L 32 0 L 128 96 Z" fill="url(#gradient-tl)" opacity="0.1" />
          <path d="M 128 0 L 64 0 L 128 64 Z" fill="none" stroke="url(#gradient-tl)" strokeWidth="1.5" />
        </svg>

        {/* Corner Accents - Bottom Left */}
        <svg className="absolute bottom-0 left-0 w-32 h-32" viewBox="0 0 128 128">
          <path d="M 0 128 L 96 128 L 0 32 Z" fill="url(#gradient-tl)" opacity="0.1" />
          <path d="M 0 128 L 64 128 L 0 64 Z" fill="none" stroke="url(#gradient-tl)" strokeWidth="1.5" />
        </svg>

        {/* Corner Accents - Bottom Right */}
        <svg className="absolute bottom-0 right-0 w-32 h-32" viewBox="0 0 128 128">
          <path d="M 128 128 L 32 128 L 128 32 Z" fill="url(#gradient-tl)" opacity="0.1" />
          <path d="M 128 128 L 64 128 L 128 64 Z" fill="none" stroke="url(#gradient-tl)" strokeWidth="1.5" />
        </svg>

        {/* Main Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-20 py-16">

          {/* Seal Badge */}
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-16 right-20"
          >
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 96 96" className="w-full h-full">
                <defs>
                  <linearGradient id="seal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="50%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                {/* Outer circle */}
                <circle cx="48" cy="48" r="46" fill="none" stroke="url(#seal-gradient)" strokeWidth="2" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="url(#seal-gradient)" strokeWidth="1" opacity="0.3" />

                {/* Star points */}
                <path
                  d="M 48 8 L 52 36 L 80 28 L 60 48 L 88 68 L 56 60 L 48 88 L 40 60 L 8 68 L 36 48 L 16 28 L 44 36 Z"
                  fill="url(#seal-gradient)"
                  opacity="0.15"
                />

                {/* Center circle */}
                <circle cx="48" cy="48" r="16" fill="url(#seal-gradient)" />
                <circle cx="48" cy="48" r="12" fill="white" />
                <text x="48" y="54" fontSize="14" fontWeight="700" textAnchor="middle" fill="url(#seal-gradient)">✓</text>
              </svg>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl tracking-wider mb-8"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 50%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            CERTIFICATE OF COMPLETION
          </motion.h1>

          {/* Divider Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-32 h-0.5 mb-10"
            style={{
              background: 'linear-gradient(90deg, #1e3a8a 0%, #7c3aed 100%)'
            }}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-slate-600 text-lg mb-8"
          >
            This is to certify that
          </motion.p>

          {/* Recipient Name - Hero Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <h2
              id="recipient-name"
              className="text-6xl text-center px-12 pb-3 border-b-2"
              style={{
                borderImage: 'linear-gradient(90deg, transparent, #4f46e5, transparent) 1',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {recipientName}
            </h2>
          </motion.div>

          {/* Completion Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-slate-600 text-lg mb-3"
          >
            has successfully completed the course
          </motion.p>

          {/* Course Name */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-3xl mb-16 text-slate-800"
          >
            {courseName}
          </motion.h3>

          {/* Bottom Section - Date and Signature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-end justify-between w-full max-w-2xl mt-auto"
          >
            {/* Date */}
            <div className="text-center">
              <div className="text-slate-900 text-lg mb-2">{completionDate}</div>
              <div className="h-0.5 w-48 bg-gradient-to-r from-slate-300 to-slate-400 mb-1" />
              <div className="text-slate-500 text-sm tracking-wide">DATE</div>
            </div>

            {/* Signature */}
            <div className="text-center">
              <div
                className="text-4xl mb-1 italic"
                style={{
                  fontFamily: 'cursive',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {instructorName}
              </div>
              <div className="h-0.5 w-48 bg-gradient-to-r from-slate-300 to-slate-400 mb-1" />
              <div className="text-slate-500 text-sm tracking-wide">INSTRUCTOR</div>
            </div>
          </motion.div>
        </div>

        {/* Subtle Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </motion.div>
    </div>
  );
}
