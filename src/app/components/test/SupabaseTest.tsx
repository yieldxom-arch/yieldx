import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { checkSupabaseConfig } from '@/lib/supabase-config';
import { useLevels, useVideos, useVideoCategories } from '@/hooks/useSupabase';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const configCheck = checkSupabaseConfig();

  const { levels, loading: levelsLoading } = useLevels();
  const { categories, loading: categoriesLoading } = useVideoCategories();
  const { videos, loading: videosLoading } = useVideos();

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic query
        const { data, error } = await supabase.from('levels').select('count').single();

        if (error) {
          setConnectionStatus('error');
          setError(error.message);
        } else {
          setConnectionStatus('connected');
        }
      } catch (err: any) {
        setConnectionStatus('error');
        setError(err.message);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4ECDC4] via-[#7FDBCA] to-[#4ECDC4] bg-clip-text text-transparent mb-8">
          Supabase Connection Test
        </h1>

        {/* Environment Configuration Check */}
        <Card className="p-6 mb-6 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {configCheck.checks.urlExists ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                VITE_SUPABASE_URL: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{configCheck.config.url}</code>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {configCheck.checks.keyExists ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                VITE_SUPABASE_ANON_KEY: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{configCheck.config.keyPreview}</code>
              </span>
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Configuration Source: {configCheck.config.source}
                </span>
              </div>
            </div>
            {configCheck.checks.usingFallback && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-300">Using Fallback Configuration</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      Supabase is configured directly in <code className="px-1 bg-yellow-100 dark:bg-yellow-900/50 rounded">/src/lib/supabase-config.ts</code>
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                      This works perfectly in Figma Make! For local development, you can optionally create a <code className="px-1 bg-yellow-100 dark:bg-yellow-900/50 rounded">.env.local</code> file.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!configCheck.isValid && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-800 dark:text-red-300">Configuration Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      Supabase credentials are not set. Check <code className="px-1 bg-red-100 dark:bg-red-900/50 rounded">/src/lib/supabase-config.ts</code>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Connection Status */}
        <Card className="p-6 mb-6 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20">
          <div className="flex items-center gap-4">
            {connectionStatus === 'checking' && (
              <>
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Checking Connection...</h2>
                  <p className="text-gray-600 dark:text-gray-400">Testing Supabase connection</p>
                </div>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connected Successfully!</h2>
                  <p className="text-gray-600 dark:text-gray-400">YieldX is connected to Supabase</p>
                </div>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connection Failed</h2>
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Levels Data */}
        <Card className="p-6 mb-6 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Levels ({levels.length})
          </h2>
          {levelsLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Loading levels...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-[#4ECDC4]/10 border border-purple-200 dark:border-[#4ECDC4]/20"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Level {level.level_number}:
                    </span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{level.title_en}</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{level.title_ar}</span>
                  </div>
                  <span className="text-sm text-[#4ECDC4] font-semibold">{level.max_xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Video Categories */}
        <Card className="p-6 mb-6 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Video Categories ({categories.length})
          </h2>
          {categoriesLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Loading categories...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 rounded-lg bg-gradient-to-br from-[#4ECDC4]/20 to-[#7FDBCA]/20 border border-[#4ECDC4]/30"
                >
                  <div className="font-bold text-slate-900 dark:text-white">{category.name_en}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{category.name_ar}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Videos */}
        <Card className="p-6 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Videos ({videos.length})
          </h2>
          {videosLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Loading videos...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 dark:text-white">{video.title_en}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{video.title_ar}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{video.duration_minutes} min</span>
                        <span>⭐ {video.rating}</span>
                        <span>👁️ {video.views} views</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          video.required_tier === 'free' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                            : video.required_tier === 'premium'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        }`}>
                          {video.required_tier.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Success Message */}
        {connectionStatus === 'connected' && (
          <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
              ✅ Supabase Integration Successful!
            </h3>
            <p className="text-green-600 dark:text-green-400">
              All data is loading correctly from your Supabase database. You can now use the platform with real-time sync!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}