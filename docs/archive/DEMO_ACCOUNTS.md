# 🔑 **YieldX Platform - Demo Accounts**

## 📧 **Available Demo Accounts**

### **🎓 STUDENT ACCOUNTS**

#### **1. Demo Student Account**
```
Email:    demo.student@yieldx.com
Password: demo123
Role:     Student
Name:     Demo Student
```
**Access:**
- Student Dashboard
- 7-Level Learning System (Levels 0-7)
- Space Map Navigation
- Business Plan Creation
- AI Copilot Features
- Gamification (XP, Badges, Leaderboard)
- Video Library
- Messaging Center

---

#### **2. Said Al Hashmi (Account 1)**
```
Email:    alhashmisaid23@gmail.com
Password: password123
Role:     Student
Name:     Said Al Hashmi
```
**Access:** Same as Demo Student

---

#### **3. Said Al Hashmi (Account 2)**
```
Email:    alhashmisaid21@gmail.com
Password: password123
Role:     Student
Name:     Said Al Hashmi 21
```
**Access:** Same as Demo Student

---

### **👨‍🏫 TEACHER ACCOUNT**

#### **4. Demo Teacher Account**
```
Email:    demo.teacher@yieldx.com
Password: demo123
Role:     Lecturer (Teacher)
Name:     Demo Teacher
```
**Access:**
- Teacher Dashboard
- Student Management
- Cohort Creation & Management
- Assignment Grading
- Announcements
- Student Progress Tracking
- Analytics & Reports
- Messaging with Students

---

### **🔧 ADMIN ACCOUNT**

#### **5. System Administrator**
```
Email:    admin@yieldx.com
Password: admin123
Role:     Admin
Name:     System Admin
```
**Access:**
- Full Platform Access
- All Student Features
- All Teacher Features
- System Configuration
- User Management

---

## 🎯 **Quick Reference Card**

| User Type | Email | Password | Role |
|-----------|-------|----------|------|
| 👨‍🎓 Student (Demo) | demo.student@yieldx.com | demo123 | Student |
| 👨‍🎓 Student (Custom) | alhashmisaid23@gmail.com | password123 | Student |
| 👨‍🎓 Student (Custom) | alhashmisaid21@gmail.com | password123 | Student |
| 👨‍🏫 Teacher | demo.teacher@yieldx.com | demo123 | Lecturer |
| 🔧 Admin | admin@yieldx.com | admin123 | Admin |

---

## 🚀 **How to Login**

### **Step 1: Open YieldX Platform**
Navigate to the login page

### **Step 2: Select Your Role**
- Click **Student** for student accounts
- Click **Teacher** for teacher account
- Click **Admin** for admin account

⚠️ **IMPORTANT:** You MUST select the correct role that matches the account type!

### **Step 3: Enter Credentials**
- Copy the email from table above
- Copy the password
- Click "Login"

### **Step 4: Explore!**
You're now logged in and can explore all features available to that role.

---

## 📱 **Features by Role**

### **🎓 Student Features:**
- ✅ 8 Interactive Learning Levels (0-7)
- ✅ Space-Themed Gamification
- ✅ XP & Badges System
- ✅ Business Plan Wizard
- ✅ Sector-Specific Customization (Agricultural/Industrial/Commercial/Service)
- ✅ AI-Powered Business Name Checker
- ✅ SWOT Analysis Tools
- ✅ Financial Calculations
- ✅ Business Model Canvas
- ✅ Video Library
- ✅ Leaderboard Competition
- ✅ AI Copilot Assistant
- ✅ Messaging Center
- ✅ Professional Consultation Booking
- ✅ Multi-Mode Study Options
- ✅ Scenario Comparison Tools
- ✅ Progress Tracking

### **👨‍🏫 Teacher Features:**
- ✅ All Student Features
- ✅ Student Management Dashboard
- ✅ Create & Manage Cohorts
- ✅ Assign Projects
- ✅ Grade Submissions
- ✅ Post Announcements
- ✅ Track Student Progress
- ✅ Analytics & Reports
- ✅ Messaging Students
- ✅ Export Data

### **🔧 Admin Features:**
- ✅ All Student Features
- ✅ All Teacher Features
- ✅ Full System Access
- ✅ User Management
- ✅ Platform Configuration

---

## 🔒 **Account Security**

### **Important Notes:**

1. **Demo Accounts are Persistent**
   - These accounts cannot be deleted
   - They reset automatically if modified
   - Perfect for testing!

2. **Passwords Are Simple**
   - For demo purposes only
   - NOT secure for production
   - Change for real deployment

3. **Data Persistence**
   - Student progress is saved in localStorage
   - Data persists between sessions
   - Can be cleared via browser settings

4. **Multi-Session Support**
   - You can open multiple tabs
   - Login with different accounts simultaneously
   - Test different roles at once!

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Complete Student Journey**
```
1. Login as: demo.student@yieldx.com
2. Complete Level 0 (Select Agricultural Project)
3. Complete Level 1 (Identity & Ownership)
4. See sector-specific fields appear
5. Progress through all 8 levels
6. View final business plan
```

### **Scenario 2: Teacher Management**
```
1. Login as: demo.teacher@yieldx.com
2. Create a new cohort
3. View all students
4. Post an announcement
5. Review student progress
6. Grade a submission
```

### **Scenario 3: Admin Overview**
```
1. Login as: admin@yieldx.com
2. View entire platform
3. Access all dashboards
4. Test all features
```

### **Scenario 4: Multi-Language Testing**
```
1. Login as: demo.student@yieldx.com
2. Switch language to Arabic
3. Verify all labels translate
4. Enter business name in Level 1
5. Confirm AI labels appear in Arabic
6. Switch back to English
```

---

## 🌍 **Bilingual Support**

All accounts support:
- ✅ **English** (Default)
- ✅ **Arabic** (العربية)

Switch languages anytime using the language toggle in the navigation bar.

---

## 💾 **Data Storage**

### **Where Data is Saved:**

| Data Type | Storage Location | Persistent? |
|-----------|-----------------|-------------|
| User Authentication | localStorage | ✅ Yes |
| Student Progress (Levels) | localStorage | ✅ Yes |
| Module Data | localStorage | ✅ Yes |
| User Preferences | localStorage | ✅ Yes |
| Cohorts & Announcements | localStorage | ✅ Yes |
| Theme Settings | localStorage | ✅ Yes |
| Language Preference | localStorage | ✅ Yes |

### **Clear All Data:**
```javascript
// Open browser console and run:
localStorage.clear();
location.reload();
```

---

## 🎯 **Recommended Testing Order**

### **For Developers:**
1. ✅ Login as **Student** → Test all 8 levels
2. ✅ Login as **Teacher** → Create cohort and announcements
3. ✅ Login as **Admin** → Verify full access
4. ✅ Switch languages → Test Arabic/English
5. ✅ Test AI features → Business name checker
6. ✅ Complete business plan → Export functionality

### **For Stakeholders:**
1. ✅ Login as **Demo Student**
2. ✅ Explore Space Map
3. ✅ Complete Level 0-1
4. ✅ View gamification elements
5. ✅ Test sector-specific features
6. ✅ Review final business plan output

---

## 📞 **Support**

If you encounter any issues:
1. Check you selected the **correct role**
2. Verify email/password are **exact matches**
3. Clear browser cache and try again
4. Check browser console for errors

---

## 🔄 **Reset Demo Account**

To reset a demo account to default state:

```javascript
// Open browser console
localStorage.removeItem('yieldx_moduleData');
localStorage.removeItem('yieldx_levels');
localStorage.removeItem('yieldx_projectType');
location.reload();
```

---

## ✅ **Quick Login Checklist**

- [ ] Opened YieldX platform
- [ ] Selected correct role (Student/Teacher/Admin)
- [ ] Entered email exactly as shown
- [ ] Entered password exactly as shown
- [ ] Clicked "Login" button
- [ ] Successfully logged in!

---

## 🎊 **Success Indicators**

After successful login, you should see:

### **Student Account:**
- ✅ Space-themed dashboard
- ✅ Animated space map
- ✅ Your name in top-right corner
- ✅ XP and level progress
- ✅ 8 planets representing levels

### **Teacher Account:**
- ✅ Teacher dashboard
- ✅ Student list
- ✅ Cohort management panel
- ✅ Analytics section

### **Admin Account:**
- ✅ Full navigation menu
- ✅ All features unlocked
- ✅ Admin badge/indicator

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Login Failed"**
**Solution:** Ensure you selected the correct role
- demo.student@yieldx.com → Select "Student"
- demo.teacher@yieldx.com → Select "Teacher"
- admin@yieldx.com → Select "Admin"

### **Issue 2: "Account not found"**
**Solution:** Check email spelling - copy/paste from this document

### **Issue 3: "Wrong password"**
**Solution:** Passwords are case-sensitive:
- demo123 (lowercase)
- admin123 (lowercase)
- password123 (lowercase)

### **Issue 4: Data not saving**
**Solution:** Check browser allows localStorage
- Enable cookies/storage in browser settings
- Use Chrome/Firefox/Safari (not Incognito mode)

---

## 📖 **Additional Resources**

- **Full Documentation:** `/YIELDX_SYSTEM_DOCUMENTATION.md`
- **Sector Integration Guide:** `/SECTOR_INTEGRATION_SUMMARY.md`
- **Language Fix Guide:** `/AI_LABELS_ARABIC_FIX.md`
- **Supabase Schema:** `/supabase_schema.sql`

---

## 🎉 **Ready to Explore!**

You now have all the credentials needed to fully explore the YieldX platform. 

**Start with the Student account to experience the full learning journey!**

---

**Last Updated:** February 16, 2026  
**Platform Version:** YieldX v3.0 (7-Level System with Sector Integration)  
**Authentication:** Supabase + localStorage Fallback
