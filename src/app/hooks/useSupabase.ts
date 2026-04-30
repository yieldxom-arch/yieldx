import { useState, useEffect } from 'react';
import { supabase } from '/utils/supabase/client';
import { 
  authService, 
  userService, 
  projectService, 
  submissionService,
  cohortService,
  announcementService,
  realtimeService,
  storageService 
} from '/utils/supabase/services';
import type { UserRole } from '@/app/types';

/**
 * Custom hook for Supabase authentication
 */
export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    authService.getSession().then(({ session }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await userService.getUserById(userId);
    setProfile(data);
    setLoading(false);
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true);
    const result = await authService.signUp(email, password, name, role);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    if (result.success) {
      setUser(result.user);
      setProfile(result.profile);
    }
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authService.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
    return result;
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { success: false, error: 'No user logged in' };
    const result = await userService.updateProfile(user.id, updates);
    if (result.success) {
      setProfile(result.data);
    }
    return result;
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}

/**
 * Custom hook for managing user projects
 */
export function useProjects(userId?: string) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadProjects();
    }
  }, [userId]);

  const loadProjects = async () => {
    if (!userId) return;
    setLoading(true);
    const result = await projectService.getUserProjects(userId);
    if (result.success) {
      setProjects(result.data || []);
      setError(null);
    } else {
      setError(result.error || 'Failed to load projects');
    }
    setLoading(false);
  };

  const createProject = async (name: string, description?: string) => {
    if (!userId) return { success: false, error: 'No user ID' };
    const result = await projectService.createProject(userId, name, description);
    if (result.success) {
      setProjects(prev => [result.data, ...prev]);
    }
    return result;
  };

  const updateProject = async (projectId: string, updates: any) => {
    const result = await projectService.updateProject(projectId, updates);
    if (result.success) {
      setProjects(prev =>
        prev.map(p => (p.id === projectId ? result.data : p))
      );
    }
    return result;
  };

  const deleteProject = async (projectId: string) => {
    const result = await projectService.deleteProject(projectId);
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
    return result;
  };

  const updateLevelData = async (projectId: string, level: number, data: any) => {
    const result = await projectService.updateLevelData(projectId, level, data);
    if (result.success) {
      setProjects(prev =>
        prev.map(p => (p.id === projectId ? result.data : p))
      );
    }
    return result;
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    updateLevelData,
    refresh: loadProjects,
  };
}

/**
 * Custom hook for real-time project updates
 */
export function useRealtimeProject(projectId?: string) {
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!projectId) return;

    // Subscribe to real-time updates
    const subscription = realtimeService.subscribeToProject(
      projectId,
      (payload) => {
        console.log('Project updated:', payload);
        if (payload.eventType === 'UPDATE') {
          setProject(payload.new);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  return project;
}

/**
 * Custom hook for managing submissions
 */
export function useSubmissions(projectId?: string) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadSubmissions();

      // Subscribe to real-time updates
      const subscription = realtimeService.subscribeToSubmissions(
        projectId,
        (payload) => {
          console.log('Submission updated:', payload);
          if (payload.eventType === 'INSERT') {
            setSubmissions(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setSubmissions(prev =>
              prev.map(s => (s.id === payload.new.id ? payload.new : s))
            );
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [projectId]);

  const loadSubmissions = async () => {
    if (!projectId) return;
    setLoading(true);
    const result = await submissionService.getProjectSubmissions(projectId);
    if (result.success) {
      setSubmissions(result.data || []);
    }
    setLoading(false);
  };

  const submitLevel = async (userId: string, level: number, data: any) => {
    if (!projectId) return { success: false, error: 'No project ID' };
    return await submissionService.upsertSubmission(projectId, userId, level, data);
  };

  const gradeSubmission = async (submissionId: string, grade: number, feedback: string, xp: number) => {
    return await submissionService.gradeSubmission(submissionId, grade, feedback, xp);
  };

  return {
    submissions,
    loading,
    submitLevel,
    gradeSubmission,
    refresh: loadSubmissions,
  };
}

/**
 * Custom hook for cohort management
 */
export function useCohorts(lecturerId?: string) {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lecturerId) {
      loadCohorts();
    }
  }, [lecturerId]);

  const loadCohorts = async () => {
    if (!lecturerId) return;
    setLoading(true);
    const result = await cohortService.getLecturerCohorts(lecturerId);
    if (result.success) {
      setCohorts(result.data || []);
    }
    setLoading(false);
  };

  const createCohort = async (name: string, code: string, description?: string) => {
    if (!lecturerId) return { success: false, error: 'No lecturer ID' };
    const result = await cohortService.createCohort(lecturerId, name, code, description);
    if (result.success) {
      setCohorts(prev => [result.data, ...prev]);
    }
    return result;
  };

  const joinCohort = async (userId: string, code: string) => {
    return await cohortService.joinCohort(userId, code);
  };

  const getMembers = async (cohortId: string) => {
    return await cohortService.getCohortMembers(cohortId);
  };

  return {
    cohorts,
    loading,
    createCohort,
    joinCohort,
    getMembers,
    refresh: loadCohorts,
  };
}

/**
 * Custom hook for announcements
 */
export function useAnnouncements(userId?: string) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAnnouncements();

      // Subscribe to real-time announcements
      const subscription = realtimeService.subscribeToAnnouncements((payload) => {
        console.log('New announcement:', payload);
        if (payload.eventType === 'INSERT') {
          setAnnouncements(prev => [payload.new, ...prev]);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const loadAnnouncements = async () => {
    if (!userId) return;
    setLoading(true);
    const result = await announcementService.getUserAnnouncements(userId);
    if (result.success) {
      setAnnouncements(result.data || []);
    }
    setLoading(false);
  };

  const createAnnouncement = async (
    lecturerId: string,
    title: string,
    content: string,
    priority: string,
    cohortId?: string
  ) => {
    const result = await announcementService.createAnnouncement(
      lecturerId,
      title,
      content,
      priority,
      cohortId
    );
    if (result.success) {
      setAnnouncements(prev => [result.data, ...prev]);
    }
    return result;
  };

  return {
    announcements,
    loading,
    createAnnouncement,
    refresh: loadAnnouncements,
  };
}

/**
 * Custom hook for file uploads
 */
export function useFileUpload(userId?: string) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, folder: string = 'submissions') => {
    if (!userId) return { success: false, error: 'No user ID' };
    
    setUploading(true);
    setProgress(0);

    // Simulate progress (Supabase doesn't provide upload progress yet)
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    const result = await storageService.uploadFile(userId, file, folder);
    
    clearInterval(progressInterval);
    setProgress(100);
    setUploading(false);

    return result;
  };

  const deleteFile = async (filePath: string) => {
    return await storageService.deleteFile(filePath);
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
  };
}

/**
 * Export all services for direct use if needed
 */
export {
  authService,
  userService,
  projectService,
  submissionService,
  cohortService,
  announcementService,
  realtimeService,
  storageService,
  supabase,
};
