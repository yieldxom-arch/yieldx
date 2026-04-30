import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Level = Database['public']['Tables']['levels']['Row'];
type UserProgress = Database['public']['Tables']['user_progress']['Row'];
type Video = Database['public']['Tables']['videos']['Row'];
type VideoCategory = Database['public']['Tables']['video_categories']['Row'];
type Achievement = Database['public']['Tables']['achievements']['Row'];
type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];
type LeaderboardEntry = Database['public']['Tables']['leaderboard']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Hook to fetch all levels
 */
export function useLevels() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLevels() {
      try {
        const { data, error } = await supabase
          .from('levels')
          .select('*')
          .eq('is_active', true)
          .order('order_index');

        if (error) throw error;
        setLevels(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLevels();
  }, []);

  return { levels, loading, error };
}

/**
 * Hook to fetch user progress
 */
export function useUserProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<(UserProgress & { level?: Level })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProgress() {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*, levels(*)')
          .eq('user_id', userId)
          .order('level_id');

        if (error) throw error;
        setProgress(data as any || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();

    // Real-time subscription
    const subscription = supabase
      .channel('user_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const updateProgress = async (
    levelId: number,
    updates: Partial<UserProgress>
  ) => {
    if (!userId) return;

    const { error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId)
      .eq('level_id', levelId);

    if (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  return { progress, loading, error, updateProgress };
}

/**
 * Hook to fetch videos
 */
export function useVideos(categoryId?: string, levelId?: number) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        let query = supabase
          .from('videos')
          .select('*')
          .eq('is_active', true)
          .order('order_index');

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        if (levelId !== undefined) {
          query = query.eq('level_id', levelId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setVideos(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [categoryId, levelId]);

  return { videos, loading, error };
}

/**
 * Hook to fetch video categories
 */
export function useVideoCategories() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('video_categories')
          .select('*')
          .order('order_index');

        if (error) throw error;
        setCategories(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

/**
 * Hook to fetch leaderboard
 */
export function useLeaderboard(scope: 'global' | 'country' | 'university' | 'class' = 'global', scopeId?: string) {
  const [leaderboard, setLeaderboard] = useState<(LeaderboardEntry & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        let query = supabase
          .from('leaderboard')
          .select('*, profiles(full_name, display_name, role)')
          .eq('scope', scope)
          .order('total_xp', { ascending: false })
          .limit(100);

        if (scopeId) {
          query = query.eq('scope_id', scopeId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setLeaderboard(data as any || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();

    // Real-time subscription
    const subscription = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard',
          filter: `scope=eq.${scope}`,
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [scope, scopeId]);

  return { leaderboard, loading, error };
}

/**
 * Hook to fetch user achievements
 */
export function useUserAchievements(userId: string | undefined) {
  const [achievements, setAchievements] = useState<(UserAchievement & { achievement?: Achievement })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchAchievements() {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false });

        if (error) throw error;
        setAchievements(data as any || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();

    // Real-time subscription
    const subscription = supabase
      .channel('user_achievements_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchAchievements();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { achievements, loading, error };
}

/**
 * Hook to fetch user notifications
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchNotifications() {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();

    // Real-time subscription
    const subscription = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return { notifications, loading, error, unreadCount, markAsRead, markAllAsRead };
}

/**
 * Hook to fetch user profile
 */
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    // Real-time subscription
    const subscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    setProfile(data);
    return data;
  };

  return { profile, loading, error, updateProfile };
}
