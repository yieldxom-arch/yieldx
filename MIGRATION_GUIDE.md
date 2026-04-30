# 🔄 YieldX: localStorage → Supabase Migration Guide

## **Overview**

This guide helps you transition your YieldX platform from localStorage (browser-based storage) to Supabase (cloud-based storage).

---

## **📊 What Changes?**

### **Before (localStorage):**
```
┌─────────────────────────────────┐
│  User's Browser                 │
│  ├─ localStorage                │
│  │  ├─ yieldx_user              │
│  │  ├─ yieldx_projects          │
│  │  ├─ yieldx_submissions       │
│  │  └─ yieldx_cohorts           │
│  └─ Data lost on browser clear │
└─────────────────────────────────┘
```

### **After (Supabase):**
```
┌─────────────────────────────────┐
│  Supabase Cloud (PostgreSQL)    │
│  ├─ users table                 │
│  ├─ projects table              │
│  ├─ submissions table           │
│  ├─ cohorts table               │
│  ├─ Real-time sync              │
│  └─ Multi-device access         │
└─────────────────────────────────┘
```

---

## **🎯 Migration Strategy**

You have **two options**:

### **Option A: Fresh Start (Recommended)**
- Start with clean Supabase database
- Keep localStorage as backup
- Users re-create their data in cloud
- **Pros:** Clean, simple, no conflicts
- **Cons:** Users lose existing demo data

### **Option B: Data Migration**
- Export data from localStorage
- Import into Supabase
- Maintain data continuity
- **Pros:** No data loss
- **Cons:** More complex, potential conflicts

---

## **🚀 Option A: Fresh Start (Quick Setup)**

### **Step 1: Set Up Supabase**
1. Follow `/SUPABASE_SETUP_GUIDE.md`
2. Create database schema
3. Set up authentication
4. Create demo accounts

### **Step 2: Update YieldXContext**

You need to modify `/src/app/contexts/YieldXContext.tsx` to use Supabase instead of localStorage.

**Replace the login function:**

```typescript
// OLD (localStorage)
const login = (email: string, password: string, role: UserRole): boolean => {
  const users = getRegisteredUsers();
  const foundUser = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password &&
    u.role === role
  );
  
  if (foundUser) {
    const userData = { email: foundUser.email, name: foundUser.name, role: foundUser.role };
    setUser(userData);
    localStorage.setItem('yieldx_user', JSON.stringify(userData));
    return true;
  }
  return false;
};

// NEW (Supabase)
const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
  const { success, user, profile } = await authService.signIn(email, password);
  
  if (success && profile.role === role) {
    setUser({
      id: user.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      avatar: profile.avatar_url,
      totalXP: profile.total_xp,
      currentLevel: profile.current_level,
    });
    return true;
  }
  return false;
};
```

### **Step 3: Test Login**
1. Open YieldX
2. Login with `demo.student@yieldx.com` / `demo123`
3. Verify user data loads from Supabase
4. Check browser console for success messages

### **Step 4: Clear localStorage (Optional)**
After confirming Supabase works, clear old data:

```javascript
// Open browser console
localStorage.removeItem('yieldx_user');
localStorage.removeItem('yieldx_projects');
localStorage.removeItem('yieldx_submissions');
console.log('✅ Old localStorage data cleared');
```

---

## **🔄 Option B: Data Migration (Preserve Data)**

### **Step 1: Export Current Data**

Open browser console and run:

```javascript
// Export all YieldX data from localStorage
const exportData = () => {
  const data = {
    users: JSON.parse(localStorage.getItem('yieldx_registered_users') || '[]'),
    projects: JSON.parse(localStorage.getItem('yieldx_projects') || '[]'),
    submissions: JSON.parse(localStorage.getItem('yieldx_submissions') || '[]'),
    cohorts: JSON.parse(localStorage.getItem('yieldx_cohorts') || '[]'),
    announcements: JSON.parse(localStorage.getItem('yieldx_announcements') || '[]'),
  };
  
  console.log('📦 Exported Data:', data);
  
  // Copy to clipboard
  const jsonData = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(jsonData);
  console.log('✅ Data copied to clipboard!');
  
  // Also download as file
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yieldx-export-${Date.now()}.json`;
  a.click();
  console.log('💾 Data downloaded as file!');
  
  return data;
};

exportData();
```

### **Step 2: Prepare Import Script**

Save the exported JSON file. You'll import this data to Supabase.

### **Step 3: Import Users**

In Supabase SQL Editor, run:

```sql
-- Import users from localStorage
-- Replace the VALUES with your actual data

INSERT INTO users (email, name, role, total_xp, current_level)
VALUES
  ('user1@example.com', 'User One', 'student', 1500, 2),
  ('user2@example.com', 'User Two', 'student', 2300, 3),
  ('teacher1@example.com', 'Teacher One', 'lecturer', 0, 0)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  total_xp = EXCLUDED.total_xp,
  current_level = EXCLUDED.current_level;

-- Get user IDs for reference
SELECT id, email, name FROM users;
```

**Copy the user IDs** for the next steps.

### **Step 4: Import Projects**

```sql
-- Import projects
-- Replace USER_ID with actual UUID from previous query

INSERT INTO projects (
  user_id, 
  name, 
  description, 
  project_type,
  level_0_data,
  level_1_data,
  level_2_data,
  level_3_data,
  level_4_data,
  level_5_data,
  level_6_data,
  level_7_data,
  total_xp,
  progress
)
VALUES
  (
    'USER_ID_HERE',
    'My Coffee Shop Business',
    'A specialty coffee shop in Muscat',
    'commercial',
    '{"projectName": "Coffee Haven", "location": "Muscat"}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    1200,
    45.5
  );

-- Get project IDs for submissions
SELECT id, user_id, name FROM projects;
```

### **Step 5: Import Submissions**

```sql
-- Import submissions
-- Replace PROJECT_ID and USER_ID with actual UUIDs

INSERT INTO submissions (
  project_id,
  user_id,
  level,
  status,
  submitted_at,
  grade,
  xp_earned
)
VALUES
  ('PROJECT_ID', 'USER_ID', 1, 'graded', NOW(), 95.0, 300),
  ('PROJECT_ID', 'USER_ID', 2, 'graded', NOW(), 88.0, 280),
  ('PROJECT_ID', 'USER_ID', 3, 'submitted', NOW(), NULL, 0);
```

### **Step 6: Import Cohorts**

```sql
-- Import cohorts
-- Replace LECTURER_ID with teacher's UUID

INSERT INTO cohorts (
  lecturer_id,
  code,
  name,
  description,
  is_active,
  semester,
  year
)
VALUES
  ('LECTURER_ID', 'ABC123', 'Business 101', 'Introduction to Business Planning', true, 'Fall', 2024);

-- Get cohort IDs
SELECT id, code, name FROM cohorts;

-- Add students to cohorts
INSERT INTO cohort_members (cohort_id, user_id, role)
VALUES
  ('COHORT_ID', 'STUDENT_ID_1', 'student'),
  ('COHORT_ID', 'STUDENT_ID_2', 'student');
```

### **Step 7: Verify Import**

Check if data was imported correctly:

```sql
-- Count records
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM projects) as projects_count,
  (SELECT COUNT(*) FROM submissions) as submissions_count,
  (SELECT COUNT(*) FROM cohorts) as cohorts_count,
  (SELECT COUNT(*) FROM cohort_members) as members_count;

-- View sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM projects LIMIT 5;
SELECT * FROM submissions LIMIT 5;
```

### **Step 8: Update Frontend to Use Supabase**

Replace localStorage calls with Supabase hooks:

**Before (localStorage):**
```typescript
const projects = JSON.parse(localStorage.getItem('yieldx_projects') || '[]');
```

**After (Supabase):**
```typescript
import { useProjects } from '@/app/hooks/useSupabase';

const { projects, loading, createProject } = useProjects(user?.id);
```

---

## **🔧 Code Changes Required**

### **1. Update YieldXContext.tsx**

Key changes needed:

```typescript
import { useSupabaseAuth } from '@/app/hooks/useSupabase';

export function YieldXProvider({ children }: { children: ReactNode }) {
  // Replace localStorage user state with Supabase
  const { user, profile, signIn, signOut, loading } = useSupabaseAuth();
  
  // ... rest of context
}
```

### **2. Update Project Management**

```typescript
import { useProjects } from '@/app/hooks/useSupabase';

function StudentWorkspace() {
  const { user } = useYieldX();
  const { projects, createProject, updateProject } = useProjects(user?.id);
  
  // Use projects from Supabase instead of localStorage
}
```

### **3. Update Submissions**

```typescript
import { useSubmissions } from '@/app/hooks/useSupabase';

function LevelModule({ projectId, level }) {
  const { submissions, submitLevel } = useSubmissions(projectId);
  
  const handleSubmit = async () => {
    await submitLevel(user.id, level, formData);
  };
}
```

---

## **⚠️ Important Considerations**

### **Data Structure Changes**

| localStorage | Supabase | Changes |
|--------------|----------|---------|
| Array of objects | Relational tables | Need to split data into tables |
| String IDs | UUIDs | Generate UUIDs for all records |
| Flat structure | Normalized schema | Use foreign keys |
| No validation | Typed columns | Must match schema |

### **Authentication Differences**

| Feature | localStorage | Supabase |
|---------|--------------|----------|
| Password storage | Plain text ❌ | Hashed ✅ |
| Session management | Manual | Automatic |
| Multi-device | No | Yes |
| Password reset | Manual | Email-based |

### **Breaking Changes**

1. **User IDs:** localStorage uses emails, Supabase uses UUIDs
2. **Async operations:** All database calls are now async
3. **Error handling:** Need try-catch blocks
4. **Real-time updates:** Automatic with Supabase
5. **File uploads:** New API for attachments

---

## **🧪 Testing Checklist**

After migration, test these features:

- [ ] User registration and login
- [ ] Create new project
- [ ] Save level data
- [ ] Submit assignment
- [ ] Teacher grading
- [ ] Cohort creation and joining
- [ ] Announcements
- [ ] File uploads
- [ ] Real-time updates
- [ ] Multi-device sync
- [ ] Logout and re-login

---

## **🚨 Rollback Plan**

If migration fails, you can rollback:

### **Step 1: Keep localStorage Backup**
Don't delete localStorage data until migration is confirmed working.

### **Step 2: Dual Mode**
Run both systems in parallel temporarily:

```typescript
const saveProject = async (project) => {
  // Save to localStorage (backup)
  const projects = JSON.parse(localStorage.getItem('yieldx_projects') || '[]');
  projects.push(project);
  localStorage.setItem('yieldx_projects', JSON.stringify(projects));
  
  // Also save to Supabase
  try {
    await projectService.createProject(project);
  } catch (error) {
    console.error('Supabase save failed, using localStorage');
  }
};
```

### **Step 3: Restore from Backup**
If needed, restore localStorage data:

```javascript
// Use the exported JSON file from Step 1
const restoreData = (exportedData) => {
  localStorage.setItem('yieldx_registered_users', JSON.stringify(exportedData.users));
  localStorage.setItem('yieldx_projects', JSON.stringify(exportedData.projects));
  localStorage.setItem('yieldx_submissions', JSON.stringify(exportedData.submissions));
  console.log('✅ Data restored from backup');
};
```

---

## **📈 Performance Comparison**

| Metric | localStorage | Supabase |
|--------|--------------|----------|
| Read speed | Instant | ~50-100ms |
| Write speed | Instant | ~100-200ms |
| Storage limit | ~5-10MB | Unlimited |
| Sync across devices | No | Yes |
| Offline support | Yes | Limited |
| Data persistence | Browser only | Cloud |

---

## **✅ Success Criteria**

Migration is successful when:

1. ✅ All users can login with Supabase Auth
2. ✅ Projects are saved to cloud database
3. ✅ Submissions sync in real-time
4. ✅ Teacher can access student data
5. ✅ Data persists across browsers
6. ✅ No localStorage dependencies remain
7. ✅ Real-time updates work
8. ✅ File uploads functional
9. ✅ RLS policies protect data
10. ✅ Performance is acceptable

---

## **🎯 Next Steps**

After successful migration:

1. **Monitor Performance:** Check Supabase dashboard for slow queries
2. **Optimize Queries:** Add indexes where needed
3. **Set Up Backups:** Configure automatic database backups
4. **Enable Email:** Configure SMTP for password resets
5. **Add Analytics:** Track usage patterns
6. **Scale Testing:** Test with multiple concurrent users
7. **Documentation:** Update user guides for cloud features

---

**Need Help?**

- Check `/SUPABASE_SETUP_GUIDE.md` for database setup
- Review `/utils/supabase/services.ts` for API examples
- Test with demo accounts first
- Contact support if issues persist

**Your YieldX platform is ready for the cloud!** ☁️🚀
