import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
} from 'lucide-react';

interface PaymentRecord {
  date: string;
  amount: number;
  plan: string;
  planAr: string;
  cardLast4: string;
  status: 'success' | 'pending' | 'failed';
}

export function BillingHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const savedPayments = localStorage.getItem('yieldx_payments');
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  const getStatusIcon = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusText = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'success':
        return 'مكتمل';
      case 'pending':
        return 'قيد المعالجة';
      case 'failed':
        return 'فشل';
    }
  };

  const getStatusColor = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
    }
  };

  const handleDownloadInvoice = (payment: PaymentRecord) => {
    // Simulate invoice download
    const invoiceContent = `
      YieldX - فاتورة
      
      التاريخ: ${new Date(payment.date).toLocaleDateString('ar-SA')}
      الخطة: ${payment.planAr}
      المبلغ: ${payment.amount} ر.ع
      طريقة الدفع: **** **** **** ${payment.cardLast4}
      الحالة: ${getStatusText(payment.status)}
      
      شكراً لاستخدامك YieldX!
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${payment.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] rounded-xl flex items-center justify-center">
          <Receipt className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">سجل الفواتير</h3>
          <p className="text-sm text-gray-400">عرض وتحميل فواتيرك السابقة</p>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#1B1B3A]/30 border border-[#4ECDC4]/20 rounded-xl p-12 text-center"
        >
          <Receipt className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">لا توجد فواتير حتى الآن</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#1B1B3A]/50 border border-[#4ECDC4]/20 rounded-xl p-4 hover:border-[#4ECDC4]/40 transition-all"
            >
              <div className="flex items-center justify-between">
                {/* Payment Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#4ECDC4]/20 rounded-lg flex items-center justify-center">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{payment.planAr}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(payment.date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        **** {payment.cardLast4}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-2xl font-bold text-white">{payment.amount} ر.ع</p>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 border rounded-full text-xs font-semibold ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {getStatusText(payment.status)}
                    </div>
                  </div>

                  {payment.status === 'success' && (
                    <button
                      onClick={() => handleDownloadInvoice(payment)}
                      className="p-2 bg-[#4ECDC4]/20 hover:bg-[#4ECDC4]/30 border border-[#4ECDC4]/30 rounded-lg transition-colors group"
                      title="تحميل الفاتورة"
                    >
                      <Download className="w-5 h-5 text-[#4ECDC4] group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary */}
      {payments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#4ECDC4]/10 to-[#7FDBCA]/10 border border-[#4ECDC4]/30 rounded-xl p-6"
        >
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-400 mb-1">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-white">{payments.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">إجمالي المدفوعات</p>
              <p className="text-2xl font-bold text-[#4ECDC4]">
                {payments.reduce((sum, p) => sum + p.amount, 0)} ر.ع
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">الفواتير الناجحة</p>
              <p className="text-2xl font-bold text-green-400">
                {payments.filter((p) => p.status === 'success').length}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
