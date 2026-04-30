# ⚡ YieldX Supabase Quick Reference

## **🚀 Quick Start**

### **1. Import Supabase Client**
```typescript
import { supabase } from '/utils/supabase/client';
```

### **2. Use Custom Hooks**
```typescript
import { useSupabaseAuth, useProjects, useSubmissions } from '@/app/hooks/useSupabase';
```

### **3. Access Services**
```typescript
import { authService, projectService, submissionService } from '/utils/supabase/services';
```

---

## **🔐 Authentication**

### **Sign Up**
```typescript
import { authService } from '/utils/supabase/services';

const handleSignUp = async () => {
  const { success, user, error } = await authService.signUp(
    'user@example.com',
    'password123',
    'John Doe',
    'student'
  );
  
  if (success) {
    console.log('User created:', user);
  } else {
    console.error('Signup failed:', error);
  }
};
```

### **Sign In**
```typescript
const handleSignIn = async () => {
  const { success, user, profile, error } = await authService.signIn(
    'demo.student@yieldx.com',
    'demo123'
  );
  
  if (success) {
    console.log('Logged in:', user);
    console.log('Profile:', profile);
  }
};
```

### **Sign Out**
```typescript
const handleSignOut = async () => {
  const { success } = await authService.signOut();
  if (success) {
    console.log('Logged out');
  }
};
```

### **Get Current User**
```typescript
const getCurrentUser = async () => {
  const { success, user, profile } = await authService.getCurrentUser();
  if (success) {
    console.log('Current user:', user);
    console.log('Profile:', profile);
  }
};
```

### **Using the Hook**
```typescript
import { useSupabaseAuth } from '@/app/hooks/useSupabase';

function MyComponent() {
  const { user, profile, loading, signIn, signOut } = useSupabaseAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {profile.name}!</p>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <button onClick={() => signIn('demo@yieldx.com', 'demo123')}>
          Login
        </button>
      )}
    </div>
  );
}
```

---

## **📁 Projects**

### **Create Project**
```typescript
import { projectService } from '/utils/supabase/services';

const createNewProject = async () => {
  const { success, data } = await projectService.createProject(
    userId,
    'My Coffee Shop',
    'A specialty coffee business in Muscat'
  );
  
  if (success) {
    console.log('Project created:', data);
  }
};
```

### **Get User Projects**
```typescript
const loadProjects = async () => {
  const { success, data } = await projectService.getUserProjects(userId);
  if (success) {
    console.log('Projects:', data);
  }
};
```

### **Update Project**
```typescript
const updateProjectData = async () => {
  const { success, data } = await projectService.updateProject(
    projectId,
    {
      name: 'Updated Name',
      description: 'New description',
      project_type: 'commercial',
      progress: 65.5
    }
  );
};
```

### **Update Level Data**
```typescript
const saveLevelData = async () => {
  const levelData = {
    projectName: 'Coffee Haven',
    projectType: 'Commercial',
    location: 'Muscat',
    // ... more level data
  };
  
  const { success, data } = await projectService.updateLevelData(
    projectId,
    0, // level number (0-7)
    levelData
  );
};
```

### **Delete Project**
```typescript
const deleteProject = async () => {
  const { success } = await projectService.deleteProject(projectId);
  if (success) {
    console.log('Project deleted');
  }
};
```

### **Using the Hook**
```typescript
import { useProjects } from '@/app/hooks/useSupabase';

function ProjectsList() {
  const { projects, loading, createProject, updateProject } = useProjects(userId);
  
  const handleCreate = async () => {
    await createProject('New Project', 'Description here');
  };
  
  if (loading) return <div>Loading projects...</div>;
  
  return (
    <div>
      <button onClick={handleCreate}>Create Project</button>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## **📝 Submissions**

### **Submit Assignment**
```typescript
import { submissionService } from '/utils/supabase/services';

const submitAssignment = async () => {
  const { success, data } = await submissionService.upsertSubmission(
    projectId,
    userId,
    1, // level number
    {
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      attachments: ['file1.pdf', 'file2.docx']
    }
  );
};
```

### **Get Project Submissions**
```typescript
const loadSubmissions = async () => {
  const { success, data } = await submissionService.getProjectSubmissions(projectId);
  if (success) {
    console.log('Submissions:', data);
  }
};
```

### **Grade Submission**
```typescript
const gradeStudentWork = async () => {
  const { success, data } = await submissionService.gradeSubmission(
    submissionId,
    92.5, // grade
    'Excellent work! Well structured business plan.',
    350 // XP earned
  );
};
```

### **Using the Hook**
```typescript
import { useSubmissions } from '@/app/hooks/useSupabase';

function SubmissionView({ projectId }) {
  const { submissions, loading, submitLevel, gradeSubmission } = useSubmissions(projectId);
  
  const handleSubmit = async () => {
    await submitLevel(userId, 1, {
      status: 'submitted',
      submitted_at: new Date().toISOString()
    });
  };
  
  return (
    <div>
      {submissions.map(sub => (
        <div key={sub.id}>
          Level {sub.level}: {sub.status}
          {sub.grade && <span>Grade: {sub.grade}</span>}
        </div>
      ))}
    </div>
  );
}
```

---

## **👥 Cohorts (Study Groups)**

### **Create Cohort**
```typescript
import { cohortService } from '/utils/supabase/services';

const createClass = async () => {
  const { success, data } = await cohortService.createCohort(
    lecturerId,
    'Business Planning 101',
    'ABC123', // 6-character code
    'Introduction to business feasibility studies'
  );
};
```

### **Get Lecturer's Cohorts**
```typescript
const loadCohorts = async () => {
  const { success, data } = await cohortService.getLecturerCohorts(lecturerId);
  if (success) {
    console.log('Cohorts:', data);
  }
};
```

### **Student Joins Cohort**
```typescript
const joinClass = async () => {
  const { success, data, cohort } = await cohortService.joinCohort(
    userId,
    'ABC123' // cohort code
  );
  
  if (success) {
    console.log('Joined cohort:', cohort.name);
  }
};
```

### **Get Cohort Members**
```typescript
const getStudents = async () => {
  const { success, data } = await cohortService.getCohortMembers(cohortId);
  if (success) {
    console.log('Members:', data);
  }
};
```

### **Using the Hook**
```typescript
import { useCohorts } from '@/app/hooks/useSupabase';

function TeacherCohorts() {
  const { cohorts, loading, createCohort, getMembers } = useCohorts(lecturerId);
  
  const handleCreate = async () => {
    await createCohort('New Class', generateCode());
  };
  
  return (
    <div>
      {cohorts.map(cohort => (
        <div key={cohort.id}>
          <h3>{cohort.name}</h3>
          <p>Code: {cohort.code}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## **📢 Announcements**

### **Create Announcement**
```typescript
import { announcementService } from '/utils/supabase/services';

const postAnnouncement = async () => {
  const { success, data } = await announcementService.createAnnouncement(
    lecturerId,
    'Important: Deadline Extended',
    'The Level 3 submission deadline has been extended to next Friday.',
    'high', // priority: low, medium, high, urgent
    cohortId // optional, null for global announcements
  );
};
```

### **Get User Announcements**
```typescript
const loadAnnouncements = async () => {
  const { success, data } = await announcementService.getUserAnnouncements(userId);
  if (success) {
    console.log('Announcements:', data);
  }
};
```

### **Using the Hook**
```typescript
import { useAnnouncements } from '@/app/hooks/useSupabase';

function AnnouncementsFeed() {
  const { announcements, loading, createAnnouncement } = useAnnouncements(userId);
  
  return (
    <div>
      {announcements.map(ann => (
        <div key={ann.id} className={`priority-${ann.priority}`}>
          <h4>{ann.title}</h4>
          <p>{ann.content}</p>
          <small>{new Date(ann.created_at).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}
```

---

## **📤 File Uploads**

### **Upload File**
```typescript
import { storageService } from '/utils/supabase/services';

const uploadDocument = async (file: File) => {
  const { success, path, url } = await storageService.uploadFile(
    userId,
    file,
    'submissions' // folder name
  );
  
  if (success) {
    console.log('File uploaded:', url);
    console.log('Storage path:', path);
  }
};
```

### **Delete File**
```typescript
const deleteDocument = async () => {
  const { success } = await storageService.deleteFile(
    'user-id/submissions/1234567890.pdf'
  );
};
```

### **Using the Hook**
```typescript
import { useFileUpload } from '@/app/hooks/useSupabase';

function FileUploader() {
  const { uploadFile, uploading, progress } = useFileUpload(userId);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await uploadFile(file, 'submissions');
      if (result.success) {
        console.log('File URL:', result.url);
      }
    }
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {uploading && <progress value={progress} max={100} />}
    </div>
  );
}
```

---

## **🔴 Real-Time Updates**

### **Subscribe to Project Changes**
```typescript
import { realtimeService } from '/utils/supabase/services';

const subscription = realtimeService.subscribeToProject(
  projectId,
  (payload) => {
    console.log('Project updated:', payload);
    if (payload.eventType === 'UPDATE') {
      console.log('New data:', payload.new);
    }
  }
);

// Cleanup
subscription.unsubscribe();
```

### **Subscribe to Submissions**
```typescript
const subscription = realtimeService.subscribeToSubmissions(
  projectId,
  (payload) => {
    if (payload.eventType === 'INSERT') {
      console.log('New submission:', payload.new);
    } else if (payload.eventType === 'UPDATE') {
      console.log('Submission graded:', payload.new);
    }
  }
);
```

### **Subscribe to Announcements**
```typescript
const subscription = realtimeService.subscribeToAnnouncements((payload) => {
  if (payload.eventType === 'INSERT') {
    console.log('New announcement:', payload.new);
    showNotification(payload.new.title, payload.new.content);
  }
});
```

### **Using Real-Time Hook**
```typescript
import { useRealtimeProject } from '@/app/hooks/useSupabase';

function ProjectView({ projectId }) {
  const realtimeProject = useRealtimeProject(projectId);
  
  useEffect(() => {
    if (realtimeProject) {
      console.log('Project updated in real-time:', realtimeProject);
    }
  }, [realtimeProject]);
  
  return <div>Project is syncing live!</div>;
}
```

---

## **🔍 Direct Database Queries**

### **Basic Query**
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId);
```

### **Query with Joins**
```typescript
const { data, error } = await supabase
  .from('submissions')
  .select(`
    *,
    projects (name, description),
    users (name, email)
  `)
  .eq('user_id', userId);
```

### **Insert**
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    user_id: userId,
    name: 'New Project',
    description: 'Description',
  })
  .select()
  .single();
```

### **Update**
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({ progress: 75.5 })
  .eq('id', projectId)
  .select()
  .single();
```

### **Delete**
```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

### **Filters**
```typescript
// Equal
.eq('status', 'active')

// Not equal
.neq('role', 'admin')

// Greater than
.gt('total_xp', 1000)

// Less than
.lt('current_level', 5)

// In array
.in('role', ['student', 'lecturer'])

// Like (pattern matching)
.like('name', '%Coffee%')

// Order
.order('created_at', { ascending: false })

// Limit
.limit(10)

// Range (pagination)
.range(0, 9) // First 10 records
```

---

## **⚠️ Error Handling**

### **Standard Pattern**
```typescript
const handleOperation = async () => {
  try {
    const { success, data, error } = await projectService.createProject(
      userId,
      'Project Name'
    );
    
    if (!success) {
      console.error('Operation failed:', error);
      toast.error(error);
      return;
    }
    
    console.log('Success:', data);
    toast.success('Project created!');
  } catch (err) {
    console.error('Unexpected error:', err);
    toast.error('Something went wrong');
  }
};
```

### **With Loading State**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleOperation = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await projectService.createProject(userId, 'Name');
    if (!result.success) {
      setError(result.error);
    }
  } catch (err) {
    setError('Unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
```

---

## **🎯 Common Patterns**

### **Check if User is Authenticated**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  console.log('Not logged in');
  return;
}
```

### **Get User's Profile**
```typescript
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();
```

### **Create with Relationship**
```typescript
// Create project and first submission together
const { data: project } = await supabase
  .from('projects')
  .insert({ user_id: userId, name: 'Project' })
  .select()
  .single();

await supabase
  .from('submissions')
  .insert({
    project_id: project.id,
    user_id: userId,
    level: 0,
    status: 'in-progress'
  });
```

### **Batch Operations**
```typescript
// Insert multiple records at once
const submissions = [
  { project_id: projectId, user_id: userId, level: 0 },
  { project_id: projectId, user_id: userId, level: 1 },
  { project_id: projectId, user_id: userId, level: 2 },
];

const { data } = await supabase
  .from('submissions')
  .insert(submissions)
  .select();
```

---

## **🔒 Security Notes**

1. **Row Level Security (RLS)** is enabled on all tables
2. Users can only access their own data
3. Teachers can access student data in their cohorts
4. Never expose service role key in frontend
5. Use anon key (already configured)
6. Files in storage are private by default

---

## **📚 Useful Resources**

- **Supabase Client Docs:** https://supabase.com/docs/reference/javascript
- **Auth Methods:** https://supabase.com/docs/guides/auth
- **Database Queries:** https://supabase.com/docs/reference/javascript/select
- **Real-time:** https://supabase.com/docs/guides/realtime
- **Storage:** https://supabase.com/docs/guides/storage

---

## **💡 Pro Tips**

1. **Always handle errors** - Network can fail
2. **Use hooks** - Cleaner than direct service calls
3. **Subscribe to real-time** - Better UX
4. **Batch operations** - Faster than multiple calls
5. **Use select('*')** - Get all columns easily
6. **Check RLS policies** - If queries fail unexpectedly
7. **Use .single()** - When expecting one result
8. **Order results** - Don't rely on default order
9. **Add indexes** - For frequently queried columns
10. **Monitor dashboard** - Check Supabase logs for errors

---

**Need more help?** Check the full documentation files:
- `/SUPABASE_SETUP_GUIDE.md` - Complete setup instructions
- `/MIGRATION_GUIDE.md` - Migrate from localStorage
- `/utils/supabase/services.ts` - Full service implementations
- `/src/app/hooks/useSupabase.ts` - React hooks source code
