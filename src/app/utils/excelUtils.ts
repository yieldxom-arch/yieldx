import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export interface StudentData {
  name: string;
  email: string;
  cohort?: string;
}

export const exportStudentsToExcel = (students: StudentData[], filename: string = 'students') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلاب');
    
    XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success('تم تصدير قائمة الطلاب', {
      description: `تم تصدير ${students.length} طالب بنجاح`,
    });
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('فشل تصدير الملف', {
      description: 'حدث خطأ أثناء تصدير البيانات إلى Excel',
    });
    return false;
  }
};

export const importStudentsFromExcel = (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<StudentData>(worksheet);
        
        // Validate data
        const validStudents = jsonData.filter(
          (student) => student.name && student.email
        );
        
        if (validStudents.length === 0) {
          throw new Error('No valid student data found');
        }
        
        toast.success('تم استيراد قائمة الطلاب', {
          description: `تم استيراد ${validStudents.length} طالب بنجاح`,
        });
        
        resolve(validStudents);
      } catch (error) {
        console.error('Error importing from Excel:', error);
        toast.error('فشل استيراد الملف', {
          description: 'تأكد من أن الملف يحتوي على أعمدة "name" و "email"',
        });
        reject(error);
      }
    };

    reader.onerror = () => {
      toast.error('فشل قراءة الملف');
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

export const exportCohortReportToExcel = (
  cohortName: string,
  students: any[],
  submissions: any[]
) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Students sheet
    const studentsSheet = XLSX.utils.json_to_sheet(
      students.map((s) => ({
        'الاسم': s.name,
        'البريد الإلكتروني': s.email,
        'التقدم': `${s.progress}%`,
        'المستويات المكتملة': s.completedLevels,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, studentsSheet, 'الطلاب');
    
    // Submissions sheet
    if (submissions.length > 0) {
      const submissionsSheet = XLSX.utils.json_to_sheet(
        submissions.map((s) => ({
          'الطالب': s.studentName,
          'المستوى': s.levelName,
          'تاريخ التسليم': s.submittedAt,
          'الحالة': s.status,
          'الدرجة': s.grade || 'لم يتم التقييم',
        }))
      );
      XLSX.utils.book_append_sheet(workbook, submissionsSheet, 'التسليمات');
    }
    
    XLSX.writeFile(
      workbook,
      `${cohortName}-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );
    
    toast.success('تم تصدير تقرير المجموعة', {
      description: 'تم حفظ التقرير بنجاح',
    });
    
    return true;
  } catch (error) {
    console.error('Error exporting cohort report:', error);
    toast.error('فشل تصدير التقرير');
    return false;
  }
};

// Template generator for bulk student import
export const downloadStudentTemplate = () => {
  const template = [
    { name: 'أحمد محمد', email: 'ahmed@example.com', cohort: 'المجموعة 1' },
    { name: 'فاطمة علي', email: 'fatima@example.com', cohort: 'المجموعة 1' },
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'قالب الطلاب');
  
  XLSX.writeFile(workbook, 'student-template.xlsx');
  
  toast.success('تم تنزيل القالب', {
    description: 'استخدم هذا القالب لإضافة الطلاب',
  });
};
