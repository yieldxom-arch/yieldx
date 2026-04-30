import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Competitor, MarketTrend } from '@/app/types/businessPlan';
import { Plus, Trash2, Users, TrendingUp } from 'lucide-react';

interface CompetitorsFormProps {
  competitors: Competitor[];
  trends: MarketTrend[];
  onCompetitorsChange: (data: Competitor[]) => void;
  onTrendsChange: (data: MarketTrend[]) => void;
}

export default function CompetitorsForm({ 
  competitors, 
  trends, 
  onCompetitorsChange, 
  onTrendsChange 
}: CompetitorsFormProps) {
  const addCompetitor = () => {
    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: '',
      location: '',
      products: '',
      prices: '',
      strengths: '',
      weaknesses: '',
      marketShare: '',
    };
    onCompetitorsChange([...competitors, newCompetitor]);
  };

  const removeCompetitor = (id: string) => {
    onCompetitorsChange(competitors.filter((c) => c.id !== id));
  };

  const updateCompetitor = (id: string, field: keyof Competitor, value: string) => {
    onCompetitorsChange(
      competitors.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const addTrend = () => {
    const newTrend: MarketTrend = {
      id: Date.now().toString(),
      factor: '',
      impact: 'إيجابي',
      description: '',
      opportunities: '',
    };
    onTrendsChange([...trends, newTrend]);
  };

  const removeTrend = (id: string) => {
    onTrendsChange(trends.filter((t) => t.id !== id));
  };

  const updateTrend = (id: string, field: keyof MarketTrend, value: any) => {
    onTrendsChange(
      trends.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  return (
    <Tabs defaultValue="competitors" dir="rtl">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="competitors">
          <Users className="w-4 h-4 ml-2" />
          تحليل المنافسين
        </TabsTrigger>
        <TabsTrigger value="trends">
          <TrendingUp className="w-4 h-4 ml-2" />
          اتجاهات السوق
        </TabsTrigger>
      </TabsList>

      <TabsContent value="competitors" className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">حدد المنافسين الرئيسيين في السوق</p>
          <Button onClick={addCompetitor} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]">
            <Plus className="w-4 h-4 ml-2" />
            إضافة منافس
          </Button>
        </div>

        {competitors.map((competitor, index) => (
          <Card key={competitor.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">منافس {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCompetitor(competitor.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المنافس *</Label>
                  <Input
                    value={competitor.name}
                    onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                    placeholder="اسم الشركة المنافسة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الموقع *</Label>
                  <Input
                    value={competitor.location}
                    onChange={(e) => updateCompetitor(competitor.id, 'location', e.target.value)}
                    placeholder="المدينة أو المنطقة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المنتجات/الخدمات</Label>
                  <Input
                    value={competitor.products}
                    onChange={(e) => updateCompetitor(competitor.id, 'products', e.target.value)}
                    placeholder="ما يقدمه المنافس"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الأسعار</Label>
                  <Input
                    value={competitor.prices}
                    onChange={(e) => updateCompetitor(competitor.id, 'prices', e.target.value)}
                    placeholder="نطاق الأسعار"
                  />
                </div>
                <div className="space-y-2">
                  <Label>نقاط القوة</Label>
                  <Textarea
                    value={competitor.strengths}
                    onChange={(e) => updateCompetitor(competitor.id, 'strengths', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>نقاط الضعف</Label>
                  <Textarea
                    value={competitor.weaknesses}
                    onChange={(e) => updateCompetitor(competitor.id, 'weaknesses', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="trends" className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">حدد العوامل والاتجاهات المؤثرة على السوق</p>
          <Button onClick={addTrend} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]">
            <Plus className="w-4 h-4 ml-2" />
            إضافة عامل
          </Button>
        </div>

        {trends.map((trend, index) => (
          <Card key={trend.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>العامل/الاتجاه *</Label>
                      <Input
                        value={trend.factor}
                        onChange={(e) => updateTrend(trend.id, 'factor', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>التأثير</Label>
                      <select
                        value={trend.impact}
                        onChange={(e) => updateTrend(trend.id, 'impact', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="إيجابي">إيجابي</option>
                        <option value="سلبي">سلبي</option>
                        <option value="محايد">محايد</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Input
                        value={trend.description}
                        onChange={(e) => updateTrend(trend.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الفرص المتاحة</Label>
                    <Textarea
                      value={trend.opportunities}
                      onChange={(e) => updateTrend(trend.id, 'opportunities', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTrend(trend.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}