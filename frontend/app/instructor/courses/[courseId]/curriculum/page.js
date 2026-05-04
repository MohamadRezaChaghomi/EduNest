// app/instructor/courses/[courseId]/curriculum/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import SectionManager from '@/components/instructor/SectionManager';
import { Skeleton } from '@/components/ui/skeleton';

export default function CurriculumPage({ params }) {
  const { courseId } = params;
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isMounted = useRef(true);

  // Fetch data: defined inside useEffect
  useEffect(() => {
    isMounted.current = true;
    const fetchData = async () => {
      try {
        const [courseData, sectionsData] = await Promise.all([
          api.courses.getById(courseId),
          api.sections.getByCourse(courseId),
        ]);
        if (isMounted.current) {
          setCourse(courseData);
          setSections(sectionsData.data || sectionsData);
        }
      } catch (err) {
        if (isMounted.current) toast.error('خطا در بارگذاری اطلاعات');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted.current = false; };
  }, [courseId]);

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error('عنوان بخش را وارد کنید');
      return;
    }
    setSubmitting(true);
    try {
      const newSection = await api.sections.create(courseId, { title: newSectionTitle });
      if (isMounted.current) {
        setSections(prev => [...prev, newSection]);
        setNewSectionTitle('');
        setAddingSection(false);
        toast.success('بخش جدید اضافه شد');
      }
    } catch (err) {
      if (isMounted.current) toast.error(err.message || 'خطا در ایجاد بخش');
    } finally {
      if (isMounted.current) setSubmitting(false);
    }
  };

  const handleDeleteSection = (sectionId) => {
    setSections(prev => prev.filter(s => s._id !== sectionId));
  };

  const handleUpdateSection = (updatedSection) => {
    setSections(prev => prev.map(s => s._id === updatedSection._id ? updatedSection : s));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">مدیریت سرفصل‌ها</h1>
        <p className="text-muted-foreground">دوره: {course?.title}</p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <SectionManager
            key={section._id}
            section={section}
            courseId={courseId}
            onDelete={handleDeleteSection}
            onUpdate={handleUpdateSection}
          />
        ))}

        {/* Add new section form */}
        {addingSection ? (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">بخش جدید</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="عنوان بخش (مثال: مقدمه)"
                  disabled={submitting}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddSection} disabled={submitting}>
                    <Save className="w-4 h-4 ml-1" /> ذخیره
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingSection(false);
                      setNewSectionTitle('');
                    }}
                    disabled={submitting}
                  >
                    <X className="w-4 h-4 ml-1" /> لغو
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button variant="outline" onClick={() => setAddingSection(true)} className="gap-2">
            <Plus className="w-4 h-4" /> افزودن بخش جدید
          </Button>
        )}
      </div>
    </div>
  );
}