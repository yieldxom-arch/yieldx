import React, { useState } from 'react';

/**
 * TEMPORARY MIGRATION BUTTON
 * This component provides a UI button to run the database migration
 * to fix the organization role constraint error.
 * 
 * Remove this component after migration is complete.
 */
export function MigrationButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  // OFFLINE MODE: migration not needed — hide this component
  React.useEffect(() => {
    setIsChecking(false);
    setNeedsMigration(false);
    setIsDismissed(true);
  }, []);

  const checkMigrationStatus = async () => {
    // OFFLINE MODE: no-op
    setIsChecking(false);
  };

  const handleRunMigration = async () => {
    setIsRunning(true);
    setResult(null);
    
    console.log('🔧 Running migration to fix organization role constraint...');
    
    // First check if migration is needed
    const statusCheck = await checkMigrationStatusInline();
    
    if (statusCheck.hasOrganization) {
      console.log('✅ Migration not needed - constraint already correct!');
      setResult({ success: true, message: 'Constraint already up to date! No migration needed!' });
      setIsRunning(false);
      await checkMigrationStatus();
      return;
    }
    
    try {
      const { projectId, publicAnonKey } = await import('/utils/supabase/info');
      const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a05faef1`;
      
      const response = await fetch(`${SERVER_BASE}/run-migration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      const migrationResult = await response.json();
      
      if (response.ok) {
        console.log('✅ Migration successful:', migrationResult.message);
        setResult({ success: true, message: migrationResult.message });
      } else {
        console.error('❌ Migration failed:', migrationResult.error);
        
        // If error is about constraint already existing, that's actually OK
        if (migrationResult.error?.includes('already exists') || migrationResult.error?.includes('already up to date')) {
          console.log('ℹ️ Constraint already correct - treating as success');
          setResult({ success: true, message: 'Constraint already allows organization role!' });
        } else {
          setResult({ success: false, error: migrationResult.error });
        }
      }
    } catch (error: any) {
      console.error('❌ Migration request failed:', error.message);
      setResult({ success: false, error: error.message });
    }
    
    setIsRunning(false);
    
    // Recheck status after migration
    await checkMigrationStatus();
  };

  const checkMigrationStatusInline = async () => {
    try {
      const { projectId, publicAnonKey } = await import('/utils/supabase/info');
      const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a05faef1`;
      
      const response = await fetch(`${SERVER_BASE}/check-migration`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Migration status:', result);
        return result;
      } else {
        const result = await response.json();
        console.error('❌ Status check failed:', result.error);
        return { exists: false, hasOrganization: false, status: 'unknown' };
      }
    } catch (error: any) {
      console.error('❌ Status check request failed:', error.message);
      return { exists: false, hasOrganization: false, status: 'unknown' };
    }
  };

  // Don't show if dismissed or checking
  if (isDismissed || isChecking) {
    return null;
  }

  // Don't show if migration not needed
  if (!needsMigration && result?.success) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-full transition-colors"
        title="Dismiss (you can still run migration from console)"
        aria-label="Dismiss"
      >
        ×
      </button>
      
      <div className="flex items-start gap-3 pr-6">
        <div className="flex-shrink-0 text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-yellow-900 mb-1">
            Database Migration Required
          </h3>
          <p className="text-xs text-yellow-800 mb-3">
            Organization role constraint needs to be updated. Click below to fix.
          </p>
          
          <button
            onClick={handleRunMigration}
            disabled={isRunning || result?.success}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : result?.success
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95'
            }`}
          >
            {isRunning ? '⏳ Running Migration...' : result?.success ? '✅ Migration Complete!' : '🔧 Run Migration Now'}
          </button>
          
          {result && (
            <div className={`mt-2 p-2 rounded text-xs animate-in fade-in duration-300 ${
              result.success 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              <div className="font-medium mb-1">
                {result.success ? '✅ Success!' : '❌ Error'}
              </div>
              <div className="text-xs">
                {result.message || result.error}
              </div>
              {!result.success && (
                <div className="mt-2 pt-2 border-t border-red-200 text-xs">
                  💡 Check the browser console for more details
                </div>
              )}
            </div>
          )}
          
          {!result?.success && (
            <p className="text-xs text-yellow-700 mt-2">
              After migration succeeds, you can register organization accounts.
            </p>
          )}
          
          {result?.success && (
            <p className="text-xs text-green-700 mt-2 font-medium">
              🎉 You can now register organization accounts!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}