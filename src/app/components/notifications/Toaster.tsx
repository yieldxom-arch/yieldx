import { Toaster as SonnerToaster } from '@/app/components/ui/sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      position="top-center"
      dir="rtl"
      theme={theme as 'light' | 'dark' | 'system'}
      toastOptions={{
        classNames: {
          toast: 'font-sans border-[#4ECDC4]/30',
          title: 'text-sm font-semibold',
          description: 'text-sm',
          actionButton: 'bg-[#4ECDC4] text-white hover:bg-[#5DD9C1]',
          cancelButton: 'bg-slate-200 dark:bg-slate-800',
          error: 'border-red-500/50',
          success: 'border-green-500/50',
          warning: 'border-yellow-500/50',
          info: 'border-blue-500/50',
        },
      }}
    />
  );
}