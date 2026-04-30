import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils';

interface BrandedSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  language?: 'ar' | 'en';
  className?: string;
  showBrand?: boolean;
}

export function BrandedSearch({
  onSearch,
  placeholder,
  language = 'ar',
  className,
  showBrand = true
}: BrandedSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const defaultPlaceholder = language === 'ar'
    ? 'ابحث في YieldX...'
    : 'Search in YieldX...';

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Brand Badge (floating) */}
      <AnimatePresence>
        {showBrand && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-8 left-4 z-10"
          >
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              YieldX
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input Container */}
      <div
        className={cn(
          'relative flex items-center transition-all duration-300',
          isFocused
            ? 'ring-2 ring-violet-500 dark:ring-violet-400 shadow-lg'
            : 'ring-1 ring-slate-200 dark:ring-slate-700',
          'bg-white dark:bg-slate-800 rounded-lg'
        )}
      >
        {/* Search Icon */}
        <div className="absolute left-3 pointer-events-none">
          <Search className={cn(
            'w-5 h-5 transition-colors',
            isFocused
              ? 'text-violet-500 dark:text-violet-400'
              : 'text-slate-400 dark:text-slate-500'
          )} />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || defaultPlaceholder}
          className={cn(
            'w-full pl-10 pr-12 py-3 bg-transparent',
            'text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500',
            'outline-none',
            language === 'ar' ? 'text-right' : 'text-left'
          )}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />

        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="absolute right-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* YieldX Brand Watermark (bottom right) */}
      {showBrand && (
        <div className="absolute -bottom-5 right-2 text-xs text-slate-400 dark:text-slate-600 font-semibold flex items-center gap-1">
          <span className="opacity-50">Powered by</span>
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold">
            YieldX
          </span>
        </div>
      )}
    </div>
  );
}

interface BrandedSearchWithResultsProps extends BrandedSearchProps {
  results?: Array<{
    id: string;
    title: string;
    description?: string;
    type?: string;
    icon?: React.ReactNode;
  }>;
  onResultClick?: (id: string) => void;
  isLoading?: boolean;
}

export function BrandedSearchWithResults({
  results = [],
  onResultClick,
  isLoading,
  ...searchProps
}: BrandedSearchWithResultsProps) {
  const [showResults, setShowResults] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    setShowResults(value.length > 0);
    searchProps.onSearch?.(value);
  };

  const handleResultClick = (id: string) => {
    onResultClick?.(id);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <BrandedSearch
        {...searchProps}
        onSearch={handleSearch}
      />

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 mx-auto border-2 border-violet-500 border-t-transparent rounded-full"
                />
                <p className="mt-2 text-sm">
                  {searchProps.language === 'ar' ? 'جاري البحث...' : 'Searching...'}
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result.id)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      {result.icon && (
                        <div className="mt-1 text-violet-500">
                          {result.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {result.title}
                        </h4>
                        {result.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {result.description}
                          </p>
                        )}
                        {result.type && (
                          <span className="inline-block mt-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded">
                            {result.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {searchProps.language === 'ar' 
                    ? 'لا توجد نتائج للبحث'
                    : 'No results found'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
