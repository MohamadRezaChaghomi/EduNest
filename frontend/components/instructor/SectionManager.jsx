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
  const [lessons, setLessons] = useState(section.lessons || []); // manage lessons locally

  // Update section title
  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error('عنوان بخش الزامی است');
      return;
    }
    try {
      const updated = await api.sections.update(section._id, { title });
      setIsEditing(false);
      onUpdate?.(updated);
      toast.success('بخش با موفقیت ویرایش شد');
    } catch (err) {
      toast.error(err.message || 'خطا در ویرایش بخش');
    }
  };

  // Delete section (with confirmation)
  const handleDelete = async () => {
    if (confirm('آیا از حذف این بخش و تمام درس‌های آن مطمئن هستید؟')) {
      try {
        await api.sections.delete(section._id);
        onDelete?.(section._id);
        toast.success('بخش حذف شد');
      } catch (err) {
        toast.error(err.message || 'خطا در حذف بخش');
      }
    }
  };

  // Callback after a lesson is updated
  const handleLessonUpdate = (updatedLesson) => {
    setLessons((prev) =>
      prev.map((lesson) => (lesson._id === updatedLesson._id ? updatedLesson : lesson))
    );
  };

  // Callback after a lesson is deleted
  const handleLessonDelete = (lessonId) => {
    setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
  };

  // Callback after a new lesson is created
  const handleLessonCreated = (newLesson) => {
    setLessons((prev) => [...prev, newLesson]);
    setShowLessonForm(false);
  };

  return (
    <Card className="mb-4 border-border" dir="rtl">
      <CardHeader className="py-3 px-4 flex flex-row justify-between items-center bg-muted/10 rounded-t-lg">
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="max-w-sm"
            />
            <Button size="sm" onClick={handleUpdate}>
              <Save className="w-4 h-4 ml-1" /> ذخیره
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setTitle(section.title);
              }}
            >
              <X className="w-4 h-4 ml-1" /> لغو
            </Button>
          </div>
        ) : (
          <CardTitle className="text-lg flex items-center gap-2">
            {section.title}
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {/* Lessons list */}
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <LessonManager
              key={lesson._id}
              lesson={lesson}
              sectionId={section._id}
              courseId={courseId}
              onUpdate={handleLessonUpdate}
              onDelete={handleLessonDelete}
            />
          ))}
        </div>

        {/* Add lesson form */}
        {showLessonForm ? (
          <LessonForm
            sectionId={section._id}
            courseId={courseId}
            onSuccess={handleLessonCreated}
            onCancel={() => setShowLessonForm(false)}
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setShowLessonForm(true)}
          >
            <Plus className="w-4 h-4 ml-1" /> افزودن درس جدید
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Internal component: LessonForm (for creating new lesson)
function LessonForm({ sectionId, courseId, onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('عنوان درس الزامی است');
      return;
    }
    setLoading(true);
    try {
      const newLesson = await api.lessons.create(sectionId, { title, description, isFree });
      toast.success('درس با موفقیت ایجاد شد');
      onSuccess(newLesson);
    } catch (err) {
      toast.error(err.message || 'خطا در ایجاد درس');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 border rounded-md bg-muted/20 border-border">
      <Input
        placeholder="عنوان درس"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2"
        disabled={loading}
      />
      <Input
        placeholder="توضیحات (اختیاری)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-2"
        disabled={loading}
      />
      <label className="flex items-center gap-2 text-sm mb-3">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
          disabled={loading}
        />
        <span>درس رایگان (پیش‌نمایش برای کاربران بدون خرید)</span>
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm">
          {loading ? 'در حال ایجاد...' : 'ذخیره'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          انصراف
        </Button>
      </div>
    </form>
  );
}