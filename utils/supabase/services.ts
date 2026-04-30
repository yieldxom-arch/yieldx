import { supabase } from './client';
import type { UserRole } from '@/app/types';

// =============================================
// AUTHENTICATION SERVICES
// =============================================

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string, name: string, role: UserRole) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          role,
          total_xp: 0,
          current_level: 0,
        });

      if (profileError) throw profileError;

      return { success: true, user: authData.user };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return { success: true, user: data.user, profile };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error: any) {
      console.error('Get session error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return { success: false, error: 'No user logged in' };

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return { success: true, user, profile };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reset password via email
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  },
};

// =============================================
// USER SERVICES
// =============================================

export const userService = {
  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get all users error:', error);
      return { success: false, error: error.message };
    }
  },
};

// =============================================
// PROJECT SERVICES
// =============================================

export const projectService = {
  /**
   * Create a new project
   */
  async createProject(userId: string, name: string, description?: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name,
          description,
          status: 'active',
          total_xp: 0,
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create project error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user's projects
   */
  async getUserProjects(userId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get user projects error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update project data
   */
  async updateProject(projectId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Update project error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update specific level data
   */
  async updateLevelData(projectId: string, level: number, data: any) {
    try {
      const levelField = `level_${level}_data`;
      const { data: result, error } = await supabase
        .from('projects')
        .update({ [levelField]: data })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Update level data error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete project
   */
  async deleteProject(projectId: string) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Delete project error:', error);
      return { success: false, error: error.message };
    }
  },
};

// =============================================
// SUBMISSION SERVICES
// =============================================

export const submissionService = {
  /**
   * Create or update submission
   */
  async upsertSubmission(projectId: string, userId: string, level: number, data: any) {
    try {
      const { data: result, error } = await supabase
        .from('submissions')
        .upsert({
          project_id: projectId,
          user_id: userId,
          level,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Upsert submission error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get project submissions
   */
  async getProjectSubmissions(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('project_id', projectId)
        .order('level', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get project submissions error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Grade submission
   */
  async gradeSubmission(submissionId: string, grade: number, feedback: string, xpEarned: number) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          grade,
          feedback,
          xp_earned: xpEarned,
          status: 'graded',
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Grade submission error:', error);
      return { success: false, error: error.message };
    }
  },
};

// =============================================
// COHORT SERVICES
// =============================================

export const cohortService = {
  /**
   * Create cohort
   */
  async createCohort(lecturerId: string, name: string, code: string, description?: string) {
    try {
      const { data, error } = await supabase
        .from('cohorts')
        .insert({
          lecturer_id: lecturerId,
          name,
          code,
          description,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create cohort error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get lecturer's cohorts
   */
  async getLecturerCohorts(lecturerId: string) {
    try {
      const { data, error } = await supabase
        .from('cohorts')
        .select('*, cohort_members(count)')
        .eq('lecturer_id', lecturerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get lecturer cohorts error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Join cohort with code
   */
  async joinCohort(userId: string, code: string) {
    try {
      // Find cohort by code
      const { data: cohort, error: cohortError } = await supabase
        .from('cohorts')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (cohortError) throw cohortError;

      // Add user to cohort
      const { data, error } = await supabase
        .from('cohort_members')
        .insert({
          cohort_id: cohort.id,
          user_id: userId,
          role: 'student',
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, cohort };
    } catch (error: any) {
      console.error('Join cohort error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get cohort members
   */
  async getCohortMembers(cohortId: string) {
    try {
      const { data, error } = await supabase
        .from('cohort_members')
        .select('*, users(*)')
        .eq('cohort_id', cohortId);

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get cohort members error:', error);
      return { success: false, error: error.message };
    }
  },
};

// =============================================
// ANNOUNCEMENT SERVICES
// =============================================

export const announcementService = {
  /**
   * Create announcement
   */
  async createAnnouncement(lecturerId: string, title: string, content: string, priority: string, cohortId?: string) {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          lecturer_id: lecturerId,
          cohort_id: cohortId,
          title,
          content,
          priority,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create announcement error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user announcements
   */
  async getUserAnnouncements(userId: string) {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, cohorts(name)')
        .or(`cohort_id.is.null,cohort_id.in.(select id from cohort_members where user_id = '${userId}')`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Get user announcements error:', error);
      return { success: false, error: error.message };
    }
  },
};

// =============================================
// REAL-TIME SUBSCRIPTIONS
// =============================================

export const realtimeService = {
  /**
   * Subscribe to project changes
   */
  subscribeToProject(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to submissions for a project
   */
  subscribeToSubmissions(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`submissions:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `project_id=eq.${projectId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to announcements
   */
  subscribeToAnnouncements(callback: (payload: any) => void) {
    return supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
        },
        callback
      )
      .subscribe();
  },
};

// =============================================
// FILE UPLOAD SERVICES
// =============================================

export const storageService = {
  /**
   * Upload file to Supabase storage
   */
  async uploadFile(userId: string, file: File, folder: string = 'submissions') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      return { success: true, path: data.path, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Upload file error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string) {
    try {
      const { error } = await supabase.storage
        .from('attachments')
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Delete file error:', error);
      return { success: false, error: error.message };
    }
  },
};
