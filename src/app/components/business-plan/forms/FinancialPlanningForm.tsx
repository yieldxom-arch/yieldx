import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { DollarSign, TrendingUp, FileText, Briefcase, Plus, Trash2, Package, Users } from 'lucide-react';
import { BusinessPlan, RawMaterial, Employee, Equipment, RentDetail, OperatingExpense, PreOperatingExpense, WorkingCapital, CashFlowProjection, CapacityUtilization } from '@/app/types/businessPlan';

interface FinancialPlanningFormProps {
  businessPlan: Partial<BusinessPlan>;
  onChange: (data: Partial<BusinessPlan>) => void;
}

export default function FinancialPlanningForm({ businessPlan, onChange }: FinancialPlanningFormProps) {
  // Raw Materials Functions
  const addRawMaterial = () => {
    const newMaterial: RawMaterial = {
      id: Date.now().toString(),
      name: '',
      unit: 'كجم',
      unitPrice: 0,
      monthlyQuantity: 0,
      monthlyTotal: 0,
      annualTotal: 0,
    };
    onChange({
      ...businessPlan,
      rawMaterials: [...(businessPlan.rawMaterials || []), newMaterial],
    });
  };

  const updateRawMaterial = (id: string, field: keyof RawMaterial, value: any) => {
    const updated = (businessPlan.rawMaterials || []).map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Auto-calculate totals
        updatedItem.monthlyTotal = updatedItem.unitPrice * updatedItem.monthlyQuantity;
        updatedItem.annualTotal = updatedItem.monthlyTotal * 12;
        return updatedItem;
      }
      return item;
    });
    onChange({ ...businessPlan, rawMaterials: updated });
  };

  const removeRawMaterial = (id: string) => {
    onChange({
      ...businessPlan,
      rawMaterials: (businessPlan.rawMaterials || []).filter((item) => item.id !== id),
    });
  };

  // Employees Functions
  const addEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      position: '',
      count: 1,
      monthlySalary: 0,
      monthlyTotal: 0,
      annualTotal: 0,
    };
    onChange({
      ...businessPlan,
      employees: [...(businessPlan.employees || []), newEmployee],
    });
  };

  const updateEmployee = (id: string, field: keyof Employee, value: any) => {
    const updated = (businessPlan.employees || []).map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.monthlyTotal = updatedItem.monthlySalary * updatedItem.count;
        updatedItem.annualTotal = updatedItem.monthlyTotal * 12;
        return updatedItem;
      }
      return item;
    });
    onChange({ ...businessPlan, employees: updated });
  };

  const removeEmployee = (id: string) => {
    onChange({
      ...businessPlan,
      employees: (businessPlan.employees || []).filter((item) => item.id !== id),
    });
  };

  // Equipment Functions
  const addEquipment = () => {
    const newEquipment: Equipment = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      category: 'معدات',
    };
    onChange({
      ...businessPlan,
      equipment: [...(businessPlan.equipment || []), newEquipment],
    });
  };

  const updateEquipment = (id: string, field: keyof Equipment, value: any) => {
    const updated = (businessPlan.equipment || []).map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.totalCost = updatedItem.unitCost * updatedItem.quantity;
        return updatedItem;
      }
      return item;
    });
    onChange({ ...businessPlan, equipment: updated });
  };

  const removeEquipment = (id: string) => {
    onChange({
      ...businessPlan,
      equipment: (businessPlan.equipment || []).filter((item) => item.id !== id),
    });
  };

  // Rent Functions
  const addRent = () => {
    const newRent: RentDetail = {
      id: Date.now().toString(),
      type: 'مبنى',
      description: '',
      monthlyRent: 0,
      annualRent: 0,
    };
    onChange({
      ...businessPlan,
      rentDetails: [...(businessPlan.rentDetails || []), newRent],
    });
  };

  const updateRent = (id: string, field: keyof RentDetail, value: any) => {
    const updated = (businessPlan.rentDetails || []).map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.annualRent = updatedItem.monthlyRent * 12;
        return updatedItem;
      }
      return item;
    });
    onChange({ ...businessPlan, rentDetails: updated });
  };

  const removeRent = (id: string) => {
    onChange({
      ...businessPlan,
      rentDetails: (businessPlan.rentDetails || []).filter((item) => item.id !== id),
    });
  };

  // Operating Expenses Functions
  const addOperatingExpense = () => {
    const newExpense: OperatingExpense = {
      id: Date.now().toString(),
      category: '',
      description: '',
      monthlyAmount: 0,
      annualAmount: 0,
    };
    onChange({
      ...businessPlan,
      operatingExpenses: [...(businessPlan.operatingExpenses || []), newExpense],
    });
  };

  const updateOperatingExpense = (id: string, field: keyof OperatingExpense, value: any) => {
    const updated = (businessPlan.operatingExpenses || []).map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.annualAmount = updatedItem.monthlyAmount * 12;
        return updatedItem;
      }
      return item;
    });
    onChange({ ...businessPlan, operatingExpenses: updated });
  };

  const removeOperatingExpense = (id: string) => {
    onChange({
      ...businessPlan,
      operatingExpenses: (businessPlan.operatingExpenses || []).filter((item) => item.id !== id),
    });
  };

  // Pre-Operating Expenses Functions
  const addPreOperatingExpense = () => {
    const newExpense: PreOperatingExpense = {
      id: Date.now().toString(),
      item: '',
      amount: 0,
    };
    onChange({
      ...businessPlan,
      preOperatingExpenses: [...(businessPlan.preOperatingExpenses || []), newExpense],
    });
  };

  const updatePreOperatingExpense = (id: string, field: keyof PreOperatingExpense, value: any) => {
    const updated = (businessPlan.preOperatingExpenses || []).map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...businessPlan, preOperatingExpenses: updated });
  };

  const removePreOperatingExpense = (id: string) => {
    onChange({
      ...businessPlan,
      preOperatingExpenses: (businessPlan.preOperatingExpenses || []).filter((item) => item.id !== id),
    });
  };

  // Cash Flow Functions
  const initializeCashFlow = () => {
    if (!businessPlan.cashFlowProjections || businessPlan.cashFlowProjections.length === 0) {
      const initialProjections: CashFlowProjection[] = Array.from({ length: 11 }, (_, i) => ({
        year: i,
        operatingActivities: {
          netIncome: 0,
          depreciation: 0,
          interest: 0,
          workingCapitalChanges: 0,
        },
        investingActivities: {
          furniture: 0,
          equipment: 0,
          vehicles: 0,
          civilWork: 0,
          preOpeningExpenses: 0,
          workingCapital: 0,
        },
        financingActivities: {
          equity: 0,
          debt: 0,
          principalRepayment: 0,
        },
        netCashFlow: 0,
      }));
      onChange({ ...businessPlan, cashFlowProjections: initialProjections });
    }
  };

  // Capacity Utilization Functions
  const initializeCapacity = () => {
    if (!businessPlan.capacityUtilization || businessPlan.capacityUtilization.length === 0) {
      const initialCapacity: CapacityUtilization[] = Array.from({ length: 10 }, (_, i) => ({
        year: i + 1,
        utilizationPercentage: 70 + (i * 3),
        targetSales: 0,
        actualSales: 0,
        purchases: 0,
      }));
      onChange({ ...businessPlan, capacityUtilization: initialCapacity });
    }
  };

  // Calculate totals
  const rawMaterialsTotal = (businessPlan.rawMaterials || []).reduce((sum, item) => sum + item.annualTotal, 0);
  const salariesTotal = (businessPlan.employees || []).reduce((sum, item) => sum + item.annualTotal, 0);
  const equipmentTotal = (businessPlan.equipment || []).reduce((sum, item) => sum + item.totalCost, 0);
  const rentTotal = (businessPlan.rentDetails || []).reduce((sum, item) => sum + item.annualRent, 0);
  const operatingExpensesTotal = (businessPlan.operatingExpenses || []).reduce((sum, item) => sum + item.annualAmount, 0);
  const preOperatingTotal = (businessPlan.preOperatingExpenses || []).reduce((sum, item) => sum + item.amount, 0);

  return (
    <Tabs defaultValue="rawmaterials" dir="rtl" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
        <TabsTrigger value="rawmaterials">المواد الخام</TabsTrigger>
        <TabsTrigger value="salaries">الرواتب</TabsTrigger>
        <TabsTrigger value="equipment">المعدات</TabsTrigger>
        <TabsTrigger value="rent">الإيجارات</TabsTrigger>
        <TabsTrigger value="operating">المصروفات</TabsTrigger>
        <TabsTrigger value="preopening">تأسيسية</TabsTrigger>
        <TabsTrigger value="capital">رأس المال</TabsTrigger>
        <TabsTrigger value="cashflow">التدفق النقدي</TabsTrigger>
      </TabsList>

      {/* Raw Materials Tab */}
      <TabsContent value="rawmaterials" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#4ECDC4]" />
                المواد الخام والمستلزمات
              </CardTitle>
              <Button onClick={addRawMaterial} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]" size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مادة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2 text-right">المادة</th>
                    <th className="border p-2 text-right">الوحدة</th>
                    <th className="border p-2 text-right">سعر الوحدة</th>
                    <th className="border p-2 text-right">الكمية الشهرية</th>
                    <th className="border p-2 text-right">الإجمالي الشهري</th>
                    <th className="border p-2 text-right">الإجمالي السنوي</th>
                    <th className="border p-2 text-right">المورد</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(businessPlan.rawMaterials || []).map((item) => (
                    <tr key={item.id}>
                      <td className="border p-1">
                        <Input
                          value={item.name}
                          onChange={(e) => updateRawMaterial(item.id, 'name', e.target.value)}
                          placeholder="اسم المادة"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          value={item.unit}
                          onChange={(e) => updateRawMaterial(item.id, 'unit', e.target.value)}
                          placeholder="كجم"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateRawMaterial(item.id, 'unitPrice', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.monthlyQuantity}
                          onChange={(e) => updateRawMaterial(item.id, 'monthlyQuantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1 bg-gray-50 dark:bg-gray-900">
                        <Input value={item.monthlyTotal.toFixed(2)} readOnly className="text-center font-medium" />
                      </td>
                      <td className="border p-1 bg-gray-50 dark:bg-gray-900">
                        <Input value={item.annualTotal.toFixed(2)} readOnly className="text-center font-medium" />
                      </td>
                      <td className="border p-1">
                        <Input
                          value={item.supplier || ''}
                          onChange={(e) => updateRawMaterial(item.id, 'supplier', e.target.value)}
                          placeholder="اسم المورد"
                        />
                      </td>
                      <td className="border p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRawMaterial(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1B1B3A] text-white font-bold">
                    <td colSpan={5} className="border p-2 text-right">الإجمالي السنوي</td>
                    <td className="border p-2 text-center">{rawMaterialsTotal.toLocaleString()} ريال</td>
                    <td colSpan={2} className="border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Salaries Tab */}
      <TabsContent value="salaries" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4ECDC4]" />
                الرواتب والأجور
              </CardTitle>
              <Button onClick={addEmployee} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]" size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة موظف
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2 text-right">الوظيفة</th>
                    <th className="border p-2 text-right">العدد</th>
                    <th className="border p-2 text-right">الراتب الشهري</th>
                    <th className="border p-2 text-right">الإجمالي الشهري</th>
                    <th className="border p-2 text-right">الإجمالي السنوي</th>
                    <th className="border p-2 text-right">المزايا</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(businessPlan.employees || []).map((item) => (
                    <tr key={item.id}>
                      <td className="border p-1">
                        <Input
                          value={item.position}
                          onChange={(e) => updateEmployee(item.id, 'position', e.target.value)}
                          placeholder="المسمى الوظيفي"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.count}
                          onChange={(e) => updateEmployee(item.id, 'count', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.monthlySalary}
                          onChange={(e) => updateEmployee(item.id, 'monthlySalary', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1 bg-gray-50 dark:bg-gray-900">
                        <Input value={item.monthlyTotal.toFixed(2)} readOnly className="text-center font-medium" />
                      </td>
                      <td className="border p-1 bg-gray-50 dark:bg-gray-900">
                        <Input value={item.annualTotal.toFixed(2)} readOnly className="text-center font-medium" />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.benefits || 0}
                          onChange={(e) => updateEmployee(item.id, 'benefits', Number(e.target.value))}
                          placeholder="المزايا"
                        />
                      </td>
                      <td className="border p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmployee(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1B1B3A] text-white font-bold">
                    <td colSpan={4} className="border p-2 text-right">الإجمالي السنوي</td>
                    <td className="border p-2 text-center">{salariesTotal.toLocaleString()} ريال</td>
                    <td colSpan={2} className="border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Equipment Tab */}
      <TabsContent value="equipment" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#4ECDC4]" />
                المعدات والأثاث
              </CardTitle>
              <Button onClick={addEquipment} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]" size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة معدة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2 text-right">الصنف</th>
                    <th className="border p-2 text-right">الفئة</th>
                    <th className="border p-2 text-right">الكمية</th>
                    <th className="border p-2 text-right">تكلفة الوحدة</th>
                    <th className="border p-2 text-right">التكلفة الإجمالية</th>
                    <th className="border p-2 text-right">المورد</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(businessPlan.equipment || []).map((item) => (
                    <tr key={item.id}>
                      <td className="border p-1">
                        <Input
                          value={item.name}
                          onChange={(e) => updateEquipment(item.id, 'name', e.target.value)}
                          placeholder="اسم المعدة"
                        />
                      </td>
                      <td className="border p-1">
                        <select
                          value={item.category}
                          onChange={(e) => updateEquipment(item.id, 'category', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="أثاث">أثاث</option>
                          <option value="معدات">معدات</option>
                          <option value="مركبات">مركبات</option>
                          <option value="أجهزة">أجهزة</option>
                        </select>
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateEquipment(item.id, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateEquipment(item.id, 'unitCost', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1 bg-gray-50 dark:bg-gray-900">
                        <Input value={item.totalCost.toFixed(2)} readOnly className="text-center font-medium" />
                      </td>
                      <td className="border p-1">
                        <Input
                          value={item.supplier || ''}
                          onChange={(e) => updateEquipment(item.id, 'supplier', e.target.value)}
                          placeholder="المورد"
                        />
                      </td>
                      <td className="border p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEquipment(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1B1B3A] text-white font-bold">
                    <td colSpan={4} className="border p-2 text-right">الإجمالي</td>
                    <td className="border p-2 text-center">{equipmentTotal.toLocaleString()} ريال</td>
                    <td colSpan={2} className="border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Rent Tab */}
      <TabsContent value="rent" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>الإيجارات</CardTitle>
              <Button onClick={addRent} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]" size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة إيجار
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2 text-right">النوع</th>
                    <th className="border p-2 text-right">الوصف</th>
                    <th className="border p-2 text-right">الإيجار الشهري</th>
                    <th className="border p-2 text-right">الإيجار السنوي</th>
                    <th className="border p-2 text-right">مدة العقد</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(businessPlan.rentDetails || []).map((item) => (
                    <tr key={item.id}>
                      <td className="border p-1">
                        <select
                          value={item.type}
                          onChange={(e) => updateRent(item.id, 'type', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="مبنى">مبنى</option>
                          <option value="معدات">معدات</option>
                          <option value="آلات">آلات</option>
                        </select>
                      </td>
                      <td className="border p-1">
                        <Input
                          value={item.description}
                          onChange={(e) => updateRent(item.id, 'description', e.target.value)}
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.monthlyRent}
                          onChange={(e) => updateRent(item.id, 'monthlyRent', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1 bg-gray-50 dark:bg-gray-900">
                        <Input value={item.annualRent.toFixed(2)} readOnly className="text-center font-medium" />
                      </td>
                      <td className="border p-1">
                        <Input
                          value={item.contractPeriod || ''}
                          onChange={(e) => updateRent(item.id, 'contractPeriod', e.target.value)}
                          placeholder="سنة واحدة"
                        />
                      </td>
                      <td className="border p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRent(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1B1B3A] text-white font-bold">
                    <td colSpan={3} className="border p-2 text-right">الإجمالي السنوي</td>
                    <td className="border p-2 text-center">{rentTotal.toLocaleString()} ريال</td>
                    <td colSpan={2} className="border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Operating Expenses Tab */}
      <TabsContent value="operating" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>المصروفات التشغيلية</CardTitle>
              <Button onClick={addOperatingExpense} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]" size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مصروف
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2 text-right">الفئة</th>
                    <th className="border p-2 text-right">الوصف</th>
                    <th className="border p-2 text-right">المبلغ الشهري</th>
                    <th className="border p-2 text-right">المبلغ السنوي</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(businessPlan.operatingExpenses || []).map((item) => (
                    <tr key={item.id}>
                      <td className="border p-1">
                        <Input
                          value={item.category}
                          onChange={(e) => updateOperatingExpense(item.id, 'category', e.target.value)}
                          placeholder="كهرباء، ماء، صيانة..."
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          value={item.description}
                          onChange={(e) => updateOperatingExpense(item.id, 'description', e.target.value)}
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.monthlyAmount}
                          onChange={(e) => updateOperatingExpense(item.id, 'monthlyAmount', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1 bg-gray-50 dark:bg-gray-900">
                        <Input value={item.annualAmount.toFixed(2)} readOnly className="text-center font-medium" />
                      </td>
                      <td className="border p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOperatingExpense(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1B1B3A] text-white font-bold">
                    <td colSpan={3} className="border p-2 text-right">الإجمالي السنوي</td>
                    <td className="border p-2 text-center">{operatingExpensesTotal.toLocaleString()} ريال</td>
                    <td className="border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Pre-Operating Expenses Tab */}
      <TabsContent value="preopening" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>المصروفات التأسيسية (قبل التشغيل)</CardTitle>
              <Button onClick={addPreOperatingExpense} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]" size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مصروف
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2 text-right">البند</th>
                    <th className="border p-2 text-right">المبلغ (ريال)</th>
                    <th className="border p-2 text-right">ملاحظات</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(businessPlan.preOperatingExpenses || []).map((item) => (
                    <tr key={item.id}>
                      <td className="border p-1">
                        <Input
                          value={item.item}
                          onChange={(e) => updatePreOperatingExpense(item.id, 'item', e.target.value)}
                          placeholder="تراخيص، تجهيزات، دعاية..."
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updatePreOperatingExpense(item.id, 'amount', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          value={item.notes || ''}
                          onChange={(e) => updatePreOperatingExpense(item.id, 'notes', e.target.value)}
                        />
                      </td>
                      <td className="border p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePreOperatingExpense(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1B1B3A] text-white font-bold">
                    <td className="border p-2 text-right">الإجمالي</td>
                    <td className="border p-2 text-center">{preOperatingTotal.toLocaleString()} ريال</td>
                    <td colSpan={2} className="border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Working Capital Tab */}
      <TabsContent value="capital" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#4ECDC4]" />
              رأس المال العامل (3 أشهر)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>إيجار المباني (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.buildingRent3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      buildingRent3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>إيجار المعدات (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.equipmentRent3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      equipmentRent3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>الرواتب (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.salaries3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      salaries3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>المواد الخام (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.rawMaterials3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      rawMaterials3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>المصاريف الإدارية (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.adminExpenses3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      adminExpenses3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>المرافق (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.utilities3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      utilities3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>التسويق (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.marketing3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      marketing3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>الصيانة (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.maintenance3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      maintenance3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>التأمين (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.insurance3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      insurance3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>تأمين العمال (3 أشهر)</Label>
                <Input
                  type="number"
                  value={businessPlan.workingCapital?.workerInsurance3Months || 0}
                  onChange={(e) => onChange({
                    ...businessPlan,
                    workingCapital: {
                      ...(businessPlan.workingCapital || {} as WorkingCapital),
                      workerInsurance3Months: Number(e.target.value)
                    }
                  })}
                />
              </div>
            </div>
            
            <Card className="bg-[#1B1B3A] text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg">إجمالي رأس المال العامل المطلوب:</span>
                  <span className="text-2xl font-bold text-[#4ECDC4]">
                    {Object.values(businessPlan.workingCapital || {}).reduce((sum, val) => sum + (val || 0), 0).toLocaleString()} ريال
                  </span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Capacity Utilization */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>نسبة استغلال الطاقة الإنتاجية</CardTitle>
              <Button onClick={initializeCapacity} variant="outline" size="sm">
                تهيئة الجدول (10 سنوات)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border p-2">السنة</th>
                    <th className="border p-2">نسبة الاستغلال</th>
                    <th className="border p-2">المبيعات المستهدفة</th>
                    <th className="border p-2">المبيعات الفعلية</th>
                    <th className="border p-2">المشتريات</th>
                  </tr>
                </thead>
                <tbody>
                  {(businessPlan.capacityUtilization || []).map((item, index) => (
                    <tr key={index}>
                      <td className="border p-1 text-center font-medium">السنة {item.year}</td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.utilizationPercentage}
                          onChange={(e) => {
                            const updated = [...(businessPlan.capacityUtilization || [])];
                            updated[index].utilizationPercentage = Number(e.target.value);
                            onChange({ ...businessPlan, capacityUtilization: updated });
                          }}
                          className="text-center"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.targetSales}
                          onChange={(e) => {
                            const updated = [...(businessPlan.capacityUtilization || [])];
                            updated[index].targetSales = Number(e.target.value);
                            onChange({ ...businessPlan, capacityUtilization: updated });
                          }}
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.actualSales}
                          onChange={(e) => {
                            const updated = [...(businessPlan.capacityUtilization || [])];
                            updated[index].actualSales = Number(e.target.value);
                            onChange({ ...businessPlan, capacityUtilization: updated });
                          }}
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          type="number"
                          value={item.purchases}
                          onChange={(e) => {
                            const updated = [...(businessPlan.capacityUtilization || [])];
                            updated[index].purchases = Number(e.target.value);
                            onChange({ ...businessPlan, capacityUtilization: updated });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Cash Flow Tab */}
      <TabsContent value="cashflow" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#4ECDC4]" />
                قائمة التدفقات النقدية (10 سنوات)
              </CardTitle>
              <Button onClick={initializeCashFlow} variant="outline" size="sm">
                تهيئة الجدول (10 سنوات)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1B1B3A] text-white">
                    <th className="border p-2 sticky right-0 bg-[#1B1B3A] z-10">البيان</th>
                    {Array.from({ length: 11 }, (_, i) => (
                      <th key={i} className="border p-2 whitespace-nowrap">السنة {i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Operating Activities */}
                  <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                    <td colSpan={12} className="border p-2">الأنشطة التشغيلية</td>
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">صافي الدخل</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.operatingActivities.netIncome}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].operatingActivities.netIncome = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">الاستهلاك</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.operatingActivities.depreciation}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].operatingActivities.depreciation = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">الفوائد</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.operatingActivities.interest}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].operatingActivities.interest = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  
                  {/* Investing Activities */}
                  <tr className="bg-green-50 dark:bg-green-900/20 font-bold">
                    <td colSpan={12} className="border p-2">الأنشطة الاستثمارية</td>
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">الأثاث</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.investingActivities.furniture}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].investingActivities.furniture = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">المعدات</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.investingActivities.equipment}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].investingActivities.equipment = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">المركبات</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.investingActivities.vehicles}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].investingActivities.vehicles = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">الأعمال المدنية</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.investingActivities.civilWork}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].investingActivities.civilWork = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  
                  {/* Financing Activities */}
                  <tr className="bg-purple-50 dark:bg-purple-900/20 font-bold">
                    <td colSpan={12} className="border p-2">الأنشطة التمويلية</td>
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">رأس المال</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.financingActivities.equity}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].financingActivities.equity = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">القروض</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.financingActivities.debt}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].financingActivities.debt = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border p-1 sticky right-0 bg-white dark:bg-gray-950 z-10">سداد القروض</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => (
                      <td key={i} className="border p-1">
                        <Input
                          type="number"
                          value={cf.financingActivities.principalRepayment}
                          onChange={(e) => {
                            const updated = [...(businessPlan.cashFlowProjections || [])];
                            updated[i].financingActivities.principalRepayment = Number(e.target.value);
                            onChange({ ...businessPlan, cashFlowProjections: updated });
                          }}
                          className="w-20 text-xs p-1"
                        />
                      </td>
                    ))}
                  </tr>
                  
                  {/* Net Cash Flow */}
                  <tr className="bg-[#1B1B3A] text-white font-bold">
                    <td className="border p-2 sticky right-0 bg-[#1B1B3A] z-10">صافي التدفق النقدي</td>
                    {(businessPlan.cashFlowProjections || []).map((cf, i) => {
                      const netFlow = 
                        cf.operatingActivities.netIncome + 
                        cf.operatingActivities.depreciation -
                        cf.operatingActivities.interest -
                        cf.investingActivities.furniture -
                        cf.investingActivities.equipment -
                        cf.investingActivities.vehicles -
                        cf.investingActivities.civilWork +
                        cf.financingActivities.equity +
                        cf.financingActivities.debt -
                        cf.financingActivities.principalRepayment;
                      return (
                        <td key={i} className="border p-2 text-center text-[#4ECDC4]">
                          {netFlow.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
