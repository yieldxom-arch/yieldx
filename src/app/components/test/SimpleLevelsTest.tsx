import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/app/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface Level {
  id: number;
  level_number: number;
  title_en: string;
  title_ar: string;
}

export function SimpleLevelsTest() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLevels() {
      try {
        console.log('🚀 Fetching levels from Supabase...');
        
        const { data, error } = await supabase
          .from('levels')
          .select('id, title_en, title_ar, level_number')
          .order('level_number');

        if (error) {
          console.error('❌ Supabase error:', error);
          throw error;
        }

        console.log('✅ Levels fetched successfully:', data);
        setLevels(data || []);
      } catch (err: any) {
        console.error('❌ Failed to fetch levels:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLevels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4ECDC4] via-[#7FDBCA] to-[#4ECDC4] bg-clip-text text-transparent mb-4">
          📊 Live Supabase Data Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Fetching real data from Supabase database...
        </p>

        {/* Loading State */}
        {loading && (
          <Card className="p-8 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-[#4ECDC4] animate-spin" />
              <span className="text-lg text-gray-700 dark:text-gray-300">
                Loading levels from Supabase...
              </span>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                  Failed to Load Data
                </h3>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Success State - Real Data from Supabase! */}
        {!loading && !error && levels.length > 0 && (
          <>
            {/* Success Banner */}
            <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
                    🎉 SUCCESS! Real Data Loaded from Supabase!
                  </h2>
                  <p className="text-green-700 dark:text-green-400">
                    Found <strong>{levels.length} levels</strong> in your database. 
                    This is <strong>NOT fake data</strong> - it's coming directly from your Supabase PostgreSQL database!
                  </p>
                </div>
              </div>
            </div>

            {/* Levels List */}
            <Card className="p-6 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                📋 Levels from Database ({levels.length} total)
              </h2>
              
              <div className="space-y-3">
                {levels.map((level) => (
                  <div
                    key={level.id}
                    className="group p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-[#4ECDC4]/10 dark:to-[#7FDBCA]/10 border border-purple-200 dark:border-[#4ECDC4]/30 hover:border-[#4ECDC4] dark:hover:border-[#4ECDC4] transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      {/* Level Number Badge */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#7FDBCA] flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">
                          {level.level_number}
                        </span>
                      </div>

                      {/* Level Titles */}
                      <div className="flex-1">
                        <div className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#4ECDC4] dark:group-hover:text-[#7FDBCA] transition-colors">
                          {level.title_en}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {level.title_ar}
                        </div>
                      </div>

                      {/* Database ID */}
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        ID: {level.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stats Card */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-[#4ECDC4]/20 to-[#7FDBCA]/20 border border-[#4ECDC4]/30">
                <div className="text-3xl font-bold text-[#4ECDC4]">{levels.length}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Total Levels</div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <div className="text-3xl font-bold text-green-600">✓</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Connected to Supabase</div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <div className="text-3xl font-bold text-blue-600">🚀</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Real-time Ready</div>
              </Card>
            </div>

            {/* The Moment */}
            <div className="mt-8 p-8 rounded-lg bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/50">
              <h2 className="text-3xl font-bold text-center mb-4">
                🎯 <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  This is THE Moment!
                </span>
              </h2>
              <p className="text-center text-lg text-gray-800 dark:text-gray-200 mb-2">
                You're seeing <strong>real data from your PostgreSQL database</strong>
              </p>
              <p className="text-center text-lg text-gray-800 dark:text-gray-200">
                Not hardcoded. Not fake. Not localStorage. <strong>Real cloud data.</strong>
              </p>
              <p className="text-center text-2xl font-bold mt-4 text-orange-600 dark:text-orange-400">
                YieldX is now a REAL app! 🎊
              </p>
            </div>
          </>
        )}

        {/* No Data State */}
        {!loading && !error && levels.length === 0 && (
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30">
            <p className="text-yellow-800 dark:text-yellow-300">
              No levels found in database. Make sure you ran the SQL schema.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
