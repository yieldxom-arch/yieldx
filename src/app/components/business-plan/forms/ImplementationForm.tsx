import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { ImplementationTask, DocumentChecklist } from '@/app/types/businessPlan';
import { Plus, Trash2, Calendar, CheckSquare } from 'lucide-react';

interface ImplementationFormProps {
  tasks: ImplementationTask[];
  checklist?: DocumentChecklist;
  onTasksChange: (tasks: ImplementationTask[]) => void;
  onChecklistChange: (checklist: DocumentChecklist) => void;
}

export default function ImplementationForm({ tasks, checklist, onTasksChange, onChecklistChange }: ImplementationFormProps) {
  const addTask = () => {
    const newTask: ImplementationTask = {
      id: Date.now().toString(),
      task: '',
      duration: 0,
      status: 'لم يبدأ',
    };
    onTasksChange([...tasks, newTask]);
  };

  const documents = [
    { key: 'commercialRegistration', label: 'السجل التجاري' },
    { key: 'taxCertificate', label: 'الشهادة الضريبية' },
    { key: 'municipalityLicense', label: 'ترخيص البلدية' },
    { key: 'civilDefenseLicense', label: 'شهادة الدفاع المدني' },
    { key: 'healthLicense', label: 'الترخيص الصحي' },
    { key: 'environmentalApproval', label: 'الموافقة البيئية' },
    { key: 'laborLicense', label: 'رخصة العمل' },
    { key: 'socialInsurance', label: 'التأمينات الاجتماعية' },
    { key: 'bankAccount', label: 'الحساب البنكي' },
    { key: 'leaseContract', label: 'عقد الإيجار' },
    { key: 'feasibilityStudy', label: 'دراسة الجدوى' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4ECDC4]" />
              جدول التنفيذ
            </CardTitle>
            <Button onClick={addTask} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]" size="sm">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مهمة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex gap-4 items-center p-3 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="اسم المهمة"
                    value={task.task}
                    onChange={(e) => {
                      const updated = tasks.map(t => t.id === task.id ? { ...t, task: e.target.value } : t);
                      onTasksChange(updated);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="المدة (أيام)"
                    value={task.duration}
                    onChange={(e) => {
                      const updated = tasks.map(t => t.id === task.id ? { ...t, duration: Number(e.target.value) } : t);
                      onTasksChange(updated);
                    }}
                  />
                  <select
                    value={task.status}
                    onChange={(e) => {
                      const updated = tasks.map(t => t.id === task.id ? { ...t, status: e.target.value as any } : t);
                      onTasksChange(updated);
                    }}
                    className="p-2 border rounded-md"
                  >
                    <option value="لم يبدأ">لم يبدأ</option>
                    <option value="جاري">جاري</option>
                    <option value="مكتمل">مكتمل</option>
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTasksChange(tasks.filter(t => t.id !== task.id))}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#4ECDC4]" />
            قائمة المتطلبات والوثائق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.key} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={doc.key}
                  checked={checklist?.[doc.key] || false}
                  onCheckedChange={(checked) => {
                    onChecklistChange({
                      ...checklist,
                      [doc.key]: checked === true,
                    } as DocumentChecklist);
                  }}
                />
                <Label htmlFor={doc.key} className="cursor-pointer">
                  {doc.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}