import { toast } from 'sonner';

export const exportData = () => {
  try {
    const data = {
      levels: localStorage.getItem('yieldx_levels'),
      students: localStorage.getItem('yieldx_students'),
      cohorts: localStorage.getItem('yieldx_cohorts'),
      submissions: localStorage.getItem('yieldx_submissions'),
      workspaces: localStorage.getItem('yieldx_workspaces'),
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yieldx-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('تم تصدير البيانات بنجاح', {
      description: 'تم حفظ نسخة احتياطية من جميع البيانات',
    });

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('فشل تصدير البيانات', {
      description: 'حدث خطأ أثناء حفظ النسخة الاحتياطية',
    });
    return false;
  }
};

export const importData = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate data structure
        if (!data.timestamp || !data.version) {
          throw new Error('Invalid backup file format');
        }

        // Restore data
        if (data.levels) localStorage.setItem('yieldx_levels', data.levels);
        if (data.students) localStorage.setItem('yieldx_students', data.students);
        if (data.cohorts) localStorage.setItem('yieldx_cohorts', data.cohorts);
        if (data.submissions) localStorage.setItem('yieldx_submissions', data.submissions);
        if (data.workspaces) localStorage.setItem('yieldx_workspaces', data.workspaces);

        toast.success('تم استيراد البيانات بنجاح', {
          description: 'سيتم إعادة تحميل الصفحة لتطبيق التغييرات',
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);

        resolve(true);
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('فشل استيراد البيانات', {
          description: 'تأكد من أن الملف صحيح وحاول مرة أخرى',
        });
        resolve(false);
      }
    };

    reader.onerror = () => {
      toast.error('فشل قراءة الملف', {
        description: 'حدث خطأ أثناء قراءة ملف النسخة الاحتياطية',
      });
      resolve(false);
    };

    reader.readAsText(file);
  });
};

export const clearAllData = () => {
  try {
    const keys = [
      'yieldx_levels',
      'yieldx_students',
      'yieldx_cohorts',
      'yieldx_submissions',
      'yieldx_workspaces',
    ];

    keys.forEach((key) => localStorage.removeItem(key));

    toast.success('تم مسح جميع البيانات', {
      description: 'سيتم إعادة تحميل الصفحة',
    });

    setTimeout(() => {
      window.location.reload();
    }, 1500);

    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    toast.error('فشل مسح البيانات');
    return false;
  }
};
