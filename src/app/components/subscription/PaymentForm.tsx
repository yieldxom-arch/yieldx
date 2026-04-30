import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  MapPin,
} from 'lucide-react';
import type { SubscriptionTier } from '@/app/contexts/YieldXContext';

interface PaymentFormProps {
  selectedPlan: SubscriptionTier;
  planPrice: number;
  planName: string;
  planNameAr: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({
  selectedPlan,
  planPrice,
  planName,
  planNameAr,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    email: '',
    billingAddress: '',
    city: '',
    postalCode: '',
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/gi, '').slice(0, 3);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      newErrors.cardNumber = 'رقم البطاقة مطلوب';
    } else if (cardNumberClean.length < 16) {
      newErrors.cardNumber = 'رقم البطاقة غير صحيح';
    }

    // Card holder validation
    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'اسم حامل البطاقة مطلوب';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'تاريخ الانتهاء مطلوب';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
        newErrors.expiryDate = 'تاريخ انتهاء غير صحيح';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'البطاقة منتهية الصلاحية';
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'رمز CVV مطلوب';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'رمز CVV غير صحيح';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    // Billing address validation
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'عنوان الفواتير مطلوب';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      // Store payment info in localStorage
      const payment = {
        date: new Date().toISOString(),
        amount: planPrice,
        plan: planName,
        planAr: planNameAr,
        cardLast4: formData.cardNumber.slice(-4),
        status: 'success',
      };

      const payments = JSON.parse(localStorage.getItem('yieldx_payments') || '[]');
      payments.push(payment);
      localStorage.setItem('yieldx_payments', JSON.stringify(payments));

      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 3000);
  };

  if (paymentSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">تم الدفع بنجاح!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">تم ترقية اشتراكك إلى {planNameAr}</p>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-[#4ECDC4] border-t-transparent rounded-full mx-auto"
        />
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Order Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-[#1B1B3A]/50 dark:to-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl p-4">
        <h3 className="text-slate-900 dark:text-white font-semibold mb-3">ملخص الطلب</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 dark:text-gray-400">الخطة:</span>
          <span className="text-slate-900 dark:text-white font-semibold">{planNameAr}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 dark:text-gray-400">المدة:</span>
          <span className="text-slate-900 dark:text-white">شهرياً</span>
        </div>
        <div className="border-t border-purple-200 dark:border-[#4ECDC4]/20 mt-3 pt-3 flex justify-between items-center">
          <span className="text-slate-900 dark:text-white font-bold">المجموع:</span>
          <span className="text-2xl font-bold text-[#4ECDC4]">{planPrice} ر.ع</span>
        </div>
      </div>

      {/* Card Details */}
      <div>
        <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          رقم البطاقة
        </label>
        <input
          type="text"
          value={formData.cardNumber}
          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${
            errors.cardNumber ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'
          } rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
        />
        {errors.cardNumber && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.cardNumber}
          </p>
        )}
      </div>

      <div>
        <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          اسم حامل البطاقة
        </label>
        <input
          type="text"
          value={formData.cardHolder}
          onChange={(e) => handleInputChange('cardHolder', e.target.value)}
          placeholder="Ahmed Al-Said"
          className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${
            errors.cardHolder ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'
          } rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
        />
        {errors.cardHolder && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.cardHolder}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            تاريخ الانتهاء
          </label>
          <input
            type="text"
            value={formData.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            placeholder="MM/YY"
            maxLength={5}
            className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${
              errors.expiryDate ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'
            } rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
          />
          {errors.expiryDate && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.expiryDate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            CVV
          </label>
          <input
            type="password"
            value={formData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value)}
            placeholder="123"
            maxLength={3}
            className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${
              errors.cvv ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'
            } rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
          />
          {errors.cvv && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Billing Information */}
      <div className="border-t border-purple-200 dark:border-[#4ECDC4]/20 pt-6">
        <h3 className="text-slate-900 dark:text-white font-semibold mb-4">معلومات الفواتير</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${
                errors.email ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'
              } rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
            />
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              عنوان الفواتير
            </label>
            <input
              type="text"
              value={formData.billingAddress}
              onChange={(e) => handleInputChange('billingAddress', e.target.value)}
              placeholder="شارع السلطان قابوس، مسقط"
              className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${
                errors.billingAddress ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'
              } rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
            />
            {errors.billingAddress && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.billingAddress}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-900 dark:text-white font-semibold mb-2">المدينة</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="مسقط"
                className={`w-full bg-white dark:bg-[#1B1B3A]/50 border ${
                  errors.city ? 'border-red-500' : 'border-purple-200 dark:border-[#4ECDC4]/20'
                } rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors`}
              />
              {errors.city && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-900 dark:text-white font-semibold mb-2">الرمز البريدي</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="100"
                className="w-full bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#4ECDC4] transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 rounded-lg p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#4ECDC4] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-900 dark:text-white text-sm font-semibold mb-1">دفع آمن ومشفر</p>
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            جميع معلومات الدفع محمية بتقنية تشفير SSL. لن نقوم بتخزين تفاصيل بطاقتك.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-500/20 hover:bg-gray-300 dark:hover:bg-gray-500/30 border border-gray-300 dark:border-gray-500/30 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] hover:from-[#7FDBCA] hover:to-[#4ECDC4] text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-[#4ECDC4]/50"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              جارٍ المعالجة...
            </span>
          ) : (
            `إتمام الدفع - ${planPrice} ر.ع`
          )}
        </button>
      </div>
    </form>
  );
}