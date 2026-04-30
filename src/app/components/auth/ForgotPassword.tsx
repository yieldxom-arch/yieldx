import { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Mail, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { useYieldX } from '@/app/contexts/YieldXContext';
// HYBRID MODE: password reset uses Supabase when online
import { resetPassword } from '@/lib/auth';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const { language } = useYieldX();
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isRTL = language === 'ar';

  const t = {
    ar: {
      title: 'استعادة كلمة المرور',
      subtitle: 'سنرسل لك رابط إعادة التعيين على بريدك الإلكتروني',
      email: 'البريد الإلكتروني',
      send: 'إرسال رابط الاستعادة',
      sending: 'جارٍ الإرسال...',
      backToLogin: 'العودة لتسجيل الدخول',
      sentTitle: 'تم إرسال الرابط! 📬',
      sentDesc1: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى:',
      sentDesc2: 'تحقق من صندوق الوارد والبريد غير المرغوب فيه.',
      sentDesc3: 'الرابط صالح لمدة ساعة واحدة.',
      resend: 'إعادة الإرسال',
      placeholder: 'email@example.com',
      invalidEmail: 'الرجاء إدخال بريد إلكتروني صحيح',
      errorMsg: 'فشل إرسال رابط الاستعادة. تحقق من البريد الإلكتروني وحاول مجدداً.',
    },
    en: {
      title: 'Reset Password',
      subtitle: 'We\'ll send a reset link to your email address',
      email: 'Email Address',
      send: 'Send Reset Link',
      sending: 'Sending...',
      backToLogin: 'Back to Login',
      sentTitle: 'Reset Link Sent! 📬',
      sentDesc1: 'A password reset link was sent to:',
      sentDesc2: 'Check your inbox and spam folder.',
      sentDesc3: 'The link is valid for 1 hour.',
      resend: 'Resend Email',
      placeholder: 'email@example.com',
      invalidEmail: 'Please enter a valid email address',
      errorMsg: 'Failed to send reset link. Check the email and try again.',
    },
  };

  const text = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      toast.error(text.invalidEmail);
      return;
    }

    // HYBRID MODE: reset requires internet connection
    if (!navigator.onLine) {
      toast.error(language === 'ar'
        ? '⚠️ استعادة كلمة المرور تتطلب اتصالاً بالإنترنت. يرجى الاتصال بالإنترنت والمحاولة مجدداً.'
        : '⚠️ Password reset requires an internet connection. Please connect and try again.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setStep('sent');
    } catch (err) {
      toast.error(text.errorMsg);
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    >
      <Card className="bg-white/95 dark:bg-[#1B1B3A]/95 backdrop-blur-2xl border border-purple-200 dark:border-[#4ECDC4]/30 shadow-2xl shadow-purple-500/10 dark:shadow-[#4ECDC4]/20 p-8 rounded-3xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-[#4ECDC4]/20 dark:to-[#7FDBCA]/20 border border-purple-300 dark:border-[#4ECDC4]/30 mb-4">
            {step === 'sent'
              ? <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              : <KeyRound className="w-8 h-8 text-purple-600 dark:text-[#4ECDC4]" />
            }
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {step === 'sent' ? text.sentTitle : text.title}
          </h2>
          <p className="text-purple-600 dark:text-[#7FDBCA]/80 text-sm">
            {step === 'sent' ? '' : text.subtitle}
          </p>
        </motion.div>

        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className={`text-slate-900 dark:text-white text-sm block font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
                {text.email}
              </label>
              <div className="relative group">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 dark:text-[#7FDBCA]/60 group-focus-within:text-purple-600 dark:group-focus-within:text-[#4ECDC4] transition-colors ${isRTL ? 'right-4' : 'left-4'}`} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'} bg-purple-50/50 dark:bg-white/5 border-purple-200 dark:border-[#4ECDC4]/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-purple-500 dark:focus:border-[#4ECDC4] focus:bg-white dark:focus:bg-white/10 rounded-xl h-12 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-[#4ECDC4]/20`}
                  placeholder={text.placeholder}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] hover:from-purple-700 hover:to-cyan-700 dark:hover:from-[#5DD9C1] dark:hover:to-[#4ECDC4] text-white font-bold shadow-xl shadow-purple-500/30 dark:shadow-[#4ECDC4]/30 hover:shadow-2xl hover:shadow-purple-500/40 dark:hover:shadow-[#4ECDC4]/40 rounded-xl h-12 text-base transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading
                ? <span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" />{text.sending}</span>
                : text.send
              }
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBackToLogin}
              disabled={isLoading}
              className="w-full text-purple-700 dark:text-[#7FDBCA] hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5 border border-purple-300 dark:border-[#7FDBCA]/30 hover:border-purple-400 dark:hover:border-[#4ECDC4]/50 rounded-xl h-12 font-semibold transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {text.backToLogin}
            </Button>
          </form>
        )}

        {/* Step 2: Sent Confirmation */}
        {step === 'sent' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Email info box */}
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 text-center space-y-2">
              <p className="text-emerald-800 dark:text-emerald-200 text-sm font-semibold">
                {text.sentDesc1}
              </p>
              <p className="text-emerald-700 dark:text-emerald-300 text-base font-bold break-all">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-purple-50/50 dark:bg-white/5 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-2xl p-4 space-y-2">
              <p className="text-slate-600 dark:text-purple-200 text-sm flex items-center gap-2">
                <span>📥</span> {text.sentDesc2}
              </p>
              <p className="text-slate-600 dark:text-purple-200 text-sm flex items-center gap-2">
                <span>⏱️</span> {text.sentDesc3}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => { setStep('email'); setEmail(''); }}
              className="w-full text-purple-700 dark:text-[#7FDBCA] hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5 border border-purple-300 dark:border-[#7FDBCA]/30 hover:border-purple-400 dark:hover:border-[#4ECDC4]/50 rounded-xl h-12 font-semibold transition-all duration-300"
            >
              {text.resend}
            </Button>

            <Button
              type="button"
              onClick={onBackToLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] hover:from-purple-700 hover:to-cyan-700 text-white font-bold shadow-xl shadow-purple-500/30 dark:shadow-[#4ECDC4]/30 rounded-xl h-12 text-base transition-all duration-300 hover:scale-[1.02]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {text.backToLogin}
            </Button>
          </motion.div>
        )}

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-8">
          {(['email', 'sent'] as const).map((s, index) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ${
                step === s
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-[#4ECDC4] dark:to-[#5DD9C1] w-10 shadow-lg shadow-purple-500/50 dark:shadow-[#4ECDC4]/50'
                  : ['email', 'sent'].indexOf(step) > index
                  ? 'bg-green-400 w-2'
                  : 'bg-slate-300 dark:bg-white/20 w-2'
              }`}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
