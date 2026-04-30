import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Database, Zap, CheckCircle } from 'lucide-react';

export function TestLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-[#4ECDC4] via-[#7FDBCA] to-[#4ECDC4] bg-clip-text text-transparent mb-4">
          YieldX + Supabase
        </h1>
        <p className="text-center text-xl text-gray-600 dark:text-gray-400 mb-12">
          Choose a test to verify your Supabase integration
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simple Test */}
          <Card className="p-6 bg-white dark:bg-[#1B1B3A]/50 border-2 border-[#4ECDC4]/30 hover:border-[#4ECDC4] transition-all hover:shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#7FDBCA] flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Simple Test
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Quick test to see real data from Supabase. Perfect for verifying the connection works.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Fetches levels from database
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Shows real data (not hardcoded)
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Beautiful visual display
              </div>
            </div>

            <Button
              onClick={() => window.location.href = '?view=test-simple-levels'}
              className="w-full bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white font-bold py-3"
            >
              Run Simple Test →
            </Button>
          </Card>

          {/* Full Diagnostics */}
          <Card className="p-6 bg-white dark:bg-[#1B1B3A]/50 border-2 border-purple-300 dark:border-purple-500/30 hover:border-purple-500 transition-all hover:shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Full Diagnostics
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Complete test with configuration check, connection status, and all data tables.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Environment variables check
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Connection diagnostics
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Full data display (levels, videos, categories)
              </div>
            </div>

            <Button
              onClick={() => window.location.href = '?view=test-supabase'}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3"
            >
              Run Full Diagnostics →
            </Button>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            🎯 What to Expect
          </h3>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p>
              <strong>✅ If working:</strong> You'll see real data from your PostgreSQL database (9 levels, 6 video categories, 6 videos)
            </p>
            <p>
              <strong>❌ If not working:</strong> You'll see clear error messages with instructions to fix
            </p>
            <p className="mt-4 text-lg font-semibold text-[#4ECDC4]">
              👉 Start with the Simple Test to see the magic happen!
            </p>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-[#1B1B3A]/50 border border-gray-200 dark:border-gray-700 hover:border-[#4ECDC4] transition-all cursor-pointer">
            <a href="/QUICK_START.md" target="_blank" className="block text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Start</div>
            </a>
          </Card>
          
          <Card className="p-4 bg-white dark:bg-[#1B1B3A]/50 border border-gray-200 dark:border-gray-700 hover:border-[#4ECDC4] transition-all cursor-pointer">
            <a href="/FIGMA_MAKE_SUPABASE.md" target="_blank" className="block text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Figma Setup</div>
            </a>
          </Card>
          
          <Card className="p-4 bg-white dark:bg-[#1B1B3A]/50 border border-gray-200 dark:border-gray-700 hover:border-[#4ECDC4] transition-all cursor-pointer">
            <a href="/SUPABASE_SETUP.md" target="_blank" className="block text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Guide</div>
            </a>
          </Card>
          
          <Card className="p-4 bg-white dark:bg-[#1B1B3A]/50 border border-gray-200 dark:border-gray-700 hover:border-[#4ECDC4] transition-all cursor-pointer">
            <a href="/INTEGRATION_COMPLETE.md" target="_blank" className="block text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Complete</div>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
