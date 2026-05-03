// صفحه مدیریت سرفصل‌ها – شامل لیست بخش‌ها و درس‌ها با امکان افزودن/ویرایش/حذف
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import SectionManager from '@/components/instructor/SectionManager';
import LessonManager from '@/components/instructor/LessonManager';

export default function CurriculumPage({ params }) {
  const { courseId } = params;
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await api.courses.getById(courseId); // نیاز به این تابع در api
        setCourse(courseData);
        // دریافت بخش‌ها و درس‌ها
        const sectionsData = await api.sections.getByCourse(courseId);
        setSections(sectionsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const addSection = async (title) => {
    const newSection = await api.sections.create(courseId, { title });
    setSections([...sections, newSection]);
  };

  const deleteSection = async (sectionId) => {
    await api.sections.delete(sectionId);
    setSections(sections.filter(s => s._id !== sectionId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">مدیریت سرفصل‌ها: {course?.title}</h1>
      <div className="space-y-4">
        {sections.map(section => (
          <SectionManager key={section._id} section={section} onDelete={deleteSection} />
        ))}
        <Button onClick={() => addSection('بخش جدید')}>+ افزودن بخش جدید</Button>
      </div>
    </div>
  );
}