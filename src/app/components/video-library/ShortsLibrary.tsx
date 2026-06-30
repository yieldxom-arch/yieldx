import React, { useEffect, useState } from 'react';
import { X, Play } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { Card } from '@/app/components/ui/card';

interface VideoItem {
  id: string;
}

const VIDEOS: VideoItem[] = [
  { id: 'VHib1fXVEhA' },
  { id: '-qq-hrT0ETo' },
  { id: '2y6zifyxcMU' },
  { id: 'kPtYe7HUwe4' },
  { id: 'nb72b1dPCU8' },
  { id: '0lyOPBoYvvQ' },
  { id: 'Sq0Gud80w6k' },
  { id: 'mG4X6xli9wo' },
  { id: 'Cckrsqtjz1M' },
  { id: 'nunwgrmfsxo' },
  { id: 'yBg5bAuFq9s' },
  { id: 'LE4GQGtR3Y0' },
];

function getThumbnail(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function ShortsLibrary() {
  const { setCurrentView, language, theme } = useYieldX();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const t = translations[language];
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';

  const getVideoTitle = (id: string) => t.videoLibrary.videos[id] ?? id;
  const selectedVideoTitle = selectedVideo ? getVideoTitle(selectedVideo.id) : '';

  useEffect(() => {
    if (!selectedVideo) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedVideo(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedVideo]);

  return (
    <div
      className={`min-h-screen px-4 py-6 sm:px-6 sm:py-8 ${
        isDark ? 'bg-[#03121f] text-white' : 'bg-slate-50 text-slate-900'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div style={{ paddingInline: '0.25rem' }}>
            <h1 className={`text-3xl font-semibold sm:text-4xl ${isDark ? 'text-teal-200' : 'text-teal-700'}`}>
              {t.videoLibrary.title}
            </h1>
            <p className={`mt-2 max-w-2xl text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t.videoLibrary.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              isDark
                ? 'border-teal-400/30 bg-slate-900/80 text-teal-100 hover:border-teal-300 hover:bg-slate-800'
                : 'border-teal-400/40 bg-white text-teal-700 hover:border-teal-500 hover:bg-teal-50'
            }`}
            style={{ paddingInline: '1rem' }}
          >
            <span>{t.videoLibrary.backToDashboard}</span>
          </button>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {VIDEOS.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setSelectedVideo(video)}
              className="group"
            >
              <Card className={`overflow-hidden border-[#4ECDC4]/20 shadow-[0_20px_60px_-35px_rgba(78,220,196,0.9)] transition-transform duration-300 hover:-translate-y-1 ${
                isDark ? 'bg-[#071429]' : 'bg-white'
              }`}>
                <div className="relative overflow-hidden aspect-[9/16] bg-slate-950">
                  <img
                    src={getThumbnail(video.id)}
                    alt={getVideoTitle(video.id)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-400/90 text-slate-950 shadow-xl shadow-teal-400/30">
                      <Play className="h-7 w-7" />
                    </div>
                  </div>
                </div>

                <div className={`px-4 py-4 sm:px-5 sm:py-5 ${isDark ? 'bg-[#071429]' : 'bg-white'}`} style={{ paddingInline: '1.25rem' }}>
                  <p className={`line-clamp-3 text-sm font-semibold leading-6 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {getVideoTitle(video.id)}
                  </p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className={`relative max-h-[90vh] max-w-full overflow-y-auto rounded-[28px] border border-teal-300/20 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.65)] ${
              isDark ? 'bg-[#081a2f]' : 'bg-white'
            }`}
            onClick={(event) => event.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className={`absolute top-4 end-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
                isDark
                  ? 'bg-slate-900/90 text-teal-100 hover:bg-slate-800'
                  : 'bg-slate-100 text-teal-700 hover:bg-slate-200'
              }`}
              aria-label={t.videoLibrary.close}
              style={{ insetInlineEnd: '1rem', insetBlockStart: '1rem' }}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-[9/16] bg-black h-[60vh] sm:h-[70vh] max-w-full mx-auto">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideoTitle}
                className="h-full w-full"
                allowFullScreen
              />
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6" style={{ paddingInline: '1.5rem' }}>
              <h2 className={`text-xl font-semibold sm:text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedVideoTitle}
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
