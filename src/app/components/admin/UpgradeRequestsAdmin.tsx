import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { supabase } from '/utils/supabase/client';

type RequestStatus = 'pending' | 'approved' | 'rejected';

interface UpgradeRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  requested_plan: string;
  note: string;
  status: RequestStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

type FilterTab = 'pending' | 'approved' | 'rejected';

const PLAN_COLORS: Record<string, string> = {
  premium: '#4ECDC4',
  enterprise: '#8B5CF6',
  free: '#6B7280',
};

async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function callEdgeFunction(
  fnName: string,
  body: Record<string, unknown>,
  token: string
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return { ok: false, error: 'Missing VITE_SUPABASE_URL' };

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${fnName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error ?? `HTTP ${res.status}` };
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message ?? 'Network error' };
  }
}

export function UpgradeRequestsAdmin() {
  const { language, user, setCurrentView } = useYieldX();
  const isRTL = language === 'ar';

  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>('pending');

  // Per-row reject reason input and in-flight state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('upgrade_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setRequests(data as UpgradeRequest[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  if (user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#EF4444', fontSize: 16 }}>
          {isRTL ? 'غير مصرح — يتطلب صلاحيات المدير' : 'Unauthorized — admin access required'}
        </div>
      </div>
    );
  }

  const filtered = requests.filter((r) => r.status === tab);

  const counts: Record<FilterTab, number> = {
    pending:  requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const handleApprove = async (req: UpgradeRequest) => {
    const token = await getAuthToken();
    if (!token) return;
    setActioningId(req.id);
    setActionError(null);
    const result = await callEdgeFunction('approve-upgrade', { request_id: req.id }, token);
    if (result.ok) {
      setRequests((prev) =>
        prev.map((r) => r.id === req.id ? { ...r, status: 'approved', reviewed_at: new Date().toISOString() } : r)
      );
    } else {
      setActionError(result.error ?? 'Error');
    }
    setActioningId(null);
  };

  const handleReject = async (req: UpgradeRequest) => {
    const token = await getAuthToken();
    if (!token) return;
    setActioningId(req.id);
    setActionError(null);
    const result = await callEdgeFunction('reject-upgrade', { request_id: req.id, admin_note: rejectNote.trim() || undefined }, token);
    if (result.ok) {
      setRequests((prev) =>
        prev.map((r) => r.id === req.id ? { ...r, status: 'rejected', admin_note: rejectNote.trim() || null, reviewed_at: new Date().toISOString() } : r)
      );
      setRejectingId(null);
      setRejectNote('');
    } else {
      setActionError(result.error ?? 'Error');
    }
    setActioningId(null);
  };

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'pending',  label: isRTL ? 'معلق'    : 'Pending'  },
    { id: 'approved', label: isRTL ? 'مقبول'   : 'Approved' },
    { id: 'rejected', label: isRTL ? 'مرفوض'   : 'Rejected' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F0F25 0%, #1B1B3A 100%)', direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(15,15,37,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(78,205,196,0.2)',
        padding: '14px 24px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setCurrentView('home')}
              style={{ background: 'none', border: 'none', color: '#4ECDC4', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {isRTL ? 'الرئيسية' : 'Home'}
            </button>
            <div style={{ width: 1, height: 20, background: 'rgba(78,205,196,0.3)' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#E5E7EB' }}>
                {isRTL ? 'طلبات الترقيـة' : 'Upgrade Requests'}
              </div>
              <div style={{ fontSize: 10, color: '#6B7280' }}>
                {isRTL ? 'للمديرين فقط' : 'Admin access only'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={fetchRequests}
              disabled={loading}
              style={{ background: 'none', border: '1px solid rgba(78,205,196,0.3)', borderRadius: 8, padding: '6px 10px', color: '#4ECDC4', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </button>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  borderColor: tab === t.id ? 'rgba(78,205,196,0.5)' : 'rgba(78,205,196,0.15)',
                  background: tab === t.id ? 'rgba(78,205,196,0.2)' : 'transparent',
                  color: tab === t.id ? '#4ECDC4' : '#6B7280',
                }}
              >
                {t.label}
                <span style={{ marginInlineStart: 5, background: 'rgba(78,205,196,0.15)', borderRadius: 8, padding: '1px 6px', fontSize: 10 }}>
                  {counts[t.id]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        {actionError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 16px', color: '#FCA5A5', fontSize: 13, marginBottom: 16 }}>
            {actionError}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', color: '#6B7280', padding: 48 }}>
            {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6B7280', padding: 48 }}>
            {isRTL ? 'لا توجد طلبات' : 'No requests'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((req) => (
            <Card key={req.id} style={{
              background: 'rgba(27,27,58,0.85)',
              border: `1px solid ${req.status === 'pending' ? 'rgba(245,158,11,0.2)' : req.status === 'approved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 14, padding: '16px 20px',
            }}>
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E5E7EB' }}>{req.full_name}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{req.email}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: `${PLAN_COLORS[req.requested_plan] ?? '#6B7280'}25`,
                      color: PLAN_COLORS[req.requested_plan] ?? '#6B7280',
                      border: `1px solid ${PLAN_COLORS[req.requested_plan] ?? '#6B7280'}40`,
                    }}>
                      {req.requested_plan.charAt(0).toUpperCase() + req.requested_plan.slice(1)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>
                    {new Date(req.created_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                  </div>
                  <div style={{
                    fontSize: 12, color: '#D1D5DB', background: 'rgba(15,15,37,0.6)',
                    border: '1px solid rgba(78,205,196,0.1)', borderRadius: 8,
                    padding: '8px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {req.note}
                  </div>
                  {req.admin_note && (
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>
                      {isRTL ? 'ملاحظة المدير: ' : 'Admin note: '}
                      <span style={{ color: '#9CA3AF' }}>{req.admin_note}</span>
                    </div>
                  )}
                </div>

                {/* Status badge + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  {req.status === 'pending' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#FDE68A', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '3px 9px' }}>
                      <Clock size={11} /> {isRTL ? 'معلق' : 'Pending'}
                    </span>
                  )}
                  {req.status === 'approved' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6EE7B7', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '3px 9px' }}>
                      <CheckCircle size={11} /> {isRTL ? 'مقبول' : 'Approved'}
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#FCA5A5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '3px 9px' }}>
                      <XCircle size={11} /> {isRTL ? 'مرفوض' : 'Rejected'}
                    </span>
                  )}

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        disabled={actioningId === req.id}
                        onClick={() => handleApprove(req)}
                        style={{
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                          borderRadius: 8, padding: '6px 12px', color: '#6EE7B7', fontSize: 12,
                          fontWeight: 700, cursor: 'pointer', opacity: actioningId === req.id ? 0.5 : 1,
                        }}
                      >
                        {isRTL ? 'قبول' : 'Approve'}
                      </button>
                      <button
                        disabled={actioningId === req.id}
                        onClick={() => { setRejectingId(req.id); setRejectNote(''); setActionError(null); }}
                        style={{
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 8, padding: '6px 12px', color: '#FCA5A5', fontSize: 12,
                          fontWeight: 700, cursor: 'pointer', opacity: actioningId === req.id ? 0.5 : 1,
                        }}
                      >
                        {isRTL ? 'رفض' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reject panel */}
              <AnimatePresence>
                {rejectingId === req.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder={isRTL ? 'سبب الرفض (اختياري)...' : 'Rejection reason (optional)...'}
                        style={{
                          flex: 1, padding: '7px 12px', borderRadius: 8, fontSize: 12,
                          background: 'rgba(15,15,37,0.8)', border: '1px solid rgba(239,68,68,0.3)',
                          color: '#E5E7EB', outline: 'none',
                        }}
                      />
                      <button
                        disabled={actioningId === req.id}
                        onClick={() => handleReject(req)}
                        style={{
                          background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                          borderRadius: 8, padding: '7px 14px', color: '#FCA5A5', fontSize: 12,
                          fontWeight: 700, cursor: 'pointer', opacity: actioningId === req.id ? 0.5 : 1,
                        }}
                      >
                        {isRTL ? 'تأكيد الرفض' : 'Confirm Reject'}
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
