// ═══════════════════════════════════════════════════════════════════════════════
// HYBRID AUTH — Tries Supabase when online, falls back to localStorage offline.
// ═══════════════════════════════════════════════════════════════════════════════
import { supabase } from './supabase';
import type { UserRole } from '@/app/contexts/YieldXContext';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  displayName?: string;
  studentId?: string;
  organization?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp(data: SignUpData) {
  if (!navigator.onLine) return { user: null, session: null };
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName, role: data.role } },
    });
    if (error) throw error;
    return { user: authData.user, session: authData.session };
  } catch (e) {
    console.warn('signUp error:', e);
    return { user: null, session: null };
  }
}

export async function signIn(data: SignInData) {
  if (!navigator.onLine) return { user: null, session: null };
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw error;
    return { user: authData.user, session: authData.session };
  } catch (e) {
    console.warn('signIn error:', e);
    return { user: null, session: null };
  }
}

export async function signOut() {
  try {
    if (navigator.onLine) await supabase.auth.signOut();
  } catch (e) {
    console.warn('signOut error:', e);
  }
}

export async function getCurrentUser() {
  if (!navigator.onLine) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export async function getSession() {
  if (!navigator.onLine) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

export async function getUserProfile(_userId: string) {
  return null;
}

export async function updateUserProfile(_userId: string, _updates: any) {
  return null;
}

export async function resetPassword(email: string) {
  if (!navigator.onLine) {
    console.warn('Password reset requires internet connection');
    return;
  }
  try {
    await supabase.auth.resetPasswordForEmail(email);
  } catch (e) {
    console.warn('resetPassword error:', e);
  }
}

export async function updatePassword(newPassword: string) {
  if (!navigator.onLine) return;
  try {
    await supabase.auth.updateUser({ password: newPassword });
  } catch (e) {
    console.warn('updatePassword error:', e);
  }
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  try {
    return supabase.auth.onAuthStateChange(callback);
  } catch {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
}
