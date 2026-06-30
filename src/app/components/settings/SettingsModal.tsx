import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Moon, Sun, Zap, Bell, Shield, Download, User, Globe, DollarSign, Camera, Upload, Key, CheckCircle, XCircle, Loader2, Edit2, Phone, Hash, Building2, GraduationCap, FileText, Eye, EyeOff, Award, Clock, Undo2, Linkedin, Github, Twitter, Lock, Crown, Sparkles, Search, ChevronDown } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Card } from '@/app/components/ui/card';
import { Separator } from '@/app/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { countries, type Country } from '@/app/data/countries';
import { omanUniversities, type University } from '@/app/data/oman-universities';
import { SUBSCRIPTION_PLANS } from '@/app/data/subscriptionData';
import type { SubscriptionTier } from '@/app/contexts/YieldXContext';

export function SettingsModal() {
  const { user, updateUser, language: contextLanguage, setLanguage: setContextLanguage, theme: contextTheme, setTheme: setContextTheme, setCurrentView } = useYieldX();
  
  // Get translations for current language
  const t = translations[contextLanguage];
  
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem('yieldx_profile_pic') || ''
  );
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  
  // Profile fields
  const [editedData, setEditedData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    studentId: user?.studentId || '',
    organization: user?.organization || '',
    major: user?.major || '',
    bio: user?.bio || '',
    linkedIn: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || '',
    twitter: user?.socialLinks?.twitter || '',
  });

  // Backup for undo
  const [backupData, setBackupData] = useState(editedData);

  // Validation states
  const [validations, setValidations] = useState({
    name: true,
    email: true,
    phoneNumber: true,
  });

  // Use context for language/theme, remove local state
  const language = contextLanguage;
  const theme = contextTheme;
  
  const [currency, setCurrency] = useState(
    localStorage.getItem('yieldx_currency') || 'SAR'
  );
  const [motionReduced, setMotionReduced] = useState(
    localStorage.getItem('yieldx_motion_reduced') === 'true'
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem('yieldx_notifications') !== 'false'
  );
  const [autoSave, setAutoSave] = useState(
    localStorage.getItem('yieldx_autosave') !== 'false'
  );
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>(
    (user?.profileVisibility as 'public' | 'private') || 'public'
  );
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('yieldx_openai_api_key') || ''
  );
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NEW: Country & University search states
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'OM') || countries[0]
  );
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [universitySearchOpen, setUniversitySearchOpen] = useState(false);
  
  // Filter countries and universities based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.nameAr.includes(countrySearch) ||
    country.dialCode.includes(countrySearch)
  );
  
  const filteredUniversities = omanUniversities.filter(uni =>
    uni.name.toLowerCase().includes(editedData.organization.toLowerCase()) ||
    uni.nameAr.includes(editedData.organization)
  );

  // Calculate profile completion
  const calculateCompletion = () => {
    const fields = [
      user?.name,
      user?.email,
      user?.displayName,
      user?.phoneNumber,
      user?.studentId,
      user?.organization,
      user?.major,
      user?.bio,
      profilePic,
    ];
    const filled = fields.filter(f => f && f.trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompletion = calculateCompletion();

  // Apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('yieldx_theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-dropdown-container')) {
        setCountrySearchOpen(false);
      }
      if (!target.closest('.university-dropdown-container')) {
        setUniversitySearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Email validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Phone validation (international format)
  const validatePhone = (phone: string) => {
    if (!phone) return true; // Optional field
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
  };

  // Name validation
  const validateName = (name: string) => {
    return name.length >= 2 && name.length <= 50;
  };

  // Handle field changes with validation
  const handleFieldChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (field === 'email') {
      setValidations(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'phoneNumber') {
      setValidations(prev => ({ ...prev, phoneNumber: validatePhone(value) }));
    } else if (field === 'name') {
      setValidations(prev => ({ ...prev, name: validateName(value) }));
    }
  };

  const handleSaveProfile = () => {
    // Validate all fields
    const isNameValid = validateName(editedData.name);
    const isEmailValid = validateEmail(editedData.email);
    const isPhoneValid = validatePhone(editedData.phoneNumber);

    setValidations({
      name: isNameValid,
      email: isEmailValid,
      phoneNumber: isPhoneValid,
    });

    if (!isNameValid) {
      toast.error(language === 'ar' ? '⚠️ الاسم يجب أن يكون بين 2 و 50 حرف' : '⚠️ Name must be between 2 and 50 characters');
      return;
    }

    if (!isEmailValid) {
      toast.error(language === 'ar' ? '⚠️ البريد الإلكتروني غير صحيح' : '⚠️ Invalid email address');
      return;
    }

    if (!isPhoneValid) {
      toast.error(language === 'ar' ? '⚠️ رقم الهاتف غير صحيح' : '⚠️ Invalid phone number');
      return;
    }

    if (!editedData.name.trim() || !editedData.email.trim()) {
      toast.error(language === 'ar' ? '⚠️ الاسم والبريد الإلكتروني مطلوبان' : '⚠️ Name and email are required');
      return;
    }

    // Check if email changed - show warning
    if (editedData.email !== user?.email) {
      const confirmMsg = language === 'ar'
        ? '⚠️ تغيير البريد الإلكتروني قد يؤثر على تسجيل الدخول. هل أنت متأكد؟'
        : '⚠️ Changing your email may affect your login. Are you sure?';
      if (!confirm(confirmMsg)) {
        return;
      }
    }

    setIsSaving(true);
    
    // Simulate save delay
    setTimeout(() => {
      updateUser({
        name: editedData.name,
        email: editedData.email,
        displayName: editedData.displayName,
        phoneNumber: editedData.phoneNumber,
        studentId: editedData.studentId,
        organization: editedData.organization,
        major: editedData.major,
        bio: editedData.bio,
        socialLinks: {
          linkedin: editedData.linkedIn,
          github: editedData.github,
          twitter: editedData.twitter,
        },
        profileVisibility,
        profileLastUpdated: new Date().toISOString(),
      });

      setIsSaving(false);
      setEditMode(false);
      setBackupData(editedData);
      
      toast.success(language === 'ar' ? '✅ تم حفظ المعلومات بنجاح!' : '✅ Information saved successfully!', {
        description: language === 'ar' ? 'تم تحديث ملفك الشخصي' : 'Your profile has been updated',
      });
    }, 800);
  };

  const handleUndo = () => {
    setEditedData(backupData);
    toast.info(language === 'ar' ? '↩️ تم التراجع عن التغييرات' : '↩️ Changes have been undone');
  };

  const handleMotionToggle = (checked: boolean) => {
    setMotionReduced(checked);
    localStorage.setItem('yieldx_motion_reduced', checked.toString());
    if (checked) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem('yieldx_notifications', checked.toString());
  };

  const handleAutoSaveToggle = (checked: boolean) => {
    setAutoSave(checked);
    localStorage.setItem('yieldx_autosave', checked.toString());
  };

  const handleExportData = () => {
    const data = {
      user,
      levels: localStorage.getItem('yieldx_levels'),
      moduleData: localStorage.getItem('yieldx_module_data'),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yieldx-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(language === 'ar' ? '✅ تم تصدير البيانات بنجاح' : '✅ Data exported successfully');
  };

  const handleClearData = () => {
    const confirmMsg = language === 'ar'
      ? 'هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.'
      : 'Are you sure you want to delete all data? This action cannot be undone.';
    if (confirm(confirmMsg)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        localStorage.setItem('yieldx_profile_pic', reader.result as string);
        toast.success(language === 'ar' ? '✅ تم تحديث الصورة الشخصية بنجاح' : '✅ Profile picture updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfilePic = () => {
    setProfilePic('');
    localStorage.removeItem('yieldx_profile_pic');
    toast.success(language === 'ar' ? '✅ تم حذف الصورة الشخصية بنجاح' : '✅ Profile picture deleted successfully');
  };

  const handleLanguageChange = (value: string) => {
    setContextLanguage(value as 'ar' | 'en');
    toast.success(value === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English');
  };

  const handleThemeChange = (value: string) => {
    setContextTheme(value as 'light' | 'dark');
    const isDarkNow = value === 'dark';
    toast.success(language === 'ar'
      ? (isDarkNow ? 'تم التبديل إلى المظهر الداكن' : 'تم التبديل إلى المظهر الفاتح')
      : (isDarkNow ? 'Switched to dark mode' : 'Switched to light mode'));
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem('yieldx_currency', value);
    toast.success(language === 'ar' ? 'تم تحديث العملة بنجاح' : 'Currency updated successfully');
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const trimmedKey = event.target.value.trim();
    setApiKey(trimmedKey);
    localStorage.setItem('yieldx_openai_api_key', trimmedKey);
    setApiKeyStatus('idle');
  };

  const handleApiKeyTest = async () => {
    if (!apiKey || !apiKey.trim()) {
      toast.error(language === 'ar' ? 'الرجاء إدخال مفتاح API أولاً' : 'Please enter an API key first');
      return;
    }

    if (!apiKey.startsWith('sk-') && !apiKey.startsWith('sk_')) {
      setApiKeyStatus('invalid');
      toast.error(language === 'ar' ? 'مفتاح API غير صحيح. يجب أن يبدأ بـ "sk-" أو "sk_"' : 'Invalid API key. It must start with "sk-" or "sk_"');
      return;
    }

    setApiKeyStatus('testing');
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5
        })
      });
      
      if (response.ok) {
        setApiKeyStatus('valid');
        toast.success(language === 'ar' ? '✅ مفتاح API صحيح ويعمل بشكل جيد!' : '✅ API key is valid and working!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setApiKeyStatus('invalid');

        if (response.status === 401) {
          toast.error(language === 'ar' ? '❌ مفتاح API غير صحيح أو منتهي الصلاحية' : '❌ API key is invalid or expired');
        } else if (response.status === 429) {
          toast.error(language === 'ar' ? '⚠️ تم تجاوز الحد المسموح. حاول مرة أخرى لاحقاً' : '⚠️ Rate limit exceeded. Please try again later');
        } else if (response.status === 403) {
          toast.error(language === 'ar' ? '❌ المفتاح ليس لديه صلاحيات كافية' : '❌ This key does not have sufficient permissions');
        } else {
          toast.error(language === 'ar' ? `❌ خطأ: ${errorData.error?.message || response.statusText}` : `❌ Error: ${errorData.error?.message || response.statusText}`);
        }
      }
    } catch (error) {
      setApiKeyStatus('invalid');
      toast.error(language === 'ar' ? '❌ فشل الاتصال. تحقق من الاتصال بالإنترنت' : '❌ Connection failed. Check your internet connection');
    }
  };

  // Get completion badge color
  const getCompletionColor = () => {
    if (profileCompletion >= 75) return 'text-green-600 dark:text-green-400';
    if (profileCompletion >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (profileCompletion >= 25) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editMode) {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          handleSaveProfile();
        } else if (e.key === 'Escape') {
          setEditMode(false);
          setEditedData(backupData);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, backupData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 hover:bg-white/20 dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20"
        >
          <Settings className="w-4 h-4 mr-2" />
          {t.settings.title}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className={`bg-white dark:bg-slate-900 border-purple-500/30 dark:border-purple-500/50 ${showSubscriptionPlans ? 'max-w-7xl' : 'max-w-3xl'} max-h-[90vh] overflow-y-auto transition-all`}
        aria-describedby={undefined}
      >
        {!showSubscriptionPlans ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white text-2xl flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                {t.settings.title}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-purple-300">
                {language === 'ar' ? 'قم بتخصيص تجربتك في YieldX - الملف الشخصي، المظهر، اللغة، والمزيد' : 'Customize your YieldX experience - Profile, appearance, language, and more'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
          {/* Profile Completion Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-300 dark:border-purple-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${getCompletionColor()}`} />
                <span className="text-slate-900 dark:text-white font-semibold">
                  {t.settings.profileCompletion}
                </span>
              </div>
              <span className={`text-2xl font-bold ${getCompletionColor()}`}>
                {profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-2 rounded-full ${
                  profileCompletion >= 75 
                    ? 'bg-green-500' 
                    : profileCompletion >= 50 
                    ? 'bg-yellow-500' 
                    : profileCompletion >= 25
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-purple-300 mt-2">
              {profileCompletion < 100 
                ? (language === 'ar' ? 'أكمل ملفك الشخصي للحصول على تجربة أفضل' : 'Complete your profile for a better experience') 
                : (language === 'ar' ? '🎉 عمل رائع! ملفك الشخصي مكتمل' : '🎉 Great job! Your profile is complete')}
            </p>
          </motion.div>

          {/* Profile Settings */}
          <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                {t.settings.profile}
              </h3>
              {user?.profileLastUpdated && (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-purple-400">
                  <Clock className="w-3 h-3" />
                  {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date(user.profileLastUpdated).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    {/* Progress ring */}
                    <svg className="absolute top-0 left-0 w-24 h-24 -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-slate-200 dark:text-slate-700"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - profileCompletion / 100)}`}
                        className={profileCompletion >= 75 ? 'text-green-500' : profileCompletion >= 50 ? 'text-yellow-500' : 'text-orange-500'}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 rounded-full p-2 border-2 border-white dark:border-slate-900 transition-colors shadow-lg"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  {profilePic && (
                    <button
                      onClick={handleDeleteProfilePic}
                      className="absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 rounded-full p-2 border-2 border-white dark:border-slate-900 transition-colors shadow-lg"
                      title={language === 'ar' ? 'حذف الصورة' : 'Delete picture'}
                    >
                      <XCircle className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  {!editMode ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold text-lg">{user?.name}</p>
                        {user?.displayName && (
                          <p className="text-slate-600 dark:text-purple-300 text-sm">"{user.displayName}"</p>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-purple-300 text-sm flex items-center gap-1">
                        📧 {user?.email}
                      </p>
                      {user?.phoneNumber && (
                        <p className="text-slate-600 dark:text-purple-300 text-sm flex items-center gap-1">
                          📱 {user.phoneNumber}
                        </p>
                      )}
                      {user?.studentId && (
                        <p className="text-slate-600 dark:text-purple-300 text-sm flex items-center gap-1">
                          🎓 {language === 'ar' ? 'رقم الطالب' : 'Student ID'}: {user.studentId}
                        </p>
                      )}
                      {user?.organization && (
                        <p className="text-slate-600 dark:text-purple-300 text-sm flex items-center gap-1">
                          🏢 {user.organization}
                        </p>
                      )}
                      {user?.major && (
                        <p className="text-slate-600 dark:text-purple-300 text-sm flex items-center gap-1">
                          📚 {user.major}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user?.role === 'lecturer' 
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-100' 
                            : 'bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-100'
                        }`}>
                          {user?.role === 'lecturer' ? (language === 'ar' ? '👨‍🏫 محاضر' : '👨‍🏫 Lecturer') : (language === 'ar' ? '👨‍🎓 طالب' : '👨‍🎓 Student')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          profileVisibility === 'public'
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-900 dark:text-green-100'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                        }`}>
                          {profileVisibility === 'public' ? (language === 'ar' ? '🌐 عام' : '🌐 Public') : (language === 'ar' ? '🔒 خاص' : '🔒 Private')}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {editMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mt-4"
                >
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-900 dark:text-white text-sm font-medium block mb-1 text-right flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                      </label>
                      <Input
                        value={editedData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                        maxLength={50}
                        className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-right ${
                          !validations.name ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-purple-500/30'
                        }`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {!validations.name && (
                          <span className="text-xs text-red-600 dark:text-red-400">{language === 'ar' ? '⚠️ 2-50 حرف' : '⚠️ 2-50 characters'}</span>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400 mr-auto">
                          {editedData.name.length}/50
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-900 dark:text-white text-sm font-medium block mb-1 text-right flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {language === 'ar' ? 'الاسم المعروض (اختياري)' : 'Display Name (optional)'}
                      </label>
                      <Input
                        value={editedData.displayName}
                        onChange={(e) => handleFieldChange('displayName', e.target.value)}
                        placeholder={language === 'ar' ? 'اسم مستعار أو لقب' : 'A nickname or alias'}
                        maxLength={30}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white text-right"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 block text-right mt-1">
                        {editedData.displayName.length}/30
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-900 dark:text-white text-sm font-medium block mb-1 text-right flex items-center gap-1">
                        📧 {language === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                      </label>
                      <Input
                        value={editedData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        placeholder="example@email.com"
                        type="email"
                        dir="ltr"
                        className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                          !validations.email ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-purple-500/30'
                        }`}
                      />
                      {!validations.email && (
                        <span className="text-xs text-red-600 dark:text-red-400 block text-right mt-1">
                          {language === 'ar' ? '⚠️ بريد إلكتروني غير صحيح' : '⚠️ Invalid email address'}
                        </span>
                      )}
                      {editedData.email !== user?.email && validations.email && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 block text-right mt-1">
                          {language === 'ar' ? '⚠️ سيتم تغيير بيانات تسجيل الدخول' : '⚠️ Your login credentials will be changed'}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-900 dark:text-white text-sm font-medium block mb-1 text-right flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      <div className="flex gap-2">
                        {/* Country Code Selector */}
                        <div className="relative country-dropdown-container">
                          <button
                            type="button"
                            onClick={() => setCountrySearchOpen(!countrySearchOpen)}
                            className="h-10 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-purple-500/30 rounded-md flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <span className="text-xl">{selectedCountry.flag}</span>
                            <span className="text-slate-900 dark:text-white font-medium">{selectedCountry.dialCode}</span>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          </button>
                          
                          {/* Country Search Dropdown */}
                          {countrySearchOpen && (
                            <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-slate-800 border border-slate-300 dark:border-purple-500/50 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                              <div className="p-2 border-b border-slate-200 dark:border-purple-500/30">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    placeholder={language === 'ar' ? 'ابحث عن دولة...' : 'Search country...'}
                                    className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                                  />
                                </div>
                              </div>
                              <div className="max-h-80 overflow-y-auto">
                                {filteredCountries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setCountrySearchOpen(false);
                                      setCountrySearch('');
                                    }}
                                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors text-left"
                                  >
                                    <span className="text-2xl">{country.flag}</span>
                                    <div className="flex-1">
                                      <div className="text-slate-900 dark:text-white text-sm">
                                        {language === 'ar' ? country.nameAr : country.name}
                                      </div>
                                      <div className="text-slate-500 dark:text-slate-400 text-xs">{country.dialCode}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Phone Number Input */}
                        <Input
                          value={editedData.phoneNumber}
                          onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                          placeholder={language === 'ar' ? '50 123 4567' : '50 123 4567'}
                          type="tel"
                          dir="ltr"
                          className={`flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                            !validations.phoneNumber ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-purple-500/30'
                          }`}
                        />
                      </div>
                      {!validations.phoneNumber && (
                        <span className="text-xs text-red-600 dark:text-red-400 block text-right mt-1">
                          ⚠️ {language === 'ar' ? 'رقم هاتف غير صحيح' : 'Invalid phone number'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student & Academic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-900 dark:text-white text-sm font-medium block mb-1 text-right flex items-center gap-1">
                        <Hash className="w-4 h-4" />
                        {language === 'ar' ? 'رقم الطالب' : 'Student ID'}
                      </label>
                      <Input
                        value={editedData.studentId}
                        onChange={(e) => handleFieldChange('studentId', e.target.value)}
                        placeholder="202401234"
                        dir="ltr"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-900 dark:text-white text-sm font-medium block mb-1 text-right flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {language === 'ar' ? 'المؤسسة/الجامعة' : 'Institution/University'}
                      </label>
                      <div className="relative university-dropdown-container">
                        <Input
                          value={editedData.organization}
                          onChange={(e) => {
                            handleFieldChange('organization', e.target.value);
                            if (!universitySearchOpen && e.target.value) {
                              setUniversitySearchOpen(true);
                            }
                          }}
                          onFocus={() => setUniversitySearchOpen(true)}
                          placeholder={language === 'ar' ? 'جامعة السلطان قابوس' : 'Sultan Qaboos University'}
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white text-right pr-10"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        
                        {/* University Dropdown */}
                        {universitySearchOpen && filteredUniversities.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-purple-500/50 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                            {filteredUniversities.map((uni, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  handleFieldChange('organization', language === 'ar' ? uni.nameAr : uni.name);
                                  setUniversitySearchOpen(false);
                                }}
                                className="w-full px-4 py-3 text-right hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                              >
                                <div className="text-slate-900 dark:text-white text-sm font-medium">
                                  {language === 'ar' ? uni.nameAr : uni.name}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 flex items-center gap-2 justify-end">
                                  <span>{uni.location}</span>
                                  <span>•</span>
                                  <span className={uni.type === 'public' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
                                    {uni.type === 'public' 
                                      ? (language === 'ar' ? 'حكومية' : 'Public')
                                      : (language === 'ar' ? 'خاصة' : 'Private')
                                    }
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-900 dark:text-white text-sm font-medium block mb-1 text-right flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {language === 'ar' ? 'التخصص/المجال' : 'Major/Field'}
                    </label>
                    <Input
                      value={editedData.major}
                      onChange={(e) => handleFieldChange('major', e.target.value)}
                      placeholder={language === 'ar' ? 'إدارة الأعمال' : 'Business Administration'}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white text-right"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-slate-900 dark:text-white text-sm font-medium block mb-1 text-right flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {language === 'ar' ? 'نبذة عنك' : 'About You'}
                    </label>
                    <Textarea
                      value={editedData.bio}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب نبذة مختصرة عنك وعن اهتماماتك...' : 'Write a short bio about yourself and your interests...'}
                      maxLength={150}
                      rows={3}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white text-right resize-none"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 block text-right mt-1">
                      {editedData.bio.length}/150
                    </span>
                  </div>

                  {/* Social Links */}
                  <Separator className="bg-slate-200 dark:bg-white/10" />
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-semibold mb-3 text-right">
                      {language === 'ar' ? 'روابط التواصل الاجتماعي (اختياري)' : 'Social Links (optional)'}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-900 dark:text-white text-sm block mb-1 text-right flex items-center gap-1">
                          <Linkedin className="w-4 h-4 text-blue-600" />
                          LinkedIn
                        </label>
                        <Input
                          value={editedData.linkedIn}
                          onChange={(e) => handleFieldChange('linkedIn', e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          dir="ltr"
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-900 dark:text-white text-sm block mb-1 text-right flex items-center gap-1">
                          <Github className="w-4 h-4" />
                          GitHub
                        </label>
                        <Input
                          value={editedData.github}
                          onChange={(e) => handleFieldChange('github', e.target.value)}
                          placeholder="https://github.com/username"
                          dir="ltr"
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-900 dark:text-white text-sm block mb-1 text-right flex items-center gap-1">
                          <Twitter className="w-4 h-4 text-blue-400" />
                          Twitter/X
                        </label>
                        <Input
                          value={editedData.twitter}
                          onChange={(e) => handleFieldChange('twitter', e.target.value)}
                          placeholder="https://twitter.com/username"
                          dir="ltr"
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Privacy */}
                  <Separator className="bg-slate-200 dark:bg-white/10" />
                  <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-slate-900 dark:text-white text-sm font-medium">{language === 'ar' ? 'خصوصية الملف الشخصي' : 'Profile Privacy'}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-xs">
                          {language === 'ar'
                            ? (profileVisibility === 'public' ? 'مرئي للجميع' : 'مرئي لك فقط')
                            : (profileVisibility === 'public' ? 'Visible to everyone' : 'Visible to you only')}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={profileVisibility === 'public'} 
                      onCheckedChange={(checked) => setProfileVisibility(checked ? 'public' : 'private')}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {language === 'ar' ? 'حفظ (Ctrl+S)' : 'Save (Ctrl+S)'}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleUndo}
                      variant="outline"
                      className="bg-yellow-100 dark:bg-yellow-500/20 hover:bg-yellow-200 dark:hover:bg-yellow-500/30 border-yellow-300 dark:border-yellow-500/50 text-yellow-900 dark:text-yellow-100"
                    >
                      <Undo2 className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'تراجع' : 'Undo'}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditMode(false);
                        setEditedData(backupData);
                      }}
                      variant="outline"
                      className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'إلغاء (Esc)' : 'Cancel (Esc)'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {!editMode && (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setEditMode(true);
                      setBackupData(editedData);
                    }}
                    className="w-full bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 border border-purple-300 dark:border-purple-500/50 text-purple-900 dark:text-purple-100"
                    variant="outline"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'تعديل المعلومات الشخصية' : 'Edit Personal Information'}
                  </Button>
                  {user?.bio && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-slate-600 dark:text-slate-300 text-sm text-right italic">
                        "{user.bio}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Subscription Settings */}
          <Card className="bg-gradient-to-br from-[#4ECDC4]/10 to-[#7FDBCA]/10 dark:from-[#4ECDC4]/20 dark:to-[#7FDBCA]/20 border-[#4ECDC4]/30 dark:border-[#4ECDC4]/50 p-4">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#4ECDC4]" />
              {language === 'ar' ? 'الاشتراك والباقة' : 'Subscription & Plan'}
            </h3>
            <div className="space-y-4">
              {/* Current Plan Badge */}
              <div className={`p-4 rounded-lg border-2 ${
                user?.subscriptionTier === 'free'
                  ? 'bg-gray-100 dark:bg-gray-500/10 border-gray-300 dark:border-gray-500/30'
                  : user?.subscriptionTier === 'premium'
                  ? 'bg-[#4ECDC4]/10 border-[#4ECDC4]/50'
                  : 'bg-purple-100 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {user?.subscriptionTier === 'free' && (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                    {user?.subscriptionTier === 'premium' && (
                      <div className="w-10 h-10 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {user?.subscriptionTier === 'enterprise' && (
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-slate-900 dark:text-white font-bold text-lg">
                        {user?.subscriptionTier === 'free' && (language === 'ar' ? 'الباقة المجانية' : 'Free Plan')}
                        {user?.subscriptionTier === 'premium' && (language === 'ar' ? 'باقة بريميوم' : 'Premium Plan')}
                        {user?.subscriptionTier === 'enterprise' && (language === 'ar' ? 'باقة المؤسسات' : 'Enterprise Plan')}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {user?.subscriptionTier === 'free' && (language === 'ar' ? 'وصول محدود للميزات الأساسية' : 'Limited access to basic features')}
                        {user?.subscriptionTier === 'premium' && (language === 'ar' ? 'وصول كامل لجميع الميزات' : 'Full access to all features')}
                        {user?.subscriptionTier === 'enterprise' && (language === 'ar' ? 'وصول كامل + ميزات متقدمة' : 'Full access + advanced features')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="space-y-2 mb-4">
                  {user?.subscriptionTier === 'free' && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? '5 فيديوهات تعليمية' : '5 Educational Videos'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? 'أدوات التخطيط الأساسية' : 'Basic Planning Tools'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <XCircle className="w-4 h-4 text-red-400" />
                        {language === 'ar' ? 'لا يوجد وصول للمحتوى المتقدم' : 'No access to advanced content'}
                      </div>
                    </>
                  )}
                  {user?.subscriptionTier === 'premium' && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? 'وصول غير محدود للفيديوهات' : 'Unlimited Video Access'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? 'جميع أدوات التخطيط المتقدمة' : 'All Advanced Planning Tools'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? 'دعم أولوية' : 'Priority Support'}
                      </div>
                    </>
                  )}
                  {user?.subscriptionTier === 'enterprise' && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? 'كل ميزات بريميوم' : 'All Premium Features'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? 'استشارات متخصصة' : 'Expert Consultations'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? 'تقارير مخصصة' : 'Custom Reports'}
                      </div>
                    </>
                  )}
                </div>

                {/* Upgrade Button */}
                {user?.subscriptionTier === 'free' && (
                  <Button
                    onClick={() => setShowSubscriptionPlans(true)}
                    className="w-full bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#45b8b0] hover:to-[#6cc9bb] text-white font-semibold shadow-lg hover:shadow-[#4ECDC4]/30 transition-all"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'عرض الباقات المتاحة' : 'View Available Plans'}
                  </Button>
                )}
                {user?.subscriptionTier === 'premium' && (
                  <Button
                    onClick={() => setShowSubscriptionPlans(true)}
                    variant="outline"
                    className="w-full bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 border border-purple-300 dark:border-purple-500/50 text-purple-900 dark:text-purple-100"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'عرض الباقات المتاحة' : 'View Available Plans'}
                  </Button>
                )}
                {user?.subscriptionTier === 'enterprise' && (
                  <div className="flex items-center justify-center gap-2 py-2 text-purple-600 dark:text-purple-400 font-semibold">
                    <Crown className="w-5 h-5" />
                    {language === 'ar' ? 'أنت في أعلى باقة!' : 'You have the best plan!'}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-[#4ECDC4]/5 dark:bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 rounded-lg p-3">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  💡 <strong>{language === 'ar' ? 'نصيحة:' : 'Tip:'}</strong>{' '}
                  {language === 'ar' 
                    ? 'قم بالترقية للحصول على وصول كامل لجميع الفيديوهات التعليمية والأدوات المتقدمة' 
                    : 'Upgrade to get full access to all educational videos and advanced tools'}
                </p>
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              {language === 'ar' ? 'المظهر واللغة' : 'Appearance & Language'}
            </h3>
            <div className="space-y-4">
              {/* Theme */}
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {t.settings.theme}
                </label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-purple-500/50">
                    <SelectItem value="dark" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        {t.settings.darkMode}
                      </div>
                    </SelectItem>
                    <SelectItem value="light" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        {t.settings.lightMode}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-slate-200 dark:bg-white/10" />

              {/* Language */}
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t.settings.language}
                </label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-purple-500/50">
                    <SelectItem value="ar" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'العربية' : 'ARABIC'}
                    </SelectItem>
                    <SelectItem value="en" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'إنجليزي' : 'ENGLISH'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-slate-200 dark:bg-white/10" />

              {/* Currency */}
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t.settings.currency}
                </label>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-500/30 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-purple-500/50">
                    <SelectItem value="SAR" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'ريال سعودي (SAR)' : 'Saudi Riyal (SAR)'}
                    </SelectItem>
                    <SelectItem value="USD" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'دولار أمريكي (USD)' : 'US Dollar (USD)'}
                    </SelectItem>
                    <SelectItem value="EUR" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'يورو (EUR)' : 'Euro (EUR)'}
                    </SelectItem>
                    <SelectItem value="GBP" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'جنيه إسترليني (GBP)' : 'British Pound (GBP)'}
                    </SelectItem>
                    <SelectItem value="AED" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'درهم إماراتي (AED)' : 'UAE Dirham (AED)'}
                    </SelectItem>
                    <SelectItem value="EGP" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'جنيه مصري (EGP)' : 'Egyptian Pound (EGP)'}
                    </SelectItem>
                    <SelectItem value="KWD" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'دينار كويتي (KWD)' : 'Kuwaiti Dinar (KWD)'}
                    </SelectItem>
                    <SelectItem value="BHD" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'دينار بحريني (BHD)' : 'Bahraini Dinar (BHD)'}
                    </SelectItem>
                    <SelectItem value="OMR" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'ريال عماني (OMR)' : 'Omani Rial (OMR)'}
                    </SelectItem>
                    <SelectItem value="QAR" className="text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20">
                      {language === 'ar' ? 'ريال قطري (QAR)' : 'Qatari Riyal (QAR)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Accessibility Settings */}
          <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              {language === 'ar' ? 'إعدادات إمكانية الوصول' : 'Accessibility Settings'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900 dark:text-white text-sm">{language === 'ar' ? 'تقليل الحركة' : 'Reduce Motion'}</p>
                  <p className="text-slate-600 dark:text-purple-300 text-xs">
                    {language === 'ar' ? 'إيقاف الرسوم المتحركة والانتقالات' : 'Disable animations and transitions'}
                  </p>
                </div>
                <Switch checked={motionReduced} onCheckedChange={handleMotionToggle} />
              </div>
            </div>
          </Card>

          {/* App Settings */}
          <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t.settings.appSettings}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900 dark:text-white text-sm">{t.settings.notifications}</p>
                  <p className="text-slate-600 dark:text-purple-300 text-xs">
                    {t.settings.notificationsDesc}
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={handleNotificationsToggle} />
              </div>

              <Separator className="bg-slate-200 dark:bg-white/10" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900 dark:text-white text-sm">{t.settings.autoSave}</p>
                  <p className="text-slate-600 dark:text-purple-300 text-xs">
                    {t.settings.autoSaveDesc}
                  </p>
                </div>
                <Switch checked={autoSave} onCheckedChange={handleAutoSaveToggle} />
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              {t.settings.dataManagement}
            </h3>
            <div className="space-y-3">
              <Button
                onClick={handleExportData}
                className="w-full bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 border border-blue-300 dark:border-blue-500/50 text-blue-900 dark:text-blue-100"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                {t.settings.exportData}
              </Button>

              <Button
                onClick={handleClearData}
                className="w-full bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 border border-red-300 dark:border-red-500/50 text-red-900 dark:text-red-100"
                variant="outline"
              >
                {t.settings.clearData}
              </Button>
            </div>
          </Card>

          {/* Admin Tools - Admin Only */}
          {user?.role === 'admin' && (
            <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-[#4ECDC4]/10 dark:to-emerald-500/10 border-teal-200 dark:border-[#4ECDC4]/30 p-4">
              <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-[#4ECDC4]">⚙</span>
                {language === 'ar' ? 'أدوات المدير' : 'Admin Tools'}
              </h3>
              <button
                onClick={() => { setCurrentView('admin-upgrade-requests'); }}
                className="w-full text-start px-4 py-3 rounded-lg bg-[#4ECDC4]/10 hover:bg-[#4ECDC4]/20 border border-[#4ECDC4]/30 text-slate-900 dark:text-white text-sm font-medium transition-colors"
              >
                {language === 'ar' ? 'طلبات الترقية — الموافقة اليدوية' : 'Upgrade Requests — Manual Approval'}
              </button>
            </Card>
          )}

          {/* AI Configuration - Admin Only */}
          {user?.role === 'admin' && (
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 border-blue-200 dark:border-blue-500/30 p-4">
              <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {t.settings.aiSettings}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-medium mb-1">
                    {t.settings.openAIKey}
                  </p>
                  <p className="text-slate-600 dark:text-cyan-300 text-xs mb-3">
                    {t.settings.openAIKeyDesc}
                  </p>
                  
                  <div className="relative mb-2">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={handleApiKeyChange}
                      placeholder="sk-..."
                      className="w-full bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 text-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm font-mono pr-10"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {apiKey && (
                    <div className="flex items-center gap-2 mb-2">
                      {apiKeyStatus === 'idle' && (
                        <span className="text-xs text-slate-500 dark:text-cyan-400 flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          {t.settings.keyReady}
                        </span>
                      )}
                      {apiKeyStatus === 'testing' && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {t.settings.keyTesting}
                        </span>
                      )}
                      {apiKeyStatus === 'valid' && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t.settings.keyValid} ✓
                        </span>
                      )}
                      {apiKeyStatus === 'invalid' && (
                        <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {t.settings.keyInvalid} ✗
                        </span>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleApiKeyTest}
                    disabled={!apiKey || apiKeyStatus === 'testing'}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {apiKeyStatus === 'testing' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.settings.keyTesting}
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        {t.settings.testKey}
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                    💡 <strong>{language === 'ar' ? 'ملاحظة' : 'Note'}:</strong> {language === 'ar' ? 'يتم حفظ المفتاح محلياً في متصفحك. يمكنك الحصول على مفتاح API من' : 'The key is saved locally in your browser. You can get an API key from'}{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* App Info */}
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/10 dark:to-pink-500/10 border-purple-200 dark:border-purple-500/20 p-4">
            <div className="text-center space-y-1">
              <p className="text-slate-900 dark:text-white font-semibold">YieldX Platform</p>
              <p className="text-purple-600 dark:text-purple-300 text-sm">{language === 'ar' ? 'الإصدار' : 'Version'} 1.0.0</p>
              <p className="text-purple-700 dark:text-purple-400 text-xs">
                {language === 'ar' ? 'منصة دراسات الجدوى التفصيلية' : 'Comprehensive Feasibility Study Platform'}
              </p>
            </div>
          </Card>
        </div>
          </>
        ) : (
          /* Subscription Plans View */
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubscriptionPlans(false)}
                  className="text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ← {language === 'ar' ? 'رجوع' : 'Back'}
                </Button>
              </div>
              <DialogTitle className="text-slate-900 dark:text-white text-2xl flex items-center gap-2 mt-2">
                <Crown className="w-6 h-6 text-[#4ECDC4]" />
                {language === 'ar' ? 'الباقات والاشتراكات' : 'Plans & Subscriptions'}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-purple-300">
                {language === 'ar' ? 'اختر الباقة المناسبة لاحتياجاتك' : 'Choose the plan that fits your needs'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
              {/* Current Plan Banner */}
              {user?.subscriptionTier !== 'free' && (
                <Card className="bg-gradient-to-r from-[#4ECDC4]/10 to-[#7FDBCA]/10 dark:from-[#4ECDC4]/20 dark:to-[#7FDBCA]/20 border-[#4ECDC4]/30 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#4ECDC4]" />
                    <div>
                      <p className="text-slate-900 dark:text-white font-semibold">
                        {language === 'ar' ? 'خطتك الحالية' : 'Your Current Plan'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        {user?.subscriptionTier === 'premium' && (language === 'ar' ? 'بريميوم' : 'Premium')}
                        {user?.subscriptionTier === 'enterprise' && (language === 'ar' ? 'المؤسسات' : 'Enterprise')}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrentPlan = plan.id === user?.subscriptionTier;
                  const isPopular = plan.popular;

                  return (
                    <Card
                      key={plan.id}
                      className={`p-4 transition-all ${
                        isPopular
                          ? 'border-[#4ECDC4] shadow-lg scale-105'
                          : 'border-purple-200 dark:border-[#4ECDC4]/20'
                      } ${isCurrentPlan && 'ring-2 ring-[#4ECDC4]'}`}
                    >
                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-3">
                          {language === 'ar' ? '⚡ الأكثر شعبية' : '⚡ Most Popular'}
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {language === 'ar' ? plan.nameAr : plan.name}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {language === 'ar' ? plan.currencyAr : plan.currency}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          / {language === 'ar' ? plan.billingPeriodAr : plan.billingPeriod}
                        </p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-4">
                        {(language === 'ar' ? plan.featuresAr : plan.features).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[#4ECDC4] mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        onClick={() => {
                          if (!isCurrentPlan && plan.id !== 'free') {
                            toast.info(language === 'ar' ? 'سيتم إضافة نظام الدفع قريباً' : 'Payment system coming soon');
                          } else if (plan.id === 'free') {
                            updateUser({ subscriptionTier: 'free', maxProjects: 1 });
                            toast.success(language === 'ar' ? 'تم التحديث' : 'Updated');
                          }
                        }}
                        disabled={isCurrentPlan}
                        className={`w-full ${
                          isCurrentPlan
                            ? 'bg-gray-200 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : isPopular
                            ? 'bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] text-white hover:shadow-lg'
                            : 'bg-[#4ECDC4]/20 text-[#4ECDC4] hover:bg-[#4ECDC4]/30'
                        }`}
                      >
                        {isCurrentPlan
                          ? language === 'ar' ? 'الخطة الحالية' : 'Current Plan'
                          : plan.id === 'free'
                          ? language === 'ar' ? 'الخطة المجانية' : 'Free Plan'
                          : language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
                      </Button>
                    </Card>
                  );
                })}
              </div>

              {/* Security Note */}
              <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-[#4ECDC4]" />
                  <span>{language === 'ar' ? 'جميع المدفوعات آمنة ومشفرة' : 'All payments are secure and encrypted'}</span>
                </div>
              </Card>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}