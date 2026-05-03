'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import LessonManager from './LessonManager';

export default function SectionManager({ section, courseId, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [showLessonForm, setShowLessonForm] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) return toast.error('عنوان بخش الزامی است');
    try {
      const updated = await api.sections.update(section._id, { title });
      setIsEditing(false);
      onUpdate?.(updated);
      toast.success('بخش ویرایش شد');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (confirm('آیا از حذف این بخش و تمام درس‌های آن مطمئن هستید؟')) {
      try {
        await api.sections.delete(section._id);
        onDelete(section._id);
        toast.success('بخش حذف شد');
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="py-3 px-4 flex flex-row justify-between items-center">
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            <Button size="sm" onClick={handleUpdate}><Save className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setTitle(section.title); }}><X className="w-4 h-4" /></Button>
          </div>
        ) : (
          <CardTitle className="text-lg flex items-center gap-2">
            {section.title}
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={handleDelete}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {/* لیست درس‌ها */}
        <div className="space-y-2">
          {section.lessons?.map((lesson) => (
            <LessonManager key={lesson._id} lesson={lesson} sectionId={section._id} courseId={courseId} />
          ))}
        </div>

        {/* فرم افزودن درس جدید */}
        {showLessonForm ? (
          <LessonForm
            sectionId={section._id}
            courseId={courseId}
            onSuccess={() => setShowLessonForm(false)}
            onCancel={() => setShowLessonForm(false)}
          />
        ) : (
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowLessonForm(true)}>
            <Plus className="w-4 h-4 ml-1" /> افزودن درس جدید
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// کامپوننت داخلی برای فرم درس
function LessonForm({ sectionId, courseId, onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('عنوان درس الزامی است');
    setLoading(true);
    try {
      await api.lessons.create(sectionId, { title, description, isFree });
      toast.success('درس ایجاد شد');
      onSuccess();
      // برای رفرش صفحه، نیاز به بارگذاری مجدد داده‌ها داریم (که در والد مدیریت می‌شود)
      window.location.reload(); // ساده‌ترین راه – در غیر این صورت state را از والد به‌روز کنید
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-3 border rounded-md bg-gray-50">
      <Input placeholder="عنوان درس" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2" />
      <Input placeholder="توضیحات (اختیاری)" value={description} onChange={(e) => setDescription(e.target.value)} className="mb-2" />
      <label className="flex items-center gap-2 text-sm mb-2">
        <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
        درس رایگان (پیش‌نمایش)
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm">ذخیره</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>انصراف</Button>
      </div>
    </form>
  );
}