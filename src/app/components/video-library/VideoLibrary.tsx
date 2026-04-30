import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Clock,
  Star,
  Eye,
  Lock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { EDUCATIONAL_VIDEOS, VIDEO_CATEGORIES } from '@/app/data/subscriptionData';
import type { EducationalVideo, SubscriptionTier } from '@/app/contexts/YieldXContext';
import { SubscriptionModal } from '@/app/components/subscription/SubscriptionModal';
import { translations } from '@/app/contexts/translations';

export function VideoLibrary() {
  const { user, setCurrentView, language } = useYieldX();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<EducationalVideo | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Get translations for current language
  const t = translations[language];
  const isRTL = language === 'ar';

  const userTier: SubscriptionTier = user?.subscriptionTier || 'free';

  const tierHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    premium: 1,
    enterprise: 2,
  };

  const canAccessVideo = (video: EducationalVideo): boolean => {
    return tierHierarchy[userTier] >= tierHierarchy[video.requiredTier];
  };

  const filteredVideos = EDUCATIONAL_VIDEOS.filter((video) => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.titleAr.includes(searchQuery) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setCurrentView('dashboard')}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-50 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 hover:border-[#4ECDC4] text-gray-700 dark:text-gray-300 rounded-lg transition-all shadow-sm hover:shadow-md group"
      >
        {isRTL ? (
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        ) : (
          <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        )}
        <span className="font-semibold">{t.videoLibrary.backToDashboard}</span>
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4ECDC4] via-[#7FDBCA] to-[#4ECDC4] bg-clip-text text-transparent mb-2">
          {t.videoLibrary.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t.videoLibrary.subtitle}</p>
      </motion.div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
          <input
            type="text"
            placeholder={t.videoLibrary.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors shadow-sm`}
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl px-4 py-3 shadow-sm">
          <Filter className="w-5 h-5 text-[#4ECDC4]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-[#1B1B3A]">{t.videoLibrary.allCategories}</option>
            {VIDEO_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id} className="bg-white dark:bg-[#1B1B3A]">
                {isRTL ? category.nameAr : category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscription Tier Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`mb-8 p-4 rounded-xl border shadow-md ${
          userTier === 'free'
            ? 'bg-gray-100 dark:bg-gray-500/10 border-gray-300 dark:border-gray-500/30'
            : userTier === 'premium'
            ? 'bg-[#4ECDC4]/10 border-[#4ECDC4]/30'
            : 'bg-purple-100 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles
              className={`w-6 h-6 ${
                userTier === 'free'
                  ? 'text-gray-500 dark:text-gray-400'
                  : userTier === 'premium'
                  ? 'text-[#4ECDC4]'
                  : 'text-purple-500 dark:text-purple-400'
              }`}
            />
            <div>
              <p className="text-slate-900 dark:text-white font-semibold">
                {userTier === 'free' && t.videoLibrary.freePlan}
                {userTier === 'premium' && t.videoLibrary.premiumPlan}
                {userTier === 'enterprise' && t.videoLibrary.enterprisePlan}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userTier === 'free' && t.videoLibrary.freePlanDesc}
                {userTier === 'premium' && t.videoLibrary.premiumPlanDesc}
                {userTier === 'enterprise' && t.videoLibrary.enterprisePlanDesc}
              </p>
            </div>
          </div>
          {userTier === 'free' && (
            <button 
              onClick={() => setShowSubscriptionModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#4ECDC4]/50 transition-all"
            >
              {t.videoLibrary.upgradeNow}
            </button>
          )}
        </div>
      </motion.div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredVideos.map((video, index) => {
            const canAccess = canAccessVideo(video);
            const isCompleted = video.completedBy?.includes(user?.id || '');

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative bg-white dark:bg-[#1B1B3A]/50 border rounded-xl overflow-hidden hover:shadow-xl transition-all shadow-md ${
                  canAccess
                    ? 'border-purple-200 dark:border-[#4ECDC4]/20 hover:border-[#4ECDC4] cursor-pointer'
                    : 'border-gray-300 dark:border-gray-500/20 cursor-not-allowed opacity-80'
                }`}
                onClick={() => canAccess && setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={isRTL ? video.titleAr : video.title}
                    className={`w-full h-full object-cover transition-transform group-hover:scale-110 ${
                      !canAccess && 'filter blur-sm opacity-50'
                    }`}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 dark:from-[#1B1B3A] via-transparent to-transparent" />

                  {/* Play Button */}
                  {canAccess ? (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="w-16 h-16 bg-[#4ECDC4] rounded-full flex items-center justify-center shadow-lg shadow-[#4ECDC4]/50">
                        <Play className="w-8 h-8 text-white translate-x-0.5" fill="currentColor" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gray-500/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} flex gap-2`}>
                    {video.isNew && (
                      <span className="px-2 py-1 bg-[#4ECDC4] text-white text-xs font-bold rounded-md shadow-md">
                        {t.videoLibrary.new}
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3 h-3" />
                        {t.videoLibrary.completed}
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md`}>
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-xs text-white">{video.duration} {t.videoLibrary.minutes}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {isRTL ? video.titleAr : video.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {isRTL ? video.descriptionAr : video.description}
                  </p>

                  {/* Instructor */}
                  <p className="text-sm text-[#4ECDC4] mb-3">
                    {isRTL ? video.instructorAr : video.instructor}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{video.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        <span className="text-slate-900 dark:text-white font-semibold">{video.rating}</span>
                      </div>
                    </div>

                    {!canAccess && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Lock className="w-3 h-3" />
                        <span>
                          {video.requiredTier === 'premium' && t.videoLibrary.premium}
                          {video.requiredTier === 'enterprise' && t.videoLibrary.enterprise}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Level Badge */}
                {video.levelId && (
                  <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-white/90 dark:bg-[#4ECDC4]/20 backdrop-blur-sm border border-[#4ECDC4]/30 px-2 py-1 rounded-md shadow-md`}>
                    <span className="text-xs text-[#4ECDC4] font-semibold">
                      {t.videoLibrary.level} {video.levelId}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredVideos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t.videoLibrary.noResults}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 text-[#4ECDC4] hover:underline font-semibold"
          >
            {t.videoLibrary.resetSearch}
          </button>
        </motion.div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1B1B3A] border border-[#4ECDC4]/30 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Video Player */}
              <div className="aspect-video bg-black">
                {selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={selectedVideo.videoUrl}
                    title={isRTL ? selectedVideo.titleAr : selectedVideo.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.videoUrl}
                    title={isRTL ? selectedVideo.titleAr : selectedVideo.title}
                    className="w-full h-full"
                    controls
                    autoPlay
                  />
                )}
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isRTL ? selectedVideo.titleAr : selectedVideo.title}
                </h2>
                <p className="text-gray-400 mb-4">
                  {isRTL ? selectedVideo.descriptionAr : selectedVideo.description}
                </p>

                <div className="flex items-center gap-6 mb-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{t.videoLibrary.instructor}:</span>
                    <span className="text-[#4ECDC4]">
                      {isRTL ? selectedVideo.instructorAr : selectedVideo.instructor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{selectedVideo.duration} {t.videoLibrary.minutes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    <span className="text-white">{selectedVideo.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{selectedVideo.views} {t.videoLibrary.views}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedVideo(null)}
                  className="w-full py-3 bg-[#4ECDC4]/20 hover:bg-[#4ECDC4]/30 border border-[#4ECDC4]/30 text-[#4ECDC4] rounded-lg font-semibold transition-colors"
                >
                  {t.videoLibrary.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <SubscriptionModal
            onClose={() => setShowSubscriptionModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
